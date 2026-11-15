import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  id: {
    // TopBar
    clock_loading: 'Memuat tanggal & waktu...',
    auth_btn: 'Area Anggota (Masuk / Daftar)',
    admin_badge: 'Admin Pustakawan',
    logout_btn: 'Keluar',
    lang_label: 'Bahasa',

    // BrandHeader
    lib_title_1: 'Perpustakaan',
    lib_title_2: 'Universitas Islam Madura',
    slogan: '“Literasi untuk Masa Depan”',

    // Navbar
    nav_home: 'Beranda',
    nav_profile: 'Profil',
    nav_services: 'Layanan',
    nav_catalog: 'Katalog',
    nav_journal: 'Jurnal',
    nav_repository: 'Repository',
    nav_news: 'Berita',
    nav_announcements: 'Pengumuman',
    nav_help: 'Bantuan',
    nav_search_tooltip: 'Fokus ke Bilah Pencarian OPAC',

    // HeroBanner
    hero_welcome: 'Selamat Datang di',
    hero_title_1: 'Perpustakaan',
    hero_title_2: 'Universitas Islam Madura',
    hero_slogan_1: 'Baca',
    hero_slogan_2: 'Telusuri',
    hero_slogan_3: 'Temukan',
    hero_search_placeholder: 'Cari buku, jurnal, atau koleksi lainnya...',
    hero_search_btn: 'Cari',

    // QuickAccessRow
    qa_catalog: 'Katalog Perpustakaan',
    qa_journal: 'Jurnal',
    qa_repo: 'Repository',
    qa_news: 'Berita',
    qa_announcement: 'Pengumuman',
    qa_feedback: 'Komentar',
    qa_help: 'Bantuan',

    // ThreeCardsHub
    card1_title: 'Berita Terbaru',
    card2_title: 'Rekomendasi Untuk Anda',
    card3_title: 'Informasi Penting',
    view_all: 'Lihat Semua',
    service_hours: 'Jam Layanan Perpustakaan',
    service_hours_desc: 'Senin – Jumat, 08.00 – 16.00 WIB',
    view_detail: 'Lihat Detail',

    // Catalog Section
    cat_badge: 'KATALOG OPAC • SLIMS 9.8.0 BULIAN',
    cat_title: 'Koleksi Pustaka Civitas UIM',
    cat_subtitle: 'Koleksi buku teks, monograf, literatur rujukan, dan karya ilmiah terakreditasi',
    tab_popular: 'Terpopuler',
    tab_newest: 'Terbaru',
    tab_all: 'Semua Koleksi',
    filter_label: 'Filter Koleksi:',
    all_categories: 'Semua Kategori',
    all_years: 'Semua Tahun',
    reset_filter: 'Reset Filter',
    showing: 'Menampilkan',
    of: 'dari',
    titles: 'judul koleksi',

    // Footer
    footer_address: 'Jl. Raya Bettet No. 49, Pamekasan, Madura',
    footer_follow: 'Ikuti Kami:',
    footer_rights: 'Semua Hak Cipta Dilindungi.',
    footer_thesis_desc: 'Portal Perpustakaan Berbasis Single Page Application & Progressive Web App Menggunakan Metode Collaborative Filtering'
  },
  en: {
    // TopBar
    clock_loading: 'Loading date & time...',
    auth_btn: 'Member Area (Login / Register)',
    admin_badge: 'Librarian Admin',
    logout_btn: 'Logout',
    lang_label: 'Language',

    // BrandHeader
    lib_title_1: 'Library',
    lib_title_2: 'Madura Islamic University',
    slogan: '“Literacy for the Future”',

    // Navbar
    nav_home: 'Home',
    nav_profile: 'Profile',
    nav_services: 'Services',
    nav_catalog: 'Catalog',
    nav_journal: 'Journals',
    nav_repository: 'Repository',
    nav_news: 'News',
    nav_announcements: 'Announcements',
    nav_help: 'Help',
    nav_search_tooltip: 'Focus on OPAC Search Bar',

    // HeroBanner
    hero_welcome: 'Welcome to',
    hero_title_1: 'Library of',
    hero_title_2: 'Madura Islamic University',
    hero_slogan_1: 'Read',
    hero_slogan_2: 'Explore',
    hero_slogan_3: 'Discover',
    hero_search_placeholder: 'Search books, journals, or other collections...',
    hero_search_btn: 'Search',

    // QuickAccessRow
    qa_catalog: 'Library Catalog',
    qa_journal: 'Journals',
    qa_repo: 'Repository',
    qa_news: 'News',
    qa_announcement: 'Announcements',
    qa_feedback: 'Feedback',
    qa_help: 'Help Desk',

    // ThreeCardsHub
    card1_title: 'Latest News',
    card2_title: 'Recommended For You',
    card3_title: 'Important Notice',
    view_all: 'View All',
    service_hours: 'Library Service Hours',
    service_hours_desc: 'Monday – Friday, 08:00 – 16:00 WIB',
    view_detail: 'View Details',

    // Catalog Section
    cat_badge: 'OPAC CATALOG • SLIMS 9.8.0 BULIAN',
    cat_title: 'UIM Academic Book Collections',
    cat_subtitle: 'Textbooks, monographs, reference literature, and accredited scholarly publications',
    tab_popular: 'Most Popular',
    tab_newest: 'Newest',
    tab_all: 'All Collections',
    filter_label: 'Filter Collections:',
    all_categories: 'All Categories',
    all_years: 'All Years',
    reset_filter: 'Reset Filter',
    showing: 'Showing',
    of: 'of',
    titles: 'titles',

    // Footer
    footer_address: 'Jl. Raya Bettet No. 49, Pamekasan, Madura',
    footer_follow: 'Follow Us:',
    footer_rights: 'All Rights Reserved.',
    footer_thesis_desc: 'Library Web Portal based on SPA & PWA utilizing Item-Based Collaborative Filtering'
  },
  ar: {
    // TopBar
    clock_loading: 'جاري تحميل التاريخ والوقت...',
    auth_btn: 'منطقة الأعضاء (دخول / تسجيل)',
    admin_badge: 'أمين المكتبة المشرف',
    logout_btn: 'تسجيل الخروج',
    lang_label: 'اللغة',

    // BrandHeader
    lib_title_1: 'مكتبة',
    lib_title_2: 'جامعة مدورا الإسلامية',
    slogan: '“القراءة والكتابة من أجل المستقبل”',

    // Navbar
    nav_home: 'الرئيسية',
    nav_profile: 'الملف التعريفي',
    nav_services: 'الخدمات',
    nav_catalog: 'الفهرس',
    nav_journal: 'المجلات',
    nav_repository: 'المستودع',
    nav_news: 'الأخبار',
    nav_announcements: 'الإعلانات',
    nav_help: 'المساعدة',
    nav_search_tooltip: 'التركيز على شريط البحث',

    // HeroBanner
    hero_welcome: 'مرحباً بكم في',
    hero_title_1: 'مكتبة',
    hero_title_2: 'جامعة مدورا الإسلامية',
    hero_slogan_1: 'اقرأ',
    hero_slogan_2: 'استكشف',
    hero_slogan_3: 'اكتشف',
    hero_search_placeholder: 'ابحث عن الكتب أو المجلات أو المجموعات الأخرى...',
    hero_search_btn: 'بحث',

    // QuickAccessRow
    qa_catalog: 'فهرس المكتبة',
    qa_journal: 'المجلات العلمية',
    qa_repo: 'المستودع الرقمي',
    qa_news: 'الأخبار',
    qa_announcement: 'الإعلانات',
    qa_feedback: 'التعليقات والآراء',
    qa_help: 'المساعدة',

    // ThreeCardsHub
    card1_title: 'آخر الأخبار',
    card2_title: 'موصى به لك',
    card3_title: 'معلومات هامة',
    view_all: 'عرض الكل',
    service_hours: 'ساعات عمل المكتبة',
    service_hours_desc: 'الإثنين – الجمعة، ٠٨:٠٠ – ١٦:٠٠ بتوقيت إندونيسيا',
    view_detail: 'عرض التفاصيل',

    // Catalog Section
    cat_badge: 'فهرس OPAC • SLIMS 9.8.0 BULIAN',
    cat_title: 'مجموعات الكتب الأكاديمية لجامعة مدورا',
    cat_subtitle: 'مجموعة من الكتب الدراسية والدراسات والمراجع والأوراق العلمية المعتمدة',
    tab_popular: 'الأكثر شعبية',
    tab_newest: 'الأحدث',
    tab_all: 'جميع المجموعات',
    filter_label: 'تصفية المجموعات:',
    all_categories: 'جميع الفئات',
    all_years: 'جميع السنوات',
    reset_filter: 'إعادة الضبط',
    showing: 'عرض',
    of: 'من',
    titles: 'عناوين',

    // Footer
    footer_address: 'شارع رايا بيتيت رقم 49، باميكاسان، مدورا',
    footer_follow: 'تابعنا:',
    footer_rights: 'جميع الحقوق محفوظة.',
    footer_thesis_desc: 'بوابة الويب للمكتبة بنظام تطبيق الصفحة الواحدة وتطبيق الويب التقدمي باستخدام التصفية التعاونية'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      return localStorage.getItem('uim_portal_lang') || 'id';
    } catch {
      return 'id';
    }
  });

  const setLanguage = (lang) => {
    if (translations[lang]) {
      setCurrentLang(lang);
      try {
        localStorage.setItem('uim_portal_lang', lang);
      } catch (e) {
        console.warn('Could not save language to localStorage', e);
      }
    }
  };

  const t = (key) => {
    return translations[currentLang]?.[key] || translations['id']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage, t, languages: ['id', 'en', 'ar'] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      currentLang: 'id',
      setLanguage: () => {},
      t: (key) => key,
      languages: ['id', 'en', 'ar']
    };
  }
  return context;
}

