/**
 * ==============================================================================
 * LAYANAN AUTENTIKASI: FIREBASE AUTHENTICATION & DIRECT FIRESTORE HYBRID
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur:
 * - Mendukung Firebase Authentication (Email/Password).
 * - Resilient Hybrid Fallback: Jika Firebase Auth belum diaktifkan di Firebase Console
 *   (misal error auth/configuration-not-found), sistem secara otomatis beralih ke
 *   Firestore Cloud Database dengan enkripsi hash SHA-256 kata sandi yang aman.
 * - Profil pengguna, role (admin/dosen/user), dan status_verifikasi disimpan di Cloud Firestore ('users').
 * - Sesi pengguna dipulihkan secara otomatis via subscribeAuthState.
 */

import { auth, db, isFirebaseConfigured } from './firebase';
import { recordNewRegistration } from './memberService';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';

const LOCAL_SESSION_KEY = 'uim_digilib_auth_session_v1';

/**
 * Helper Enkripsi Kata Sandi SHA-256 (Standar Web Crypto Browser)
 */
async function hashPassword(plainText) {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const enc = new TextEncoder();
      const data = enc.encode(plainText || '');
      const hash = await window.crypto.subtle.digest('SHA-256', data);
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    }
  } catch (e) {
    console.warn('Fallback hash generator used:', e);
  }
  // Fallback hash
  let h = 0;
  const s = String(plainText || '');
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return `h_${Math.abs(h)}`;
}

/**
 * Helper: Ambil profil user dari koleksi Firestore 'users'
 */
export async function fetchUserProfile(uid) {
  if (!db || !uid) return null;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return { id: snap.id, uid: snap.id, ...snap.data() };
    }
  } catch (error) {
    console.warn('Gagal mengambil profil Firestore untuk uid:', uid, error);
  }
  return null;
}

/**
 * Registrasi Anggota Mahasiswa Baru
 * @param {Object} params - { email, password, nama, nim, prodi, noHp }
 */
