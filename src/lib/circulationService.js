/**
 * ==============================================================================
 * LAYANAN SIRKULASI PEMINJAMAN: CLOUD FIRESTORE UTAMA
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur:
 * - Sumber data utama: Cloud Firestore koleksi 'loans'.
 * - LocalStorage digunakan sebagai cache lokal untuk resiliensi offline (PWA).
 * - Real-time sync via onSnapshot.
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'uim_digilib_circulation_cache_v5';

export const INITIAL_LOANS = [];

export function getStoredLoans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOANS));
      return INITIAL_LOANS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_LOANS;
  } catch (e) {
    return INITIAL_LOANS;
  }
}

export function saveStoredLoans(loans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  } catch (e) {
    console.error('Gagal menyimpan cache sirkulasi', e);
  }
}

/**
 * Sinkronisasi data sirkulasi langsung dari Cloud Firestore (koleksi 'loans')
 */
export async function syncLoansFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredLoans();

  try {
    const colRef = collection(db, 'loans');
    const snapshot = await getDocs(colRef);
    const firestoreLoans = [];
    snapshot.forEach((docSnap) => {
      firestoreLoans.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreLoans.length > 0) {
      saveStoredLoans(firestoreLoans);
      return firestoreLoans;
    }
    return getStoredLoans();
  } catch (error) {
    console.warn('Gagal sinkronisasi sirkulasi dari Firestore:', error);
    return getStoredLoans();
  }
}

/**
 * Mencatat transaksi peminjaman buku baru
 * @param {Object} params - { nim, nama, bookId, judul, cover_url, uid }
 */
export async function createLoan({ nim, nama, bookId, judul, cover_url, uid = '' }) {
  const loans = getStoredLoans();

  const borrowDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const loanId = `trx-${Date.now()}`;

  const newLoan = {
    id: loanId,
    uid: String(uid || ''),
    nim: String(nim).trim(),
    nama: (nama || 'Mahasiswa UIM').trim(),
    bookId: String(bookId),
    judul: (judul || 'Koleksi Perpustakaan').trim(),
    cover_url: cover_url || '',
    tanggalPinjam: borrowDate.toISOString().split('T')[0],
    tanggalJatuhTempo: dueDate.toISOString().split('T')[0],
    tanggalKembali: null,
    status: 'dipinjam', // 'dipinjam' | 'kembali' | 'terlambat'
    denda: 0,
    perpanjangan: 0,
    created_at: new Date().toISOString()
  };

  loans.unshift(newLoan);
  saveStoredLoans(loans);

  // Jika sedang offline, masukkan ke antrean IndexedDB offline-write
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    try {
      const { enqueueOfflineAction } = await import('./offlineQueueService');
      await enqueueOfflineAction({
        action: 'CREATE_LOAN',
        collectionName: 'loans',
        payload: { nim, nama, bookId, judul, cover_url, uid },
        meta: { summary: `Peminjaman "${judul}" oleh ${nama} (${nim})` }
      });
    } catch (e) {
      console.warn('Gagal enqueue peminjaman offline:', e);
    }
    return newLoan;
  }

  // Simpan ke Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'loans', loanId), newLoan);
    } catch (err) {
      console.warn('Gagal menyimpan sirkulasi ke Firestore, simpan ke antrean IndexedDB:', err);
      try {
        const { enqueueOfflineAction } = await import('./offlineQueueService');
        await enqueueOfflineAction({
          action: 'CREATE_LOAN',
          collectionName: 'loans',
          payload: { nim, nama, bookId, judul, cover_url, uid },
          meta: { summary: `Peminjaman "${judul}" oleh ${nama} (${nim}) (Fallback)` }
        });
      } catch (e) {}
    }
  }

  return newLoan;
}

/**
 * Mengembalikan Buku
 */
export async function returnLoan(loanId) {
  const loans = getStoredLoans();
  const cleanId = String(loanId);
  const idx = loans.findIndex((l) => String(l.id) === cleanId);

  if (idx >= 0) {
    const returnDate = new Date();
    const dueDate = new Date(loans[idx].tanggalJatuhTempo);

    let denda = 0;
    if (returnDate > dueDate) {
      const diffTime = Math.abs(returnDate - dueDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      denda = diffDays * 500; // Tarif denda resmi Perpustakaan UIM: Rp 500 / hari / eksemplar
    }

    const updated = {
      ...loans[idx],
      tanggalKembali: returnDate.toISOString().split('T')[0],
      status: 'kembali',
      denda,
      updated_at: new Date().toISOString()
    };

    loans[idx] = updated;
    saveStoredLoans(loans);

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'loans', cleanId), {
          tanggalKembali: updated.tanggalKembali,
          status: 'kembali',
          denda: updated.denda,
          updated_at: updated.updated_at
        });
      } catch (err) {
        console.warn('Gagal update status pengembalian di Firestore:', err);
      }
    }

    return updated;
  }
  throw new Error('Data peminjaman tidak ditemukan');
}

/**
 * Perpanjang Peminjaman Buku (+7 Hari)
 */
export async function renewLoan(loanId) {
  const loans = getStoredLoans();
  const cleanId = String(loanId);
  const idx = loans.findIndex((l) => String(l.id) === cleanId);

  if (idx >= 0) {
    if ((loans[idx].perpanjangan || 0) >= 2) {
      throw new Error('Buku hanya dapat diperpanjang maksimal 2 kali.');
    }

    const currentDue = new Date(loans[idx].tanggalJatuhTempo);
    currentDue.setDate(currentDue.getDate() + 7);

    const updated = {
      ...loans[idx],
      tanggalJatuhTempo: currentDue.toISOString().split('T')[0],
      perpanjangan: (loans[idx].perpanjangan || 0) + 1,
      updated_at: new Date().toISOString()
    };

    loans[idx] = updated;
    saveStoredLoans(loans);

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'loans', cleanId), {
          tanggalJatuhTempo: updated.tanggalJatuhTempo,
          perpanjangan: updated.perpanjangan,
          updated_at: updated.updated_at
        });
      } catch (err) {
        console.warn('Gagal update perpanjangan di Firestore:', err);
      }
    }

    return updated;
  }
  throw new Error('Data peminjaman tidak ditemukan');
}

export function getLoansByNim(nim) {
  const loans = getStoredLoans();
  const cleanNim = String(nim).trim();
  return loans.filter((l) => String(l.nim).trim() === cleanNim);
}

export function getLoansByUid(uid) {
  const loans = getStoredLoans();
  const cleanUid = String(uid).trim();
  return loans.filter((l) => String(l.uid).trim() === cleanUid);
}

/**
 * Listener Real-time Transaksi Sirkulasi
 */
export function subscribeLoans(callback) {
  callback(getStoredLoans());

  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const colRef = collection(db, 'loans');
    return onSnapshot(colRef, (snapshot) => {
      const liveLoans = [];
      snapshot.forEach((docSnap) => {
        liveLoans.push({ id: docSnap.id, ...docSnap.data() });
      });
      if (liveLoans.length > 0) {
        saveStoredLoans(liveLoans);
        callback(liveLoans);
      }
    }, (e) => {
      console.warn('Listener Firestore loans error:', e);
    });
  } catch (e) {
    return () => {};
  }
}
