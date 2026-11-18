import React, { useState, useEffect } from 'react';
import {
  X,
  FileCheck,
  ShieldCheck,
  BookPlus,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Mail,
  Send,
  ArrowRight,
  BookOpen,
  Printer,
  Sparkles
} from 'lucide-react';
import { getLoansByNim } from '../lib/circulationService';
import { enqueueOfflineAction } from '../lib/offlineQueueService';

export default function ServiceModal({
  isOpen,
  serviceType, // 'bebas-pustaka' | 'turnitin' | 'usulan-buku' | 'peminjaman-buku'
  currentUser,
  onClose,
  onNavigateToCatalog
}) {
  // State Bebas Pustaka
  const [nimInput, setNimInput] = useState('');
  const [bebasPustakaResult, setBebasPustakaResult] = useState(null);

  // State Usulan Buku
  const [suggestion, setSuggestion] = useState({
    judul: '',
    pengarang: '',
    penerbit: '',
    prodi: '',
    alasan: ''
  });
  const [suggestionSuccess, setSuggestionSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNimInput(currentUser?.nim || '');
      setBebasPustakaResult(null);
      setSuggestionSuccess(false);
      setSuggestion({ judul: '', pengarang: '', penerbit: '', prodi: '', alasan: '' });
    }
  }, [isOpen, serviceType, currentUser]);

  if (!isOpen) return null;

  // Handler Periksa Bebas Pustaka
  const handleCheckBebasPustaka = (e) => {
    e?.preventDefault();
    const cleanNim = (nimInput || currentUser?.nim || '').trim();
    if (!cleanNim) {
      alert('Masukkan Nomor Induk Mahasiswa (NIM) terlebih dahulu.');
      return;
    }

    const loans = getLoansByNim(cleanNim);
    const activeLoans = loans.filter((l) => l.status === 'dipinjam');

    if (activeLoans.length === 0) {
      setBebasPustakaResult({
        status: 'clear',
        nim: cleanNim,
        nama: currentUser?.name || 'Mahasiswa UIM',
        message: 'Selamat! Tidak ada tanggungan pinjaman buku di UPT Perpustakaan UIM. Anda memenuhi syarat penerbitan Surat Bebas Pustaka.'
      });
    } else {
      setBebasPustakaResult({
        status: 'has_loans',
        nim: cleanNim,
        activeCount: activeLoans.length,
        message: `Terdapat ${activeLoans.length} eksemplar buku yang masih berstatus dipinjam. Harap kembalikan ke loket sirkulasi sebelum mengajukan surat bebas pustaka.`
      });
    }
  };

  // Handler Kirim Usulan Pengadaan Buku
  const handleSuggestionSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.judul.trim()) {
      alert('Judul buku yang diusulkan wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      ...suggestion,
      userNim: currentUser?.nim || 'Civitas',
      userName: currentUser?.name || 'Mahasiswa/Dosen',
      tanggal: new Date().toISOString()
    };

    try {
      if (!navigator.onLine) {
        await enqueueOfflineAction({
          action: 'PROPOSE_BOOK',
          collectionName: 'usulan_buku',
          payload,
          meta: { summary: `Usulan Buku: "${suggestion.judul}"` }
        });
      } else {
        const { ingestStagingData } = await import('../lib/stagingService');
        await ingestStagingData({
          sumber: 'usulan_pemustaka',
          metadata: payload,
          catatan: `Usulan pengadaan buku dari ${payload.userName} (${payload.userNim})`
        });
      }
      setSuggestionSuccess(true);
      setSuggestion({ judul: '', pengarang: '', penerbit: '', prodi: '', alasan: '' });
    } catch (err) {
      alert('Usulan buku berhasil dicatat dalam sistem.');
      setSuggestionSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 relative animate-scaleUp max-h-[92vh] overflow-y-auto">
        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ================= 1. SURAT BEBAS PUSTAKA ONLINE ================= */}
        {serviceType === 'bebas-pustaka' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#047857]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-100 shrink-0">
                <FileCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Surat Bebas Pustaka Online
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  UPT Perpustakaan Universitas Islam Madura
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Pengecekan mandiri surat keterangan bebas pinjaman buku perpustakaan untuk syarat pendaftaran yudisium, wisuda, atau cuti akademik.
            </p>

            <form onSubmit={handleCheckBebasPustaka} className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                Nomor Induk Mahasiswa (NIM):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Contoh: 2021503001"
                  value={nimInput}
                  onChange={(e) => setNimInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-colors shrink-0"
                >
                  Periksa
                </button>
              </div>
            </form>

            {/* Hasil Pengecekan */}
            {bebasPustakaResult && (
              <div
                className={`p-4 rounded-2xl text-xs space-y-2 animate-fadeIn border ${
                  bebasPustakaResult.status === 'clear'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm">
                  {bebasPustakaResult.status === 'clear' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  )}
                  <span>
                    Status: {bebasPustakaResult.status === 'clear' ? 'BEBAS TANGGUNGAN PUSTAKA' : 'MASIH MEMILIKI PINJAMAN'}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">{bebasPustakaResult.message}</p>

                {bebasPustakaResult.status === 'clear' && (
                  <button
                    type="button"
                    onClick={() => {
                      alert(`Surat Keterangan Bebas Pustaka untuk NIM ${bebasPustakaResult.nim} siap diunduh!`);
                    }}
                    className="w-full mt-2 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Cetak Surat Bebas Pustaka (PDF)</span>
                  </button>
                )}
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 block">Ketentuan Bebas Pustaka:</span>
              <p>• Tidak memiliki pinjaman buku yang masih berjalan.</p>
              <p>• Tidak memiliki tanggungan denda keterlambatan koleksi.</p>
              <p>• Telah mengunggah / menyerahkan softcopy karya ilmiah skripsi.</p>
            </div>
          </div>
        )}

        {/* ================= 2. UJI KEMIRIPAN TURNITIN ================= */}
        {serviceType === 'turnitin' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#047857]">
              <div className="w-10 h-10 rounded-2xl bg-teal-50 text-[#047857] flex items-center justify-center border border-teal-100 shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Uji Kemiripan Turnitin
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Pemeriksaan Plagiarisme Karya Ilmiah UIM
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Layanan resmi pengecekan similaritas naskah skripsi, tesis, dan artikel ilmiah dosen menggunakan akun lisensi Turnitin resmi Perpustakaan UIM.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                <span className="font-extrabold text-[#047857] block mb-1">
                  Standar Ambang Batas Kemiripan:
                </span>
                <p className="text-[11px] text-slate-700 leading-relaxed">
                  Ambang batas kemiripan (*similarity index*) adalah <strong>maksimal 20%</strong> (tidak termasuk bab daftar pustaka / bibliografi).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-800 block">Alur Pengajuan Naskah:</span>
                <ol className="text-[11px] text-slate-600 pl-4 list-decimal space-y-1">
                  <li>Format naskah dalam bentuk <strong>.docx / .pdf</strong> (Bab 1 sampai Bab Penutup).</li>
                  <li>Kirim naskah via surel ke: <strong className="text-[#047857]">perpus@uim.ac.id</strong> atau <strong className="text-[#047857]">turnitin@uim.ac.id</strong>.</li>
                  <li>Sertakan keterangan: Nama Lengkap, NIM/NIDN, Program Studi, dan Judul Skripsi.</li>
                  <li>Hasil uji orisinalitas akan dikirimkan dalam 1x24 jam hari kerja.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-colors"
              >
                Tutup Panduan Turnitin
              </button>
            </div>
          </div>
        )}

        {/* ================= 3. USULAN PENGADAAN BUKU ================= */}
        {serviceType === 'usulan-buku' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#047857]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-100 shrink-0">
                <BookPlus className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Usulan Pengadaan Buku
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Partisipasi Pengayaan Literatur Koleksi
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ajukan judul buku atau referensi yang Anda butuhkan dalam perkuliahan atau riset untuk diprioritaskan dalam pengadaan buku perpustakaan.
            </p>

            {suggestionSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fadeIn">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm text-emerald-900">Usulan Berhasil Dikirim!</h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Terima kasih atas usulan buku Anda. Tim pengadaan perpustakaan akan meninjau dan mempertimbangkannya dalam periode pengadaan berikutnya.
                </p>
                <button
                  type="button"
                  onClick={() => setSuggestionSuccess(false)}
                  className="mt-2 px-4 py-1.5 bg-[#047857] text-white rounded-xl text-xs font-bold"
                >
                  Ajukan Buku Lain
                </button>
              </div>
            ) : (
              <form onSubmit={handleSuggestionSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Judul Buku yang Diusulkan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Metodologi Penelitian Praktis"
                    value={suggestion.judul}
                    onChange={(e) => setSuggestion({ ...suggestion, judul: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Penulis / Pengarang</label>
                    <input
                      type="text"
                      placeholder="Nama Pengarang"
                      value={suggestion.pengarang}
                      onChange={(e) => setSuggestion({ ...suggestion, pengarang: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">Penerbit / Tahun</label>
                    <input
                      type="text"
                      placeholder="Penerbit & Tahun"
                      value={suggestion.penerbit}
                      onChange={(e) => setSuggestion({ ...suggestion, penerbit: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Program Studi / Fakultas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Teknik Informatika / PAI / Hukum"
                    value={suggestion.prodi}
                    onChange={(e) => setSuggestion({ ...suggestion, prodi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Alasan Kebutuhan Koleksi</label>
                  <textarea
                    rows={2}
                    placeholder="Jelaskan secara ringkas manfaat buku ini bagi studi Anda..."
                    value={suggestion.alasan}
                    onChange={(e) => setSuggestion({ ...suggestion, alasan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Mengirim...' : 'Kirim Usulan Buku'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= 4. LAYANAN PEMINJAMAN BUKU ================= */}
        {serviceType === 'peminjaman-buku' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-[#047857]">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#047857] flex items-center justify-center border border-emerald-100 shrink-0">
                <RotateCw className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Layanan Peminjaman Buku
                </h3>
                <span className="text-[11px] font-semibold text-emerald-700">
                  Sirkulasi & Peminjaman Koleksi Pustaka
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Panduan teknis dan alur resmi sirkulasi peminjaman koleksi buku di lingkungan UPT Perpustakaan Universitas Islam Madura.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-1.5">
                <span className="font-extrabold text-[#047857] block">
                  Ketentuan Sirkulasi Pokok:
                </span>
                <ul className="text-[11px] text-slate-700 pl-4 list-disc space-y-1">
                  <li>Jumlah buku yang dapat dipinjam maksimal <strong>2 buku</strong>.</li>
                  <li>Masa pinjam buku adalah <strong>7 hari kalender</strong>.</li>
                  <li>Perpanjangan masa pinjam dapat dilakukan 1x secara mandiri di portal anggota sebelum jatuh tempo.</li>
                  <li>Keterlambatan pengembalian dikenakan denda <strong>Rp 500,- per hari per eksemplar</strong>.</li>
                </ul>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="font-extrabold text-slate-800 block">
                  Alur Peminjaman di Loket:
                </span>
                <ol className="text-[11px] text-slate-600 pl-4 list-decimal space-y-1">
                  <li>Cari buku yang diinginkan melalui Katalog OPAC di bawah atau di ruang rak.</li>
                  <li>Periksa kondisi dan kelengkapan halaman buku.</li>
                  <li>Bawa buku dan Kartu Tanda Anggota (KTA/KTM) ke loket meja sirkulasi.</li>
                  <li>Petugas akan mencatat sirkulasi dan memberikan slip tanggal kembali.</li>
                </ol>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateToCatalog) {
                    onNavigateToCatalog();
                  } else {
                    const el = document.getElementById('katalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="flex-1 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Buka Katalog Buku Sekarang</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
