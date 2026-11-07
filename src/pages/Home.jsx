import React, { useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getStoredBooks, syncBooksFromFirebase, deleteBibliografi, clearAllBooks } from '../lib/bookService';
import { getStoredMembers, syncMembersFromFirebase, countPendingVerifications } from '../lib/memberService';
import {
  getStoredLoans,
  syncLoansFromFirebase,
  getLoansByNim,
  createLoan,
  renewLoan
} from '../lib/circulationService';
import { isFirebaseConfigured } from '../lib/firebase';
import { getRecommendationsForUser, DUMMY_RATINGS } from '../lib/recommendationEngine';
import HeroBanner from '../components/HeroBanner';
import SubjectCards from '../components/SubjectCards';
import RecommendationList from '../components/RecommendationList';
import BookCard from '../components/BookCard';
import StudentCardModal from '../components/StudentCardModal';
import AdminQuickAddModal from '../components/AdminQuickAddModal';
import {
  BookOpen,
  Sparkles,
  Clock,
  MapPin,
  Award,
  CheckCircle2,
  FileCheck,
  Search,
  BookMarked,
  ArrowRight,
  ShieldCheck,
  Wifi,
  Coffee,
  MessageSquare,
  Flame,
  Zap,
  RefreshCw,
  ExternalLink,
  Plus,
  UserCheck,
  CreditCard,
  GraduationCap,
  RotateCw,
  Sliders,
  Check
} from 'lucide-react';

