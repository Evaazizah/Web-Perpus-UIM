/**
 * ==============================================================================
 * LAYANAN DATA STAGING: AREA PEMENTASAN INTEGRASI BOT CRAWLING & OCR (GAP 1)
 * ==============================================================================
 * Sesuai Dokumen Blueprint Bagian 5.D & Arahan Integrasi:
 * - Titik penyangga (buffer zone) untuk data yang dikirim bot Crawling & OCR.
 * - Memvalidasi struktur JSON sebelum mendarat di koleksi 'data_staging'.
 * - Memfasilitasi kurasi Pustakawan (Review Raw JSON, perbaiki typo, Setujui/Tolak).
 * - Data yang disetujui (Approved) otomatis dimutasi ke koleksi 'books' utama.
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { addBibliografi } from './bookService';

const LOCAL_STAGING_KEY = 'uim_digilib_staging_cache_v1';

/**
 * Mengambil cache staging lokal
 */
export function getLocalStagingCache() {
  try {
    const raw = localStorage.getItem(LOCAL_STAGING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Menyimpan cache staging ke LocalStorage
 */
export function saveLocalStagingCache(items) {
  try {
    localStorage.setItem(LOCAL_STAGING_KEY, JSON.stringify(items));
  } catch (e) {}
}

/**
 * Ingestion: Menerima muatan data mentah dari bot Crawling atau OCR
 * @param {Object} payload - { sumber, metadata, raw_json, catatan }
 */
export async function ingestStagingData({ sumber = 'crawling', metadata, raw_json, catatan = '' }) {
  const stagingId = `stg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Validasi dasar metadata
  const cleanTitle = (metadata?.judul || metadata?.title || 'Tanpa Judul').trim();
  const cleanAuthor = (metadata?.penulis || metadata?.author || 'Anonim').trim();

  const record = {
    id: stagingId,
    sumber: sumber, // 'crawling' | 'ocr' | 'external_api'
    metadata: {
      judul: cleanTitle,
      penulis: cleanAuthor,
      isbn: metadata?.isbn || '',
      kategori: metadata?.kategori || 'Umum',
      sinopsis: metadata?.sinopsis || metadata?.abstrak || '',
      cover_url: metadata?.cover_url || ''
    },
    raw_json: raw_json || metadata,
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    catatan_kurasi: catatan || '',
    created_at: now
  };

  // Simpan ke cache lokal
  const current = getLocalStagingCache();
  current.unshift(record);
  saveLocalStagingCache(current);

  // Simpan ke Cloud Firestore jika aktif
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'data_staging', stagingId), record);
    } catch (err) {
      console.warn('Gagal menyimpan ke Firestore data_staging:', err);
    }
  }

  return record;
}

/**
 * Mengambil semua data staging berstatus 'pending'
 */
export async function fetchPendingStagingData() {
  if (!isFirebaseConfigured() || !db) {
    return getLocalStagingCache().filter((i) => i.status === 'pending');
  }

  try {
    const q = query(collection(db, 'data_staging'), where('status', '==', 'pending'));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() }));

    if (items.length > 0) {
      saveLocalStagingCache(items);
      return items;
    }
  } catch (err) {
    console.warn('Gagal fetch data_staging:', err);
  }

  return getLocalStagingCache().filter((i) => i.status === 'pending');
}

/**
 * Pustakawan Menyetujui Data Staging dan Memutasi ke Katalog Koleksi Buku Utama
 * @param {string} stagingId
 * @param {Object} curatedData - Metadata yang telah dikurasi/diperbaiki pustakawan
 */
export async function approveStagingItem(stagingId, curatedData) {
  const now = new Date().toISOString();

  // 1. Tambahkan ke koleksi buku utama (books)
  const newBook = await addBibliografi({
    judul: curatedData.judul,
    penulis: curatedData.penulis,
    kategori: curatedData.kategori || 'Umum',
    isbn: curatedData.isbn || '',
    sinopsis: curatedData.sinopsis || '',
    cover_url: curatedData.cover_url || '',
    salin: Number(curatedData.salin) || 1
  });

  // 2. Perbarui status di data_staging
  const current = getLocalStagingCache();
  const idx = current.findIndex((i) => i.id === stagingId);
  if (idx >= 0) {
    current[idx].status = 'approved';
    current[idx].verified_at = now;
    saveLocalStagingCache(current);
  }

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'data_staging', stagingId), {
        status: 'approved',
        verified_at: now,
        promoted_book_id: newBook.id
      });
    } catch (e) {}
  }

  return newBook;
}

/**
 * Pustakawan Menolak Data Staging (misal: spam atau OCR rusak total)
 * @param {string} stagingId
 * @param {string} reason
 */
export async function rejectStagingItem(stagingId, reason = '') {
  const now = new Date().toISOString();

  const current = getLocalStagingCache();
  const idx = current.findIndex((i) => i.id === stagingId);
  if (idx >= 0) {
    current[idx].status = 'rejected';
    current[idx].catatan_kurasi = reason;
    current[idx].verified_at = now;
    saveLocalStagingCache(current);
  }

  if (isFirebaseConfigured() && db) {
    try {
      await updateDoc(doc(db, 'data_staging', stagingId), {
        status: 'rejected',
        catatan_kurasi: reason,
        verified_at: now
      });
    } catch (e) {}
  }
}

