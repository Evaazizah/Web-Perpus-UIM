/**
 * ==============================================================================
 * LAYANAN KEANGGOTAAN MAHASISWA (KTM) & VERIFIKASI PUSTAKAWAN
 * ==============================================================================
 * Sesuai Ketetapan Keamanan:
 * - Sumber data utama: Cloud Firestore koleksi 'users' (profil pengguna).
 * - TIDAK menyimpan password dalam LocalStorage maupun Firestore.
 * - Menghapus akun admin hardcoded (menggunakan Firebase Authentication).
 * - Mengelola status verifikasi KTM mahasiswa ('pending' | 'verified' | 'rejected').
 */

import { db, isFirebaseConfigured } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

const STORAGE_KEY = 'uim_digilib_members_cache_v5';

// Data Anggota Demonstrasi Awal (tanpa password)
export const INITIAL_MEMBERS = [
  {
    id: 'mhs-demo-1',
    uid: 'mhs-demo-1',
    nim: '202201001',
    nama: 'Achmad Fauzi',
    prodi: 'Teknik Informatika (Fakultas Teknik)',
    email: 'achmad.fauzi@student.uim.ac.id',
    role: 'user',
    status: 'verified',
    status_verifikasi: 'verified',
    registeredAt: '2026-11-01',
    verifiedAt: '2026-11-02'
  },
  {
    id: 'mhs-demo-2',
    uid: 'mhs-demo-2',
    nim: '202201002',
    nama: 'Siti Nurhaliza',
    prodi: 'Sistem Informasi (Fakultas Teknik)',
    email: 'siti.nur@student.uim.ac.id',
    role: 'user',
    status: 'verified',
    status_verifikasi: 'verified',
    registeredAt: '2026-11-03',
    verifiedAt: '2026-11-03'
  },
  {
    id: 'mhs-demo-3',
    uid: 'mhs-demo-3',
    nim: '202301045',
    nama: 'Bambang Irawan',
    prodi: 'Pendidikan Agama Islam (FTI)',
    email: 'bambang.i@student.uim.ac.id',
    role: 'user',
    status: 'pending',
    status_verifikasi: 'pending',
    registeredAt: '2026-11-09',
    verifiedAt: null
  }
];

export function getStoredMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveStoredMembers(members) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Gagal menyimpan cache anggota', e);
  }
}

/**
 * Catat pendaftaran anggota baru (Mahasiswa atau Dosen) ke cache lokal agar langsung terlihat di antrean verifikasi
 */
export function recordNewRegistration(profileData) {
  if (!profileData) return;
  const members = getStoredMembers();
  const id = profileData.id || profileData.uid || `user_${Date.now()}`;
  const cleanNim = profileData.nim || profileData.nidn || '';
  const idx = members.findIndex(
    (m) =>
      String(m.id) === String(id) ||
      String(m.uid) === String(id) ||
      (cleanNim && (m.nim === cleanNim || m.nidn === cleanNim))
  );

  const entry = {
    id,
    uid: id,
    nama: profileData.nama || profileData.nama_lengkap || 'Anggota',
    nama_lengkap: profileData.nama_lengkap || profileData.nama || 'Anggota',
    email: profileData.email || '',
    nim: profileData.nim || profileData.nidn || '',
    nidn: profileData.nidn || '',
    prodi: profileData.prodi || '-',
    role: profileData.role || 'user',
    status: profileData.status_verifikasi || 'pending',
    status_verifikasi: profileData.status_verifikasi || 'pending',
    registeredAt: profileData.created_at || new Date().toISOString(),
    verifiedAt: null
  };

  if (idx >= 0) {
    members[idx] = { ...members[idx], ...entry };
  } else {
    members.unshift(entry);
  }

  saveStoredMembers(members);
}

/**
 * Sinkronisasi data anggota langsung dari Firebase Cloud Firestore (koleksi 'users')
 */
