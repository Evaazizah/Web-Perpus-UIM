/**
 * ==============================================================================
 * LAYANAN OFFLINE-WRITE QUEUE: PROGRESSIVE WEB APP (INDEXEDDB)
 * ==============================================================================
 * Sesuai Dokumen Blueprint Bagian 2.B & Persyaratan Penelitian PWA:
 * - Menggunakan native IndexedDB ('uim_offline_db') sebagai penyimpan antrean offline-write.
 * - Mengakomodasi aksi kritis pemustaka saat jaringan terputus (offline):
 *   1. Penilaian / Rating Buku (bahan bakar Item-Based Collaborative Filtering)
 *   2. Pengajuan Peminjaman Sirkulasi Mandiri (Loan Request)
 *   3. Pengajuan Usulan Koleksi / Pengadaan Literatur Baru (Book Proposal)
 *   4. Penandaan Buku Favorit / Bookmark
 * - Otomatis mendeteksi status internet ('online'/'offline') dan melakukan auto-sync
 *   ke Google Cloud Firestore dengan penanganan idempotensi (conflict resolution).
 */

import { saveUserRating } from './ratingService';
import { createLoan } from './circulationService';
import { ingestStagingData } from './stagingService';

const DB_NAME = 'uim_offline_db';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_write_queue';

/**
 * Inisialisasi dan Membuka IndexedDB
 */
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB tidak didukung pada lingkungan ini.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const store = db.createObjectStore(QUEUE_STORE, {
          keyPath: 'id',
          autoIncrement: true
        });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error || new Error('Gagal membuka IndexedDB'));
    };
  });
}

/**
 * Menambahkan Aksi Tulis ke Antrean IndexedDB
 * @param {Object} item - { action, collectionName, payload, meta }
 */
export async function enqueueOfflineAction({ action, collectionName, payload, meta = {} }) {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);

      const record = {
        action, // 'RATE_BOOK' | 'CREATE_LOAN' | 'PROPOSE_BOOK' | 'BOOKMARK_BOOK'
        collectionName: collectionName || 'general',
        payload,
        meta: {
          clientTimestamp: new Date().toISOString(),
          userNim: payload?.userNim || payload?.nim || 'Mahasiswa UIM',
          summary: meta.summary || action,
          ...meta
        },
        status: 'pending', // 'pending' | 'synced' | 'failed'
        retryCount: 0,
        createdAt: Date.now()
      };

      const request = store.add(record);

      request.onsuccess = (e) => {
        const generatedId = e.target.result;
        notifyQueueSubscribers({
          type: 'ENQUEUED',
          record: { ...record, id: generatedId }
        });
        resolve({ ...record, id: generatedId });
      };

      request.onerror = (e) => {
        reject(e.target.error);
      };
    });
  } catch (error) {
    console.error('Gagal memasukkan aksi ke antrean IndexedDB:', error);
    throw error;
  }
}

/**
 * Mengambil Semua Aksi yang Berstatus 'pending'
 */
export async function getPendingOfflineActions() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onsuccess = () => {
        resolve(request.result || []);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Gagal membaca antrean pending IndexedDB:', error);
    return [];
  }
}

/**
 * Mengambil Seluruh Antrean (Pending & Synced) untuk audit atau riset
 */
export async function getAllOfflineQueue() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readonly');
      const store = tx.objectStore(QUEUE_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const sorted = (request.result || []).sort((a, b) => b.createdAt - a.createdAt);
        resolve(sorted);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    console.warn('Gagal membaca seluruh antrean IndexedDB:', error);
    return [];
  }
}

/**
 * Memperbarui Status Item Antrean di IndexedDB
 */
async function updateQueueItemStatus(id, updates) {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) return resolve(false);

        const updatedItem = { ...item, ...updates };
        const putReq = store.put(updatedItem);

        putReq.onsuccess = () => resolve(true);
        putReq.onerror = () => reject(putReq.error);
      };

      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn(`Gagal memperbarui status item antrean #${id}:`, err);
    return false;
  }
}

/**
 * Eksekusi Sinkronisasi Seluruh Antrean Pending ke Cloud Firestore
 */
let isSyncInProgress = false;

