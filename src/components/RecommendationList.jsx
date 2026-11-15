import React from 'react';
import { BookMarked, Star, UserCheck, Layers, Info, Sparkles } from 'lucide-react';
import BookCard from './BookCard';

export default function RecommendationList({
  recommendations = [],
  ratingsMap = {},
  onRateBook,
  onBorrowBook,
  borrowedIds = new Set(),
  currentUser,
  bookmarkedIds = new Set(),
  onToggleBookmark
}) {
  return (
    <section
      id="rekomendasi-section"
      className="bg-white rounded-3xl p-6 sm:p-8 text-slate-800 shadow-sm relative overflow-hidden mb-12 border border-emerald-200/90"
    >
      {/* Decorative subtle background gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-50/60 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section (Inspirasi: Dartmouth & HK PolyU Discovery) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10 pb-5 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#047857] text-xs font-bold mb-2.5 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>SISTEM REKOMENDASI CERDAS • ITEM-BASED COLLABORATIVE FILTERING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 font-serif">
            Rekomendasi Literatur Untuk Anda
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Koleksi pustaka rujukan yang diprediksi paling relevan untuk Anda, dihitung secara personal menggunakan algoritma <strong className="text-[#047857]">Cosine Similarity</strong> berdasarkan riwayat peminjaman dan rating civitas akademika UIM.
          </p>
        </div>

        {/* User Status / Personalization Card */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl flex items-start gap-3 max-w-xs shadow-2xs shrink-0">
          <UserCheck className="w-5 h-5 text-[#047857] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-slate-900">
              {currentUser ? `Pemustaka: ${currentUser.nama || currentUser.nim}` : 'Personalisasi Pemustaka'}
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
              Beri rating 1–5 bintang pada buku untuk menyesuaikan akurasi rekomendasi Anda secara langsung.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 relative z-10">
          {recommendations.map((book) => (
            <div key={book.id} className="flex flex-col">
              {/* Highlight Explanation Badge */}
              <div className="bg-[#047857] text-white rounded-t-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-semibold shadow-xs">
                <span className="truncate pr-1 text-emerald-100 font-medium">
                  {book.reason || 'Koleksi Relevan Serupa'}
                </span>
                <span className="flex items-center gap-1 bg-[#022c22] px-2 py-0.5 rounded text-[11px] font-bold text-amber-300 shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{book.predictedScore || '4.8'}</span>
                </span>
              </div>

              {/* Book Card Component */}
              <div className="-mt-0.5">
                <BookCard
                  book={book}
                  userRating={ratingsMap[book.id]}
                  onRateBook={onRateBook}
                  onBorrowBook={onBorrowBook}
                  isBorrowed={borrowedIds.has(book.id)}
                  isRecommendation={true}
                  isBookmarked={bookmarkedIds?.has(String(book.id))}
                  onToggleBookmark={onToggleBookmark}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
          <Info className="w-8 h-8 text-[#047857] mx-auto mb-2 opacity-80" />
          <p className="text-slate-800 text-sm font-bold">Belum cukup data interaksi untuk menghitung rekomendasi personal.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Silakan telusuri katalog di bawah dan berikan rating pada buku yang telah Anda baca agar sistem dapat mengenali preferensi literatur Anda.
          </p>
        </div>
      )}
    </section>
  );
}
