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
  Bell
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
  const [activeModal, setActiveModal] = useState(null); // 'informasi' | 'berita' | 'bantuan' | 'pustakawan'
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
      <header className="sticky top-0 z-40 w-full bg-[#064e3b]/95 backdrop-blur-md shadow-md border-b border-emerald-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Brand Logo & Name (Persis Screenshot Digilib UIM) */}
          <div
            onClick={() => handleNavClick('beranda')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
          >
            <UimLogo className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-white text-sm sm:text-base font-normal tracking-wide group-hover:text-amber-300 transition-colors">
              Perpustakaan Universitas Islam Madura
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-5 text-xs sm:text-[13px] font-normal text-white">
            <button
              onClick={() => handleNavClick('beranda')}
              className={`hover:text-amber-300 transition-colors ${
                activeTab === 'beranda' ? 'text-amber-300 font-semibold' : ''
              }`}
            >
              Beranda
            </button>

            <button
              onClick={() => handleNavClick('informasi')}
              className="hover:text-amber-300 transition-colors"
            >
              Informasi
            </button>

            <button
              onClick={() => handleNavClick('berita')}
              className="hover:text-amber-300 transition-colors"
            >
              Berita
            </button>

            <button
              onClick={() => handleNavClick('bantuan')}
              className="hover:text-amber-300 transition-colors"
            >
              Bantuan
            </button>

            <button
              onClick={() => handleNavClick('pustakawan')}
              className="hover:text-amber-300 transition-colors"
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
                className="hover:text-amber-300 transition-colors flex items-center gap-1 border-l border-emerald-700/80 pl-4"
              >
                <span>Area Anggota</span>
              </button>
            )}

            {/* Flag Bahasa Indonesia */}
            <span
              className="cursor-default select-none text-base"
              title="Bahasa Indonesia"
            >
              🇮🇩
            </span>
          </nav>

          {/* Mobile Hamburger Toggle */}
          <div className="md:hidden flex items-center gap-2.5">
            {isAdmin && (
              <button
                onClick={onOpenAdminVerification}
                className="px-2 py-1 bg-amber-400 text-slate-950 font-bold text-[11px] rounded flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>KTM ({pendingCount})</span>
              </button>
            )}
            <span className="text-sm">🇮🇩</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white hover:text-amber-300 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#022c22] border-t border-emerald-800 px-4 py-4 space-y-3 text-sm text-white">
            <button
              onClick={() => handleNavClick('beranda')}
              className="block w-full text-left py-1.5 hover:text-amber-300"
            >
              Beranda
            </button>
            <button
              onClick={() => handleNavClick('informasi')}
              className="block w-full text-left py-1.5 hover:text-amber-300"
            >
              Informasi
            </button>
            <button
              onClick={() => handleNavClick('berita')}
              className="block w-full text-left py-1.5 hover:text-amber-300"
            >
              Berita
            </button>
            <button
              onClick={() => handleNavClick('bantuan')}
              className="block w-full text-left py-1.5 hover:text-amber-300"
            >
              Bantuan
            </button>
            <button
              onClick={() => handleNavClick('pustakawan')}
              className="block w-full text-left py-1.5 hover:text-amber-300"
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
                  <span className="truncate pr-2">
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
                <p>• Masa pinjam buku adalah 7 hari kalender dan dapat diperpanjang 1 kali.</p>
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
              <h3 className="text-lg font-bold">Berita & Pengumuman</h3>
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
                  Sistem Cerdas
                </span>
                <h4 className="font-bold text-slate-800 mt-1">Peluncuran Rekomendasi Buku Otomatis</h4>
                <p className="text-xs text-slate-500 mt-0.5">Pemustaka kini dapat melihat rekomendasi buku sesuai minat baca berdasarkan perhitungan kesamaan rating civitas akademika.</p>
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
    </>
  );
}
