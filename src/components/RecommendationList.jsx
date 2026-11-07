import React from 'react';
import { Sparkles, Star, BrainCircuit, Award } from 'lucide-react';
import BookCard from './BookCard';

export default function RecommendationList({
  recommendations,
  ratingsMap,
  onRateBook,
  onBorrowBook,
  borrowedIds,
  currentUser
}) {
  return (
    <div id="rekomendasi-section" className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden mb-12 border-2 border-emerald-400/40">
      {/* Decorative Glow */}
      <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/40">
            <BrainCircuit className="w-3.5 h-3.5 text-amber-400" />
            <span>SISTEM REKOMENDASI ITEM-BASED COLLABORATIVE FILTERING</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Rekomendasi Buku Untuk Anda</span>
            <Sparkles className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
            Koleksi pilihan yang diprediksi paling cocok untuk Anda berdasarkan pola kemiripan rating civitas akademika UIM.
          </p>
        </div>

        {/* User Status / Personalization Card */}
        <div className="bg-[#022c22]/80 backdrop-blur-md border border-emerald-500/30 p-3.5 rounded-2xl flex items-start gap-3 max-w-xs shadow">
          <Award className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-300">
              {currentUser ? `Akun: ${currentUser.nama || currentUser.email}` : 'Personalisasi Pemustaka UIM'}
            </p>
            <p className="text-[11px] text-emerald-200/90 mt-0.5 leading-snug">
              Beri rating pada koleksi di bawah untuk mengoptimalkan akurasi rekomendasi Anda secara real-time.
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
              <div className="bg-amber-400 text-slate-950 rounded-t-xl px-3 py-1.5 flex items-center justify-between text-[11px] font-black shadow-sm">
                <span className="truncate pr-1">{book.reason}</span>
                <span className="flex items-center gap-0.5 bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {book.predictedScore}
                </span>
              </div>

              {/* Book Card Component */}
              <div className="-mt-1">
                <BookCard
                  book={book}
                  userRating={ratingsMap[book.id]}
                  onRateBook={onRateBook}
                  onBorrowBook={onBorrowBook}
                  isBorrowed={borrowedIds.has(book.id)}
                  isRecommendation={true}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white/5 rounded-2xl border border-dashed border-white/20">
          <p className="text-emerald-200 text-sm font-semibold">Belum ada data koleksi & rating untuk menghitung rekomendasi.</p>
          <p className="text-xs text-emerald-300/70 mt-1">Tambahkan koleksi buku melalui panel Pustakawan dan berikan rating untuk mengaktifkan sistem rekomendasi cerdas.</p>
        </div>
      )}
    </div>
  );
}
