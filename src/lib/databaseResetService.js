/**
 * ==============================================================================
 * LAYANAN PEMBERSIH & RESET DATABASE KOSONG UNTUK PENGUJIAN MANDIRI
 * ==============================================================================
 * Membersihkan semua data lokal dan Firestore agar sistem siap diuji dari nol (clean state).
 */

import { db, isFirebaseConfigured } from './firebase';
import { collection, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { resetVisitorStats } from './visitorService';

export async function clearAllSystemData() {
  // 1. Bersihkan semua cache LocalStorage
  const keysToClean = [
    'uim_digilib_books_cache_v5',
    'uim_digilib_members_cache_v5',
    'uim_digilib_circulation_cache_v5',
    'uim_digilib_ratings_cache_v1',
    'uim_digilib_bookmarks_cache_v1',
    'uim_digilib_staging_cache_v1',
    'uim_digilib_journals_cache_v1',
    'uim_digilib_news_cache_v1',
    'uim_digilib_notifications_cache_v1',
    'uim_digilib_read_notifs_ids_v1',
    'uim_digilib_feedback_cache_v1',
    'uim_digilib_visitor_stats_v2',
    'uim_digilib_visitor_session_v2',
    'uim_digilib_last_visit_date_v2',
    'uim_visitor_stats_v1',
    'uim_visitor_sessions_v1'
  ];

  keysToClean.forEach((k) => {
    try {
      localStorage.removeItem(k);
    } catch (e) {}
  });

  // Reset layanan penghitung pengunjung ke 0
  try {
    await resetVisitorStats();
  } catch (err) {
    console.warn('Gagal reset statistik pengunjung:', err);
  }

  // 2. Jika Cloud Firestore aktif, hapus dokumen koleksi dinamis
  if (isFirebaseConfigured() && db) {
    const collectionsToWipe = ['books', 'loans', 'ratings', 'data_staging', 'academic_journals', 'news', 'notifications', 'feedbacks', 'visitor_logs'];
    for (const colName of collectionsToWipe) {
      try {
        const snap = await getDocs(collection(db, colName));
        for (const docItem of snap.docs) {
          await deleteDoc(doc(db, colName, docItem.id)).catch(() => {});
        }
      } catch (err) {
        console.warn(`Gagal membersihkan koleksi ${colName} di Firestore:`, err);
      }
    }

    // Reset ringkasan statistik agregat visitor_stats/summary ke 0
    try {
      await setDoc(doc(db, 'visitor_stats', 'summary'), {
        todayDate: new Date().toISOString().split('T')[0],
        todayVisitors: 0,
        todayHits: 0,
        totalVisitors: 0,
        totalHits: 0,
        activeOnline: 0,
        activeSessions: {}
      });
    } catch (err) {
      console.warn('Gagal mereset visitor_stats/summary di Firestore:', err);
    }

    // Bersihkan pengguna non-admin di koleksi 'users'
    try {
      const snapUsers = await getDocs(collection(db, 'users'));
      for (const userDoc of snapUsers.docs) {
        const data = userDoc.data();
        if (data.role !== 'admin' && !data.email?.includes('admin') && !data.email?.includes('pustakawan')) {
          await deleteDoc(doc(db, 'users', userDoc.id)).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Gagal membersihkan users non-admin di Firestore:', err);
    }
  }

  return { success: true, message: 'Semua data telah berhasil dibersihkan dan dikosongkan!' };
}

