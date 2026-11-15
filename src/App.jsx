import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import TopBar from './components/TopBar';
import BrandHeader from './components/BrandHeader';
import Navbar from './components/Navbar';
import FooterUIM from './components/FooterUIM';
import Home from './pages/Home';
import AuthModal from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import AdminVerificationModal from './components/AdminVerificationModal';
import NotificationModal from './components/NotificationModal';
import UimLogo from './components/UimLogo';
import VisitorCounterWidget from './components/VisitorCounterWidget';
import { recordPageView } from './lib/visitorService';
import { subscribeAuthState, logoutUser } from './lib/authService';
import { initOfflineQueueAutoSync } from './lib/offlineQueueService';
import { ShieldCheck, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

function MainApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [isAdminVerificationOpen, setIsAdminVerificationOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'admin' | 'profile'
  const [activeTab, setActiveTab] = useState('beranda');
  const [searchQuery, setSearchQuery] = useState('');
  const { currentLang } = useLanguage();

  // Set HTML dir attribute for Arabic RTL support
  useEffect(() => {
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Inisialisasi Otomatis Antrean Offline-Write PWA (IndexedDB)
  useEffect(() => {
    initOfflineQueueAutoSync();
  }, []);

  // Pelacakan Kunjungan Pengunjung (Visitor Counter SPA per navigasi tab/halaman)
  useEffect(() => {
    recordPageView(activeTab);
  }, [activeTab, currentView]);

  // Listener autentikasi Firebase Authentication & Profil Firestore
  useEffect(() => {
    const unsubscribe = subscribeAuthState((userProfile) => {
      setCurrentUser(userProfile);
      if (userProfile?.role === 'admin') {
        setCurrentView('admin');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setCurrentView('public');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    // Jika masuk sebagai admin, otomatis arahkan ke dashboard Administrasi Perpustakaan (SLiMS)
    if (user.role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('profile');
    }
  };

  const openAuthWithMode = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // ================= JIKA TAMPILAN ADMIN AKTIF =================
  if (currentUser?.role === 'admin' && currentView === 'admin') {
    return (
      <AdminDashboard
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToPublic={() => setCurrentView('public')}
      />
    );
  }

  // ================= TAMPILAN PORTAL PUBLIK (OPAC) =================
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Admin Floating Banner saat melihat portal publik */}
      {currentUser?.role === 'admin' && (
        <div className="bg-[#0369a1] text-white py-2 px-4 text-xs font-semibold flex items-center justify-between shadow sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Mode Pratinjau Publik (Admin Pustakawan Aktif)</span>
          </div>
          <button
            onClick={() => setCurrentView('admin')}
            className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded text-[11px] transition-colors flex items-center gap-1.5 shadow"
          >
            <span>Kembali ke Administrasi Perpustakaan</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 1. Top Bar: Jam Live, Kontrol Bahasa, Notifikasi & Akses Masuk / Daftar Tunggal */}
      <TopBar
        currentUser={currentUser}
        onOpenAuth={openAuthWithMode}
        onLogout={handleLogout}
        onOpenProfile={() => setCurrentView('profile')}
        onOpenNotification={() => setIsNotificationOpen(true)}
      />

      {/* 2. Brand Header: Logo UIM & Slogan "Literasi untuk Masa Depan" */}
      <BrandHeader
        onGoHome={() => {
          setActiveTab('beranda');
          setCurrentView('public');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 3. Solid Green Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => openAuthWithMode('login')}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdminVerification={() => setCurrentView('admin')}
        onOpenProfile={() => setCurrentView('profile')}
        onOpenNotification={() => setIsNotificationOpen(true)}
      />

      {/* 4. Konten Halaman Utama / Area Anggota */}
      <main className="flex-1">
        {currentView === 'profile' ? (
          <UserProfile
            currentUser={currentUser}
            onBackToHome={() => setCurrentView('public')}
            onLogout={handleLogout}
            onSelectBook={(book) => {
              setCurrentView('public');
              setSearchQuery(book.judul);
              window.scrollTo({ top: 500, behavior: 'smooth' });
            }}
          />
        ) : (
          <Home
            currentUser={currentUser}
            activeTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenAuth={() => openAuthWithMode('login')}
            onSwitchToAdmin={() => setCurrentView('admin')}
            onOpenAdminVerification={() => setIsAdminVerificationOpen(true)}
          />
        )}
      </main>

      {/* 5. Auth Modal (Mahasiswa via KTM & Admin via Username/Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 6. Panel Verifikasi Mahasiswa Baru */}
      <AdminVerificationModal
        isOpen={isAdminVerificationOpen}
        onClose={() => setIsAdminVerificationOpen(false)}
      />

      {/* 7. Modal Notifikasi & Pengumuman Resmi UIM */}
      <NotificationModal
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        currentUser={currentUser}
      />

      {/* 8. Footer Resmi UIM */}
      <FooterUIM />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
