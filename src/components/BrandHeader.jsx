import React from 'react';
import UimLogo from './UimLogo';
import { useLanguage } from '../context/LanguageContext';

export default function BrandHeader({ onGoHome }) {
  const { t } = useLanguage();

  return (
    <div className="relative bg-white py-3 sm:py-4 px-4 sm:px-8 border-b border-slate-100 overflow-hidden">
      {/* Subtle Islamic Geometric Pattern on the far right */}
      <div className="absolute right-0 top-0 bottom-0 w-80 opacity-[0.06] pointer-events-none flex items-center justify-end pr-6">
        <svg viewBox="0 0 120 120" className="h-32 w-32 stroke-[#064e3b] fill-none stroke-[1]">
          <polygon points="60,6 78,28 108,28 92,54 108,80 78,80 60,102 42,80 12,80 28,54 12,28 42,28" />
          <polygon points="60,20 86,60 60,100 34,60" />
          <circle cx="60" cy="60" r="22" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">
        {/* Brand identity: Logo, Name, and Slogan (Sesuai Mockup Gambar Target) */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 sm:gap-4 cursor-pointer select-none group"
        >
          <UimLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 transition-transform group-hover:scale-105" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
            <div className="leading-tight">
              <h1 className="text-slate-900 font-extrabold text-base sm:text-xl tracking-tight leading-snug group-hover:text-[#047857] transition-colors">
                {t('lib_title_1')}
              </h1>
              <h2 className="text-slate-900 font-extrabold text-base sm:text-xl tracking-tight leading-snug group-hover:text-[#047857] transition-colors">
                {t('lib_title_2')}
              </h2>
            </div>
            {/* Slogan with vertical divider */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="h-9 w-[1.5px] bg-slate-300" />
              <p className="text-emerald-700 italic font-serif text-sm font-semibold tracking-wide">
                {t('slogan')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
