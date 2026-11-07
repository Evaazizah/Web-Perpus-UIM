/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uim: {
          green: '#047857',      // Hijau Khas Universitas Islam Madura
          darkGreen: '#064e3b',  // Hijau Gelap Header & Nav
          deepForest: '#022c22', // Hijau Sangat Gelap Topbar/Footer
          emerald: '#10b981',    // Aksen Emerald Cerah
          lightGreen: '#ecfdf5', // Background Soft Hijau
          gold: '#f59e0b',       // Aksen Emas Prestisius
          lightGold: '#fef3c7',
        },
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
