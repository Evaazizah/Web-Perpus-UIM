/**
 * ==============================================================================
 * LAYANAN RATING BUKU: CLOUD FIRESTORE (BAHAN BAKAR COLLABORATIVE FILTERING)
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur:
 * - Menggunakan koleksi 'ratings' di Cloud Firestore sebagai sumber utama.
 * - Idempotent Key: Document ID = `${id_user}_${id_buku}` untuk mencegah duplikasi rating.
 * - 1 pengguna hanya memiliki 1 rating aktif per buku (skala 1 - 5).
 * - Real-time sync via Firestore onSnapshot agar rekomendasi responsif.
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';

const LOCAL_RATINGS_KEY = 'uim_digilib_ratings_cache_v1';

/**
 * Mengambil cache rating lokal
 */
export function getLocalRatingsCache() {
  try {
    const raw = localStorage.getItem(LOCAL_RATINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan cache rating ke LocalStorage
 */
export function saveLocalRatingsCache(ratings) {
  try {
    localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
  } catch (e) {
    console.warn('Gagal menyimpan cache rating', e);
  }
}

/**
 * Menyimpan atau Memperbarui Rating Buku oleh Pengguna Terautentikasi
 * @param {Object} params - { userId, bookId, ratingValue, ulasan }
 */
export async function saveUserRating({ userId, bookId, ratingValue, ulasan = '' }) {
  if (!userId) {
    throw new Error('Hanya pengguna terautentikasi yang dapat memberikan rating buku.');
  }

  const cleanBookId = String(bookId);
  const cleanUserId = String(userId);
  const numRating = Math.max(1, Math.min(5, Number(ratingValue)));

  const ratingDocId = `${cleanUserId}_${cleanBookId}`;
  const now = new Date().toISOString();

  const ratingRecord = {
    id: ratingDocId,
    id_user: cleanUserId,
    id_buku: cleanBookId,
    nilai_rating: numRating,
    ulasan: ulasan || '',
    updated_at: now
  };

  // 1. Simpan ke Cache Lokal terlebih dahulu (responsif instan)
  const currentRatings = getLocalRatingsCache();
  const existingIdx = currentRatings.findIndex(
    (r) => String(r.id_user) === cleanUserId && String(r.id_buku) === cleanBookId
  );

  if (existingIdx >= 0) {
    currentRatings[existingIdx] = { ...currentRatings[existingIdx], ...ratingRecord };
  } else {
    ratingRecord.created_at = now;
    currentRatings.push(ratingRecord);
  }
  saveLocalRatingsCache(currentRatings);

  // Jika sedang offline, simpan ke antrean IndexedDB offline-write
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    try {
      const { enqueueOfflineAction } = await import('./offlineQueueService');
      await enqueueOfflineAction({
        action: 'RATE_BOOK',
        collectionName: 'ratings',
        payload: { userId, bookId, ratingValue, ulasan },
        meta: { summary: `Rating ${numRating}★ Buku #${cleanBookId}` }
      });
    } catch (e) {
      console.warn('Gagal enqueue rating offline:', e);
    }
    return ratingRecord;
  }

  // 2. Simpan ke Cloud Firestore jika aktif
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'ratings', ratingDocId);
      await setDoc(docRef, ratingRecord, { merge: true });
    } catch (error) {
      console.warn('Gagal menyimpan rating ke Firestore, masukkan ke antrean IndexedDB:', error);
      try {
        const { enqueueOfflineAction } = await import('./offlineQueueService');
        await enqueueOfflineAction({
          action: 'RATE_BOOK',
          collectionName: 'ratings',
          payload: { userId, bookId, ratingValue, ulasan },
          meta: { summary: `Rating ${numRating}★ Buku #${cleanBookId} (Koneksi Terputus)` }
        });
      } catch (e) {
        console.warn('Gagal fallback enqueue:', e);
      }
    }
  }

  return ratingRecord;
}

/**
 * Mengambil Seluruh Data Rating dari Firestore
 */
export async function fetchAllRatings() {
  if (!isFirebaseConfigured() || !db) return getLocalRatingsCache();

  try {
    const colRef = collection(db, 'ratings');
    const snapshot = await getDocs(colRef);
    const firestoreRatings = [];
    snapshot.forEach((docSnap) => {
      firestoreRatings.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreRatings.length > 0) {
      saveLocalRatingsCache(firestoreRatings);
      return firestoreRatings;
    }
  } catch (error) {
    console.warn('Gagal fetch rating dari Firestore, gunakan cache:', error);
  }

  return getLocalRatingsCache();
}

/**
 * Mengambil Seluruh Rating yang Diberikan oleh Pengguna Tertentu
 * @param {string} userId - UID pengguna
 */
export async function fetchRatingsByUser(userId) {
  if (!userId) return [];
  const cleanId = String(userId);
  const all = await fetchAllRatings();
  return all.filter((r) => String(r.id_user) === cleanId);
}

/**
 * Berlangganan (Real-time listener) terhadap pembaruan koleksi ratings
 * @param {Function} callback - dipanggil setiap ada penambahan/perubahan rating
 * @returns {Function} unsubscribe function
 */
export function subscribeRatings(callback) {
  callback(getLocalRatingsCache());

  if (!isFirebaseConfigured() || !db) {
    return () => {};
  }

  try {
    const colRef = collection(db, 'ratings');
    return onSnapshot(colRef, (snapshot) => {
      const liveRatings = [];
      snapshot.forEach((docSnap) => {
        liveRatings.push({ id: docSnap.id, ...docSnap.data() });
      });
      saveLocalRatingsCache(liveRatings);
      callback(liveRatings);
    }, (err) => {
      console.warn('Listener Firestore ratings error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

