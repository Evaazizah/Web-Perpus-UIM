import React, { useState, useEffect } from 'react';
import UimLogo from './UimLogo';
import {
  getStoredNews,
  subscribeNews,
  addNewsItem,
  deleteNewsItem
} from '../lib/newsService';
import {
  X,
  Newspaper,
  Calendar,
  User,
  Tag,
  Search,
  ArrowRight,
  Share2,
  Clock,
  BookOpen,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';

const NEWS_CATEGORIES = [
  'Semua',
  'Literasi Digital',
  'Workshop Akademik',
  'Kerjasama Perpustakaan',
  'Layanan Pemustaka',
  'Pengumuman Kampus'
];

export default function NewsPortalModal({ isOpen, onClose, currentUser }) {
  const [newsList, setNewsList] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [activeTab, setActiveTab] = useState('katalog'); // 'katalog' | 'tambah'
  const [loading, setLoading] = useState(false);

  // Form states untuk Admin Tambah Berita
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Literasi Digital');
  const [author, setAuthor] = useState(currentUser?.nama || 'Humas UPT Perpustakaan UIM');
  const [image, setImage] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isOpen) return;
    setNewsList(getStoredNews());
    const unsub = subscribeNews((data) => {
      setNewsList(data);
    });
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (currentUser?.nama) {
      setAuthor(currentUser.nama);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const filteredNews = newsList.filter((item) => {
    const matchCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.title?.toLowerCase().includes(q) ||
      item.summary?.toLowerCase().includes(q) ||
      item.content?.toLowerCase().includes(q);
    return matchCategory && matchSearch;
  });

  const handleAddNewsSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Hanya staf pustakawan/admin yang dapat mempublikasikan berita.');
      return;
    }

    setLoading(true);
    setSuccessMsg('');
    try {
      await addNewsItem({
        title,
        category,
        author: author || 'Humas UPT Perpustakaan UIM',
        image:
          image ||
          'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
        summary,
        content
      });

      setTitle('');
      setImage('');
      setSummary('');
      setContent('');
      setSuccessMsg('Berita berhasil diterbitkan dan tersimpan ke basis data perpustakaan!');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('katalog');
      }, 1500);
    } catch (err) {
      alert('Gagal menerbitkan berita: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Hapus berita ini dari basis data?')) return;
    try {
      await deleteNewsItem(id);
      if (selectedNews?.id === id) setSelectedNews(null);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative text-slate-800 max-h-[92vh] flex flex-col overflow-hidden border border-emerald-800/20">

        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-[#022c22] via-[#064e3b] to-[#047857] p-5 sm:p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <UimLogo className="w-12 h-12 shrink-0 drop-shadow" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                    Warta Resmi Kampus
                  </span>
                  <span className="text-emerald-300 text-xs hidden sm:inline">• UPT Perpustakaan UIM</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  Portal Berita & Kegiatan Perpustakaan UIM
                </h2>
                <p className="text-xs text-emerald-100/80 mt-0.5">
                  Kabar terkini seputar literasi ilmiah, workshop sitasi, layanan pemustaka, dan kegiatan civitas akademika
                </p>
              </div>
            </div>

            {/* Navigasi Tab Admin */}
            {isAdmin && (
              <div className="flex items-center gap-1.5 bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-600/50 shrink-0 self-start sm:self-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('katalog')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'katalog'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Daftar Berita ({newsList.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tambah')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                    activeTab === 'tambah'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-emerald-200 hover:text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Tambah Berita</span>
                </button>
              </div>
            )}
          </div>

          {/* Search & Category Filter (Hanya tampil di tab katalog) */}
          {activeTab === 'katalog' && (
            <div className="mt-5 pt-3 border-t border-emerald-700/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari judul warta atau artikel berita..."
                  className="w-full pl-9 pr-4 py-1.5 bg-[#022c22]/90 border border-emerald-600/60 rounded-xl text-xs text-white placeholder-emerald-300/60 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none pb-0.5">
                {NEWS_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all text-[11px] ${
                      selectedCategory === cat
                        ? 'bg-amber-400 text-slate-950 shadow-xs'
                        : 'bg-emerald-900/60 text-emerald-100 hover:text-white hover:bg-emerald-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">

          {/* ================= TAB 1: KATALOG BERITA ================= */}
          {activeTab === 'katalog' && (
            <>
              {filteredNews.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center mx-auto mb-3">
                    <Newspaper className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    {newsList.length === 0
                      ? 'Belum Ada Warta atau Berita Perpustakaan'
                      : 'Tidak Ditemukan Berita yang Sesuai'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                    {newsList.length === 0
                      ? isAdmin
                        ? 'Basis data berita saat ini bersih dan kosong. Klik tombol "+ Tambah Berita" di atas untuk mempublikasikan artikel warta kegiatan pertama Anda.'
                        : 'Saat ini belum ada warta kegiatan perpustakaan yang dipublikasikan oleh staf humas.'
                      : 'Coba ubah kata kunci pencarian atau pilih kategori yang berbeda.'}
                  </p>
                  {isAdmin && newsList.length === 0 && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={() => setActiveTab('tambah')}
                        className="px-5 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Terbitkan Berita Pertama Sekarang</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredNews.map((news) => (
                    <div
                      key={news.id}
                      onClick={() => setSelectedNews(news)}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="relative h-44 overflow-hidden bg-slate-100">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#047857] text-white shadow-sm">
                            {news.category}
                          </span>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={(e) => handleDeleteNews(news.id, e)}
                              className="absolute top-3 right-3 p-1.5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white shadow-md transition-colors"
                              title="Hapus Berita"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="p-4 sm:p-5 space-y-2">
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{news.date}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[130px]">{news.author}</span>
                            </span>
                          </div>

                          <h3 className="font-extrabold text-slate-900 text-sm leading-snug group-hover:text-[#047857] transition-colors line-clamp-2">
                            {news.title}
                          </h3>

                          <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                            {news.summary}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-[#047857]">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ================= TAB 2: FORM TAMBAH BERITA (KHUSUS ADMIN) ================= */}
          {activeTab === 'tambah' && isAdmin && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto space-y-5">
              <div className="flex items-center gap-2 text-[#047857]">
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <h3 className="text-base font-bold text-slate-900">Publikasikan Berita / Warta Baru</h3>
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleAddNewsSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Judul Berita / Kegiatan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Perpustakaan UIM Gelar Workshop Literasi Digital"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] cursor-pointer"
                    >
                      {NEWS_CATEGORIES.filter((c) => c !== 'Semua').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                      Penulis / Bagian Humas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Humas UPT Perpustakaan UIM"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    URL Gambar / Foto Dokumentasi
                  </label>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... (atau kosongkan untuk foto default)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Ringkasan Berita (Lead / Cuplikan) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Cuplikan 1-2 kalimat pengantar berita..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[11px]">
                    Isi Lengkap Berita <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tuliskan berita lengkap di sini (paragraf dipisahkan baris baru)..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('katalog')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{loading ? 'Menyimpan...' : 'Terbitkan Berita'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Detailed News Reader Modal */}
        {selectedNews && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl relative text-slate-800 max-h-[90vh] flex flex-col overflow-hidden">
              <button
                onClick={() => setSelectedNews(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/40 text-white hover:bg-black/60 transition-colors"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-slate-900 shrink-0">
                <img
                  src={selectedNews.image}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end p-5 sm:p-6 text-white">
                  <div className="space-y-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950 inline-block">
                      {selectedNews.category}
                    </span>
                    <h2 className="text-base sm:text-xl font-black leading-snug">
                      {selectedNews.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-emerald-200 pt-1">
                      <span>{selectedNews.date}</span>
                      <span>•</span>
                      <span>Oleh: {selectedNews.author}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed text-justify">
                {selectedNews.content?.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs bg-slate-50 shrink-0">
                <span className="text-slate-400 text-[11px]">UPT Perpustakaan Universitas Islam Madura</span>
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl transition-colors"
                >
                  Tutup Berita
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
