import React, { useState, useEffect } from 'react';
import {
  getStoredNotifications,
  subscribeNotifications,
  addNotificationItem,
  deleteNotificationItem,
  markAllNotificationsAsRead,
  filterNotificationsForUser
} from '../lib/notificationService';
import {
  Bell,
  X,
  Calendar,
  Clock,
  CheckCheck,
  ChevronRight,
  ShieldCheck,
  FileCheck,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  Info,
  MapPin,
  BookOpen,
  AlertCircle,
  PhoneCall
} from 'lucide-react';

export default function NotificationModal({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'list'
}) {
  const [notifs, setNotifs] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab); // 'list' | 'jadwal' | 'tambah'
  const [loading, setLoading] = useState(false);

  // Form states untuk Admin Tambah Pengumuman
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Pengumuman');
  const [color, setColor] = useState('emerald');
  const [targetRole, setTargetRole] = useState('all'); // 'all' | 'mahasiswa' | 'dosen' | 'admin'

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'list');
      const all = getStoredNotifications();
      setNotifs(filterNotificationsForUser(all, currentUser));
      const unsub = subscribeNotifications((data) => {
        setNotifs(filterNotificationsForUser(data, currentUser));
      });
      return () => unsub();
    }
  }, [isOpen, initialTab, currentUser]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    const updated = markAllNotificationsAsRead(currentUser);
    setNotifs(updated);
  };

  const handleAddNotifSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);

    try {
      await addNotificationItem({
        title,
        desc,
        category,
        color,
        targetRole
      });

      setTitle('');
      setDesc('');
      setTargetRole('all');
      setActiveTab('list');
    } catch (err) {
      alert('Gagal menambahkan pengumuman: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotif = async (id, e) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!window.confirm('Hapus pengumuman ini?')) return;
    try {
      await deleteNotificationItem(id);
    } catch (err) {
      alert('Gagal menghapus: ' + err.message);
    }
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[88vh] animate-scaleUp">
        
        {/* Header Modal Hijau UIM */}
        <div className="bg-[#064e3b] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                Pusat Informasi & Pengumuman
              </h3>
              <p className="text-emerald-200 text-xs mt-0.5">
                Perpustakaan Universitas Islam Madura
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'tambah' ? 'list' : 'tambah')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'tambah'
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'bg-emerald-800 text-emerald-100 hover:text-white'
                }`}
                title="Tambah Pengumuman Baru"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{activeTab === 'tambah' ? 'Lihat Info' : '+ Buat'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-emerald-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigasi Konsisten */}
        <div className="px-5 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-[#047857] text-[#047857]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Pengumuman Resmi ({notifs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jadwal')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'jadwal'
                ? 'border-[#047857] text-[#047857]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Jam Layanan & Info</span>
          </button>
        </div>

        {/* Subheader Status pada Tab Pengumuman */}
        {activeTab === 'list' && (
          <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
              <span>{unreadCount > 0 ? `${unreadCount} pengumuman belum dibaca` : 'Semua pengumuman sudah dibaca'}</span>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[#047857] hover:text-[#064e3b] font-bold flex items-center gap-1 hover:underline transition-all"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tandai Semua Dibaca</span>
              </button>
            )}
          </div>
        )}

        {/* Konten Isi Modal */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-slate-50/40">

          {/* ================= TAB 1: DAFTAR PENGUMUMAN ================= */}
          {activeTab === 'list' && (
            <>
              {notifs.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Bell className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-bold text-slate-700 text-xs sm:text-sm">
                    Belum Ada Pengumuman atau Notifikasi
                  </p>
                  <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                    {isAdmin
                      ? 'Basis data notifikasi saat ini kosong. Klik tombol "+ Buat" di atas untuk menyiarkan pengumuman baru kepada sivitas.'
                      : 'Pemberitahuan resmi dari staf perpustakaan akan ditampilkan di sini.'}
                  </p>
                </div>
              ) : (
                notifs.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-200 relative group ${
                      !item.isRead
                        ? 'bg-white border-emerald-200/80 shadow-xs'
                        : 'bg-slate-50/80 border-slate-200/60 opacity-80'
                    }`}
                  >
                    {!item.isRead && (
                      <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-500 ring-4 ring-red-100" />
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#047857] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                        <Clock className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
                            {item.category}
                          </span>
                          {item.targetRole && item.targetRole !== 'all' && (
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                              item.targetRole === 'admin'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : item.targetRole === 'dosen'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                              {item.targetRole === 'admin' ? 'Khusus Admin' : item.targetRole === 'dosen' ? 'Khusus Dosen' : 'Khusus Mahasiswa'}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {item.date}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                          {item.title}
                        </h4>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => handleDeleteNotif(item.id, e)}
                          className="text-[11px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Hapus Pengumuman</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          )}

          {/* ================= TAB 2: JAM LAYANAN & INFORMASI PENTING ================= */}
          {activeTab === 'jadwal' && (
            <div className="space-y-3.5 text-xs">
              {/* Badge Status Jam Operasional Hari Ini */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#047857] text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 text-xs sm:text-sm">
                      Jam Layanan Sirkulasi & Ruang Baca
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-extrabold text-[10px]">
                      Buka
                    </span>
                  </div>
                  <p className="text-emerald-800 mt-0.5 text-[11px]">
                    Senin – Jumat, Pukul 08.00 – 16.00 WIB
                  </p>
                </div>
              </div>

              {/* Rincian Hari Kerja */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#047857]" />
                  <span>Jadwal Operasional Lengkap</span>
                </h4>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Senin – Kamis:</span>
                    <span className="font-mono text-slate-900">08.00 – 16.00 WIB</span>
                  </div>
                  <div className="text-[11px] text-amber-700 italic pl-2">
                    * Istirahat Sholat Dzuhur: 12.00 – 13.00 WIB
                  </div>
                  <div className="flex items-center justify-between pt-1 pb-1.5 border-b border-slate-100">
                    <span className="font-semibold text-slate-700">Jumat:</span>
                    <span className="font-mono text-slate-900">08.00 – 15.30 WIB</span>
                  </div>
                  <div className="text-[11px] text-amber-700 italic pl-2">
                    * Istirahat Sholat Jumat: 11.00 – 13.00 WIB
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-semibold text-slate-700">Sabtu, Minggu & Libur Nasional:</span>
                    <span className="text-red-500 font-bold">Tutup Layanan Fisik</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold pl-2">
                    * OPAC Digital & E-Journal tetap dapat diakses 24 Jam Nonstop
                  </div>
                </div>
              </div>

              {/* Tata Tertib Pemustaka */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#047857]" />
                  <span>Ketentuan Sirkulasi & Tata Tertib</span>
                </h4>
                <ul className="space-y-1.5 text-slate-600 pl-4 list-disc text-[11px]">
                  <li>Kartu anggota berlaku 4 tahun bagi mahasiswa, dosen, dan pegawai UIM.</li>
                  <li>Peminjaman dan perpanjangan buku wajib membawa kartu KTA Perpustakaan ke loket sirkulasi.</li>
                  <li>Jumlah buku yang dipinjam maksimal <strong>2 buku</strong>.</li>
                  <li>Denda keterlambatan pengembalian buku adalah <strong>Rp 500,- per hari per eksemplar</strong>.</li>
                  <li>Dilarang membawa tas, helm, makanan & minuman ke ruang baca serta menjaga ketenangan.</li>
                </ul>
              </div>

              {/* Lokasi & Kontak */}
              <div className="p-3.5 bg-slate-100/80 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5 text-[#047857]" />
                  <span>Lokasi Gedung Perpustakaan UIM</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Gedung Pusat Perpustakaan UIM Lantai 1 & 2 • Jl. Raya Panglegur KM. 4 Pamekasan, Madura, Jawa Timur.
                </p>
                <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-3">
                  <span>Surel: perpus@uim.ac.id</span>
                  <span>•</span>
                  <span>Hotline: +62 823-3882-9900</span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: FORM TAMBAH PENGUMUMAN (ADMIN) ================= */}
          {activeTab === 'tambah' && isAdmin && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-[#047857]">
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <h4 className="font-bold text-xs sm:text-sm text-slate-800">Buat Pengumuman Baru</h4>
              </div>

              <form onSubmit={handleAddNotifSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Judul Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Jam Layanan Operasional Selama UAS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                      Kategori
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                    >
                      <option value="Layanan">Layanan</option>
                      <option value="Keanggotaan">Keanggotaan</option>
                      <option value="Akademik">Akademik</option>
                      <option value="Repository">Repository</option>
                      <option value="Pengumuman">Pengumuman Umum</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                      Sasaran Penerima
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                    >
                      <option value="all">Semua Sivitas (Publik)</option>
                      <option value="mahasiswa">Khusus Mahasiswa</option>
                      <option value="dosen">Khusus Dosen & Peneliti</option>
                      <option value="admin">Internal Admin Pustakawan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                      Aksen Warna
                    </label>
                    <select
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857]"
                    >
                      <option value="emerald">Hijau (Emerald)</option>
                      <option value="blue">Biru (Blue)</option>
                      <option value="amber">Kuning (Amber)</option>
                      <option value="teal">Toska (Teal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider text-[10px]">
                    Isi Pengumuman <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Tuliskan isi pengumuman atau instruksi bagi pemustaka di sini..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{loading ? 'Menyimpan...' : 'Siarkan Pengumuman'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Footer Modal */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 shrink-0">
          <span>UPT Perpustakaan Universitas Islam Madura • Gedung Pusat Kampus Bettet</span>
        </div>
      </div>
    </div>
  );
}
