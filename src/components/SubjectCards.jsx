import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  BookMarked,
  Sparkles,
  Check,
  X,
  Library,
  ChevronRight
} from 'lucide-react';

// Ikon 1: Kesusastraan (Buku bertumpuk + Apel Merah)
function LiteratureIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="44" width="44" height="8" rx="2" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
      <line x1="16" y1="48" x2="48" y2="48" stroke="#0284c7" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="12" y="36" width="40" height="8" rx="2" fill="#fef08a" stroke="#eab308" strokeWidth="1.5" />
      <line x1="18" y1="40" x2="44" y2="40" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="14" y="28" width="36" height="8" rx="2" fill="#fed7aa" stroke="#f97316" strokeWidth="1.5" />
      <line x1="20" y1="32" x2="42" y2="32" stroke="#ea580c" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="32" cy="18" r="6.5" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
      <path d="M32 12 Q33 9 35 7" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M33 9 Q38 7 39 10 Q36 11 33 9 Z" fill="#22c55e" />
    </svg>
  );
}

// Ikon 2: Ilmu-ilmu Sosial (Sertifikat / Gulungan Dokumen dengan Pita Segel)
function SocialSciencesIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="10" width="36" height="44" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
      <line x1="20" y1="18" x2="44" y2="18" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="24" x2="44" y2="24" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="30" x2="38" y2="30" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="36" x2="32" y2="36" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="42" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
      <path d="M36 46 L33 53 L38 50 L43 53 L40 46" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    </svg>
  );
}

// Ikon 3: Ilmu-ilmu Terapan (Papan Tulis / Layar Proyektor E=mc²)
function AppliedSciencesIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="44" height="30" rx="3" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
      <text
        x="32"
        y="29"
        fill="#15803d"
        fontSize="11"
        fontWeight="bold"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        E=mc²
      </text>
      <line x1="32" y1="40" x2="32" y2="51" stroke="#64748b" strokeWidth="2.5" />
      <line x1="32" y1="51" x2="21" y2="58" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="51" x2="43" y2="58" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <line x1="32" y1="51" x2="32" y2="58" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Ikon 4: Kesenian, Hiburan, dan Olahraga (Botol Tinta + Pena Bulu)
function ArtsIcon() {
  return (
    <svg className="w-12 h-12" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="32" width="20" height="18" rx="4" fill="#fed7aa" stroke="#ea580c" strokeWidth="2" />
      <rect x="18" y="28" width="12" height="4" rx="1.5" fill="#ffedd5" stroke="#ea580c" strokeWidth="1.5" />
      <ellipse cx="24" cy="41" rx="5" ry="4" fill="#fb923c" opacity="0.6" />
      <path
        d="M25 32 Q34 20 46 8 C48 16 46 27 37 34 Q31 38 26 35 Z"
        fill="#fef08a"
        stroke="#ca8a04"
        strokeWidth="1.5"
      />
      <line x1="25" y1="34" x2="44" y2="10" stroke="#a16207" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Ikon 5: lihat lainnya... (9 Titik Kotak)
function ViewMoreIcon() {
  return (
    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-[#047857] group-hover:text-white transition-colors">
      <div className="grid grid-cols-3 gap-1">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-current" />
        ))}
      </div>
    </div>
  );
}