export async function registerMember({ email, password, nama, nim, prodi, noHp }) {
  const cleanNim = String(nim || '').trim();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNim}@student.uim.ac.id`;
  const cleanNama = String(nama || '').trim();
  const cleanProdi = String(prodi || '').trim();
  const cleanNoHp = noHp ? String(noHp).trim() : '';

  // 1. Cek apakah NIM sudah pernah didaftarkan di Firestore
  if (cleanNim && db) {
    try {
      const q = query(collection(db, 'users'), where('nim', '==', cleanNim));
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        throw new Error(`NIM / KTM ${cleanNim} sudah terdaftar dalam sistem perpustakaan.`);
      }
    } catch (e) {
      if (e.message && e.message.includes('sudah terdaftar')) throw e;
    }
  }

  let firebaseUser = null;
  let usedFirebaseAuth = false;

  // 2. Coba buat akun di Firebase Authentication jika tersedia
  if (auth && isFirebaseConfigured()) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUser = userCredential.user;
      usedFirebaseAuth = true;
      await updateProfile(firebaseUser, { displayName: cleanNama }).catch(() => {});
      // PENTING: createUserWithEmailAndPassword otomatis men-sign-in akun!
      // Karena status akun adalah 'pending' verifikasi admin, sign out seketika agar tidak auto-login.
      await firebaseSignOut(auth).catch(() => {});
    } catch (fbErr) {
      console.warn('Firebase Auth create user info:', fbErr.code, fbErr.message);
      if (fbErr.code === 'auth/email-already-in-use') {
        throw new Error(`Alamat email atau KTM ${cleanNim} sudah terdaftar.`);
      } else if (fbErr.code === 'auth/weak-password') {
        throw new Error('Kata sandi terlalu pendek (minimal 6 karakter).');
      }
      // Untuk error auth/configuration-not-found atau network, beralih ke Firestore Direct
    }
  }

  // 3. Simpan data anggota ke Firestore Cloud
  const passHash = await hashPassword(password);
  const uidToUse = (usedFirebaseAuth && firebaseUser) ? firebaseUser.uid : `stu_${cleanNim || Date.now()}`;

  const profileData = {
    uid: uidToUse,
    id: uidToUse,
    nama: cleanNama,
    nama_lengkap: cleanNama,
    email: cleanEmail,
    nim: cleanNim,
    prodi: cleanProdi,
    noHp: cleanNoHp,
    role: 'user', // default role: mahasiswa
    status_verifikasi: 'pending', // default pending persetujuan admin pustakawan
    status: 'pending',
    auth_mode: usedFirebaseAuth ? 'firebase_auth' : 'firestore_direct',
    password_hash: passHash,
    created_at: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'users', uidToUse), profileData);
    } catch (dbErr) {
      console.warn('Simpan profil Firestore gagal:', dbErr);
    }
  }

  // Catat pendaftaran ke antrean verifikasi lokal admin (jangan simpan sesi login aktif!)
  recordNewRegistration(profileData);
  localStorage.removeItem(LOCAL_SESSION_KEY);
  return profileData;
}

/**
 * Registrasi Anggota Dosen Sivitas UIM Baru
 * @param {Object} params - { nidn, nama, prodi, email, password }
 */
export async function registerDosen({ nidn, nama, prodi, email, password }) {
  const cleanNidn = String(nidn || '').trim();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNidn}@uim.ac.id`;
  const cleanNama = String(nama || '').trim();
  const cleanProdi = String(prodi || '').trim();

  // 1. Cek apakah NIDN sudah pernah didaftarkan di Firestore
  if (cleanNidn && db) {
    try {
      const q = query(collection(db, 'users'), where('nidn', '==', cleanNidn));
      const existingSnap = await getDocs(q);
      if (!existingSnap.empty) {
        throw new Error(`NIDN / NIP ${cleanNidn} sudah terdaftar dalam sistem perpustakaan.`);
      }
    } catch (e) {
      if (e.message && e.message.includes('sudah terdaftar')) throw e;
    }
  }

  let firebaseUser = null;
  let usedFirebaseAuth = false;

  // 2. Coba buat akun di Firebase Authentication jika aktif
  if (auth && isFirebaseConfigured()) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      firebaseUser = userCredential.user;
      usedFirebaseAuth = true;
      await updateProfile(firebaseUser, { displayName: cleanNama }).catch(() => {});
      // PENTING: Sign out seketika agar akun dosen yang baru mendaftar tidak otomatis login sebelum diverifikasi
      await firebaseSignOut(auth).catch(() => {});
    } catch (fbErr) {
      console.warn('Firebase Auth Dosen info:', fbErr.code, fbErr.message);
      if (fbErr.code === 'auth/email-already-in-use') {
        throw new Error(`Nomor NIDN / Email ${cleanEmail} sudah terdaftar.`);
      } else if (fbErr.code === 'auth/weak-password') {
        throw new Error('Kata sandi terlalu pendek (minimal 6 karakter).');
      }
      // Jika konfigurasi auth konsol belum aktif, sistem beralih otomatis ke basis data Firestore
    }
  }

  // 3. Simpan data Dosen ke Firestore Cloud
  const passHash = await hashPassword(password);
  const uidToUse = (usedFirebaseAuth && firebaseUser) ? firebaseUser.uid : `dos_${cleanNidn || Date.now()}`;

  const profileData = {
    uid: uidToUse,
    id: uidToUse,
    nama: cleanNama,
    nama_lengkap: cleanNama,
    email: cleanEmail,
    nidn: cleanNidn,
    nim: cleanNidn, // untuk kompatibilitas sirkulasi pinjaman
    prodi: cleanProdi,
    role: 'dosen',
    status_verifikasi: 'pending', // Butuh verifikasi admin pustakawan UIM
    status: 'pending',
    auth_mode: usedFirebaseAuth ? 'firebase_auth' : 'firestore_direct',
    password_hash: passHash,
    created_at: new Date().toISOString()
  };

  if (db) {
    try {
      await setDoc(doc(db, 'users', uidToUse), profileData);
    } catch (dbErr) {
      console.warn('Simpan profil Dosen Firestore gagal:', dbErr);
    }
  }

  // Catat ke antrean keanggotaan admin (jangan simpan sesi login aktif!)
  recordNewRegistration(profileData);
  localStorage.removeItem(LOCAL_SESSION_KEY);
  return profileData;
}

/**
 * Login Khusus Administrator & Pustakawan
 * Kredensial Resmi: username "admin" / "admin@uim.ac.id", password "admin123"
 */
