# SKEMA RESMI CLOUD FIRESTORE
## Portal Web Perpustakaan Universitas Islam Madura (UIM)

Sesuai ketetapan arsitektur utama:
- **Database Utama (Single Source of Truth):** Google Cloud Firestore (`uim-digilib`)
- **Autentikasi:** Firebase Authentication (Email/Password)
- **Status RDBMS (MySQL / Supabase):** *Arsip Rancangan Terdahulu (Legacy Schema)*. File `mysql_schema.sql` dan `supabase_schema.sql` tidak dijalankan pada runtime aplikasi.

---

### 1. Struktur Koleksi Dokumen Firestore

#### 1. Koleksi: `users`
Menyimpan data profil pengguna (mahasiswa dan staf perpustakaan). Password dikelola oleh Firebase Authentication dan **TIDAK PERNAH** disimpan dalam koleksi ini.
- `uid` (string, Document ID): UID pengguna dari Firebase Authentication.
- `nama_lengkap` (string): Nama lengkap mahasiswa / pustakawan.
- `email` (string): Alamat email terdaftar.
- `nim` (string): Nomor Induk Mahasiswa (KTM).
- `prodi` (string): Program studi / fakultas.
- `role` (string): `'mahasiswa'` | `'pustakawan'` | `'admin'`.
- `status_verifikasi` (string): `'pending'` | `'verified'` | `'rejected'`.
- `created_at` (timestamp / ISO string): Tanggal registrasi akun.

#### 2. Koleksi: `books`
Menyimpan katalog master bibliografi buku fisik maupun digital.
- `id` (string, Document ID): ID unik buku (misal: `uim-b001`, `book-1731300000`).
- `judul` (string): Judul koleksi pustaka.
- `penulis` (string): Pengarang / penulis buku.
- `isbn` (string): Nomor ISBN / ISSN.
- `penerbit` (string): Nama penerbit.
- `tahun_terbit` (number): Tahun publikasi (contoh: 2024).
- `kategori` (string): Kategori subjek (contoh: `Agama`, `Ilmu-ilmu Sosial`, `Teknologi Informasi`).
- `sinopsis` (string): Deskripsi ringkasan buku.
- `cover_url` (string): Tautan URL sampul buku.
- `lokasi_rak` (string): Nomor rak penempatan buku fisik.
- `total_eksemplar` (number): Jumlah eksemplar fisik yang dimiliki perpustakaan.
- `salin` (number): Jumlah salinan tersedia.
- `isPromoted` (boolean): Penanda tampil di daftar unggulan beranda.
- `created_at` / `updatedAt` (ISO string): Waktu pembaruan metadata.

#### 3. Koleksi: `members`
Menyimpan profil anggota jika struktur aplikasi memerlukan referensi independen dari profil user. Tidak menyimpan password.

#### 4. Koleksi: `ratings`
Menyimpan penilaian pembaca yang menjadi bahan masukan algoritma **Item-Based Collaborative Filtering (IBCF)**.
- ID Dokumen: `${userId}_${bookId}` (Idempotent, mencegah rating ganda).
- `id_user` / `uid` (string): UID pengguna penilai.
- `id_buku` (string): ID dokumen buku dari koleksi `books`.
- `nilai_rating` (number): Nilai bintang 1 hingga 5.
- `created_at` (ISO string): Tanggal pemberian rating pertama.
- `updated_at` (ISO string): Tanggal pembaruan rating terakhir.

#### 5. Koleksi: `loans`
Menyimpan transaksi sirkulasi peminjaman buku.
- `id` (string, Document ID): ID transaksi pinjaman.
- `uid` (string): UID mahasiswa peminjam.
- `nim` (string): NIM mahasiswa.
- `nama` (string): Nama mahasiswa peminjam.
- `bookId` (string): ID buku yang dipinjam.
- `judul` (string): Judul buku.
- `cover_url` (string): Sampul buku.
- `tanggalPinjam` (string): Format `YYYY-MM-DD`.
- `tanggalJatuhTempo` (string): Format `YYYY-MM-DD` (standar 7 hari kalender).
- `tanggalKembali` (string, nullable): Tanggal pengembalian fisik.
- `perpanjangan` (number): Jumlah perpanjangan pinjaman (maksimal 2 kali).
- `status` (string): `'dipinjam'` | `'kembali'` | `'terlambat'`.

#### 6. Koleksi: `visitor_logs`
Mencatat rekaman kunjungan sesi pengguna ke portal.
- `session_id` (string): Token sesi pengunjung.
- `path` (string): Rute halaman yang dikunjungi (`'/'`, `'/katalog'`).
- `visit_date` (string): Format `YYYY-MM-DD`.
- `created_at` (ISO string): Waktu kunjungan.

#### 7. Dokumen: `visitor_stats/summary`
Menyimpan ringkasan agregasi kunjungan untuk mencegah keausan kuota Firestore.
- `todayVisitors` (number): Jumlah pengunjung unik hari ini.
- `todayHits` (number): Jumlah tayangan halaman hari ini.
- `totalVisitors` (number): Total pengunjung unik sepanjang masa.
- `totalHits` (number): Total tayangan seluruh halaman.
- `activeOnline` (number): Jumlah sesi aktif dalam rentang 15 menit terakhir.
- `lastUpdatedDate` (string): `YYYY-MM-DD`.

#### 8. Koleksi: `data_staging`
Area kurasi metadata pra-publikasi untuk integrasi bot Web Crawling (Fokus 2) dan pemindai OCR (Fokus 3).
- `id` (string, Document ID): ID unik antrean staging.
- `sumber` (string): `'crawling'` | `'ocr'`.
- `metadata` (map): Berisi `{ judul, penulis, isbn, kategori, sinopsis }`.
- `status_verifikasi` (string): `'pending'` | `'approved'` | `'rejected'`.
- `catatan_kurasi` (string): Catatan pustakawan saat meninjau data.
- `created_at` (ISO string): Waktu data masuk ke staging area.
- `approved_at` / `rejected_at` (ISO string): Waktu keputusan kurasi pustakawan.

