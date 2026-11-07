import React, { useState, useEffect } from 'react';
import {
  getStoredMembers,
  updateMemberStatus,
  countPendingVerifications
} from '../lib/memberService';
import {
  X,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Search,
  Filter,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export default function AdminVerificationModal({ isOpen, onClose, onMembersUpdated }) {
  const [members, setMembers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'all' | 'pending' | 'verified' | 'rejected'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  const loadData = () => {
    const list = getStoredMembers();
    setMembers(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setActionSuccessMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAction = (memberId, newStatus) => {
    try {
      const updated = updateMemberStatus(memberId, newStatus);
      loadData();
      if (onMembersUpdated) onMembersUpdated();

      const label = newStatus === 'verified' ? 'disetujui & diaktifkan' : 'ditolak';
      setActionSuccessMsg(`Akun mahasiswa ${updated.nama} (NIM: ${updated.nim}) berhasil ${label}!`);
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (e) {
      alert(e.message);
    }
  };

  const filtered = members.filter((m) => {
    const matchFilter = filterStatus === 'all' || m.status === filterStatus;
    const matchSearch =
      m.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(m.nim).includes(searchQuery) ||
      (m.prodi && m.prodi.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchFilter && matchSearch;
  });

  const pendingCount = countPendingVerifications();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border-2 border-emerald-600/40">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                Panel Verifikasi Anggota Baru (KTM Mahasiswa)
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Persetujuan keanggotaan pemustaka Perpustakaan Universitas Islam Madura
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar & Filter */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan NIM, Nama, atau Program Studi..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#047857]"
            />
          </div>

          {/* Filter Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Menunggu ({pendingCount})</span>
            </button>

            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                filterStatus === 'verified'
                  ? 'bg-[#047857] text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Terverifikasi</span>
            </button>

            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterStatus === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Semua ({members.length})
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionSuccessMsg && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Members List Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          {filtered.length > 0 ? (
            filtered.map((m) => {
              const isPending = m.status === 'pending';
              const isVerified = m.status === 'verified';
              const isRejected = m.status === 'rejected';

              return (
                <div
                  key={m.id}
                  className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPending
                      ? 'border-amber-300 bg-amber-50/20 shadow-sm'
                      : 'border-slate-200 hover:shadow'
                  }`}
                >
                  {/* Info Mahasiswa */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center font-bold text-lg shrink-0 border border-emerald-200">
                      <GraduationCap className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                          {m.nama}
                        </h4>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Menunggu Verifikasi</span>
                          </span>
                        )}
                        {isVerified && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            <span>Aktif / Terverifikasi</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-300 flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>Ditolak</span>
                          </span>
                        )}
                      </div>

                      {/* Detail Data Mahasiswa */}
                      <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600">
                        <p>
                          <span className="font-semibold text-slate-500">Nomor KTM / NIM:</span>{' '}
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                            {m.nim}
                          </span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Program Studi:</span>{' '}
                          <span className="text-slate-800 font-medium">{m.prodi || '-'}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Email:</span>{' '}
                          <span className="text-slate-700">{m.email}</span>
                        </p>
                        <p>
                          <span className="font-semibold text-slate-500">Tgl Pendaftaran:</span>{' '}
                          <span className="text-slate-500">
                            {m.registeredAt ? new Date(m.registeredAt).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tombol Aksi Verifikasi */}
                  <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleAction(m.id, 'verified')}
                          className="px-4 py-2 bg-[#047857] hover:bg-[#064e3b] text-white font-bold text-xs rounded-xl transition-all shadow flex items-center gap-1.5"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Verifikasi & Aktifkan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAction(m.id, 'rejected')}
                          className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
                        >
                          Tolak
                        </button>
                      </>
                    ) : isVerified ? (
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Sudah Diaktifkan</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(m.id, 'verified')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-semibold text-xs rounded-xl transition-colors border border-slate-200"
                      >
                        Pulihkan & Aktifkan
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <UserCheck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 font-semibold text-sm">
                Tidak ada data mahasiswa dengan kriteria ini.
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Sistem Sirkulasi & Keanggotaan Terpadu UIM</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors text-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