export async function loginAdmin(identifier, password) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  const isDefaultAdmin =
    (cleanId === 'admin' || cleanId === 'admin@uim.ac.id' || cleanId === 'pustakawan' || cleanId === 'pustakawan@uim.ac.id') &&
    (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'pustakawan123');

  const adminEmail = cleanId.includes('@') ? cleanId : (cleanId === 'pustakawan' ? 'pustakawan@uim.ac.id' : 'admin@uim.ac.id');

  // 1. Coba login melalui Firebase Auth jika terkonfigurasi
  if (isFirebaseConfigured() && auth && db) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, adminEmail, cleanPass);
      const user = userCredential.user;
      let profile = await fetchUserProfile(user.uid);
      if (!profile || profile.role !== 'admin') {
        profile = {
          uid: user.uid,
          id: user.uid,
          nama: 'Administrator Pustakawan UIM',
          email: adminEmail,
          role: 'admin',
          status_verifikasi: 'verified',
          created_at: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), profile).catch(() => {});
      }
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    } catch (err) {
      // Jika akun admin bawaan belum ada di Firebase Auth atau auth provider belum aktif,
      // lanjutkan dengan fallback resmi admin bawaan
      if (isDefaultAdmin) {
        console.info('Menggunakan sesi terverifikasi admin resmi UIM.');
      } else {
        throw new Error('Kredensial admin salah. Masuk dengan username: admin, kata sandi: admin123');
      }
    }
  }

  // 2. Fallback sesi resmi pustakawan
  if (isDefaultAdmin) {
    const adminSession = {
      uid: 'admin_uim_primary',
      id: 'admin_uim_primary',
      nama: 'Administrator Pustakawan UIM',
      email: adminEmail,
      role: 'admin',
      status_verifikasi: 'verified',
      auth_mode: 'direct_admin',
      created_at: new Date().toISOString()
    };
    if (db) {
      await setDoc(doc(db, 'users', 'admin_uim_primary'), adminSession).catch(() => {});
    }
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
    return adminSession;
  }

  throw new Error('Kredensial staf pustakawan salah. Masuk dengan username: admin, kata sandi: admin123');
}

/**
 * Login Anggota (Mahasiswa / Dosen)
 * @param {string} identifier - Email, NIM, atau NIDN
 * @param {string} password - Password akun
 */
export async function loginUser(identifier, password) {
  const cleanId = String(identifier || '').trim();
  const cleanPass = String(password || '').trim();

  if (!cleanId || !cleanPass) {
    throw new Error('Silakan masukkan nomor identitas / email dan kata sandi.');
  }

  // 1. Cari data pengguna di Firestore berdasarkan NIM, NIDN, atau Email
  let targetUser = null;
  if (db) {
    try {
      // Cari NIM
      let q = query(collection(db, 'users'), where('nim', '==', cleanId));
      let snap = await getDocs(q);
      if (snap.empty) {
        // Cari NIDN
        q = query(collection(db, 'users'), where('nidn', '==', cleanId));
        snap = await getDocs(q);
      }
      if (snap.empty) {
        // Cari Email
        q = query(collection(db, 'users'), where('email', '==', cleanId.toLowerCase()));
        snap = await getDocs(q);
      }
      if (!snap.empty) {
        targetUser = { id: snap.docs[0].id, ...snap.docs[0].data() };
      }
    } catch (e) {
      console.warn('Pencarian akun di Firestore:', e);
    }
  }

  // 2. Coba autentikasi Firebase Auth jika tersedia
  const emailToTry = targetUser?.email || (cleanId.includes('@') ? cleanId.toLowerCase() : `${cleanId}@student.uim.ac.id`);
  if (auth && isFirebaseConfigured()) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToTry, cleanPass);
      const user = userCredential.user;
      let profile = await fetchUserProfile(user.uid);
      if (!profile) {
        profile = targetUser || {
          uid: user.uid,
          id: user.uid,
          nama: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: 'user',
          status_verifikasi: 'pending',
          status: 'pending',
          created_at: new Date().toISOString()
        };
        if (db) await setDoc(doc(db, 'users', user.uid), profile).catch(() => {});
      }

      // Validasi Status Verifikasi Anggota (Mahasiswa & Dosen)
      if (profile.role !== 'admin') {
        const statusVerif = profile.status_verifikasi || profile.status || 'pending';
        if (statusVerif === 'pending') {
          await firebaseSignOut(auth).catch(() => {});
          localStorage.removeItem(LOCAL_SESSION_KEY);
          return { ...profile, status_verifikasi: 'pending', status: 'pending' };
        }
        if (statusVerif === 'rejected') {
          await firebaseSignOut(auth).catch(() => {});
          localStorage.removeItem(LOCAL_SESSION_KEY);
          throw new Error('Pendaftaran akun Anda telah ditolak oleh admin pustakawan. Silakan hubungi meja sirkulasi perpustakaan.');
        }
      }

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
      return profile;
    } catch (fbErr) {
      if (fbErr.message && (fbErr.message.includes('ditolak') || fbErr.message.includes('menunggu verifikasi'))) {
        throw fbErr;
      }
      console.warn('Firebase Auth login note:', fbErr.code);
      // Jika error konfigurasi atau user belum di Firebase Auth, periksa verifikasi Firestore Direct
    }
  }

  // 3. Verifikasi Kata Sandi via Firestore Cloud (Fallback Direct)
  if (targetUser) {
    const inputHash = await hashPassword(cleanPass);
    const passMatches = targetUser.password_hash
      ? targetUser.password_hash === inputHash
      : (targetUser.password ? targetUser.password === cleanPass : true);

    if (passMatches) {
      // Validasi Status Verifikasi Anggota (Mahasiswa & Dosen)
      if (targetUser.role !== 'admin') {
        const statusVerif = targetUser.status_verifikasi || targetUser.status || 'pending';
        if (statusVerif === 'pending') {
          localStorage.removeItem(LOCAL_SESSION_KEY);
          return { ...targetUser, status_verifikasi: 'pending', status: 'pending' };
        }
        if (statusVerif === 'rejected') {
          localStorage.removeItem(LOCAL_SESSION_KEY);
          throw new Error('Pendaftaran akun Anda telah ditolak oleh admin pustakawan. Silakan hubungi meja sirkulasi perpustakaan.');
        }
      }

      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(targetUser));
      return targetUser;
    } else {
      throw new Error('NIM / NIDN atau kata sandi tidak cocok.');
    }
  }

  throw new Error('Akun belum terdaftar. Silakan lakukan pendaftaran anggota terlebih dahulu.');
}

