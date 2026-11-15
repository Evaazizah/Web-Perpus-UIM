/**
 * ==============================================================================
 * LAYANAN KOMENTAR & KOTAK SARAN PEMUSTAKA PERPUSTAKAAN UIM
 * ==============================================================================
 * Terintegrasi Cloud Firestore (koleksi 'feedbacks') dan LocalStorage.
 * Menyimpan kritik, saran, masukan fasilitas, dan kepuasan sivitas akademika.
 * Bersih dari data mock (default []) sehingga siap diuji mandiri.
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
import { addNotificationItem } from './notificationService';

const STORAGE_KEY = 'uim_digilib_feedback_cache_v1';

/**
 * Mengambil cache komentar lokal (Default [])
 */
export function getStoredFeedbacks() {
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
 * Menyimpan cache komentar
 */
export function saveStoredFeedbacks(feedbacks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(feedbacks));
  } catch (e) {
    console.error('Gagal menyimpan cache feedback', e);
  }
}

/**
 * Sinkronisasi komentar dari Cloud Firestore
 */
export async function syncFeedbacksFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredFeedbacks();

  try {
    const colRef = collection(db, 'feedbacks');
    const snapshot = await getDocs(colRef);
    const firestoreFeedbacks = [];
    snapshot.forEach((docSnap) => {
      firestoreFeedbacks.push({ id: docSnap.id, ...docSnap.data() });
    });

    if (firestoreFeedbacks.length > 0) {
      firestoreFeedbacks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      saveStoredFeedbacks(firestoreFeedbacks);
      return firestoreFeedbacks;
    }
    return getStoredFeedbacks();
  } catch (error) {
    console.warn('Gagal sinkronisasi komentar dari Firestore:', error);
    return getStoredFeedbacks();
  }
}

/**
 * Berlangganan (Real-time Subscribe) Data Komentar Firestore
 */
export function subscribeFeedbacks(callback) {
  if (!isFirebaseConfigured() || !db) {
    callback(getStoredFeedbacks());
    return () => {};
  }

  try {
    const colRef = collection(db, 'feedbacks');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const liveFeedbacks = [];
        snapshot.forEach((docSnap) => {
          liveFeedbacks.push({ id: docSnap.id, ...docSnap.data() });
        });
        liveFeedbacks.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        saveStoredFeedbacks(liveFeedbacks);
        callback(liveFeedbacks);
      },
      (error) => {
        console.warn('Feedback snapshot error:', error);
        callback(getStoredFeedbacks());
      }
    );
    return unsubscribe;
  } catch (err) {
    callback(getStoredFeedbacks());
    return () => {};
  }
}

/**
 * Mengirimkan Komentar / Saran Baru
 * @param {Object} data - { nama, email, nim, peran, kategori, rating, pesan }
 */
export async function submitFeedback(data) {
  const currentList = getStoredFeedbacks();
  const id = `fb-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const formattedDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const newFeedback = {
    id,
    nama: String(data.nama || 'Pemustaka UIM').trim(),
    email: String(data.email || '').trim(),
    nim: String(data.nim || '-').trim(),
    peran: String(data.peran || 'Mahasiswa').trim(),
    kategori: String(data.kategori || 'Saran Umum').trim(),
    rating: Number(data.rating) || 5,
    pesan: String(data.pesan || '').trim(),
    tanggal: formattedDate,
    createdAt: now.toISOString(),
    status: 'published',
    tanggapanAdmin: null
  };

  const updatedList = [newFeedback, ...currentList];
  saveStoredFeedbacks(updatedList);

  // Simpan ke Cloud Firestore jika aktif
  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'feedbacks', id), newFeedback);
    } catch (err) {
      console.warn('Gagal menyimpan komentar ke Cloud Firestore:', err);
    }
  }

  // Notifikasi otomatis sistem KHUSUS untuk Staf Admin Pustakawan (BUKAN untuk umum)
  try {
    await addNotificationItem({
      title: `Masukan Masuk: ${newFeedback.nama} (${newFeedback.peran})`,
      desc: `[${newFeedback.kategori}] ${newFeedback.pesan.slice(0, 95)}${newFeedback.pesan.length > 95 ? '...' : ''}`,
      category: 'Layanan',
      color: 'teal',
      targetRole: 'admin' // KHUSUS ADMIN SAJA
    });
  } catch (notifErr) {
    console.warn('Gagal memicu notifikasi komentar:', notifErr);
  }

  return newFeedback;
}

/**
 * Menghapus Komentar (Khusus Staf Admin Pustakawan)
 */
export async function deleteFeedbackItem(id) {
  const currentList = getStoredFeedbacks();
  const updatedList = currentList.filter((fb) => fb.id !== id);
  saveStoredFeedbacks(updatedList);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'feedbacks', id));
    } catch (err) {
      console.warn('Gagal menghapus feedback di Firestore:', err);
    }
  }
}

/**
 * Menambahkan Tanggapan / Balasan Pustakawan terhadap komentar
 */
export async function replyFeedbackItem(id, replyText, adminName = 'Pustakawan UIM') {
  const currentList = getStoredFeedbacks();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const updatedList = currentList.map((fb) => {
    if (fb.id === id) {
      return {
        ...fb,
        tanggapanAdmin: {
          pesan: replyText,
          penjawab: adminName,
          tanggal: formattedDate,
          repliedAt: now.toISOString()
        }
      };
    }
    return fb;
  });

  saveStoredFeedbacks(updatedList);

  const targetDoc = updatedList.find((fb) => fb.id === id);
  if (targetDoc && isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'feedbacks', id), targetDoc);
    } catch (err) {
      console.warn('Gagal memperbarui tanggapan komentar di Firestore:', err);
    }
  }

  // Notifikasi tanggapan KHUSUS untuk pemustaka yang bersangkutan (Targeted)
  if (targetDoc) {
    try {
      await addNotificationItem({
        title: `Tanggapan Pustakawan atas Masukan Anda`,
        desc: `Pustakawan (${adminName}): "${replyText.slice(0, 95)}${replyText.length > 95 ? '...' : ''}"`,
        category: 'Layanan',
        color: 'emerald',
        targetRole: targetDoc.peran === 'Dosen' ? 'dosen' : 'mahasiswa',
        targetNim: targetDoc.nim && targetDoc.nim !== '-' ? targetDoc.nim : null,
        targetEmail: targetDoc.email || null
      });
    } catch (notifErr) {
      console.warn('Gagal memicu notifikasi balasan:', notifErr);
    }
  }

  return targetDoc;
}

