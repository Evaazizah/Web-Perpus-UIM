import React, { useState, useEffect } from 'react';
import { getVisitorStats, subscribeVisitorStats, resetVisitorStats } from '../lib/visitorService';
import { useLanguage } from '../context/LanguageContext';
import {
  Users,
  Eye,
  Activity,
  Globe,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Radio
} from 'lucide-react';

export default function VisitorCounterWidget({
  variant = 'banner',
  currentUser = null
}) {
  const [stats, setStats] = useState(() => getVisitorStats());
  const [isResetting, setIsResetting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    setStats(getVisitorStats());
    const unsubscribe = subscribeVisitorStats((newStats) => {
      setStats({ ...newStats });
    });
    return () => unsubscribe();
  }, []);

  const handleAdminReset = async () => {
    const confirmReset = window.confirm(
      'MODE UJI COBA MANDIRI:\n\nApakah Anda yakin ingin mengosongkan (reset ke 0) seluruh hitungan statistik pengunjung di Cloud Firestore dan penyimpanan lokal?\n\nAngka akan kembali ke 0 dan bertambah secara dinamis saat ada kunjungan baru.'
    );
    if (!confirmReset) return;

    setIsResetting(true);
    try {
      const emptyStats = await resetVisitorStats();
      setStats(emptyStats);
      alert('Statistik pengunjung berhasil di-reset ke 0 untuk pengujian mandiri!');
    } catch (e) {
      alert('Gagal mereset statistik: ' + e.message);
    } finally {
      setIsResetting(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  // ================= VARIANT 1: COMPACT (Untuk Header / TopBar jika dibutuhkan) =================
  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-200 text-xs backdrop-blur-sm shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="font-bold text-white font-mono">{stats.activeOnline || 1} Online</span>
        <span className="text-emerald-500">•</span>
        <span>Hari ini: <strong className="text-amber-300 font-mono">{stats.todayVisitors || 0}</strong></span>
        <span className="text-emerald-500">•</span>
        <span>Total: <strong className="text-amber-300 font-mono">{(stats.totalHits || 0).toLocaleString('id-ID')}</strong></span>
      </div>
    );
  }

  // ================= VARIANT 2: MODERN PRE-FOOTER BANNER / CARD STATISTIK =================
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#043d30] to-[#022c22] border border-emerald-500/25 p-5 sm:p-7 text-white shadow-xl backdrop-blur-sm transition-all">
      
      {/* Efek visual glow aksen latar belakang */}
      <div className="absolute -top-16 -right-16 w-52 h-52 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-800/60 mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-md shadow-emerald-950/40 shrink-0">
            <Activity className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-amber-300 tracking-wide uppercase">
                Statistik Pengunjung Portal
              </h4>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-bold text-emerald-300 font-mono">
                Real-Time
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/80 font-medium mt-0.5">
              Pelacak Kunjungan & Sesi Aktif Sivitas Akademika Universitas Islam Madura
            </p>
          </div>
        </div>

        {/* Live Tracking Status Badge & Admin Reset */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          {/* Live Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-xs font-bold text-emerald-300 shadow-xs">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
            </span>
            <span className="tracking-wide">
              LIVE • <strong className="text-white font-mono">{stats.activeOnline || 1}</strong> Aktif
            </span>
          </div>

          {/* Tombol Khusus Admin untuk Mengosongkan Data Kunjungan */}
          {isAdmin && (
            <button
              type="button"
              disabled={isResetting}
              onClick={handleAdminReset}
              className="px-2.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
              title="Reset Statistik Pengunjung ke 0 (Mode Pengujian Mandiri)"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Reset ke 0</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid 4 Kartu Metrik Modern */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        
        {/* 1. Pengunjung Hari Ini */}
        <div className="bg-emerald-950/60 hover:bg-emerald-950/80 border border-amber-400/20 hover:border-amber-400/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Hari Ini
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-white tracking-tight">
            {(stats.todayVisitors || 0).toLocaleString('id-ID')}
          </div>
          <span className="block text-[11px] text-amber-300/80 font-medium mt-1">
            Civitas Unik Harian
          </span>
        </div>

        {/* 2. Tayangan Halaman Hari Ini (Hits) */}
        <div className="bg-emerald-950/60 hover:bg-emerald-950/80 border border-cyan-400/20 hover:border-cyan-400/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Hits Hari Ini
            </span>
            <div className="w-7 h-7 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
              <Eye className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-cyan-200 tracking-tight">
            {(stats.todayHits || 0).toLocaleString('id-ID')}
          </div>
          <span className="block text-[11px] text-cyan-300/80 font-medium mt-1">
            Total Tayangan Halaman
          </span>
        </div>

        {/* 3. Total Pengunjung Unik */}
        <div className="bg-emerald-950/60 hover:bg-emerald-950/80 border border-emerald-400/20 hover:border-emerald-400/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Total Pengunjung
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
            {(stats.totalVisitors || 0).toLocaleString('id-ID')}
          </div>
          <span className="block text-[11px] text-emerald-200/80 font-medium mt-1">
            Akumulasi Sivitas Terdata
          </span>
        </div>

        {/* 4. Total Kunjungan Seluruh Halaman */}
        <div className="bg-emerald-950/60 hover:bg-emerald-950/80 border border-purple-400/20 hover:border-purple-400/40 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              Total Kunjungan
            </span>
            <div className="w-7 h-7 rounded-xl bg-purple-400/15 border border-purple-400/30 flex items-center justify-center text-purple-300">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="font-mono text-2xl sm:text-3xl font-black text-emerald-100 tracking-tight">
            {(stats.totalHits || 0).toLocaleString('id-ID')}
          </div>
          <span className="block text-[11px] text-purple-200/80 font-medium mt-1">
            Total Akses Halaman SLiMS
          </span>
        </div>

      </div>

      {/* Footer Status Bar di dalam Widget */}
      <div className="mt-5 pt-3.5 border-t border-emerald-800/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-200/75 relative z-10">
        <div className="flex items-center gap-1.5 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Tersinkronisasi Otomatis dengan Cloud Firestore • Bertambah Dinamis Sesuai Kunjungan Riil</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-300/80 font-mono text-[10px]">
          <span>Gedung Pusat Perpustakaan UIM</span>
          <span>•</span>
          <span>Pamekasan, Madura</span>
        </div>
      </div>

    </div>
  );
}
