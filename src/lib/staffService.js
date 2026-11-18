/**
 * ==============================================================================
 * LAYANAN DATA STAF PUSTAKAWAN PERPUSTAKAAN UIM
 * ==============================================================================
 * Terintegrasi Cloud Firestore (koleksi 'library_staff') dan LocalStorage cache.
 * Mendukung fitur CRUD penuh (Tambah, Sunting, Hapus) untuk Admin Pustakawan.
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

const STORAGE_KEY = 'uim_digilib_staff_list_v1';

export const DEFAULT_STAFF = [
  {
    id: 'staff-1',
    nama: 'Lathifah, S.Pd., S.I.Pust., M.SIP',
    jabatan: 'Kepala Perpustakaan',
    gelar: 'S.Pd., S.I.Pust., M.SIP',
    badge: 'Pimpinan UPT',
    inisial: 'LP',
    deskripsi: 'Pengembangan visi keilmuan, penjaminan mutu akreditasi, pengadaan koleksi, dan kerja sama kemitraan antar perpustakaan.'
  },
  {
    id: 'staff-2',
    nama: 'Muqsith, S.Pd',
    jabatan: 'KABAG Sirkulasi',
    gelar: 'Sarjana Pendidikan (S.Pd.)',
    badge: 'Kepala Bagian',
    inisial: 'MS',
    deskripsi: 'Layanan sirkulasi peminjaman, pengembalian, perpanjangan masa pinjam mandiri, dan surat bebas pustaka.'
  },
  {
    id: 'staff-3',
    nama: 'Effatul Azizah',
    jabatan: 'Admin',
    gelar: 'Administrasi & Layanan',
    badge: 'Front Desk & Admin',
    inisial: 'EA',
    deskripsi: 'Administrasi keanggotaan KTM, registrasi mandiri, presensi pengunjung & bantuan layanan pemustaka.'
  }
];

export function getStoredStaff() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STAFF));
      return DEFAULT_STAFF;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_STAFF;
  } catch (e) {
    return DEFAULT_STAFF;
  }
}

export function saveStoredStaff(staffList) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
  } catch (e) {
    console.error('Gagal menyimpan cache staf', e);
  }
}

export async function addStaffMember(staffData) {
  const current = getStoredStaff();
  const newMember = {
    ...staffData,
    id: staffData.id || `staff-${Date.now()}`
  };
  const updated = [...current, newMember];
  saveStoredStaff(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await setDoc(doc(db, 'library_staff', newMember.id), newMember);
    } catch (err) {
      console.warn('Gagal sinkron staf ke Firestore:', err);
    }
  }
  return updated;
}

export async function updateStaffMember(staffId, updatedFields) {
  const current = getStoredStaff();
  const updated = current.map((item) =>
    item.id === staffId ? { ...item, ...updatedFields } : item
  );
  saveStoredStaff(updated);

  if (isFirebaseConfigured() && db) {
    try {
      const target = updated.find((item) => item.id === staffId);
      if (target) {
        await setDoc(doc(db, 'library_staff', staffId), target);
      }
    } catch (err) {
      console.warn('Gagal perbarui staf ke Firestore:', err);
    }
  }
  return updated;
}

export async function deleteStaffMember(staffId) {
  const current = getStoredStaff();
  const updated = current.filter((item) => item.id !== staffId);
  saveStoredStaff(updated);

  if (isFirebaseConfigured() && db) {
    try {
      await deleteDoc(doc(db, 'library_staff', staffId));
    } catch (err) {
      console.warn('Gagal hapus staf di Firestore:', err);
    }
  }
  return updated;
}

export function resetStaffToDefault() {
  saveStoredStaff(DEFAULT_STAFF);
  return DEFAULT_STAFF;
}

export function subscribeStaff(callback) {
  callback(getStoredStaff());

  if (isFirebaseConfigured() && db) {
    try {
      const unsub = onSnapshot(collection(db, 'library_staff'), (snap) => {
        if (!snap.empty) {
          const list = [];
          snap.forEach((d) => list.push({ ...d.data(), id: d.id }));
          saveStoredStaff(list);
          callback(list);
        }
      });
      return unsub;
    } catch (err) {
      console.warn('Gagal pasang listener Firestore library_staff:', err);
    }
  }
  return () => {};
}
