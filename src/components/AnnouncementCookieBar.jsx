import React, { useState } from 'react';

export default function AnnouncementCookieBar() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <aside aria-label="Pengumuman Perpustakaan UIM" className="bg-[#022c22] text-white text-xs py-2.5 px-4 sm:px-8 border-t-2 border-emerald-500 fixed bottom-0 left-0 right-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
        <p className="text-emerald-100 text-xs leading-relaxed max-w-4xl">
          <span className="font-bold text-amber-300">[PENGUMUMAN]</span> Selamat datang di Portal Perpustakaan Digital Universitas Islam Madura (UIM). Sistem ini mendukung Progressive Web App (PWA) untuk akses luring dan Sistem Rekomendasi Buku Cerdas.
        </p>
        <button
          onClick={() => setDismissed(true)}
          className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow shrink-0"
        >
          Saya Mengerti
        </button>
      </div>
    </aside>
  );
}
