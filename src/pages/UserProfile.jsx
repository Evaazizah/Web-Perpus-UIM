import React, { useState, useEffect } from 'react';
import {
  User,
  CreditCard,
  BookMarked,
  Star,
  Clock,
  BookOpen,
  ArrowLeft,
  Calendar,
  AlertCircle,
  CheckCircle,
  QrCode,
  Sparkles,
  Trash2,
  ExternalLink,
  RefreshCw,
  LogOut,
  FileText
} from 'lucide-react';
import JournalPortalModal from '../components/JournalPortalModal';
import UimLogo from '../components/UimLogo';
import { fetchUserBookmarks, toggleBookmark } from '../lib/bookmarkService';
import { fetchRatingsByUser } from '../lib/ratingService';
import { getLoansByNim, renewLoan } from '../lib/circulationService';
import { getRecommendationsForUser } from '../lib/recommendationEngine';
import { getStoredBooks } from '../lib/bookService';
import { fetchAllRatings } from '../lib/ratingService';

export default function UserProfile({
  currentUser,
  onBackToHome,
  onLogout,
  onSelectBook
}) {
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'bookmarks' | 'ratings' | 'recommendations' | 'ktm'
  const [bookmarks, setBookmarks] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [loans, setLoans] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJournalPortalOpen, setIsJournalPortalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const isDosen = currentUser?.role === 'dosen';
  const userId = currentUser?.uid || currentUser?.id || currentUser?.nim || 'anon';
  const userNim = currentUser?.nidn || currentUser?.nim || '-';
  const userName = currentUser?.nama || currentUser?.nama_lengkap || (isDosen ? 'Bapak/Ibu Dosen UIM' : 'Mahasiswa UIM');
  const userProdi = currentUser?.prodi || 'Sivitas Akademika UIM';
  const userFakultas = currentUser?.fakultas || 'Universitas Islam Madura';

  // Load all user-specific data
  const loadUserData = async () => {
    setLoading(true);
    try {
      // 1. Bookmarks
      const bMarks = await fetchUserBookmarks(userId);
      setBookmarks(bMarks);

      // 2. Ratings
      const ratings = await fetchRatingsByUser(userId);
      setUserRatings(ratings);

      // 3. Loans
      const userLoans = getLoansByNim(userNim);
      setLoans(userLoans);

      // 4. Books & Global Ratings for IBCF
      const booksList = getStoredBooks();
      setAllBooks(booksList);
      const allRatings = await fetchAllRatings();

      // 5. Personal Recommendations
      const personalRecs = getRecommendationsForUser(userId, booksList, allRatings, 6);
      setRecommendations(personalRecs);
    } catch (err) {
      console.error('Gagal memuat data pengguna:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  // Perpanjang Pinjaman
  const handleRenew = (loanId) => {
    try {
      renewLoan(loanId);
      setLoans(getLoansByNim(userNim));
      showToast('Masa pinjam berhasil diperpanjang 7 hari!');
    } catch (e) {
      showToast(e.message || 'Gagal memperpanjang pinjaman');
    }
  };

  // Hapus Bookmark
  const handleRemoveBookmark = async (book) => {
    const res = await toggleBookmark(userId, book);
    setBookmarks(res.bookmarks);
    showToast(`Buku "${book.judul}" dihapus dari daftar favorit.`);
  };

  const activeLoans = loans.filter((l) => l.status === 'dipinjam');
  const pastLoans = loans.filter((l) => l.status !== 'dipinjam');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 text-slate-800">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#064e3b] text-white px-5 py-3 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-emerald-500/40 animate-bounce">
          <CheckCircle className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Beranda Katalog OPAC</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Sesi Masuk: <strong className="text-slate-800">{userName}</strong>
            </span>
            <button
              type="button"
              onClick={() => setIsJournalPortalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#047857] text-xs font-semibold rounded-lg transition-colors border border-emerald-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Publikasi Jurnal Saya</span>
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors border border-red-200"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Member Profile Banner & Digital KTM Header */}
        <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-800/80 border-2 border-amber-300 flex items-center justify-center text-amber-300 font-bold text-2xl shadow-inner shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{userName}</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-emerald-950">
                    <CheckCircle className="w-3 h-3 text-emerald-950" />
                    {isDosen ? 'Dosen Sivitas UIM' : 'Anggota Terverifikasi'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-mono">
                  {isDosen ? 'NIDN/NIP' : 'NIM'}: {userNim} • {userProdi}
                </p>
                <p className="text-xs text-emerald-100/80">
                  {userFakultas} • Universitas Islam Madura
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-3 gap-3 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20 text-center shrink-0">
              <div className="px-3">
                <span className="block text-lg font-black text-amber-300">{activeLoans.length}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Pinjaman Aktif</span>
              </div>
              <div className="px-3 border-x border-emerald-800/50">
                <span className="block text-lg font-black text-white">{bookmarks.length}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Buku Favorit</span>
              </div>
              <div className="px-3">
                <span className="block text-lg font-black text-amber-300">{userRatings.length}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Rating Diberi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white rounded-xl shadow-sm p-1.5 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('loans')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'loans'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Sirkulasi & Pinjaman ({activeLoans.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'bookmarks'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Buku Favorit ({bookmarks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ratings')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'ratings'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Riwayat Penilaian ({userRatings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('recommendations')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'recommendations'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rekomendasi Personal IBCF</span>
          </button>

          <button
            onClick={() => setActiveTab('ktm')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              activeTab === 'ktm'
                ? 'bg-[#064e3b] text-white shadow-sm'
                : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{isDosen ? 'Kartu Anggota Dosen' : 'KTM Digital'}</span>
          </button>
        </div>

        {/* Tab 1: Sirkulasi & Peminjaman */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  <span>Pinjaman Buku Sedang Berjalan</span>
                </h2>
                <span className="text-xs text-slate-500">Maksimal 2 buku</span>
              </div>

              {activeLoans.length === 0 ? (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                  <p className="font-semibold text-sm">Tidak ada pinjaman aktif saat ini</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Silakan cari dan pinjam buku di Katalog OPAC UIM.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeLoans.map((loan) => {
                    const dueDate = new Date(loan.tanggalJatuhTempo);
                    const now = new Date();
                    const isOverdue = now > dueDate;
                    const diffDays = Math.ceil(Math.abs(dueDate - now) / (1000 * 60 * 60 * 24));

                    return (
                      <div
                        key={loan.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                          isOverdue
                            ? 'bg-red-50/50 border-red-200'
                            : 'bg-emerald-50/30 border-emerald-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {loan.cover_url ? (
                            <img
                              src={loan.cover_url}
                              alt={loan.judul}
                              className="w-12 h-16 object-cover rounded-lg shadow-sm shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-emerald-800 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                              UIM
                            </div>
                          )}
                          <div className="space-y-1">
                            <h3 className="font-bold text-sm text-slate-800 line-clamp-1">{loan.judul}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span>Tgl Pinjam: {loan.tanggalPinjam}</span>
                              <span>•</span>
                              <span className={isOverdue ? 'text-red-700 font-bold' : 'text-emerald-700 font-semibold'}>
                                Batas Kembali: {loan.tanggalJatuhTempo}
                              </span>
                            </div>
                            <div className="pt-1">
                              {isOverdue ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  Terlambat {diffDays} hari • Estimasi Denda: Rp {(diffDays * 500).toLocaleString('id-ID')}
                                </span>
                              ) : (
                                <span className="text-[11px] text-emerald-700 font-medium">
                                  Sisa waktu peminjaman: {diffDays} hari lagi
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleRenew(loan.id)}
                            disabled={isOverdue || (loan.perpanjangan || 0) >= 2}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 ${
                              isOverdue || (loan.perpanjangan || 0) >= 2
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                            }`}
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Perpanjang (+7 Hari)</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Riwayat Pinjaman Selesai */}
            {pastLoans.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 mb-3">
                  Riwayat Pengembalian Buku ({pastLoans.length})
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  {pastLoans.map((pl) => (
                    <div key={pl.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-800">{pl.judul}</p>
                        <p className="text-[11px] text-slate-400">
                          Dipinjam {pl.tanggalPinjam} • Dikembalikan {pl.tanggalKembali || '-'}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                        Selesai
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Buku Favorit / Bookmark */}
        {activeTab === 'bookmarks' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-emerald-700" />
              <span>Daftar Buku Favorit Anda</span>
            </h2>

            {bookmarks.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookMarked className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <p className="font-semibold text-sm">Belum ada buku yang ditandai favorit</p>
                <p className="text-xs text-slate-400 mt-1">
                  Klik tombol bookmark pada kartu buku di katalog untuk menyimpannya di sini.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all flex gap-3 group relative bg-white shadow-sm hover:shadow"
                  >
                    {bm.cover_url ? (
                      <img
                        src={bm.cover_url}
                        alt={bm.judul}
                        className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-24 bg-[#064e3b] text-amber-300 font-bold text-xs flex items-center justify-center rounded-lg shrink-0">
                        UIM
                      </div>
                    )}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          {bm.kategori || 'Koleksi'}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5">{bm.judul}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{bm.penulis}</p>
                        {bm.lokasi_rak && (
                          <p className="text-[10px] text-slate-400 mt-1">Rak: {bm.lokasi_rak}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        <button
                          onClick={() => onSelectBook && onSelectBook(bm)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                        >
                          <span>Lihat Koleksi</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleRemoveBookmark(bm)}
                          title="Hapus dari Favorit"
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Riwayat Penilaian (Rating) */}
        {activeTab === 'ratings' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                <span>Riwayat Penilaian & Ulasan Buku</span>
              </h2>
              <span className="text-xs text-slate-500">
                Bahan bakar algoritma Item-Based Collaborative Filtering
              </span>
            </div>

            {userRatings.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Star className="w-10 h-10 mx-auto text-amber-300 mb-2" />
                <p className="font-semibold text-sm">Anda belum memberikan rating pada buku apa pun</p>
                <p className="text-xs text-slate-400 mt-1">
                  Beri rating 1–5 bintang pada buku yang Anda baca untuk mendapatkan rekomendasi yang presisi!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {userRatings.map((r) => {
                  const matchedBook = allBooks.find((b) => String(b.id) === String(r.id_buku));
                  return (
                    <div
                      key={r.id || `${r.id_user}_${r.id_buku}`}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm text-slate-900">
                          {matchedBook?.judul || `Koleksi Buku #${r.id_buku}`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Penulis: {matchedBook?.penulis || 'Koleksi Perpustakaan UIM'}
                        </p>
                        {r.ulasan && (
                          <p className="text-xs text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200 mt-1">
                            "{r.ulasan}"
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          Dinilai pada: {r.updated_at ? new Date(r.updated_at).toLocaleDateString('id-ID') : '-'}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg shrink-0">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= r.nilai_rating
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="font-black text-amber-900 text-xs ml-1">
                          {r.nilai_rating}.0
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Rekomendasi Personal IBCF */}
        {activeTab === 'recommendations' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Rekomendasi Personal untuk {userName}</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dihitung menggunakan algoritma <strong>Item-Based Collaborative Filtering (IBCF)</strong> dan <strong>Cosine Similarity</strong>.
                </p>
              </div>
              <button
                onClick={loadUserData}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 border border-emerald-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Hitung Ulang</span>
              </button>
            </div>

            {recommendations.length === 0 ? (
              <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Sparkles className="w-10 h-10 mx-auto text-amber-400 mb-2" />
                <p className="font-semibold text-sm">Belum ada rekomendasi yang dapat dihitung</p>
                <p className="text-xs text-slate-400 mt-1">
                  Mulai berikan rating pada minimal 1 buku agar sistem dapat memetakan minat baca Anda!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-600 transition-all flex flex-col justify-between bg-white shadow-sm hover:shadow-md group"
                  >
                    <div className="flex gap-3">
                      {rec.cover_url ? (
                        <img
                          src={rec.cover_url}
                          alt={rec.judul}
                          className="w-16 h-24 object-cover rounded-lg shadow-sm shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-[#064e3b] text-amber-300 font-bold text-xs flex items-center justify-center rounded-lg shrink-0">
                          UIM
                        </div>
                      )}
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                          {rec.kategori || 'Koleksi'}
                        </span>
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5">{rec.judul}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{rec.penulis}</p>
                        
                        {rec.predictedScore && (
                          <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200 rounded text-[10px] font-black">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>Prediksi: {rec.predictedScore} / 5.0</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] text-slate-500 italic mb-2 line-clamp-1">
                        {rec.reason || 'Disesuaikan dengan selera baca Anda'}
                      </p>
                      <button
                        onClick={() => onSelectBook && onSelectBook(rec)}
                        className="w-full py-1.5 bg-[#064e3b] hover:bg-[#022c22] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Lihat Detail Koleksi</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Kartu Anggota (KTM / Dosen) Digital */}
        {activeTab === 'ktm' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 max-w-xl mx-auto">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-700" />
              <span>{isDosen ? 'Kartu Anggota Dosen Perpustakaan Digital' : 'Kartu Anggota Perpustakaan (KTM Digital)'}</span>
            </h2>

            {/* Visual Member Card */}
            <div className="bg-gradient-to-br from-[#022c22] via-[#064e3b] to-[#047857] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden border-2 border-amber-300">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2.5">
                  <UimLogo className="w-8 h-8" />
                  <div>
                    <h3 className="font-bold text-xs tracking-wider">UNIVERSITAS ISLAM MADURA</h3>
                    <p className="text-[9px] text-amber-300 font-semibold tracking-wide">UPT PERPUSTAKAAN PUSAT</p>
                  </div>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-bold uppercase">
                  {isDosen ? 'Dosen Sivitas' : 'Mahasiswa'}
                </span>
              </div>

              <div className="flex items-center gap-4 py-5">
                <div className="w-16 h-20 bg-emerald-900 border-2 border-amber-300/80 rounded-lg flex items-center justify-center font-bold text-amber-300 text-2xl shrink-0">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-sm font-bold text-white">{userName}</p>
                  <p className="text-emerald-200 font-mono">{isDosen ? 'NIDN/NIP' : 'NIM'}: {userNim}</p>
                  <p className="text-[11px] text-emerald-100/90">{userProdi}</p>
                  <p className="text-[10px] text-emerald-300">
                    Berlaku: {isDosen ? 'Sivitas Akademika Aktif UIM' : 'Selama Menjadi Mahasiswa Aktif'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-5 h-5 text-amber-300" />
                  <span className="font-mono">{userNim}-UIM-LIB</span>
                </div>
                <span className="text-amber-300 font-semibold">Kampus Bettet, Pamekasan</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-4">
              Tunjukkan Kartu Digital ini kepada pustakawan di Meja Sirkulasi saat mengambil atau mengembalikan buku.
            </p>
          </div>
        )}
      </div>

      {/* ================= MODAL PORTAL JURNAL & KARYA ILMIAH ================= */}
      <JournalPortalModal
        isOpen={isJournalPortalOpen}
        onClose={() => setIsJournalPortalOpen(false)}
        currentUser={currentUser}
      />
    </div>
  );
}

