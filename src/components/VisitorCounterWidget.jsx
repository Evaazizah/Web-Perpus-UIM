import React, { useState, useEffect } from 'react';
import { getVisitorStats, subscribeVisitorStats } from '../lib/visitorService';
import { Users, Eye, Activity, Globe, Sparkles } from 'lucide-react';

export default function VisitorCounterWidget({ variant = 'footer' }) {
  const [stats, setStats] = useState(getVisitorStats());

  useEffect(() => {
    const unsubscribe = subscribeVisitorStats((newStats) => {
      setStats({ ...newStats });
    });
    return () => unsubscribe();
  }, []);

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs backdrop-blur-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="font-semibold text-white">{stats.activeOnline} Online</span>
        <span className="text-emerald-500">•</span>
        <span>Hari ini: <strong className="text-amber-300">{stats.todayVisitors}</strong></span>
        <span className="text-emerald-500">•</span>
        <span>Total: <strong className="text-amber-300">{stats.totalHits.toLocaleString('id-ID')}</strong></span>
      </div>
    );
  }

  // Variant default (untuk Footer atau Panel Statistik)
  return (
    <div className="bg-[#033a2e]/90 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 text-white shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between pb-3 border-b border-emerald-800/60 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Activity className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h5 className="font-bold text-xs uppercase tracking-wider text-amber-300">Statistik Pengunjung</h5>
            <p className="text-[10px] text-emerald-200/80">Pelacak Sesi Real-Time Portal Digilib UIM</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/30 text-[11px] text-emerald-300 font-semibold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>{stats.activeOnline} Aktif</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-center">
        {/* 1. Pengunjung Hari Ini */}
        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-300 mb-0.5">
            <Users className="w-3 h-3 text-amber-400" />
            <span>Hari Ini</span>
          </div>
          <span className="font-extrabold text-base sm:text-lg text-white">
            {stats.todayVisitors.toLocaleString('id-ID')}
          </span>
          <span className="block text-[9px] text-emerald-200/60">Civitas Unik</span>
        </div>

        {/* 2. Tayangan Halaman Hari Ini */}
        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-300 mb-0.5">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>Hits Hari Ini</span>
          </div>
          <span className="font-extrabold text-base sm:text-lg text-cyan-200">
            {stats.todayHits.toLocaleString('id-ID')}
          </span>
          <span className="block text-[9px] text-emerald-200/60">Page Views</span>
        </div>

        {/* 3. Total Pengunjung Unik */}
        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-300 mb-0.5">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>Total Pengunjung</span>
          </div>
          <span className="font-extrabold text-base sm:text-lg text-amber-300">
            {stats.totalVisitors.toLocaleString('id-ID')}
          </span>
          <span className="block text-[9px] text-emerald-200/60">Pengunjung Unik</span>
        </div>

        {/* 4. Total Hits Seluruh Halaman */}
        <div className="bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-800/40">
          <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-300 mb-0.5">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Total Kunjungan</span>
          </div>
          <span className="font-extrabold text-base sm:text-lg text-emerald-100">
            {stats.totalHits.toLocaleString('id-ID')}
          </span>
          <span className="block text-[9px] text-emerald-200/60">Total Halaman Dilihat</span>
        </div>
      </div>
    </div>
  );
}

