import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getStoredBooks, syncBooksFromFirebase, subscribeBooks, deleteBibliografi, clearAllBooks } from '../lib/bookService';
import { getStoredMembers, syncMembersFromFirebase, subscribeMembers, countPendingVerifications } from '../lib/memberService';
import {
  getStoredLoans,
  syncLoansFromFirebase,
  subscribeLoans,
  getLoansByNim,
  createLoan,
  renewLoan
} from '../lib/circulationService';
import { isFirebaseConfigured } from '../lib/firebase';
import { getRecommendationsForUser } from '../lib/recommendationEngine';
import { saveUserRating, subscribeRatings, fetchAllRatings } from '../lib/ratingService';
import { fetchUserBookmarks, toggleBookmark } from '../lib/bookmarkService';
import HeroBanner from '../components/HeroBanner';
import QuickAccessRow from '../components/QuickAccessRow';
import ThreeCardsHub from '../components/ThreeCardsHub';
import BookCard from '../components/BookCard';
import StudentCardModal from '../components/StudentCardModal';
import AdminQuickAddModal from '../components/AdminQuickAddModal';
import VisitorCounterWidget from '../components/VisitorCounterWidget';
import JournalPortalModal from '../components/JournalPortalModal';
import NewsPortalModal from '../components/NewsPortalModal';
import NotificationModal from '../components/NotificationModal';
import FeedbackModal from '../components/FeedbackModal';
import UimLogo from '../components/UimLogo';
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
  Filter,
  Check,
  X,
  Globe2,
  BookPlus
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
  const [ratings, setRatings] = useState([]);
  const [borrowedIds, setBorrowedIds] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedYear, setSelectedYear] = useState('Semua');
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [catalogTab, setCatalogTab] = useState('popular'); // 'popular' | 'newest' | 'all'
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const { t } = useLanguage();

  // Modals
  const [isStudentCardOpen, setIsStudentCardOpen] = useState(false);
  const [isAdminQuickAddOpen, setIsAdminQuickAddOpen] = useState(false);

  // Novelty Academic Service Modals (Khas Perpustakaan UNUSA / SLiMS 9)
  const [serviceModal, setServiceModal] = useState(null); // 'repositori' | 'bebas-pustaka' | 'turnitin' | 'ejournal' | 'usulan-buku' | null
  const [bookSuggestion, setBookSuggestion] = useState({ judul: '', pengarang: '', penerbit: '', prodi: '', alasan: '' });
  const [checkNimBebasPustaka, setCheckNimBebasPustaka] = useState('');
  const [bebasPustakaResult, setBebasPustakaResult] = useState(null);

  // Mahasiswa states
  const [studentLoans, setStudentLoans] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);

  // ID pengguna yang konsisten (null jika Guest / belum login)
  const activeUserId = currentUser ? (currentUser.uid || currentUser.id) : null;

  // 1. Sinkronisasi Data Real-Time Cloud Firestore (Buku, Rating, Sirkulasi, Anggota)
  useEffect(() => {
    // a. Listener katalog buku
    const unsubBooks = subscribeBooks((liveBooks) => {
      setBooks(liveBooks);
    });

    // b. Listener rating real-time (Collaborative Filtering)
    const unsubRatings = subscribeRatings((liveRatings) => {
      setRatings(liveRatings);
    });

    // c. Listener pinjaman real-time
    const unsubLoans = subscribeLoans((liveLoans) => {
      if (currentUser?.role === 'user' && currentUser?.nim) {
        setStudentLoans(liveLoans.filter((l) => String(l.nim).trim() === String(currentUser.nim).trim()));
      }
    });

    // d. Listener jumlah verifikasi anggota
    const unsubMembers = subscribeMembers(() => {
      setPendingVerifications(countPendingVerifications());
    });

    // Inisialisasi sinkronisasi cloud jika Firestore aktif
    if (isFirebaseConfigured()) {
      syncBooksFromFirebase();
      syncMembersFromFirebase();
      syncLoansFromFirebase();
      fetchAllRatings();
    }

    return () => {
      unsubBooks();
      unsubRatings();
      unsubLoans();
      unsubMembers();
    };
  }, [currentUser]);

  // Muat status bookmark buku pengguna
  useEffect(() => {
    const loadBookmarks = async () => {
      const uid = currentUser?.uid || currentUser?.id || currentUser?.nim || 'local_guest';
      const bMarks = await fetchUserBookmarks(uid);
      setBookmarkedIds(new Set(bMarks.map((b) => String(b.id))));
    };
    loadBookmarks();
  }, [currentUser]);

  const handleToggleBookmark = async (book) => {
    const uid = currentUser?.uid || currentUser?.id || currentUser?.nim || 'local_guest';
    const res = await toggleBookmark(uid, book);
    setBookmarkedIds(new Set(res.bookmarks.map((b) => String(b.id))));
    showToast(
      res.isBookmarked
        ? `Buku "${book.judul}" disimpan ke Favorit!`
        : `Buku "${book.judul}" dihapus dari Favorit.`
    );
  };

  // Map rating user saat ini
  const userRatingsMap = useMemo(() => {
    const map = {};
    if (!activeUserId) return map;
    ratings.forEach((r) => {
      if (String(r.id_user) === String(activeUserId)) {
        map[String(r.id_buku)] = Number(r.nilai_rating);
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

  // 4. Handler Pemberian Rating (Cloud Firestore)
  const handleRateBook = async (bookId, ratingValue) => {
    if (!currentUser) {
      onOpenAuth();
      showToast('Silakan masuk akun terlebih dahulu untuk memberikan penilaian buku.');
      return;
    }

    try {
      await saveUserRating({
        userId: activeUserId,
        bookId,
        ratingValue
      });
      showToast(`Rating ${ratingValue}★ berhasil disimpan ke Firestore! Rekomendasi Cerdas diperbarui.`);
    } catch (err) {
      console.error('Error saat menyimpan rating:', err);
      showToast('Gagal menyimpan rating: ' + (err.message || 'Koneksi error'));
    }
  };

  // 5. Handler Peminjaman Buku
  const handleBorrowBook = async (bookId) => {
    const updated = new Set(borrowedIds);
    updated.add(bookId);
    setBorrowedIds(updated);

    const foundBook = books.find((b) => b.id === bookId);

    if (currentUser?.role === 'user' && currentUser?.nim) {
      await createLoan({
        uid: currentUser.uid || currentUser.id,
        nim: currentUser.nim,
        nama: currentUser.nama || currentUser.nama_lengkap || 'Mahasiswa UIM',
        bookId,
        judul: foundBook?.judul || 'Buku Perpustakaan',
        cover_url: foundBook?.cover_url || ''
      });
      setStudentLoans(getLoansByNim(currentUser.nim));
      showToast(`Buku "${foundBook?.judul || 'Buku'}" berhasil dipinjam! Silakan ambil di Meja Sirkulasi.`);
    } else {
      showToast('Buku berhasil dipinjam! Silakan ambil fisik buku di Meja Sirkulasi Perpustakaan UIM.');
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

  const handleCheckBebasPustaka = (e) => {
    e?.preventDefault();
    const nimToCheck = checkNimBebasPustaka.trim() || (currentUser?.role === 'user' ? currentUser.nim : '');
    if (!nimToCheck) {
      showToast('Masukkan NIM mahasiswa terlebih dahulu');
      return;
    }
    const loans = getLoansByNim(nimToCheck);
    const active = loans.filter((l) => l.status === 'dipinjam');
    if (active.length === 0) {
      setBebasPustakaResult({
        status: 'clear',
        nim: nimToCheck,
        message: 'Selamat! Tidak ada tanggungan pinjaman buku perpustakaan. Anda memenuhi syarat penerbitan Surat Bebas Pustaka.'
      });
    } else {
      setBebasPustakaResult({
        status: 'pending',
        nim: nimToCheck,
        count: active.length,
        message: `Masih terdapat ${active.length} buku yang belum dikembalikan ke Meja Sirkulasi.`
      });
    }
  };

  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!bookSuggestion.judul.trim()) {
      showToast('Mohon masukkan judul buku yang diusulkan');
      return;
    }

    const payload = {
      ...bookSuggestion,
      userNim: currentUser?.nim || 'Mahasiswa UIM',
      userName: currentUser?.nama || currentUser?.nama_lengkap || 'Anonim',
      tanggal: new Date().toISOString()
    };

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      try {
        const { enqueueOfflineAction } = await import('../lib/offlineQueueService');
        await enqueueOfflineAction({
          action: 'PROPOSE_BOOK',
          collectionName: 'data_staging',
          payload,
          meta: { summary: `Usulan Buku: "${bookSuggestion.judul}"` }
        });
        showToast(`Usulan tersimpan di Antrean Offline (IndexedDB). Otomatis sinkron saat online.`);
      } catch (err) {
        showToast(`Usulan buku "${bookSuggestion.judul}" berhasil dicatat.`);
      }
    } else {
      try {
        const { ingestStagingData } = await import('../lib/stagingService');
        await ingestStagingData({
          sumber: 'usulan_pemustaka',
          metadata: payload,
          catatan: `Usulan pengadaan dari civitas akademika (${payload.userNim})`
        });
        showToast(`Usulan buku "${bookSuggestion.judul}" berhasil dikirimkan ke UPT Perpustakaan UIM!`);
      } catch (err) {
        showToast(`Usulan buku "${bookSuggestion.judul}" berhasil dikirimkan.`);
      }
    }

    setBookSuggestion({ judul: '', pengarang: '', penerbit: '', prodi: '', alasan: '' });
    setServiceModal(null);
  };

  const categories = ['Semua', ...new Set(books.map((b) => b.kategori))];

  const totalBooks = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (Number(b.salin) || 1), 0);
  const totalMembers = getStoredMembers().length;

  // Active student loans
  const activeStudentLoans = studentLoans.filter((l) => l.status === 'dipinjam');

  // Daftar Tahun Terbit yang Tersedia
  const availableYears = useMemo(() => {
    const years = books
      .map((b) => b.tahun || b.tahun_terbit)
      .filter((y) => Boolean(y) && !isNaN(Number(y)))
      .map(Number);
    return ['Semua', ...Array.from(new Set(years)).sort((a, b) => b - a)];
  }, [books]);

  // Filtering Berdasarkan Search Query, Kategori, Tahun, & Tab
  const filteredBooks = useMemo(() => {
    let list = [...books];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((book) => {
        return (
          (book.judul || '').toLowerCase().includes(q) ||
          (book.penulis || '').toLowerCase().includes(q) ||
          (book.kategori || '').toLowerCase().includes(q) ||
          (book.isbn || '').toLowerCase().includes(q)
        );
      });
    }

    if (selectedCategory !== 'Semua') {
      list = list.filter((book) => book.kategori === selectedCategory);
    }

    if (selectedYear !== 'Semua') {
      list = list.filter((book) => String(book.tahun || book.tahun_terbit) === String(selectedYear));
    }

    if (catalogTab === 'newest') {
      list.sort((a, b) => {
        const yearA = Number(a.tahun || a.tahun_terbit || 0);
        const yearB = Number(b.tahun || b.tahun_terbit || 0);
        return yearB - yearA;
      });
    } else if (catalogTab === 'popular') {
      const ratingCounts = {};
      ratings.forEach((r) => {
        const id = String(r.id_buku);
        ratingCounts[id] = (ratingCounts[id] || 0) + 1;
      });
      list.sort((a, b) => {
        const countA = ratingCounts[String(a.id)] || 0;
        const countB = ratingCounts[String(b.id)] || 0;
        return countB - countA;
      });
    }

    return list;
  }, [books, searchQuery, selectedCategory, selectedYear, catalogTab, ratings]);

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 font-sans selection:bg-[#047857] selection:text-white">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-8 right-6 z-50 bg-[#047857] text-white font-semibold px-4 py-3 rounded-xl shadow-xl border border-emerald-400/50 flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs sm:text-sm">{toastMsg}</span>
        </div>
      )}

      {/* 1. HERO BANNER VIDEO DENGAN SEARCH PILL (Sesuai Rekomendasi Mockup Gambar Pengguna) */}
      <HeroBanner
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* 2. 7 KARTU AKSES CEPAT (Sesuai Mockup Gambar: Katalog, Jurnal, Repository, Berita, Pengumuman, Komentar, Bantuan) */}
      <QuickAccessRow
        onSelectService={(serviceId) => setServiceModal(serviceId)}
        onOpenFeedbackModal={() => setServiceModal('feedback')}
      />

      {/* 3. 3 KARTU INTERAKTIF: BERITA TERBARU, REKOMENDASI UNTUK ANDA (IBCF), INFORMASI PENTING (Sesuai Mockup Gambar) */}
      <ThreeCardsHub
        recommendations={recommendations}
        onSelectBook={(bk) => {
          setSearchQuery(bk.judul);
          const el = document.getElementById('katalog-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenNewsModal={() => setServiceModal('berita')}
        onOpenScheduleModal={() => setServiceModal('informasi')}
      />

      {/* 4. MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* ================= COMPACT PUSTAKAWAN ADMIN COMMAND BAR ================= */}
        {currentUser?.role === 'admin' && (
          <div className="mb-8 bg-slate-900 text-white px-5 py-3.5 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-amber-300">Mode Pustakawan Admin Aktif</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-300 hidden sm:inline">Kelola koleksi bibliografi, verifikasi antrean KTM, dan kelola SLiMS 9</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminQuickAddOpen(true)}
                className="px-3.5 py-1.5 bg-[#047857] hover:bg-[#059669] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Input Buku Baru</span>
              </button>

              {onOpenAdminVerification && (
                <button
                  type="button"
                  onClick={onOpenAdminVerification}
                  className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Verifikasi KTM</span>
                  {pendingVerifications > 0 && (
                    <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
                      {pendingVerifications}
                    </span>
                  )}
                </button>
              )}

              {onSwitchToAdmin && (
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1 border border-slate-700"
                >
                  <span>Dashboard SLiMS</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ================= COMPACT MAHASISWA NOTIFICATION BAR ================= */}
        {currentUser?.role === 'user' && (
          <div className="mb-8 bg-emerald-50/90 border border-emerald-200 p-4 rounded-2xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#047857] text-white font-bold flex items-center justify-center shrink-0">
                {currentUser.nama ? currentUser.nama.charAt(0).toUpperCase() : 'M'}
              </div>
              <div>
                <p className="text-slate-900 font-bold">
                  Assalamu’alaikum, {currentUser.nama || 'Mahasiswa'}!
                  <span className="text-slate-500 font-normal ml-2 font-mono text-[11px]">
                    ({currentUser.nim} • {currentUser.prodi || 'Civitas UIM'})
                  </span>
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {activeStudentLoans.length > 0
                    ? `Anda memiliki ${activeStudentLoans.length} koleksi buku sedang dipinjam.`
                    : 'Status pinjaman bersih (Bebas Tanggungan Perpustakaan).'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsStudentCardOpen(true)}
                className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                <span>KTM Digital</span>
              </button>

              {onOpenProfile && (
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="px-3.5 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>Area Anggota Lengkap &rarr;</span>
                </button>
              )}
            </div>
          </div>
        )}



        {/* 4. KATALOG UTAMA DENGAN TAB FILTER */}
        <section id="katalog-section" className="scroll-mt-24 mb-16">
          {/* Section Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-5 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#047857] text-xs font-semibold mb-2 border border-emerald-200/80">
                <BookMarked className="w-3.5 h-3.5" />
                <span>{t('cat_badge')}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {t('cat_title')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {t('cat_subtitle')}
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
                <span>{t('tab_popular')}</span>
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
                <span>{t('tab_newest')}</span>
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
                <span>{t('tab_all')} ({books.length})</span>
              </button>
            </div>
          </div>

          {/* Filter Bar (Kategori & Tahun Terbit SLiMS 9) */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-50/80 p-3 rounded-2xl border border-slate-200 text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('filter_label')}</span>
              </span>

              {/* Dropdown Kategori */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-emerald-600 shadow-xs"
              >
                <option value="Semua">{t('all_categories')} ({categories.length - 1})</option>
                {categories.filter(c => c !== 'Semua').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Dropdown Tahun Terbit */}
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-700 font-semibold focus:outline-none focus:border-emerald-600 shadow-xs"
              >
                <option value="Semua">{t('all_years')}</option>
                {availableYears.filter(y => y !== 'Semua').map((yr) => (
                  <option key={yr} value={yr}>
                    Tahun {yr}
                  </option>
                ))}
              </select>

              {(selectedCategory !== 'Semua' || selectedYear !== 'Semua' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('Semua');
                    setSelectedYear('Semua');
                    setSearchQuery('');
                  }}
                  className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 rounded-lg font-bold transition-colors"
                >
                  {t('reset_filter')}
                </button>
              )}
            </div>

            <div className="text-slate-500 font-medium text-[11px]">
              {t('showing')} <strong className="text-emerald-800">{filteredBooks.length}</strong> {t('of')} {books.length} {t('titles')}
            </div>
          </div>

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
                  isBookmarked={bookmarkedIds.has(String(book.id))}
                  onToggleBookmark={handleToggleBookmark}
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

        {/* 5. PESAN LITERASI ISLAMI UIM */}
        <section className="mb-14">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] p-6 sm:p-8 text-white shadow-lg">
            <div className="relative z-10 max-w-2xl">
              <span className="text-amber-300 font-mono text-[10px] font-bold uppercase tracking-widest block mb-1.5">
                • PESAN LITERASI ISLAMI UIM •
              </span>
              <blockquote className="text-sm sm:text-base font-serif leading-relaxed italic text-emerald-50">
                “Bacalah dengan menyebut nama Tuhanmu yang menciptakan. Dia telah menciptakan manusia dari segumpal darah. Bacalah, dan Tuhanmulah Yang Maha Mulia.”
              </blockquote>
              <p className="text-[11px] text-amber-200 mt-2 font-medium">
                — QS. Al-'Alaq: 1-3
              </p>
              <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center gap-5 text-xs text-emerald-100">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Berilmu Amaliah
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Beramal Ilmiah
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Berakhlakul Karimah
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 8. STATISTIK PENGUNJUNG PORTAL (PRE-FOOTER) ================= */}
        <section className="mt-12 sm:mt-16">
          <VisitorCounterWidget variant="banner" currentUser={currentUser} />
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

      {/* ================= MODAL NOVELTY: REPOSITORI SKRIPSI & TUGAS AKHIR ================= */}
      {serviceModal === 'repositori' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setServiceModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-blue-700">
              <FileCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold">Repositori Institusi (DSpace UIM)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Koleksi karya ilmiah terbuka mencakup naskah skripsi sarjana, tesis, laporan penelitian dosen, dan jurnal institusi Universitas Islam Madura.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                <span className="font-bold text-slate-800 block">7 Fakultas Terintegrasi</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Fakultas Teknik, Pertanian, Hukum, Agama Islam, FKIP, Ekonomi, dan MIPA.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Ketentuan Penyerahan Softcopy</span>
                <p className="text-[11px] text-slate-500 mt-0.5">Mahasiswa tingkat akhir wajib mengunggah file skripsi lengkap (PDF) sebagai syarat bebas pustaka wisuda.</p>
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Tutup
              </button>
              <a
                href="https://uim.ac.id"
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Buka DSpace UIM</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL NOVELTY: BEBAS PUSTAKA ONLINE ================= */}
      {serviceModal === 'bebas-pustaka' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => {
                setServiceModal(null);
                setBebasPustakaResult(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-amber-600">
              <Award className="w-6 h-6" />
              <h3 className="text-lg font-bold">Layanan Bebas Pustaka Online</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Pengecekan mandiri surat keterangan bebas tanggungan peminjaman buku perpustakaan untuk syarat yudisium dan pendaftaran wisuda.
            </p>

            <form onSubmit={handleCheckBebasPustaka} className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nomor Induk Mahasiswa (NIM):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: 2021503001"
                    value={checkNimBebasPustaka || (currentUser?.nim || '')}
                    onChange={(e) => setCheckNimBebasPustaka(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                  >
                    Periksa
                  </button>
                </div>
              </div>
            </form>

            {bebasPustakaResult && (
              <div className={`p-4 rounded-xl text-xs mb-4 ${
                bebasPustakaResult.status === 'clear'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800'
                  : 'bg-red-50 border border-red-300 text-red-800'
              }`}>
                <div className="flex items-center gap-2 font-bold mb-1">
                  {bebasPustakaResult.status === 'clear' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-600" />
                  )}
                  <span>Status: {bebasPustakaResult.status === 'clear' ? 'BEBAS TANGGUNGAN' : 'BELUM BEBAS PUSTAKA'}</span>
                </div>
                <p className="text-[11px] leading-relaxed">{bebasPustakaResult.message}</p>
                {bebasPustakaResult.status === 'clear' && (
                  <button
                    type="button"
                    onClick={() => {
                      showToast('Surat Keterangan Bebas Pustaka sedang disiapkan untuk diunduh!');
                    }}
                    className="mt-3 w-full py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Cetak Surat Keterangan Bebas Pustaka (PDF)
                  </button>
                )}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block mb-0.5">Syarat Penerbitan:</span>
              • Tidak memiliki pinjaman buku aktif.<br />
              • Tidak memiliki denda keterlambatan.<br />
              • Sudah menyerahkan softcopy skripsi ke meja repositori.
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL NOVELTY: UJI TURNITIN & PLAGIASI ================= */}
      {serviceModal === 'turnitin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setServiceModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-teal-700">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="text-lg font-bold">Layanan Uji Kemiripan (Turnitin)</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Layanan pengecekan similaritas naskah skripsi, tesis, dan artikel jurnal civitas akademika UIM menggunakan akun resmi Turnitin Perpustakaan.
            </p>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200">
                <span className="font-bold text-slate-800 block">Standar Maksimal Kemiripan UIM</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Ambang batas kemiripan (*similarity index*) adalah <strong>maksimal 20%</strong> (tidak termasuk bab referensi/daftar pustaka).</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800 block">Alur Pengajuan Naskah</span>
                <p className="text-[11px] text-slate-600 mt-0.5">Kirimkan file naskah format .doc/.docx beserta cover ke email: <strong className="text-teal-700">turnitin@uim.ac.id</strong> atau datang langsung ke Meja Sirkulasi Lantai 1.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setServiceModal(null)}
              className="mt-5 w-full py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL PORTAL JURNAL & KARYA ILMIAH SIVITAS UIM ================= */}
      <JournalPortalModal
        isOpen={serviceModal === 'ejournal' || serviceModal === 'jurnal'}
        onClose={() => setServiceModal(null)}
        currentUser={currentUser}
        onOpenAuth={onOpenAuth}
      />

      {/* ================= MODAL PORTAL BERITA & WARTA PERPUSTAKAAN UIM ================= */}
      <NewsPortalModal
        isOpen={serviceModal === 'berita'}
        onClose={() => setServiceModal(null)}
        currentUser={currentUser}
      />

      {/* ================= MODAL NOTIFIKASI & PENGUMUMAN RESMI UIM ================= */}
      <NotificationModal
        isOpen={serviceModal === 'pengumuman' || serviceModal === 'informasi'}
        onClose={() => setServiceModal(null)}
        currentUser={currentUser}
        initialTab={serviceModal === 'informasi' ? 'jadwal' : 'list'}
      />

      {/* ================= MODAL NOVELTY: USULAN PENGADAAN BUKU ================= */}
      {serviceModal === 'usulan-buku' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative">
            <button
              onClick={() => setServiceModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-3 text-purple-700">
              <BookPlus className="w-6 h-6" />
              <h3 className="text-lg font-bold">Usulan Pengadaan Koleksi Buku Baru</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Sampaikan usulan judul buku rujukan yang dibutuhkan dalam perkuliahan atau riset Anda untuk kami pertimbangkan dalam pengadaan koleksi perpustakaan.
            </p>
            <form onSubmit={handleSuggestionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Judul Buku yang Diusulkan *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Metodologi Penelitian Kualitatif Praktis"
                  value={bookSuggestion.judul}
                  onChange={(e) => setBookSuggestion({ ...bookSuggestion, judul: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pengarang / Penulis</label>
                  <input
                    type="text"
                    placeholder="Nama Penulis"
                    value={bookSuggestion.pengarang}
                    onChange={(e) => setBookSuggestion({ ...bookSuggestion, pengarang: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Penerbit / Tahun</label>
                  <input
                    type="text"
                    placeholder="Penerbit & Tahun"
                    value={bookSuggestion.penerbit}
                    onChange={(e) => setBookSuggestion({ ...bookSuggestion, penerbit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Program Studi / Keperluan</label>
                <input
                  type="text"
                  placeholder="Contoh: Teknik Informatika - Mata Kuliah Machine Learning"
                  value={bookSuggestion.prodi}
                  onChange={(e) => setBookSuggestion({ ...bookSuggestion, prodi: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Alasan Kebutuhan Koleksi</label>
                <textarea
                  rows="2"
                  placeholder="Jelaskan secara singkat manfaat buku ini bagi civitas akademika..."
                  value={bookSuggestion.alasan}
                  onChange={(e) => setBookSuggestion({ ...bookSuggestion, alasan: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-1 focus:ring-purple-500 focus:outline-none"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition-colors"
                >
                  Kirim Usulan Buku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL KOMENTAR & KOTAK SARAN PEMUSTAKA ================= */}
      <FeedbackModal
        isOpen={serviceModal === 'feedback' || serviceModal === 'komentar'}
        onClose={() => setServiceModal(null)}
        currentUser={currentUser}
      />

      {/* ================= MODAL BANTUAN & PANDUAN PEMUSTAKA ================= */}
      {serviceModal === 'bantuan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 text-slate-800 shadow-2xl relative border border-slate-100 animate-scaleUp">
            <button
              onClick={() => setServiceModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5 mb-4 text-[#047857]">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-100">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Bantuan & Panduan Pemustaka</h3>
                <p className="text-xs text-slate-500">Layanan Informasi Perpustakaan UIM</p>
              </div>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <h4 className="font-bold text-[#047857] mb-0.5">1. Cara Meminjam Koleksi Buku:</h4>
                <p>Login melalui menu <strong>Masuk</strong> (menggunakan NIM atau NIDN), pilih buku dari katalog OPAC, kemudian klik <strong>Pinjam Buku</strong>.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-0.5">2. Durasi & Ketentuan:</h4>
                <p>Masa pinjam adalah 7 hari kalender (maksimal 3 eksemplar). Anda dapat memperpanjang masa pinjam secara mandiri 1x sebelum jatuh tempo.</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-0.5">3. Kontak Hotline Pustakawan:</h4>
                <p>Email: <span className="font-mono text-[#047857] font-semibold">perpus@uim.ac.id</span> • WhatsApp: <span className="font-mono text-slate-700 font-semibold">+62 823-3882-9900</span></p>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setServiceModal(null)}
                className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-colors"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
