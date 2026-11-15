import React, { useState, useEffect } from 'react';
import UimLogo from './UimLogo';
import {
  getStoredJournals,
  subscribeJournals,
  submitJournal,
  updateJournalStatus,
  deleteJournal,
  incrementJournalView,
  incrementJournalDownload
} from '../lib/journalService';
import {
  X,
  FileText,
  Search,
  Filter,
  Plus,
  BookOpen,
  Award,
  GraduationCap,
  Download,
  ExternalLink,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Check,
  ShieldCheck,
  Globe2,
  Calendar,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

const UIM_PRODI_LIST = [
  'Teknik Informatika (Fakultas Teknik)',
  'Sistem Informasi (Fakultas Teknik)',
  'Pendidikan Agama Islam (FTI)',
  'Hukum Ekonomi Syariah (Fakultas Syariah)',
  'Agroteknologi (Fakultas Pertanian)',
  'Agribisnis (Fakultas Pertanian)',
  'Ilmu Administrasi Publik (Fisip)',
  'Ekonomi Syariah (FEB)',
  'Pendidikan Bahasa & Sastra Indonesia (FKIP)',
  'Pendidikan Bahasa Inggris (FKIP)',
  'Pendidikan Matematika (FKIP)',
  'Ilmu Hukum (Fakultas Hukum)',
  'Pascasarjana / S2 UIM'
];

export default function JournalPortalModal({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth
}) {
  const [journals, setJournals] = useState([]);
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'unggah' | 'karya_saya' | 'kurasi'
  const [filterType, setFilterType] = useState('all'); // 'all' | 'mahasiswa' | 'dosen'
  const [filterProdi, setFilterProdi] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJournal, setSelectedJournal] = useState(null); // Detail modal preview
  const [loading, setLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [rejectingId, setRejectingId] = useState(null);

  // Form input states
  const [tipePenulis, setTipePenulis] = useState(currentUser?.role === 'dosen' ? 'dosen' : 'mahasiswa');
  const [judul, setJudul] = useState('');
  const [penulisUtama, setPenulisUtama] = useState(currentUser?.nama || '');
  const [nimNidn, setNimNidn] = useState(currentUser?.nidn || currentUser?.nim || '');
  const [prodi, setProdi] = useState(currentUser?.prodi || UIM_PRODI_LIST[0]);
  const [rekanPenulis, setRekanPenulis] = useState('');
  const [namaJurnal, setNamaJurnal] = useState('Jurnal Inovasi Sains dan Teknologi UIM');
  const [volume, setVolume] = useState('Vol. 1');
  const [nomor, setNomor] = useState('No. 1');
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [halaman, setHalaman] = useState('1-12');
  const [issn, setIssn] = useState('');
  const [doi, setDoi] = useState('');
  const [abstrakId, setAbstrakId] = useState('');
  const [abstrakEn, setAbstrakEn] = useState('');
  const [kataKunci, setKataKunci] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  // Sinkronisasi data real-time
  useEffect(() => {
    if (!isOpen) return;
    setJournals(getStoredJournals());
    const unsub = subscribeJournals((data) => {
      setJournals(data);
    });
    return () => unsub();
  }, [isOpen]);

  // Autofill saat pergantian profil user
  useEffect(() => {
    if (currentUser) {
      setPenulisUtama(currentUser.nama || '');
      setNimNidn(currentUser.nidn || currentUser.nim || '');
      if (currentUser.role === 'dosen') setTipePenulis('dosen');
      else setTipePenulis('mahasiswa');
      if (currentUser.prodi) setProdi(currentUser.prodi);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const isAdmin = currentUser?.role === 'admin';
  const isDosen = currentUser?.role === 'dosen';
  const isMahasiswa = currentUser && currentUser.role !== 'admin' && currentUser.role !== 'dosen';

  // Hitung statistik
  const publishedJournals = journals.filter((j) => j.status === 'published');
  const countMahasiswa = publishedJournals.filter((j) => j.tipe_penulis === 'mahasiswa').length;
  const countDosen = publishedJournals.filter((j) => j.tipe_penulis === 'dosen').length;
  const pendingJournals = journals.filter((j) => j.status === 'pending');
  const userJournals = currentUser
    ? journals.filter((j) => j.uploader_uid === currentUser.uid || j.nim_nidn === (currentUser.nidn || currentUser.nim))
    : [];

  // Filter pencarian katalog
  const filteredJournals = publishedJournals.filter((j) => {
    const matchType = filterType === 'all' || j.tipe_penulis === filterType;
    const matchProdi = filterProdi === 'all' || j.prodi === filterProdi;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      j.judul?.toLowerCase().includes(q) ||
      j.penulis_utama?.toLowerCase().includes(q) ||
      j.rekan_penulis?.toLowerCase().includes(q) ||
      j.kata_kunci?.toLowerCase().includes(q) ||
      j.nama_jurnal?.toLowerCase().includes(q);
    return matchType && matchProdi && matchSearch;
  });

  // Submit Handler Unggah Jurnal
  const handleSubmitJournal = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFeedbackMsg(null);

    try {
      const newEntry = await submitJournal({
        judul,
        tipe_penulis: tipePenulis,
        penulis_utama: penulisUtama,
        nim_nidn: nimNidn,
        prodi,
        fakultas: 'Universitas Islam Madura',
        rekan_penulis: rekanPenulis,
        nama_jurnal: namaJurnal,
        volume,
        nomor,
        tahun,
        halaman,
        issn,
        doi,
        abstrak_id: abstrakId,
        abstrak_en: abstrakEn,
        kata_kunci: kataKunci,
        file_url: fileUrl,
        uploader_uid: currentUser?.uid || 'anon',
        uploader_role: currentUser?.role || 'user',
        uploader_nama: currentUser?.nama || penulisUtama
      });

      // Reset form
      setJudul('');
      setAbstrakId('');
      setAbstrakEn('');
      setKataKunci('');
      setFileUrl('');
      setRekanPenulis('');

      if (isAdmin) {
        setFeedbackMsg({
          type: 'success',
          text: 'Artikel jurnal berhasil diterbitkan dan langsung tayang di katalog publik!'
        });
        setActiveTab('katalog');
      } else {
        setFeedbackMsg({
          type: 'success',
          text: 'Naskah karya ilmiah berhasil diajukan! Berkas kini masuk ke antrean verifikasi pustakawan untuk peninjauan sebelum terbit.'
        });
        setActiveTab('karya_saya');
      }
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: 'Gagal mengajukan naskah jurnal: ' + err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler Pustakawan Approve
  const handleApprove = async (journalId) => {
    try {
      await updateJournalStatus(journalId, 'published', 'Disetujui oleh Pustakawan UIM');
      setFeedbackMsg({
        type: 'success',
        text: 'Naskah jurnal berhasil disetujui & diterbitkan ke publik!'
      });
    } catch (e) {
      alert('Gagal menyetujui naskah: ' + e.message);
    }
  };

  // Handler Pustakawan Reject / Minta Revisi
  const handleRejectSubmit = async (journalId) => {
    try {
      await updateJournalStatus(journalId, 'rejected', adminReviewNotes || 'Perlu perbaikan format naskah dan abstrak.');
      setRejectingId(null);
      setAdminReviewNotes('');
      setFeedbackMsg({
        type: 'info',
        text: 'Catatan penolakan/revisi telah dikirimkan kepada pengunggah.'
      });
    } catch (e) {
      alert('Gagal memperbarui status: ' + e.message);
    }
  };

  // Handler Hapus Jurnal (Admin)
  const handleDelete = async (journalId) => {
    if (!window.confirm('Hapus publikasi jurnal ini dari basis data?')) return;
    try {
      await deleteJournal(journalId);
      if (selectedJournal?.id === journalId) setSelectedJournal(null);
    } catch (e) {
      alert('Gagal menghapus: ' + e.message);
    }
  };

  const handleOpenPdf = (journal) => {
    incrementJournalDownload(journal.id);
    if (journal.file_url) {
      window.open(journal.file_url, '_blank', 'noopener,noreferrer');
    } else {
      alert('Tautan dokumen fulltext PDF belum tersedia untuk naskah ini.');
    }
  };

  const handleOpenDetail = (journal) => {
    incrementJournalView(journal.id);
    setSelectedJournal(journal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl relative text-slate-800 max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">
        
        {/* ================= MODAL TOP HEADER ================= */}
        <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UimLogo className="w-12 h-12 shrink-0 drop-shadow" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    SLiMS 9 Terbitan Ilmiah
                  </span>
                  <span className="text-emerald-300 text-xs hidden sm:inline">• Portal Publikasi Kampus</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  Portal Jurnal & Karya Ilmiah Sivitas UIM
                </h2>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Katalog Terbitan Ilmiah, Artikel Skripsi Mahasiswa & Luaran Riset Dosen Universitas Islam Madura
                </p>
              </div>
            </div>

            {/* Quick Counters */}
            <div className="flex items-center gap-2 bg-emerald-950/50 p-2 rounded-2xl border border-emerald-500/20 text-center text-xs shrink-0 self-start md:self-auto">
              <div className="px-3">
                <span className="block text-lg font-black text-amber-300">{publishedJournals.length}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Total Terbit</span>
              </div>
              <div className="px-3 border-x border-emerald-800/60">
                <span className="block text-lg font-black text-sky-300">{countMahasiswa}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Mahasiswa</span>
              </div>
              <div className="px-3 border-r border-emerald-800/60">
                <span className="block text-lg font-black text-emerald-300">{countDosen}</span>
                <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Dosen</span>
              </div>
              {isAdmin && (
                <div className="px-3">
                  <span className="block text-lg font-black text-red-400">{pendingJournals.length}</span>
                  <span className="text-[10px] text-emerald-200 uppercase tracking-wider">Antrean</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Bar Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mt-5 pt-3 border-t border-emerald-700/50 text-xs font-bold">
            <button
              onClick={() => setActiveTab('katalog')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'katalog'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/70'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Jelajahi Jurnal Ilmiah ({publishedJournals.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('unggah')}
              className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                activeTab === 'unggah'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-emerald-100 hover:text-white hover:bg-emerald-800/70'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Unggah Karya Ilmiah</span>
            </button>

            {currentUser && (
              <button
                onClick={() => setActiveTab('karya_saya')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === 'karya_saya'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/70'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Karya Saya ({userJournals.length})</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab('kurasi')}
                className={`px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === 'kurasi'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-emerald-100 hover:text-white hover:bg-emerald-800/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Kurasi Pustakawan</span>
                {pendingJournals.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {pendingJournals.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert Bar */}
        {feedbackMsg && (
          <div
            className={`p-3 text-xs font-semibold flex items-center justify-between border-b ${
              feedbackMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : feedbackMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ================= MODAL BODY CONTENT ================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">

          {/* ================= 1. TAB KATALOG JURNAL ================= */}
          {activeTab === 'katalog' && (
            <div className="space-y-4">
              {/* Search & Filter Header */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari judul artikel, nama penulis (mahasiswa/dosen), kata kunci..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#047857]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Pills Tipe Penulis */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold shrink-0">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      filterType === 'all'
                        ? 'bg-[#047857] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Semua ({publishedJournals.length})
                  </button>
                  <button
                    onClick={() => setFilterType('mahasiswa')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      filterType === 'mahasiswa'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Mahasiswa ({countMahasiswa})</span>
                  </button>
                  <button
                    onClick={() => setFilterType('dosen')}
                    className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                      filterType === 'dosen'
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Dosen ({countDosen})</span>
                  </button>
                </div>

                {/* Filter Program Studi */}
                <select
                  value={filterProdi}
                  onChange={(e) => setFilterProdi(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:border-[#047857]"
                >
                  <option value="all">Semua Program Studi</option>
                  {UIM_PRODI_LIST.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid List Jurnal */}
              {filteredJournals.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    {publishedJournals.length === 0
                      ? 'Belum Ada Publikasi Jurnal yang Terbit'
                      : 'Tidak Ada Karya Ilmiah yang Sesuai Filter'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
                    {publishedJournals.length === 0
                      ? 'Koleksi jurnal karya mahasiswa dan dosen sivitas UIM saat ini masih kosong. Silakan masuk dan unggah naskah artikel ilmiah pertama Anda.'
                      : 'Coba ubah kata kunci pencarian atau ganti filter program studi.'}
                  </p>
                  <div className="mt-5">
                    <button
                      onClick={() => setActiveTab('unggah')}
                      className="px-5 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Unggah Karya Ilmiah Sekarang</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredJournals.map((journal) => {
                    const isMhs = journal.tipe_penulis === 'mahasiswa';
                    return (
                      <div
                        key={journal.id}
                        className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                      >
                        <div className="space-y-2.5">
                          {/* Top Badges */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isMhs
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isMhs ? <GraduationCap className="w-3 h-3" /> : <Award className="w-3 h-3" />}
                              <span>{isMhs ? 'Karya Mahasiswa UIM' : 'Karya Dosen Sivitas'}</span>
                            </span>

                            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{journal.tahun}</span>
                            </span>
                          </div>

                          {/* Judul Artikel */}
                          <h3
                            onClick={() => handleOpenDetail(journal)}
                            className="text-sm font-bold text-slate-900 group-hover:text-[#047857] transition-colors cursor-pointer line-clamp-2 leading-snug"
                          >
                            {journal.judul}
                          </h3>

                          {/* Nama Penulis & Identitas */}
                          <div className="text-xs text-slate-600 space-y-0.5">
                            <p className="font-semibold text-slate-800">
                              {journal.penulis_utama}
                              {journal.rekan_penulis ? `, ${journal.rekan_penulis}` : ''}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {isMhs ? 'NIM' : 'NIDN'}: {journal.nim_nidn || '-'} • {journal.prodi}
                            </p>
                            <p className="text-[11px] text-emerald-800 font-medium">
                              {journal.nama_jurnal} ({journal.volume} {journal.nomor}, {journal.tahun})
                            </p>
                          </div>

                          {/* Cuplikan Abstrak */}
                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            {journal.abstrak_id || journal.abstrak_en || 'Abstrak belum ditambahkan.'}
                          </p>

                          {/* Kata Kunci */}
                          {journal.kata_kunci && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {journal.kata_kunci.split(',').map((kw, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                                >
                                  #{kw.trim()}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Actions */}
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                            <span className="flex items-center gap-1" title="Dilihat">
                              <Eye className="w-3.5 h-3.5" />
                              <span>{journal.view_count || 0}</span>
                            </span>
                            <span className="flex items-center gap-1" title="Diunduh">
                              <Download className="w-3.5 h-3.5" />
                              <span>{journal.download_count || 0}</span>
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenDetail(journal)}
                              className="px-3 py-1.5 text-[#047857] hover:bg-emerald-50 rounded-lg font-bold text-xs transition-colors"
                            >
                              Lihat Abstrak
                            </button>

                            <button
                              onClick={() => handleOpenPdf(journal)}
                              className="px-3.5 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh PDF</span>
                            </button>

                            {isAdmin && (
                              <button
                                onClick={() => handleDelete(journal.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Hapus Naskah Jurnal"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= 2. TAB UNGGAH KARYA ILMIAH ================= */}
          {activeTab === 'unggah' && (
            <div className="max-w-3xl mx-auto">
              {!currentUser ? (
                /* Pengguna Belum Login */
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      Autentikasi Sivitas Akademika Diperlukan
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                      Sesuai prosedur baku perpustakaan SLiMS dan penerbitan karya ilmiah, pengunggahan naskah jurnal memerlukan verifikasi identitas resmi (KTM Mahasiswa atau NIDN Dosen UIM).
                    </p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onOpenAuth && onOpenAuth('login')}
                      className="px-6 py-3 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
                    >
                      Masuk sebagai Mahasiswa / Dosen / Pustakawan
                    </button>
                  </div>
                </div>
              ) : (
                /* Formulir Unggah Resmi */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
                  <div>
                    <div className="flex items-center gap-2 text-[#047857]">
                      <FileText className="w-5 h-5" />
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Formulir Pengajuan Naskah Jurnal & Artikel Ilmiah
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isAdmin
                        ? 'Mode Pustakawan Admin: Naskah yang Anda input akan langsung terbit ke katalog publik SLiMS.'
                        : 'Naskah yang diajukan akan melalui kurasi Pustakawan UIM untuk verifikasi format naskah dan abstrak.'}
                    </p>
                  </div>

                  <form onSubmit={handleSubmitJournal} className="space-y-4 text-xs">
                    {/* Tipe Penulis Selector */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[11px]">
                        Kategori Karya Ilmiah <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <label
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            tipePenulis === 'mahasiswa'
                              ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipePenulis"
                            value="mahasiswa"
                            checked={tipePenulis === 'mahasiswa'}
                            onChange={() => setTipePenulis('mahasiswa')}
                            className="text-sky-600"
                          />
                          <GraduationCap className="w-4 h-4 text-sky-600" />
                          <div>
                            <span className="block">Karya Mahasiswa</span>
                            <span className="text-[10px] text-slate-500 font-normal">Artikel Skripsi / Tugas Akhir / Jurnal</span>
                          </div>
                        </label>

                        <label
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            tipePenulis === 'dosen'
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="tipePenulis"
                            value="dosen"
                            checked={tipePenulis === 'dosen'}
                            onChange={() => setTipePenulis('dosen')}
                            className="text-emerald-600"
                          />
                          <Award className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="block">Karya Dosen</span>
                            <span className="text-[10px] text-slate-500 font-normal">Artikel Jurnal / Riset / Pengabdian</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Judul Artikel */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                        Judul Naskah Artikel Ilmiah <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                        placeholder="Contoh: Implementasi Item-Based Collaborative Filtering pada Sistem Rekomendasi Perpustakaan Digital"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#047857]"
                      />
                    </div>

                    {/* Baris Penulis & NIM/NIDN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          Nama Penulis Utama <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={penulisUtama}
                          onChange={(e) => setPenulisUtama(e.target.value)}
                          placeholder="Nama lengkap beserta gelar (jika ada)"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          {tipePenulis === 'dosen' ? 'NIDN / NIP Dosen' : 'NIM / Nomor KTM Mahasiswa'}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={nimNidn}
                          onChange={(e) => setNimNidn(e.target.value)}
                          placeholder={tipePenulis === 'dosen' ? 'Contoh: 0715088201' : 'Contoh: 2023010045'}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                    </div>

                    {/* Program Studi & Rekan Penulis */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          Homebase Program Studi <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={prodi}
                          onChange={(e) => setProdi(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] cursor-pointer"
                        >
                          {UIM_PRODI_LIST.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          Rekan Penulis (Co-Authors) <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <input
                          type="text"
                          value={rekanPenulis}
                          onChange={(e) => setRekanPenulis(e.target.value)}
                          placeholder="Nama penulis kedua, pembimbing, dll. Pisahkan koma"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                      </div>
                    </div>

                    {/* Metadata Penerbitan / Jurnal */}
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
                      <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">
                        Metadata Publikasi & Wadah Jurnal
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1 text-[11px]">
                            Nama Terbitan / Wadah Jurnal
                          </label>
                          <input
                            type="text"
                            required
                            value={namaJurnal}
                            onChange={(e) => setNamaJurnal(e.target.value)}
                            placeholder="Contoh: Jurnal Inovasi Sains dan Teknologi UIM"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#047857]"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="block font-medium text-slate-700 mb-1 text-[11px]">Volume</label>
                            <input
                              type="text"
                              value={volume}
                              onChange={(e) => setVolume(e.target.value)}
                              placeholder="Vol. 1"
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-center"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-1 text-[11px]">Nomor</label>
                            <input
                              type="text"
                              value={nomor}
                              onChange={(e) => setNomor(e.target.value)}
                              placeholder="No. 1"
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-center"
                            />
                          </div>
                          <div>
                            <label className="block font-medium text-slate-700 mb-1 text-[11px]">Tahun</label>
                            <input
                              type="number"
                              value={tahun}
                              onChange={(e) => setTahun(e.target.value)}
                              className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-medium text-slate-700 mb-1 text-[11px]">Rentang Halaman</label>
                          <input
                            type="text"
                            value={halaman}
                            onChange={(e) => setHalaman(e.target.value)}
                            placeholder="Contoh: 15-28"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1 text-[11px]">ISSN / e-ISSN (Opsional)</label>
                          <input
                            type="text"
                            value={issn}
                            onChange={(e) => setIssn(e.target.value)}
                            placeholder="Contoh: 2548-8921"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-slate-700 mb-1 text-[11px]">DOI / URL OJS (Opsional)</label>
                          <input
                            type="text"
                            value={doi}
                            onChange={(e) => setDoi(e.target.value)}
                            placeholder="https://doi.org/..."
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Abstrak Bahasa Indonesia */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                        Abstrak (Bahasa Indonesia) <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={abstrakId}
                        onChange={(e) => setAbstrakId(e.target.value)}
                        placeholder="Tuliskan latar belakang masalah, metodologi penelitian, dan hasil temuan utama artikel..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                      />
                    </div>

                    {/* Abstrak Bahasa Inggris (Opsional) */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                        Abstract (English) <span className="text-slate-400 font-normal">(Opsional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={abstrakEn}
                        onChange={(e) => setAbstrakEn(e.target.value)}
                        placeholder="Write English abstract here..."
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                      />
                    </div>

                    {/* Kata Kunci & Tautan Dokumen PDF */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          Kata Kunci (Keywords) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={kataKunci}
                          onChange={(e) => setKataKunci(e.target.value)}
                          placeholder="Contoh: Collaborative Filtering, PWA, SLiMS, UIM"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Pisahkan dengan tanda koma (,)</span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                          Tautan Dokumen PDF Fulltext <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          required
                          value={fileUrl}
                          onChange={(e) => setFileUrl(e.target.value)}
                          placeholder="https://drive.google.com/... atau URL dokumen PDF"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">Link berkas naskah lengkap (Google Drive / Cloud publik)</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <span>Menyimpan Naskah...</span>
                        ) : (
                          <>
                            <Check className="w-4 h-4 stroke-[2.5]" />
                            <span>
                              {isAdmin
                                ? 'Terbitkan Naskah ke Katalog Publik SLiMS'
                                : 'Ajukan Naskah ke Pustakawan UIM'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. TAB KARYA SAYA (STATUS PENGAJUAN) ================= */}
          {activeTab === 'karya_saya' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Daftar Pengajuan Naskah Anda
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pantau status verifikasi dan kurasi pustakawan untuk setiap karya yang Anda ajukan.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('unggah')}
                  className="px-3 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajukan Naskah Baru</span>
                </button>
              </div>

              {userJournals.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">
                    Anda belum pernah mengajukan naskah jurnal atau karya ilmiah.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userJournals.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : item.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {item.status === 'published'
                              ? '✓ Telah Diterbitkan'
                              : item.status === 'rejected'
                              ? '✕ Perlu Revisi / Ditolak'
                              : '⏳ Menunggu Kurasi Pustakawan'}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(item.submitted_at).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900">{item.judul}</h4>
                        <p className="text-[11px] text-slate-500">
                          {item.nama_jurnal} ({item.volume} {item.nomor}, {item.tahun})
                        </p>
                        {item.catatan_pustakawan && (
                          <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 border border-slate-200 mt-1">
                            <strong>Catatan Pustakawan:</strong> {item.catatan_pustakawan}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleOpenDetail(item)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          Detail Naskah
                        </button>
                        {item.file_url && (
                          <button
                            onClick={() => handleOpenPdf(item)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#047857] rounded-lg text-xs font-semibold flex items-center gap-1"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Buka PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================= 4. TAB KURASI PUSTAKAWAN (KHUSUS ADMIN) ================= */}
          {activeTab === 'kurasi' && isAdmin && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Antrean Kurasi Naskah Karya Ilmiah Mahasiswa & Dosen
                </h3>
                <p className="text-xs text-slate-500">
                  Verifikasi kepatuhan format, kelengkapan naskah, dan tautan PDF sebelum diterbitkan ke katalog publik SLiMS UIM.
                </p>
              </div>

              {pendingJournals.length === 0 ? (
                <div className="text-center py-14 bg-white rounded-2xl border border-dashed border-slate-200">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800">Semua Antrean Telah Bersih!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Tidak ada naskah yang sedang menunggu verifikasi pustakawan saat ini.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingJournals.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl border border-amber-300 shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.tipe_penulis === 'dosen'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                            }`}
                          >
                            {item.tipe_penulis === 'dosen' ? 'Karya Dosen' : 'Karya Mahasiswa'}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {item.penulis_utama} ({item.nim_nidn})
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Diajukan: {new Date(item.submitted_at).toLocaleString('id-ID')}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.judul}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {item.prodi} • {item.nama_jurnal} ({item.volume} {item.nomor}, {item.tahun})
                        </p>
                        <p className="text-xs text-slate-500 mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                          {item.abstrak_id}
                        </p>
                      </div>

                      {/* Aksi Verifikasi */}
                      <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenPdf(item)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Periksa Berkas PDF</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {rejectingId === item.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={adminReviewNotes}
                                onChange={(e) => setAdminReviewNotes(e.target.value)}
                                placeholder="Alasan / catatan revisi..."
                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs w-48"
                              />
                              <button
                                onClick={() => handleRejectSubmit(item.id)}
                                className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs"
                              >
                                Kirim Catatan
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingId(null);
                                  setAdminReviewNotes('');
                                }}
                                className="px-2 py-1.5 text-slate-500 hover:text-slate-800 text-xs"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRejectingId(item.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold transition-colors"
                            >
                              Minta Revisi / Tolak
                            </button>
                          )}

                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-4 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Setujui & Terbitkan (Publish)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ================= MODAL DETAIL / PREVIEW JURNAL ================= */}
        {selectedJournal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 text-slate-800 shadow-2xl relative max-h-[85vh] overflow-y-auto space-y-4">
              <button
                onClick={() => setSelectedJournal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedJournal.tipe_penulis === 'dosen'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-sky-100 text-sky-800'
                  }`}
                >
                  {selectedJournal.tipe_penulis === 'dosen' ? 'Karya Dosen Sivitas' : 'Karya Mahasiswa UIM'}
                </span>
                <span className="text-xs text-slate-400 font-mono">Tahun {selectedJournal.tahun}</span>
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {selectedJournal.judul}
                </h3>
                <p className="text-xs font-semibold text-slate-700 mt-1">
                  Penulis: {selectedJournal.penulis_utama}
                  {selectedJournal.rekan_penulis ? `, ${selectedJournal.rekan_penulis}` : ''}
                </p>
                <p className="text-[11px] text-slate-500">
                  {selectedJournal.tipe_penulis === 'dosen' ? 'NIDN' : 'NIM'}: {selectedJournal.nim_nidn || '-'} • {selectedJournal.prodi}
                </p>
                <p className="text-[11px] text-[#047857] font-bold mt-0.5">
                  {selectedJournal.nama_jurnal} ({selectedJournal.volume} {selectedJournal.nomor}, Hal. {selectedJournal.halaman || '-'})
                </p>
              </div>

              {/* Abstrak */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Abstrak</h4>
                <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed text-justify">
                  {selectedJournal.abstrak_id || 'Abstrak tidak tersedia.'}
                </p>
              </div>

              {selectedJournal.abstrak_en && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Abstract (English)</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed text-justify italic">
                    {selectedJournal.abstrak_en}
                  </p>
                </div>
              )}

              {/* Kata Kunci */}
              {selectedJournal.kata_kunci && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Kata Kunci</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedJournal.kata_kunci.split(',').map((kw, i) => (
                      <span key={i} className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-md font-medium">
                        #{kw.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Aksi Unduh PDF */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Dilihat {selectedJournal.view_count || 0} kali • Diunduh {selectedJournal.download_count || 0} kali
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJournal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Tutup
                  </button>
                  <button
                    onClick={() => handleOpenPdf(selectedJournal)}
                    className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>Unduh Naskah Fulltext PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

