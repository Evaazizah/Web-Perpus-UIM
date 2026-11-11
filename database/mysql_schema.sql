-- ==============================================================================
-- SKEMA BASIS DATA RESMI: PORTAL PERPUSTAKAAN UNIVERSITAS ISLAM MADURA (UIM)
-- Sesuai Blueprint Fokus 1 (Bagian 6.B) & Analisis Kesenjangan Riset (Gap 1, 2, 3)
-- Target RDBMS: MySQL 8.0+ / MariaDB 10.5+
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS visitor_logs;
DROP TABLE IF EXISTS data_staging;
DROP TABLE IF EXISTS user_ratings;
DROP TABLE IF EXISTS peminjaman_sirkulasi;
DROP TABLE IF EXISTS eksemplar_fisik;
DROP TABLE IF EXISTS koleksi_digital;
DROP TABLE IF EXISTS koleksi_fisik;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- 1. TABEL USERS & OTORISASI RBAC
-- ==============================================================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nama_lengkap VARCHAR(150) NOT NULL,
    nim VARCHAR(50) NULL,
    prodi VARCHAR(100) NULL,
    role ENUM('guest', 'member', 'librarian', 'admin') NOT NULL DEFAULT 'member',
    status_verifikasi ENUM('pending', 'verified', 'rejected') NOT NULL DEFAULT 'pending',
    avatar_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_role (role),
    INDEX idx_user_nim (nim)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. TABEL KOLEKSI FISIK (BIBLIOGRAFI UTAMA SLiMS)
-- ==============================================================================
CREATE TABLE koleksi_fisik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    isbn VARCHAR(30) NULL UNIQUE,
    penerbit VARCHAR(150) NULL,
    tahun_terbit INT NULL,
    kategori VARCHAR(100) NOT NULL,
    sinopsis TEXT NULL,
    cover_url VARCHAR(500) NULL,
    lokasi_rak VARCHAR(50) DEFAULT 'Rak Umum',
    total_eksemplar INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FULLTEXT INDEX idx_ft_buku (judul, penulis, kategori)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. TABEL EKSEMPLAR FISIK (INVENTARIS FISIK DENGAN BARCODE)
-- ==============================================================================
CREATE TABLE eksemplar_fisik (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fisik_id INT NOT NULL,
    kode_barcode VARCHAR(50) NOT NULL UNIQUE,
    nomor_panggil VARCHAR(50) NULL,
    status ENUM('tersedia', 'dipinjam', 'rusak', 'hilang', 'dalam_perbaikan') NOT NULL DEFAULT 'tersedia',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fisik_id) REFERENCES koleksi_fisik(id) ON DELETE CASCADE,
    INDEX idx_eksemplar_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. TABEL KOLEKSI DIGITAL (REPOSITORI SKRIPSI, TESIS & JURNAL CIVITAS)