export default function Home({
  currentUser,
  activeTab,
  searchQuery,
  setSearchQuery,
  onOpenAuth,
  onSwitchToAdmin,
  onOpenAdminVerification
}) {
  const [books, setBooks] = useState(getStoredBooks());
  const [ratings, setRatings] = useState(DUMMY_RATINGS);
  const [borrowedIds, setBorrowedIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchField, setSearchField] = useState('Semua Ruas');
  const [catalogTab, setCatalogTab] = useState('popular'); // 'popular' | 'newest' | 'all'
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Modals
  const [isStudentCardOpen, setIsStudentCardOpen] = useState(false);
  const [isAdminQuickAddOpen, setIsAdminQuickAddOpen] = useState(false);

  // Mahasiswa states
  const [studentLoans, setStudentLoans] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);

  const activeUserId = currentUser ? currentUser.id : 'active-demo-user';

  // 1. Sinkronisasi Data Buku & Pinjaman (Firebase Cloud + Local)
  useEffect(() => {
    setBooks(getStoredBooks());
    setPendingVerifications(countPendingVerifications());

    if (currentUser?.role === 'user' && currentUser?.nim) {
      setStudentLoans(getLoansByNim(currentUser.nim));
    }

    async function loadCloudData() {
      // Sinkronisasi Firebase Firestore jika dikonfigurasikan
      if (isFirebaseConfigured()) {
        try {
          const [cloudBooks, cloudMembers, cloudLoans] = await Promise.all([
            syncBooksFromFirebase(),
            syncMembersFromFirebase(),
            syncLoansFromFirebase()
          ]);
          if (cloudBooks && cloudBooks.length > 0) setBooks(cloudBooks);
          if (currentUser?.role === 'user' && currentUser?.nim) {
            setStudentLoans(getLoansByNim(currentUser.nim));
          }
          setPendingVerifications(countPendingVerifications());
        } catch (e) {
          console.warn('Gagal sinkron data Firebase:', e);
        }
      }

      if (!isSupabaseConfigured()) return;
      try {
        setLoading(true);
        const { data: bData } = await supabase.from('books').select('*').order('id', { ascending: true });
        if (bData && bData.length > 0) setBooks(bData);

        const { data: rData } = await supabase.from('ratings').select('*');
        if (rData && rData.length > 0) setRatings(rData);
      } catch (err) {
        console.warn('Menggunakan data offline cache:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCloudData();
  }, [currentUser]);

  // Map rating user saat ini
  const userRatingsMap = useMemo(() => {
    const map = {};
    ratings.forEach((r) => {
      if (String(r.id_user) === String(activeUserId)) {
        map[r.id_buku] = Number(r.nilai_rating);
      }
    });
    return map;
  }, [ratings, activeUserId]);

  // 2. Kalkulasi Item-Based Collaborative Filtering secara Dinamis
  const recommendations = useMemo(() => {
    return getRecommendationsForUser(activeUserId, books, ratings, 4);
  }, [activeUserId, books, ratings]);

  // 3. Status Operasional Real-time
  const operationalStatus = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;

    if (day >= 1 && day <= 4) {
      if (currentTime >= 8 && currentTime < 16) {
        return { isOpen: true, text: 'BUKA SEKARANG • Melayani s.d. 16:00 WIB', badgeColor: 'bg-emerald-500' };
      }
      return { isOpen: false, text: 'TUTUP • Buka besok pukul 08:00 WIB', badgeColor: 'bg-amber-500' };
    } else if (day === 5) {
      if (currentTime >= 8 && currentTime < 15.5) {
        return { isOpen: true, text: 'BUKA SEKARANG • Melayani s.d. 15:30 WIB', badgeColor: 'bg-emerald-500' };
      }
      return { isOpen: false, text: 'TUTUP • Buka Senin pukul 08:00 WIB', badgeColor: 'bg-amber-500' };
    } else {
      return { isOpen: false, text: 'LIBUR AKHIR PEKAN • Buka Senin 08:00 WIB', badgeColor: 'bg-slate-500' };
    }
  }, []);

  // 4. Handler Pemberian Rating
  const handleRateBook = async (bookId, ratingValue) => {
    const nextRatings = [...ratings];
    const idx = nextRatings.findIndex(
      (r) => String(r.id_user) === String(activeUserId) && String(r.id_buku) === String(bookId)
    );

    if (idx >= 0) {
      nextRatings[idx] = { ...nextRatings[idx], nilai_rating: ratingValue };
    } else {
      nextRatings.push({
        id: Date.now(),
        id_user: activeUserId,
        id_buku: bookId,
        nilai_rating: ratingValue
      });
    }
    setRatings(nextRatings);

    showToast(`Rating ${ratingValue}★ tersimpan! Rekomendasi Cerdas diperbarui.`);

    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from('ratings').upsert(
          { id_user: currentUser.id, id_buku: bookId, nilai_rating: ratingValue },
          { onConflict: 'id_user,id_buku' }
        );
      } catch (err) {
        console.error('Error saat menyimpan rating:', err);
      }
    }
  };

  // 5. Handler Peminjaman Buku
  const handleBorrowBook = async (bookId) => {
    const updated = new Set(borrowedIds);
    updated.add(bookId);
    setBorrowedIds(updated);

    const foundBook = books.find((b) => b.id === bookId);

    if (currentUser?.role === 'user' && currentUser?.nim) {
      createLoan({
        nim: currentUser.nim,
        nama: currentUser.nama || 'Mahasiswa UIM',
        bookId,
        judul: foundBook?.judul || 'Buku Perpustakaan',
        cover_url: foundBook?.cover_url || ''
      });
      setStudentLoans(getLoansByNim(currentUser.nim));
      showToast(`Buku "${foundBook?.judul || 'Buku'}" berhasil dipinjam! Silakan ambil di Meja Sirkulasi.`);
    } else {
      showToast('Buku berhasil dipinjam! Silakan ambil fisik buku di Meja Sirkulasi Perpustakaan UIM.');
    }

    if (isSupabaseConfigured() && currentUser) {
      try {
        await supabase.from('borrowings').insert({
          id_user: currentUser.id,
          id_buku: bookId,
          status: 'dipinjam'
        });
      } catch (err) {
        console.error('Error saat pinjam:', err);
      }
    }
  };

  // Handler Perpanjang Pinjaman Mahasiswa
  const handleRenewStudentLoan = (loanId) => {
    try {
      renewLoan(loanId);
      if (currentUser?.nim) {
        setStudentLoans(getLoansByNim(currentUser.nim));
      }
      showToast('Masa peminjaman berhasil diperpanjang 7 hari!');
    } catch (err) {
      showToast(err.message || 'Gagal memperpanjang pinjaman');
    }
  };

  // Handler Hapus Buku (Akses Admin)
  const handleDeleteBook = (id) => {
    const updated = deleteBibliografi([id]);
    setBooks(updated);
    showToast('Koleksi buku berhasil dihapus dari katalog.');
  };

  // Handler Buku Baru Ditambahkan oleh Admin
  const handleBookAdded = (newBook) => {
    setBooks(getStoredBooks());
    showToast(`Buku "${newBook.judul}" berhasil ditambahkan ke katalog Beranda!`);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3800);
  };

  const categories = ['Semua', ...new Set(books.map((b) => b.kategori))];

  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (Number(b.salin) || 1), 0);
  const totalMembers = getStoredMembers().length;

  // Active student loans
  const activeStudentLoans = studentLoans.filter((l) => l.status === 'dipinjam');

  // Filtering Berdasarkan Search Query & Field Scope
  const filteredBooks = useMemo(() => {
    let list = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((book) => {
        if (searchField === 'Judul Buku') {
          return book.judul.toLowerCase().includes(q);
        } else if (searchField === 'Pengarang') {
          return (book.penulis || '').toLowerCase().includes(q);
        } else if (searchField === 'Subjek') {
          return (book.kategori || '').toLowerCase().includes(q);
        } else if (searchField === 'ISBN') {
          return (book.isbn || '').toLowerCase().includes(q);
        } else {
          return (
            book.judul.toLowerCase().includes(q) ||
            (book.penulis || '').toLowerCase().includes(q) ||
            (book.kategori || '').toLowerCase().includes(q) ||
            (book.isbn || '').toLowerCase().includes(q)
          );
        }
      });
    }

    if (selectedCategory !== 'Semua') {
      list = list.filter((book) => book.kategori === selectedCategory);
    }

    if (catalogTab === 'newest') {
      list.sort((a, b) => b.id - a.id);
    }

    return list;
  }, [books, searchQuery, searchField, selectedCategory, catalogTab]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-[#047857] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-6 z-50 bg-[#047857] text-white font-bold px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs sm:text-sm">{toastMsg}</span>
        </div>
      )}

      {/* 1. HERO BANNER MODERN ELEGAN */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchField={searchField}
        setSearchField={setSearchField}
        totalBooks={totalBooks}
        totalCopies={totalCopies}
        totalMembers={totalMembers}
      />

      {/* 2. SUBJECT CARDS ELEGAN & INTERAKTIF */}
      <SubjectCards
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* ================= SPECIAL WIDGET: PUSTAKAWAN ADMIN COMMAND DECK ================= */}
        {currentUser?.role === 'admin' && (
          <div className="mb-12 bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-500/40 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-amber-300 text-xs font-bold mb-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>PUSTAKAWAN PUSAT UIM • MODE KENDALI CEPAT BERANDA</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Halo, Staf Pustakawan Admin! 👋
                </h3>
                <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl leading-relaxed">
                  Anda memiliki akses penuh untuk input koleksi bibliografi baru, memverifikasi antrean KTM mahasiswa, dan menghapus koleksi langsung dari Beranda publik.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdminQuickAddOpen(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all hover:scale-102"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Input Buku Baru</span>
                </button>

                {onOpenAdminVerification && (
                  <button
                    type="button"
                    onClick={onOpenAdminVerification}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 border border-white/30 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-300" />
                    <span>Verifikasi KTM</span>
                    {pendingVerifications > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                        {pendingVerifications}
                      </span>
                    )}
                  </button>
                )}

                {onSwitchToAdmin && (
                  <button
                    type="button"
                    onClick={onSwitchToAdmin}
                    className="px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-200 font-bold rounded-xl text-xs flex items-center gap-2 transition-all"
                  >
                    <span>Dashboard SLiMS Penuh</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= SPECIAL WIDGET: MAHASISWA PERSONAL SPACE ================= */}
        {currentUser?.role === 'user' && (
          <div className="mb-12 space-y-6">
            {/* Welcome Card & KTM Digital Pill */}
            <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-400/40 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 font-black text-2xl flex items-center justify-center shadow-inner shrink-0">
                    {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/50 text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Mahasiswa Aktif Terverifikasi</span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
                      Assalamu’alaikum, {currentUser.nama}! 👋
                    </h3>
                    <p className="text-xs text-emerald-100/90 mt-1 font-mono">
                      NIM: <span className="font-bold text-amber-300">{currentUser.nim}</span> • {currentUser.prodi}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsStudentCardOpen(true)}
                    className="px-5 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center gap-2 hover:scale-102"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Buka Kartu Anggota Digital (KTM)</span>
                  </button>
                </div>
              </div>

              {/* 3 Metric Pills for Student */}
              <div className="mt-6 pt-5 border-t border-emerald-500/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-amber-300" />
                  <div>
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Buku Sedang Dipinjam</span>
                    <span className="font-bold text-white text-sm">
                      {activeStudentLoans.length} Koleksi
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-emerald-300" />
                  <div>
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Status Bebas Pustaka</span>
                    <span className="font-bold text-white text-sm">
                      {activeStudentLoans.length === 0 ? 'Bebas Tanggungan' : `${activeStudentLoans.length} Buku Wajib Dikembalikan`}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-teal-300" />
                  <div>
                    <span className="text-[10px] text-emerald-200 block uppercase font-bold">Kampus Civitas</span>
                    <span className="font-bold text-white text-xs truncate max-w-[150px] block">
                      Universitas Islam Madura
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Buku Sedang Dipinjam Mahasiswa */}
            {activeStudentLoans.length > 0 && (
              <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <BookMarked className="w-5 h-5 text-[#047857]" />
                    <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      Koleksi yang Sedang Anda Pinjam
                    </h4>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Harap dikembalikan ke Meja Sirkulasi sebelum batas tanggal jatuh tempo
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeStudentLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-4 hover:border-emerald-300 transition-colors"
                    >
                      <img
                        src={loan.cover_url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60'}
                        alt={loan.judul}
                        className="w-16 h-20 object-cover rounded-xl shadow-xs shrink-0 bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {loan.judul}
                        </h5>
                        <div className="mt-1 space-y-0.5 text-[11px] text-slate-600">
                          <p>Tanggal Pinjam: <span className="font-semibold text-slate-800">{loan.tanggalPinjam}</span></p>
                          <p>Batas Pengembalian: <span className="font-bold text-red-600">{loan.tanggalJatuhTempo}</span></p>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                            Perpanjangan: {loan.perpanjangan || 0}/2 kali
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRenewStudentLoan(loan.id)}
                            className="px-3 py-1 bg-[#047857] hover:bg-[#064e3b] text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs active:scale-95"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Perpanjang 7 Hari</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. KATALOG UTAMA DENGAN TAB FILTER */}
        <section id="katalog-section" className="scroll-mt-24 mb-16">
          {/* Section Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#047857] text-xs font-bold mb-2 border border-emerald-200/80">
                <BookMarked className="w-3.5 h-3.5" />
                <span>KATALOG DIGITAL PERPUSTAKAAN</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Koleksi Pustaka Civitas UIM
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Koleksi buku teks, monograf, literatur rujukan, dan karya ilmiah terakreditasi
              </p>
            </div>

            {/* Quick Catalog Tabs */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setCatalogTab('popular')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  catalogTab === 'popular'
                    ? 'bg-white text-[#047857] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>Terpopuler</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab('newest')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  catalogTab === 'newest'
                    ? 'bg-white text-[#047857] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Terbaru</span>
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  catalogTab === 'all'
                    ? 'bg-white text-[#047857] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Semua ({books.length})</span>
              </button>
            </div>
          </div>

          {/* Active Category Filter Badge */}
          {selectedCategory !== 'Semua' && (
            <div className="flex items-center gap-2 mb-6 bg-emerald-50/60 p-3 rounded-xl border border-emerald-200/60 text-xs">
              <span className="text-slate-500">Filter Subjek Aktif:</span>
              <span className="font-bold text-[#047857] bg-white px-3 py-1 rounded-lg shadow-xs border border-emerald-200">
                {selectedCategory}
              </span>
              <button
                onClick={() => setSelectedCategory('Semua')}
                className="text-xs text-red-600 font-semibold hover:underline ml-2"
              >
                Hapus Filter
              </button>
            </div>
          )}

          {/* Book Cards Grid */}
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  userRating={userRatingsMap[book.id]}
                  onRateBook={handleRateBook}
                  onBorrowBook={handleBorrowBook}
                  isBorrowed={borrowedIds.has(book.id)}
                  isAdmin={currentUser?.role === 'admin'}
                  onDeleteBook={handleDeleteBook}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-800">
                {books.length === 0
                  ? 'Katalog Koleksi Saat Ini Masih Kosong'
                  : 'Tidak Ditemukan Koleksi yang Sesuai'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                {books.length === 0
                  ? 'Belum ada data buku yang tersimpan di sistem. Silakan login sebagai Pustakawan / Admin untuk menambahkan koleksi buku bibliografi baru Anda sendiri.'
                  : 'Coba ubah kata kunci pencarian atau pilih kategori subjek yang berbeda.'}
              </p>

              {books.length === 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {currentUser?.role === 'admin' ? (
                    <button
                      onClick={() => setIsAdminQuickAddOpen(true)}
                      className="px-6 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Input Koleksi Pertama Sekarang</span>
                    </button>
                  ) : onOpenAuth ? (
                    <button
                      onClick={onOpenAuth}
                      className="px-6 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Masuk sebagai Pustakawan</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </section>

        {/* 5. SISTEM REKOMENDASI CERDAS (ITEM-BASED COLLABORATIVE FILTERING) */}
        {books.length > 0 && (
          <RecommendationList
            recommendations={recommendations}
            ratingsMap={userRatingsMap}
            onRateBook={handleRateBook}
            onBorrowBook={handleBorrowBook}
            borrowedIds={borrowedIds}
            currentUser={currentUser}
          />
        )}

        {/* 6. BENTO GRID: LAYANAN DIGITAL UNGGULAN PERPUSTAKAAN UIM */}
        <section className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#047857] text-xs font-bold uppercase tracking-wider mb-2 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Ekosistem Layanan Akademik</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Layanan Unggulan Perpustakaan Digital UIM
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Berbagai fasilitas terintegrasi untuk mendukung percepatan studi, riset, dan publikasi ilmiah mahasiswa maupun dosen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Bento 1: Repositori Ilmiah UIM */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-emerald-100">
                  <FileCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-[#047857] uppercase tracking-wider block mb-1">
                  Repositori Dspace UIM
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-[#047857] transition-colors">
                  Repositori Skripsi & Jurnal Ilmiah
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Akses naskah lengkap karya tulis ilmiah, skripsi sarjana, tesis, dan artikel jurnal riset dosen dari berbagai fakultas di UIM.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#047857]">
                <span>Akses Terbuka Sivitas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bento 2: Bebas Pustaka Online */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-amber-100">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block mb-1">
                  Syarat Wisuda & Kelulusan
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                  Surat Keterangan Bebas Pustaka
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Pengurusan verifikasi pengembalian buku dan penyerahan softcopy karya ilmiah secara cepat tanpa perlu antre di loket sirkulasi.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                <span>Pengurusan Mandiri</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Bento 3: Cek Plagiasi & Turnitin */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-teal-100">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                  Integritas Akademik
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug group-hover:text-teal-700 transition-colors">
                  Uji Orisinalitas & Anti-Plagiasi
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Layanan pengecekan similaritas naskah menggunakan sistem Turnitin resmi guna memastikan orisinalitas karya sebelum sidang skripsi.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700">
                <span>Standar Mutu UIM</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </section>

        {/* 7. MUTIARA HIKMAH & HIKMAH LITERASI */}
        <section className="mb-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] p-8 sm:p-12 text-white shadow-xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <span className="text-amber-300 font-mono text-xs font-bold uppercase tracking-widest block mb-2">
                • PESAN LITERASI ISLAMI UIM •
              </span>
              <blockquote className="text-lg sm:text-2xl font-serif font-medium leading-relaxed italic text-emerald-50">
                “Bacalah dengan menyebut nama Tuhanmu yang menciptakan. Dia telah menciptakan manusia dari segumpal darah. Bacalah, dan Tuhanmulah Yang Maha Mulia.”
              </blockquote>
              <p className="text-xs text-amber-200/90 mt-3 font-medium">
                — QS. Al-'Alaq: 1-3
              </p>
              <div className="mt-6 pt-5 border-t border-white/20 flex flex-wrap items-center gap-6 text-xs text-emerald-100">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Berilmu Amaliah
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Beramal Ilmiah
                </span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Berakhlakul Karimah
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 8. INFORMASI OPERASIONAL & KAMPUS HIJAU UIM */}
        <section id="layanan-section" className="border-t border-slate-200 pt-12 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Box 1: Status Jam Operasional Hari Ini */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-100">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-[10px] font-bold shadow-xs ${operationalStatus.badgeColor}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{operationalStatus.text}</span>
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Jam Operasional Layanan</h4>
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Senin – Kamis:</span>
                    <span className="font-semibold text-slate-800">08.00 – 16.00 WIB</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>Jumat:</span>
                    <span className="font-semibold text-slate-800">08.00 – 15.30 WIB</span>
                  </div>
                  <div className="flex justify-between py-1 text-amber-700 font-medium">
                    <span>Sabtu & Minggu:</span>
                    <span className="font-bold">Libur Pelayanan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box 2: Fasilitas Gedung Perpustakaan */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 mb-4">
                  <Wifi className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Fasilitas Pemustaka</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Ruang baca ber-AC, area belajar mandiri (*coworking space*), stopkontak di setiap bilik baca, akses Wi-Fi berkecepatan tinggi, dan loker penitipan tas terpusat.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-blue-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nyaman & Ramah Pemustaka</span>
              </div>
            </div>

            {/* Box 3: Lokasi & Kontak Resmi UIM */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 mb-4">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">Kampus Hijau UIM Pamekasan</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Gedung Perpustakaan Pusat UIM, Jl. Raya Bettet No. 49, Pamekasan, Madura, Jawa Timur 69317.
                </p>
                <p className="text-xs text-[#047857] font-semibold mt-1">
                  Email: perpustakaan@uim.ac.id
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#047857]">
                <span>Universitas Islam Madura</span>
                <span className="font-mono text-[11px] text-slate-400">Pamekasan</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL KARTU DIGITAL MAHASISWA */}
      <StudentCardModal
        isOpen={isStudentCardOpen}
        onClose={() => setIsStudentCardOpen(false)}
        user={currentUser}
      />

      {/* MODAL INPUT CEPAT BIBLIOGRAFI ADMIN */}
      <AdminQuickAddModal
        isOpen={isAdminQuickAddOpen}
        onClose={() => setIsAdminQuickAddOpen(false)}
        onBookAdded={handleBookAdded}
      />

      {/* FOOTER RESMI PERPUSTAKAAN UIM */}
      <footer className="bg-[#022c22] text-white border-t border-emerald-950 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-200/80">
          <p>© {new Date().getFullYear()} UPT Perpustakaan Universitas Islam Madura (UIM Pamekasan). Seluruh Hak Cipta Dilindungi.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Didukung oleh SLiMS 9 Bulian & Sistem Rekomendasi Cerdas</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
