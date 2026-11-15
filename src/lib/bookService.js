/**
 * ==============================================================================
 * LAYANAN KATALOG BIBLIOGRAFI BUKU: CLOUD FIRESTORE UTAMA
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur:
 * - Sumber data utama: Cloud Firestore koleksi 'books'.
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

const STORAGE_KEY = 'uim_digilib_books_cache_v5';

// Koleksi Awal Standar UIM (Digunakan jika Firestore masih baru kosong)
export const INITIAL_SEEDS = [
  {
    id: 'uim-b001',
    judul: 'Metodologi Penelitian Hukum Islam',
    penulis: 'Prof. Dr. H. Abdurrahman, M.Ag',
    kategori: 'Ilmu Agama Islam',
    isbn: '978-602-893-112-1',
    penerbit: 'UIM Press Pamekasan',
    tahun_terbit: 2023,
    salin: 3,
    total_eksemplar: 3,
    lokasi_rak: 'Rak 101 - FAI',
    sinopsis: 'Panduan komprehensif metodologi penelitian hukum syariah, ushul fiqh kontemporer, dan studi kasus peradilan agama di Madura.',
    cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    isPromoted: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'uim-b002',
    judul: 'Rekayasa Perangkat Lunak Modern dengan React & Python',
    penulis: 'Dr. Eng. Ahmad Zaini, S.T., M.T.',
    kategori: 'Teknologi Informasi',
    isbn: '978-602-623-224-3',
    penerbit: 'Informatika Press',
    tahun_terbit: 2024,
    salin: 4,
    total_eksemplar: 4,
    lokasi_rak: 'Rak 204 - FT',
    sinopsis: 'Kupas tuntas arsitektur Single Page Application (SPA), Progressive Web App (PWA), FastAPI asinkron, dan integrasi Machine Learning.',
    cover_url: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60',
    isPromoted: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'uim-b003',
    judul: 'Kecerdasan Buatan & Sistem Rekomendasi Cerdas',
    penulis: 'M. Syafiuddin, M.Kom',
    kategori: 'Teknologi Informasi',
    isbn: '978-602-554-781-0',
    penerbit: 'Mitra Wacana Media',
    tahun_terbit: 2023,
    salin: 2,
    total_eksemplar: 2,
    lokasi_rak: 'Rak 204 - FT',
    sinopsis: 'Membahas collaborative filtering, cosine similarity, matrix factorization SVD, dan implementasi scikit-learn praktis.',
    cover_url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60',
    isPromoted: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'uim-b004',
    judul: 'Ekonomi Syariah: Prinsip dan Praktik Perbankan Madura',
    penulis: 'Dr. Hj. Supriyatun, S.E., M.E.I',
    kategori: 'Ekonomi Islam',
    isbn: '978-602-112-990-4',
    penerbit: 'RajaGrafindo Persada',
    tahun_terbit: 2022,
    salin: 2,
    total_eksemplar: 2,
    lokasi_rak: 'Rak 302 - FE',
    sinopsis: 'Analisis pembiayaan mudharabah, murabahah, dan potensi penguatan ekonomi berbasis pesantren di wilayah Madura.',
    cover_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60',
    isPromoted: true,
    updatedAt: new Date().toISOString()
  }
];

export function getStoredBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Gagal menyimpan cache buku', e);
  }
}

/**
 * Sinkronisasi data katalog buku langsung dari Cloud Firestore
 */
export async function syncBooksFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredBooks();

  try {
    const colRef = collection(db, 'books');
    const snapshot = await getDocs(colRef);
    const firestoreBooks = [];
    snapshot.forEach((docSnap) => {
      firestoreBooks.push({ id: docSnap.id, ...docSnap.data() });
    });

    saveStoredBooks(firestoreBooks);
    return firestoreBooks;
  } catch (error) {
    console.warn('Gagal sinkronisasi buku dari Firestore, beralih ke cache lokal:', error);
    return getStoredBooks();
  }
}

/**
 * Tambah Bibliografi Buku Baru ke Firestore
 */
export async function addBibliografi(newBook) {
  const books = getStoredBooks();
  const bookId = String(newBook.id || `book-${Date.now()}`);

  const book = {
    id: bookId,
    judul: (newBook.judul || 'Tanpa Judul').trim(),
    penulis: (newBook.penulis || 'Anonim').trim(),
    kategori: newBook.kategori || 'Umum',
    isbn: newBook.isbn ? newBook.isbn.trim() : '-',
    penerbit: newBook.penerbit || 'UIM Press',
    tahun_terbit: Number(newBook.tahun_terbit) || new Date().getFullYear(),
    salin: Number(newBook.salin) || 1,
    total_eksemplar: Number(newBook.salin) || 1,
    lokasi_rak: newBook.lokasi_rak || 'Rak Koleksi Utama',
    sinopsis: newBook.sinopsis || '',
    cover_url: newBook.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    isPromoted: newBook.isPromoted !== false,
    updatedAt: new Date().toISOString()
  };

  // Simpan ke Cache Lokal
  books.unshift(book);
  saveStoredBooks(books);

  // Simpan ke Firestore
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'books', bookId), book);
    } catch (err) {
      console.warn('Gagal menyimpan buku ke Firestore (tersimpan di cache lokal):', err);
    }
  }

  return book;
}

/**
 * Pembaruan Metadata Buku
 */
export async function updateBibliografi(id, updatedFields) {
  const books = getStoredBooks();
  const cleanId = String(id);
  const idx = books.findIndex((b) => String(b.id) === cleanId);

  if (idx >= 0) {
    const updated = {
      ...books[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    books[idx] = updated;
    saveStoredBooks(books);

    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'books', cleanId), updatedFields);
      } catch (err) {
        console.warn('Gagal update buku di Firestore:', err);
      }
    }

    return updated;
  }
  throw new Error('Buku tidak ditemukan');
}

/**
 * Hapus Bibliografi Buku
 */
export async function deleteBibliografi(idsToDelete) {
  const books = getStoredBooks();
  const cleanIds = idsToDelete.map((id) => String(id));
  const filtered = books.filter((b) => !cleanIds.includes(String(b.id)));
  saveStoredBooks(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      for (const id of cleanIds) {
        await deleteDoc(doc(db, 'books', id)).catch(() => {});
      }
    } catch (e) {}
  }

  return filtered;
}

/**
 * Listener Real-time Katalog Buku
 */
export function subscribeBooks(callback) {
  callback(getStoredBooks());

  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const colRef = collection(db, 'books');
    return onSnapshot(colRef, (snapshot) => {
      const liveBooks = [];
      snapshot.forEach((docSnap) => {
        liveBooks.push({ id: docSnap.id, ...docSnap.data() });
      });
      saveStoredBooks(liveBooks);
      callback(liveBooks);
    }, (err) => {
      console.warn('Listener Firestore books error:', err);
    });
  } catch (e) {
    return () => {};
  }
}

export function clearAllBooks() {
  saveStoredBooks([]);
  return [];
}
