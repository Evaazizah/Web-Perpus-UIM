import React from 'react';
import bannerVideo from '../../Bg/Profile.mp4';
import { useLanguage } from '../context/LanguageContext';
import { Search, X } from 'lucide-react';

export default function HeroBanner({
  searchQuery = '',
  setSearchQuery,
  onSearchSubmit
}) {
  const { t } = useLanguage();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      triggerSearch();
    }
  };

  const triggerSearch = (queryVal) => {
    const val = queryVal !== undefined ? queryVal : searchQuery;

    if (queryVal !== undefined && setSearchQuery) {
      setSearchQuery(queryVal);
    }

    const el = document.getElementById('katalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }

    if (onSearchSubmit) {
      onSearchSubmit(val);
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-[#064e3b]">
      
      {/* 1. BACKGROUND VIDEO RESMI UIM DENGAN OVERLAY HIJAU TRANSPARAN (BUKAN BLUR PUTIH & TIDAK TERLALU TEBAL) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover object-center"
        />
        {/* Soft translucent green overlay: tidak memakai blur putih, hijau elegan tidak terlalu tebal agar video tetap terlihat jelas */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#022c22]/85 via-[#064e3b]/60 to-[#022c22]/30" />
      </div>

      {/* 2. HERO CONTENT CONTAINER (Sesuai Mockup Gambar Target) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-16 sm:pb-24 z-10 flex flex-col justify-center min-h-[360px] sm:min-h-[420px]">
        
        <div className="max-w-2xl">
          {/* Decorative 3-arc green spark accent (Sesuai Mockup) */}
          <div className="flex items-center gap-2 mb-2.5">
            <svg
              className="w-6 h-6 text-emerald-300 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M4 12a8 8 0 0 1 8-8" />
              <path d="M2 12a10 10 0 0 1 10-10" />
              <path d="M6 12a6 6 0 0 1 6-6" />
            </svg>
            <span className="text-emerald-100 text-lg sm:text-2xl font-bold tracking-tight drop-shadow-sm">
              {t('hero_welcome')}
            </span>
          </div>

          {/* Headline Utama: Perpustakaan Universitas Islam Madura */}
          <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-tight font-serif drop-shadow-md">
            {t('hero_title_1')}<br className="hidden sm:inline" /> {t('hero_title_2')}
          </h1>

          {/* Subtitle Slogan: Baca • Telusuri • Temukan */}
          <p className="mt-2 text-emerald-200 text-sm sm:text-lg font-bold tracking-wide drop-shadow-sm">
            {t('hero_slogan_1')} <span className="text-amber-300">•</span> {t('hero_slogan_2')} <span className="text-amber-300">•</span> {t('hero_slogan_3')}
          </p>

          {/* 3. BILAH PENCARIAN BERBENTUK PILL TUNGGAL (Tanpa Duplikasi Tab & Tanpa Duplikasi Advanced Search) */}
          <div className="mt-6 relative w-full max-w-xl">
            <div className="bg-white rounded-full shadow-2xl p-1.5 sm:p-2 border border-white/60 flex items-center transition-all hover:border-emerald-300">
              
              {/* Search Icon Hijau */}
              <div className="pl-3.5 pr-2 text-[#047857] shrink-0">
                <Search className="w-5 h-5 stroke-[2.5]" />
              </div>

              {/* Input Text Bersih */}
              <input
                id="search-input-hero"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('hero_search_placeholder')}
                className="w-full bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium py-2 px-1"
              />

              {/* Tombol Hapus Input jika ada teks */}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full mr-1 transition-colors"
                  title="Hapus kata kunci"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Pill Button: Cari */}
              <button
                type="button"
                onClick={() => triggerSearch()}
                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs sm:text-sm rounded-full shadow-md transition-all active:scale-95 shrink-0"
              >
                {t('hero_search_btn')}
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 4. CURVED WAVE BOTTOM DIVIDER (Sesuai Gelombang Hijau/Putih di Mockup Gambar) */}
      <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="relative block w-full h-8 sm:h-12 text-[#fafbfc] fill-current"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M0,0 C150,90 400,120 600,60 C800,0 1050,90 1200,40 L1200,120 L0,120 Z"></path>
        </svg>
      </div>

    </div>
  );
}
