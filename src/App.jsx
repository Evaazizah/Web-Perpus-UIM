import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AuthModal from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import AdminVerificationModal from './components/AdminVerificationModal';
import UimLogo from './components/UimLogo';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { ShieldCheck, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminVerificationOpen, setIsAdminVerificationOpen] = useState(false);
  const [currentView, setCurrentView] = useState('public'); // 'public' | 'admin'
  const [activeTab, setActiveTab] = useState('beranda');
  const [searchQuery, setSearchQuery] = useState('');

  // Listener autentikasi Supabase jika aktif
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadUserProfile(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (user) => {
    const { data } = await supabase.from('users').select('*').eq('id', user.id).single();
    const profile = data || { id: user.id, email: user.email, role: 'user' };
    setCurrentUser(profile);
    if (profile.role === 'admin') {
      setCurrentView('admin');
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentView('public');
  };

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthOpen(false);
    // Jika masuk sebagai admin, otomatis arahkan ke dashboard Administrasi Perpustakaan (SLiMS)
    if (user.role === 'admin') {
      setCurrentView('admin');
    }
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

      {/* 1. Header & Navigation (Digilib UIM) */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdminVerification={() => setCurrentView('admin')}
      />

      {/* 2. Konten Halaman Utama */}
      <main className="flex-1">
        <Home
          currentUser={currentUser}
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenAuth={() => setIsAuthOpen(true)}
          onSwitchToAdmin={() => setCurrentView('admin')}
          onOpenAdminVerification={() => setIsAdminVerificationOpen(true)}
        />
      </main>

      {/* 3. Auth Modal (Mahasiswa via KTM & Admin via Username/Password) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 4. Panel Verifikasi Mahasiswa Baru */}
      <AdminVerificationModal
        isOpen={isAdminVerificationOpen}
        onClose={() => setIsAdminVerificationOpen(false)}
      />

      {/* 5. Footer Resmi Perpustakaan Universitas Islam Madura */}
      <footer className="bg-[#022c22] text-white pt-10 pb-6 border-t-4 border-[#047857]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-emerald-900/60 text-xs text-emerald-100/80">
            {/* Kolom 1: Profil UIM */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UimLogo className="w-10 h-10" />
                <div>
                  <h4 className="font-bold text-white text-sm">UNIVERSITAS ISLAM MADURA</h4>
                  <p className="text-[11px] text-amber-300 font-semibold">PERPUSTAKAAN PUSAT (DIGILIB UIM)</p>
                </div>
              </div>
              <p className="text-emerald-100/70 leading-relaxed text-[11px]">
                Mewujudkan pusat keilmuan, riset literatur Islam, dan penyediaan referensi ilmiah berbasis teknologi cerdas di Madura.
              </p>
            </div>

            {/* Kolom 2: Sumber Daya Digital */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-sm uppercase text-amber-300">Khazanah Koleksi</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#katalog-section" className="hover:text-amber-300 transition-colors">Katalog Koleksi Populer (OPAC)</a></li>
                <li><a href="#rekomendasi-section" className="hover:text-amber-300 transition-colors">Sistem Rekomendasi Cerdas</a></li>
                <li><a href="#layanan-section" className="hover:text-amber-300 transition-colors">Repositori Skripsi & Tugas Akhir</a></li>
                <li><a href="#layanan-section" className="hover:text-amber-300 transition-colors">Jurnal Ilmiah Civitas UIM</a></li>
              </ul>
            </div>

            {/* Kolom 3: Layanan Pemustaka */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-sm uppercase text-amber-300">Layanan Pemustaka</h5>
              <ul className="space-y-1.5 text-[11px]">
                <li><button onClick={() => setIsAuthOpen(true)} className="hover:text-amber-300 transition-colors text-left">Pendaftaran Anggota Mahasiswa (KTM)</button></li>
                <li><a href="#katalog-section" className="hover:text-amber-300 transition-colors">Sirkulasi & Peminjaman Mandiri</a></li>
                <li><a href="#layanan-section" className="hover:text-amber-300 transition-colors">Surat Keterangan Bebas Pustaka</a></li>
                <li><a href="#layanan-section" className="hover:text-amber-300 transition-colors">Penyerahan Skripsi Digital</a></li>
              </ul>
            </div>

            {/* Kolom 4: Kontak & Lokasi Kampus */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-sm uppercase text-amber-300">Kontak Perpustakaan</h5>
              <p className="text-[11px] leading-relaxed">
                Gedung Perpustakaan Pusat UIM<br />
                Jl. Raya Bettet No. 49, Pamekasan, Jawa Timur<br />
                Email: perpustakaan@uim.ac.id
              </p>
              <div className="pt-2 text-[10px] text-emerald-300 font-semibold">
                Kode Kampus: 071064
              </div>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-200/60 gap-3">
            <p>© 2026 Perpustakaan Universitas Islam Madura (UIM Pamekasan). Hak Cipta Dilindungi.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>AI Collaborative Filtering Active</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
