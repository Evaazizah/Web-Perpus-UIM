import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getUnreadNotificationCount, subscribeNotifications } from '../lib/notificationService';
import { Calendar, User, LogOut, ShieldCheck, CreditCard, Globe, Bell, Award } from 'lucide-react';

export default function TopBar({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenProfile,
  onOpenNotification
}) {
  const { currentLang, setLanguage, t } = useLanguage();
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [unreadNotifs, setUnreadNotifs] = useState(() => getUnreadNotificationCount(currentUser));

  useEffect(() => {
    setUnreadNotifs(getUnreadNotificationCount(currentUser));
    const unsub = subscribeNotifications(() => {
      setUnreadNotifs(getUnreadNotificationCount(currentUser));
    });
    return () => unsub();
  }, [currentUser]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      if (currentLang === 'ar') {
        const dateStr = now.toLocaleDateString('ar-EG', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        const timeStr = now.toLocaleTimeString('ar-EG', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
        setCurrentDateTime(`${dateStr} | ${timeStr}`);
      } else if (currentLang === 'en') {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setCurrentDateTime(`${dayName}, ${day} ${month} ${year} | ${hours}:${minutes}:${seconds}`);
      } else {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        const dayName = days[now.getDay()];
        const day = now.getDate();
        const month = months[now.getMonth()];
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        setCurrentDateTime(`${dayName}, ${day} ${month} ${year} | ${hours}:${minutes}:${seconds}`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [currentLang]);

  return (
    <div className="relative bg-[#064e3b] text-white text-xs py-2 px-4 sm:px-8 border-b border-emerald-900/60 overflow-hidden">
      {/* Subtle Islamic Geometric Watermark on the right */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-10 pointer-events-none flex items-center justify-end pr-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 stroke-current fill-none stroke-[0.8]">
          <polygon points="50,5 64,25 88,25 76,45 88,68 64,68 50,88 36,68 12,68 24,45 12,25 36,25" />
          <polygon points="50,15 72,50 50,85 28,50" />
          <circle cx="50" cy="50" r="16" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 relative z-10">
        {/* Left: Live Date & Time */}
        <div className="flex items-center gap-2 text-emerald-100 text-[11px] sm:text-xs font-medium">
          <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          <span>{currentDateTime || t('clock_loading')}</span>
        </div>

        {/* Right: Language Controller, Notification Tool & Unified Auth Tool */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-semibold">
          
          {/* 1. KONTROL BAHASA (ID | EN | AR) */}
          <div className="flex items-center gap-1 bg-[#022c22]/80 border border-emerald-700/60 rounded-full px-2 py-0.5 text-[11px] shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-emerald-300 shrink-0 mr-0.5" />
            <button
              type="button"
              onClick={() => setLanguage('id')}
              className={`px-1.5 py-0.5 rounded-full font-bold transition-all ${
                currentLang === 'id'
                  ? 'bg-[#047857] text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="Bahasa Indonesia"
            >
              ID
            </button>
            <span className="text-emerald-700/70 text-[10px]">•</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-1.5 py-0.5 rounded-full font-bold transition-all ${
                currentLang === 'en'
                  ? 'bg-[#047857] text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
            <span className="text-emerald-700/70 text-[10px]">•</span>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={`px-1.5 py-0.5 rounded-full font-bold transition-all ${
                currentLang === 'ar'
                  ? 'bg-[#047857] text-white shadow-xs'
                  : 'text-emerald-200 hover:text-white'
              }`}
              title="العربية (Arabic)"
            >
              عربي
            </button>
          </div>

          <span className="text-emerald-700 hidden sm:inline">•</span>

          {/* 2. TOOLS NOTIFIKASI DI UJUNG ATAS (Sesuai Permintaan Pengguna) */}
          <button
            type="button"
            onClick={onOpenNotification}
            className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 hover:text-amber-300 border border-emerald-700/60 transition-all font-semibold shadow-2xs"
            title="Pusat Notifikasi & Pengumuman Perpustakaan"
          >
            <Bell className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden sm:inline">Notif</span>
            {unreadNotifs > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadNotifs}
              </span>
            )}
          </button>

          <span className="text-emerald-700 hidden sm:inline">•</span>

          {/* 3. ALAT AUTENTIKASI TUNGGAL (TIDAK DUPLIKAT MASUK & DAFTAR) */}
          {currentUser ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 hover:text-amber-300 transition-colors text-[11px] sm:text-xs"
              >
                {currentUser.role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                ) : currentUser.role === 'dosen' ? (
                  <Award className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span className="max-w-[130px] truncate">
                  {currentUser.role === 'admin'
                    ? t('admin_badge')
                    : currentUser.role === 'dosen'
                    ? (currentUser.nama || 'Dosen Sivitas')
                    : currentUser.nama || currentUser.nim}
                </span>
              </button>
              <span className="text-emerald-700">•</span>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1 hover:text-red-300 transition-colors text-[11px]"
                title={t('logout_btn')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('logout_btn')}</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('login')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 hover:text-amber-300 border border-emerald-700/60 transition-all font-semibold cursor-pointer shadow-2xs"
            >
              <User className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t('auth_btn')}</span>
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