/**
 * Logout dari sesi aktif
 */
export async function logoutUser() {
  localStorage.removeItem(LOCAL_SESSION_KEY);
  if (auth) {
    await firebaseSignOut(auth).catch(() => {});
  }
}

/**
 * Ambil sesi yang tersimpan di LocalStorage (Offline Resilience)
 */
export function getStoredAuthSession() {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Listener Perubahan Status Sesi Pengguna secara Real-Time
 * @param {Function} onUserChanged - callback (userProfile | null)
 * @returns {Function} unsubscribe function
 */
export function subscribeAuthState(onUserChanged) {
  // 1. Pulihkan sesi tersimpan seketika (hanya jika akun terverifikasi atau admin)
  const stored = getStoredAuthSession();
  if (stored) {
    const isVerified = stored.role === 'admin' || (stored.status_verifikasi || stored.status) === 'verified';
    if (isVerified) {
      onUserChanged(stored);
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      onUserChanged(null);
    }
  }

  if (!auth) {
    return () => {};
  }

  // 2. Hubungkan dengan Firebase Auth state change
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        const isVerified = profile.role === 'admin' || (profile.status_verifikasi || profile.status) === 'verified';
        if (isVerified) {
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
          onUserChanged(profile);
        } else {
          // Akun berstatus pending verifikasi atau rejected: cegah login otomatis
          localStorage.removeItem(LOCAL_SESSION_KEY);
          await firebaseSignOut(auth).catch(() => {});
          onUserChanged(null);
        }
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        await firebaseSignOut(auth).catch(() => {});
        onUserChanged(null);
      }
    } else {
      // PENTING: Jangan hapus sesi jika pengguna masuk via mode Firestore Direct atau Admin lokal
      const currentStored = getStoredAuthSession();
      if (
        currentStored &&
        (currentStored.auth_mode === 'firestore_direct' ||
          currentStored.auth_mode === 'direct_admin' ||
          currentStored.role === 'admin' ||
          currentStored.uid === 'admin_uim_primary') &&
        (currentStored.role === 'admin' || (currentStored.status_verifikasi || currentStored.status) === 'verified')
      ) {
        onUserChanged(currentStored);
      } else {
        localStorage.removeItem(LOCAL_SESSION_KEY);
        onUserChanged(null);
      }
    }
  });
}
