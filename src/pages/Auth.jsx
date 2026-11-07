import React, { useState } from 'react';
import UimLogo from '../components/UimLogo';
import {
  authenticateStudent,
  authenticateAdmin,
  registerStudentMember
} from '../lib/memberService';
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

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  // roleTab: 'mahasiswa' | 'admin'
  const [roleTab, setRoleTab] = useState('mahasiswa');
  // studentMode: 'login' | 'register'
  const [studentMode, setStudentMode] = useState('login');

  // Input states
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [nama, setNama] = useState('');
  const [prodi, setProdi] = useState(UIM_PRODI_LIST[0]);
  const [email, setEmail] = useState('');

  // Admin inputs
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('admin');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingNotice, setPendingNotice] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(null);

  if (!isOpen) return null;

  const resetForm = () => {
    setErrorMsg('');
    setPendingNotice(null);
    setRegisteredSuccess(null);
  };

  // Submit Login / Register Mahasiswa
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setPendingNotice(null);

    setTimeout(() => {
      try {
        if (studentMode === 'register') {
          // Registrasi Mahasiswa Baru via KTM
          const newStudent = registerStudentMember({
            nim,
            nama,
            prodi,
            email: email || `${nim}@student.uim.ac.id`,
            password
          });
          setRegisteredSuccess(newStudent);
        } else {
          // Login Mahasiswa
          const user = authenticateStudent(nim, password);
          onAuthSuccess(user);
          onClose();
        }
      } catch (err) {
        if (err.code === 'PENDING_VERIFICATION') {
          setPendingNotice({
            nim,
            nama: err.user?.nama || 'Mahasiswa'
          });
        } else {
          setErrorMsg(err.message || 'Terjadi kesalahan autentikasi.');
        }
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  // Submit Login Admin (Pustakawan)
  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      try {
        const adminUser = authenticateAdmin(adminUsername, adminPassword);
        onAuthSuccess(adminUser);
        onClose();
      } catch (err) {
        setErrorMsg(err.message || 'Kredensial admin salah.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#064e3b] border-2 border-emerald-400 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-white max-h-[92vh] overflow-y-auto">
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

        {/* TAB ROLE SELECTOR: Mahasiswa vs Admin */}
        <div className="flex bg-[#022c22] p-1.5 rounded-2xl mb-6 border border-emerald-700/60">
          <button
            type="button"
            onClick={() => {
              setRoleTab('mahasiswa');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'mahasiswa'
                ? 'bg-[#047857] text-white shadow-md'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Mahasiswa (KTM)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRoleTab('admin');
              resetForm();
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              roleTab === 'admin'
                ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                : 'text-emerald-200/70 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Pustakawan / Admin</span>
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
              💡 <strong>Langkah Aktivasi:</strong> Silakan datangi Meja Sirkulasi Perpustakaan Pusat UIM atau minta Pustakawan memverifikasi akun Anda melalui panel admin.
            </div>
          </div>
        )}

        {/* REGISTRATION SUCCESS CONFIRMATION */}
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
                Data KTM Anda telah masuk ke sistem antrean perpustakaan. Akun akan aktif setelah staf Pustakawan UIM melakukan verifikasi data kartu mahasiswa Anda.
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

            {/* Info Mahasiswa Baru */}
            <div className="mb-4 p-3 rounded-2xl bg-[#022c22] border border-emerald-700/60 flex items-start gap-2.5 text-xs text-emerald-100">
              <CreditCard className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                {studentMode === 'login'
                  ? 'Gunakan Nomor Pokok / NIM Anda yang telah diverifikasi oleh petugas Pustakawan.'
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
        ) : (
          /* ================= FORM ADMIN / PUSTAKAWAN ================= */
          <div>
            <div className="mb-4 p-3 rounded-2xl bg-[#022c22] border border-emerald-600/50 flex items-start gap-2.5 text-xs text-emerald-100">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Akses Staf Perpustakaan</p>
                <p className="text-[11px] text-emerald-200 mt-0.5">
                  Digunakan untuk mengelola katalog, verifikasi pendaftaran KTM mahasiswa, dan sirkulasi buku.
                </p>
                <p className="text-[10px] text-amber-200/90 mt-1 font-mono">
                  Default Login: Username: <strong>admin</strong> | Sandi: <strong>admin</strong>
                </p>
              </div>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-emerald-200 mb-1 uppercase tracking-wider">
                  Username Petugas
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-emerald-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    placeholder="admin / pustakawan"
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
                    placeholder="Kata Sandi Admin"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#022c22] border border-emerald-700/60 rounded-xl text-xs sm:text-sm text-white placeholder-emerald-300/40 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? 'Memverifikasi...' : 'Masuk sebagai Pustakawan (Admin)'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
