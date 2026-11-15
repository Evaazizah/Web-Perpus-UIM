import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getStoredNews, subscribeNews } from '../lib/newsService';
import {
  Newspaper,
  Star,
  Bell,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Megaphone,
  BookOpen,
  Plus,
  Sparkles
} from 'lucide-react';

export default function ThreeCardsHub({
  recommendations = [],
  onSelectBook,
  onOpenNewsModal,
  onOpenScheduleModal
}) {
  const { t } = useLanguage();
  const [recIndex, setRecIndex] = useState(0);
  const [newsItems, setNewsItems] = useState(getStoredNews());

  useEffect(() => {
    setNewsItems(getStoredNews());
    const unsub = subscribeNews((data) => {
      setNewsItems(data);
    });
    return () => unsub();
  }, []);

  // Data rekomendasi riil dari algoritma Item-Based Collaborative Filtering (IBCF)
  const displayedRecs = Array.isArray(recommendations) ? recommendations : [];
  const visibleRecs = displayedRecs.slice(recIndex, recIndex + 3);

  const handlePrevRec = () => {
    setRecIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, displayedRecs.length - 3)));
  };

  const handleNextRec = () => {
    setRecIndex((prev) => (prev + 3 < displayedRecs.length ? prev + 1 : 0));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10 sm:mt-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ================= KARTU 1: BERITA TERBARU ================= */}
        <div id="berita-section" className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col justify-between overflow-hidden transition-all">
          {/* Header Banner Hijau Tua */}
          <div className="bg-[#064e3b] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-emerald-300" />
              <h3 className="text-sm font-bold tracking-wide">{t('card1_title')}</h3>
            </div>
            <button
              type="button"
              onClick={onOpenNewsModal}
              className="text-[11px] text-emerald-200 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{t('view_all')}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Isi Konten Berita */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {newsItems && newsItems.length > 0 ? (
              <div className="flex items-start gap-4">
                <img
                  src={newsItems[0].image}
                  alt={newsItems[0].title}
                  className="w-28 h-20 sm:w-36 sm:h-24 object-cover rounded-xl shadow-2xs shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-extrabold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-[#047857] transition-colors cursor-pointer"
                    onClick={onOpenNewsModal}
                  >
                    {newsItems[0].title}
                  </h4>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    <span>{newsItems[0].date}</span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {newsItems[0].summary || newsItems[0].desc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Newspaper className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700 text-xs">Belum Ada Warta Berita</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Berita dan informasi kegiatan perpustakaan akan ditampilkan di sini.
                </p>
              </div>
            )}

            {/* Pagination Dots */}
            {newsItems && newsItems.length > 1 && (
              <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 border-t border-slate-50">
                {newsItems.slice(0, 4).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#047857]' : 'bg-slate-300'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= KARTU 2: REKOMENDASI UNTUK ANDA (IBCF INTI) ================= */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col justify-between overflow-hidden transition-all">
          {/* Header Banner Hijau Tua */}
          <div className="bg-[#064e3b] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <h3 className="text-sm font-bold tracking-wide">{t('card2_title')}</h3>
            </div>
            <a
              href="#katalog-section"
              className="text-[11px] text-emerald-200 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{t('view_all')}</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {/* Isi Buku Rekomendasi Riil atau Status Kosong */}
          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            {displayedRecs.length > 0 ? (
              <div className="relative flex items-center justify-between gap-2">
                {displayedRecs.length > 3 && (
                  <button
                    type="button"
                    onClick={handlePrevRec}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-[#047857] hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors shadow-2xs z-10"
                    title="Buku Sebelumnya"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Buku Rekomendasi Riil dari Algoritma IBCF */}
                <div
                  className={`flex-1 grid gap-2.5 ${
                    visibleRecs.length === 1
                      ? 'grid-cols-1 max-w-[140px] mx-auto'
                      : visibleRecs.length === 2
                      ? 'grid-cols-2 max-w-[280px] mx-auto'
                      : 'grid-cols-3'
                  }`}
                >
                  {visibleRecs.map((bk, i) => (
                    <div
                      key={bk.id || i}
                      onClick={() => onSelectBook && onSelectBook(bk)}
                      className="flex flex-col items-center text-center cursor-pointer group select-none"
                    >
                      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden bg-slate-100 shadow-xs border border-slate-200 group-hover:scale-105 group-hover:shadow-md transition-all duration-300 relative">
                        {bk.cover_url ? (
                          <img
                            src={bk.cover_url}
                            alt={bk.judul}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-900 text-white p-2">
                            <BookOpen className="w-6 h-6 text-amber-300 mb-1" />
                            <span className="text-[9px] font-bold text-center line-clamp-2">{bk.judul}</span>
                          </div>
                        )}
                        {bk.predictedScore && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 font-black text-[9px] shadow-xs flex items-center gap-0.5">
                            ★ {bk.predictedScore}
                          </span>
                        )}
                      </div>
                      <span className="mt-1.5 text-[10px] sm:text-[11px] font-bold text-slate-800 group-hover:text-[#047857] line-clamp-2 leading-tight transition-colors">
                        {bk.judul}
                      </span>
                      <span className="text-[9px] text-slate-400 truncate max-w-full">
                        {bk.penulis}
                      </span>
                    </div>
                  ))}
                </div>

                {displayedRecs.length > 3 && (
                  <button
                    type="button"
                    onClick={handleNextRec}
                    className="w-6 h-6 rounded-full bg-slate-100 hover:bg-[#047857] hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors shadow-2xs z-10"
                    title="Buku Selanjutnya"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-6 px-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-1.5" />
                <p className="font-bold text-slate-700 text-xs">Belum Ada Rekomendasi Buku</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Rekomendasi Collaborative Filtering akan aktif otomatis setelah terdapat koleksi buku dan interaksi rating pemustaka.
                </p>
              </div>
            )}

            {/* Pagination Dots jika buku > 3 */}
            {displayedRecs.length > 3 && (
              <div className="mt-4 pt-3 flex items-center justify-center gap-1.5 border-t border-slate-50">
                <span className={`w-2 h-2 rounded-full ${recIndex === 0 ? 'bg-[#047857]' : 'bg-slate-300'}`} />
                <span className={`w-2 h-2 rounded-full ${recIndex === 1 ? 'bg-[#047857]' : 'bg-slate-300'}`} />
                <span className={`w-2 h-2 rounded-full ${recIndex >= 2 ? 'bg-[#047857]' : 'bg-slate-300'}`} />
              </div>
            )}
          </div>
        </div>

        {/* ================= KARTU 3: INFORMASI PENTING ================= */}
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-100 flex flex-col justify-between overflow-hidden transition-all">
          {/* Header Banner Hijau Tua */}
          <div className="bg-[#064e3b] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-300" />
              <h3 className="text-sm font-bold tracking-wide">{t('card3_title')}</h3>
            </div>
          </div>

          {/* Isi Konten Jam Layanan & Megaphone 3D Graphic */}
          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 border border-emerald-100 shadow-2xs">
                  <Calendar className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {t('service_hours')}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 font-medium">
                    {t('service_hours_desc')}
                  </p>
                </div>
              </div>

              {/* Megaphone Green 3D Accent Icon */}
              <div className="shrink-0 text-emerald-600 rotate-[-12deg] drop-shadow-sm pr-1">
                <Megaphone className="w-12 h-12 stroke-[1.8] fill-emerald-100 text-[#047857]" />
              </div>
            </div>

            {/* Pill Button: Lihat Detail */}
            <div className="mt-6 pt-2">
              <button
                type="button"
                onClick={onOpenScheduleModal}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-[#047857] font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-2xs active:scale-95"
              >
                <span>{t('view_detail')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

