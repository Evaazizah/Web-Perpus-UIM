/**
 * Layanan Pengelolaan Bibliografi & Katalog Buku Perpustakaan UIM (SLiMS)
 * Terintegrasi ganda: Firebase Cloud Firestore + LocalStorage Offline Sync
 */
import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc
} from 'firebase/firestore';

const STORAGE_KEY = 'uim_digilib_books_clean_v4';
const RESET_FLAG = 'uim_digilib_clean_reset_v4';

// Bersihkan seluruh data sampel/dummy lama dari browser pengguna
try {
  if (!localStorage.getItem(RESET_FLAG)) {
    localStorage.removeItem('uim_digilib_books');
    localStorage.removeItem('uim_digilib_books_data');
    localStorage.removeItem('uim_digilib_books_clean');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(RESET_FLAG, 'true');
  }
} catch (e) {}

const INITIAL_BOOKS = [];

export function getStoredBooks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
      return INITIAL_BOOKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_BOOKS;
  }
}

export function saveStoredBooks(books) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('Gagal menyimpan data buku', e);
  }
}

/**
 * Sinkronisasi data katalog buku langsung dari Firebase Cloud Firestore
 */
export async function syncBooksFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredBooks();
  try {
    const colRef = collection(db, 'books');
    const snapshot = await getDocs(colRef);
    const firestoreBooks = [];
    snapshot.forEach((docSnap) => {
      firestoreBooks.push(docSnap.data());
    });
    if (firestoreBooks.length > 0) {
      saveStoredBooks(firestoreBooks);
      return firestoreBooks;
    }
    return getStoredBooks();
  } catch (error) {
    console.warn('Gagal sinkronisasi buku dari Firebase:', error);
    return getStoredBooks();
  }
}

export function addBibliografi(newBook) {
  const books = getStoredBooks();
  const book = {
    id: Date.now(),
    judul: newBook.judul.trim(),
    penulis: newBook.penulis.trim(),
    kategori: newBook.kategori || 'Ilmu-ilmu Sosial',
    isbn: newBook.isbn ? newBook.isbn.trim() : '-',
    salin: Number(newBook.salin) || 1,
    sinopsis: newBook.sinopsis || '',
    cover_url: newBook.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60',
    isPromoted: newBook.isPromoted !== false,
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  books.unshift(book);
  saveStoredBooks(books);

  // Simpan ke Firebase Cloud Firestore jika terhubung
  if (isFirebaseConfigured() && db) {
    try {
      setDoc(doc(db, 'books', String(book.id)), book).catch((err) => {
        console.warn('Penyimpanan Firebase ditunda:', err);
      });
    } catch (e) {}
  }

  return book;
}

export function updateBibliografi(id, updatedFields) {
  const books = getStoredBooks();
  const idx = books.findIndex((b) => b.id === id);
  if (idx >= 0) {
    books[idx] = {
      ...books[idx],
      ...updatedFields,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    saveStoredBooks(books);

    // Update di Firebase Cloud Firestore jika terhubung
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'books', String(id)), updatedFields).catch((err) => {
          console.warn('Pembaruan Firebase ditunda:', err);
        });
      } catch (e) {}
    }

    return books[idx];
  }
  throw new Error('Buku tidak ditemukan');
}

export function deleteBibliografi(idsToDelete) {
  const books = getStoredBooks();
  const filtered = books.filter((b) => !idsToDelete.includes(b.id));
  saveStoredBooks(filtered);

  // Hapus dari Firebase Cloud Firestore jika terhubung
  if (isFirebaseConfigured() && db) {
    try {
      idsToDelete.forEach((id) => {
        deleteDoc(doc(db, 'books', String(id))).catch((err) => {
          console.warn('Penghapusan Firebase ditunda:', err);
        });
      });
    } catch (e) {}
  }

  return filtered;
}

export function clearAllBooks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