-- ==============================================================================
CREATE TABLE koleksi_digital (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipe ENUM('jurnal', 'repo', 'skripsi', 'tesis', 'modul') NOT NULL DEFAULT 'skripsi',
    judul VARCHAR(255) NOT NULL,
    penulis VARCHAR(150) NOT NULL,
    fakultas_prodi VARCHAR(100) NULL,
    tahun INT NULL,
    abstrak TEXT NULL,
    url_file VARCHAR(500) NOT NULL,
    akses ENUM('public', 'member_only') NOT NULL DEFAULT 'member_only',
    total_unduh INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_digital_tipe (tipe),
    INDEX idx_digital_akses (akses)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. TABEL USER_RATINGS (DATA INTERAKSI UNTUK ALGORITMA COLLABORATIVE FILTERING)
-- ==============================================================================
CREATE TABLE user_ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_id INT NOT NULL,
    item_type ENUM('fisik', 'digital') NOT NULL DEFAULT 'fisik',
    rating_value TINYINT NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
    ulasan TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_item (user_id, item_id, item_type),
    INDEX idx_rating_item (item_id, item_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 6. TABEL DATA_STAGING (AREA PEMENTASAN INTELEJEN BOT CRAWLING & OCR - GAP 1)
-- ==============================================================================
CREATE TABLE data_staging (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sumber ENUM('crawling', 'ocr', 'external_api') NOT NULL,
    raw_json JSON NOT NULL,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    catatan_kurasi TEXT NULL,
    approved_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_staging_status (status),
    INDEX idx_staging_sumber (sumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 7. TABEL VISITOR_LOGS (PELACAK PENGUNJUNG SPA & HIT COUNTER - BLUEPRINT 5.B)
-- ==============================================================================
CREATE TABLE visitor_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hashed_ip VARCHAR(64) NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL DEFAULT '/',
    user_agent TEXT NULL,
    is_unique_today BOOLEAN NOT NULL DEFAULT TRUE,
    visit_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date_session (visit_date, session_id),
    INDEX idx_visit_date (visit_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 8. TABEL PEMINJAMAN_SIRKULASI (MANAJEMEN PEMINJAMAN EKSEMPLAR)
-- ==============================================================================
CREATE TABLE peminjaman_sirkulasi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    eksemplar_id INT NOT NULL,
    tanggal_pinjam DATE NOT NULL,
    tanggal_jatuh_tempo DATE NOT NULL,
    tanggal_kembali DATE NULL,
    status ENUM('dipinjam', 'kembali', 'terlambat', 'diperpanjang') NOT NULL DEFAULT 'dipinjam',
    denda DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (eksemplar_id) REFERENCES eksemplar_fisik(id) ON DELETE CASCADE,
    INDEX idx_pinjam_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- SEED DATA AWAL (CIVITAS AKADEMIKA & KOLEKSI PERPUSTAKAAN UIM)
-- ==============================================================================

-- 1. Akun Admin & Anggota Mahasiswa UIM
INSERT INTO users (id, username, email, password_hash, nama_lengkap, nim, prodi, role, status_verifikasi) VALUES
(1, 'admin_pustakawan', 'pustakawan@uim.ac.id', '$2b$12$K1m9Uq76UIMPerpusSecureAdminHashPass2026', 'Kepala Perpustakaan UIM', NULL, 'Pusat Perpustakaan', 'admin', 'verified'),
(2, 'achmad_fauzi', 'achmad.fauzi@mhs.uim.ac.id', '$2b$12$e0NZ123FakeHashForStudentDemoPassUIM2026', 'Achmad Fauzi', '202201001', 'Teknik Informatika', 'member', 'verified'),
(3, 'siti_nurhaliza', 'siti.nur@mhs.uim.ac.id', '$2b$12$e0NZ123FakeHashForStudentDemoPassUIM2026', 'Siti Nurhaliza', '202201002', 'Sistem Informasi', 'member', 'verified'),
(4, 'mohammad_zaka', 'zaka.al@mhs.uim.ac.id', '$2b$12$e0NZ123FakeHashForStudentDemoPassUIM2026', 'M. Zaka Al-Farisi', '202102015', 'Pendidikan Agama Islam', 'member', 'verified');

-- 2. Koleksi Fisik Perpustakaan UIM
INSERT INTO koleksi_fisik (id, judul, penulis, isbn, penerbit, tahun_terbit, kategori, sinopsis, cover_url, lokasi_rak, total_eksemplar) VALUES
(1, 'Metodologi Penelitian Hukum Islam', 'Prof. Dr. H. Abdurrahman, M.Ag', '978-602-893-112-1', 'UIM Press Pamekasan', 2023, 'Ilmu Agama Islam', 'Panduan komprehensif metodologi penelitian hukum syariah, ushul fiqh kontemporer, dan studi kasus peradilan agama di Madura.', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60', 'Rak 101 - FAI', 3),
(2, 'Rekayasa Perangkat Lunak Modern dengan React & Python', 'Dr. Eng. Ahmad Zaini, S.T., M.T.', '978-602-623-224-3', 'Informatika Press', 2024, 'Teknologi Informasi', 'Kupas tuntas arsitektur Single Page Application (SPA), Progressive Web App (PWA), FastAPI asinkron, dan integrasi Machine Learning.', 'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=500&auto=format&fit=crop&q=60', 'Rak 204 - FT', 4),
(3, 'Kecerdasan Buatan & Sistem Rekomendasi Cerdas', 'M. Syafiuddin, M.Kom', '978-602-554-781-0', 'Mitra Wacana Media', 2023, 'Teknologi Informasi', 'Membahas collaborative filtering, cosine similarity, matrix factorization SVD, dan implementasi scikit-learn praktis.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=60', 'Rak 204 - FT', 2),
(4, 'Ekonomi Syariah: Prinsip dan Praktik Perbankan Madura', 'Dr. Hj. Supriyatun, S.E., M.E.I', '978-602-112-990-4', 'RajaGrafindo Persada', 2022, 'Ekonomi Islam', 'Analisis pembiayaan mudharabah, murabahah, dan potensi penguatan ekonomi berbasis pesantren di wilayah Madura.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=60', 'Rak 302 - FE', 2);

-- 3. Eksemplar Fisik (Barcode)
INSERT INTO eksemplar_fisik (id, fisik_id, kode_barcode, nomor_panggil, status) VALUES
(1, 1, 'UIM-B001-E1', '2X4.01 ABD m c.1', 'tersedia'),
(2, 1, 'UIM-B001-E2', '2X4.01 ABD m c.2', 'tersedia'),
(3, 1, 'UIM-B001-E3', '2X4.01 ABD m c.3', 'dipinjam'),
(4, 2, 'UIM-B002-E1', '005.1 ZAI r c.1', 'tersedia'),
(5, 2, 'UIM-B002-E2', '005.1 ZAI r c.2', 'tersedia'),
(6, 3, 'UIM-B003-E1', '006.3 SYA k c.1', 'tersedia'),
(7, 4, 'UIM-B004-E1', '2X6.3 SUP e c.1', 'tersedia');

-- 4. Koleksi Digital Repositori & Jurnal UIM
INSERT INTO koleksi_digital (id, tipe, judul, penulis, fakultas_prodi, tahun, abstrak, url_file, akses, total_unduh) VALUES
(1, 'skripsi', 'Rancang Bangun Sistem Monitoring Nutrisi Hidroponik Berbasis IoT di Pamekasan', 'Bambang Irawan', 'Fakultas Teknik / Teknik Informatika', 2024, 'Skripsi ini mengkaji penerapan sensor ESP32 untuk memantau pH dan kelembaban tanaman melon di Bettet Pamekasan.', '/files/repository/skripsi_bambang_2024.pdf', 'member_only', 42),
(2, 'jurnal', 'Analisis Efektivitas Penggunaan SLiMS Bulian terhadap Efisiensi Sirkulasi Buku', 'Dra. Nurul Hidayati & Tim', 'Perpustakaan Pusat UIM', 2024, 'Artikel jurnal membedah dampak digitalisasi otomasi sirkulasi dan responsivitas katalog terhadap mahasiswa angkatan 2022-2024.', 'https://jurnal.uim.ac.id/index.php/infotek/article/view/1029', 'public', 128);

-- 5. Interaksi Rating Awal (Bahan Bakar Collaborative Filtering)
INSERT INTO user_ratings (user_id, item_id, item_type, rating_value, ulasan) VALUES
(2, 2, 'fisik', 5, 'Buku panduan modern web yang sangat komprehensif untuk tugas akhir!'),
(2, 3, 'fisik', 5, 'Penjelasan matematika Cosine Similarity sangat jelas dan aplikatif.'),
(3, 2, 'fisik', 5, 'Sangat membantu pemahaman Single Page Application dengan React.'),
(4, 1, 'fisik', 5, 'Rujukan wajib untuk skripsi hukum keluarga Islam di UIM.');

-- 6. Log Pengunjung Awal (Visitor Tracker Baseline)
INSERT INTO visitor_logs (hashed_ip, session_id, path, is_unique_today, visit_date) VALUES
('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'uim_sess_initial_demo_01', '/', TRUE, CURRENT_DATE),
('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'uim_sess_initial_demo_01', '/katalog', FALSE, CURRENT_DATE),
('87920150b06b6daeec19b0de31818c7c1ff7ee151d387ae49492167d30ef225c', 'uim_sess_initial_demo_02', '/', TRUE, CURRENT_DATE);

