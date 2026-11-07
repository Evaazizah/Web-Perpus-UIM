import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

/**
 * Konfigurasi Firebase untuk Web Perpustakaan Digital UIM
 * Terhubung ke Proyek: uim-digilib
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBi9SHAO8FbmSU2TRp2XpmvRQpGdXynMTc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "uim-digilib.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "uim-digilib",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "uim-digilib.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "758579410054",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:758579410054:web:9db68ef8195bb25aad4d07",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-FEXK0PRRQL"
};

export const isFirebaseConfigured = () => {
  return (
    Boolean(firebaseConfig.apiKey) &&
    Boolean(firebaseConfig.projectId) &&
    !firebaseConfig.apiKey.includes('your-')
  );
};

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase Cloud Firestore aktif & terhubung ke:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('⚠️ Inisialisasi Firebase gagal, sistem beralih ke penyimpanan lokal:', error);
  }
}

export { app, db, auth, firebaseConfig };
