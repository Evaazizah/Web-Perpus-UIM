/**
 * ==============================================================================
 * LAYANAN PORTAL JURNAL & KARYA ILMIAH MAHASISWA & DOSEN (SIVITAS UIM)
 * ==============================================================================
 * Sesuai Prosedur Baku Perpustakaan Perguruan Tinggi & SLiMS 9 Bulian:
 * - Sumber data utama: Cloud Firestore koleksi 'academic_journals'
 * - LocalStorage sebagai cache lokal untuk resiliensi offline (PWA)
 * - Prosedur Unggah:
 *   * Mahasiswa & Dosen mengunggah naskah karya ilmiah / jurnal
 *   * Status awal: 'pending' (menunggu verifikasi & kurasi pustakawan)
 *   * Pustakawan/Admin memeriksa abstrak, metadata, dan tautan PDF lalu menyetujui ('published') atau revisi ('rejected')
 *   * Admin dapat langsung menerbitkan jurnal tanpa antrean
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

const STORAGE_KEY = 'uim_digilib_journals_cache_v1';

/**
 * Mengambil cache jurnal lokal (Default [] sesuai prinsip data bersih)
 */
export function getStoredJournals() {
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
 * Menyimpan cache jurnal ke LocalStorage
 */
export function saveStoredJournals(journals) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
  } catch (e) {
    console.error('Gagal menyimpan cache jurnal', e);
  }
}

/**
 * Sinkronisasi data jurnal dari Cloud Firestore
 */
export async function syncJournalsFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredJournals();

  try {
    const colRef = collection(db, 'academic_journals');
    const snapshot = await getDocs(colRef);
    const firestoreJournals = [];
    snapshot.forEach((docSnap) => {
      firestoreJournals.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreJournals.length > 0) {
      saveStoredJournals(firestoreJournals);
      return firestoreJournals;
    }
    return getStoredJournals();
  } catch (error) {
    console.warn('Gagal sinkronisasi jurnal dari Firestore:', error);
    return getStoredJournals();
  }
}

/**
 * Berlangganan (Real-time Subscribe) Data Jurnal Firestore
 */
export function subscribeJournals(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(getStoredJournals());
    return () => {};
  }

  try {
    const colRef = collection(db, 'academic_journals');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const liveJournals = [];
        snapshot.forEach((docSnap) => {
          liveJournals.push({ id: docSnap.id, ...docSnap.data() });
        });
        saveStoredJournals(liveJournals);
        callback(liveJournals);
      },
      (error) => {
        console.warn('Jurnal snapshot listener error:', error);
        callback(getStoredJournals());
      }
    );
    return unsubscribe;
  } catch (err) {
    callback(getStoredJournals());
    return () => {};
  }
}

/**
 * Pengajuan / Unggah Jurnal & Karya Ilmiah Baru
 * @param {Object} data - Metadata naskah jurnal sesuai standar SLiMS
 */
