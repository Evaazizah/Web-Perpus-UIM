import React, { useState, useEffect } from 'react';
import {
  getStoredFeedbacks,
  subscribeFeedbacks,
  submitFeedback,
  deleteFeedbackItem,
  replyFeedbackItem
} from '../lib/feedbackService';
import {
  MessageSquare,
  X,
  Star,
  Send,
  User,
  Trash2,
  CornerDownRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Heart
} from 'lucide-react';

export default function FeedbackModal({ isOpen, onClose, currentUser }) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('tulis'); // 'tulis' | 'daftar'
  const [loading, setLoading] = useState(false);
  const [successAlert, setSuccessAlert] = useState(null);

  // Form states
  const [nama, setNama] = useState(currentUser?.nama || '');
  const [nim, setNim] = useState(currentUser?.nim || currentUser?.nidn || '');
  const [peran, setPeran] = useState(
    currentUser?.role === 'dosen'
      ? 'Dosen'
      : currentUser?.role === 'admin'
      ? 'Pustakawan'
      : currentUser?.role === 'mahasiswa'
      ? 'Mahasiswa'
      : 'Tamu'
  );
  const [kategori, setKategori] = useState('Layanan Sirkulasi');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [pesan, setPesan] = useState('');

  // Admin reply state
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (!isOpen) return;
    setFeedbacks(getStoredFeedbacks());
    const unsub = subscribeFeedbacks((data) => {
      setFeedbacks(data);
    });
    return () => unsub();
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      setNama(currentUser.nama || '');
      setNim(currentUser.nim || currentUser.nidn || '');
      if (currentUser.role === 'dosen') setPeran('Dosen');
      else if (currentUser.role === 'admin') setPeran('Pustakawan');
      else if (currentUser.role === 'mahasiswa') setPeran('Mahasiswa');
    } else {
      setNama('');
      setNim('');
      setPeran('Tamu');
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    setLoading(true);
    try {
      await submitFeedback({
        nama: nama.trim() || 'Pemustaka UIM',
        nim: nim.trim() || '-',
        peran,
        kategori,
        rating,
        pesan: pesan.trim()
      });

      setPesan('');
      setSuccessAlert('Alhamdulillah! Komentar & masukan Anda berhasil disimpan ke basis data perpustakaan UIM dan diteruskan ke staf pustakawan.');

      // Beralih ke tab daftar ulasan setelah submit agar pemustaka langsung melihat hasilnya
      setTimeout(() => {
        setActiveTab('daftar');
        setSuccessAlert(null);
      }, 1500);
    } catch (err) {
      alert('Gagal mengirimkan komentar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Hapus komentar pemustaka ini?')) return;
    try {
      await deleteFeedbackItem(id);
    } catch (err) {
      alert('Gagal menghapus komentar: ' + err.message);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText.trim()) return;
    try {
      await replyFeedbackItem(id, replyText.trim(), currentUser?.nama || 'Pustakawan UIM');
      setReplyingId(null);
      setReplyText('');
    } catch (err) {
      alert('Gagal mengirimkan tanggapan: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] animate-scaleUp">
        
        {/* Header Modal Hijau UIM */}
        <div className="bg-[#064e3b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Kotak Saran & Komentar Pemustaka
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">
                Perpustakaan Universitas Islam Madura
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigasi */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tulis')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'tulis'
                ? 'border-[#047857] text-[#047857]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Tulis Komentar / Saran</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('daftar')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'daftar'
                ? 'border-[#047857] text-[#047857]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Komentar Sivitas ({feedbacks.length})</span>
          </button>
        </div>

        {/* Alert Banner Notifikasi Sukses */}
        {successAlert && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successAlert}</span>
          </div>
        )}

        {/* Konten Modal */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-slate-50/30">
          
          {/* TAB 1: FORMULIR TULIS KOMENTAR */}
          {activeTab === 'tulis' && (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Info Identitas Terverifikasi / Status Sesi */}
              {currentUser ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {currentUser.nama}
                      </span>
                      <span className="text-slate-500 text-[11px] block">
                        Terverifikasi sebagai <strong>{peran}</strong> {nim && nim !== '-' ? `(NIM/NIDN: ${nim})` : ''}
                      </span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentUser.role === 'dosen'
                      ? 'bg-purple-100 text-purple-700'
                      : currentUser.role === 'admin'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {peran}
                  </span>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 text-[11px] flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Anda belum masuk. Komentar akan dikirim sebagai <strong>Tamu / Pengunjung Umum</strong>.</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nama Pemustaka <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={nama}
                    disabled={!!currentUser}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Nama Lengkap Pemustaka"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] disabled:bg-slate-100 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    NIM / NIDN (Opsional)
                  </label>
                  <input
                    type="text"
                    value={nim}
                    disabled={!!currentUser}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 2024101001"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] disabled:bg-slate-100 disabled:text-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Peran Sivitas
                  </label>
                  <select
                    value={peran}
                    disabled={!!currentUser}
                    onChange={(e) => setPeran(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] disabled:bg-slate-100 disabled:text-slate-600"
                  >
                    <option value="Mahasiswa">Mahasiswa</option>
                    <option value="Dosen">Dosen / Peneliti</option>
                    <option value="Tenaga Kependidikan">Tenaga Kependidikan</option>
                    <option value="Pustakawan">Pustakawan</option>
                    <option value="Tamu">Tamu / Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Kategori Masukan
                  </label>
                  <select
                    value={kategori}
                    onChange={(e) => setKategori(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                  >
                    <option value="Layanan Sirkulasi">Layanan Sirkulasi & Peminjaman</option>
                    <option value="Koleksi Buku">Koleksi Buku & E-Journal</option>
                    <option value="Fasilitas Ruang Baca">Fasilitas Ruang Baca & AC</option>
                    <option value="Sistem Website">Sistem Website & OPAC SLiMS</option>
                    <option value="Saran Umum">Saran & Apresiasi Umum</option>
                  </select>
                </div>
              </div>

              {/* Rating Bintang */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Tingkat Kepuasan Layanan:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-slate-300 hover:scale-110 transition-transform focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || rating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-600">
                    {rating === 5
                      ? 'Sangat Puas ★★★★★'
                      : rating === 4
                      ? 'Puas ★★★★☆'
                      : rating === 3
                      ? 'Cukup ★★★☆☆'
                      : rating === 2
                      ? 'Kurang ★★☆☆☆'
                      : 'Perlu Peningkatan ★☆☆☆☆'}
                  </span>
                </div>
              </div>

              {/* Textarea Pesan */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Komentar, Kritik, atau Saran <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={pesan}
                  onChange={(e) => setPesan(e.target.value)}
                  placeholder="Tuliskan pengalaman, kendala, atau saran konstruktif untuk kemajuan perpustakaan UIM..."
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Menyimpan...' : 'Kirim Komentar'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DAFTAR KOMENTAR PEMUSTAKA */}
          {activeTab === 'daftar' && (
            <div className="space-y-3">
              {feedbacks.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <MessageSquare className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-xs sm:text-sm">
                    Belum Ada Komentar Pemustaka
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    Basis data komentar saat ini kosong dan siap diuji coba. Silakan klik tab "Tulis Komentar / Saran" di atas untuk mengirimkan masukan pertama Anda!
                  </p>
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    className="p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all text-xs space-y-2.5 relative group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#047857] font-extrabold flex items-center justify-center shrink-0 text-xs">
                          {fb.nama.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-slate-900">{fb.nama}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              fb.peran === 'Dosen'
                                ? 'bg-purple-100 text-purple-700'
                                : fb.peran === 'Pustakawan'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {fb.peran}
                            </span>
                            {fb.nim && fb.nim !== '-' && (
                              <span className="text-slate-400 font-mono text-[10px]">
                                ({fb.nim})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                            <span>{fb.tanggal}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold">{fb.kategori}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bintang Rating */}
                      <div className="flex items-center text-amber-400 shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (fb.rating || 5)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Isi Pesan */}
                    <p className="text-slate-700 leading-relaxed pl-10">
                      "{fb.pesan}"
                    </p>

                    {/* Tanggapan Admin / Pustakawan */}
                    {fb.tanggapanAdmin && (
                      <div className="ml-10 p-3 bg-emerald-50/80 border-l-2 border-[#047857] rounded-r-xl space-y-1">
                        <div className="flex items-center gap-1.5 text-[#047857] font-bold text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Tanggapan {fb.tanggapanAdmin.penjawab}:</span>
                          <span className="text-slate-400 font-normal font-mono text-[10px]">({fb.tanggapanAdmin.tanggal})</span>
                        </div>
                        <p className="text-slate-700 text-xs italic">
                          "{fb.tanggapanAdmin.pesan}"
                        </p>
                      </div>
                    )}

                    {/* Kontrol Admin (Hapus & Balas) */}
                    {isAdmin && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3 text-[11px]">
                        <button
                          type="button"
                          onClick={() => setReplyingId(replyingId === fb.id ? null : fb.id)}
                          className="text-[#047857] hover:underline font-semibold flex items-center gap-1"
                        >
                          <CornerDownRight className="w-3 h-3" />
                          <span>{replyingId === fb.id ? 'Tutup Balasan' : 'Balas Masukan'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(fb.id, e)}
                          className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    )}

                    {/* Form Balasan Admin Inline */}
                    {isAdmin && replyingId === fb.id && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                        <textarea
                          rows="2"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Tuliskan tanggapan resmi dari pihak perpustakaan..."
                          className="w-full p-2 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-[#047857]"
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText('');
                            }}
                            className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-[11px]"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(fb.id)}
                            className="px-3.5 py-1 bg-[#047857] hover:bg-[#065f46] text-white rounded-lg font-bold text-[11px]"
                          >
                            Kirim Tanggapan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 shrink-0">
          <span>Setiap saran & masukan Anda sangat berharga bagi peningkatan mutu layanan perpustakaan UIM.</span>
        </div>
      </div>
    </div>
  );
}

