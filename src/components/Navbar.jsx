import React, { useState, useEffect } from 'react';
import UimLogo from './UimLogo';
import { countPendingVerifications } from '../lib/memberService';
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Info,
  Newspaper,
  HelpCircle,
  Users,
  ShieldCheck,
  CreditCard,
  Clock,
  MapPin,
  ExternalLink,
  BookOpen,
  Award,
  Globe2,
  FileCheck,
  Building2,
  BookPlus
} from 'lucide-react';

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAdminVerification
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'informasi' | 'berita' | 'bantuan' | 'pustakawan' | 'layanan' | 'repositori' | 'ejournal'
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    setPendingCount(countPendingVerifications());
    const interval = setInterval(() => {
      setPendingCount(countPendingVerifications());
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (tab === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveModal(tab);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* 1. BILAH INFORMASI ATAS RESMI (Khas Perpustakaan UNUSA & Perguruan Tinggi Islam) */}
      <div className="bg-[#022c22] text-white/90 text-[11px] py-1.5 px-4 sm:px-8 border-b border-emerald-900/60 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Senin - Kamis: 08.00 - 16.00 WIB | Jumat: 08.00 - 15.30 WIB</span>
            </span>
            <span className="text-emerald-700">•</span>
            <span className="flex items-center gap-1 text-emerald-300">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>Gedung Perpustakaan Pusat Kampus Bettet, Pamekasan</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-emerald-200 text-xs">
            <button
              onClick={() => setActiveModal('layanan')}
              className="hover:text-amber-300 transition-colors"
            >
              Layanan Unggulan
            </button>
            <span className="text-emerald-700">•</span>
            <button
              onClick={() => setActiveModal('repositori')}
              className="hover:text-amber-300 transition-colors"
            >
              Repositori DSpace
            </button>
            <span className="text-emerald-700">•</span>
            <button
              onClick={() => setActiveModal('ejournal')}
              className="hover:text-amber-300 transition-colors"
            >
              E-Journal
            </button>
            <span className="text-emerald-700">•</span>
            <span className="font-semibold text-white">ID 🇮🇩</span>
          </div>
        </div>
      </div>

      {/* 2. NAVBAR UTAMA SLiMS 9 BULIAN */}
      <header className="sticky top-0 z-40 w-full bg-[#064e3b] shadow-md border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Brand Logo & Name Resmi Kampus */}
          <div
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <UimLogo className="w-9 h-9 sm:w-11 sm:h-11 shrink-0" />
            <div className="leading-tight">
              <span className="text-white text-xs sm:text-base font-bold tracking-wide group-hover:text-amber-300 transition-colors block">
                Perpustakaan Universitas Islam Madura
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-200 font-medium tracking-normal block">
                SLiMS 9 Bulian • Online Public Access Catalog
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4 lg:space-x-5 text-xs sm:text-[13px] font-medium text-white">
            <button
              onClick={() => handleNavClick('beranda')}
              className={`hover:text-amber-300 transition-colors py-1 ${
                activeTab === 'beranda' ? 'text-amber-300 font-bold border-b-2 border-amber-400' : ''
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => handleNavClick('informasi')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              Informasi
            </button>

            <button
              onClick={() => handleNavClick('berita')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              Berita
            </button>

            <button
              onClick={() => handleNavClick('layanan')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              Layanan
            </button>

            <button
              onClick={() => handleNavClick('bantuan')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              Bantuan
            </button>

            <button
              onClick={() => handleNavClick('pustakawan')}
              className="hover:text-amber-300 transition-colors py-1"
            >
              Pustakawan
            </button>

            {/* Tombol Khusus Admin: Verifikasi KTM */}
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminVerification}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-md animate-pulse"
                title="Buka panel verifikasi pengajuan KTM mahasiswa baru"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verifikasi KTM</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Area Anggota / Akun Login */}
            {currentUser ? (
              <div className="flex items-center gap-2 border-l border-emerald-700/80 pl-4">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  {isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className="max-w-[130px] truncate">
                    {isAdmin ? 'Admin Pustakawan' : currentUser.nama || currentUser.nim}
                  </span>
                </span>
                <button
                  onClick={onLogout}
                  title="Keluar"
                  className="p-1 hover:text-red-300 transition-colors ml-1 text-slate-300"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="hover:text-amber-300 transition-colors flex items-center gap-1 border-l border-emerald-700/80 pl-4 py-1"
              >
                <User className="w-3.5 h-3.5" />
                <span>Area Anggota</span>
              </button>
            )}
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onOpenAdminVerification}
                className="px-2 py-1 bg-amber-400 text-slate-950 font-bold text-[11px] rounded flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KTM ({pendingCount})</span>
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white hover:text-amber-300 transition-colors rounded-lg bg-emerald-900/60"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#022c22] border-t border-emerald-800 px-4 py-4 space-y-2 text-sm text-white">
            <button
              onClick={() => handleNavClick('beranda')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('informasi')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Informasi
            </button>
            <button
              onClick={() => handleNavClick('berita')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Berita
            </button>
            <button
              onClick={() => handleNavClick('layanan')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Layanan Unggulan
            </button>
            <button
              onClick={() => handleNavClick('bantuan')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Bantuan
            </button>
            <button
              onClick={() => handleNavClick('pustakawan')}
              className="block w-full text-left py-1.5 hover:text-amber-300 font-medium"
            >
              Pustakawan
            </button>

            {isAdmin && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminVerification();
                }}
                className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded-lg text-left px-3 flex items-center justify-between"
              >
                <span>Panel Verifikasi KTM</span>
                <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  {pendingCount}
                </span>
              </button>
            )}

            <div className="pt-2 border-t border-emerald-800">
              {currentUser ? (
                <div className="flex items-center justify-between py-1.5 text-amber-300">
                  <span className="truncate pr-2 font-medium">
                    {isAdmin ? 'Admin Pustakawan' : currentUser.nama || currentUser.nim}
                  </span>
                  <button onClick={onLogout} className="text-red-300 text-xs shrink-0 font-bold">
                    Keluar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full py-2 bg-amber-400 text-slate-950 font-bold rounded-lg text-center"
                >
                  Area Anggota
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ================= MODAL INFORMASI ================= */}
      {activeModal === 'informasi' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <Info className="w-6 h-6" />
              <h3 className="text-lg font-bold">Informasi Perpustakaan UIM</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-800">Jam Layanan:</h4>
                <p>• Senin - Kamis: 08.00 - 16.00 WIB</p>
                <p>• Jumat: 08.00 - 15.30 WIB</p>
                <p>• Sabtu & Minggu: Tutup (Hari Libur Akademik)</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Ketentuan Keanggotaan KTM:</h4>
                <p>• Mahasiswa baru mendaftarkan nomor KTM pada menu <strong>Area Anggota</strong>.</p>
                <p>• Akun akan aktif setelah diverifikasi oleh petugas Pustakawan di Meja Sirkulasi.</p>
                <p>• Masa pinjam buku adalah 7 hari kalender dan dapat diperpanjang 1 kali secara online.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Alamat Kampus:</h4>
                <p>Gedung Perpustakaan Pusat Universitas Islam Madura</p>
                <p>Jl. Raya Bettet No. 49, Pamekasan, Jawa Timur</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL BERITA ================= */}
      {activeModal === 'berita' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <Newspaper className="w-6 h-6" />
              <h3 className="text-lg font-bold">Berita & Pengumuman Perpustakaan</h3>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Pemberitahuan Mahasiswa Baru
                </span>
                <h4 className="font-bold text-slate-800 mt-1">Registrasi Mandiri Anggota Perpustakaan via KTM</h4>
                <p className="text-xs text-slate-500 mt-0.5">Seluruh mahasiswa baru diwajibkan melakukan registrasi menggunakan Nomor Induk Mahasiswa (NIM) dan melakukan aktivasi di Meja Sirkulasi.</p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Layanan Akademik
                </span>
                <h4 className="font-bold text-slate-800 mt-1">Integrasi Layanan Bebas Pustaka & Repositori Online</h4>
                <p className="text-xs text-slate-500 mt-0.5">Mahasiswa tingkat akhir kini dapat memantau status bebas tanggungan perpustakaan secara online sebagai syarat pendaftaran wisuda.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL LAYANAN UNGGULAN ================= */}
      {activeModal === 'layanan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <Building2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Layanan Unggulan Perpustakaan UIM</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <h4 className="font-bold text-[#047857] flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span>Katalog OPAC</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Penelusuran ketersediaan eksemplar buku cetak dan e-book di rak perpustakaan secara real-time.</p>
              </div>
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
                <h4 className="font-bold text-blue-700 flex items-center gap-1.5 mb-1">
                  <FileCheck className="w-4 h-4" />
                  <span>Repositori Skripsi & Tugas Akhir</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Akses karya tulis ilmiah, skripsi sarjana, tesis, dan jurnal penelitian dosen civitas UIM.</p>
              </div>
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h4 className="font-bold text-amber-700 flex items-center gap-1.5 mb-1">
                  <Award className="w-4 h-4" />
                  <span>Bebas Pustaka Online</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Layanan verifikasi mandiri pengembalian buku untuk syarat pendaftaran yudisium dan wisuda.</p>
              </div>
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl">
                <h4 className="font-bold text-teal-700 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Uji Kemiripan Turnitin</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Pengecekan orisinalitas naskah dan anti-plagiasi untuk publikasi dan tugas akhir mahasiswa.</p>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                <h4 className="font-bold text-indigo-700 flex items-center gap-1.5 mb-1">
                  <Globe2 className="w-4 h-4" />
                  <span>E-Journal & Database</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Akses pangkalan data riset nasional (Garuda, Moraref, SINTA) dan internasional.</p>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <h4 className="font-bold text-purple-700 flex items-center gap-1.5 mb-1">
                  <BookPlus className="w-4 h-4" />
                  <span>Usulan Koleksi Buku</span>
                </h4>
                <p className="text-slate-600 text-[11px]">Formulir pengajuan buku rujukan baru yang dibutuhkan mahasiswa dan dosen.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL BANTUAN ================= */}
      {activeModal === 'bantuan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <HelpCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Panduan & Bantuan Pemustaka</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-800">1. Alur Mahasiswa Baru:</h4>
                <p>Buka <strong>Area Anggota</strong> &gt; pilih tab <strong>Mahasiswa</strong> &gt; klik <strong>Daftar Mahasiswa Baru</strong> &gt; masukkan nomor KTM/NIM dan biodata &gt; tunggu verifikasi dari Admin.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">2. Login Admin Pustakawan:</h4>
                <p>Staf perpustakaan masuk via tab <strong>Pustakawan / Admin</strong> dengan username dan password petugas untuk memverifikasi akun pendaftar baru.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">3. Peminjaman Buku:</h4>
                <p>Setelah akun terverifikasi, Anda dapat memilih buku di katalog dan menekan tombol <strong>Pinjam Buku</strong>.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL PUSTAKAWAN ================= */}
      {activeModal === 'pustakawan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <Users className="w-6 h-6" />
              <h3 className="text-lg font-bold">Pustakawan Universitas Islam Madura</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <p>Staf pustakawan dan tim layanan informasi Perpustakaan UIM siap melayani verifikasi keanggotaan dan sirkulasi:</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Meja Layanan Sirkulasi & Verifikasi KTM</p>
                <p className="text-xs text-slate-500">Email: sirkulasi@uim.ac.id</p>
                <p className="text-xs text-slate-500">Lokasi: Lantai 1, Gedung Perpustakaan UIM Bettet</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="font-bold text-slate-800">Layanan Repositori & Tugas Akhir</p>
                <p className="text-xs text-slate-500">Email: repositori@uim.ac.id</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL REPOSITORI ================= */}
      {activeModal === 'repositori' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-blue-700">
              <FileCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold">Repositori Institusi (DSpace UIM)</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <p>Portal Repositori Institusi UIM mendokumentasikan dan menyebarluaskan karya ilmiah civitas akademika:</p>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800">Koleksi Tugas Akhir & Skripsi</h5>
                  <p className="text-xs text-slate-500">Naskah lengkap skripsi sarjana dari 7 Fakultas di lingkungan UIM Pamekasan.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <h5 className="font-bold text-slate-800">Jurnal & Publikasi Dosen</h5>
                  <p className="text-xs text-slate-500">Artikel riset, pengabdian masyarakat, dan prosiding seminar nasional.</p>
                </div>
              </div>
              <div className="pt-2">
                <a
                  href="https://uim.ac.id"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Kunjungi Portal DSpace UIM</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL E-JOURNAL ================= */}
      {activeModal === 'ejournal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-indigo-700">
              <Globe2 className="w-6 h-6" />
              <h3 className="text-lg font-bold">Pangkalan Data Jurnal & E-Resources</h3>
            </div>
            <div className="space-y-2.5 text-xs text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <p>Akses pangkalan data rujukan akademik nasional dan internasional yang direkomendasikan:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href="https://sinta.kemdikbud.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all block"
                >
                  <span className="font-bold text-slate-800 block">SINTA Kemendikbud</span>
                  <span className="text-[10px] text-slate-500">Indeksasi Jurnal Nasional</span>
                </a>
                <a
                  href="https://garuda.kemdikbud.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all block"
                >
                  <span className="font-bold text-slate-800 block">GARUDA</span>
                  <span className="text-[10px] text-slate-500">Garba Rujukan Digital</span>
                </a>
                <a
                  href="https://moraref.kemenag.go.id"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all block"
                >
                  <span className="font-bold text-slate-800 block">MORAREF Kemenag</span>
                  <span className="text-[10px] text-slate-500">Riset Studi Islam & PTKI</span>
                </a>
                <a
                  href="https://www.neliti.com"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all block"
                >
                  <span className="font-bold text-slate-800 block">NELITI</span>
                  <span className="text-[10px] text-slate-500">Repositori Riset Indonesia</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