export async function syncMembersFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredMembers();

  try {
    const colRef = collection(db, 'users');
    const snapshot = await getDocs(colRef);
    const firestoreMembers = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Standarisasi field status / status_verifikasi
      firestoreMembers.push({
        id: docSnap.id,
        uid: docSnap.id,
        ...data,
        status: data.status_verifikasi || data.status || 'pending'
      });
    });

    saveStoredMembers(firestoreMembers);
    return firestoreMembers;
  } catch (error) {
    console.warn('Gagal sinkronisasi anggota dari Firestore:', error);
  }

  return getStoredMembers();
}

/**
 * Memperbarui status verifikasi KTM mahasiswa ('verified' | 'rejected')
 */
export async function updateMemberStatus(id, newStatus) {
  const members = getStoredMembers();
  const cleanId = String(id);
  const idx = members.findIndex((m) => String(m.id) === cleanId || String(m.uid) === cleanId);

  if (idx >= 0) {
    const now = new Date().toISOString();
    const updated = {
      ...members[idx],
      status: newStatus,
      status_verifikasi: newStatus,
      verifiedAt: newStatus === 'verified' ? now : null
    };

    members[idx] = updated;
    saveStoredMembers(members);

    // Update di Cloud Firestore
    if (isFirebaseConfigured() && db) {
      try {
        await updateDoc(doc(db, 'users', cleanId), {
          status: newStatus,
          status_verifikasi: newStatus,
          verifiedAt: updated.verifiedAt
        });
      } catch (err) {
        console.warn('Pembaruan status anggota di Firestore ditunda:', err);
      }
    }

    return members[idx];
  }
  throw new Error('Data anggota tidak ditemukan');
}

/**
 * Hapus Anggota
 */
export async function deleteMember(id) {
  const members = getStoredMembers();
  const cleanId = String(id);
  const filtered = members.filter((m) => String(m.id) !== cleanId && String(m.uid) !== cleanId);
  saveStoredMembers(filtered);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'users', cleanId));
    } catch (e) {}
  }

  return filtered;
}

/**
 * Hitung Jumlah Mahasiswa yang Menunggu Verifikasi KTM
 */
export function countPendingVerifications() {
  const members = getStoredMembers();
  return members.filter((m) => (m.status_verifikasi || m.status) === 'pending').length;
}

/**
 * Listener Real-time Data Keanggotaan
 */
export function subscribeMembers(callback) {
  callback(getStoredMembers());

  if (!isFirebaseConfigured() || !db) return () => {};

  try {
    const colRef = collection(db, 'users');
    return onSnapshot(colRef, (snapshot) => {
      const live = [];
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        live.push({
          id: docSnap.id,
          uid: docSnap.id,
          ...d,
          status: d.status_verifikasi || d.status || 'pending'
        });
      });
      saveStoredMembers(live);
      callback(live);
    }, (e) => {
      console.warn('Listener Firestore members error:', e);
    });
  } catch (e) {
    return () => {};
  }
}

/**
 * Tambah / Daftarkan Anggota Baru dari Panel Admin (Pustakawan)
 */
export async function registerStudentMember(memberData) {
  const members = getStoredMembers();
  const id = memberData.nim ? `uim_${memberData.nim}` : `user_${Date.now()}`;
  const now = new Date().toISOString();

  const newMember = {
    id,
    uid: id,
    nama: memberData.nama,
    nama_lengkap: memberData.nama,
    email: memberData.email || `${memberData.nim || 'mhs'}@student.uim.ac.id`,
    nim: memberData.nim || '',
    prodi: memberData.prodi || 'Umum',
    role: 'mahasiswa',
    status: 'verified',
    status_verifikasi: 'verified',
    created_at: now
  };

  members.unshift(newMember);
  saveStoredMembers(members);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'users', id), {
        uid: id,
        nama_lengkap: newMember.nama_lengkap,
        nama: newMember.nama,
        email: newMember.email,
        nim: newMember.nim,
        prodi: newMember.prodi,
        role: newMember.role,
        status_verifikasi: newMember.status_verifikasi,
        status: newMember.status,
        created_at: now
      });
    } catch (err) {
      console.warn('Gagal menyimpan anggota ke Firestore:', err);
    }
  }

  return newMember;
}

export function clearAllMembers() {
  saveStoredMembers([]);
  return [];
}
