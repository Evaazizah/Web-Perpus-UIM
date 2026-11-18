import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  CheckCircle2,
  Users,
  FileCheck,
  Building2,
  MapPin,
  Mail,
  Phone,
  BookOpen,
  Award,
  Clock,
  Sparkles,
  ExternalLink,
  Instagram,
  Globe,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  RotateCcw,
  Check,
  AlertTriangle,
  Scale,
  FileText
} from 'lucide-react';
import UimLogo from './UimLogo';
import {
  getStoredStaff,
  subscribeStaff,
  addStaffMember,
  updateStaffMember,
  deleteStaffMember,
  resetStaffToDefault
} from '../lib/staffService';

export default function ProfileModal({
  isOpen,
  onClose,
  initialTab = 'visi', // 'visi' | 'pustakawan' | 'tatatertib'
  currentUser
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [staffList, setStaffList] = useState(() => getStoredStaff());

  // State Form Modal Tambah / Edit Staf untuk Admin
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState(null); // null = tambah baru, id = sunting
  const [staffFormData, setStaffFormData] = useState({
    nama: '',
    jabatan: '',
    gelar: '',
    badge: 'Staf Perpustakaan',
    inisial: '',
    deskripsi: ''
  });
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'struktur' ? 'pustakawan' : initialTab || 'visi');
      setStaffList(getStoredStaff());
      const unsub = subscribeStaff((data) => {
        setStaffList(data);
      });
      return () => unsub();
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const missionList = [
    {
      no: 1,
      text: 'Melayani seluruh civitas akademika di lingkungan UIM Pamekasan untuk mendapatkan informasi buku-buku dan bahan bacaan yang representatif.'
    },
    {
      no: 2,
      text: 'Melayani masyarakat Pamekasan untuk mendapatkan informasi buku-buku dan bacaan yang representatif.'
    },
    {
      no: 3,
      text: 'Mengembangkan sumber daya pustakawan dan bahan bacaan agar menjadi alternative perpustakaan yang representatif.'
    },
    {
      no: 4,
      text: 'Mengelola sumber informasi dan bahan -bahan bacaan berbasis komputer.'
    },
    {
      no: 5,
      text: 'Melakukan kerja sama antar perpustakaan.'
    }
  ];

  // ================= HANDLERS ADMIN CRUD STAF =================
  const handleOpenAddModal = () => {
    setEditingStaffId(null);
    setStaffFormData({
      nama: '',
      jabatan: '',
      gelar: '',
      badge: 'Staf Layanan',
      inisial: '',
      deskripsi: ''
    });
    setIsStaffFormOpen(true);
  };

  const handleOpenEditModal = (staff) => {
    setEditingStaffId(staff.id);
    setStaffFormData({
      nama: staff.nama || '',
      jabatan: staff.jabatan || '',
      gelar: staff.gelar || '',
      badge: staff.badge || 'Staf Perpustakaan',
      inisial: staff.inisial || '',
      deskripsi: staff.deskripsi || ''
    });
    setIsStaffFormOpen(true);
  };

  const handleSaveStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffFormData.nama || !staffFormData.jabatan) {
      alert('Nama dan jabatan staf wajib diisi!');
      return;
    }

    // Auto-generate inisial jika kosong
    let inisialFinal = staffFormData.inisial?.trim().toUpperCase();
    if (!inisialFinal) {
      const parts = staffFormData.nama.replace(/[^a-zA-Z\s]/g, '').trim().split(/\s+/);
      inisialFinal = parts.length > 1
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0]?.slice(0, 2).toUpperCase() || 'ST';
    }

    const payload = {
      ...staffFormData,
      inisial: inisialFinal
    };

    if (editingStaffId) {
      await updateStaffMember(editingStaffId, payload);
      setFeedbackNotice('Data staf berhasil diperbarui!');
    } else {
      await addStaffMember(payload);
      setFeedbackNotice('Staf baru berhasil ditambahkan!');
    }

    setIsStaffFormOpen(false);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  const handleDeleteStaff = async (staffId, nama) => {
    if (window.confirm(`Yakin ingin menghapus staf "${nama}" dari daftar perpustakaan?`)) {
      await deleteStaffMember(staffId);
      setFeedbackNotice(`Staf "${nama}" telah dihapus.`);
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  const handleResetStaff = () => {
    if (window.confirm('Kembalikan daftar staf ke data bawaan resmi (Lathifah, Muqsith, Effatul Azizah)?')) {
      resetStaffToDefault();
      setFeedbackNotice('Daftar staf dikembalikan ke data resmi!');
      setTimeout(() => setFeedbackNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp">
        
        {/* ================= MODAL HEADER ================= */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#059669] text-white p-5 sm:p-6 relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-emerald-100 hover:text-white hover:bg-white/10 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
              <UimLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Profil Resmi Lembaga</span>
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-400/30 text-[10px] font-mono font-bold">
                  NPP: 3528042D2014426
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight font-serif text-white">
                PERPUSTAKAAN PUSAT
              </h2>
              <h3 className="text-xs sm:text-sm font-semibold text-emerald-100 tracking-wide">
                UNIVERSITAS ISLAM MADURA
              </h3>
              <p className="text-[11px] text-emerald-200/90 italic mt-0.5 font-medium">
                “Buka Lembaran Baru, Jelajahi Ilmu Tanpa Batas”
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs (3 Tab Utama: Visi Misi, Staf Pustakawan, Tata Tertib) */}
          <div className="mt-5 flex items-center gap-1.5 bg-black/20 p-1 rounded-xl text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('visi')}
              className={`flex-1 min-w-[110px] py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                activeTab === 'visi'
                  ? 'bg-white text-[#047857] shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Visi & Misi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pustakawan')}
              className={`flex-1 min-w-[125px] py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                activeTab === 'pustakawan'
                  ? 'bg-white text-[#047857] shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staf Pustakawan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tatatertib')}
              className={`flex-1 min-w-[130px] py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all text-xs ${
                activeTab === 'tatatertib'
                  ? 'bg-white text-[#047857] shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Ketentuan Sirkulasi</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert Notice */}
        {feedbackNotice && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center gap-2 animate-fadeIn shrink-0">
            <Check className="w-4 h-4" />
            <span>{feedbackNotice}</span>
          </div>
        )}

        {/* ================= MODAL BODY ================= */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs sm:text-sm">
          
          {/* TAB 1: VISI & MISI RESMI */}
          {activeTab === 'visi' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Identitas Judul Resmi */}
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Visi & Misi Perpustakaan
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-black text-slate-900 font-serif">
                  PERPUSTAKAAN PUSAT
                </h3>
                <h4 className="text-xs sm:text-sm font-bold text-[#047857]">
                  UNIVERSITAS ISLAM MADURA
                </h4>
              </div>

              {/* Visi */}
              <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-2xs relative">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#047857] text-white font-extrabold text-[11px] uppercase tracking-wider">
                    Visi
                  </span>
                  <span className="text-xs text-emerald-800 font-semibold">• Arah Kebijakan Utama</span>
                </div>
                <blockquote className="mt-2 text-sm sm:text-base font-semibold text-slate-800 leading-relaxed italic border-l-4 border-[#047857] pl-3.5 sm:pl-4">
                  “Menjadikan Perpustakaan UIM Pamekasan sebagai pusat pengembangan keilmuan dalam rangka mencerdaskan Masyarakat di Kabupaten Pamekasan.”
                </blockquote>
              </div>

              {/* Misi */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#047857] text-white font-extrabold text-[11px] uppercase tracking-wider">
                    Misi
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Tujuan Pelayanan & Pengembangan Perpustakaan</span>
                </div>

                <div className="space-y-2.5">
                  {missionList.map((m) => (
                    <div
                      key={m.no}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all flex items-start gap-3 shadow-2xs group"
                    >
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#047857] font-black text-xs flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-[#047857] group-hover:text-white transition-colors">
                        {m.no}
                      </span>
                      <p className="text-slate-700 leading-relaxed text-xs sm:text-sm font-medium">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Sinergi Kelembagaan */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#047857] shrink-0" />
                <span>
                  UPT Perpustakaan UIM terus memperluas jaringan literasi melalui SLiMS Bulian, kemitraan Perpusda Pamekasan, dan jejaring APPTNU.
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: STAF PUSTAKAWAN & TIM PENGELOLA (Lengkap dengan Manajemen CRUD Admin) */}
          {activeTab === 'pustakawan' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Pengelola Layanan
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-black text-slate-900 font-serif">
                  STAF PUSTAKAWAN & TIM PENGELOLA UIM
                </h3>
                <p className="text-xs text-slate-500">
                  Siap melayani kebutuhan riset, referensi dan literasi civitas akademika
                </p>
              </div>

              {/* PANEL ARAHAN & KONTROL KHUSUS ADMIN */}
              {isAdmin && (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/15 to-amber-500/10 border-2 border-amber-400/60 p-4 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-amber-400 text-slate-950 rounded-xl font-bold shrink-0 mt-0.5 shadow-2xs">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          Panduan Kelola Staf (Akses Pustakawan Admin)
                        </h4>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                          Anda memiliki wewenang untuk <strong>menambah</strong>, <strong>menyunting</strong>, atau <strong>menghapus</strong> data staf perpustakaan. Perubahan akan langsung tersimpan dan tampil pada portal pemustaka.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-300/40">
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="px-3.5 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Staf Baru</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetStaff}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 border border-slate-300 transition-all shadow-2xs"
                      title="Kembalikan ke susunan staf resmi awal"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Reset Data Bawaan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* DAFTAR KARTU STAF PUSTAKAWAN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {staffList.map((staf) => {
                  const isPimpinan = staf.jabatan?.toLowerCase().includes('kepala');
                  return (
                    <div
                      key={staf.id}
                      className={`p-4 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all relative group ${
                        isPimpinan
                          ? 'bg-gradient-to-b from-emerald-50/80 to-teal-50/40 border-2 border-emerald-500'
                          : 'bg-white border-2 border-slate-200/80 hover:border-emerald-400'
                      }`}
                    >
                      {/* Badge Jabatan / Pimpinan */}
                      {staf.badge && (
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mb-2 ${
                            isPimpinan
                              ? 'bg-[#047857] text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {staf.badge}
                        </span>
                      )}

                      {/* Avatar Inisial */}
                      <div
                        className={`w-14 h-14 rounded-2xl font-black text-base flex items-center justify-center mb-2 shadow-inner group-hover:scale-105 transition-transform ${
                          isPimpinan
                            ? 'bg-[#047857] text-white shadow-sm'
                            : 'bg-gradient-to-br from-emerald-100 to-teal-200 text-[#047857]'
                        }`}
                      >
                        {staf.inisial || 'ST'}
                      </div>

                      {/* Jabatan */}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#047857] text-[10px] font-black uppercase tracking-wider mb-1">
                        {staf.jabatan}
                      </span>

                      {/* Nama Lengkap */}
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm leading-tight mt-0.5">
                        {staf.nama}
                      </h4>

                      {/* Gelar / Sub-judul */}
                      {staf.gelar && (
                        <p className="text-[10px] text-emerald-800 font-bold mt-1">
                          {staf.gelar}
                        </p>
                      )}

                      {/* Deskripsi Tugas */}
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed flex-1">
                        {staf.deskripsi}
                      </p>

                      {/* Tombol Aksi Khusus Admin (Edit & Hapus) */}
                      {isAdmin && (
                        <div className="mt-3 pt-2.5 w-full border-t border-slate-200/80 flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(staf)}
                            className="flex-1 py-1 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#047857] font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            title="Sunting data staf ini"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Sunting</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStaff(staf.id, staf.nama)}
                            className="py-1 px-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] flex items-center justify-center gap-1 transition-colors"
                            title="Hapus staf ini"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden sm:inline">Hapus</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Info Konsultasi & Layanan Terpadu */}
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 font-bold text-[#047857]">
                    <Clock className="w-4 h-4" />
                    <span>Jam Layanan Konsultasi & Sirkulasi:</span>
                  </div>
                  <span className="text-[11px] text-emerald-800 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Senin – Jumat: 08.00 – 16.00 WIB
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] text-slate-600 border-t border-emerald-200/70">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Surel: <strong>perpus@uim.ac.id</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#047857]" />
                    <span>Portal: <strong>library.uim.ac.id</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Instagram className="w-3.5 h-3.5 text-[#047857]" />
                    <span>IG: <strong>@perpusuimpamekasan</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KETENTUAN SIRKULASI & TATA TERTIB */}
          {activeTab === 'tatatertib' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Ketentuan Resmi Sirkulasi
                </span>
                <h3 className="mt-2 text-base sm:text-lg font-black text-slate-900 font-serif">
                  KETENTUAN SIRKULASI
                </h3>
                <h4 className="text-xs sm:text-sm font-bold text-[#047857]">
                  PERPUSTAKAAN PUSAT UNIVERSITAS ISLAM MADURA
                </h4>
              </div>

              <div className="space-y-3.5">
                {/* 1. Ketentuan umum sirkulasi */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-[#047857] font-bold text-xs sm:text-sm border-b border-slate-100 pb-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Ketentuan Umum Sirkulasi</span>
                  </div>
                  <ol className="text-slate-600 pl-5 list-decimal text-xs space-y-1.5 leading-relaxed font-medium">
                    <li>Kartu anggota adalah bukti keanggotaan yang dikeluarkan oleh perpustakaan UIM Pamekasan masa berlaku 4 tahun.</li>
                    <li>Layanan peminjaman buku hanya diberikan kepada mahasiswa, dosen dan pegawai UIM yang sudah menjadi anggota perpustakaan.</li>
                  </ol>
                </div>

                {/* 2. Teknis Peminjaman */}
                <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-xs sm:text-sm border-b border-slate-100 pb-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Teknis Peminjaman</span>
                  </div>
                  <ol className="text-slate-600 pl-5 list-decimal text-xs space-y-1.5 leading-relaxed font-medium">
                    <li>Pengguna memeriksa terlebih dahulu kelengkapan halaman buku, jika tidak lengkap maka tidak bisa dipinjam dan dilaporkan kepada petugas.</li>
                    <li>Peminjaman dan perpanjangan buku harus datang sendiri ke loket sirkulasi serta membawa kartu KTA Perpustakaan.</li>
                    <li>Jumlah buku yang dipinjam maksimal <strong>2 buku</strong>.</li>
                    <li>Serahkan kartu anggota dan buku yang akan dipinjam kepada petugas sirkulasi.</li>
                    <li>Petugas akan melakukan sirkulasi.</li>
                    <li>Buku diserahkan kepada peminjam, kartu anggota dititip di perpustakaan dan diambil ketika pengembalian buku.</li>
                    <li>Jatuh tempo pengembalian buku bisa dilihat di <em>load recipe</em> / slip tanggal dalam buku.</li>
                    <li>Pengembalian boleh dititipkan kepada orang lain dan diproses di loket sirkulasi.</li>
                  </ol>
                </div>

                {/* 3. Larangan */}
                <div className="p-4 bg-amber-50/50 border border-amber-200/80 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs sm:text-sm border-b border-amber-200 pb-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Larangan</span>
                  </div>
                  <ol className="text-slate-700 pl-5 list-decimal text-xs space-y-1.5 leading-relaxed font-medium">
                    <li>Pengunjung dilarang membawa tas, helm, makanan dan minuman ke dalam ruang baca.</li>
                    <li>Dilarang tiduran, membuat gaduh, merokok dan aktivitas yang tidak ilmiah lainnya.</li>
                    <li>Buku yang sudah dibaca ditinggal di tempat baca.</li>
                    <li>Buku yang sudah dipinjam tidak boleh dibawa ke dalam ruang baca.</li>
                  </ol>
                </div>

                {/* 4. Sanksi */}
                <div className="p-4 bg-red-50/50 border border-red-200/80 rounded-2xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-xs sm:text-sm border-b border-red-200 pb-1.5">
                    <Scale className="w-4 h-4 text-red-600" />
                    <span>Sanksi</span>
                  </div>
                  <ol className="text-slate-700 pl-5 list-decimal text-xs space-y-1.5 leading-relaxed font-medium">
                    <li>Keterlambatan pengembalian buku didenda <strong>Rp 500,- per hari per eksemplar</strong>.</li>
                    <li>Buku hilang harus diganti dengan buku yang sama.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <MapPin className="w-3.5 h-3.5 text-[#047857]" />
            <span>Kampus Bettet, Jl. Raya Bettet No. 49 Pamekasan</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl transition-all shadow-xs active:scale-95 text-xs text-center"
            >
              Tutup
            </button>
          </div>
        </div>

      </div>

      {/* ================= MODAL SUB-FORM: TAMBAH / SUNTING STAF (KHUSUS ADMIN) ================= */}
      {isStaffFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#047857]" />
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {editingStaffId ? 'Sunting Data Staf Pustakawan' : 'Tambah Staf Pustakawan Baru'}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsStaffFormOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lathifah, S.Pd., S.I.Pust., M.SIP"
                  value={staffFormData.nama}
                  onChange={(e) => setStaffFormData({ ...staffFormData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Jabatan / Posisi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kepala Perpustakaan / KABAG Sirkulasi / Admin"
                    value={staffFormData.jabatan}
                    onChange={(e) => setStaffFormData({ ...staffFormData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Gelar / Kualifikasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: S.Pd., S.I.Pust., M.SIP"
                    value={staffFormData.gelar}
                    onChange={(e) => setStaffFormData({ ...staffFormData, gelar: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Label Badge Singkat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pimpinan UPT / Front Desk"
                    value={staffFormData.badge}
                    onChange={(e) => setStaffFormData({ ...staffFormData, badge: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Inisial Avatar (2 Huruf)
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="Contoh: LP / MS / EA"
                    value={staffFormData.inisial}
                    onChange={(e) => setStaffFormData({ ...staffFormData, inisial: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl uppercase font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Deskripsi Tugas & Peran
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan uraian tugas, tanggung jawab, atau bidang pelayanan staf ini..."
                  value={staffFormData.deskripsi}
                  onChange={(e) => setStaffFormData({ ...staffFormData, deskripsi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStaffFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
