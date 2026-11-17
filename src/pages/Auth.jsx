import React, { useState, useEffect } from 'react';
import UimLogo from '../components/UimLogo';
import { registerMember, registerDosen, loginUser, loginAdmin } from '../lib/authService';
import {
  X,
  Lock,
  User,
  CreditCard,
  GraduationCap,
  Mail,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
  Award,
  BookOpen,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  Zap
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

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
  initialRole = 'mahasiswa'
}) {
  // roleTab: 'mahasiswa' | 'dosen' | 'admin'
  const [roleTab, setRoleTab] = useState(initialRole);
  
  // Mahasiswa mode: 'login' | 'register'
  const [studentMode, setStudentMode] = useState(initialMode);
  
  // Dosen mode: 'login' | 'register'
  const [dosenMode, setDosenMode] = useState('login');

  // Input states Mahasiswa
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState(UIM_PRODI_LIST[0]);
  const [email, setEmail] = useState('');

  // Input states Dosen
  const [nidn, setNidn] = useState('');
  const [dosenNama, setDosenNama] = useState('');
  const [dosenProdi, setDosenProdi] = useState(UIM_PRODI_LIST[0]);
  const [dosenEmail, setDosenEmail] = useState('');
  const [dosenPassword, setDosenPassword] = useState('');

  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStudentMode(initialMode);
      setRoleTab(initialRole);
      setErrorMsg('');
      setPendingNotice(null);
      setRegisteredSuccess(null);
      setShowPassword(false);
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setPendingNotice(null);
    setRegisteredSuccess(null);
    setShowPassword(false);
  };

  const handleFillDefaultAdmin = () => {
    setAdminUsername('admin');
    setAdminPassword('admin123');
    setErrorMsg('');
  };

  // Submit Login / Register Mahasiswa
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setPendingNotice(null);

    try {
      if (studentMode === 'register') {
        const newStudent = await registerMember({
          nim,
          nama,
          prodi,
          email: email || `${nim.trim()}@student.uim.ac.id`,
          password
        });
        setRegisteredSuccess(newStudent);
      } else {
        const user = await loginUser(nim, password);
        if (user.status_verifikasi === 'pending') {
          setPendingNotice({
            role: 'mahasiswa',
            nim: user.nim || nim,
            nama: user.nama || user.nama_lengkap || 'Mahasiswa'
          });
        } else {
          onAuthSuccess(user);
          onClose();
        }
      }
    } catch (err) {
      console.warn('Auth student error:', err);
      let msg = err.message || 'Terjadi kesalahan autentikasi.';
      if (err.code === 'auth/configuration-not-found' || (msg && msg.includes('configuration-not-found'))) {
        msg = 'Koneksi autentikasi disinkronkan secara otomatis. Silakan coba kembali.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'NIM atau kata sandi tidak cocok. Pastikan akun Anda sudah terdaftar.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Nomor KTM / Email ini sudah pernah didaftarkan.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Login / Register Dosen
  const handleDosenSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (dosenMode === 'register') {
        const newDosen = await registerDosen({
          nidn,
          nama: dosenNama,
          prodi: dosenProdi,
          email: dosenEmail || `${nidn.trim()}@uim.ac.id`,
          password: dosenPassword
        });
        setRegisteredSuccess(newDosen);
      } else {
        const user = await loginUser(nidn || dosenEmail, dosenPassword);
        if (user.status_verifikasi === 'pending') {
          setPendingNotice({
            role: 'dosen',
            nidn: user.nidn || user.nim || nidn,
            nama: user.nama || user.nama_lengkap || dosenNama || 'Dosen UIM'
          });
        } else {
          onAuthSuccess(user);
          onClose();
        }
      }
    } catch (err) {
      console.warn('Auth dosen error:', err);
      let msg = err.message || 'Terjadi kesalahan autentikasi Dosen.';
      if (err.code === 'auth/configuration-not-found' || (msg && msg.includes('configuration-not-found'))) {
        msg = 'Koneksi autentikasi Dosen disinkronkan secara otomatis. Silakan coba kembali.';
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'NIDN/NIP atau kata sandi tidak cocok. Pastikan Anda sudah terdaftar.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'NIDN atau Email ini sudah terdaftar.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Kata sandi minimal 6 karakter.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  // Submit Login Admin (Pustakawan)
  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const adminUser = await loginAdmin(adminUsername, adminPassword);
      onAuthSuccess(adminUser);
      onClose();
    } catch (err) {
      console.warn('Auth admin error:', err);
      let msg = err.message || 'Kredensial admin salah.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      {/* Modal Container: Bersih, Rapi, Header Permanen, Tidak Terpotong */}
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[88vh] my-auto animate-scaleUp text-slate-800">
        
        {/* ================= HEADER MODAL (HIJAU UIM, SELALU TERLIHAT) ================= */}
        <div className="bg-[#064e3b] text-white p-5 sm:p-6 relative shrink-0">
          {/* Close Button X (Selalu Terlihat di Pojok Atas) */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Tutup Jendela"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <UimLogo className="w-11 h-11 shrink-0 drop-shadow" />
            <div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-wide leading-tight">
                Area Masuk & Anggota Perpustakaan
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Universitas Islam Madura • Portal SLiMS 9 & OPAC
              </p>
            </div>
          </div>
        </div>

        {/* ================= TAB SELECTOR PERAN: Mahasiswa | Dosen | Pustakawan ================= */}
        <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 shrink-0 gap-1 text-xs">
          {/* 1. Tab Mahasiswa */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('mahasiswa');
              resetForm();
            }}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'mahasiswa'
                ? 'bg-[#047857] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Mahasiswa</span>
          </button>

          {/* 2. Tab Dosen */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('dosen');
              resetForm();
            }}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'dosen'
                ? 'bg-[#047857] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Dosen UIM</span>
          </button>

          {/* 3. Tab Pustakawan (Admin) */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('admin');
              resetForm();
            }}
            className={`py-2 px-2 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'admin'
                ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pustakawan</span>
          </button>
        </div>

        {/* ================= ISI KONTEN MODAL (BISA DI-SCROLL MULUS) ================= */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* PENDING VERIFICATION NOTICE */}
          {pendingNotice && (
            <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800 text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Status: Menunggu Verifikasi Staf Pustakawan</span>
              </div>
              <p className="leading-relaxed">
                Akun {pendingNotice.role === 'dosen' ? 'Dosen UIM' : 'Mahasiswa'} dengan{' '}
                <strong>{pendingNotice.role === 'dosen' ? 'NIDN/NIP ' + (pendingNotice.nidn || pendingNotice.nim) : 'NIM ' + pendingNotice.nim}</strong> ({pendingNotice.nama}) saat ini <strong>belum disetujui</strong> oleh staf perpustakaan.
              </p>
              <div className="p-2.5 bg-amber-100/70 rounded-xl text-[11px] text-amber-900 leading-snug">
                💡 <strong>Langkah Aktivasi:</strong> Silakan hubungi Meja Sirkulasi Perpustakaan Pusat UIM atau login sebagai Admin (Pustakawan) untuk menyetujui dan mengaktifkan keanggotaan ini di Dashboard SLiMS.
              </div>
            </div>
          )}

          {/* REGISTRATION SUCCESS CONFIRMATION */}
          {registeredSuccess ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-14 h-14 bg-amber-100 border-2 border-amber-400 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {registeredSuccess.role === 'dosen'
                    ? 'Pendaftaran Akun Dosen Berhasil Diajukan!'
                    : 'Pendaftaran Mahasiswa Berhasil Diajukan!'}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {registeredSuccess.role === 'dosen' ? 'Nomor NIDN / NIP Dosen: ' : 'Nomor Pokok Mahasiswa (NIM): '}
                  <strong className="text-emerald-800 font-mono">
                    {registeredSuccess.nidn || registeredSuccess.nim}
                  </strong>
                  {' • '}{registeredSuccess.nama}
                </p>
              </div>
              <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200 text-left text-xs space-y-1.5 text-amber-950">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Tahap Verifikasi Wajib Staf Pustakawan</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Sesuai kebijakan perpustakaan UIM, seluruh pendaftar baru (Mahasiswa maupun Dosen) wajib diverifikasi oleh staf Pustakawan sebelum dapat login dan melakukan peminjaman buku. Data Anda telah masuk ke antrean verifikasi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const wasDosen = registeredSuccess.role === 'dosen';
                  setRegisteredSuccess(null);
                  if (wasDosen) {
                    setDosenMode('login');
                  } else {
                    setStudentMode('login');
                  }
                }}
                className="w-full py-2.5 bg-[#064e3b] hover:bg-[#043d30] text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Kembali ke Menu Masuk
              </button>
            </div>
          ) : roleTab === 'mahasiswa' ? (
            /* ========================================================= */
            /* ================= TAB 1: FORM MAHASISWA ================= */
            /* ========================================================= */
            <div className="space-y-4">
              {/* Switcher Mode Mahasiswa */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('login');
                    resetForm();
                  }}
                  className={`pb-2 mr-5 text-xs font-bold transition-all ${
                    studentMode === 'login'
                      ? 'text-[#047857] border-b-2 border-[#047857]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Masuk dengan NIM / KTM
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStudentMode('register');
                    resetForm();
                  }}
                  className={`pb-2 text-xs font-bold transition-all ${
                    studentMode === 'register'
                      ? 'text-[#047857] border-b-2 border-[#047857]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Daftar Anggota Baru
                </button>
              </div>

              {/* Panduan Singkat Mahasiswa */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-900">
                <CreditCard className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {studentMode === 'login'
                    ? 'Masukkan Nomor Pokok Mahasiswa (NIM) dan kata sandi akun Anda yang telah terverifikasi.'
                    : 'Mahasiswa baru wajib mendaftarkan nomor KTM/NIM untuk aktivasi kartu perpustakaan digital.'}
                </div>
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-3">
                {studentMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Lengkap Mahasiswa <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Nama lengkap sesuai Kartu Mahasiswa"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Program Studi / Fakultas
                      </label>
                      <div className="relative">
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <select
                          value={prodi}
                          onChange={(e) => setProdi(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white cursor-pointer"
                        >
                          {UIM_PRODI_LIST.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Alamat Email (Opsional)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contoh: nama@student.uim.ac.id"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor Pokok Mahasiswa (NIM) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={nim}
                      onChange={(e) => setNim(e.target.value)}
                      placeholder="Contoh: 2024101001"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#047857] hover:bg-[#065f46] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>
                    {loading
                      ? 'Memproses...'
                      : studentMode === 'register'
                      ? 'Ajukan Pendaftaran Anggota Baru'
                      : 'Masuk Area Anggota Mahasiswa'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : roleTab === 'dosen' ? (
            /* ===================================================== */
            /* ================= TAB 2: FORM DOSEN ================= */
            /* ===================================================== */
            <div className="space-y-4">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setDosenMode('login');
                    resetForm();
                  }}
                  className={`pb-2 mr-5 text-xs font-bold transition-all ${
                    dosenMode === 'login'
                      ? 'text-[#047857] border-b-2 border-[#047857]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Masuk Dosen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDosenMode('register');
                    resetForm();
                  }}
                  className={`pb-2 text-xs font-bold transition-all ${
                    dosenMode === 'register'
                      ? 'text-[#047857] border-b-2 border-[#047857]'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Daftar Akun Dosen
                </button>
              </div>

              {/* Panduan Singkat Dosen */}
              <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-2.5 text-xs text-purple-900">
                <Award className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  {dosenMode === 'login'
                    ? 'Gunakan Nomor Induk Dosen Nasional (NIDN) atau email resmi UIM dan kata sandi Anda.'
                    : 'Pendaftaran khusus dosen dan tenaga pendidik Universitas Islam Madura.'}
                </div>
              </div>

              <form onSubmit={handleDosenSubmit} className="space-y-3">
                {dosenMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Lengkap & Gelar <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={dosenNama}
                          onChange={(e) => setDosenNama(e.target.value)}
                          placeholder="Contoh: Dr. H. Ahmad Fawaid, M.Pd.I"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Homebase Fakultas / Program Studi
                      </label>
                      <div className="relative">
                        <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <select
                          value={dosenProdi}
                          onChange={(e) => setDosenProdi(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white cursor-pointer"
                        >
                          {UIM_PRODI_LIST.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Email Resmi Dosen
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={dosenEmail}
                          onChange={(e) => setDosenEmail(e.target.value)}
                          placeholder="contoh: dosen@uim.ac.id"
                          className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Nomor NIDN / NIP Dosen <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={nidn}
                      onChange={(e) => setNidn(e.target.value)}
                      placeholder="Contoh: 0715088201 / NIP"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kata Sandi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={dosenPassword}
                      onChange={(e) => setDosenPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#047857] focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <span>
                    {loading
                      ? 'Memproses...'
                      : dosenMode === 'register'
                      ? 'Daftarkan Akun Dosen'
                      : 'Masuk sebagai Dosen Sivitas'}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          ) : (
            /* ============================================================= */
            /* ================= TAB 3: FORM ADMIN / PUSTAKAWAN ============= */
            /* ============================================================= */
            <div className="space-y-4">
              
              {/* ================= PANDUAN KREDENSIAL RESMI ADMIN ================= */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs sm:text-sm">
                    <KeyRound className="w-4 h-4 text-amber-600" />
                    <span>Panduan Kredensial Administrator</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold text-[10px]">
                    SLiMS 9 Admin
                  </span>
                </div>

                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Khusus petugas perpustakaan untuk mengelola katalog SLiMS, sirkulasi buku, verifikasi anggota, dan penyiaran warta.
                </p>

                {/* Box Nilai Kredensial Bawaan */}
                <div className="bg-white p-3 rounded-xl border border-amber-200 font-mono text-xs space-y-1 shadow-2xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-sans font-semibold text-[11px]">Username:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">admin</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-500 font-sans font-semibold text-[11px]">Kata Sandi:</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">admin123</span>
                  </div>
                </div>

                {/* Tombol Isi Otomatis 1-Klik */}
                <button
                  type="button"
                  onClick={handleFillDefaultAdmin}
                  className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Isi Otomatis Kredensial Admin Default</span>
                </button>
              </div>

              {/* Formulir Input Admin */}
              <form onSubmit={handleAdminSubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Username / Email Petugas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      placeholder="admin"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Kata Sandi Petugas <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="admin123"
                      className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 bg-[#064e3b] hover:bg-[#043d30] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>{loading ? 'Memverifikasi Hak Akses...' : 'Masuk Dashboard Pustakawan (Admin)'}</span>
                </button>
              </form>

            </div>
          )}

        </div>

        {/* ================= FOOTER MODAL (IDENTITAS RESMI UIM) ================= */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-500 shrink-0">
          <span>UPT Perpustakaan Universitas Islam Madura • Gedung Pusat Bettet</span>
        </div>

      </div>
    </div>
  );
}
