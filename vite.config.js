
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Server lokal
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  },

  plugins: [
    react(),

    // Progressive Web App
    VitePWA({
      registerType: 'autoUpdate',

      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'robots.txt'
      ],

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

      // Konfigurasi caching PWA
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,svg,webp,woff2}'
        ],

        runtimeCaching: [
          {
            // Cache layanan Google dan Firebase
            urlPattern: /^https:\/\/.*googleapis\.com\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-data-cache',
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
  ],

  // Optimasi pembagian JavaScript
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const cleanId = id.replace(/\\/g, '/');
          if (!cleanId.includes('/node_modules/')) {
            return;
          }

          // React Core
          if (
            cleanId.includes('/react/') ||
            cleanId.includes('/react-dom/') ||
            cleanId.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          // Firebase SDK
          if (cleanId.includes('/firebase/') || cleanId.includes('/@firebase/')) {
            return 'vendor-firebase';
          }

          // Icons
          if (cleanId.includes('/lucide-react/')) {
            return 'vendor-icons';
          }
        }
      }
    },

    // Batas peringatan ukuran chunk
    chunkSizeWarningLimit: 500
  }
});
