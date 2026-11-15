/**
 * ==============================================================================
 * LAYANAN NOTIFIKASI & PENGUMUMAN RESMI PERPUSTAKAAN UIM
 * ==============================================================================
 * Terintegrasi Cloud Firestore (koleksi 'notifications') dan LocalStorage.
 * Bersih dari data mock (default []) sehingga siap diuji mandiri.
 * Admin dapat mempublikasikan pengumuman penting bagi seluruh sivitas.
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'uim_digilib_notifications_cache_v1';
const READ_IDS_KEY = 'uim_digilib_read_notifs_ids_v1';

export function getReadNotifIds() {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveReadNotifIds(ids) {
  try {
    localStorage.setItem(READ_IDS_KEY, JSON.stringify(ids));
  } catch (e) {}
}

/**
 * Mengambil cache pengumuman/notifikasi lokal (Default [])
 */
export function getStoredNotifications() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    const readIds = getReadNotifIds();
    return Array.isArray(parsed)
      ? parsed.map((item) => ({ ...item, isRead: readIds.includes(item.id) }))
      : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan cache notifikasi
 */
export function saveStoredNotifications(notifs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifs));
  } catch (e) {
    console.error('Gagal menyimpan cache notifikasi', e);
  }
}

/**
 * Sinkronisasi notifikasi dari Cloud Firestore
 */
export async function syncNotificationsFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredNotifications();

  try {
    const colRef = collection(db, 'notifications');
    const snapshot = await getDocs(colRef);
    const firestoreNotifs = [];
    snapshot.forEach((docSnap) => {
      firestoreNotifs.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreNotifs.length > 0) {
      firestoreNotifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStoredNotifications(firestoreNotifs);
      return firestoreNotifs;
    }
    return getStoredNotifications();
  } catch (error) {
    console.warn('Gagal sinkronisasi notifikasi dari Firestore:', error);
    return getStoredNotifications();
  }
}

/**
 * Berlangganan (Real-time Subscribe) Data Notifikasi Firestore
 */
export function subscribeNotifications(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(getStoredNotifications());
    return () => {};
  }

  try {
    const colRef = collection(db, 'notifications');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const liveNotifs = [];
        snapshot.forEach((docSnap) => {
          liveNotifs.push({ id: docSnap.id, ...docSnap.data() });
        });
        liveNotifs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveStoredNotifications(liveNotifs);
        const readIds = getReadNotifIds();
        callback(liveNotifs.map((item) => ({ ...item, isRead: readIds.includes(item.id) })));
      },
      (error) => {
        console.warn('Notification snapshot error:', error);
        callback(getStoredNotifications());
      }
    );
    return unsubscribe;
  } catch (err) {
    callback(getStoredNotifications());
    return () => {};
  }
}

/**
 * Memfilter notifikasi sesuai dengan identitas pengguna yang sedang aktif:
 * - targetRole: 'all' -> Semua pengunjung publik dan sivitas
 * - targetRole: 'admin' -> Khusus admin pustakawan
 * - targetRole: 'mahasiswa' -> Khusus mahasiswa (atau targetNim spesifik)
 * - targetRole: 'dosen' -> Khusus dosen (atau targetNim spesifik)
 */
export function filterNotificationsForUser(notifications, currentUser) {
  if (!Array.isArray(notifications)) return [];

  return notifications.filter((notif) => {
    const targetRole = notif.targetRole || 'all';

    // 1. Notifikasi Publik / Umum: Tampil untuk semua
    if (targetRole === 'all') return true;

    // 2. Notifikasi Khusus Admin: Hanya tampil jika login sebagai admin
    if (targetRole === 'admin') {
      return currentUser?.role === 'admin';
    }

    // 3. Notifikasi Khusus Mahasiswa
    if (targetRole === 'mahasiswa') {
      if (notif.targetNim) {
        return currentUser?.role === 'mahasiswa' && currentUser?.nim === notif.targetNim;
      }
      return currentUser?.role === 'mahasiswa' || currentUser?.role === 'admin';
    }

    // 4. Notifikasi Khusus Dosen
    if (targetRole === 'dosen') {
      if (notif.targetNim) {
        return currentUser?.role === 'dosen' && (currentUser?.nidn === notif.targetNim || currentUser?.nim === notif.targetNim);
      }
      return currentUser?.role === 'dosen' || currentUser?.role === 'admin';
    }

    // 5. Pencocokan langsung target NIM / NIDN spesifik
    if (notif.targetNim) {
      if (currentUser?.nim === notif.targetNim || currentUser?.nidn === notif.targetNim) {
        return true;
      }
    }

    // 6. Pencocokan target email langsung
    if (notif.targetEmail && currentUser?.email === notif.targetEmail) {
      return true;
    }

    // Admin selalu dapat memantau jika dibutuhkan
    if (currentUser?.role === 'admin') {
      return true;
    }

    return false;
  });
}

/**
 * Menambahkan Notifikasi/Pengumuman Baru (Khusus Admin Pustakawan)
 * @param {Object} data - { title, desc, category, color, targetRole, targetNim, targetEmail }
 */
export async function addNotificationItem(data) {
  const currentNotifs = getStoredNotifications();
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const formattedDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const newNotif = {
    id,
    title: String(data.title || '').trim(),
    desc: String(data.desc || '').trim(),
    category: String(data.category || 'Pengumuman').trim(),
    color: String(data.color || 'emerald').trim(),
    targetRole: String(data.targetRole || 'all').trim(), // 'all' | 'admin' | 'mahasiswa' | 'dosen'
    targetNim: data.targetNim ? String(data.targetNim).trim() : null,
    targetEmail: data.targetEmail ? String(data.targetEmail).trim() : null,
    date: formattedDate,
    createdAt: now.toISOString()
  };

  const updatedList = [newNotif, ...currentNotifs];
  saveStoredNotifications(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'notifications', id), newNotif);
    } catch (err) {
      console.warn('Gagal menyimpan notifikasi ke Firestore:', err);
    }
  }

  return newNotif;
}

/**
 * Menghapus Notifikasi (Khusus Admin)
 */
export async function deleteNotificationItem(notifId) {
  const currentNotifs = getStoredNotifications();
  const filtered = currentNotifs.filter((item) => String(item.id) !== String(notifId));
  saveStoredNotifications(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'notifications', String(notifId)));
    } catch (err) {
      console.warn('Gagal menghapus notifikasi dari Firestore:', err);
    }
  }

  return filtered;
}

/**
 * Tandai Semua Dibaca untuk pengguna saat ini
 */
export function markAllNotificationsAsRead(currentUser) {
  const notifs = getStoredNotifications();
  const userNotifs = filterNotificationsForUser(notifs, currentUser);
  const currentReadIds = getReadNotifIds();
  const newReadIds = Array.from(new Set([...currentReadIds, ...userNotifs.map((n) => n.id)]));
  saveReadNotifIds(newReadIds);
  return userNotifs.map((n) => ({ ...n, isRead: true }));
}

/**
 * Hitung Jumlah Notifikasi yang Belum Dibaca sesuai sasaran pengguna
 */
export function getUnreadNotificationCount(currentUser) {
  const notifs = getStoredNotifications();
  const userNotifs = filterNotificationsForUser(notifs, currentUser);
  const readIds = getReadNotifIds();
  return userNotifs.filter((n) => !readIds.includes(n.id)).length;
}