export default function SubjectCards({ selectedCategory, onSelectCategory }) {
  const [isDdcModalOpen, setIsDdcModalOpen] = useState(false);

  const subjects = [
    {
      title: 'Kesusastraan',
      sub: 'Sastra, Fiksi & Puisi',
      filterVal: 'Kesusastraan',
      icon: <LiteratureIcon />,
      colorGlow: 'hover:border-amber-300'
    },
    {
      title: 'Ilmu-ilmu Sosial',
      sub: 'Hukum, Sosiologi & Politik',
      filterVal: 'Ilmu-ilmu Sosial',
      icon: <SocialSciencesIcon />,
      colorGlow: 'hover:border-sky-300'
    },
    {
      title: 'Ilmu-ilmu Terapan',
      sub: 'Teknik, IT & Medis',
      filterVal: 'Ilmu-ilmu Terapan',
      icon: <AppliedSciencesIcon />,
      colorGlow: 'hover:border-emerald-300'
    },
    {
      title: 'Kesenian, Hiburan, dan Olahraga',
      sub: 'Seni, Arsitektur & Olahraga',
      filterVal: 'Kesenian, Hiburan, dan Olahraga',
      icon: <ArtsIcon />,
      colorGlow: 'hover:border-orange-300'
    },
    {
      title: 'Lihat Semua Subjek',
      sub: '10 Kelas Klasifikasi DDC',
      filterVal: 'ALL_MODAL',
      icon: <ViewMoreIcon />,
      colorGlow: 'hover:border-[#047857]'
    }
  ];

  const ddcClasses = [
    { code: '000', name: 'Karya Umum, Komputer & Informasi', count: 'Klasifikasi DDC 000' },
    { code: '100', name: 'Filsafat & Psikologi', count: 'Klasifikasi DDC 100' },
    { code: '200', name: 'Agama, Fiqih & Studi Islam Kontemporer', count: 'Klasifikasi DDC 200' },
    { code: '300', name: 'Ilmu-ilmu Sosial, Hukum & Politik', count: 'Klasifikasi DDC 300' },
    { code: '400', name: 'Bahasa & Linguistik (Arab, Inggris, Indo)', count: 'Klasifikasi DDC 400' },
    { code: '500', name: 'Sains Murni & Matematika', count: 'Klasifikasi DDC 500' },
    { code: '600', name: 'Ilmu Terapan, Teknologi & Pertanian', count: 'Klasifikasi DDC 600' },
    { code: '700', name: 'Kesenian, Desain & Olahraga', count: 'Klasifikasi DDC 700' },
    { code: '800', name: 'Kesusastraan & Novel', count: 'Klasifikasi DDC 800' },
    { code: '900', name: 'Sejarah, Biografi & Geografi', count: 'Klasifikasi DDC 900' }
  ];

  const handleCardClick = (subj) => {
    if (subj.filterVal === 'ALL_MODAL') {
      setIsDdcModalOpen(true);
    } else {
      if (selectedCategory === subj.filterVal) {
        onSelectCategory('Semua');
      } else {
        onSelectCategory(subj.filterVal);
      }
      const el = document.getElementById('katalog-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectDdc = (className) => {
    onSelectCategory(className);
    setIsDdcModalOpen(false);
    const el = document.getElementById('katalog-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#047857] text-xs font-bold tracking-wide uppercase mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Eksplorasi Keilmuan</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pilih Subjek yang Menarik bagi Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Temukan koleksi pustaka terkurasi berdasarkan rumpun disiplin ilmu akademik
          </p>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {subjects.map((subj, index) => {
            const isSelected = selectedCategory === subj.filterVal;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(subj)}
                className={`group relative bg-white rounded-2xl p-4 sm:p-5 flex flex-col items-center text-center cursor-pointer transition-all duration-300 border ${
                  isSelected
                    ? 'border-[#047857] ring-2 ring-[#047857]/30 shadow-xl -translate-y-1 bg-emerald-50/20'
                    : 'border-slate-200/80 hover:border-[#047857]/50 shadow-sm hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 bg-[#047857] text-white p-1 rounded-full shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                {/* Icon Container with Subtle Float */}
                <div className="h-16 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  {subj.icon}
                </div>

                {/* Title */}
                <h3
                  className={`text-xs sm:text-sm font-bold leading-snug transition-colors line-clamp-2 ${
                    isSelected ? 'text-[#047857]' : 'text-slate-800 group-hover:text-[#047857]'
                  }`}
                >
                  {subj.title}
                </h3>

                {/* Subtitle / Description */}
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-normal">
                  {subj.sub}
                </p>

                {/* Bottom line hint */}
                <div
                  className={`w-6 h-0.5 mt-3 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'w-12 bg-[#047857]'
                      : 'bg-transparent group-hover:w-8 group-hover:bg-[#047857]/50'
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Daftar Lengkap Klasifikasi DDC */}
      {isDdcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] flex flex-col border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Klasifikasi Subjek Dewey Decimal (DDC)
                  </h3>
                  <p className="text-xs text-slate-500">Pilih rumpun keilmuan untuk menyaring katalog buku</p>
                </div>
              </div>
              <button
                onClick={() => setIsDdcModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {ddcClasses.map((ddc) => (
                <button
                  key={ddc.code}
                  onClick={() => handleSelectDdc(ddc.name)}
                  className="w-full text-left p-3.5 rounded-xl border border-slate-200/80 hover:border-[#047857] hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-xs font-bold group-hover:bg-[#047857] group-hover:text-white transition-colors">
                      {ddc.code}
                    </span>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#047857]">
                        {ddc.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{ddc.count}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#047857] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  onSelectCategory('Semua');
                  setIsDdcModalOpen(false);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg mr-2"
              >
                Tampilkan Semua Subjek
              </button>
              <button
                onClick={() => setIsDdcModalOpen(false)}
                className="px-4 py-2 bg-[#047857] text-white text-xs font-bold rounded-lg shadow-sm hover:bg-[#064e3b]"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