export async function submitJournal(data) {
  const journals = getStoredJournals();
  const id = `jrn-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const isAutoApproved = data.uploader_role === 'admin';

  const newJournal = {
    id,
    judul: String(data.judul || '').trim(),
    tipe_penulis: data.tipe_penulis || 'mahasiswa', // 'mahasiswa' | 'dosen'
    penulis_utama: String(data.penulis_utama || '').trim(),
    nim_nidn: String(data.nim_nidn || '').trim(),
    prodi: String(data.prodi || 'Teknik Informatika (Fakultas Teknik)').trim(),
    fakultas: String(data.fakultas || 'Universitas Islam Madura').trim(),
    rekan_penulis: String(data.rekan_penulis || '').trim(),
    nama_jurnal: String(data.nama_jurnal || 'Jurnal Sivitas Akademika UIM').trim(),
    volume: String(data.volume || 'Vol. 1').trim(),
    nomor: String(data.nomor || 'No. 1').trim(),
    tahun: Number(data.tahun) || new Date().getFullYear(),
    halaman: String(data.halaman || '1-10').trim(),
    issn: String(data.issn || '').trim(),
    doi: String(data.doi || '').trim(),
    abstrak_id: String(data.abstrak_id || '').trim(),
    abstrak_en: String(data.abstrak_en || '').trim(),
    kata_kunci: String(data.kata_kunci || '').trim(),
    file_url: String(data.file_url || '').trim(),
    uploader_uid: data.uploader_uid || 'anon',
    uploader_role: data.uploader_role || 'user',
    uploader_nama: data.uploader_nama || 'Civitas UIM',
    status: isAutoApproved ? 'published' : 'pending', // 'pending' | 'published' | 'rejected'
    catatan_pustakawan: '',
    submitted_at: new Date().toISOString(),
    published_at: isAutoApproved ? new Date().toISOString() : null,
    view_count: 0,
    download_count: 0
  };

  const updatedJournals = [newJournal, ...journals];
  saveStoredJournals(updatedJournals);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'academic_journals', id), newJournal);
    } catch (error) {
      console.warn('Gagal menyimpan jurnal ke Firestore:', error);
    }
  }

  return newJournal;
}

/**
 * Verifikasi & Perbarui Status Jurnal oleh Pustakawan (Admin)
 * @param {string} journalId
 * @param {'published'|'rejected'} newStatus
 * @param {string} catatan_pustakawan
 */
export async function updateJournalStatus(journalId, newStatus, catatan_pustakawan = '') {
  const journals = getStoredJournals();
  const index = journals.findIndex((j) => String(j.id) === String(journalId));
  if (index === -1) throw new Error('Jurnal tidak ditemukan.');

  const now = new Date().toISOString();
  journals[index] = {
    ...journals[index],
    status: newStatus,
    catatan_pustakawan: catatan_pustakawan || '',
    published_at: newStatus === 'published' ? (journals[index].published_at || now) : null,
    updated_at: now
  };

  saveStoredJournals(journals);

  if (isFirebaseConfigured() && db) {
    try {
      const docRef = doc(db, 'academic_journals', String(journalId));
      await updateDoc(docRef, {
        status: newStatus,
        catatan_pustakawan: catatan_pustakawan || '',
        published_at: newStatus === 'published' ? (journals[index].published_at || now) : null,
        updated_at: now
      });
    } catch (err) {
      console.warn('Gagal memperbarui status jurnal di Firestore:', err);
    }
  }

  return journals[index];
}

/**
 * Menghapus Jurnal (Admin SLiMS)
 */
export async function deleteJournal(journalId) {
  const journals = getStoredJournals();
  const filtered = journals.filter((j) => String(j.id) !== String(journalId));
  saveStoredJournals(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'academic_journals', String(journalId)));
    } catch (err) {
      console.warn('Gagal menghapus jurnal dari Firestore:', err);
    }
  }

  return filtered;
}

/**
 * Tingkatkan counter pembaca jurnal
 */
export async function incrementJournalView(journalId) {
  const journals = getStoredJournals();
  const index = journals.findIndex((j) => String(j.id) === String(journalId));
  if (index !== -1) {
    journals[index].view_count = (journals[index].view_count || 0) + 1;
    saveStoredJournals(journals);

    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'academic_journals', String(journalId));
        await updateDoc(docRef, { view_count: journals[index].view_count });
      } catch (e) {}
    }
  }
}

/**
 * Tingkatkan counter unduhan PDF jurnal
 */
export async function incrementJournalDownload(journalId) {
  const journals = getStoredJournals();
  const index = journals.findIndex((j) => String(j.id) === String(journalId));
  if (index !== -1) {
    journals[index].download_count = (journals[index].download_count || 0) + 1;
    saveStoredJournals(journals);

    if (isFirebaseConfigured() && db) {
      try {
        const docRef = doc(db, 'academic_journals', String(journalId));
        await updateDoc(docRef, { download_count: journals[index].download_count });
      } catch (e) {}
    }
  }
}

