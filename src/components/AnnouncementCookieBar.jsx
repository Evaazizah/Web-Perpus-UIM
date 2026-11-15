import React, { useState } from 'react';
import { Info, X, Check } from 'lucide-react';

export default function AnnouncementCookieBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Pengumuman Perpustakaan UIM" className="bg-[#022c22] text-white text-xs py-2.5 px-4 sm:px-8 border-t border-emerald-500/40 fixed bottom-0 left-0 right-0 z-50 shadow-2xl backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-emerald-800/80 text-amber-300 flex items-center justify-center shrink-0">
            <Info className="w-3.5 h-3.5" />
          </div>
          <p className="text-emerald-100 text-xs leading-relaxed">
            <span className="font-bold text-amber-300">Pemberitahuan Sistem:</span> Selamat datang di Portal Perpustakaan Digital Universitas Islam Madura (UIM) berbasis <strong className="text-white">SLiMS 9.8.0 Bulian</strong> dengan dukungan rekomendasi literatur Item-Based Collaborative Filtering dan Progressive Web App (PWA).
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5 text-amber-300" />
          <span>Saya Mengerti</span>
        </button>
      </div>
    </aside>
  );
}
