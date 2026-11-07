# Portal Web Perpustakaan Digital (PWA & Collaborative Filtering)

Aplikasi Portal Perpustakaan Digital modern berbasis **React.js (Vite)**, **Tailwind CSS**, **vite-plugin-pwa** untuk offline support & instabilitas PWA, **Supabase** (PostgreSQL & Auth), serta **Item-Based Collaborative Filtering** untuk sistem rekomendasi buku cerdas.

---

## 🚀 Fitur Utama

1. **Progressive Web App (PWA):**
   - Didukung oleh `vite-plugin-pwa` dengan Service Worker otomatis.
   - Dukungan offline: Web App Manifest, cache aset statis, dan runtime caching data API & cover buku.
   - Dapat diinstal langsung ke Homescreen Android/iOS maupun Desktop.

2. **Backend-as-a-Service (Supabase):**
   - Autentikasi Pengguna (Login/Register via email & password).
   - Database Relasional PostgreSQL dengan Row Level Security (RLS).
   - Skema: `users`, `books`, `ratings`, dan `borrowings`.

3. **Sistem Rekomendasi (Item-Based Collaborative Filtering):**
   - Menghitung kemiripan antar buku menggunakan **Cosine Similarity** dari data rating pengguna.
   - Memprediksi skor ketertarikan user pada buku yang belum dibaca dengan metode *Weighted Average*.
   - Mendukung penanganan masalah *Cold-Start* untuk pengguna baru.
   - Dilengkapi modul API terpisah berbasis **Python FastAPI** di folder `backend_recommendation_api/`.

---

## 🛠️ Cara Menjalankan Aplikasi

### 1. Frontend (React + Vite)
```bash
# Masuk ke direktori proyek
npm install

# Jalankan server pengembangan lokal
npm run dev
```

### 2. Konfigurasi Supabase (Opsional untuk Produksi)
- Salin `.env.example` menjadi `.env`
- Masukkan URL dan Anon Key proyek Supabase Anda:
  ```env
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-public-key
  ```
- Jalankan script SQL pada berkas `supabase_schema.sql` di **Supabase SQL Editor** untuk membuat tabel dan data awal.
*(Catatan: Aplikasi tetap berjalan langsung dalam mode simulasi interaktif meskipun Supabase belum dihubungkan).*

### 3. Backend Rekomendasi FastAPI (Opsional)
```bash
cd backend_recommendation_api
pip install -r requirements.txt
python main.py
```
Akses Swagger UI dokumentasi API di `http://localhost:8000/docs`.