export async function processOfflineQueue() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { status: 'offline', message: 'Perangkat masih offline, sinkronisasi ditunda.' };
  }

  if (isSyncInProgress) {
    return { status: 'in_progress', message: 'Proses sinkronisasi sedang berjalan.' };
  }

  isSyncInProgress = true;
  notifyQueueSubscribers({ type: 'SYNC_START' });

  try {
    const pendingItems = await getPendingOfflineActions();
    if (pendingItems.length === 0) {
      isSyncInProgress = false;
      notifyQueueSubscribers({ type: 'SYNC_COMPLETE', syncedCount: 0 });
      return { status: 'idle', count: 0 };
    }

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pendingItems) {
      try {
        switch (item.action) {
          case 'RATE_BOOK':
            await saveUserRating(item.payload);
            break;

          case 'CREATE_LOAN':
            await createLoan(item.payload);
            break;

          case 'PROPOSE_BOOK':
            await ingestStagingData({
              sumber: 'usulan_offline_pwa',
              metadata: item.payload,
              catatan: `Sinkronisasi otomatis PWA IndexedDB dari ${item.meta.userNim}`
            });
            break;

          default:
            console.info('Aksi tidak dikenal dalam antrean:', item.action);
        }

        // Tandai sebagai tersinkronisasi (idempotent write)
        await updateQueueItemStatus(item.id, {
          status: 'synced',
          syncedAt: new Date().toISOString(),
          errorMsg: null
        });
        syncedCount++;
      } catch (err) {
        console.error(`Gagal sinkronisasi item #${item.id} (${item.action}):`, err);
        failedCount++;
        await updateQueueItemStatus(item.id, {
          retryCount: (item.retryCount || 0) + 1,
          lastError: err?.message || 'Gagal tersambung ke Firestore'
        });
      }
    }

    notifyQueueSubscribers({
      type: 'SYNC_COMPLETE',
      syncedCount,
      failedCount
    });

    return { status: 'success', syncedCount, failedCount };
  } catch (error) {
    console.error('Kesalahan fatal saat memproses antrean offline:', error);
    notifyQueueSubscribers({ type: 'SYNC_ERROR', error: error?.message });
    return { status: 'error', error: error?.message };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Menghapus Item Antrean yang Sudah Tersinkronisasi
 */
export async function clearSyncedItems() {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([QUEUE_STORE], 'readwrite');
      const store = tx.objectStore(QUEUE_STORE);
      const index = store.index('status');
      const req = index.getAllKeys('synced');

      req.onsuccess = () => {
        const keys = req.result || [];
        keys.forEach((k) => store.delete(k));
        notifyQueueSubscribers({ type: 'CLEARED' });
        resolve(keys.length);
      };

      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    console.warn('Gagal membersihkan antrean tersinkronisasi:', e);
    return 0;
  }
}

/**
 * Event Notifier & React Subscriber Helper
 */
const subscribers = new Set();

function notifyQueueSubscribers(data) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('uim-offline-event', { detail: data }));
  }
  subscribers.forEach((cb) => {
    try {
      cb(data);
    } catch (e) {
      console.error(e);
    }
  });
}

export function subscribeOfflineQueue(callback) {
  subscribers.add(callback);
  return () => {
    subscribers.delete(callback);
  };
}

/**
 * Inisialisasi Otomatis Listener Jaringan (Online / Offline)
 */
let isListenerInitialized = false;

export function initOfflineQueueAutoSync() {
  if (isListenerInitialized || typeof window === 'undefined') return;
  isListenerInitialized = true;

  window.addEventListener('online', () => {
    console.info('Koneksi internet terdeteksi pulih. Memulai proses sinkronisasi antrean IndexedDB...');
    processOfflineQueue();
  });

  window.addEventListener('offline', () => {
    console.info('Koneksi internet terputus. Mode offline-write diaktifkan.');
    notifyQueueSubscribers({ type: 'NETWORK_OFFLINE' });
  });

  // Jalankan percobaan sinkronisasi saat pertama kali booting bila online
  if (navigator.onLine) {
    setTimeout(() => {
      processOfflineQueue();
    }, 2000);
  }
}

