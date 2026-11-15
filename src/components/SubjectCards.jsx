import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  BookMarked,
  BookOpen,
  Scale,
  Cpu,
  Languages,
  LayoutGrid,
  Check,
  X,
  Library,
  ChevronRight
} from 'lucide-react';

export default function SubjectCards({ selectedCategory, onSelectCategory }) {
  const [isDdcModalOpen, setIsDdcModalOpen] = useState(false);

  const subjects = [
    {
      title: 'Agama & Keislaman',
      ddc: 'DDC 200',
      sub: 'Al-Qur’an, Hadits, Fiqih & Dakwah',
      filterVal: 'Agama',
      icon: <BookOpen className="w-7 h-7 text-[#047857]" />,
      iconBg: 'bg-emerald-50 text-[#047857] border-emerald-100'
    },
    {
      title: 'Ilmu-ilmu Sosial & Hukum',
      ddc: 'DDC 300',
      sub: 'Hukum Islam, Ekonomi & Politik',
      filterVal: 'Ilmu-ilmu Sosial',
      icon: <Scale className="w-7 h-7 text-sky-600" />,
      iconBg: 'bg-sky-50 text-sky-600 border-sky-100'
    },
    {
      title: 'Ilmu Terapan & Teknologi',
      ddc: 'DDC 600',
      sub: 'Teknik Informatika & Pertanian',
      filterVal: 'Ilmu-ilmu Terapan',
      icon: <Cpu className="w-7 h-7 text-teal-600" />,
      iconBg: 'bg-teal-50 text-teal-600 border-teal-100'
    },
    {
      title: 'Kesusastraan & Bahasa',
      ddc: 'DDC 400 & 800',
      sub: 'Bahasa Arab, Inggris & Sastra',
      filterVal: 'Kesusastraan',
      icon: <Languages className="w-7 h-7 text-amber-600" />,
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100'
    },
    {
      title: 'Seluruh Klasifikasi DDC',
      ddc: 'SLiMS 9.8.0',
      sub: '10 Kelas Klasifikasi SLiMS',
      filterVal: 'ALL_MODAL',
      icon: <LayoutGrid className="w-7 h-7 text-indigo-600" />,
      iconBg: 'bg-indigo-50 text-indigo-600 border-indigo-100'
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#047857] text-xs font-semibold tracking-wide uppercase mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Kategori Disiplin Ilmu</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Eksplorasi Berdasarkan Subjek Keilmuan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Penelusuran koleksi pustaka terstruktur mengacu pada standar Dewey Decimal Classification (DDC) SLiMS 9.8.0 Bulian
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
                    ? 'border-[#047857] ring-2 ring-[#047857]/20 shadow-lg -translate-y-1 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-[#047857]/40 shadow-xs hover:shadow-md hover:-translate-y-1'
                }`}
              >
                {/* Active Indicator Badge */}
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 bg-[#047857] text-white p-1 rounded-full shadow-xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}

                {/* DDC Classification Badge */}
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 mb-3">
                  {subj.ddc}
                </span>

                {/* Modern Icon Container */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 border transition-transform duration-300 group-hover:scale-105 ${subj.iconBg}`}>
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

      {/* Modal 10 Kelas DDC SLiMS 9.8.0 Bulian */}
      {isDdcModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    10 Kelas Utama Dewey Decimal Classification (DDC)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Standar klasifikasi penataan rak buku SLiMS 9.8.0 Bulian Perpustakaan UIM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDdcModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 overflow-y-auto space-y-2 flex-1 pr-1">
              {ddcClasses.map((item) => (
                <div
                  key={item.code}
                  onClick={() => handleSelectDdc(item.name.split(',')[0])}
                  className="p-3 rounded-xl border border-slate-200/80 hover:border-[#047857] hover:bg-emerald-50/30 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-slate-100 group-hover:bg-[#047857] group-hover:text-white transition-colors text-slate-700">
                      {item.code}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#047857] transition-colors">
                        {item.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {item.count}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#047857] group-hover:translate-x-0.5 transition-all" />
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Klik salah satu kelas untuk menyaring katalog buku</span>
              <button
                type="button"
                onClick={() => setIsDdcModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
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
