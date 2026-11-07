/**
 * Layanan Sirkulasi Perpustakaan UIM (SLiMS)
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

const STORAGE_KEY = 'uim_digilib_circulation_clean_v4';
const RESET_FLAG = 'uim_digilib_circ_reset_v4';

// Bersihkan data sirkulasi lama dari browser pengguna
try {
  if (!localStorage.getItem(RESET_FLAG)) {
    localStorage.removeItem('uim_digilib_circulation');
    localStorage.removeItem('uim_digilib_circulation_data');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(RESET_FLAG, 'true');
  }
} catch (e) {}

const INITIAL_LOANS = [];

export function getStoredLoans() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_LOANS));
      return INITIAL_LOANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_LOANS;
  }
}

export function saveStoredLoans(loans) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loans));
  } catch (e) {
    console.error('Gagal menyimpan data sirkulasi', e);
  }
}

/**
 * Sinkronisasi data sirkulasi langsung dari Firebase Cloud Firestore
 */
export async function syncLoansFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredLoans();
  try {
    const colRef = collection(db, 'loans');
    const snapshot = await getDocs(colRef);
    const firestoreLoans = [];
    snapshot.forEach((docSnap) => {
      firestoreLoans.push(docSnap.data());
    });
    if (firestoreLoans.length > 0) {
      saveStoredLoans(firestoreLoans);
      return firestoreLoans;
    }
    return getStoredLoans();
  } catch (error) {
    console.warn('Gagal sinkronisasi sirkulasi dari Firebase:', error);
    return getStoredLoans();
  }
}

/**
 * Mencatat transaksi peminjaman buku baru
 * Default masa pinjam: 7 hari
 */
export function createLoan({ nim, nama, bookId, judul, cover_url }) {
  const loans = getStoredLoans();

  const borrowDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const newLoan = {
    id: `trx-${Date.now()}`,
    nim: String(nim).trim(),
    nama: (nama || 'Mahasiswa UIM').trim(),
    bookId,
    judul: (judul || 'Koleksi Perpustakaan').trim(),
    cover_url: cover_url || '',
    tanggalPinjam: borrowDate.toISOString().split('T')[0],
    tanggalJatuhTempo: dueDate.toISOString().split('T')[0],
    tanggalKembali: null,
    status: 'dipinjam', // 'dipinjam' | 'kembali' | 'terlambat'
    denda: 0,
    perpanjangan: 0
  };

  loans.unshift(newLoan);
  saveStoredLoans(loans);

  // Simpan ke Firebase Cloud Firestore jika terhubung
  if (isFirebaseConfigured() && db) {
    try {
      setDoc(doc(db, 'loans', newLoan.id), newLoan).catch((err) => {
        console.warn('Penyimpanan sirkulasi ke Firebase ditunda:', err);
      });
    } catch (e) {}
  }

  return newLoan;
}

/**
 * Mengembalikan buku pinjaman
 */
export function returnLoan(loanId) {
  const loans = getStoredLoans();
  const idx = loans.findIndex((l) => l.id === loanId);
  if (idx >= 0) {
    const updated = {
      ...loans[idx],
      tanggalKembali: new Date().toISOString().split('T')[0],
      status: 'kembali'
    };
    loans[idx] = updated;
    saveStoredLoans(loans);

    // Update di Firebase Cloud Firestore jika terhubung
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'loans', loanId), {
          tanggalKembali: updated.tanggalKembali,
          status: 'kembali'
        }).catch((err) => {
          console.warn('Pembaruan sirkulasi di Firebase ditunda:', err);
        });
      } catch (e) {}
    }

    return loans[idx];
  }
  throw new Error('Transaksi pinjaman tidak ditemukan');
}

/**
 * Memperpanjang masa pinjam (maksimal 2x perpanjangan)
 */
export function renewLoan(loanId) {
  const loans = getStoredLoans();
  const idx = loans.findIndex((l) => l.id === loanId);
  if (idx >= 0) {
    const loan = loans[idx];
    if (loan.perpanjangan >= 2) {
      throw new Error('Batas maksimal perpanjangan (2x) telah tercapai');
    }
    const currentDue = new Date(loan.tanggalJatuhTempo);
    currentDue.setDate(currentDue.getDate() + 7);

    const updated = {
      ...loan,
      tanggalJatuhTempo: currentDue.toISOString().split('T')[0],
      perpanjangan: (loan.perpanjangan || 0) + 1
    };

    loans[idx] = updated;
    saveStoredLoans(loans);

    // Update di Firebase Cloud Firestore jika terhubung
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'loans', loanId), {
          tanggalJatuhTempo: updated.tanggalJatuhTempo,
          perpanjangan: updated.perpanjangan
        }).catch((err) => {
          console.warn('Pembaruan perpanjangan di Firebase ditunda:', err);
        });
      } catch (e) {}
    }

    return loans[idx];
  }
  throw new Error('Transaksi pinjaman tidak ditemukan');
}

export function getLoansByNim(nim) {
  const loans = getStoredLoans();
  const trimmed = String(nim || '').trim();
  return loans.filter((l) => String(l.nim).trim() === trimmed);
}

export function clearAllLoans() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}
