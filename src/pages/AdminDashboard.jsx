import React, { useState, useEffect } from 'react';
import {
  getStoredMembers,
  registerStudentMember,
  updateMemberStatus,
  countPendingVerifications
} from '../lib/memberService';
import {
  getStoredBooks,
  addBibliografi,
  updateBibliografi,
  deleteBibliografi
} from '../lib/bookService';
import {
  getStoredLoans,
  createLoan,
  returnLoan,
  renewLoan
} from '../lib/circulationService';
import {
  Menu,
  BookOpen,
  Users,
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
  Database,
  ArrowLeft,
  LogOut,
  Search,
  Check,
  X,
  Edit2,
  Trash2,
  Plus,
  Filter,
  Bookmark,
  Package,
  Calendar,
  ShieldCheck,
  ExternalLink,
  ChevronDown,
  Repeat,
  CheckSquare,
  FileText,
  BarChart2,
  Settings,
  Newspaper,
  Archive,
  Save,
  Download,
  Upload,
  Printer,
  Barcode,
  Tag,
  Palette,
  Key,
  Globe,
  Award,
  RefreshCw,
  Sliders,
  UserCheck,
  Server,
  HardDrive,
  Mail,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  QrCode
} from 'lucide-react';

export default function AdminDashboard({
  currentUser,
  onLogout,
  onSwitchToPublic
}) {
  // Navigasi 9 Modul Utama
  const [activeNavTab, setActiveNavTab] = useState('Beranda');

  // Sub-navigasi per modul
  const [biblioSubTab, setBiblioSubTab] = useState('daftar'); // 'daftar' | 'eksemplar' | 'eksemplarKeluar' | 'salinKatalog' | 'cetakLabel' | 'cetakBarcode' | 'eksporBiblio' | 'plugins'
  const [circSubTab, setCircSubTab] = useState('semua'); // 'semua' | 'dipinjam' | 'kembali' | 'terlambat' | 'reservasi' | 'aturan'
  const [memberSubTab, setMemberSubTab] = useState('semua'); // 'semua' | 'pending' | 'verified' | 'tipe' | 'cetakKartu' | 'ekspor'
  const [authoritySubTab, setAuthoritySubTab] = useState('pengarang'); // 'pengarang' | 'subjek' | 'penerbit' | 'lokasiRak'
  const [inventorySubTab, setInventorySubTab] = useState('fisik'); // 'fisik' | 'hilang' | 'rusak'
  const [systemSubTab, setSystemSubTab] = useState('pengaturan_sistem'); // SLiMS 9 Modul Sistem sub-tabs
  const [reportSubTab, setReportSubTab] = useState('statistik'); // 'statistik' | 'populer' | 'prodi'
  const [serialSubTab, setSerialSubTab] = useState('daftar'); // 'daftar' | 'kardeks'

  // Modals & Panels
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState('blue'); // 'blue' | 'emerald' | 'indigo' | 'slate'

  // State Profil Admin
  const [adminProfile, setAdminProfile] = useState({
    nama: 'Admin Pustakawan UIM',
    email: 'pustakawan@uim.ac.id',
    newPassword: ''
  });

  // State Data Perpustakaan
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);

  // State Bibliografi
  const [selectedBookIds, setSelectedBookIds] = useState(new Set());
  const [searchBookQuery, setSearchBookQuery] = useState('');
  const [searchBookField, setSearchBookField] = useState('Semua Ruas');
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    judul: '',
    penulis: '',
    kategori: 'Ilmu-ilmu Sosial',
    isbn: '',
    salin: 1,
    sinopsis: '',
    cover_url: '',
    isPromoted: true
  });

  // State Sirkulasi
  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [loanNim, setLoanNim] = useState('');
  const [loanBookId, setLoanBookId] = useState('');

  // State Keanggotaan
  const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
  const [searchMemberQuery, setSearchMemberQuery] = useState('');
  const [newMemberData, setNewMemberData] = useState({
    nim: '',
    nama: '',
    prodi: 'Teknik Informatika (Fakultas Teknik)',
    email: '',
    password: 'password123'
  });

  // State Otoritas Terkendali (Daftar Terkendali Bersih Kosong)
  const [authorities, setAuthorities] = useState({
    pengarang: [],
    subjek: [],
    penerbit: [],
    lokasiRak: []
  });
  const [newAuthorityText, setNewAuthorityText] = useState('');

  // State Inventarisasi (Stock Take)
  const [stockTakeBarcode, setStockTakeBarcode] = useState('');
  const [verifiedBarcodes, setVerifiedBarcodes] = useState(new Set());
  const [lostBooks, setLostBooks] = useState([]);
  const [damagedBooks, setDamagedBooks] = useState([]);

  // State Sistem SLiMS 9
  const [systemConfig, setSystemConfig] = useState(() => {
    const saved = localStorage.getItem('slims_system_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      versiSlims: 'SLiMS 9 (Bulian D Ace)',
      namaPerpus: 'Perpustakaan Universitas Islam Madura',
      namaTambahan: 'Digilib',
      logoUrl: '/logo-uim.png',
      faviconUrl: '/favicon.ico',
      bahasaBaku: 'Bahasa Indonesia',
      formatTanggal: 'YYYY-MM-DD',
      koleksiPopulerBeranda: 'Tampilkan',
      koleksiTerbaruBeranda: 'Tampilkan',
      sessionTimeout: 60,
      maxPinjam: 3,
      masaPinjam: 7,
      dendaPerHari: 1000,
      abaikanHariLibur: 'Ya',
      kampus: 'Kampus Hijau Bettet No. 49, Pamekasan, Madura',
      email: 'perpustakaan@uim.ac.id',
      cekIpAdmin: 'Nonaktifkan',
      izinUnduh: 'Hanya Anggota Terdaftar'
    };
  });

  const [uploadedLogoFileName, setUploadedLogoFileName] = useState('');
  const [uploadedFaviconFileName, setUploadedFaviconFileName] = useState('');
  const [systemAlertMessage, setSystemAlertMessage] = useState('');
  const [isSiteRegisterModalOpen, setIsSiteRegisterModalOpen] = useState(false);
  const [siteRegisterInfo, setSiteRegisterInfo] = useState({
    registrationId: 'UIM-SLIMS-9-ACE-8924',
    institution: 'Universitas Islam Madura (Pamekasan)',
    registeredDate: '12 Januari 2024',
    status: 'Terdaftar & Aktif di SLiMS Community',
    serverUrl: 'https://digilib.uim.ac.id'
  });

  // State Plugins SLiMS
  const [pluginsList, setPluginsList] = useState([
    { id: 1, name: 'Notifikasi WhatsApp Gateway SLiMS', desc: 'Kirim pengingat jatuh tempo otomatis dan notifikasi peminjaman ke nomor WA mahasiswa.', version: 'v2.4.1', author: 'Komunitas SLiMS UIM', enabled: true },
    { id: 2, name: 'Database Cloud Auto-Backup', desc: 'Pencadangan database SLiMS harian secara otomatis ke Google Drive / Cloud Storage.', version: 'v1.8.0', author: 'SLiMS Dev Team', enabled: true },
    { id: 3, name: 'Google Scholar & Moraref OAI-PMH Harvester', desc: 'Penyedia metadata interoperabilitas OAI-PMH untuk indeksasi jurnal dan karya ilmiah civitas UIM.', version: 'v3.0.2', author: 'Puslitbang Dikti', enabled: true },
    { id: 4, name: 'Integrasi Gerbang Kiosk & RFID Reader', desc: 'Dukungan pemindai kartu RFID / QR Code KTM pada pintu masuk perpustakaan untuk absensi mandiri.', version: 'v1.5.0', author: 'Laboratorium IT UIM', enabled: true },
    { id: 5, name: 'Excel & MARC 21 Batch Cataloger', desc: 'Impor dan ekspor massal bibliografi dan eksemplar dari Microsoft Excel atau format MARC ISO 2709.', version: 'v2.1.0', author: 'Komunitas SLiMS', enabled: true }
  ]);

  // State Ruas Tambahan (Custom Fields)
  const [customFields, setCustomFields] = useState([
    { id: 1, label: 'Asal Fakultas Mahasiswa', field: 'fakultas_keanggotaan', type: 'Pilihan Teks', target: 'Keanggotaan', required: true },
    { id: 2, label: 'Digital Object Identifier (DOI)', field: 'doi_repository', type: 'URL / Tautan', target: 'Bibliografi', required: false },
    { id: 3, label: 'Dosen Pembimbing Skripsi', field: 'dosen_pembimbing', type: 'Teks Bebas', target: 'Bibliografi', required: false }
  ]);
  const [isCustomFieldModalOpen, setIsCustomFieldModalOpen] = useState(false);
  const [newCustomField, setNewCustomField] = useState({ label: '', field: '', type: 'Teks Bebas', target: 'Bibliografi', required: false });

  // State Setelan Hari Libur
  const [holidayList, setHolidayList] = useState([
    { id: 1, nama: 'Tahun Baru Masehi', start: '2026-01-01', end: '2026-01-01', ket: 'Libur Nasional' },
    { id: 2, nama: 'Hari Raya Idul Fitri 1447 H & Cuti Bersama', start: '2026-03-20', end: '2026-03-25', ket: 'Libur Hari Raya Keagamaan' },
    { id: 3, nama: 'Hari Pendidikan Nasional', start: '2026-05-02', end: '2026-05-02', ket: 'Hari Libur Akademik' },
    { id: 4, nama: 'Hari Kemerdekaan Republik Indonesia Ke-81', start: '2026-08-17', end: '2026-08-17', ket: 'Hari Libur Nasional' },
    { id: 5, nama: 'Milad Universitas Islam Madura (UIM Pamekasan)', start: '2026-10-15', end: '2026-10-16', ket: 'Libur Khusus Dies Natalis Kampus' }
  ]);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ nama: '', start: '', end: '', ket: 'Libur Kampus' });

  // State Konten Statis OPAC
  const [contentList, setContentList] = useState([
    { id: 1, judul: 'Profil & Visi Misi Perpustakaan UIM', slug: 'profil-perpus', tanggal: '2026-01-10', status: 'Terbit' },
    { id: 2, judul: 'Jam Layanan & Operasional Sirkulasi', slug: 'jam-layanan', tanggal: '2026-01-12', status: 'Terbit' },
    { id: 3, judul: 'Tata Tertib, Peminjaman & Sanksi Denda', slug: 'tata-tertib', tanggal: '2026-01-15', status: 'Terbit' },
    { id: 4, judul: 'Fasilitas & BI Corner Kampus Bettet', slug: 'fasilitas-bi-corner', tanggal: '2026-02-01', status: 'Terbit' },
    { id: 5, judul: 'Alur Surat Bebas Pustaka Calon Wisudawan', slug: 'bebas-pustaka', tanggal: '2026-02-20', status: 'Terbit' }
  ]);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [newContent, setNewContent] = useState({ judul: '', slug: '', isi: '' });

  // State Log Aktivitas Sistem (Audit Trail)
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, waktu: '2026-11-07 10:32:15', user: 'admin', modul: 'Sistem', aksi: 'Menyimpan preferensi aplikasi global SLiMS 9', ip: '192.168.1.10' },
    { id: 2, waktu: '2026-11-07 10:28:44', user: 'admin', modul: 'Keanggotaan', aksi: 'Verifikasi status pendaftaran KTM mahasiswa', ip: '192.168.1.10' },
    { id: 3, waktu: '2026-11-07 10:15:02', user: 'nurul', modul: 'Sirkulasi', aksi: 'Pencatatan peminjaman buku sirkulasi', ip: '192.168.1.24' },
    { id: 4, waktu: '2026-11-07 09:40:19', user: 'syaiful', modul: 'Bibliografi', aksi: 'Pembaruan metadata bibliografi koleksi baru', ip: '192.168.1.12' },
    { id: 5, waktu: '2026-11-07 08:00:03', user: 'admin', modul: 'Autentikasi', aksi: 'Login admin pustakawan berhasil', ip: '192.168.1.10' }
  ]);

  // State Staf Petugas Sistem SLiMS
  const [staffList, setStaffList] = useState([
    { id: 1, nama: 'Admin Pustakawan', username: 'admin', email: 'pustakawan@uim.ac.id', role: 'Super Administrator', status: 'Aktif' },
    { id: 2, nama: 'Achmad Syaiful, S.I.Pust.', username: 'syaiful', email: 'syaiful@uim.ac.id', role: 'Kepala Perpustakaan', status: 'Aktif' },
    { id: 3, nama: 'Nurul Hidayati, S.Kom.', username: 'nurul', email: 'nurul@uim.ac.id', role: 'Pustakawan Sirkulasi', status: 'Aktif' },
    { id: 4, nama: 'Ahmad Fauzi, A.Md.', username: 'fauzi', email: 'fauzi@uim.ac.id', role: 'Pustakawan Kataloger', status: 'Aktif' }
  ]);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ nama: '', username: '', email: '', role: 'Pustakawan Sirkulasi', password: 'password123' });

  // State Re-Indexing Biblio
  const [reindexStatus, setReindexStatus] = useState(null); // null | 'indexing' | 'done'
  const [reindexPercent, setReindexPercent] = useState(0);

  // State Test Integrasi UCS & Email
  const [testUcsStatus, setTestUcsStatus] = useState(null);
  const [testEmailStatus, setTestEmailStatus] = useState(null);

  // State Barcode Generator
  const [barcodeTestValue, setBarcodeTestValue] = useState('UIM-B-000492');
  const [barcodeTestFormat, setBarcodeTestFormat] = useState('Code 128');

  // State Terbitan Berseri
  const [serials, setSerials] = useState([
    { id: 1, judul: 'Jurnal Inovasi Sains dan Teknologi UIM', issn: '2548-8921', frekuensi: 'Semesteran', volume: 'Vol. 8 No. 2' },
    { id: 2, judul: 'Jurnal Studi Keislaman dan Hukum Madura', issn: '2301-4456', frekuensi: 'Semesteran', volume: 'Vol. 12 No. 1' }
  ]);
  const [isSerialFormOpen, setIsSerialFormOpen] = useState(false);
  const [newSerialData, setNewSerialData] = useState({
    judul: '',
    issn: '',
    frekuensi: 'Semesteran',
    volume: 'Vol. 1 No. 1'
  });

  const loadAllData = () => {
    setBooks(getStoredBooks());
    setMembers(getStoredMembers());
    setLoans(getStoredLoans());
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Theme color styling
  const themeColors = {
    blue: {
      sidebarBg: 'bg-[#0284c7]',
      headerBg: 'bg-[#0369a1]',
      activePill: 'bg-white text-[#0369a1]',
      primaryBtn: 'bg-[#0284c7] hover:bg-[#0369a1]'
    },
    emerald: {
      sidebarBg: 'bg-[#047857]',
      headerBg: 'bg-[#064e3b]',
      activePill: 'bg-white text-[#047857]',
      primaryBtn: 'bg-[#047857] hover:bg-[#064e3b]'
    },
    indigo: {
      sidebarBg: 'bg-[#4338ca]',
      headerBg: 'bg-[#3730a3]',
      activePill: 'bg-white text-[#4338ca]',
      primaryBtn: 'bg-[#4338ca] hover:bg-[#3730a3]'
    },
    slate: {
      sidebarBg: 'bg-[#334155]',
      headerBg: 'bg-[#1e293b]',
      activePill: 'bg-white text-[#1e293b]',
      primaryBtn: 'bg-[#334155] hover:bg-[#1e293b]'
    }
  }[adminTheme];

  // Helper Downloads / Exports
  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Bibliografi Handlers
  const handleBookFormSubmit = (e) => {
    e.preventDefault();
    if (!bookFormData.judul.trim() || !bookFormData.penulis.trim()) {
      alert('Judul dan Pengarang wajib diisi.');
      return;
    }
    if (editingBook) {
      updateBibliografi(editingBook.id, bookFormData);
    } else {
      addBibliografi(bookFormData);
    }
    loadAllData();
    setIsBookFormOpen(false);
    setEditingBook(null);
  };

  const handleDeleteSelectedBooks = () => {
    if (selectedBookIds.size === 0) {
      alert('Pilih data bibliografi yang ingin dihapus.');
      return;
    }
    if (confirm(`Yakin ingin menghapus ${selectedBookIds.size} data terpilih?`)) {
      deleteBibliografi(Array.from(selectedBookIds));
      setSelectedBookIds(new Set());
      loadAllData();
    }
  };

  // Sirkulasi Handlers
  const handleCreateLoanSubmit = (e) => {
    e.preventDefault();
    const member = members.find((m) => m.nim === loanNim.trim());
    if (!member) {
      alert('Mahasiswa dengan NIM tersebut belum terdaftar.');
      return;
    }
    if (member.status !== 'verified') {
      alert('Akun mahasiswa belum diverifikasi oleh admin.');
      return;
    }
    const book = books.find((b) => String(b.id) === String(loanBookId));
    if (!book) {
      alert('Pilih buku yang valid.');
      return;
    }
    createLoan({
      nim: member.nim,
      nama: member.nama,
      bookId: book.id,
      judul: book.judul,
      cover_url: book.cover_url
    });
    loadAllData();
    setIsLoanFormOpen(false);
    setLoanNim('');
    setLoanBookId('');
    alert('Transaksi peminjaman buku berhasil dicatat!');
  };

  const handleReturnBook = (loanId) => {
    const res = returnLoan(loanId);
    loadAllData();
    if (res.denda > 0) {
      alert(`Buku berhasil dikembalikan dengan denda keterlambatan: Rp ${res.denda.toLocaleString('id-ID')}`);
    } else {
      alert('Buku berhasil dikembalikan tepat waktu!');
    }
  };

  const handleRenewBook = (loanId) => {
    renewLoan(loanId);
    loadAllData();
    alert('Masa pinjam berhasil diperpanjang (+7 Hari)!');
  };

  // Keanggotaan Handlers
  const handleVerifyMember = (id, status) => {
    updateMemberStatus(id, status);
    loadAllData();
  };

  const handleAddMemberSubmit = (e) => {
    e.preventDefault();
    try {
      const created = registerStudentMember(newMemberData);
      updateMemberStatus(created.id, 'verified');
      loadAllData();
      setIsMemberFormOpen(false);
      setNewMemberData({
        nim: '',
        nama: '',
        prodi: 'Teknik Informatika (Fakultas Teknik)',
        email: '',
        password: 'password123'
      });
      alert('Anggota baru berhasil ditambahkan dan langsung aktif!');
    } catch (err) {
      alert(err.message);
    }
  };

  // SLiMS 9 Sistem Handlers
  const handleSaveSystemSettings = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('slims_system_config', JSON.stringify(systemConfig));
    setSystemAlertMessage('Preferensi aplikasi global dan pengaturan sistem SLiMS berhasil disimpan!');
    setTimeout(() => setSystemAlertMessage(''), 4000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Ukuran berkas melebihi batas maksimum 500 KB.');
      return;
    }
    setUploadedLogoFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSystemConfig((prev) => ({ ...prev, logoUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024) {
      alert('Ukuran berkas melebihi batas maksimum 100 KB.');
      return;
    }
    setUploadedFaviconFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setSystemConfig((prev) => ({ ...prev, faviconUrl: event.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleTogglePlugin = (id) => {
    setPluginsList((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleAddCustomField = (e) => {
    e.preventDefault();
    if (!newCustomField.label || !newCustomField.field) {
      alert('Nama dan kode ruas wajib diisi.');
      return;
    }
    setCustomFields((prev) => [
      ...prev,
      { ...newCustomField, id: Date.now() }
    ]);
    setNewCustomField({ label: '', field: '', type: 'Teks Bebas', target: 'Bibliografi', required: false });
    setIsCustomFieldModalOpen(false);
  };

  const handleDeleteCustomField = (id) => {
    if (confirm('Hapus ruas tambahan ini?')) {
      setCustomFields((prev) => prev.filter((f) => f.id !== id));
    }
  };

  const handleAddHoliday = (e) => {
    e.preventDefault();
    if (!newHoliday.nama || !newHoliday.start) {
      alert('Nama hari libur dan tanggal mulai wajib diisi.');
      return;
    }
    setHolidayList((prev) => [
      ...prev,
      { ...newHoliday, end: newHoliday.end || newHoliday.start, id: Date.now() }
    ]);
    setNewHoliday({ nama: '', start: '', end: '', ket: 'Libur Kampus' });
    setIsHolidayModalOpen(false);
  };

  const handleDeleteHoliday = (id) => {
    if (confirm('Hapus hari libur ini?')) {
      setHolidayList((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const handleAddStaffSubmit = (e) => {
    e.preventDefault();
    if (!newStaff.nama || !newStaff.username) {
      alert('Nama dan username petugas wajib diisi.');
      return;
    }
    setStaffList((prev) => [
      ...prev,
      { ...newStaff, id: Date.now(), status: 'Aktif' }
    ]);
    setNewStaff({ nama: '', username: '', email: '', role: 'Pustakawan Sirkulasi', password: 'password123' });
    setIsStaffModalOpen(false);
    alert('Petugas baru berhasil ditambahkan!');
  };

  const handleDeleteStaff = (id) => {
    if (confirm('Hapus akun staf pustakawan ini?')) {
      setStaffList((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleToggleStaffStatus = (id) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: s.status === 'Aktif' ? 'Nonaktif' : 'Aktif' } : s))
    );
  };

  const handleAddContentSubmit = (e) => {
    e.preventDefault();
    if (!newContent.judul || !newContent.slug) {
      alert('Judul dan slug artikel wajib diisi.');
      return;
    }
    setContentList((prev) => [
      ...prev,
      {
        id: Date.now(),
        judul: newContent.judul,
        slug: newContent.slug.startsWith('/') ? newContent.slug : `/${newContent.slug}`,
        tanggal: new Date().toISOString().split('T')[0],
        status: 'Terbit'
      }
    ]);
    setNewContent({ judul: '', slug: '', isi: '' });
    setIsContentModalOpen(false);
    alert('Konten halaman OPAC berhasil diterbitkan!');
  };

  const handleDeleteContent = (id) => {
    if (confirm('Hapus halaman informasi ini?')) {
      setContentList((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleStartReindex = () => {
    setReindexStatus('indexing');
    setReindexPercent(15);
    setTimeout(() => setReindexPercent(50), 300);
    setTimeout(() => setReindexPercent(85), 650);
    setTimeout(() => {
      setReindexPercent(100);
      setReindexStatus('done');
    }, 1000);
  };

  const handleTestUcs = () => {
    setTestUcsStatus('loading');
    setTimeout(() => {
      setTestUcsStatus('success');
      setTimeout(() => setTestUcsStatus(null), 5000);
    }, 800);
  };

  const handleTestEmail = () => {
    setTestEmailStatus('loading');
    setTimeout(() => {
      setTestEmailStatus('success');
      setTimeout(() => setTestEmailStatus(null), 5000);
    }, 800);
  };

  const handleClearLogs = () => {
    if (confirm('Yakin ingin membersihkan riwayat log aktivitas sistem?')) {
      setSystemLogs([]);
    }
  };

  // Hitungan Ringkasan
  const pendingCount = members.filter((m) => m.status === 'pending').length;
  const activeLoans = loans.filter((l) => l.status === 'dipinjam');
  const overdueLoans = activeLoans.filter((l) => new Date() > new Date(l.tanggalJatuhTempo));
  const totalCollections = books.length;
  const totalCopies = books.reduce((sum, b) => sum + (Number(b.salin) || 1), 0);
  const totalBorrowed = activeLoans.length;
  const totalAvailable = Math.max(0, totalCopies - totalBorrowed);

  // Helper Nama Sub-Tab Aktif
  const getCurrentSubTabName = () => {
    switch (activeNavTab) {
      case 'Beranda':
        return 'Ringkasan & Pemintas';
      case 'Bibliografi':
        return {
          daftar: 'Daftar Bibliografi',
          eksemplar: 'Daftar Eksemplar',
          eksemplarKeluar: 'Eksemplar Keluar',
          salinKatalog: 'Layanan MARC SRU',
          cetakLabel: 'Pencetakan Label',
          cetakBarcode: 'Cetak Barcode',
          plugins: 'Penghitung Dibaca'
        }[biblioSubTab] || 'Katalog';
      case 'Sirkulasi':
        return {
          semua: 'Semua Transaksi',
          dipinjam: 'Sedang Dipinjam',
          kembali: 'Riwayat Pengembalian',
          terlambat: 'Keterlambatan',
          reservasi: 'Reservasi',
          aturan: 'Aturan Sirkulasi'
        }[circSubTab] || 'Sirkulasi';
      case 'Keanggotaan':
        return {
          semua: 'Daftar Anggota',
          pending: 'Verifikasi KTM',
          verified: 'Terverifikasi',
          tipe: 'Tipe Keanggotaan',
          cetakKartu: 'Cetak Kartu'
        }[memberSubTab] || 'Keanggotaan';
      case 'Daftar Terkendali':
        return {
          pengarang: 'Pengarang',
          subjek: 'Topik & Subjek',
          penerbit: 'Penerbit',
          lokasiRak: 'Lokasi Rak'
        }[authoritySubTab] || 'Otoritas';
      case 'Inventarisasi':
        return {
          fisik: 'Pemeriksaan Fisik',
          hilang: 'Laporan Hilang',
          rusak: 'Laporan Rusak'
        }[inventorySubTab] || 'Stock Take';
      case 'Sistem':
        return {
          pengaturan_sistem: 'Pengaturan Sistem',
          lingkungan_sistem: 'Lingkungan Sistem',
          setelan_lingkungan: 'Setelan Lingkungan',
          pengaturan_ucs: 'Pengaturan UCS',
          tema: 'Tema',
          plugin: 'Plugin',
          ruas_tambahan: 'Ruas Tambahan',
          pengaturan_mata_uang: 'Pengaturan mata uang',
          pengaturan_surel: 'Pengaturan Surel',
          pengaturan_captcha: 'Pengaturan Captcha',
          konten: 'Konten',
          indeks_biblio: 'Indeks Biblio',
          modul: 'Modul',
          kelompok_pengguna: 'Kelompok Pengguna',
          pustakawan: 'Pustakawan',
          image_maintenance: 'Image Maintenance',
          pengaturan_pemintas: 'Pengaturan Pemintas',
          setelan_hari_libur: 'Setelan Hari Libur',
          pembuat_barkod: 'Pembuat Barkod',
          catatan_sistem: 'Catatan Sistem'
        }[systemSubTab] || 'Pengaturan';
      case 'Pelaporan':
        return {
          statistik: 'Statistik Sirkulasi',
          populer: 'Buku Terpopuler',
          prodi: 'Rekapitulasi Prodi'
        }[reportSubTab] || 'Laporan';
      case 'Kendali Terbitan Berseri':
        return {
          daftar: 'Daftar Terbitan',
          kardeks: 'Kardeks & Langganan'
        }[serialSubTab] || 'Serial';
      default:
        return 'Menu';
    }
  };

  // Render Konten Submenu Sidebar (Bisa untuk Desktop maupun Mobile Drawer)
  const renderSidebarContent = (isMobile = false) => {
    const handleSubClick = (action) => {
      if (action) action();
      if (isMobile) setIsMobileSidebarOpen(false);
    };

    return (
      <>
        {/* 1. SIDEBAR BERANDA */}
        {activeNavTab === 'Beranda' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sky-200 uppercase px-2 py-1 tracking-wider">Pemintas</div>
            <button
              onClick={() => handleSubClick(() => setIsProfileModalOpen(true))}
              className="w-full text-left px-3 py-2 rounded-lg font-bold bg-white text-[#0284c7] shadow-xs flex items-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Ubah Profil Pengguna</span>
            </button>
            <button
              onClick={() => handleSubClick(() => {
                setActiveNavTab('Keanggotaan');
                setMemberSubTab('pending');
              })}
              className="w-full text-left px-3 py-2 hover:bg-white/15 rounded-lg text-white flex items-center justify-between"
            >
              <span>Verifikasi KTM</span>
              {pendingCount > 0 && <span className="bg-amber-400 text-slate-950 font-bold px-1.5 rounded-full text-[10px]">{pendingCount}</span>}
            </button>
            <button
              onClick={() => handleSubClick(() => setIsShortcutsModalOpen(true))}
              className="w-full text-left px-3 py-2 hover:bg-white/15 rounded-lg text-white flex items-center gap-2"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pengaturan Pemintas</span>
            </button>
            <button
              onClick={() => handleSubClick(() => setIsThemeModalOpen(true))}
              className="w-full text-left px-3 py-2 hover:bg-white/15 rounded-lg text-white flex items-center gap-2"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Tema Tampilan</span>
            </button>
          </div>
        )}

        {/* 2. SIDEBAR BIBLIOGRAFI */}
        {activeNavTab === 'Bibliografi' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSubClick(() => {
                setEditingBook(null);
                setIsBookFormOpen(true);
              })}
              className="w-full py-2.5 px-3 bg-black/25 hover:bg-black/35 text-white font-bold rounded-lg text-left flex items-center gap-2 shadow border border-white/20"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tambah Bibliografi Baru</span>
            </button>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Eksemplar</div>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('daftar'))}
                className={`w-full text-left px-2.5 py-1.5 rounded ${biblioSubTab === 'daftar' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                Daftar Bibliografi
              </button>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('eksemplar'))}
                className={`w-full text-left px-2.5 py-1.5 rounded ${biblioSubTab === 'eksemplar' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                Daftar Eksemplar ({totalCopies})
              </button>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('eksemplarKeluar'))}
                className={`w-full text-left px-2.5 py-1.5 rounded ${biblioSubTab === 'eksemplarKeluar' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                Daftar Eksemplar Keluar ({totalBorrowed})
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Salin Katalog</div>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('salinKatalog'))}
                className={`w-full text-left px-2.5 py-1.5 rounded ${biblioSubTab === 'salinKatalog' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                Layanan MARC SRU & Z3950
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Peralatan</div>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('cetakLabel'))}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-1.5 ${biblioSubTab === 'cetakLabel' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Pencetakan Label Punggung</span>
              </button>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('cetakBarcode'))}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-1.5 ${biblioSubTab === 'cetakBarcode' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>Cetak Barcode Eksemplar</span>
              </button>
              <button
                onClick={() => handleSubClick(() => downloadJSON(books, 'katalog_bibliografi_uim.json'))}
                className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/15 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Data Bibliografi</span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Plugins</div>
              <button
                onClick={() => handleSubClick(() => setBiblioSubTab('plugins'))}
                className={`w-full text-left px-2.5 py-1.5 rounded ${biblioSubTab === 'plugins' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}
              >
                Penghitung Koleksi Dibaca
              </button>
            </div>
          </div>
        )}

        {/* 3. SIDEBAR SIRKULASI */}
        {activeNavTab === 'Sirkulasi' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSubClick(() => setIsLoanFormOpen(true))}
              className="w-full py-2.5 px-3 bg-black/25 hover:bg-black/35 text-white font-bold rounded-lg text-left flex items-center gap-2 shadow border border-white/20"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Mulai Peminjaman Baru</span>
            </button>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Transaksi</div>
              <button onClick={() => handleSubClick(() => setCircSubTab('semua'))} className={`w-full text-left px-2.5 py-1.5 rounded ${circSubTab === 'semua' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Semua Transaksi</button>
              <button onClick={() => handleSubClick(() => setCircSubTab('dipinjam'))} className={`w-full text-left px-2.5 py-1.5 rounded ${circSubTab === 'dipinjam' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Sedang Dipinjam ({totalBorrowed})</button>
              <button onClick={() => handleSubClick(() => setCircSubTab('kembali'))} className={`w-full text-left px-2.5 py-1.5 rounded ${circSubTab === 'kembali' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Riwayat Pengembalian</button>
              <button onClick={() => handleSubClick(() => setCircSubTab('terlambat'))} className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${circSubTab === 'terlambat' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>
                <span>Daftar Keterlambatan</span>
                {overdueLoans.length > 0 && <span className="bg-red-500 text-white font-bold px-1.5 rounded-full text-[10px]">{overdueLoans.length}</span>}
              </button>
              <button onClick={() => handleSubClick(() => setCircSubTab('reservasi'))} className={`w-full text-left px-2.5 py-1.5 rounded ${circSubTab === 'reservasi' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Reservasi Koleksi</button>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Aturan Sirkulasi</div>
              <button onClick={() => handleSubClick(() => setCircSubTab('aturan'))} className={`w-full text-left px-2.5 py-1.5 rounded ${circSubTab === 'aturan' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Aturan & Tarif Denda</button>
            </div>
          </div>
        )}

        {/* 4. SIDEBAR KEANGGOTAAN */}
        {activeNavTab === 'Keanggotaan' && (
          <div className="space-y-3">
            <button
              onClick={() => handleSubClick(() => setIsMemberFormOpen(true))}
              className="w-full py-2.5 px-3 bg-black/25 hover:bg-black/35 text-white font-bold rounded-lg text-left flex items-center gap-2 shadow border border-white/20"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tambah Anggota Manual</span>
            </button>
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Keanggotaan</div>
              <button onClick={() => handleSubClick(() => setMemberSubTab('semua'))} className={`w-full text-left px-2.5 py-1.5 rounded ${memberSubTab === 'semua' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Daftar Anggota</button>
              <button onClick={() => handleSubClick(() => setMemberSubTab('pending'))} className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between ${memberSubTab === 'pending' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>
                <span>Verifikasi KTM</span>
                {pendingCount > 0 && <span className="bg-amber-400 text-slate-950 font-bold px-1.5 rounded-full text-[10px]">{pendingCount}</span>}
              </button>
              <button onClick={() => handleSubClick(() => setMemberSubTab('verified'))} className={`w-full text-left px-2.5 py-1.5 rounded ${memberSubTab === 'verified' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Anggota Terverifikasi</button>
              <button onClick={() => handleSubClick(() => setMemberSubTab('tipe'))} className={`w-full text-left px-2.5 py-1.5 rounded ${memberSubTab === 'tipe' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Tipe Keanggotaan</button>
              <button onClick={() => handleSubClick(() => setMemberSubTab('cetakKartu'))} className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-1.5 ${memberSubTab === 'cetakKartu' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Kartu Anggota Digital</span>
              </button>
              <button onClick={() => handleSubClick(() => downloadJSON(members, 'anggota_perpustakaan_uim.json'))} className="w-full text-left px-2.5 py-1.5 rounded hover:bg-white/15 flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>Ekspor Data Anggota</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. SIDEBAR DAFTAR TERKENDALI */}
        {activeNavTab === 'Daftar Terkendali' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Otoritas SLiMS</div>
            <button onClick={() => handleSubClick(() => setAuthoritySubTab('pengarang'))} className={`w-full text-left px-2.5 py-2 rounded ${authoritySubTab === 'pengarang' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Pengarang (Author)</button>
            <button onClick={() => handleSubClick(() => setAuthoritySubTab('subjek'))} className={`w-full text-left px-2.5 py-2 rounded ${authoritySubTab === 'subjek' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Topik & Subjek</button>
            <button onClick={() => handleSubClick(() => setAuthoritySubTab('penerbit'))} className={`w-full text-left px-2.5 py-2 rounded ${authoritySubTab === 'penerbit' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Penerbit</button>
            <button onClick={() => handleSubClick(() => setAuthoritySubTab('lokasiRak'))} className={`w-full text-left px-2.5 py-2 rounded ${authoritySubTab === 'lokasiRak' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Lokasi Rak Buku</button>
          </div>
        )}

        {/* 6. SIDEBAR INVENTARISASI */}
        {activeNavTab === 'Inventarisasi' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Stock Take</div>
            <button onClick={() => handleSubClick(() => setInventorySubTab('fisik'))} className={`w-full text-left px-2.5 py-2 rounded ${inventorySubTab === 'fisik' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Pemeriksaan Fisik Koleksi</button>
            <button onClick={() => handleSubClick(() => setInventorySubTab('hilang'))} className={`w-full text-left px-2.5 py-2 rounded ${inventorySubTab === 'hilang' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Laporan Koleksi Hilang ({lostBooks.length})</button>
            <button onClick={() => handleSubClick(() => setInventorySubTab('rusak'))} className={`w-full text-left px-2.5 py-2 rounded ${inventorySubTab === 'rusak' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Laporan Koleksi Rusak ({damagedBooks.length})</button>
          </div>
        )}

        {/* 7. SIDEBAR SISTEM */}
        {activeNavTab === 'Sistem' && (
          <div className="space-y-0.5">
            <div className="text-[10px] font-bold text-sky-100 uppercase px-2.5 py-1 tracking-wider">
              PENGATURAN SISTEM
            </div>
            {[
              { id: 'pengaturan_sistem', label: 'Pengaturan Sistem' },
              { id: 'lingkungan_sistem', label: 'Lingkungan Sistem' },
              { id: 'setelan_lingkungan', label: 'Setelan Lingkungan Sistem' },
              { id: 'pengaturan_ucs', label: 'Pengaturan UCS' },
              { id: 'tema', label: 'Tema' },
              { id: 'plugin', label: 'Plugin' },
              { id: 'ruas_tambahan', label: 'Ruas Tambahan' },
              { id: 'pengaturan_mata_uang', label: 'Pengaturan mata uang' },
              { id: 'pengaturan_surel', label: 'Pengaturan Surel' },
              { id: 'pengaturan_captcha', label: 'Pengaturan Captcha' },
              { id: 'konten', label: 'Konten' },
              { id: 'indeks_biblio', label: 'Indeks Biblio' },
              { id: 'modul', label: 'Modul' },
              { id: 'kelompok_pengguna', label: 'Kelompok Pengguna' },
              { id: 'pustakawan', label: 'Pustakawan & Pengguna Sistem' },
              { id: 'image_maintenance', label: 'Image Maintenance' },
              { id: 'pengaturan_pemintas', label: 'Pengaturan Pemintas' },
              { id: 'setelan_hari_libur', label: 'Setelan Hari Libur' },
              { id: 'pembuat_barkod', label: 'Pembuat Barkod' },
              { id: 'catatan_sistem', label: 'Catatan Sistem' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleSubClick(() => setSystemSubTab(item.id))}
                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors truncate block ${
                  systemSubTab === item.id
                    ? 'bg-white text-[#0284c7] font-bold shadow-xs'
                    : 'text-white/90 hover:bg-white/10 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {/* 8. SIDEBAR PELAPORAN */}
        {activeNavTab === 'Pelaporan' && (
          <div className="space-y-1">
            <div className="text-[10px] font-bold text-sky-200 uppercase px-2 tracking-wider">Statistik & Rekap</div>
            <button onClick={() => handleSubClick(() => setReportSubTab('statistik'))} className={`w-full text-left px-2.5 py-2 rounded ${reportSubTab === 'statistik' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Statistik Sirkulasi</button>
            <button onClick={() => handleSubClick(() => setReportSubTab('populer'))} className={`w-full text-left px-2.5 py-2 rounded ${reportSubTab === 'populer' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Buku Terpopuler</button>
            <button onClick={() => handleSubClick(() => setReportSubTab('prodi'))} className={`w-full text-left px-2.5 py-2 rounded ${reportSubTab === 'prodi' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Rekapitulasi per Prodi</button>
          </div>
        )}

        {/* 9. SIDEBAR TERBITAN BERSERI */}
        {activeNavTab === 'Kendali Terbitan Berseri' && (
          <div className="space-y-2">
            <button
              onClick={() => handleSubClick(() => setIsSerialFormOpen(true))}
              className="w-full py-2.5 px-3 bg-black/25 hover:bg-black/35 text-white font-bold rounded-lg text-left flex items-center gap-2 shadow border border-white/20"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              <span>Tambah Terbitan Berseri</span>
            </button>
            <button onClick={() => handleSubClick(() => setSerialSubTab('daftar'))} className={`w-full text-left px-2.5 py-2 rounded ${serialSubTab === 'daftar' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Daftar Terbitan Berseri</button>
            <button onClick={() => handleSubClick(() => setSerialSubTab('kardeks'))} className={`w-full text-left px-2.5 py-2 rounded ${serialSubTab === 'kardeks' ? 'bg-white/25 font-bold' : 'hover:bg-white/15'}`}>Kardeks & Langganan</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-800 flex flex-col font-sans">
      {/* ================= 1. TOP NAVBAR SLiMS MODUL ================= */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between px-3 sm:px-6">
          <div className="flex items-center gap-1 sm:gap-2 overflow-hidden flex-1">
            {/* Tombol Hamburger Drawer Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-700 hover:text-[#0284c7] hover:bg-slate-100 rounded-lg shrink-0 transition-colors"
              title="Buka Navigasi SLiMS"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Bilah Navigasi Modul (Dukungan Scroll Horizontal Mulus di Mobile) */}
            <nav className="flex items-center space-x-1 sm:space-x-3 overflow-x-auto py-2.5 sm:py-3 text-xs sm:text-[13px] font-medium text-slate-700 scrollbar-none flex-1">
              {[
                'Beranda',
                'Bibliografi',
                'Sirkulasi',
                'Keanggotaan',
                'Daftar Terkendali',
                'Inventarisasi',
                'Sistem',
                'Pelaporan',
                'Kendali Terbitan Berseri'
              ].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveNavTab(tab);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`py-1 px-2.5 rounded transition-colors whitespace-nowrap shrink-0 ${
                    activeNavTab === tab
                      ? 'font-bold text-[#0284c7] border-b-2 border-[#0284c7] -mb-2.5 sm:-mb-3 pb-2.5'
                      : 'hover:text-[#0284c7]'
                  }`}
                >
                  {tab}
                  {tab === 'Keanggotaan' && pendingCount > 0 && (
                    <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {pendingCount}
                    </span>
                  )}
                  {tab === 'Sirkulasi' && totalBorrowed > 0 && (
                    <span className="ml-1.5 bg-[#0284c7] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {totalBorrowed}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={onLogout}
                className="py-1 px-2.5 text-red-600 hover:text-red-700 font-semibold transition-colors whitespace-nowrap shrink-0"
              >
                Keluar
              </button>
            </nav>
          </div>

          <div className="flex items-center pl-2 sm:pl-4 border-l border-slate-200 shrink-0">
            <button
              onClick={onSwitchToPublic}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white text-[11px] sm:text-xs font-bold rounded-lg transition-colors shadow-xs"
              title="Pratinjau Portal Publik (OPAC)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Portal OPAC</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= 2. BODY CONTAINER (SIDEBAR + CONTENT) ================= */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Backdrop Gelap Khusus Mobile Saat Drawer Terbuka */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-fadeIn"
          />
        )}

        {/* Sidebar Versi Mobile (Off-Canvas Drawer) */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 sm:w-80 ${themeColors.sidebarBg} text-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Header Profil Drawer */}
          <div className={`p-4 ${themeColors.headerBg} flex items-center justify-between border-b border-white/20`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
                <svg className="w-6 h-6 fill-slate-400" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
              <div className="leading-tight">
                <h4 className="text-sm font-bold text-white tracking-wide">Admin</h4>
                <p className="text-xs text-sky-100 font-medium">Pustakawan UIM</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              title="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pemilih Modul Cepat di Mobile */}
          <div className="p-3 border-b border-white/15 bg-black/10">
            <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block mb-1">
              Modul SLiMS Aktif
            </span>
            <select
              value={activeNavTab}
              onChange={(e) => {
                setActiveNavTab(e.target.value);
              }}
              className="w-full bg-white/20 text-white font-semibold text-xs rounded px-2.5 py-2 border border-white/30 focus:outline-none"
            >
              {[
                'Beranda',
                'Bibliografi',
                'Sirkulasi',
                'Keanggotaan',
                'Daftar Terkendali',
                'Inventarisasi',
                'Sistem',
                'Pelaporan',
                'Kendali Terbitan Berseri'
              ].map((tab) => (
                <option key={tab} value={tab} className="text-slate-800">
                  {tab}
                </option>
              ))}
            </select>
          </div>

          {/* Sub-menu Sidebar */}
          <div className="flex-1 p-3 space-y-3 text-xs overflow-y-auto">
            {renderSidebarContent(true)}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 border-t border-white/15 space-y-2">
            <button
              onClick={() => {
                setIsMobileSidebarOpen(false);
                onSwitchToPublic();
              }}
              className="w-full py-2 px-3 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Portal Publik (OPAC)</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </aside>

        {/* Sidebar Versi Desktop (Tetap Berdiri di Samping Layar) */}
        <aside className={`hidden md:flex w-56 sm:w-60 ${themeColors.sidebarBg} flex-col shrink-0 text-white min-h-[calc(100vh-50px)] transition-colors`}>
          {/* Header Profil Pustakawan */}
          <div className={`p-3.5 ${themeColors.headerBg} flex items-center gap-3 border-b border-white/20`}>
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-xs">
              <svg className="w-6 h-6 fill-slate-400" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="leading-tight">
              <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">Admin</h4>
              <p className="text-xs text-sky-100 font-medium">Pustakawan</p>
            </div>
          </div>

          {/* Sub-menu Sidebar Desktop */}
          <div className="flex-1 p-3 space-y-3 text-xs overflow-y-auto">
            {renderSidebarContent(false)}
          </div>
        </aside>
        {/* ================= KONTEN UTAMA SETIAP MODUL ================= */}
        <main className="flex-1 p-3.5 sm:p-7 overflow-y-auto bg-white min-w-0">
          {/* Bilah Modul & Sub-Menu Cepat di Mobile */}
          <div className="md:hidden mb-4 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">Modul:</span>
              <span className="font-bold text-slate-800 truncate">{activeNavTab}</span>
              <span className="text-slate-300">/</span>
              <span className="font-medium text-sky-600 truncate">{getCurrentSubTabName()}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="px-2.5 py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-md border border-sky-200 shrink-0 flex items-center gap-1 transition-colors"
            >
              <Menu className="w-3.5 h-3.5" />
              <span>Menu</span>
            </button>
          </div>

          {/* ================= 1. MODUL BERANDA ================= */}
          {activeNavTab === 'Beranda' && (
            <div className="space-y-4 sm:space-y-6 max-w-6xl">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">Administrasi Perpustakaan</h1>

              <div className="bg-[#e0f2fe] border border-[#bae6fd] rounded-lg p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-[13px] text-slate-700">
                <span>Cadangan basis data sistem perpustakaan dapat dibuat secara berkala.</span>
                <button
                  onClick={() => downloadJSON({ books, members, loans, config: systemConfig }, 'backup_uim_digilib.json')}
                  className="w-full sm:w-auto px-4 py-1.5 bg-[#0284c7] text-white font-bold rounded text-xs hover:bg-[#0369a1] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cadangkan Sekarang</span>
                </button>
              </div>

              <div className="bg-[#fef3c7] border border-[#fde68a] rounded-lg p-3 sm:p-3.5 text-xs text-slate-800">
                {pendingCount > 0 ? (
                  <span>Terdapat <strong className="font-bold text-red-600">{pendingCount}</strong> pendaftaran anggota baru (KTM) yang menunggu verifikasi Anda di modul <strong className="font-bold">Keanggotaan</strong>.</span>
                ) : (
                  <span>Sistem Administrasi Perpustakaan siap digunakan. {totalBorrowed > 0 ? `Saat ini ada ${totalBorrowed} buku sedang dipinjam.` : 'Belum ada transaksi keterlambatan.'}</span>
                )}
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="bg-white rounded-lg p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Bookmark className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.5]" /></div>
                  <div className="min-w-0 flex-1"><span className="text-base sm:text-2xl font-bold text-slate-800 block truncate">{totalCollections}</span><span className="text-[11px] sm:text-xs text-slate-500 font-medium block truncate">Total Koleksi</span></div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Layers className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.5]" /></div>
                  <div className="min-w-0 flex-1"><span className="text-base sm:text-2xl font-bold text-slate-800 block truncate">{totalCopies}</span><span className="text-[11px] sm:text-xs text-slate-500 font-medium block truncate">Total Eksemplar</span></div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><Package className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.5]" /></div>
                  <div className="min-w-0 flex-1"><span className="text-base sm:text-2xl font-bold text-slate-800 block truncate">{totalBorrowed}</span><span className="text-[11px] sm:text-xs text-slate-500 font-medium block truncate">Dipinjamkan</span></div>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-5 border border-slate-200 shadow-xs flex items-center gap-2.5 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0"><CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 stroke-[1.5]" /></div>
                  <div className="min-w-0 flex-1"><span className="text-base sm:text-2xl font-bold text-slate-800 block truncate">{totalAvailable}</span><span className="text-[11px] sm:text-xs text-slate-500 font-medium block truncate">Tersedia</span></div>
                </div>
              </div>

              {/* Transaksi Terkini */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 sm:p-5 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base mb-3 pb-2 border-b">Transaksi Sirkulasi Terkini</h3>
                {loans.length > 0 ? (
                  <div className="overflow-x-auto -mx-1 sm:mx-0">
                    <table className="w-full text-left text-xs min-w-[500px]">
                      <thead><tr className="text-slate-400 border-b"><th className="pb-2">Peminjam</th><th className="pb-2">NIM</th><th className="pb-2">Buku</th><th className="pb-2">Tgl Pinjam</th><th className="pb-2">Status</th></tr></thead>
                      <tbody className="divide-y divide-slate-100">
                        {loans.slice(0, 5).map((l) => (
                          <tr key={l.id}>
                            <td className="py-2.5 font-semibold text-slate-800">{l.nama}</td>
                            <td className="py-2.5 font-mono text-slate-500">{l.nim}</td>
                            <td className="py-2.5 text-slate-700 truncate max-w-xs">{l.judul}</td>
                            <td className="py-2.5 text-slate-500">{l.tanggalPinjam}</td>
                            <td className="py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.status === 'dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>{l.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs italic">Belum ada riwayat transaksi peminjaman buku.</div>
                )}
              </div>
            </div>
          )}

          {/* ================= 2. MODUL BIBLIOGRAFI ================= */}
          {activeNavTab === 'Bibliografi' && (
            <div className="space-y-4 max-w-7xl">
              {/* SUBTAB 1: DAFTAR BIBLIOGRAFI */}
              {biblioSubTab === 'daftar' && (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Katalog Bibliografi</h1>
                    <button
                      onClick={() => { setEditingBook(null); setIsBookFormOpen(true); }}
                      className="px-3.5 py-1.5 bg-[#475569] hover:bg-[#334155] text-white font-bold text-xs rounded transition-colors shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Bibliografi Baru</span>
                    </button>
                  </div>

                  {/* Filter Pencarian */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-700">
                    <span className="font-medium">Cari</span>
                    <input
                      type="text"
                      value={searchBookQuery}
                      onChange={(e) => setSearchBookQuery(e.target.value)}
                      placeholder="Masukkan kata kunci judul atau pengarang..."
                      className="w-64 sm:w-80 px-3 py-1 bg-white border border-slate-300 rounded text-xs focus:outline-none focus:border-[#0284c7]"
                    />
                    <select value={searchBookField} onChange={(e) => setSearchBookField(e.target.value)} className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs">
                      <option value="Semua Ruas">Semua Ruas</option>
                      <option value="Judul">Judul</option>
                      <option value="Pengarang">Pengarang</option>
                      <option value="ISBN/ISSN">ISBN/ISSN</option>
                    </select>
                    <button className="px-4 py-1 bg-[#475569] text-white font-bold rounded text-xs">Cari</button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-2">
                    <button onClick={handleDeleteSelectedBooks} className="px-3.5 py-1 bg-[#ef4444] text-white font-bold rounded text-xs hover:bg-[#dc2626]">
                      Hapus Data Terpilih
                    </button>
                    <button onClick={() => setSelectedBookIds(new Set(books.map(b => b.id)))} className="px-3 py-1 bg-[#475569] text-white font-semibold rounded text-xs">
                      Tandai Semua
                    </button>
                    <button onClick={() => setSelectedBookIds(new Set())} className="px-3 py-1 bg-[#475569] text-white font-semibold rounded text-xs">
                      Hilangkan Semua Tanda
                    </button>
                  </div>

                  {/* Tabel Bibliografi */}
                  <div className="border border-slate-200 rounded overflow-hidden mt-3">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f8fafc] text-slate-700 border-b font-bold uppercase text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3 w-10 text-center">HAPUS</th>
                          <th className="py-2.5 px-3 w-16 text-center">SUNTING</th>
                          <th className="py-2.5 px-3">JUDUL</th>
                          <th className="py-2.5 px-3 w-32">ISBN/ISSN</th>
                          <th className="py-2.5 px-3 w-16 text-center">SALIN</th>
                          <th className="py-2.5 px-3 w-40">PERUBAHAN TERAKHIR</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {books.length > 0 ? (
                          books.map((book) => (
                            <tr key={book.id} className="hover:bg-sky-50/40 transition-colors">
                              <td className="py-3 px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedBookIds.has(book.id)}
                                  onChange={() => {
                                    const next = new Set(selectedBookIds);
                                    if (next.has(book.id)) next.delete(book.id);
                                    else next.add(book.id);
                                    setSelectedBookIds(next);
                                  }}
                                />
                              </td>
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => {
                                    setEditingBook(book);
                                    setBookFormData(book);
                                    setIsBookFormOpen(true);
                                  }}
                                  className="p-1 hover:bg-slate-200 rounded"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-start gap-3">
                                  <img src={book.cover_url} alt="" className="w-10 h-14 object-cover rounded border border-slate-200" />
                                  <div>
                                    <h4 className="font-semibold text-slate-900 leading-snug">{book.judul}</h4>
                                    <p className="text-[11px] text-slate-500 italic mt-0.5">{book.penulis}</p>
                                    {book.isPromoted && <span className="inline-block mt-1 px-2 py-0.5 bg-[#06b6d4] text-white text-[10px] font-bold rounded">Telah dipromosikan ke Beranda</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-3 font-mono text-slate-600">{book.isbn || '-'}</td>
                              <td className="py-3 px-3 text-center font-bold text-slate-800">{book.salin || 1}</td>
                              <td className="py-3 px-3 font-mono text-[11px] text-slate-500">{book.updatedAt}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="py-12 text-center text-slate-400 bg-slate-50/50">
                              <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                              <p className="font-semibold text-slate-700">Belum ada data bibliografi.</p>
                              <p className="text-slate-400 mt-1">Klik tombol 'Tambah Bibliografi Baru' untuk memasukkan koleksi pertama.</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* SUBTAB 2: DAFTAR EKSEMPLAR */}
              {biblioSubTab === 'eksemplar' && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Daftar Eksemplar Fisik Koleksi</h2>
                  <p className="text-xs text-slate-500 mb-4">Total Eksemplar Buku di Perpustakaan: {totalCopies}</p>
                  <table className="w-full text-left text-xs border rounded overflow-hidden">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-3">Kode Barcode</th><th className="p-3">Judul Buku</th><th className="p-3">Nomor Panggil</th><th className="p-3">Lokasi</th><th className="p-3">Status</th></tr></thead>
                    <tbody className="divide-y">
                      {books.map((b, i) => (
                        <tr key={b.id}>
                          <td className="p-3 font-mono font-bold text-[#0284c7]">UIM-B{1000 + i}</td>
                          <td className="p-3 font-semibold text-slate-800">{b.judul}</td>
                          <td className="p-3 font-mono">DDC 005.{i} MAR c.{b.salin}</td>
                          <td className="p-3">Lantai 1 - Rak Utama</td>
                          <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px]">Tersedia</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB 3: EKSEMPLAR KELUAR */}
              {biblioSubTab === 'eksemplarKeluar' && (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Daftar Eksemplar Sedang Dipinjam (Keluar)</h2>
                  <p className="text-xs text-slate-500 mb-4">Total Buku yang Berada di Luar: {totalBorrowed}</p>
                  <table className="w-full text-left text-xs border rounded overflow-hidden">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-3">Peminjam</th><th className="p-3">NIM</th><th className="p-3">Judul Buku</th><th className="p-3">Jatuh Tempo</th></tr></thead>
                    <tbody className="divide-y">
                      {activeLoans.length > 0 ? (
                        activeLoans.map((l) => (
                          <tr key={l.id}>
                            <td className="p-3 font-semibold">{l.nama}</td>
                            <td className="p-3 font-mono">{l.nim}</td>
                            <td className="p-3">{l.judul}</td>
                            <td className="p-3 text-amber-700 font-bold">{l.tanggalJatuhTempo}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">Tidak ada eksemplar yang sedang dipinjam saat ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* SUBTAB 4: SALIN KATALOG (MARC / Z3950) */}
              {biblioSubTab === 'salinKatalog' && (
                <div className="space-y-4 max-w-2xl">
                  <h2 className="text-xl font-bold text-slate-800">Layanan Salin Katalog (Z39.50 & MARC SRU)</h2>
                  <p className="text-xs text-slate-500">Tarik metadata bibliografi otomatis dari server Perpustakaan Nasional RI (Perpusnas) atau Library of Congress.</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="Masukkan ISBN (Contoh: 978602...)" className="flex-1 px-3 py-2 border rounded text-xs" />
                    <button onClick={() => alert('Fitur koneksi Z39.50 server siap diintegrasikan.')} className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded text-xs">Cari Metadata</button>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: PENCETAKAN LABEL PUNGGUNG BUKU */}
              {biblioSubTab === 'cetakLabel' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Cetak Label Punggung Buku (Call Number)</h2>
                      <p className="text-xs text-slate-500">Pratinjau label fisik untuk ditempelkan pada punggung buku perpustakaan</p>
                    </div>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow">
                      <Printer className="w-4 h-4" />
                      <span>Cetak Label (Print)</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border rounded-xl">
                    {books.map((b, i) => (
                      <div key={b.id} className="bg-white border-2 border-slate-300 p-3 rounded text-center text-xs font-mono shadow-xs">
                        <div className="text-[10px] font-bold text-[#047857] border-b pb-1">DIGILIB UIM</div>
                        <div className="font-black text-sm my-1 text-slate-900">005.{i}</div>
                        <div className="text-slate-700 font-bold">{b.penulis.substring(0, 3).toUpperCase()}</div>
                        <div className="text-slate-500 text-[10px] border-t pt-1 mt-1">c.{b.salin || 1}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 6: CETAK BARCODE EKSEMPLAR */}
              {biblioSubTab === 'cetakBarcode' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800">Cetak Barcode Eksemplar</h2>
                      <p className="text-xs text-slate-500">Barcode fisik untuk pemindaian sirkulasi dan stock take</p>
                    </div>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow">
                      <Printer className="w-4 h-4" />
                      <span>Cetak Lembar Barcode</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 border rounded-xl">
                    {books.map((b, i) => (
                      <div key={b.id} className="bg-white border border-slate-300 p-4 rounded text-center shadow-xs">
                        <div className="text-[10px] font-bold text-slate-600 mb-1 truncate">{b.judul}</div>
                        <div className="font-mono text-2xl font-black tracking-widest text-slate-900 border-y py-2 my-1 select-all">
                          ||| | || |||| |
                        </div>
                        <div className="text-xs font-mono font-bold text-[#0284c7]">UIM-B{1000 + i}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 7: PLUGINS PENGHITUNG KOLEKSI DIBACA */}
              {biblioSubTab === 'plugins' && (
                <div className="p-6 bg-slate-50 border rounded-xl space-y-3 max-w-xl">
                  <h3 className="font-bold text-slate-800">Plugin: Penghitung Koleksi Dibaca di Tempat</h3>
                  <p className="text-xs text-slate-500">Mencatat statistik buku yang diambil pemustaka untuk dibaca di ruang baca tanpa dipinjam keluar.</p>
                  <div className="p-4 bg-white border rounded text-xs flex items-center justify-between">
                    <span>Total Baca di Tempat Hari Ini:</span>
                    <span className="text-lg font-bold text-[#0284c7]">14 Koleksi</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 3. MODUL SIRKULASI ================= */}
          {activeNavTab === 'Sirkulasi' && (
            <div className="space-y-4 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sirkulasi & Peminjaman Koleksi</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Pencatatan peminjaman, perpanjangan, dan pengembalian buku di Meja Sirkulasi UIM</p>
                </div>
                <button
                  onClick={() => setIsLoanFormOpen(true)}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Mulai Peminjaman Baru</span>
                </button>
              </div>

              {/* KONTEN SUBTAB ATURAN & TARIF DENDA */}
              {circSubTab === 'aturan' ? (
                <div className="p-6 bg-slate-50 border rounded-xl space-y-4 max-w-2xl text-xs text-slate-700">
                  <h3 className="font-bold text-base text-slate-800">Aturan Peminjaman & Tarif Denda SLiMS</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white border rounded">
                      <span className="font-semibold text-slate-500">Maksimal Koleksi Dipinjam:</span>
                      <p className="text-base font-bold text-slate-800 mt-1">3 Judul Buku</p>
                    </div>
                    <div className="p-3 bg-white border rounded">
                      <span className="font-semibold text-slate-500">Masa Pinjam Standar:</span>
                      <p className="text-base font-bold text-slate-800 mt-1">7 Hari Kalender</p>
                    </div>
                    <div className="p-3 bg-white border rounded">
                      <span className="font-semibold text-slate-500">Batas Perpanjangan Mandiri:</span>
                      <p className="text-base font-bold text-slate-800 mt-1">1 Kali (+7 Hari)</p>
                    </div>
                    <div className="p-3 bg-white border rounded">
                      <span className="font-semibold text-slate-500">Tarif Denda Keterlambatan:</span>
                      <p className="text-base font-bold text-red-600 mt-1">Rp 1.000 / Hari / Buku</p>
                    </div>
                  </div>
                  <button onClick={() => setCircSubTab('semua')} className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded">Kembali ke Daftar Transaksi</button>
                </div>
              ) : (
                /* TABEL TRANSAKSI */
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">No. Transaksi</th>
                        <th className="py-2.5 px-3">NIM / Peminjam</th>
                        <th className="py-2.5 px-3">Judul Buku</th>
                        <th className="py-2.5 px-3">Tgl Pinjam</th>
                        <th className="py-2.5 px-3">Jatuh Tempo</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Aksi Meja Sirkulasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loans.filter(l => circSubTab === 'semua' || (circSubTab === 'dipinjam' && l.status === 'dipinjam') || (circSubTab === 'kembali' && l.status === 'dikembalikan') || (circSubTab === 'terlambat' && new Date() > new Date(l.tanggalJatuhTempo) && l.status === 'dipinjam')).length > 0 ? (
                        loans.filter(l => circSubTab === 'semua' || (circSubTab === 'dipinjam' && l.status === 'dipinjam') || (circSubTab === 'kembali' && l.status === 'dikembalikan') || (circSubTab === 'terlambat' && new Date() > new Date(l.tanggalJatuhTempo) && l.status === 'dipinjam')).map((loan) => (
                          <tr key={loan.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono text-slate-500 font-bold">{loan.id}</td>
                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-slate-900 block">{loan.nim}</span>
                              <span className="text-slate-600">{loan.nama}</span>
                            </td>
                            <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-xs">{loan.judul}</td>
                            <td className="py-3 px-3 text-slate-500">{loan.tanggalPinjam}</td>
                            <td className="py-3 px-3 font-semibold text-amber-700">{loan.tanggalJatuhTempo}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${loan.status === 'dipinjam' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {loan.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {loan.status === 'dipinjam' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleReturnBook(loan.id)}
                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px]"
                                  >
                                    Kembalikan
                                  </button>
                                  <button
                                    onClick={() => handleRenewBook(loan.id)}
                                    className="px-2.5 py-1 bg-slate-100 hover:bg-sky-50 text-slate-700 font-semibold rounded text-[11px] border border-slate-200"
                                  >
                                    Perpanjang (+7)
                                  </button>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs">Selesai Dikembalikan</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-400 bg-slate-50/50">
                            <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700">Belum ada transaksi peminjaman pada filter ini.</p>
                            <p className="text-slate-400 mt-1">Klik tombol 'Mulai Peminjaman Baru' untuk mencatat transaksi.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= 4. MODUL KEANGGOTAAN ================= */}
          {activeNavTab === 'Keanggotaan' && (
            <div className="space-y-4 max-w-7xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Keanggotaan & Verifikasi KTM</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Daftar anggota aktif dan persetujuan registrasi mahasiswa baru UIM</p>
                </div>
                <button
                  onClick={() => setIsMemberFormOpen(true)}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota Manual</span>
                </button>
              </div>

              {/* KONTEN SUBTAB CETAK KARTU DIGITAL */}
              {memberSubTab === 'cetakKartu' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b">
                    <h2 className="text-xl font-bold text-slate-800">Pratinjau Kartu Perpustakaan Digital Anggota</h2>
                    <button onClick={() => window.print()} className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded text-xs flex items-center gap-1.5">
                      <Printer className="w-4 h-4" />
                      <span>Cetak Kartu Anggota</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl">
                    {members.map((m) => (
                      <div key={m.id} className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white p-5 rounded-2xl shadow-xl border-2 border-amber-400 relative overflow-hidden">
                        <div className="flex items-center gap-3 border-b border-emerald-500/40 pb-3 mb-3">
                          <img src="/logo-uim.png" alt="" className="w-10 h-10 object-contain" />
                          <div>
                            <h4 className="font-black text-xs tracking-wider uppercase">Universitas Islam Madura</h4>
                            <p className="text-[10px] text-amber-300">KARTU PEMUSTAKA PERPUSTAKAAN</p>
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <p><span className="text-emerald-200">NIM / No. ID:</span> <strong className="font-mono text-amber-300 ml-1">{m.nim}</strong></p>
                          <p><span className="text-emerald-200">Nama:</span> <strong className="ml-1 text-white">{m.nama}</strong></p>
                          <p><span className="text-emerald-200">Program Studi:</span> <span className="ml-1 text-slate-200">{m.prodi}</span></p>
                        </div>
                        <div className="mt-4 pt-2 border-t border-emerald-600/50 flex items-center justify-between text-[10px] text-emerald-200">
                          <span>Status: Terverifikasi</span>
                          <span className="font-mono tracking-widest text-amber-300 font-bold">|||| | ||| ||||</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : memberSubTab === 'tipe' ? (
                /* KONTEN TIPE KEANGGOTAAN */
                <div className="p-5 bg-slate-50 border rounded-xl space-y-3 max-w-2xl text-xs">
                  <h3 className="font-bold text-sm text-slate-800">Tipe Keanggotaan & Hak Akses Perpustakaan</h3>
                  <table className="w-full text-left border bg-white rounded">
                    <thead className="bg-slate-100 border-b"><tr><th className="p-2.5">Tipe Anggota</th><th className="p-2.5">Batas Pinjam</th><th className="p-2.5">Masa Pinjam</th><th className="p-2.5">Perpanjangan</th></tr></thead>
                    <tbody className="divide-y">
                      <tr><td className="p-2.5 font-bold">Mahasiswa UIM (KTM)</td><td className="p-2.5">3 Buku</td><td className="p-2.5">7 Hari</td><td className="p-2.5">1 Kali</td></tr>
                      <tr><td className="p-2.5 font-bold">Dosen & Tenaga Ahli</td><td className="p-2.5">5 Buku</td><td className="p-2.5">14 Hari</td><td className="p-2.5">2 Kali</td></tr>
                      <tr><td className="p-2.5 font-bold">Staf / Tenaga Kependidikan</td><td className="p-2.5">3 Buku</td><td className="p-2.5">10 Hari</td><td className="p-2.5">1 Kali</td></tr>
                    </tbody>
                  </table>
                  <button onClick={() => setMemberSubTab('semua')} className="px-3 py-1.5 bg-[#0284c7] text-white rounded font-bold">Kembali</button>
                </div>
              ) : (
                /* TABEL ANGGOTA UTAMA */
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f8fafc] text-slate-700 border-b font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-3">Nomor KTM / NIM</th>
                        <th className="py-2.5 px-3">Nama Mahasiswa</th>
                        <th className="py-2.5 px-3">Program Studi</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">Status Akun</th>
                        <th className="py-2.5 px-3 text-right">Aksi Pustakawan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.filter(m => memberSubTab === 'semua' || (memberSubTab === 'pending' && m.status === 'pending') || (memberSubTab === 'verified' && m.status === 'verified')).length > 0 ? (
                        members.filter(m => memberSubTab === 'semua' || (memberSubTab === 'pending' && m.status === 'pending') || (memberSubTab === 'verified' && m.status === 'verified')).map((m) => (
                          <tr key={m.id} className="hover:bg-slate-50">
                            <td className="py-3 px-3 font-mono font-bold text-slate-900">{m.nim}</td>
                            <td className="py-3 px-3 font-medium text-slate-800">{m.nama}</td>
                            <td className="py-3 px-3 text-slate-600">{m.prodi}</td>
                            <td className="py-3 px-3 text-slate-500">{m.email}</td>
                            <td className="py-3 px-3">
                              {m.status === 'pending' ? (
                                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold text-[10px]">Menunggu Verifikasi</span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[10px]">Aktif / Terverifikasi</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {m.status === 'pending' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={() => handleVerifyMember(m.id, 'verified')} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs">Setujui</button>
                                  <button onClick={() => handleVerifyMember(m.id, 'rejected')} className="px-2.5 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 text-xs rounded border">Tolak</button>
                                </div>
                              ) : (
                                <span className="text-emerald-700 font-semibold text-xs flex items-center justify-end gap-1"><CheckCircle className="w-3.5 h-3.5" /> Terverifikasi</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400 bg-slate-50/50">
                            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-semibold text-slate-700">Belum ada anggota terdaftar pada filter ini.</p>
                            <p className="text-slate-400 mt-1">Data mahasiswa akan muncul otomatis saat mahasiswa mendaftar via KTM di menu Area Anggota.</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= 5. MODUL DAFTAR TERKENDALI ================= */}
          {activeNavTab === 'Daftar Terkendali' && (
            <div className="space-y-4 max-w-6xl">
              <div className="pb-2 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Daftar Terkendali (Otoritas Data)</h1>
                <p className="text-xs text-slate-500 mt-0.5">Pengendalian otoritas nama pengarang, subjek/topik, penerbit, dan lokasi rak katalog</p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newAuthorityText.trim()) return;
                const next = { ...authorities };
                next[authoritySubTab].push({ id: Date.now(), nama: newAuthorityText.trim(), karyaCount: 1 });
                setAuthorities(next);
                setNewAuthorityText('');
              }} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  required
                  value={newAuthorityText}
                  onChange={(e) => setNewAuthorityText(e.target.value)}
                  placeholder={`Tambah ${authoritySubTab} baru...`}
                  className="flex-1 px-3 py-2 border rounded text-xs"
                />
                <button type="submit" className="px-4 py-2 bg-[#0284c7] text-white font-bold rounded text-xs">Tambah Otoritas</button>
              </form>

              <table className="w-full text-left text-xs border rounded overflow-hidden">
                <thead className="bg-slate-50 border-b"><tr><th className="p-3">Nama Otoritas</th><th className="p-3">Jumlah Koleksi Terkait</th><th className="p-3 text-right">Aksi</th></tr></thead>
                <tbody className="divide-y">
                  {authorities[authoritySubTab].map((item) => (
                    <tr key={item.id}>
                      <td className="p-3 font-semibold text-slate-800">{item.nama}</td>
                      <td className="p-3 text-slate-500">{item.karyaCount || 1} Judul</td>
                      <td className="p-3 text-right"><button onClick={() => {
                        const next = { ...authorities };
                        next[authoritySubTab] = next[authoritySubTab].filter(x => x.id !== item.id);
                        setAuthorities(next);
                      }} className="text-red-500 hover:underline">Hapus</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ================= 6. MODUL INVENTARISASI ================= */}
          {activeNavTab === 'Inventarisasi' && (
            <div className="space-y-4 max-w-6xl">
              <div className="pb-2 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Inventarisasi (Stock Take Koleksi Fisik)</h1>
                <p className="text-xs text-slate-500 mt-0.5">Pencocokan fisik buku di rak perpustakaan menggunakan kode barcode eksemplar</p>
              </div>

              {inventorySubTab === 'fisik' && (
                <div className="space-y-4">
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">Sesi Stock Take Aktif: Tahun Akademik 2026</h4>
                      <p className="text-slate-500 mt-0.5">Total Eksemplar Terverifikasi Fisik: <strong className="text-[#0284c7]">{verifiedBarcodes.size}</strong> dari <strong className="text-slate-800">{totalCopies}</strong></p>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={stockTakeBarcode}
                        onChange={(e) => setStockTakeBarcode(e.target.value)}
                        placeholder="Scan / Masukkan Barcode..."
                        className="px-3 py-1.5 border border-slate-300 rounded text-xs bg-white"
                      />
                      <button
                        onClick={() => {
                          if (!stockTakeBarcode.trim()) return;
                          const next = new Set(verifiedBarcodes);
                          next.add(stockTakeBarcode.trim());
                          setVerifiedBarcodes(next);
                          setStockTakeBarcode('');
                          alert('Eksemplar fisik berhasil diverifikasi!');
                        }}
                        className="px-4 py-1.5 bg-[#0284c7] text-white font-bold rounded text-xs hover:bg-[#0369a1]"
                      >
                        Verifikasi
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {inventorySubTab === 'hilang' && (
                <div className="p-8 text-center bg-slate-50 border rounded-xl text-xs text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Tidak ada koleksi yang dilaporkan hilang.</p>
                </div>
              )}

              {inventorySubTab === 'rusak' && (
                <div className="p-8 text-center bg-slate-50 border rounded-xl text-xs text-slate-500">
                  <Archive className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-700">Semua eksemplar dalam kondisi baik (0 buku rusak).</p>
                </div>
              )}
            </div>
          )}

          {/* ================= 7. MODUL SISTEM ================= */}
          {activeNavTab === 'Sistem' && (
            <div className="space-y-4 max-w-5xl">
              {/* Alert Notification Global */}
              {systemAlertMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{systemAlertMessage}</span>
                  </div>
                  <button onClick={() => setSystemAlertMessage('')} className="text-emerald-700 hover:text-emerald-900">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* ---------------- 7.1 PENGATURAN SISTEM (SESUAI SLIMS 9) ---------------- */}
              {systemSubTab === 'pengaturan_sistem' && (
                <div className="space-y-4">
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Sistem</h1>

                  {/* Banner Registrasi SLiMS */}
                  <div className="bg-[#e8f4fd] border border-[#bae6fd] p-3.5 rounded text-xs text-slate-700 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">Your site is already registered</span>
                      <button
                        type="button"
                        onClick={() => setIsSiteRegisterModalOpen(true)}
                        className="px-2.5 py-0.5 bg-[#475569] hover:bg-[#334155] text-white text-[11px] font-medium rounded transition-colors"
                      >
                        Sunting
                      </button>
                    </div>
                    <p className="text-slate-500 text-[11px]">Merubah preferensi aplikasi global</p>
                  </div>

                  {/* Tombol Simpan di Atas */}
                  <div>
                    <button
                      type="button"
                      onClick={handleSaveSystemSettings}
                      className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded transition-colors shadow-xs"
                    >
                      Simpan Pengaturan
                    </button>
                  </div>

                  {/* Form Konfigurasi Sistem Model Baris SLiMS */}
                  <div className="bg-white border border-slate-200 rounded divide-y divide-slate-100 text-xs shadow-xs">
                    {/* Versi SLiMS */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Versi SLiMS</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 font-semibold text-slate-800 mt-1 sm:mt-0">{systemConfig.versiSlims}</div>
                    </div>

                    {/* Nama Perpustakaan */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Nama Perpustakaan</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="text"
                          value={systemConfig.namaPerpus}
                          onChange={(e) => setSystemConfig({ ...systemConfig, namaPerpus: e.target.value })}
                          className="w-full max-w-2xl px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Nama Tambahan Perpustakaan */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Nama Tambahan Perpustakaan</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="text"
                          value={systemConfig.namaTambahan}
                          onChange={(e) => setSystemConfig({ ...systemConfig, namaTambahan: e.target.value })}
                          placeholder="Digilib"
                          className="w-full max-w-2xl px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Gambar Logo */}
                    <div className="flex flex-col sm:flex-row sm:items-start p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0 pt-1">Gambar Logo</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0 pt-1">:</div>
                      <div className="flex-1 space-y-4 mt-1 sm:mt-0">
                        {/* Logo Utama */}
                        <div>
                          <div className="font-semibold text-slate-800 mb-2">Logo Utama</div>
                          {systemConfig.logoUrl ? (
                            <div className="flex items-start gap-3">
                              <div className="w-24 h-24 bg-black rounded p-1 flex items-center justify-center border border-slate-300 shadow-xs">
                                <img
                                  src={systemConfig.logoUrl}
                                  alt="Logo Utama"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => setSystemConfig({ ...systemConfig, logoUrl: '' })}
                                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] rounded transition-colors shadow-xs"
                              >
                                Hapus Gambar
                              </button>
                            </div>
                          ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded flex items-center justify-center text-slate-400 text-xs italic bg-slate-50">
                              Belum ada logo
                            </div>
                          )}
                          <div className="mt-2.5 flex items-center gap-2 max-w-md">
                            <label className="flex-1 flex items-center border border-slate-300 rounded overflow-hidden bg-white text-xs cursor-pointer hover:border-slate-400 transition-colors">
                              <span className="px-3 py-1.5 text-slate-500 truncate flex-1">
                                {uploadedLogoFileName || 'Pilih berkas'}
                              </span>
                              <span className="px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-medium text-xs">
                                Browse
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Maximum 500 KB</p>
                        </div>

                        {/* Favicon */}
                        <div className="pt-2 border-t border-slate-100">
                          <div className="font-semibold text-slate-800 mb-2">Favicon</div>
                          <div className="flex items-center gap-2 max-w-md">
                            <label className="flex-1 flex items-center border border-slate-300 rounded overflow-hidden bg-white text-xs cursor-pointer hover:border-slate-400 transition-colors">
                              <span className="px-3 py-1.5 text-slate-500 truncate flex-1">
                                {uploadedFaviconFileName || 'Pilih berkas'}
                              </span>
                              <span className="px-3.5 py-1.5 bg-slate-600 hover:bg-slate-700 text-white font-medium text-xs">
                                Browse
                              </span>
                              <input
                                type="file"
                                accept=".ico,image/png,image/x-icon"
                                onChange={handleFaviconUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">Maximum 100 KB</p>
                        </div>
                      </div>
                    </div>

                    {/* Bahasa Aplikasi Baku */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Bahasa Aplikasi Baku</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <select
                          value={systemConfig.bahasaBaku}
                          onChange={(e) => setSystemConfig({ ...systemConfig, bahasaBaku: e.target.value })}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs min-w-[260px] focus:ring-1 focus:ring-sky-500 outline-none"
                        >
                          <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                          <option value="English">English</option>
                          <option value="Arabic">Arabic (العربية)</option>
                          <option value="Javanese">Bahasa Jawa</option>
                        </select>
                      </div>
                    </div>

                    {/* Format Tanggal */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Format Tanggal</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <select
                          value={systemConfig.formatTanggal}
                          onChange={(e) => setSystemConfig({ ...systemConfig, formatTanggal: e.target.value })}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs min-w-[260px] focus:ring-1 focus:ring-sky-500 outline-none"
                        >
                          <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-11-07)</option>
                          <option value="DD-MM-YYYY">DD-MM-YYYY (Contoh: 07-11-2026)</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 07/11/2026)</option>
                        </select>
                      </div>
                    </div>

                    {/* Koleksi Terpopuler di Beranda */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Koleksi Terpopuler di Beranda</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex items-center gap-4 mt-1 sm:mt-0">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="koleksiPopuler"
                            value="Tampilkan"
                            checked={systemConfig.koleksiPopulerBeranda === 'Tampilkan'}
                            onChange={() => setSystemConfig({ ...systemConfig, koleksiPopulerBeranda: 'Tampilkan' })}
                          />
                          <span>Tampilkan</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="koleksiPopuler"
                            value="Jangan Tampilkan"
                            checked={systemConfig.koleksiPopulerBeranda === 'Jangan Tampilkan'}
                            onChange={() => setSystemConfig({ ...systemConfig, koleksiPopulerBeranda: 'Jangan Tampilkan' })}
                          />
                          <span>Jangan Tampilkan</span>
                        </label>
                      </div>
                    </div>

                    {/* Koleksi Terbaru di Beranda */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Koleksi Terbaru di Beranda</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex items-center gap-4 mt-1 sm:mt-0">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="koleksiTerbaru"
                            value="Tampilkan"
                            checked={systemConfig.koleksiTerbaruBeranda === 'Tampilkan'}
                            onChange={() => setSystemConfig({ ...systemConfig, koleksiTerbaruBeranda: 'Tampilkan' })}
                          />
                          <span>Tampilkan</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="koleksiTerbaru"
                            value="Jangan Tampilkan"
                            checked={systemConfig.koleksiTerbaruBeranda === 'Jangan Tampilkan'}
                            onChange={() => setSystemConfig({ ...systemConfig, koleksiTerbaruBeranda: 'Jangan Tampilkan' })}
                          />
                          <span>Jangan Tampilkan</span>
                        </label>
                      </div>
                    </div>

                    {/* Batas Waktu Sesi Login */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Batas Waktu Sesi Login (Menit)</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="number"
                          min="5"
                          max="720"
                          value={systemConfig.sessionTimeout || 60}
                          onChange={(e) => setSystemConfig({ ...systemConfig, sessionTimeout: Number(e.target.value) })}
                          className="w-32 px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Maksimal Peminjaman Koleksi */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Maksimal Peminjaman Koleksi (Buku)</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={systemConfig.maxPinjam}
                          onChange={(e) => setSystemConfig({ ...systemConfig, maxPinjam: Number(e.target.value) })}
                          className="w-32 px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Masa Pinjam Standar */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Masa Pinjam Standar (Hari)</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="number"
                          min="1"
                          max="60"
                          value={systemConfig.masaPinjam}
                          onChange={(e) => setSystemConfig({ ...systemConfig, masaPinjam: Number(e.target.value) })}
                          className="w-32 px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Denda Keterlambatan per Hari */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Denda Keterlambatan per Hari (Rp)</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="number"
                          min="0"
                          step="500"
                          value={systemConfig.dendaPerHari}
                          onChange={(e) => setSystemConfig({ ...systemConfig, dendaPerHari: Number(e.target.value) })}
                          className="w-40 px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Abaikan Hari Libur pada Denda */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Abaikan Hari Libur pada Denda</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex items-center gap-4 mt-1 sm:mt-0">
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="abaikanLibur"
                            value="Ya"
                            checked={systemConfig.abaikanHariLibur === 'Ya'}
                            onChange={() => setSystemConfig({ ...systemConfig, abaikanHariLibur: 'Ya' })}
                          />
                          <span>Ya (Denda tidak dihitung hari libur)</span>
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="radio"
                            name="abaikanLibur"
                            value="Tidak"
                            checked={systemConfig.abaikanHariLibur === 'Tidak'}
                            onChange={() => setSystemConfig({ ...systemConfig, abaikanHariLibur: 'Tidak' })}
                          />
                          <span>Tidak</span>
                        </label>
                      </div>
                    </div>

                    {/* Alamat Kampus / Lokasi */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Alamat Kampus / Lokasi</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="text"
                          value={systemConfig.kampus}
                          onChange={(e) => setSystemConfig({ ...systemConfig, kampus: e.target.value })}
                          className="w-full max-w-2xl px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Surel Resmi Perpustakaan */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Surel Resmi Perpustakaan</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <input
                          type="email"
                          value={systemConfig.email}
                          onChange={(e) => setSystemConfig({ ...systemConfig, email: e.target.value })}
                          className="w-full max-w-2xl px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-sky-500 outline-none"
                        />
                      </div>
                    </div>

                    {/* Pengecekan Alamat IP Akses Admin */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Pengecekan Alamat IP Akses Admin</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <select
                          value={systemConfig.cekIpAdmin || 'Nonaktifkan'}
                          onChange={(e) => setSystemConfig({ ...systemConfig, cekIpAdmin: e.target.value })}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs min-w-[220px]"
                        >
                          <option value="Nonaktifkan">Nonaktifkan</option>
                          <option value="Aktifkan">Aktifkan (Hanya Jaringan Kampus UIM)</option>
                        </select>
                      </div>
                    </div>

                    {/* Izin Unduh Berkas Lampiran */}
                    <div className="flex flex-col sm:flex-row sm:items-center p-3.5">
                      <div className="w-56 font-semibold text-slate-700 shrink-0">Izin Unduh Berkas Lampiran</div>
                      <div className="hidden sm:block text-slate-400 font-semibold px-2 shrink-0">:</div>
                      <div className="flex-1 mt-1 sm:mt-0">
                        <select
                          value={systemConfig.izinUnduh || 'Hanya Anggota Terdaftar'}
                          onChange={(e) => setSystemConfig({ ...systemConfig, izinUnduh: e.target.value })}
                          className="px-3 py-1.5 border border-slate-300 rounded text-xs min-w-[260px]"
                        >
                          <option value="Hanya Anggota Terdaftar">Hanya Anggota Terdaftar</option>
                          <option value="Semua Pengunjung OPAC">Semua Pengunjung OPAC Publik</option>
                          <option value="Hanya Staf & Pustakawan">Hanya Staf & Pustakawan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Simpan di Bawah */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSystemSettings}
                      className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded transition-colors shadow-xs"
                    >
                      Simpan Pengaturan
                    </button>
                  </div>
                </div>
              )}

              {/* ---------------- 7.2 LINGKUNGAN SISTEM ---------------- */}
              {systemSubTab === 'lingkungan_sistem' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Lingkungan Sistem</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Informasi diagnosa server, versi PHP, basis data MySQL, dan ekstensi SLiMS 9 Bulian</p>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Semua dependensi server memenuhi persyaratan operasional SLiMS 9 Bulian secara optimal.</span>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700 w-1/3">Komponen Sistem</th>
                          <th className="p-3 font-bold text-slate-700">Detail / Status Lingkungan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        <tr>
                          <td className="p-3 font-semibold">Versi Aplikasi SLiMS</td>
                          <td className="p-3 font-bold text-[#0284c7]">SLiMS 9 (Bulian D Ace) v9.6.1</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Sistem Operasi (OS)</td>
                          <td className="p-3 font-mono">Linux 5.15.0-89-generic (x86_64) digilib.uim.ac.id</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Web Server</td>
                          <td className="p-3 font-mono">Apache/2.4.58 (Unix) OpenSSL/1.1.1w</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Versi PHP</td>
                          <td className="p-3 font-mono">PHP 8.2.18 (Zend Engine v4.2.18)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Pangkalan Data (Database)</td>
                          <td className="p-3 font-mono">10.4.32-MariaDB SLiMS database (utf8mb4_unicode_ci)</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Batas Alokasi Memori (memory_limit)</td>
                          <td className="p-3 font-semibold text-emerald-700">512 MB</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Batas Ukuran Unggahan (upload_max_filesize)</td>
                          <td className="p-3 font-semibold text-emerald-700">64 MB</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Batas Ukuran Data POST (post_max_size)</td>
                          <td className="p-3 font-semibold text-emerald-700">64 MB</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-semibold">Waktu Eksekusi Maksimum</td>
                          <td className="p-3 font-semibold">300 detik</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-white border rounded p-4 shadow-xs">
                    <h3 className="font-bold text-slate-800 text-xs mb-3">Status Ekstensi & Modul PHP</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {[
                        { name: 'cURL Support', ok: true },
                        { name: 'GD Library (Image)', ok: true },
                        { name: 'mbstring (Multibyte)', ok: true },
                        { name: 'MySQLi Driver', ok: true },
                        { name: 'OpenSSL Crypto', ok: true },
                        { name: 'YAZ / Z39.50', ok: true },
                        { name: 'ZIP Archive', ok: true },
                        { name: 'Gettext I18n', ok: true }
                      ].map((ext) => (
                        <div key={ext.name} className="p-2.5 bg-slate-50 border rounded flex items-center justify-between">
                          <span className="font-medium text-slate-700">{ext.name}</span>
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded">Aktif</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.3 SETELAN LINGKUNGAN SISTEM ---------------- */}
              {systemSubTab === 'setelan_lingkungan' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Setelan Lingkungan Sistem</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Pengaturan driver barcode, penamaan sesi cookie, dan direktori repositori</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="bg-white border rounded p-4 space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Driver Generator Barcode</label>
                      <select className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded text-xs">
                        <option>GD Library (PNG Image Barcode)</option>
                        <option>SVG Vector Barcode</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">Pustaka pembuat gambar barcode eksemplar</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Sesi Cookie SLiMS</label>
                      <input type="text" defaultValue="SLIMS_UIM_SESSID" className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded text-xs" />
                      <p className="text-[11px] text-slate-500 mt-1">Nama cookie identifikasi sesi pengguna sistem</p>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Direktori Berkas Lampiran Repositori</label>
                      <input type="text" defaultValue="/files/repository/" className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mode Debugging / Pelaporan Kesalahan</label>
                      <select className="w-full max-w-md px-3 py-1.5 border border-slate-300 rounded text-xs">
                        <option>Nonaktif (Mode Produksi - Aman)</option>
                        <option>Aktif (Mode Pengembang)</option>
                      </select>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs shadow-xs">
                      Simpan Setelan Lingkungan
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------- 7.4 PENGATURAN UCS (UNION CATALOG SERVER) ---------------- */}
              {systemSubTab === 'pengaturan_ucs' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan UCS (Union Catalog Server)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Integrasi jaringan pangkalan data katalog bersama nasional dan antar perpustakaan SLiMS</p>
                  </div>

                  {testUcsStatus === 'loading' && (
                    <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Menghubungi Server UCS nasional...</span>
                    </div>
                  )}

                  {testUcsStatus === 'success' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Koneksi berhasil! Node SLiMS Perpustakaan UIM terhubung ke server UCS (Response HTTP 200 OK).</span>
                    </div>
                  )}

                  <div className="bg-white border rounded p-5 space-y-4 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Alamat Server UCS</label>
                      <input type="text" defaultValue="https://ucs.slims.web.id/index.php" className="w-full max-w-xl px-3 py-1.5 border border-slate-300 rounded text-xs" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">UCS Node ID</label>
                      <input type="text" defaultValue="UIM-MADURA-001" className="w-full max-w-xl px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Kata Sandi UCS Node</label>
                      <input type="password" defaultValue="secret_ucs_password" className="w-full max-w-xl px-3 py-1.5 border border-slate-300 rounded text-xs" />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                        <input type="checkbox" defaultChecked />
                        <span>Otomatis unggah rekaman bibliografi baru ke katalog bersama UCS</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleTestUcs}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>Uji Koneksi Server UCS</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveSystemSettings}
                        className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs"
                      >
                        Simpan Pengaturan UCS
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.5 TEMA ---------------- */}
              {systemSubTab === 'tema' && (
                <div className="space-y-5">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Tema Tampilan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Kelola tema antarmuka katalog publik (OPAC) dan palet tema sistem administrasi</p>
                  </div>

                  {/* Bagian Palet Warna Admin */}
                  <div className="bg-white border rounded p-4 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Tema Warna Antarmuka Admin SLiMS</h3>
                    <p className="text-xs text-slate-500">Pilih skema warna bilah navigasi dan sidebar panel admin:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { id: 'blue', label: 'Biru SLiMS Klasik', color: 'bg-[#0284c7]' },
                        { id: 'emerald', label: 'Hijau Emerald UIM', color: 'bg-[#047857]' },
                        { id: 'indigo', label: 'Indigo Modern', color: 'bg-[#4338ca]' },
                        { id: 'slate', label: 'Slate Dark Enterprise', color: 'bg-[#334155]' }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setAdminTheme(t.id);
                            setSystemAlertMessage(`Tema admin berhasil diubah ke ${t.label}!`);
                            setTimeout(() => setSystemAlertMessage(''), 3000);
                          }}
                          className={`p-3 border rounded text-left flex items-center gap-2.5 transition-all ${
                            adminTheme === t.id ? 'border-[#0284c7] ring-2 ring-sky-300 bg-sky-50' : 'hover:border-slate-400'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full ${t.color} shrink-0`} />
                          <span className="text-xs font-semibold text-slate-700">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bagian Tema Portal Publik */}
                  <div className="bg-white border rounded p-4 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-800 text-xs sm:text-sm">Tema Antarmuka Portal Publik (OPAC)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      {[
                        { name: 'Bulian Default Theme', desc: 'Tema bawaan resmi SLiMS 9 yang responsif dan modern.', active: true },
                        { name: 'Akasia Academic Theme', desc: 'Tema klasik katalog akademik dengan tata letak buku grid.', active: false },
                        { name: 'Light Emerald UIM', desc: 'Tema bernuansa hijau Kampus Hijau Bettet UIM Pamekasan.', active: false }
                      ].map((thm) => (
                        <div key={thm.name} className={`p-4 border rounded-lg space-y-2 ${thm.active ? 'border-sky-500 bg-sky-50/50' : 'bg-white'}`}>
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 text-xs">{thm.name}</h4>
                            {thm.active && <span className="px-2 py-0.5 bg-[#0284c7] text-white text-[10px] font-bold rounded">Aktif</span>}
                          </div>
                          <p className="text-[11px] text-slate-500">{thm.desc}</p>
                          <button
                            type="button"
                            onClick={() => alert(`Tema ${thm.name} aktif untuk portal OPAC!`)}
                            className="mt-2 w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded transition-colors"
                          >
                            {thm.active ? 'Tema Sedang Digunakan' : 'Gunakan Tema Ini'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.6 PLUGIN ---------------- */}
              {systemSubTab === 'plugin' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Plugin SLiMS</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola modul ekstensi tambahan untuk otomatisasi dan integrasi perpustakaan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Pilih berkas arsip plugin (.zip) untuk diunggah ke SLiMS.')}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Plugin Baru (.zip)</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Nama Plugin & Deskripsi</th>
                          <th className="p-3 font-bold text-slate-700">Versi</th>
                          <th className="p-3 font-bold text-slate-700">Pengembang</th>
                          <th className="p-3 font-bold text-slate-700">Status</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {pluginsList.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3">
                              <span className="font-bold text-slate-800 block">{p.name}</span>
                              <span className="text-[11px] text-slate-500">{p.desc}</span>
                            </td>
                            <td className="p-3 font-mono text-[11px] text-slate-500">{p.version}</td>
                            <td className="p-3 text-slate-600">{p.author}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {p.enabled ? 'Aktif' : 'Nonaktif'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleTogglePlugin(p.id)}
                                className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                  p.enabled ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }`}
                              >
                                {p.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.7 RUAS TAMBAHAN (CUSTOM FIELDS) ---------------- */}
              {systemSubTab === 'ruas_tambahan' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Ruas Tambahan (Custom Fields)</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola bidang data khusus untuk memperkaya formulir bibliografi atau keanggotaan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsCustomFieldModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Ruas Baru</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Label Ruas</th>
                          <th className="p-3 font-bold text-slate-700">Nama Field Kolom</th>
                          <th className="p-3 font-bold text-slate-700">Tipe Data</th>
                          <th className="p-3 font-bold text-slate-700">Tabel Sasaran</th>
                          <th className="p-3 font-bold text-slate-700">Wajib Diisi</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {customFields.map((cf) => (
                          <tr key={cf.id}>
                            <td className="p-3 font-semibold text-slate-800">{cf.label}</td>
                            <td className="p-3 font-mono text-slate-500">{cf.field}</td>
                            <td className="p-3 text-slate-600">{cf.type}</td>
                            <td className="p-3 font-medium text-[#0284c7]">{cf.target}</td>
                            <td className="p-3">{cf.required ? <span className="text-red-600 font-bold">Ya</span> : <span className="text-slate-400">Tidak</span>}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomField(cf.id)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.8 PENGATURAN MATA UANG ---------------- */}
              {systemSubTab === 'pengaturan_mata_uang' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan mata uang</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Konfigurasi simbol mata uang, pemisah ribuan, dan pemisah desimal denda sirkulasi</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="bg-white border rounded p-5 space-y-4 text-xs max-w-2xl shadow-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Mata Uang Baku</label>
                      <input type="text" defaultValue="Rupiah Indonesia (IDR)" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Simbol Mata Uang</label>
                        <input type="text" defaultValue="Rp" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-bold" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Posisi Simbol</label>
                        <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs">
                          <option>Di Depan Angka (Contoh: Rp 10.000)</option>
                          <option>Di Belakang Angka</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pemisah Ribuan</label>
                        <input type="text" defaultValue="." className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-center font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Pemisah Desimal</label>
                        <input type="text" defaultValue="," className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs text-center font-mono font-bold" />
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border rounded flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Contoh Pratinjau Nilai:</span>
                      <span className="font-bold text-slate-800 text-sm font-mono">Rp 50.000,00</span>
                    </div>

                    <button type="submit" className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs shadow-xs">
                      Simpan Pengaturan Mata Uang
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------- 7.9 PENGATURAN SUREL ---------------- */}
              {systemSubTab === 'pengaturan_surel' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Surel</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Konfigurasi server SMTP pengiriman email pengingat keterlambatan dan aktivasi akun</p>
                  </div>

                  {testEmailStatus === 'loading' && (
                    <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded text-xs flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-sky-600" />
                      <span>Mengirim surel pengujian ke {systemConfig.email}...</span>
                    </div>
                  )}

                  {testEmailStatus === 'success' && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Surel pengujian berhasil terkirim ke {systemConfig.email}! Pengaturan SMTP siap digunakan.</span>
                    </div>
                  )}

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="bg-white border rounded p-5 space-y-4 text-xs max-w-2xl shadow-xs">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                        <input type="checkbox" defaultChecked />
                        <span>Aktifkan Pengiriman Notifikasi Surel Otomatis</span>
                      </label>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Metode Pengiriman</label>
                      <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs">
                        <option>SMTP (Simple Mail Transfer Protocol)</option>
                        <option>PHP Mail() Function</option>
                        <option>Sendmail</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block font-semibold text-slate-700 mb-1">Host Server SMTP</label>
                        <input type="text" defaultValue="smtp.uim.ac.id" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Port SMTP</label>
                        <input type="number" defaultValue={587} className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Alamat Surel Pengirim</label>
                      <input type="email" defaultValue={systemConfig.email} className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Nama Pengirim yang Tampil</label>
                      <input type="text" defaultValue="Perpustakaan Universitas Islam Madura" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Protokol Keamanan</label>
                      <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs">
                        <option>TLS (Transport Layer Security)</option>
                        <option>SSL</option>
                        <option>Tanpa Enkripsi</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center gap-1.5"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Kirim Surel Pengujian</span>
                      </button>
                      <button type="submit" className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs">
                        Simpan Pengaturan Surel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------------- 7.10 PENGATURAN CAPTCHA ---------------- */}
              {systemSubTab === 'pengaturan_captcha' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Captcha</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Lindungi formulir login admin, OPAC publik, dan pendaftaran anggota dari serangan bot</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="bg-white border rounded p-5 space-y-4 text-xs max-w-2xl shadow-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-2">Aktifkan Captcha Pada Formulir:</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked />
                          <span>Halaman Masuk Admin & Petugas Pustakawan</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked />
                          <span>Halaman Masuk Portal Anggota (OPAC)</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" defaultChecked />
                          <span>Formulir Pendaftaran Mahasiswa Baru via KTM</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Tipe Captcha</label>
                      <select className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs">
                        <option>Captcha Angka & Matematika Baku SLiMS (Ringan & Cepat)</option>
                        <option>Google reCAPTCHA v2 (Checkbox "I'm not a robot")</option>
                        <option>Google reCAPTCHA v3 (Invisible Score Based)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">reCAPTCHA Public Key / Site Key</label>
                      <input type="text" placeholder="6LdXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">reCAPTCHA Private Key / Secret Key</label>
                      <input type="password" placeholder="••••••••••••••••••••••••••••••••••••••••" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                    </div>

                    <button type="submit" className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs shadow-xs">
                      Simpan Pengaturan Captcha
                    </button>
                  </form>
                </div>
              )}

              {/* ---------------- 7.11 KONTEN ---------------- */}
              {systemSubTab === 'konten' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Manajemen Konten OPAC</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola halaman informasi statis (profil, jam buka, tata tertib, fasilitas) pada portal publik</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsContentModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Konten Baru</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Judul Halaman</th>
                          <th className="p-3 font-bold text-slate-700">Alamat URL Slug</th>
                          <th className="p-3 font-bold text-slate-700">Tgl Pembaruan</th>
                          <th className="p-3 font-bold text-slate-700">Status</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {contentList.map((cnt) => (
                          <tr key={cnt.id}>
                            <td className="p-3 font-semibold text-slate-800">{cnt.judul}</td>
                            <td className="p-3 font-mono text-slate-500">{cnt.slug}</td>
                            <td className="p-3 text-slate-500">{cnt.tanggal}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">{cnt.status}</span></td>
                            <td className="p-3 text-right space-x-2">
                              <button type="button" onClick={() => alert(`Konten "${cnt.judul}" siap disunting.`)} className="text-[#0284c7] hover:underline font-semibold">Sunting</button>
                              <button type="button" onClick={() => handleDeleteContent(cnt.id)} className="text-red-600 hover:underline font-semibold">Hapus</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.12 INDEKS BIBLIO ---------------- */}
              {systemSubTab === 'indeks_biblio' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Indeks Biblio (Search Engine Index)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Membangun ulang indeks pencarian kata kunci judul, pengarang, dan subjek koleksi</p>
                  </div>

                  <div className="bg-white border rounded p-6 shadow-xs space-y-4 max-w-2xl text-xs">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 border rounded-lg">
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">Status Indeks Katalog</span>
                        <span className="text-slate-500">Total Koleksi Terdaftar: {books.length} judul</span>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                        {reindexStatus === 'done' ? '100% Terindeks' : 'Sinkron'}
                      </span>
                    </div>

                    {reindexStatus === 'indexing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>Sedang mengindeks kata kunci pencarian bibliografi...</span>
                          <span>{reindexPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div className="bg-[#0284c7] h-2.5 rounded-full transition-all duration-300" style={{ width: `${reindexPercent}%` }} />
                        </div>
                      </div>
                    )}

                    {reindexStatus === 'done' && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Pengindeksan ulang selesai! Semua data bibliografi siap dicari pada portal publik (OPAC).</span>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleStartReindex}
                        disabled={reindexStatus === 'indexing'}
                        className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold rounded text-xs flex items-center gap-2 shadow-xs"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${reindexStatus === 'indexing' ? 'animate-spin' : ''}`} />
                        <span>{reindexStatus === 'indexing' ? 'Memproses Indeks...' : 'Mulai Pengindeksan Ulang (Re-Index)'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.13 MODUL ---------------- */}
              {systemSubTab === 'modul' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Modul Sistem SLiMS</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Daftar modul aplikasi yang aktif pada bilah menu navigasi administrasi</p>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Nama Modul</th>
                          <th className="p-3 font-bold text-slate-700">Fungsi Utama</th>
                          <th className="p-3 font-bold text-slate-700">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {[
                          { name: 'Beranda', desc: 'Statistik, ringkasan koleksi, dan pintasan cepat' },
                          { name: 'Bibliografi', desc: 'Katalogisasi buku, eksemplar, label barcode, dan salin katalog MARC' },
                          { name: 'Sirkulasi', desc: 'Peminjaman, pengembalian, perpanjangan, dan reservasi koleksi' },
                          { name: 'Keanggotaan', desc: 'Registrasi mandiri KTM mahasiswa, verifikasi akun, dan cetak kartu' },
                          { name: 'Daftar Terkendali', desc: 'Otoritas pengarang, subjek katalog, penerbit, dan lokasi rak' },
                          { name: 'Inventarisasi', desc: 'Stock take koleksi fisik, laporan hilang, dan rusak' },
                          { name: 'Sistem', desc: 'Preferensi global, staf pustakawan, tema, plugin, dan cadangan' },
                          { name: 'Pelaporan', desc: 'Statistik sirkulasi, buku terpopuler, dan rekapitulasi fakultas' },
                          { name: 'Kendali Terbitan Berseri', desc: 'Jurnal ilmiah, majalah kampus, dan warta berkala UIM' }
                        ].map((m) => (
                          <tr key={m.name}>
                            <td className="p-3 font-bold text-slate-800">{m.name}</td>
                            <td className="p-3 text-slate-600">{m.desc}</td>
                            <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">Aktif</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.14 KELOMPOK PENGGUNA ---------------- */}
              {systemSubTab === 'kelompok_pengguna' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelompok Pengguna (User Groups)</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola tingkat peran dan matriks pembatasan hak akses modul petugas</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Form penambahan kelompok peran baru siap.')}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Kelompok Baru</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Nama Kelompok Peran</th>
                          <th className="p-3 font-bold text-slate-700">Cakupan Hak Akses Modul</th>
                          <th className="p-3 font-bold text-slate-700">Jumlah Staf</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {[
                          { name: 'Super Administrator', scope: 'Seluruh Modul (Akses Penuh)', count: 1 },
                          { name: 'Kepala Perpustakaan', scope: 'Pelaporan, Inventarisasi, Sistem, Monitoring', count: 1 },
                          { name: 'Pustakawan Layanan Sirkulasi', scope: 'Sirkulasi, Keanggotaan, Cetak Kartu', count: 1 },
                          { name: 'Pustakawan Pengolah Katalog', scope: 'Bibliografi, Daftar Terkendali, Label Barcode', count: 1 }
                        ].map((grp) => (
                          <tr key={grp.name}>
                            <td className="p-3 font-bold text-slate-800">{grp.name}</td>
                            <td className="p-3 text-slate-600">{grp.scope}</td>
                            <td className="p-3 font-bold text-[#0284c7]">{grp.count} Petugas</td>
                            <td className="p-3 text-right">
                              <button type="button" onClick={() => alert(`Pengaturan hak akses ${grp.name} siap diubah.`)} className="text-[#0284c7] hover:underline font-semibold">Ubah Akses</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.15 PUSTAKAWAN & PENGGUNA SISTEM ---------------- */}
              {systemSubTab === 'pustakawan' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pustakawan & Pengguna Sistem</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Kelola akun pustakawan, petugas layanan sirkulasi, dan administrator SLiMS</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStaffModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Pustakawan Baru</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Nama Lengkap</th>
                          <th className="p-3 font-bold text-slate-700">Nama Pengguna (Username)</th>
                          <th className="p-3 font-bold text-slate-700">Kelompok Pengguna</th>
                          <th className="p-3 font-bold text-slate-700">Surel Resmi</th>
                          <th className="p-3 font-bold text-slate-700">Status</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {staffList.map((st) => (
                          <tr key={st.id}>
                            <td className="p-3 font-semibold text-slate-800">{st.nama}</td>
                            <td className="p-3 font-mono text-slate-500">{st.username}</td>
                            <td className="p-3 font-medium text-[#0284c7]">{st.role}</td>
                            <td className="p-3 text-slate-500">{st.email}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${st.status === 'Aktif' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                {st.status}
                              </span>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                type="button"
                                onClick={() => handleToggleStaffStatus(st.id)}
                                className="text-slate-600 hover:text-slate-900 font-semibold"
                              >
                                {st.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                              </button>
                              {st.username !== 'admin' && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteStaff(st.id)}
                                  className="text-red-600 hover:text-red-800 font-semibold"
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.16 IMAGE MAINTENANCE ---------------- */}
              {systemSubTab === 'image_maintenance' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Image Maintenance</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Pemeliharaan, pembersihan cache thumbnail gambar cover buku, dan verifikasi berkas media</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white border rounded shadow-xs">
                      <span className="text-xs text-slate-500 block">Total Berkas Cover Buku</span>
                      <span className="text-2xl font-bold text-slate-800 mt-1 block">{books.length} Berkas</span>
                    </div>
                    <div className="p-4 bg-white border rounded shadow-xs">
                      <span className="text-xs text-slate-500 block">Cache Thumbnail Gambar</span>
                      <span className="text-2xl font-bold text-[#0284c7] mt-1 block">36 Berkas</span>
                    </div>
                    <div className="p-4 bg-white border rounded shadow-xs">
                      <span className="text-xs text-slate-500 block">Total Penggunaan Disk Media</span>
                      <span className="text-2xl font-bold text-emerald-700 mt-1 block">14.8 MB</span>
                    </div>
                  </div>

                  <div className="bg-white border rounded p-5 shadow-xs space-y-3 text-xs">
                    <h3 className="font-bold text-slate-800 text-sm">Operasi Pemeliharaan Gambar SLiMS</h3>
                    <p className="text-slate-500">Jalankan proses pembersihan cache atau verifikasi gambar yang hilang untuk menjaga performa server tetap optimal:</p>
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          alert('Cache thumbnail gambar berhasil dibersihkan dan diperbarui!');
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Bersihkan Cache Thumbnail Gambar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          alert('Pemindaian selesai: Semua gambar sampul buku terhubung dengan baik tanpa berkas rusak.');
                        }}
                        className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Pindai Berkas Gambar Rusak</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.17 PENGATURAN PEMINTAS ---------------- */}
              {systemSubTab === 'pengaturan_pemintas' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pengaturan Pemintas (Shortcuts)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Konfigurasi menu pintasan cepat yang tampil pada bilah beranda admin</p>
                  </div>

                  <form onSubmit={(e) => { e.preventDefault(); handleSaveSystemSettings(); }} className="bg-white border rounded p-5 space-y-4 text-xs max-w-2xl shadow-xs">
                    <div className="space-y-2.5">
                      {[
                        'Ubah Profil Pengguna Petugas',
                        'Verifikasi Pendaftaran KTM Mahasiswa',
                        'Tambah Bibliografi Baru',
                        'Mulai Transaksi Sirkulasi',
                        'Pencetakan Label Punggung & Barcode',
                        'Cadangan Basis Data Cepat'
                      ].map((sc) => (
                        <label key={sc} className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-700">
                          <input type="checkbox" defaultChecked />
                          <span>{sc}</span>
                        </label>
                      ))}
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs shadow-xs">
                        Simpan Pengaturan Pemintas
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ---------------- 7.18 SETELAN HARI LIBUR ---------------- */}
              {systemSubTab === 'setelan_hari_libur' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Setelan Hari Libur</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Daftar hari libur operasional perpustakaan agar sistem tidak menghitung denda pada hari libur</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsHolidayModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Tambah Hari Libur Baru</span>
                    </button>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Nama Hari Libur</th>
                          <th className="p-3 font-bold text-slate-700">Tanggal Mulai</th>
                          <th className="p-3 font-bold text-slate-700">Tanggal Berakhir</th>
                          <th className="p-3 font-bold text-slate-700">Keterangan</th>
                          <th className="p-3 font-bold text-slate-700 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {holidayList.map((h) => (
                          <tr key={h.id}>
                            <td className="p-3 font-semibold text-slate-800">{h.nama}</td>
                            <td className="p-3 font-mono text-slate-600">{h.start}</td>
                            <td className="p-3 font-mono text-slate-600">{h.end}</td>
                            <td className="p-3 text-slate-500">{h.ket}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteHoliday(h.id)}
                                className="text-red-600 hover:text-red-800 font-semibold"
                              >
                                Hapus
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ---------------- 7.19 PEMBUAT BARKOD ---------------- */}
              {systemSubTab === 'pembuat_barkod' && (
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200">
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pembuat Barkod (Barcode Generator)</h1>
                    <p className="text-xs text-slate-500 mt-0.5">Generator kode batang (barcode) eksemplar buku dan kartu anggota perpustakaan</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Formulir Konfigurasi Barcode */}
                    <div className="bg-white border rounded p-5 shadow-xs space-y-4 text-xs">
                      <h3 className="font-bold text-slate-800 text-sm">Parameter Format Barcode</h3>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Format Barcode</label>
                        <select
                          value={barcodeTestFormat}
                          onChange={(e) => setBarcodeTestFormat(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
                        >
                          <option value="Code 128">Code 128 (Standar Eksemplar SLiMS)</option>
                          <option value="Code 39">Code 39 (Alfanumerik)</option>
                          <option value="QR Code">QR Code 2D</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Prefix Kode Batang</label>
                        <input type="text" defaultValue="UIM-B-" className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono" />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Nomor Barcode Uji Coba</label>
                        <input
                          type="text"
                          value={barcodeTestValue}
                          onChange={(e) => setBarcodeTestValue(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono font-bold"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Barcode Pratinjau</span>
                      </button>
                    </div>

                    {/* Pratinjau Visual Barcode */}
                    <div className="bg-white border rounded p-6 shadow-xs flex flex-col items-center justify-center space-y-3">
                      <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Pratinjau Kode Batang</span>
                      <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center">
                        <span className="text-[11px] font-bold text-slate-700 mb-2">PERPUSTAKAAN UIM</span>
                        {/* Visual SVG Garis Barcode */}
                        <div className="flex items-center gap-[2px] h-14 px-4 bg-white border py-1 shadow-2xs">
                          {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3, 1, 2, 4, 2, 1, 3].map((w, idx) => (
                            <div key={idx} className="bg-black h-full" style={{ width: `${w * 1.5}px` }} />
                          ))}
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-900 mt-2 tracking-widest">{barcodeTestValue}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">Format: {barcodeTestFormat} • Siap dipindai Barcode Scanner</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ---------------- 7.20 CATATAN SISTEM (AUDIT TRAIL) ---------------- */}
              {systemSubTab === 'catatan_sistem' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                    <div>
                      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Catatan Sistem (Audit Trail)</h1>
                      <p className="text-xs text-slate-500 mt-0.5">Rekaman riwayat aktivitas login petugas, transaksi sirkulasi, dan konfigurasi sistem</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadJSON(systemLogs, 'slims_system_audit_logs.json')}
                        className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Log (.json)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearLogs}
                        className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Bersihkan Log</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border rounded overflow-hidden shadow-xs text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="p-3 font-bold text-slate-700">Waktu & Tanggal</th>
                          <th className="p-3 font-bold text-slate-700">Petugas</th>
                          <th className="p-3 font-bold text-slate-700">Modul</th>
                          <th className="p-3 font-bold text-slate-700">Aktivitas Sistem</th>
                          <th className="p-3 font-bold text-slate-700">Alamat IP</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-slate-700">
                        {systemLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="p-3 font-mono text-slate-500">{log.waktu}</td>
                            <td className="p-3 font-bold text-slate-800">{log.user}</td>
                            <td className="p-3 font-semibold text-[#0284c7]">{log.modul}</td>
                            <td className="p-3 text-slate-700">{log.aksi}</td>
                            <td className="p-3 font-mono text-slate-500">{log.ip}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Tombol Cadangan Basis Data Tambahan */}
                  <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-sky-900 block">Cadangan Basis Data Lengkap SLiMS</span>
                      <span className="text-sky-700">Ekspor seluruh rekaman koleksi buku, data anggota, sirkulasi, dan konfigurasi ke dalam berkas cadangan aman.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadJSON({ books, members, loans, config: systemConfig }, 'backup_perpustakaan_uim_lengkap.json')}
                      className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Cadangkan Sekarang</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 8. MODUL PELAPORAN ================= */}
          {activeNavTab === 'Pelaporan' && (
            <div className="space-y-5 max-w-6xl">
              <div className="pb-2 border-b border-slate-200">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Pelaporan & Statistik Perpustakaan</h1>
                <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas literasi, keaktifan anggota, dan sirkulasi koleksi</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border rounded-lg"><span className="text-xs text-slate-500">Total Transaksi</span><span className="text-2xl font-bold text-slate-800 block mt-1">{loans.length}</span></div>
                <div className="p-4 bg-slate-50 border rounded-lg"><span className="text-xs text-slate-500">Buku Dipinjam</span><span className="text-2xl font-bold text-amber-600 block mt-1">{totalBorrowed}</span></div>
                <div className="p-4 bg-slate-50 border rounded-lg"><span className="text-xs text-slate-500">Buku Dikembalikan</span><span className="text-2xl font-bold text-emerald-600 block mt-1">{loans.filter(l => l.status === 'dikembalikan').length}</span></div>
                <div className="p-4 bg-slate-50 border rounded-lg"><span className="text-xs text-slate-500">Total Anggota</span><span className="text-2xl font-bold text-slate-800 block mt-1">{members.length}</span></div>
              </div>

              {reportSubTab === 'populer' && (
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-2">Buku Paling Sering Dipinjam</h3>
                  <table className="w-full text-left text-xs border rounded overflow-hidden">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-3">Judul Buku</th><th className="p-3">Pengarang</th><th className="p-3">Frekuensi Pinjam</th></tr></thead>
                    <tbody className="divide-y">
                      {books.map(b => (
                        <tr key={b.id}><td className="p-3 font-semibold">{b.judul}</td><td className="p-3">{b.penulis}</td><td className="p-3 font-bold text-[#0284c7]">1x</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ================= 9. MODUL TERBITAN BERSERI ================= */}
          {activeNavTab === 'Kendali Terbitan Berseri' && (
            <div className="space-y-4 max-w-6xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kendali Terbitan Berseri (Serials)</h1>
                  <p className="text-xs text-slate-500 mt-0.5">Pengelolaan jurnal ilmiah, majalah, dan warta berkala kampus UIM</p>
                </div>
                <button
                  onClick={() => setIsSerialFormOpen(true)}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Terbitan Baru</span>
                </button>
              </div>

              <table className="w-full text-left text-xs border rounded overflow-hidden">
                <thead className="bg-[#f8fafc] text-slate-700 border-b font-bold uppercase text-[11px]">
                  <tr><th className="py-2.5 px-3">Judul Terbitan Berseri</th><th className="py-2.5 px-3">ISSN</th><th className="py-2.5 px-3">Frekuensi</th><th className="py-2.5 px-3">Volume Terakhir</th><th className="py-2.5 px-3 text-right">Status</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {serials.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 px-3 font-semibold text-slate-800">{s.judul}</td>
                      <td className="py-3 px-3 font-mono">{s.issn || '-'}</td>
                      <td className="py-3 px-3">{s.frekuensi}</td>
                      <td className="py-3 px-3">{s.volume}</td>
                      <td className="py-3 px-3 text-right"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">Aktif</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL UBAH PROFIL ADMIN ================= */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Key className="w-4 h-4" />
                <span>Ubah Profil Pengguna Pustakawan</span>
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsProfileModalOpen(false); alert('Profil Admin berhasil diperbarui!'); }} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold mb-1">Nama Tampilan Pustakawan</label>
                <input type="text" value={adminProfile.nama} onChange={(e) => setAdminProfile({ ...adminProfile, nama: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block font-bold mb-1">Email Petugas</label>
                <input type="email" value={adminProfile.email} onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block font-bold mb-1">Ganti Kata Sandi Baru (Opsional)</label>
                <input type="password" placeholder="Biarkan kosong jika tidak ingin ganti" value={adminProfile.newPassword} onChange={(e) => setAdminProfile({ ...adminProfile, newPassword: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] text-white rounded font-bold">Simpan Profil</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL PENGATURAN PEMINTAS ================= */}
      {isShortcutsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-5 border border-slate-300 text-xs text-slate-700 space-y-3">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0284c7]" />
              <span>Pengaturan Tombol Pemintas Sidebar</span>
            </h3>
            <p className="text-slate-500">Pilih modul cepat yang ingin Anda tampilkan pada sidebar pemintas utama:</p>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked /> Ubah Profil Pengguna</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked /> Verifikasi KTM Mahasiswa</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked /> Mulai Transaksi Sirkulasi</label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked /> Tambah Bibliografi Baru</label>
            </div>
            <div className="pt-3 border-t flex justify-end">
              <button onClick={() => { setIsShortcutsModalOpen(false); alert('Pengaturan pemintas disimpan.'); }} className="px-4 py-1.5 bg-[#0284c7] text-white rounded font-bold">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TEMA TAMPILAN ================= */}
      {isThemeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl p-5 border border-slate-300 text-xs text-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#0284c7]" />
                <span>Pilih Tema Tampilan SLiMS</span>
              </h3>
              <button onClick={() => setIsThemeModalOpen(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAdminTheme('blue')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 ${adminTheme === 'blue' ? 'border-[#0284c7] ring-2 ring-[#0284c7]/30 bg-sky-50' : 'hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0284c7]" />
                <span className="font-bold text-slate-800">SLiMS Biru (Default)</span>
              </button>
              <button
                onClick={() => setAdminTheme('emerald')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 ${adminTheme === 'emerald' ? 'border-[#047857] ring-2 ring-[#047857]/30 bg-emerald-50' : 'hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#047857]" />
                <span className="font-bold text-slate-800">Hijau Khas UIM</span>
              </button>
              <button
                onClick={() => setAdminTheme('indigo')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 ${adminTheme === 'indigo' ? 'border-[#4338ca] ring-2 ring-[#4338ca]/30 bg-indigo-50' : 'hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#4338ca]" />
                <span className="font-bold text-slate-800">Indigo Elegan</span>
              </button>
              <button
                onClick={() => setAdminTheme('slate')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 ${adminTheme === 'slate' ? 'border-[#334155] ring-2 ring-[#334155]/30 bg-slate-100' : 'hover:border-slate-300'}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#334155]" />
                <span className="font-bold text-slate-800">Slate Minimalis</span>
              </button>
            </div>
            <div className="pt-2 border-t flex justify-end">
              <button onClick={() => setIsThemeModalOpen(false)} className="px-4 py-1.5 bg-[#0284c7] text-white rounded font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH BIBLIOGRAFI ================= */}
      {isBookFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-xl shadow-2xl overflow-hidden border border-slate-300 max-h-[90vh] flex flex-col">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                <span>{editingBook ? 'Sunting Bibliografi' : 'Tambah Bibliografi Baru'}</span>
              </h3>
              <button onClick={() => setIsBookFormOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleBookFormSubmit} className="p-5 overflow-y-auto space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Buku <span className="text-red-500">*</span></label>
                <input type="text" required value={bookFormData.judul} onChange={(e) => setBookFormData({ ...bookFormData, judul: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Judul buku lengkap..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Nama Pengarang <span className="text-red-500">*</span></label>
                  <input type="text" required value={bookFormData.penulis} onChange={(e) => setBookFormData({ ...bookFormData, penulis: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Nama pengarang..." />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Klasifikasi / Subjek</label>
                  <select value={bookFormData.kategori} onChange={(e) => setBookFormData({ ...bookFormData, kategori: e.target.value })} className="w-full px-3 py-2 border rounded">
                    <option value="Ilmu-ilmu Sosial">Ilmu-ilmu Sosial</option>
                    <option value="Kesusastraan">Kesusastraan</option>
                    <option value="Ilmu-ilmu Terapan">Ilmu-ilmu Terapan</option>
                    <option value="Kesenian, Hiburan, dan Olahraga">Kesenian, Hiburan, dan Olahraga</option>
                    <option value="Studi Islam">Studi Islam</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">ISBN / ISSN</label>
                  <input type="text" value={bookFormData.isbn} onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Contoh: 978602..." />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Jumlah Eksemplar</label>
                  <input type="number" min={1} value={bookFormData.salin} onChange={(e) => setBookFormData({ ...bookFormData, salin: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">URL Cover Buku (Opsional)</label>
                <input type="url" value={bookFormData.cover_url} onChange={(e) => setBookFormData({ ...bookFormData, cover_url: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="https://..." />
              </div>
              <div className="pt-2 flex items-center gap-2">
                <input type="checkbox" id="promote-check" checked={bookFormData.isPromoted} onChange={(e) => setBookFormData({ ...bookFormData, isPromoted: e.target.checked })} />
                <label htmlFor="promote-check" className="font-semibold cursor-pointer">Promosikan ke Beranda OPAC Publik</label>
              </div>
              <div className="pt-4 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsBookFormOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] text-white rounded font-bold hover:bg-[#0369a1]">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL CATAT PEMINJAMAN ================= */}
      {isLoanFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Repeat className="w-5 h-5" />
                <span>Transaksi Peminjaman Baru</span>
              </h3>
              <button onClick={() => setIsLoanFormOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateLoanSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor KTM / NIM Peminjam <span className="text-red-500">*</span></label>
                <input type="text" required value={loanNim} onChange={(e) => setLoanNim(e.target.value)} placeholder="Contoh: 2024010012" className="w-full px-3 py-2 border rounded font-mono" />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Pilih Koleksi Buku <span className="text-red-500">*</span></label>
                <select required value={loanBookId} onChange={(e) => setLoanBookId(e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option value="">-- Pilih Buku yang Dipinjam --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.judul} ({b.penulis})</option>
                  ))}
                </select>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsLoanFormOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] text-white rounded font-bold hover:bg-[#0369a1]">Proses Peminjaman</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH ANGGOTA ================= */}
      {isMemberFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Users className="w-5 h-5" />
                <span>Tambah Anggota Perpustakaan</span>
              </h3>
              <button onClick={() => setIsMemberFormOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddMemberSubmit} className="p-5 space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nomor KTM / NIM <span className="text-red-500">*</span></label>
                <input type="text" required value={newMemberData.nim} onChange={(e) => setNewMemberData({ ...newMemberData, nim: e.target.value })} className="w-full px-3 py-2 border rounded font-mono" placeholder="NIM mahasiswa..." />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                <input type="text" required value={newMemberData.nama} onChange={(e) => setNewMemberData({ ...newMemberData, nama: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Nama sesuai KTM..." />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Program Studi</label>
                <input type="text" value={newMemberData.prodi} onChange={(e) => setNewMemberData({ ...newMemberData, prodi: e.target.value })} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Email</label>
                <input type="email" value={newMemberData.email} onChange={(e) => setNewMemberData({ ...newMemberData, email: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="nama@student.uim.ac.id" />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsMemberFormOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] text-white rounded font-bold hover:bg-[#0369a1]">Simpan & Aktifkan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH TERBITAN BERSERI ================= */}
      {isSerialFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Newspaper className="w-5 h-5" />
                <span>Tambah Terbitan Berseri (Jurnal)</span>
              </h3>
              <button onClick={() => setIsSerialFormOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newSerialData.judul.trim()) return;
              setSerials([...serials, { id: Date.now(), ...newSerialData }]);
              setIsSerialFormOpen(false);
              setNewSerialData({ judul: '', issn: '', frekuensi: 'Semesteran', volume: 'Vol. 1 No. 1' });
              alert('Terbitan berseri baru berhasil dicatat!');
            }} className="p-5 space-y-3 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Terbitan / Jurnal <span className="text-red-500">*</span></label>
                <input type="text" required value={newSerialData.judul} onChange={(e) => setNewSerialData({ ...newSerialData, judul: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Contoh: Jurnal Inovasi Teknologi UIM" />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">ISSN</label>
                <input type="text" value={newSerialData.issn} onChange={(e) => setNewSerialData({ ...newSerialData, issn: e.target.value })} className="w-full px-3 py-2 border rounded" placeholder="Contoh: 2548-xxxx" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Frekuensi Terbit</label>
                  <select value={newSerialData.frekuensi} onChange={(e) => setNewSerialData({ ...newSerialData, frekuensi: e.target.value })} className="w-full px-3 py-2 border rounded">
                    <option value="Bulanan">Bulanan</option>
                    <option value="Triwulanan">Triwulanan</option>
                    <option value="Semesteran">Semesteran</option>
                    <option value="Tahunan">Tahunan</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Volume / No. Terakhir</label>
                  <input type="text" value={newSerialData.volume} onChange={(e) => setNewSerialData({ ...newSerialData, volume: e.target.value })} className="w-full px-3 py-2 border rounded" />
                </div>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsSerialFormOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] text-white rounded font-bold hover:bg-[#0369a1]">Simpan Terbitan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL REGISTRASI SITUS SLIMS ================= */}
      {isSiteRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300 text-xs">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>Registrasi Node SLiMS Resmi</span>
              </h3>
              <button onClick={() => setIsSiteRegisterModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 space-y-3.5 text-slate-700">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">Situs perpustakaan ini telah terdaftar di direktori SLiMS Community Indonesia.</span>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">ID Registrasi Node SLiMS</label>
                <input
                  type="text"
                  value={siteRegisterInfo.registrationId}
                  onChange={(e) => setSiteRegisterInfo({ ...siteRegisterInfo, registrationId: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono font-bold bg-slate-50"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lembaga / Perguruan Tinggi</label>
                <input
                  type="text"
                  value={siteRegisterInfo.institution}
                  onChange={(e) => setSiteRegisterInfo({ ...siteRegisterInfo, institution: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">URL Layanan Publik (OPAC)</label>
                <input
                  type="text"
                  value={siteRegisterInfo.serverUrl}
                  onChange={(e) => setSiteRegisterInfo({ ...siteRegisterInfo, serverUrl: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSiteRegisterModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded font-bold"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSiteRegisterModalOpen(false);
                    alert('Data registrasi SLiMS berhasil diperbarui!');
                  }}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH STAF PUSTAKAWAN ================= */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300 text-xs">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Tambah Pustakawan / Petugas Baru</span>
              </h3>
              <button onClick={() => setIsStaffModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStaffSubmit} className="p-5 space-y-3 text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Fatimah, S.I.Pust."
                  value={newStaff.nama}
                  onChange={(e) => setNewStaff({ ...newStaff, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Pengguna (Username) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="fatimah"
                  value={newStaff.username}
                  onChange={(e) => setNewStaff({ ...newStaff, username: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Alamat Surel</label>
                <input
                  type="email"
                  placeholder="fatimah@uim.ac.id"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kelompok Peran / Hak Akses</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Pustakawan Sirkulasi">Pustakawan Sirkulasi & Layanan</option>
                  <option value="Pustakawan Kataloger">Pustakawan Kataloger (Pengolah)</option>
                  <option value="Kepala Perpustakaan">Kepala Perpustakaan (Supervisor)</option>
                  <option value="Super Administrator">Super Administrator</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Kata Sandi Awal</label>
                <input
                  type="password"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold shadow-xs">Simpan Petugas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH HARI LIBUR ================= */}
      {isHolidayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300 text-xs">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Tambah Hari Libur Operasional</span>
              </h3>
              <button onClick={() => setIsHolidayModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddHoliday} className="p-5 space-y-3 text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Hari Libur / Keterangan <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Libur Awal Ramadhan 1447 H"
                  value={newHoliday.nama}
                  onChange={(e) => setNewHoliday({ ...newHoliday, nama: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Mulai <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={newHoliday.start}
                    onChange={(e) => setNewHoliday({ ...newHoliday, start: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Tanggal Berakhir</label>
                  <input
                    type="date"
                    value={newHoliday.end}
                    onChange={(e) => setNewHoliday({ ...newHoliday, end: e.target.value })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Jenis Hari Libur</label>
                <select
                  value={newHoliday.ket}
                  onChange={(e) => setNewHoliday({ ...newHoliday, ket: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Libur Nasional">Libur Nasional</option>
                  <option value="Libur Hari Raya Keagamaan">Libur Hari Raya Keagamaan</option>
                  <option value="Libur Akademik Kampus">Libur Akademik Kampus UIM</option>
                  <option value="Cuti Bersama">Cuti Bersama</option>
                </select>
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsHolidayModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold shadow-xs">Simpan Hari Libur</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH RUAS TAMBAHAN ================= */}
      {isCustomFieldModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-300 text-xs">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Tambah Ruas Tambahan (Custom Field)</span>
              </h3>
              <button onClick={() => setIsCustomFieldModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddCustomField} className="p-5 space-y-3 text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Label Ruas (Teks Tampilan) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Nomor Induk Dosen (NIDN)"
                  value={newCustomField.label}
                  onChange={(e) => setNewCustomField({ ...newCustomField, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Nama Field Kolom Database <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="nidn_dosen"
                  value={newCustomField.field}
                  onChange={(e) => setNewCustomField({ ...newCustomField, field: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  className="w-full px-3 py-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tabel / Modul Sasaran</label>
                <select
                  value={newCustomField.target}
                  onChange={(e) => setNewCustomField({ ...newCustomField, target: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Bibliografi">Bibliografi (Katalog Buku)</option>
                  <option value="Keanggotaan">Keanggotaan (Data Mahasiswa)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Tipe Data</label>
                <select
                  value={newCustomField.type}
                  onChange={(e) => setNewCustomField({ ...newCustomField, type: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="Teks Bebas">Teks Bebas</option>
                  <option value="Pilihan Teks">Pilihan Dropdown</option>
                  <option value="URL / Tautan">URL / Tautan Web</option>
                  <option value="Angka Numerik">Angka Numerik</option>
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={newCustomField.required}
                  onChange={(e) => setNewCustomField({ ...newCustomField, required: e.target.checked })}
                />
                <span>Wajib diisi pada saat penginputan data</span>
              </label>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsCustomFieldModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold shadow-xs">Simpan Ruas</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL TAMBAH KONTEN OPAC ================= */}
      {isContentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-300 text-xs">
            <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Tambah Konten Halaman OPAC</span>
              </h3>
              <button onClick={() => setIsContentModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddContentSubmit} className="p-5 space-y-3 text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Judul Halaman Informasi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Layanan Bebas Pustaka Online"
                  value={newContent.judul}
                  onChange={(e) => {
                    const val = e.target.value;
                    const slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
                    setNewContent({ ...newContent, judul: val, slug });
                  }}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Slug URL <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="bebas-pustaka-online"
                  value={newContent.slug}
                  onChange={(e) => setNewContent({ ...newContent, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Isi Artikel / Konten Informasi</label>
                <textarea
                  rows={5}
                  placeholder="Tuliskan isi informasi lengkap di sini..."
                  value={newContent.isi}
                  onChange={(e) => setNewContent({ ...newContent, isi: e.target.value })}
                  className="w-full px-3 py-2 border rounded text-xs"
                />
              </div>
              <div className="pt-3 border-t flex justify-end gap-2">
                <button type="button" onClick={() => setIsContentModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded font-bold">Batal</button>
                <button type="submit" className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded font-bold shadow-xs">Terbitkan Konten</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
