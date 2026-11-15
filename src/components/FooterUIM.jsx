import React from 'react';
import UimLogo from './UimLogo';
import VisitorCounterWidget from './VisitorCounterWidget';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Mail, Youtube, Instagram, Globe } from 'lucide-react';

export default function FooterUIM() {
  const { t } = useLanguage();

  return (
    <footer className="relative bg-[#064e3b] text-white pt-10 pb-8 mt-16 border-t-4 border-[#047857] overflow-hidden">
      {/* Subtle Islamic Geometric Watermark on the far right */}
      <div className="absolute right-0 top-0 bottom-0 w-80 opacity-10 pointer-events-none flex items-center justify-end pr-6">
        <svg viewBox="0 0 120 120" className="h-40 w-40 stroke-current fill-none stroke-[1]">
          <polygon points="60,6 78,28 108,28 92,54 108,80 78,80 60,102 42,80 12,80 28,54 12,28 42,28" />
          <polygon points="60,20 86,60 60,100 34,60" />
          <circle cx="60" cy="60" r="22" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8 pb-8 border-b border-emerald-800/80">
          
          {/* 1. Left Brand Identity (Sesuai Mockup Gambar) */}
          <div className="flex items-center gap-3.5 text-center md:text-left">
            <UimLogo className="w-12 h-12 sm:w-14 sm:h-14 shrink-0" />
            <div className="leading-snug">
              <h3 className="font-extrabold text-base sm:text-lg tracking-tight text-white font-serif">
                {t('lib_title_1')}
              </h3>
              <h4 className="font-extrabold text-base sm:text-lg tracking-tight text-white font-serif">
                {t('lib_title_2')}
              </h4>
            </div>
          </div>

          {/* 2. Middle Contact & Address (Sesuai Mockup Gambar) */}
          <div className="space-y-2 text-xs text-emerald-100/90 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <MapPin className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>{t('footer_address')}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
              <a href="mailto:perpus@uim.ac.id" className="hover:text-amber-300 transition-colors">
                perpus@uim.ac.id
              </a>
            </div>

            {/* Social Media Links (Sesuai Mockup Gambar) */}
            <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
              <span className="font-bold text-xs text-white">{t('footer_follow')}</span>
              <a
                href="https://youtube.com/@uimpamekasan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:text-amber-300 transition-colors shadow-2xs"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/uimpamekasan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:text-amber-300 transition-colors shadow-2xs"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://uim.ac.id"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white hover:text-amber-300 transition-colors shadow-2xs"
                title="Portal Resmi UIM"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 3. Right Copyright & SLiMS bulian badge (Sesuai Mockup Gambar) */}
          <div className="text-center md:text-right text-xs text-emerald-200/80 space-y-1">
            <p className="font-bold text-white text-sm">
              © 2025 Perpustakaan UIM
            </p>
            <p>{t('footer_rights')}</p>
            <p className="text-[11px] text-emerald-300 pt-1 font-mono">
              SLiMS 9.8.0 Bulian • Cloud Firestore
            </p>
          </div>

        </div>

        {/* Real-time Visitor Counter Widget */}
        <div className="py-6 border-b border-emerald-800/60">
          <VisitorCounterWidget variant="footer" />
        </div>

        {/* Bottom Bar: Thesis IBCF Research Indicator */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-200/70 gap-2">
          <p>{t('footer_thesis_desc')}</p>
          <p>Universitas Islam Madura (Pamekasan, Madura)</p>
        </div>
      </div>
    </footer>
  );
}
