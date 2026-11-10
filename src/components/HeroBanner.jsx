
import React, { useState } from 'react';
import bannerVideo from '../../Bg/Profile.mp4';

import {
  Search,
  BookOpen,
  Users,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
  Clock,
  Filter,
  FileCheck,
  Award,
  ShieldCheck,
  Globe2,
  BookPlus,
  ChevronDown,
  Building2,
  BookmarkCheck
} from 'lucide-react';

export default function HeroBanner({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  searchField = 'Semua Ruas',
  setSearchField,
  totalBooks = 0,
  totalCopies = 0,
  totalMembers = 0,
  onOpenServiceModal
}) {
  const [internalField, setInternalField] = useState(searchField);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filterType, setFilterType] = useState('Semua');
  const [filterLocation, setFilterLocation] = useState('Semua Lokasi');
  const [filterYear, setFilterYear] = useState('');

  const activeField = setSearchField ? searchField : internalField;
  const updateField = setSearchField || setInternalField;

  // Kata kunci penelusuran yang sering dicari pemustaka UIM
  const popularKeywords = [
    'Hukum Islam',
    'Pendidikan Agama Islam',
    'Pertanian Madura',
    'Sistem Informasi',
    'Metodologi Penelitian',
    'Ekonomi Syariah'
  ];

  // 6 Layanan Unggulan Akademik
  const noveltyServices = [
    {
      id: 'opac',
      title: 'Katalog OPAC',
      desc: 'Penelusuran buku cetak & e-book di rak perpustakaan',
      icon: BookOpen,
      badge: 'SLiMS 9',
      color: 'emerald',
      action: () => {
        const el = document.getElementById('katalog-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 'repositori',
      title: 'Repositori Tugas Akhir',
      desc: 'Skripsi, tesis, dan naskah publikasi ilmiah civitas UIM',
      icon: FileCheck,
      badge: 'DSpace',
      color: 'blue',
      action: () => {
        if (onOpenServiceModal) onOpenServiceModal('repositori');
      }
    },
    {
      id: 'bebas-pustaka',
      title: 'Bebas Pustaka Online',
      desc: 'Layanan mandiri surat bebas tanggungan syarat wisuda',
      icon: Award,
      badge: 'Kelulusan',
      color: 'amber',
      action: () => {
        if (onOpenServiceModal) onOpenServiceModal('bebas-pustaka');
      }
    },
    {
      id: 'turnitin',
      title: 'Uji Kemiripan Turnitin',
      desc: 'Pemeriksaan orisinalitas naskah dan anti-plagiasi karya',
      icon: ShieldCheck,
      badge: 'Orisinalitas',
      color: 'teal',
      action: () => {
        if (onOpenServiceModal) onOpenServiceModal('turnitin');
      }
    },
    {
      id: 'ejournal',
      title: 'E-Journal & Database',
      desc: 'Akses jurnal nasional (Sinta/Garuda) & internasional',
      icon: Globe2,
      badge: 'E-Resource',
      color: 'indigo',
      action: () => {
        if (onOpenServiceModal) onOpenServiceModal('ejournal');
      }
    },
    {
      id: 'usulan-buku',
      title: 'Usulan Koleksi Buku',
      desc: 'Rekomendasi pengadaan buku baru oleh dosen & mahasiswa',
      icon: BookPlus,
      badge: 'Pengadaan',
      color: 'purple',
      action: () => {
        if (onOpenServiceModal) onOpenServiceModal('usulan-buku');
      }
    }
  ];

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
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    if (onSearchSubmit) onSearchSubmit(val);
  };

  // Status Jam Layanan Perpustakaan
  const getOperatingStatus = () => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;

    if (day >= 1 && day <= 4) {
      if (currentTime >= 8 && currentTime < 16) {
        return {
          isOpen: true,
          text: 'BUKA HARI INI • 08.00 - 16.00 WIB'
        };
      }

      return {
        isOpen: false,
        text: 'TUTUP • Buka Besok 08.00 WIB'
      };
    } else if (day === 5) {
      if (currentTime >= 8 && currentTime < 15.5) {
        return {
          isOpen: true,
          text: 'BUKA HARI INI • 08.00 - 15.30 WIB'
        };
      }

      return {
        isOpen: false,
        text: 'TUTUP • Buka Senin 08.00 WIB'
      };
    } else {
      return {
        isOpen: false,
        text: 'LIBUR AKHIR PEKAN • Buka Senin 08.00 WIB'
      };
    }
  };

  const opStatus = getOperatingStatus();

  return (
    <div className="relative w-full bg-[#064e3b] text-white overflow-hidden border-b border-emerald-900/60">

      {/* 1. VIDEO BACKGROUND HERO BANNER */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        <video
          src={bannerVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Overlay hijau tua agar teks tetap terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#022c22]/75 via-[#064e3b]/65 to-[#022c22]/90" />

        {/* Pola geometris islami yang halus */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="slims-pattern"
              width="60"
              height="60"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M30 0 L60 30 L30 60 L0 30 Z"
                fill="none"
                stroke="#ffffff"
                strokeWidth="1"
              />
              <circle
                cx="30"
                cy="30"
                r="10"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
              />
              <rect
                x="25"
                y="25"
                width="10"
                height="10"
                fill="none"
                stroke="#ffffff"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#slims-pattern)"
          />
        </svg>
      </div>

      {/* 2. KONTEN UTAMA HERO PENCARIAN SLIMS 9 BULIAN */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-14 sm:pb-18 z-10 flex flex-col items-center text-center">

        {/* Official SLiMS 9 Bulian Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-100 text-xs sm:text-[13px] font-medium mb-4 shadow-sm">

          <Building2 className="w-3.5 h-3.5 text-amber-300" />

          <span className="font-semibold text-white">
            SISTEM OTOMASI PERPUSTAKAAN TERPADU
          </span>

          <span className="text-emerald-300">•</span>

          <span className="text-amber-300 font-bold">
            SLiMS 9 Bulian
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
          Katalog Akses Terbuka Perpustakaan (OPAC)
        </h1>

        {/* Subtitle */}
        <p className="mt-2.5 sm:mt-3.5 text-xs sm:text-sm md:text-base text-emerald-100/90 max-w-2xl font-normal leading-relaxed">
          Temukan koleksi buku teks, monograf, e-book, repositori skripsi, dan karya ilmiah civitas akademika Universitas Islam Madura secara cepat dan akurat.
        </p>

        {/* 3. BILAH PENCARIAN SLIMS 9 BULIAN */}
        <div className="w-full max-w-3xl mt-6 sm:mt-8">

          {/* Ruas Pencarian */}
          <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-2.5 overflow-x-auto pb-1 text-xs">

            {['Semua Ruas', 'Judul Buku', 'Pengarang', 'Subjek', 'ISBN'].map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => updateField(field)}
                className={`px-3 py-1.5 rounded-t-lg font-semibold transition-all whitespace-nowrap text-xs border-b-2 ${
                  activeField === field
                    ? 'bg-white text-[#064e3b] border-amber-400 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-emerald-100 border-transparent'
                }`}
              >
                {field}
              </button>
            ))}
          </div>

          {/* Kotak Input Pencarian */}
          <div className="bg-white rounded-2xl shadow-xl shadow-emerald-950/40 p-2 sm:p-2.5 border-2 border-emerald-400/40 flex flex-col sm:flex-row items-center gap-2">

            <div className="flex-1 flex items-center w-full px-3 text-slate-800">

              <Search className="w-5 h-5 text-emerald-700 shrink-0 mr-3" />

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ketik kata kunci pencarian berdasarkan ${activeField.toLowerCase()}...`}
                className="w-full bg-transparent text-xs sm:text-sm md:text-base text-slate-900 placeholder-slate-400 focus:outline-none font-medium py-2"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 mr-2"
                  title="Hapus kata kunci"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">

              <button
                type="button"
                onClick={() => triggerSearch()}
                className="flex-1 sm:flex-initial px-6 py-3 rounded-xl bg-[#047857] hover:bg-[#065f46] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Cari Koleksi</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          </div>

          {/* Toggle Pencarian Spesifik */}
          <div className="mt-2.5 flex items-center justify-between text-xs px-1">

            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="text-emerald-200 hover:text-amber-300 font-medium flex items-center gap-1.5 transition-colors"
            >
              <Filter className="w-3.5 h-3.5" />

              <span>Pencarian Spesifik (Advanced Search)</span>

              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isAdvancedOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Status Operasional */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-200 font-medium">

              <span
                className={`w-2 h-2 rounded-full ${
                  opStatus.isOpen
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-amber-400'
                }`}
              />

              <span>{opStatus.text}</span>
            </div>
          </div>

          {/* Panel Advanced Search */}
          {isAdvancedOpen && (
            <div className="mt-3 p-4 bg-white/95 backdrop-blur-md rounded-xl text-left text-slate-800 shadow-xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn text-xs">

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tipe Koleksi Pustaka:
                </label>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Semua">Semua Koleksi</option>
                  <option value="Buku Teks">Buku Teks Cetak</option>
                  <option value="E-Book">E-Book Digital</option>
                  <option value="Tugas Akhir">Tugas Akhir / Skripsi</option>
                  <option value="Jurnal">Artikel Jurnal Ilmiah</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lokasi Ruang Rak:
                </label>

                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Semua Lokasi">Semua Lokasi Ruang</option>
                  <option value="Sirkulasi Utama">Meja Sirkulasi Lantai 1</option>
                  <option value="Ruang Referensi">Ruang Referensi & Tandon</option>
                  <option value="Koleksi Khusus">Koleksi Khusus Madura</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tahun Terbit:
                </label>

                <input
                  type="text"
                  placeholder="Contoh: 2023"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 pt-2 border-t border-slate-200 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setFilterType('Semua');
                    setFilterLocation('Semua Lokasi');
                    setFilterYear('');
                  }}
                  className="px-3 py-1.5 text-slate-600 hover:text-slate-800 text-xs font-semibold"
                >
                  Reset Filter
                </button>

                <button
                  type="button"
                  onClick={() => triggerSearch()}
                  className="px-4 py-1.5 bg-[#047857] text-white rounded-lg text-xs font-bold hover:bg-[#065f46]"
                >
                  Terapkan Filter Spesifik
                </button>

              </div>
            </div>
          )}

          {/* Kata Kunci Populer */}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">

            <span className="text-emerald-200/90 font-semibold text-[11px]">
              Pencarian Populer:
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

      {/* 4. LAYANAN UNGGULAN AKADEMIK */}
      <div
        id="layanan-section"
        className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 -mt-4"
      >

        {/* Section Heading */}
        <div className="mb-4 flex items-center justify-between text-white">

          <div className="flex items-center gap-2">

            <BookmarkCheck className="w-4 h-4 text-amber-300" />

            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-emerald-100">
              Layanan Unggulan Digital Civitas UIM
            </h3>
          </div>

          <span className="text-[11px] text-emerald-200/80 hidden sm:inline">
            Integrasi Layanan Perpustakaan & Repositori Kampus
          </span>
        </div>

        {/* 6 Kartu Layanan */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">

          {noveltyServices.map((srv) => {
            const IconComp = srv.icon;

            return (
              <div
                key={srv.id}
                onClick={srv.action}
                className="bg-white/95 hover:bg-white text-slate-800 p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-lg hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between hover:-translate-y-1"
              >

                <div>

                  <div className="flex items-center justify-between mb-2">

                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center group-hover:bg-[#047857] group-hover:text-white transition-colors">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      {srv.badge}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs leading-snug group-hover:text-[#047857] transition-colors">
                    {srv.title}
                  </h4>

                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {srv.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-[#047857]">
                  <span>Akses</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>

              </div>
            );
          })}
        </div>

        {/* 5. STATISTIK KOLEKSI PERPUSTAKAAN */}
        <div className="mt-5 bg-white rounded-xl shadow-lg border border-slate-200 p-4 sm:p-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-slate-800 divide-y md:divide-y-0 md:divide-x divide-slate-100">

          {/* Total Judul Koleksi */}
          <div className="flex items-center gap-3 pt-1 md:pt-0">

            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 border border-emerald-100">
              <BookOpen className="w-5 h-5" />
            </div>

            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {totalBooks}
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Judul Koleksi
              </p>
            </div>
          </div>

          {/* Total Eksemplar */}
          <div className="flex items-center gap-3 pt-1 md:pt-0 md:pl-4">

            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-5 h-5" />
            </div>

            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {totalCopies}
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Eksemplar Buku
              </p>
            </div>
          </div>

          {/* Total Anggota */}
          <div className="flex items-center gap-3 pt-1 md:pt-0 md:pl-4">

            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
              <Users className="w-5 h-5" />
            </div>

            <div>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {totalMembers}
              </div>

              <p className="text-[11px] text-slate-500 font-medium">
                Anggota Terdaftar
              </p>
            </div>
          </div>

          {/* Status Layanan */}
          <div className="flex items-center gap-3 pt-1 md:pt-0 md:pl-4">

            <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
              <Clock className="w-5 h-5" />
            </div>

            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {opStatus.isOpen ? 'Layanan Terbuka' : 'Layanan Tutup'}
              </div>

              <p className="text-[10px] text-slate-500 font-medium">
                {opStatus.isOpen ? '08.00 - 16.00 WIB' : 'Buka Besok 08.00 WIB'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
