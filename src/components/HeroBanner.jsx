
import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  Users,
  ArrowRight,
  X,
  Layers,
  CheckCircle2
} from 'lucide-react';

import bannerVideo from '../../Bg/Profile.mp4';

export default function HeroBanner({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  searchField = 'Semua Ruas',
  setSearchField,
  totalBooks = 0,
  totalCopies = 0,
  totalMembers = 0
}) {
  const [internalField, setInternalField] = useState(searchField);

  const activeField = setSearchField ? searchField : internalField;
  const updateField = setSearchField || setInternalField;

  const popularKeywords = [
    'Hukum Islam',
    'Kecerdasan Buatan',
    'Rekayasa Perangkat Lunak',
    'Metodologi Penelitian',
    'Pertanian Madura',
    'Pendidikan Islam'
  ];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const triggerSearch = (queryVal) => {
    const val = queryVal !== undefined ? queryVal : searchQuery;

    if (queryVal !== undefined) setSearchQuery(queryVal);

    const el = document.getElementById('katalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    if (onSearchSubmit) onSearchSubmit(val);
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#022c22] text-white pt-10 sm:pt-14 pb-20 sm:pb-28">

      {/* 1. VIDEO BACKGROUND HERO BANNER */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay Gelap agar teks terlihat jelas */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#022c22]/75 via-[#064e3b]/65 to-[#022c22]/90" />
      </div>

      {/* 2. DECORATIVE GRADIENT GLOWS */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-3/4 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* 3. MAIN HERO CONTENT */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-10">

        {/* Header Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-200 text-xs sm:text-sm font-medium shadow-lg hover:bg-white/15 transition-all mb-6">

          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>

          <span className="tracking-wide">
            Perpustakaan Digital Terintegrasi • UIM Pamekasan
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-tight max-w-4xl text-white">

          Jelajahi Khazanah Ilmu &{' '}

          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300">
            Riset Intelektual
          </span>

        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg text-emerald-100/90 max-w-2xl font-light leading-relaxed">

          Akses ribuan literatur akademik, katalog buku cetak, e-jurnal bereputasi, dan repositori karya ilmiah civitas akademika Universitas Islam Madura.

        </p>

        {/* 4. SEARCH SECTION */}
        <div className="w-full max-w-3xl mt-8 sm:mt-10">

          {/* Scope Selector Tabs */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 mb-3 overflow-x-auto pb-1 text-xs">

            {['Semua Ruas', 'Judul Buku', 'Pengarang', 'Subjek', 'ISBN'].map((field) => (

              <button
                key={field}
                type="button"
                onClick={() => updateField(field)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap backdrop-blur-md ${
                  activeField === field
                    ? 'bg-white text-[#064e3b] font-bold shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-100 border border-white/10'
                }`}
              >
                {field}
              </button>

            ))}

          </div>

          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-emerald-950/50 p-2 sm:p-2.5 border border-white flex flex-col sm:flex-row items-center gap-2">

            <div className="flex-1 flex items-center w-full px-3 text-slate-800">

              <Search className="w-5 h-5 text-emerald-700 shrink-0 mr-3" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Cari koleksi berdasarkan ${activeField.toLowerCase()}...`}
                className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium py-2"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                  title="Hapus kata kunci"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

            </div>

            <button
              type="button"
              onClick={() => triggerSearch()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#065f46] hover:to-[#047857] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
            >
              <span>Cari Koleksi</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>

          {/* 5. POPULAR KEYWORDS */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">

            <span className="text-emerald-200/80 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Populer:</span>
            </span>

            {popularKeywords.map((kw) => (

              <button
                key={kw}
                type="button"
                onClick={() => triggerSearch(kw)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-emerald-100 text-[11px] font-medium transition-colors border border-white/10"
              >
                {kw}
              </button>

            ))}

          </div>
        </div>
      </div>

      {/* 6. FLOATING STATISTICS CARD */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-12 sm:mt-16 -mb-32 relative z-20">

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-100 p-5 sm:p-7 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {/* Metric 1 */}
          <div className="flex items-center gap-3.5 pt-2 md:pt-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 border border-emerald-100">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {totalBooks}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Judul Koleksi
              </p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {totalCopies}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Eksemplar Buku
              </p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {totalMembers}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Anggota Terdaftar
              </p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="flex items-center gap-3.5 pt-2 md:pt-0 md:pl-6">

            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                24/7
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Layanan OPAC Online
              </p>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
