/**
 * ==============================================================================
 * LAYANAN AUTENTIKASI: FIREBASE AUTHENTICATION & PROFIL FIRESTORE
 * ==============================================================================
 * Sesuai Ketetapan Arsitektur:
 * - Autentikasi berbasis Firebase Authentication (Email/Password).
 * - Profil pengguna, role (admin/user), dan status_verifikasi disimpan di Cloud Firestore (koleksi 'users').
 * - TIDAK menyimpan password dalam LocalStorage maupun Firestore.
 * - Sesi pengguna dipulihkan secara otomatis via onAuthStateChanged.
 */

import { auth, db, isFirebaseConfigured } from './firebase';
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
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error('Layanan Firebase Authentication / Firestore belum terkonfigurasi di server.');
  }

  const cleanNim = String(nim || '').trim();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNim}@student.uim.ac.id`;
  const cleanNama = String(nama || '').trim();
  const cleanProdi = String(prodi || '').trim();
  const cleanNoHp = noHp ? String(noHp).trim() : '';

  // 1. Cek apakah NIM sudah pernah didaftarkan di Firestore
  if (cleanNim) {
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

  // 2. Buat akun di Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  // 3. Perbarui nama tampilan di Firebase Auth
  await updateProfile(user, { displayName: cleanNama }).catch(() => {});

  // 4. Buat dokumen profil di koleksi 'users' Firestore
  const profileData = {
    uid: user.uid,
    id: user.uid,
    nama: cleanNama,
    nama_lengkap: cleanNama,
    email: cleanEmail,
    nim: cleanNim,
    prodi: cleanProdi,
    noHp: cleanNoHp,
    role: 'user', // default role: mahasiswa
    status_verifikasi: 'pending', // default pending persetujuan admin pustakawan
    created_at: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', user.uid), profileData);

  // Simpan cache sesi lokal
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profileData));

  return profileData;
}

/**
 * Registrasi Anggota Dosen Sivitas UIM Baru
 * @param {Object} params - { nidn, nama, prodi, email, password }
 */
export async function registerDosen({ nidn, nama, prodi, email, password }) {
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error('Layanan Firebase Authentication / Firestore belum terkonfigurasi di server.');
  }

  const cleanNidn = String(nidn || '').trim();
  const cleanEmail = email ? String(email).trim().toLowerCase() : `${cleanNidn}@uim.ac.id`;
  const cleanNama = String(nama || '').trim();
  const cleanProdi = String(prodi || '').trim();

  // Cek apakah NIDN sudah pernah didaftarkan
  if (cleanNidn) {
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

  const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: cleanNama }).catch(() => {});

  const profileData = {
    uid: user.uid,
    id: user.uid,
    nama: cleanNama,
    nama_lengkap: cleanNama,
    email: cleanEmail,
    nidn: cleanNidn,
    nim: cleanNidn, // untuk kompatibilitas sirkulasi pinjaman
    prodi: cleanProdi,
    role: 'dosen',
    status_verifikasi: 'verified', // dosen otomatis terverifikasi
    created_at: new Date().toISOString()
  };

  await setDoc(doc(db, 'users', user.uid), profileData);
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profileData));
  return profileData;
}

/**
 * Login Khusus Administrator & Pustakawan
 * Kredensial Resmi: username "admin" / "admin@uim.ac.id", password "admin123" atau "admin"
 */
export async function loginAdmin(identifier, password) {
  const cleanId = String(identifier || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  const isDefaultAdmin =
    (cleanId === 'admin' || cleanId === 'admin@uim.ac.id' || cleanId === 'pustakawan' || cleanId === 'pustakawan@uim.ac.id') &&
    (cleanPass === 'admin123' || cleanPass === 'admin' || cleanPass === 'pustakawan123');

  const adminEmail = cleanId.includes('@') ? cleanId : (cleanId === 'pustakawan' ? 'pustakawan@uim.ac.id' : 'admin@uim.ac.id');

  if (isFirebaseConfigured() && auth && db) {
    try {
      // 1. Coba login langsung via Firebase Auth
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
      // Jika akun admin default belum dibuat di Firebase Auth, otomatis buatkan sekarang
      if (isDefaultAdmin && (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential')) {
        try {
          const newAdminCred = await createUserWithEmailAndPassword(auth, adminEmail, cleanPass);
          const newAdminUser = newAdminCred.user;
          const adminProfile = {
            uid: newAdminUser.uid,
            id: newAdminUser.uid,
            nama: 'Administrator Pustakawan UIM',
            email: adminEmail,
            role: 'admin',
            status_verifikasi: 'verified',
            created_at: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', newAdminUser.uid), adminProfile).catch(() => {});
          localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminProfile));
          return adminProfile;
        } catch (createErr) {
          console.warn('Gagal auto-create admin di Firebase Auth, beralih ke sesi aman lokal:', createErr);
        }
      } else if (!isDefaultAdmin) {
        throw err;
      }
    }
  }

  // Fallback sesi aman lokal resmi jika Firebase belum terhubung atau saat pengujian lokal
  if (isDefaultAdmin) {
    const adminSession = {
      uid: 'admin_uim_primary',
      id: 'admin_uim_primary',
      nama: 'Administrator Pustakawan UIM',
      email: adminEmail,
      role: 'admin',
      status_verifikasi: 'verified',
      created_at: new Date().toISOString()
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminSession));
    return adminSession;
  }

  throw new Error('Kredensial staf pustakawan salah. Masuk dengan username: admin, password: admin123');
}

/**
 * Login Anggota atau Admin/Pustakawan
 * @param {string} identifier - Email atau NIM
 * @param {string} password - Password akun
 */
export async function loginUser(identifier, password) {
  if (!isFirebaseConfigured() || !auth || !db) {
    throw new Error('Layanan Firebase Authentication / Firestore belum aktif.');
  }

  let emailToUse = String(identifier || '').trim().toLowerCase();

  // Jika input berupa NIM/NIDN (angka/tanpa tanda @), cari email yang berelasi di Firestore
  if (!emailToUse.includes('@')) {
    try {
      // 1. Cek pencarian via NIM Mahasiswa
      const qNim = query(collection(db, 'users'), where('nim', '==', emailToUse));
      const snapNim = await getDocs(qNim);
      if (!snapNim.empty) {
        const found = snapNim.docs[0].data();
        if (found.email) emailToUse = found.email.toLowerCase();
      } else {
        // 2. Cek pencarian via NIDN Dosen
        const qNidn = query(collection(db, 'users'), where('nidn', '==', emailToUse));
        const snapNidn = await getDocs(qNidn);
        if (!snapNidn.empty) {
          const found = snapNidn.docs[0].data();
          if (found.email) emailToUse = found.email.toLowerCase();
        } else {
          emailToUse = `${emailToUse}@student.uim.ac.id`;
        }
      }
    } catch (e) {
      emailToUse = `${emailToUse}@student.uim.ac.id`;
    }
  }

  // 1. Autentikasi dengan Firebase Auth
  const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
  const user = userCredential.user;

  // 2. Ambil profil pengguna dari Firestore
  let profile = await fetchUserProfile(user.uid);

  // Fallback jika dokumen users belum dibuat sebelumnya
  if (!profile) {
    profile = {
      uid: user.uid,
      id: user.uid,
      nama: user.displayName || user.email.split('@')[0],
      email: user.email,
      role: user.email.includes('pustakawan') || user.email.includes('admin') ? 'admin' : 'user',
      status_verifikasi: 'verified',
      created_at: new Date().toISOString()
    };
    await setDoc(doc(db, 'users', user.uid), profile).catch(() => {});
  }

  // Simpan cache sesi lokal
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));

  return profile;
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
  if (!auth) {
    onUserChanged(getStoredAuthSession());
    return () => {};
  }

  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.uid);
      if (profile) {
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(profile));
        onUserChanged(profile);
      } else {
        const fallback = {
          uid: firebaseUser.uid,
          id: firebaseUser.uid,
          nama: firebaseUser.displayName || firebaseUser.email,
          email: firebaseUser.email,
          role: 'user',
          status_verifikasi: 'verified'
        };
        localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(fallback));
        onUserChanged(fallback);
      }
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      onUserChanged(null);
    }
  });
}

