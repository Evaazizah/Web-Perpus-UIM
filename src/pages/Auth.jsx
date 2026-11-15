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
  Check
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
    }
  }, [isOpen, initialMode, initialRole]);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setPendingNotice(null);
    setRegisteredSuccess(null);
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
            nim,
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
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
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
        onAuthSuccess(newDosen);
        onClose();
      } else {
        const user = await loginUser(nidn || dosenEmail, dosenPassword);
        onAuthSuccess(user);
        onClose();
      }
    } catch (err) {
      console.warn('Auth dosen error:', err);
      let msg = err.message || 'Terjadi kesalahan autentikasi Dosen.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#064e3b] border-2 border-emerald-400 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <UimLogo className="w-14 h-14 mx-auto mb-2 drop-shadow" />
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wide">
            Area Anggota Digilib UIM
          </h2>
          <p className="text-xs text-emerald-200 mt-1">
            Portal Layanan Sirkulasi & Perpustakaan Digital UIM
          </p>
        </div>

        {/* TAB ROLE SELECTOR: Mahasiswa vs Dosen vs Admin */}
        <div className="grid grid-cols-3 gap-1 bg-[#022c22] p-1.5 rounded-2xl mb-6 border border-emerald-700/60">
          {/* 1. Tab Mahasiswa */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('mahasiswa');
              resetForm();
            }}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              roleTab === 'mahasiswa'
                ? 'bg-[#047857] text-white shadow-md'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4 shrink-0" />
            <span>Mahasiswa</span>
          </button>

          {/* 2. Tab Dosen */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('dosen');
              resetForm();
            }}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              roleTab === 'dosen'
                ? 'bg-[#10b981] text-slate-950 font-black shadow-md'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
            <span>Dosen UIM</span>
          </button>

          {/* 3. Tab Admin / Pustakawan */}
          <button
            type="button"
            onClick={() => {
              setRoleTab('admin');
              resetForm();
            }}
            className={`py-2 px-1 rounded-xl text-[11px] sm:text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 transition-all ${
              roleTab === 'admin'
                ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pustakawan</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/20 border border-red-400 flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PENDING VERIFICATION NOTICE */}
        {pendingNotice && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-500/20 border-2 border-amber-400 text-xs text-amber-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>Status: Menunggu Verifikasi Admin</span>
            </div>
            <p className="leading-relaxed">
              Akun Mahasiswa dengan <strong>NIM {pendingNotice.nim}</strong> ({pendingNotice.nama}) belum diaktifkan oleh admin.
            </p>
            <div className="p-2.5 bg-black/30 rounded-xl text-[11px] text-emerald-200 leading-snug">
              💡 <strong>Langkah Aktivasi:</strong> Silakan datangi Meja Sirkulasi Perpustakaan Pusat UIM atau verifikasi melalui panel admin pustakawan.
            </div>
          </div>
        )}

        {/* REGISTRATION SUCCESS CONFIRMATION MAHASISWA */}
        {registeredSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-amber-400/20 border-2 border-amber-400 text-amber-300 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Pendaftaran Berhasil Diajukan!
              </h3>
              <p className="text-xs text-emerald-200 mt-1 leading-relaxed">
                Nomor KTM / NIM: <span className="font-mono font-bold text-amber-300">{registeredSuccess.nim}</span>
              </p>
            </div>
            <div className="bg-[#022c22] p-4 rounded-2xl border border-emerald-700/60 text-left text-xs space-y-2 text-emerald-100">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Clock className="w-4 h-4" />
                <span>Tahap Verifikasi Petugas</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Data KTM Anda telah masuk ke antrean verifikasi perpustakaan. Akun akan aktif setelah staf Pustakawan UIM melakukan verifikasi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRegisteredSuccess(null);
                setStudentMode('login');
              }}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow"
            >
              Kembali ke Menu Masuk
            </button>
          </div>
        ) : roleTab === 'mahasiswa' ? (
          /* ================= FORM MAHASISWA (KTM) ================= */
          <div>
            {/* Mode Switch: Masuk vs Daftar Baru */}
            <div className="flex border-b border-emerald-800/80 mb-5">
              <button
                type="button"
                onClick={() => {
                  setStudentMode('login');
                  resetForm();
                }}
                className={`pb-2 mr-6 text-xs font-bold uppercase tracking-wider transition-colors ${
                  studentMode === 'login'
                    ? 'text-amber-300 border-b-2 border-amber-400'
                    : 'text-emerald-300/60 hover:text-white'
                }`}
              >
                Masuk dengan KTM
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudentMode('register');
                  resetForm();
                }}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  studentMode === 'register'
                    ? 'text-amber-300 border-b-2 border-amber-400'
                    : 'text-emerald-300/60 hover:text-white'
                }`}
              >
                Daftar Mahasiswa Baru
              </button>
            </div>

            {/* Info Mahasiswa */}
            <div className="mb-4 p-3 rounded-2xl bg-[#022c22] border border-emerald-700/60 flex items-start gap-2.5 text-xs text-emerald-100">
              <CreditCard className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                {studentMode === 'login'
                  ? 'Gunakan Nomor Pokok Mahasiswa (NIM) Anda yang telah terverifikasi.'
                  : 'Mahasiswa baru wajib mendaftarkan nomor KTM/NIM untuk aktivasi kartu perpustakaan digital.'}
              </div>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              {studentMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Nama Lengkap Mahasiswa
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        placeholder="Nama sesuai Kartu Mahasiswa"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Program Studi / Fakultas
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <select
                        value={prodi}
                        onChange={(e) => setProdi(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400 cursor-pointer"
                      >
                        {UIM_PRODI_LIST.map((p) => (
                          <option key={p} value={p} className="bg-[#022c22] text-white">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Email Mahasiswa
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contoh: nama@student.uim.ac.id"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Nomor KTM / NIM
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 2023010045"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50"
              >
                {loading
                  ? 'Memproses...'
                  : studentMode === 'register'
                  ? 'Ajukan Pendaftaran Anggota (KTM)'
                  : 'Masuk dengan Nomor KTM'}
              </button>
            </form>
          </div>
        ) : roleTab === 'dosen' ? (
          /* ================= FORM DOSEN SIVITAS UIM ================= */
          <div>
            {/* Mode Switch Dosen */}
            <div className="flex border-b border-emerald-800/80 mb-5">
              <button
                type="button"
                onClick={() => {
                  setDosenMode('login');
                  resetForm();
                }}
                className={`pb-2 mr-6 text-xs font-bold uppercase tracking-wider transition-colors ${
                  dosenMode === 'login'
                    ? 'text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-300/60 hover:text-white'
                }`}
              >
                Masuk sebagai Dosen
              </button>
              <button
                type="button"
                onClick={() => {
                  setDosenMode('register');
                  resetForm();
                }}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  dosenMode === 'register'
                    ? 'text-emerald-300 border-b-2 border-emerald-400'
                    : 'text-emerald-300/60 hover:text-white'
                }`}
              >
                Daftar Dosen Baru
              </button>
            </div>

            {/* Banner Dosen */}
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-900/60 border border-emerald-500/50 flex items-start gap-2.5 text-xs text-emerald-100">
              <Award className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-emerald-300">Akses Dosen Sivitas UIM</p>
                <p className="text-[11px] text-emerald-200 mt-0.5 leading-relaxed">
                  Akun Dosen diverifikasi langsung otomatis untuk peminjaman referensi riset, akses repositori, dan pengajuan uji kemiripan Turnitin.
                </p>
              </div>
            </div>

            <form onSubmit={handleDosenSubmit} className="space-y-3.5">
              {dosenMode === 'register' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Nama Lengkap & Gelar Akademik
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={dosenNama}
                        onChange={(e) => setDosenNama(e.target.value)}
                        placeholder="Contoh: Dr. H. Ahmad Fawaid, M.Pd.I"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Homebase Fakultas / Program Studi
                    </label>
                    <div className="relative">
                      <BookOpen className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <select
                        value={dosenProdi}
                        onChange={(e) => setDosenProdi(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 cursor-pointer"
                      >
                        {UIM_PRODI_LIST.map((p) => (
                          <option key={p} value={p} className="bg-[#022c22] text-white">
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                      Email Resmi Dosen UIM
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        value={dosenEmail}
                        onChange={(e) => setDosenEmail(e.target.value)}
                        placeholder="contoh: dosen@uim.ac.id"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Nomor NIDN / NIP Dosen
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={nidn}
                    onChange={(e) => setNidn(e.target.value)}
                    placeholder="Contoh: 0715088201 / NIP"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={dosenPassword}
                    onChange={(e) => setDosenPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 bg-[#10b981] hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50"
              >
                {loading
                  ? 'Memproses Autentikasi...'
                  : dosenMode === 'register'
                  ? 'Daftarkan Akun Dosen UIM'
                  : 'Masuk sebagai Dosen Sivitas'}
              </button>
            </form>
          </div>
        ) : (
          /* ================= FORM ADMIN / PUSTAKAWAN ================= */
          <div>
            {/* Box Petunjuk Masuk Admin dengan Kredensial Jelas */}
            <div className="mb-5 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400/80 text-xs text-amber-100 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                <KeyRound className="w-4 h-4" />
                <span>Petunjuk Kredensial Administrator</span>
              </div>
              <p className="text-[11px] text-amber-100 leading-relaxed">
                Gunakan kredensial resmi staf perpustakaan berikut untuk login ke Dashboard Admin:
              </p>
              
              <div className="bg-[#022c22] p-3 rounded-xl border border-emerald-700/60 font-mono text-[11px] space-y-1">
                <div className="flex justify-between items-center text-emerald-200">
                  <span>Username:</span>
                  <span className="font-bold text-amber-300">admin</span>
                  <span className="text-emerald-400 text-[10px]">(atau admin@uim.ac.id)</span>
                </div>
                <div className="flex justify-between items-center text-emerald-200">
                  <span>Kata Sandi:</span>
                  <span className="font-bold text-amber-300">admin123</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFillDefaultAdmin}
                className="w-full py-1.5 px-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 font-bold rounded-lg border border-amber-400/50 text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Isi Otomatis Kredensial Admin Default</span>
              </button>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Username / Email Petugas
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin atau admin@uim.ac.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Kata Sandi Petugas
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="admin123"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Memverifikasi Hak Akses...' : 'Masuk sebagai Pustakawan (Admin)'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
