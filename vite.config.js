
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  // Konfigurasi server agar dapat diakses melalui jaringan lokal
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },

  plugins: [
    react(),

    // Konfigurasi PWA (Progressive Web App)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'robots.txt'
      ],

      // Web App Manifest
      manifest: {
        name: 'Perpustakaan Universitas Islam Madura - Digilib UIM',
        short_name: 'Digilib UIM',
        description:
          'Portal Perpustakaan Digital UIM Madura dengan Sistem Rekomendasi Cerdas & PWA Offline',
        theme_color: '#047857',
        background_color: '#064e3b',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },

      // Konfigurasi Workbox untuk caching
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}'
        ],

        runtimeCaching: [
          {
            // Cache API Supabase
            urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache gambar cover buku
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'book-cover-images',
              expiration: {
                maxEntries: 150,
                maxAgeSeconds: 60 * 60 * 24 * 7
              }
            }
          },
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ]
});
