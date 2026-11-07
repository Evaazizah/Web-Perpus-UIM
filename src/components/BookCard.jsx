import React, { useState } from 'react';
import {
  Star,
  BookmarkPlus,
  CheckCircle2,
  BookMarked,
  Eye,
  Calendar,
  Layers,
  MapPin,
  X,
  Share2,
  Sparkles,
  Trash2
} from 'lucide-react';

export default function BookCard({
  book,
  userRating,
  onRateBook,
  onBorrowBook,
  isBorrowed,
  isRecommendation = false,
  isAdmin = false,
  onDeleteBook
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const fallbackCover =
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';

  return (
    <>
      <div
        className={`group bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 border relative ${
          isRecommendation
            ? 'border-emerald-400 ring-2 ring-emerald-400/20 shadow-lg'
            : 'border-slate-200/90 shadow-sm hover:border-[#047857]'
        }`}
      >
        {/* Top Recommendation Ribbon */}
        {isRecommendation && (
          <div className="absolute top-0 right-0 z-20 bg-gradient-to-l from-emerald-600 to-[#047857] text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Pilihan AI</span>
          </div>
        )}

        {/* Cover Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-100 cursor-pointer" onClick={() => setIsModalOpen(true)}>
          <img
            src={book.cover_url || fallbackCover}
            alt={book.judul}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = fallbackCover;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Category Badge */}
          <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#047857]/90 text-white backdrop-blur-md border border-emerald-400/30 shadow-sm">
            {book.kategori || 'Koleksi Umum'}
          </span>

          {/* Admin Quick Delete Action */}
          {isAdmin && onDeleteBook && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Hapus buku "${book.judul}" dari katalog?`)) {
                  onDeleteBook(book.id);
                }
              }}
              title="Hapus Koleksi (Akses Pustakawan)"
              className="absolute top-3 right-3 z-30 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md backdrop-blur-sm transition-transform hover:scale-110"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Preview Hover Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span className="px-3.5 py-2 rounded-xl bg-white/90 text-slate-900 text-xs font-bold shadow-xl backdrop-blur-sm flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-all">
              <Eye className="w-4 h-4 text-[#047857]" />
              <span>Lihat Detail</span>
            </span>
          </div>

          {/* Book Bottom Info Badge */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-white/95 font-medium z-10">
            <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
              <BookMarked className="w-3 h-3 text-amber-300" />
              <span>#{book.id}</span>
            </span>
            <span
              className={`font-bold px-2 py-0.5 rounded text-[10px] shadow-xs ${
                isBorrowed
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isBorrowed ? 'Sedang Dipinjam' : 'Tersedia di Rak'}
            </span>
          </div>
        </div>

        {/* Book Details */}
        <div className="p-4 sm:p-4.5 flex-1 flex flex-col justify-between bg-white">
          <div>
            <h3
              onClick={() => setIsModalOpen(true)}
              className="font-extrabold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-2 cursor-pointer group-hover:text-[#047857] transition-colors"
              title={book.judul}
            >
              {book.judul}
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-2">
              Penulis:{' '}
              <span className="font-semibold text-slate-700">
                {book.penulis || 'Pustakawan UIM'}
              </span>
            </p>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {book.sinopsis ||
                'Koleksi literatur dan bahan ajar rujukan perpustakaan Universitas Islam Madura.'}
            </p>
          </div>

          {/* Action Area */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {/* Rating Stars Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-semibold">
                Rating Pembaca:
              </span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => onRateBook(book.id, star)}
                    title={`Beri nilai ${star} bintang`}
                    className="p-0.5 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 transition-colors ${
                        star <= (hoverRating || userRating || 0)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-200 hover:text-amber-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Borrow Button */}
            <button
              type="button"
              onClick={() => onBorrowBook(book.id)}
              disabled={isBorrowed}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isBorrowed
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-[#047857] hover:bg-[#064e3b] text-white hover:shadow-md active:scale-98'
              }`}
            >
              {isBorrowed ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Buku Telah Dipinjam</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span>Pinjam Buku Ini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail Buku Pop-Up */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-100 flex flex-col md:flex-row max-h-[90vh]">
            {/* Modal Cover Left */}
            <div className="md:w-5/12 bg-slate-100 relative min-h-[220px] md:min-h-full">
              <img
                src={book.cover_url || fallbackCover}
                alt={book.judul}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent md:hidden" />
              <span className="absolute top-4 left-4 px-3 py-1 bg-[#047857] text-white text-xs font-bold rounded-lg shadow">
                {book.kategori || 'Koleksi UIM'}
              </span>
            </div>

            {/* Modal Info Right */}
            <div className="p-6 md:w-7/12 flex flex-col justify-between overflow-y-auto">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                    {book.judul}
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-1">
                  Penulis / Pengarang: <span className="font-bold text-slate-800">{book.penulis}</span>
                </p>

                {/* Meta details list */}
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ISBN / ISSN</span>
                    <span className="font-mono font-semibold text-slate-700">{book.isbn || '978-602-000-0'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Ketersediaan</span>
                    <span className="font-semibold text-emerald-700">
                      {book.salin || 1} Eksemplar ({isBorrowed ? 'Dipinjam' : 'Tersedia'})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lokasi Rak</span>
                    <span className="font-semibold text-slate-700">Rak A1 - Perpustakaan UIM</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Terakhir Diperbarui</span>
                    <span className="font-semibold text-slate-700">{book.updatedAt || 'Terbaru'}</span>
                  </div>
                </div>

                {/* Synopsis */}
                <div className="mt-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                    Sinopsis & Deskripsi Koleksi
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                    {book.sinopsis ||
                      'Buku ini merupakan referensi akademik terstandar yang tersedia untuk dibaca di tempat maupun dipinjam oleh civitas akademika Universitas Islam Madura.'}
                  </p>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onBorrowBook(book.id);
                    setIsModalOpen(false);
                  }}
                  disabled={isBorrowed}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                    isBorrowed
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-[#047857] hover:bg-[#064e3b] text-white'
                  }`}
                >
                  <BookmarkPlus className="w-4 h-4" />
                  <span>{isBorrowed ? 'Buku Sedang Dipinjam' : 'Pinjam Sekarang'}</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
