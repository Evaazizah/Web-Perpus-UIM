import React, { useState } from 'react';
import { addBibliografi } from '../lib/bookService';
import { X, BookPlus, Sparkles, Check, Image as ImageIcon } from 'lucide-react';

export default function AdminQuickAddModal({ isOpen, onClose, onBookAdded }) {
  const [judul, setJudul] = useState('');
  const [penulis, setPenulis] = useState('');
  const [kategori, setKategori] = useState('Ilmu-ilmu Sosial');
  const [isbn, setIsbn] = useState('');
  const [salin, setSalin] = useState(1);
  const [sinopsis, setSinopsis] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!judul.trim() || !penulis.trim()) return;

    setLoading(true);
    try {
      const newBook = addBibliografi({
        judul: judul.trim(),
        penulis: penulis.trim(),
        kategori,
        isbn: isbn.trim(),
        salin: Number(salin) || 1,
        sinopsis: sinopsis.trim(),
        cover_url: coverUrl.trim()
      });

      if (onBookAdded) onBookAdded(newBook);
      onClose();

      // Reset
      setJudul('');
      setPenulis('');
      setIsbn('');
      setSinopsis('');
      setCoverUrl('');
    } catch (err) {
      alert(err.message || 'Gagal menambahkan buku');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="p-5 bg-gradient-to-r from-[#064e3b] to-[#047857] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BookPlus className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base">Input Cepat Bibliografi Buku</h3>
              <p className="text-[11px] text-emerald-100">Koleksi baru akan langsung tampil di Beranda OPAC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-emerald-100 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Buku / Koleksi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Metodologi Penelitian Hukum Islam"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Pengarang / Penulis <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={penulis}
                onChange={(e) => setPenulis(e.target.value)}
                placeholder="Nama Pengarang"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subjek / Kategori
              </label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              >
                <option value="Ilmu-ilmu Sosial">Ilmu-ilmu Sosial</option>
                <option value="Kesusastraan">Kesusastraan</option>
                <option value="Ilmu-ilmu Terapan">Ilmu-ilmu Terapan</option>
                <option value="Kesenian, Hiburan, dan Olahraga">Kesenian, Hiburan, dan Olahraga</option>
                <option value="Sains & Teknologi">Sains & Teknologi</option>
                <option value="Agama & Fiqih">Agama & Fiqih</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ISBN / ISSN
              </label>
              <input
                type="text"
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                placeholder="978-602-xxx"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Jumlah Eksemplar
              </label>
              <input
                type="number"
                min={1}
                value={salin}
                onChange={(e) => setSalin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Gambar Sampul (Opsional)
            </label>
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... (atau kosongkan untuk sampul bawaan)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Sinopsis & Catatan Ringkas
            </label>
            <textarea
              rows={3}
              value={sinopsis}
              onChange={(e) => setSinopsis(e.target.value)}
              placeholder="Ringkasan isi buku atau deskripsi singkat koleksi perpustakaan..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#047857]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{loading ? 'Menyimpan...' : 'Simpan Koleksi Buku'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

