/**
 * ==============================================================================
 * LAYANAN BUKU FAVORIT / BOOKMARK PEMUSTAKA
 * ==============================================================================
 * Mendukung penyimpanan buku favorit pengguna secara offline (LocalStorage)
 * dan sinkronisasi ke Cloud Firestore (koleksi users -> subkoleksi/array bookmarks).
 */

import { db, isFirebaseConfigured } from './firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

const STORAGE_PREFIX = 'uim_bookmarks_';

export function getLocalBookmarks(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalBookmarks(userId, bookmarks) {
  if (!userId) return;
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(bookmarks));
  } catch (e) {
    console.warn('Gagal menyimpan cache bookmark lokal', e);
  }
}

export async function fetchUserBookmarks(userId) {
  if (!userId) return [];
  const local = getLocalBookmarks(userId);

  if (!isFirebaseConfigured() || !db) {
    return local;
  }

  try {
    const userDocRef = doc(db, 'users', String(userId));
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      const data = snapshot.data();
      const firestoreBookmarks = data.bookmarks || [];
      if (firestoreBookmarks.length > 0) {
        saveLocalBookmarks(userId, firestoreBookmarks);
        return firestoreBookmarks;
      }
    }
  } catch (e) {
    console.warn('Gagal fetch bookmark dari Firestore, gunakan cache:', e);
  }
  return local;
}

export async function toggleBookmark(userId, book) {
  if (!userId || !book) return { isBookmarked: false, bookmarks: [] };

  const current = getLocalBookmarks(userId);
  const bookId = String(book.id);
  const existsIndex = current.findIndex((b) => String(b.id) === bookId);

  let updated;
  let isAdded = false;

  if (existsIndex >= 0) {
    updated = current.filter((b) => String(b.id) !== bookId);
    isAdded = false;
  } else {
    updated = [
      {
        id: bookId,
        judul: book.judul || 'Tanpa Judul',
        penulis: book.penulis || 'Anonim',
        cover_url: book.cover_url || '',
        kategori: book.kategori || 'Umum',
        tahun: book.tahun || book.tahun_terbit || '',
        lokasi_rak: book.lokasi_rak || '',
        bookmarked_at: new Date().toISOString()
      },
      ...current
    ];
    isAdded = true;
  }

  saveLocalBookmarks(userId, updated);

  // Sync ke Firestore jika aktif
  if (isFirebaseConfigured() && db) {
    try {
      const userDocRef = doc(db, 'users', String(userId));
      await updateDoc(userDocRef, { bookmarks: updated });
    } catch (e) {
      // Jika dokumen user belum punya field bookmarks, gunakan setDoc merge
      try {
        const userDocRef = doc(db, 'users', String(userId));
        await setDoc(userDocRef, { bookmarks: updated }, { merge: true });
      } catch (err) {
        console.warn('Gagal update bookmark ke Firestore:', err);
      }
    }
  }

  return { isBookmarked: isAdded, bookmarks: updated };
}

export function isBookmarked(userId, bookId) {
  if (!userId || !bookId) return false;
  const current = getLocalBookmarks(userId);
  return current.some((b) => String(b.id) === String(bookId));
}

