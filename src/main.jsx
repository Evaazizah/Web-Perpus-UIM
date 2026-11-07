import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// PWA Service Worker Registration
import { registerSW } from 'virtual:pwa-register';

// Mendaftarkan service worker dengan auto-update berkala
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Versi baru aplikasi perpustakaan tersedia. Muat ulang sekarang?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('Aplikasi perpustakaan siap digunakan dalam mode offline (PWA Ready).');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
