import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { countPendingVerifications } from '../lib/memberService';
import {
  getPendingOfflineActions,
  processOfflineQueue,
  subscribeOfflineQueue
} from '../lib/offlineQueueService';
import {
  Home,
  BookOpen,
  Briefcase,
  FileText,
  CloudUpload,
  Newspaper,
  Megaphone,
  HelpCircle,
  Search,
  ChevronDown,
  Menu,
  X,
  ShieldCheck,
  Building2,
  FileCheck,
  Award,
  Globe2,
  BookPlus,
  Info,
  Users,
  ExternalLink,
  CreditCard,
  LogOut,
  User,
  Bell,
  MessageSquare,
  RotateCw
} from 'lucide-react';
import JournalPortalModal from './JournalPortalModal';
import NewsPortalModal from './NewsPortalModal';
import NotificationModal from './NotificationModal';
import FeedbackModal from './FeedbackModal';
import ProfileModal from './ProfileModal';
import ServiceModal from './ServiceModal';
import { getUnreadNotificationCount, subscribeNotifications } from '../lib/notificationService';

export default function Navbar({
  currentUser,
  onOpenAuth,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAdminVerification,
  onOpenProfile,
  onFocusSearch,
  onOpenNotification
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [mobileServiceOpen, setMobileServiceOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'profil' | 'layanan' | 'jurnal' | 'repository' | 'berita' | 'pengumuman' | 'bantuan' | 'pustakawan'
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [repoDropdownOpen, setRepoDropdownOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadNotificationCount(currentUser));
  const { t } = useLanguage();

  useEffect(() => {
    setPendingCount(countPendingVerifications());
    const interval = setInterval(() => {
      setPendingCount(countPendingVerifications());
    }, 2500);

    setUnreadNotifs(getUnreadNotificationCount(currentUser));
    const unsubNotif = subscribeNotifications(() => {
      setUnreadNotifs(getUnreadNotificationCount(currentUser));
    });

    return () => {
      clearInterval(interval);
      unsubNotif();
    };
  }, [currentUser]);

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setServiceDropdownOpen(false);
    setRepoDropdownOpen(false);

    if (tab === 'beranda') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'katalog') {
      const el = document.getElementById('katalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveModal(tab);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <>
      {/* NAVBAR HIJAU SOLID SESUAI MOCKUP */}
      <nav className="sticky top-0 z-40 w-full bg-[#047857] text-white shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 flex items-center justify-between">
          
          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 text-xs font-semibold">
            {/* 1. Beranda */}
            <button
              type="button"
              onClick={() => handleNavClick('beranda')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'beranda'
                  ? 'bg-[#16a34a] text-white font-bold shadow-xs'
                  : 'hover:bg-emerald-800/80 text-emerald-100 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>{t('nav_home')}</span>
            </button>

            {/* 2. Profil Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                onBlur={() => setTimeout(() => setProfileDropdownOpen(false), 250)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  profileDropdownOpen || activeModal?.startsWith('profil') || activeModal === 'pustakawan'
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('nav_profile')}</span>
                <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {profileDropdownOpen && (
                <div className="absolute left-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-slate-800 text-xs z-50 animate-fadeIn">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('profil-visi');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center justify-between group"
                  >
                    <span>Visi & Misi Perpustakaan</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('pustakawan');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center justify-between group"
                  >
                    <span>Staf Pustakawan UIM</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('profil-tatatertib');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center justify-between group"
                  >
                    <span>Ketentuan Sirkulasi & Tata Tertib</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </div>
              )}
            </div>

            {/* 3. Layanan Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setServiceDropdownOpen(!serviceDropdownOpen)}
                onBlur={() => setTimeout(() => setServiceDropdownOpen(false), 250)}
                className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  serviceDropdownOpen
                    ? 'bg-emerald-800 text-white'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/80'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t('nav_services')}</span>
                <ChevronDown className={`w-3 h-3 text-emerald-300 transition-transform ${serviceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {serviceDropdownOpen && (
                <div className="absolute left-0 mt-1 w-60 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 text-slate-800 text-xs z-50 animate-fadeIn">
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('layanan-bebaspustaka');
                      setServiceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center gap-2.5"
                  >
                    <FileCheck className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Surat Bebas Pustaka Online</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('layanan-turnitin');
                      setServiceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Uji Kemiripan Turnitin</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('layanan-usulan');
                      setServiceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center gap-2.5"
                  >
                    <BookPlus className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Usulan Pengadaan Buku</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setActiveModal('layanan-peminjaman');
                      setServiceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 hover:text-[#047857] font-medium transition-colors flex items-center gap-2.5"
                  >
                    <RotateCw className="w-4 h-4 text-[#047857] shrink-0" />
                    <span>Layanan Peminjaman Buku</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Right Icon Actions: Search Icon, Notifications, & Admin Button */}
          <div className="flex items-center gap-2">
            {/* Tombol Notifikasi Pengumuman di Ujung Atas */}
            <button
              type="button"
              onClick={onOpenNotification}
              className="relative p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/80 transition-colors"
              title="Pusat Notifikasi & Pengumuman Resmi"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotifs}
                </span>
              )}
            </button>
            {/* Tombol Khusus Admin: Verifikasi KTM */}
            {isAdmin && (
              <button
                type="button"
                onClick={onOpenAdminVerification}
                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 transition-all shadow-sm"
                title="Buka panel verifikasi pengajuan KTM mahasiswa baru"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verifikasi KTM</span>
                {pendingCount > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Quick Search Shortcut Icon */}
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('search-input-hero');
                if (el) {
                  el.focus();
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (onFocusSearch) {
                  onFocusSearch();
                }
              }}
              className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/80 transition-colors"
              title="Fokus ke Bilah Pencarian OPAC"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800/80 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#034d36] border-t border-emerald-700/80 px-4 py-3 space-y-2 text-xs font-semibold animate-fadeIn">
            <button
              onClick={() => handleNavClick('beranda')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Beranda</span>
            </button>

            {/* Mobile Profil Menu */}
            <div className="rounded-lg bg-emerald-900/60 overflow-hidden border border-emerald-700/40">
              <button
                type="button"
                onClick={() => setMobileProfileOpen(!mobileProfileOpen)}
                className="w-full text-left py-2 px-3 hover:bg-emerald-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-300" />
                  <span>Profil Perpustakaan</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${mobileProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileProfileOpen && (
                <div className="bg-emerald-950/70 py-1 px-2 space-y-1 text-[11px] font-normal border-t border-emerald-800/80">
                  <button
                    onClick={() => { setActiveModal('profil-visi'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Visi & Misi Perpustakaan</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('pustakawan'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Staf Pustakawan UIM</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('profil-tatatertib'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Ketentuan Sirkulasi & Tata Tertib</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Layanan Menu */}
            <div className="rounded-lg bg-emerald-900/60 overflow-hidden border border-emerald-700/40">
              <button
                type="button"
                onClick={() => setMobileServiceOpen(!mobileServiceOpen)}
                className="w-full text-left py-2 px-3 hover:bg-emerald-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-300" />
                  <span>Layanan Terpadu</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-emerald-300 transition-transform ${mobileServiceOpen ? 'rotate-180' : ''}`} />
              </button>

              {mobileServiceOpen && (
                <div className="bg-emerald-950/70 py-1 px-2 space-y-1 text-[11px] font-normal border-t border-emerald-800/80">
                  <button
                    onClick={() => { setActiveModal('layanan-bebaspustaka'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Surat Bebas Pustaka Online</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('layanan-turnitin'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Uji Kemiripan Turnitin</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('layanan-usulan'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <BookPlus className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Usulan Pengadaan Buku</span>
                  </button>
                  <button
                    onClick={() => { setActiveModal('layanan-peminjaman'); setMobileMenuOpen(false); }}
                    className="w-full text-left py-1.5 px-3 rounded-md hover:bg-emerald-800/80 flex items-center gap-2 text-emerald-100 hover:text-white"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Layanan Peminjaman Buku</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => handleNavClick('katalog')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Katalog Perpustakaan</span>
            </button>
            <button
              onClick={() => handleNavClick('ejournal')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>E-Journal</span>
            </button>
            <button
              onClick={() => handleNavClick('repositori')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <CloudUpload className="w-4 h-4" />
              <span>Repository</span>
            </button>
            <button
              onClick={() => handleNavClick('berita')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <Newspaper className="w-4 h-4" />
              <span>Berita</span>
            </button>
            <button
              onClick={() => handleNavClick('pengumuman')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <Megaphone className="w-4 h-4" />
              <span>Pengumuman</span>
            </button>
            <button
              onClick={() => handleNavClick('bantuan')}
              className="w-full text-left py-2 px-3 rounded-lg hover:bg-emerald-800 flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Bantuan</span>
            </button>
          </div>
        )}
      </nav>

      {/* ================= MODALS SYSTEM ================= */}
      {/* 1. Modal Berita & Pengumuman */}
      {(activeModal === 'berita' || activeModal === 'pengumuman') && (
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
              <h3 className="text-lg font-bold">Warta & Pengumuman Resmi UIM</h3>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-slate-600 max-h-[70vh] overflow-y-auto pr-1">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Literasi Digital 2025/2026
                </span>
                <h4 className="font-bold text-slate-800 mt-1">Perpustakaan UIM Gelar Pelatihan Literasi Digital & Sitasi</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Meningkatkan literasi penulisan karya ilmiah dan pemanfaatan referensi Mendeley bagi mahasiswa semester akhir.
                </p>
              </div>
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                  Registrasi Anggota Baru
                </span>
                <h4 className="font-bold text-slate-800 mt-1">Aktivasi Mandiri Kartu Tanda Mahasiswa (KTM)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mahasiswa baru kini dapat mendaftar langsung di menu Daftar Anggota untuk mendapatkan akses penuh layanan peminjaman buku.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal Profil Visi Misi, Staf Pustakawan & Tata Tertib */}
      <ProfileModal
        isOpen={Boolean(activeModal?.startsWith('profil') || activeModal === 'pustakawan')}
        initialTab={
          activeModal === 'pustakawan' || activeModal === 'profil-pustakawan'
            ? 'pustakawan'
            : activeModal === 'profil-tatatertib'
            ? 'tatatertib'
            : 'visi'
        }
        currentUser={currentUser}
        onClose={() => setActiveModal(null)}
      />

      {/* 3. Modal Layanan Terpadu Perpustakaan (4 Layanan Utama) */}
      <ServiceModal
        isOpen={Boolean(
          activeModal === 'layanan-bebaspustaka' ||
          activeModal === 'layanan-turnitin' ||
          activeModal === 'layanan-usulan' ||
          activeModal === 'layanan-peminjaman' ||
          activeModal === 'layanan'
        )}
        serviceType={
          activeModal === 'layanan-turnitin'
            ? 'turnitin'
            : activeModal === 'layanan-usulan'
            ? 'usulan-buku'
            : activeModal === 'layanan-peminjaman'
            ? 'peminjaman-buku'
            : 'bebas-pustaka'
        }
        currentUser={currentUser}
        onClose={() => setActiveModal(null)}
        onNavigateToCatalog={() => {
          setActiveModal(null);
          handleNavClick('katalog');
        }}
      />

      {/* 4. Modal Portal Jurnal & Karya Ilmiah Sivitas UIM */}
      <JournalPortalModal
        isOpen={activeModal === 'ejournal' || activeModal === 'jurnal'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
      />

      {/* 4.1. Modal Portal Berita & Kegiatan Perpustakaan UIM */}
      <NewsPortalModal
        isOpen={activeModal === 'berita'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
      />

      {/* 4.2. Modal Pengumuman Resmi UIM */}
      <NotificationModal
        isOpen={activeModal === 'pengumuman'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
      />

      {/* 4.3. Modal Kotak Saran & Komentar Pemustaka */}
      <FeedbackModal
        isOpen={activeModal === 'komentar' || activeModal === 'feedback'}
        onClose={() => setActiveModal(null)}
        currentUser={currentUser}
      />

      {/* 5. Modal Repositori */}
      {activeModal?.startsWith('repositori') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-[#047857]">
              <CloudUpload className="w-6 h-6" />
              <h3 className="text-lg font-bold">Repositori Institusi UIM (DSpace)</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <p>Portal penyimpanan dan publikasi karya ilmiah civitas akademika Universitas Islam Madura:</p>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <span className="font-bold text-blue-900 block">Koleksi Terbuka:</span>
                <p>• Skripsi Sarjana (S1) Seluruh Fakultas</p>
                <p>• Tesis Magister</p>
                <p>• Laporan Penelitian Dosen & Hibah Pengabdian</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Modal Bantuan */}
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
              <h3 className="text-lg font-bold">Bantuan & Panduan Pemustaka</h3>
            </div>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-800">1. Cara Meminjam Koleksi Buku:</h4>
                <p>Pastikan Anda telah memiliki akun terverifikasi. Masuk melalui <strong>Area Anggota</strong>, cari buku yang diinginkan, lalu klik tombol <strong>Pinjam Buku</strong>.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">2. Durasi & Perpanjangan:</h4>
                <p>Masa pinjam buku adalah 7 hari kalender dan dapat diperpanjang maksimal 1 kali secara online.</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">3. Kontak Pustakawan:</h4>
                <p>Email: <a href="mailto:perpus@uim.ac.id" className="text-[#047857] font-semibold underline">perpus@uim.ac.id</a></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
