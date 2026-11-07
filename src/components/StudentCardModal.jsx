import React from 'react';
import UimLogo from './UimLogo';
import { X, Printer, ShieldCheck, Sparkles, QrCode, CreditCard } from 'lucide-react';

export default function StudentCardModal({ isOpen, onClose, user }) {
  if (!isOpen || !user) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate pattern barcode sederhana dari NIM
  const nimStr = String(user.nim || '2024010001');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Kartu Tanda Anggota Digital (KTM Perpustakaan)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Body / Visual Printable Card */}
        <div className="p-6 bg-slate-100 flex flex-col items-center">
          <div
            id="printable-ktm-card"
            className="w-full max-w-md bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#022c22] text-white rounded-2xl p-5 shadow-2xl relative overflow-hidden border-2 border-amber-400/60"
          >
            {/* Ambient Watermark */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-2 right-3 opacity-20 pointer-events-none">
              <UimLogo className="w-32 h-32" />
            </div>

            {/* Card Header */}
            <div className="flex items-center justify-between pb-3 border-b border-emerald-400/40 relative z-10">
              <div className="flex items-center gap-2.5">
                <UimLogo className="w-10 h-10 drop-shadow" />
                <div>
                  <h4 className="text-[11px] font-black tracking-wider uppercase text-amber-300">
                    UNIVERSITAS ISLAM MADURA
                  </h4>
                  <p className="text-[10px] text-emerald-100 font-bold">
                    UPT PERPUSTAKAAN PUSAT (DIGILIB UIM)
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-[9px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
                ANGGOTA RESMI
              </span>
            </div>

            {/* Card Content (Photo + Student Info) */}
            <div className="mt-4 flex gap-4 items-center relative z-10">
              {/* Photo Box */}
              <div className="w-20 h-24 rounded-xl bg-white/10 border-2 border-amber-300/80 flex flex-col items-center justify-center shrink-0 overflow-hidden shadow-inner relative">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-xl uppercase">
                  {user.nama ? user.nama.charAt(0) : 'U'}
                </div>
                <span className="text-[8px] text-emerald-200 mt-1 font-mono uppercase">UIM FOTO</span>
              </div>

              {/* Student Metadata */}
              <div className="flex-1 space-y-1 text-xs">
                <div>
                  <span className="text-[9px] text-emerald-200/80 block uppercase font-semibold">Nama Mahasiswa</span>
                  <p className="font-extrabold text-sm text-white tracking-wide leading-tight line-clamp-1">
                    {user.nama || 'Mahasiswa UIM'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-200/80 block uppercase font-semibold">Nomor Pokok / NIM</span>
                  <p className="font-mono font-bold text-amber-300 text-xs tracking-wider">
                    {user.nim || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-200/80 block uppercase font-semibold">Program Studi</span>
                  <p className="text-[11px] text-slate-100 font-medium line-clamp-1">
                    {user.prodi || 'Civitas Akademika'}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Barcode & QR Code Section */}
            <div className="mt-4 pt-3 border-t border-emerald-400/30 flex items-center justify-between relative z-10">
              {/* CSS Barcode */}
              <div className="bg-white px-3 py-1.5 rounded-lg flex flex-col items-center shadow-xs">
                <div className="flex items-center gap-[2px] h-7">
                  {nimStr.split('').map((char, idx) => {
                    const width = (char.charCodeAt(0) % 3) + 1.5;
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 h-full"
                        style={{ width: `${width}px` }}
                      />
                    );
                  })}
                  {/* Fillers */}
                  <div className="bg-slate-950 h-full w-[2px]" />
                  <div className="bg-slate-950 h-full w-[1px]" />
                  <div className="bg-slate-950 h-full w-[3px]" />
                  <div className="bg-slate-950 h-full w-[1.5px]" />
                  <div className="bg-slate-950 h-full w-[2.5px]" />
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-800 tracking-widest mt-0.5">
                  *{nimStr}*
                </span>
              </div>

              {/* Status Stamp */}
              <div className="text-right">
                <span className="text-[9px] text-emerald-200 block">Status Keanggotaan</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TERVERIFIKASI</span>
                </span>
                <p className="text-[8px] text-emerald-300/70">Berlaku s/d Wisuda</p>
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 mt-4 text-center max-w-sm">
            Tunjukkan kartu digital ini atau sebutkan nomor NIM Anda ke petugas di Meja Sirkulasi Perpustakaan UIM saat meminjam buku fisik.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Simpan PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

