/**
 * Layanan Pengelolaan Anggota & Autentikasi Perpustakaan UIM
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

const STORAGE_KEY = 'uim_digilib_members_clean_v4';
const RESET_FLAG = 'uim_digilib_members_reset_v4';

// Bersihkan data lama dari browser pengguna
try {
  if (!localStorage.getItem(RESET_FLAG)) {
    localStorage.removeItem('uim_digilib_members');
    localStorage.removeItem('uim_digilib_members_data');
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(RESET_FLAG, 'true');
  }
} catch (e) {}

const INITIAL_MEMBERS = [];

export const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
  nama: 'Staf Pustakawan Pusat UIM',
  email: 'pustakawan@uim.ac.id',
  role: 'admin'
};

export function getStoredMembers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
      return INITIAL_MEMBERS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_MEMBERS;
  }
}

export function saveStoredMembers(members) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  } catch (e) {
    console.error('Gagal menyimpan data anggota ke storage', e);
  }
}

/**
 * Sinkronisasi data anggota langsung dari Firebase Cloud Firestore
 */
export async function syncMembersFromFirebase() {
  if (!isFirebaseConfigured() || !db) return getStoredMembers();
  try {
    const colRef = collection(db, 'members');
    const snapshot = await getDocs(colRef);
    const firestoreMembers = [];
    snapshot.forEach((docSnap) => {
      firestoreMembers.push(docSnap.data());
    });
    if (firestoreMembers.length > 0) {
      saveStoredMembers(firestoreMembers);
      return firestoreMembers;
    }
    return getStoredMembers();
  } catch (error) {
    console.warn('Gagal sinkronisasi anggota dari Firebase:', error);
    return getStoredMembers();
  }
}

export function registerStudentMember({ nim, nama, prodi, email, password, noHp }) {
  const members = getStoredMembers();
  const trimmedNim = String(nim).trim();

  // Validasi apakah NIM sudah terdaftar
  const existing = members.find((m) => String(m.nim).trim() === trimmedNim);
  if (existing) {
    throw new Error(`Nomor KTM / NIM ${trimmedNim} sudah pernah didaftarkan sebelumnya.`);
  }

  const newMember = {
    id: `mhs-${Date.now()}`,
    nim: trimmedNim,
    nama: nama.trim(),
    prodi: prodi.trim(),
    email: email.trim(),
    noHp: noHp ? noHp.trim() : '',
    password,
    role: 'user',
    status: 'pending', // Menunggu Verifikasi Admin Meja Sirkulasi
    registeredAt: new Date().toISOString(),
    verifiedAt: null
  };

  members.unshift(newMember);
  saveStoredMembers(members);

  // Simpan ke Firebase Cloud Firestore jika terhubung
  if (isFirebaseConfigured() && db) {
    try {
      setDoc(doc(db, 'members', newMember.id), newMember).catch((err) => {
        console.warn('Penyimpanan anggota ke Firebase ditunda:', err);
      });
    } catch (e) {}
  }

  return newMember;
}

export function updateMemberStatus(id, newStatus) {
  const members = getStoredMembers();
  const idx = members.findIndex((m) => m.id === id);
  if (idx >= 0) {
    const updated = {
      ...members[idx],
      status: newStatus,
      verifiedAt: newStatus === 'verified' ? new Date().toISOString() : null
    };
    members[idx] = updated;
    saveStoredMembers(members);

    // Update di Firebase Cloud Firestore jika terhubung
    if (isFirebaseConfigured() && db) {
      try {
        updateDoc(doc(db, 'members', id), {
          status: newStatus,
          verifiedAt: updated.verifiedAt
        }).catch((err) => {
          console.warn('Pembaruan status anggota di Firebase ditunda:', err);
        });
      } catch (e) {}
    }

    return members[idx];
  }
  throw new Error('Data anggota tidak ditemukan');
}

export function deleteMember(id) {
  const members = getStoredMembers();
  const filtered = members.filter((m) => m.id !== id);
  saveStoredMembers(filtered);

  // Hapus dari Firebase Cloud Firestore jika terhubung
  if (isFirebaseConfigured() && db) {
    try {
      deleteDoc(doc(db, 'members', id)).catch((err) => {
        console.warn('Penghapusan anggota di Firebase ditunda:', err);
      });
    } catch (e) {}
  }

  return filtered;
}

export function countPendingVerifications() {
  const members = getStoredMembers();
  return members.filter((m) => m.status === 'pending').length;
}

export function clearAllMembers() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  return [];
}

export function authenticateAdmin(arg1, arg2) {
  const username = typeof arg1 === 'object' && arg1 !== null ? arg1.username : arg1;
  const password = typeof arg1 === 'object' && arg1 !== null ? arg1.password : arg2;

  const cleanUser = String(username || '').trim().toLowerCase();
  const cleanPass = String(password || '').trim();

  if (cleanUser === ADMIN_CREDENTIALS.username.toLowerCase() && cleanPass === ADMIN_CREDENTIALS.password) {
    return {
      id: 'admin-1',
      username: ADMIN_CREDENTIALS.username,
      nama: ADMIN_CREDENTIALS.nama,
      email: ADMIN_CREDENTIALS.email,
      role: 'admin'
    };
  }
  throw new Error('Username atau kata sandi pustakawan salah. Masukkan Username: admin dan Kata Sandi: admin');
}

export function authenticateStudent(arg1, arg2) {
  const nim = typeof arg1 === 'object' && arg1 !== null ? arg1.nim : arg1;
  const password = typeof arg1 === 'object' && arg1 !== null ? arg1.password : arg2;

  const members = getStoredMembers();
  const trimmedNim = String(nim || '').trim();
  const trimmedPass = String(password || '').trim();

  const found = members.find((m) => String(m.nim).trim() === trimmedNim);

  if (!found) {
    throw new Error(`Nomor KTM / NIM "${trimmedNim}" belum terdaftar. Silakan daftar mahasiswa baru terlebih dahulu.`);
  }

  if (found.password && String(found.password).trim() !== trimmedPass) {
    throw new Error('Kata sandi yang Anda masukkan salah.');
  }

  if (found.status === 'pending') {
    const err = new Error('Akun Anda masih dalam status Menunggu Verifikasi Admin Pustakawan UIM.');
    err.code = 'PENDING_VERIFICATION';
    err.user = found;
    throw err;
  }

  return found;
}
