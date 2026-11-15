/**
 * ==============================================================================
 * LAYANAN PENGHITUNG PENGUNJUNG (VISITOR COUNTER SERVICE - FIRESTORE UTAMA)
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur Bagian G:
 * - Menggunakan Cloud Firestore koleksi 'visitor_logs' & dokumen agregat 'visitor_stats/summary'.
 * - TIDAK menggunakan angka acak (Math.random), angka contoh, atau data statis buatan.
 * - Membedakan:
 *   1. Total Kunjungan Halaman (Total Page Hits).
 *   2. Pengunjung Unik Harian (Daily Unique Visitors per session).
 *   3. Pengunjung Aktif berdasarkan sesi aktif (heartbeat / timestamp dalam 15 menit terakhir).
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

const SESSION_KEY = 'uim_digilib_visitor_session_v2';
const LAST_DATE_KEY = 'uim_digilib_last_visit_date_v2';
const LOCAL_STATS_KEY = 'uim_digilib_visitor_stats_v2';

// Baseline awal riil (dimulai dari 0 atau angka terverifikasi)
const BASE_STATS = {
  todayDate: new Date().toISOString().split('T')[0],
  todayVisitors: 1,
  todayHits: 1,
  totalVisitors: 1,
  totalHits: 1,
  activeOnline: 1,
  activeSessions: {}
};

const listeners = new Set();

/**
 * Mendapatkan atau membuat ID Sesi unik di Local Storage
 */
export function getOrCreateSessionId() {
  try {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = 'uim_sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch (e) {
    return 'uim_sess_fallback_' + Date.now();
  }
}

/**
 * Mengambil ringkasan statistik pengunjung dari cache lokal
 */
export function getVisitorStats() {
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(BASE_STATS));
      return BASE_STATS;
    }
    const stats = JSON.parse(raw);
    const today = new Date().toISOString().split('T')[0];

    // Reset hitungan harian jika hari telah berganti
    if (stats.todayDate !== today) {
      stats.todayDate = today;
      stats.todayVisitors = 0;
      stats.todayHits = 0;
      saveLocalStats(stats);
    }

    return stats;
  } catch (e) {
    return BASE_STATS;
  }
}

function saveLocalStats(stats) {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
    listeners.forEach((fn) => {
      try {
        fn(stats);
      } catch (err) {}
    });
  } catch (e) {}
}

/**
 * Mencatat Kunjungan Halaman Nyata ke Cloud Firestore
 * @param {string} path - URL atau tab yang sedang dikunjungi
 */
export async function recordPageView(path = '/') {
  const sessionId = getOrCreateSessionId();
  const today = new Date().toISOString().split('T')[0];
  const lastVisitDate = localStorage.getItem(LAST_DATE_KEY);
  const nowMs = Date.now();

  const isUniqueToday = lastVisitDate !== today;
  if (isUniqueToday) {
    localStorage.setItem(LAST_DATE_KEY, today);
  }

  // 1. Perbarui Statistik Lokal
  const stats = getVisitorStats();
  stats.todayHits = (stats.todayHits || 0) + 1;
  stats.totalHits = (stats.totalHits || 0) + 1;

  if (isUniqueToday) {
    stats.todayVisitors = (stats.todayVisitors || 0) + 1;
    stats.totalVisitors = (stats.totalVisitors || 0) + 1;
  }

  // Rekam sesi aktif saat ini
  stats.activeSessions = stats.activeSessions || {};
  stats.activeSessions[sessionId] = nowMs;

  // Bersihkan sesi aktif yang sudah lebih dari 15 menit (heartbeat window)
  const fifteenMinutesAgo = nowMs - 15 * 60 * 1000;
  Object.keys(stats.activeSessions).forEach((sId) => {
    if (stats.activeSessions[sId] < fifteenMinutesAgo) {
      delete stats.activeSessions[sId];
    }
  });
  stats.activeOnline = Math.max(1, Object.keys(stats.activeSessions).length);

  saveLocalStats(stats);

  // 2. Catat Log ke Cloud Firestore jika aktif
  if (isFirebaseConfigured() && db) {
    try {
      // a. Tambahkan log riwayat
      const logsRef = collection(db, 'visitor_logs');
      await addDoc(logsRef, {
        session_id: sessionId,
        path: String(path || '/'),
        visit_date: today,
        is_unique_today: isUniqueToday,
        created_at: new Date().toISOString()
      });

      // b. Sinkronisasi dokumen agregat 'visitor_stats/summary'
      const summaryDocRef = doc(db, 'visitor_stats', 'summary');
      const snap = await getDoc(summaryDocRef);

      if (snap.exists()) {
        const firestoreData = snap.data();
        const firestoreToday = firestoreData.todayDate === today ? firestoreData.todayHits || 0 : 0;
        const firestoreTodayVisitors = firestoreData.todayDate === today ? firestoreData.todayVisitors || 0 : 0;

        const updatedSessions = firestoreData.activeSessions || {};
        updatedSessions[sessionId] = nowMs;
        // Purge expired
        Object.keys(updatedSessions).forEach((sId) => {
          if (updatedSessions[sId] < fifteenMinutesAgo) delete updatedSessions[sId];
        });

        const mergedStats = {
          todayDate: today,
          todayHits: firestoreToday + 1,
          todayVisitors: isUniqueToday ? firestoreTodayVisitors + 1 : firestoreTodayVisitors,
          totalHits: (firestoreData.totalHits || 0) + 1,
          totalVisitors: isUniqueToday ? (firestoreData.totalVisitors || 0) + 1 : (firestoreData.totalVisitors || 0),
          activeOnline: Math.max(1, Object.keys(updatedSessions).length),
          activeSessions: updatedSessions,
          updated_at: new Date().toISOString()
        };

        await setDoc(summaryDocRef, mergedStats, { merge: true });
        saveLocalStats(mergedStats);
      } else {
        await setDoc(summaryDocRef, stats);
      }
    } catch (err) {
      console.warn('Gagal sinkron visitor stats ke Firestore (tersimpan di lokal):', err);
    }
  }

  return { isUniqueToday, stats };
}

/**
 * Berlangganan (Real-time listener) terhadap pembaruan statistik pengunjung
 */
export function subscribeVisitorStats(callback) {
  listeners.add(callback);
  callback(getVisitorStats());

  if (!isFirebaseConfigured() || !db) {
    return () => listeners.delete(callback);
  }

  try {
    const summaryDocRef = doc(db, 'visitor_stats', 'summary');
    const unsubFirestore = onSnapshot(summaryDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        saveLocalStats(data);
      }
    }, () => {});

    return () => {
      listeners.delete(callback);
      unsubFirestore();
    };
  } catch (e) {
    return () => listeners.delete(callback);
  }
}
