/**
 * ==============================================================================
 * LAYANAN BERITA & WARTA PERPUSTAKAAN UIM
 * ==============================================================================
 * Terintegrasi Cloud Firestore (koleksi 'news') dan LocalStorage cache.
 * Bersih dari data mock (default []) sehingga siap diuji mandiri.
 * Hanya pengguna dengan peran 'admin' (pustakawan) yang diizinkan menambah/menghapus berita.
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

const STORAGE_KEY = 'uim_digilib_news_cache_v1';

/**
 * Mengambil cache berita lokal (Default [] bersih tanpa seed dummy)
 */
export function getStoredNews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan cache berita ke LocalStorage
 */
export function saveStoredNews(newsList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newsList));
  } catch (e) {
    console.error('Gagal menyimpan cache berita', e);
  }
}

/**
 * Sinkronisasi data berita langsung dari Cloud Firestore (koleksi 'news')
 */
export async function syncNewsFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredNews();

  try {
    const colRef = collection(db, 'news');
    const snapshot = await getDocs(colRef);
    const firestoreNews = [];
    snapshot.forEach((docSnap) => {
      firestoreNews.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreNews.length > 0) {
      // Urutkan tanggal terbaru
      firestoreNews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStoredNews(firestoreNews);
      return firestoreNews;
    }
    return getStoredNews();
  } catch (error) {
    console.warn('Gagal sinkronisasi berita dari Firestore:', error);
    return getStoredNews();
  }
}

/**
 * Berlangganan (Real-time Subscribe) Data Berita Firestore
 */
export function subscribeNews(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(getStoredNews());
    return () => {};
  }

  try {
    const colRef = collection(db, 'news');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const liveNews = [];
        snapshot.forEach((docSnap) => {
          liveNews.push({ id: docSnap.id, ...docSnap.data() });
        });
        liveNews.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveStoredNews(liveNews);
        callback(liveNews);
      },
      (error) => {
        console.warn('News snapshot error:', error);
        callback(getStoredNews());
      }
    );
    return unsubscribe;
  } catch (err) {
    callback(getStoredNews());
    return () => {};
  }
}

/**
 * Menambahkan Berita Baru (Khusus Admin Pustakawan)
 * @param {Object} data - { title, category, author, image, summary, content }
 */
export async function addNewsItem(data) {
  const currentNews = getStoredNews();
  const id = `news-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const formattedDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const newNews = {
    id,
    title: String(data.title || '').trim(),
    category: String(data.category || 'Literasi Digital').trim(),
    author: String(data.author || 'Humas UPT Perpustakaan UIM').trim(),
    date: formattedDate,
    image: String(
      data.image ||
        'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80'
    ).trim(),
    summary: String(data.summary || '').trim(),
    content: String(data.content || '').trim(),
    createdAt: now.toISOString()
  };

  const updatedList = [newNews, ...currentNews];
  saveStoredNews(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'news', id), newNews);
    } catch (err) {
      console.warn('Gagal menyimpan berita ke Firestore:', err);
    }
  }

  return newNews;
}

/**
 * Menghapus Berita (Khusus Admin)
 */
export async function deleteNewsItem(newsId) {
  const currentNews = getStoredNews();
  const filtered = currentNews.filter((item) => String(item.id) !== String(newsId));
  saveStoredNews(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'news', String(newsId)));
    } catch (err) {
      console.warn('Gagal menghapus berita dari Firestore:', err);
    }
  }

  return filtered;
}

