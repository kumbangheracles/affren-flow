# AfreenFlow

Sistem manajemen keuangan proyek konstruksi berbasis web dengan fitur prediksi _cash flow_ menggunakan algoritma **Facebook Prophet**.

Dibangun dengan Laravel 12 + Inertia.js + React (TypeScript), diintegrasikan dengan modul Python untuk forecasting.

---

## Tech Stack

| Layer           | Teknologi                         |
| --------------- | --------------------------------- |
| Backend         | Laravel 12, PHP 8.2+              |
| Frontend        | React 18 (TypeScript), Inertia.js |
| Styling         | Tailwind CSS, shadcn/ui           |
| Database        | MySQL 8.0+                        |
| Forecasting     | Python 3.10+, Prophet (Meta)      |
| Dev Environment | XAMPP / Laragon                   |

---

## Prasyarat

Pastikan sudah terinstall:

- PHP >= 8.2
- Composer
- Node.js >= 18 & npm
- MySQL 8.0+
- Python >= 3.10
- pip

---

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/affren-flow.git
cd affren-flow
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Install Dependensi Node

```bash
npm install
```

### 4. Install Dependensi Python

```bash
pip install prophet pandas numpy
```

> Kalau pakai sistem yang punya package manager ketat (Ubuntu/Debian):
>
> ```bash
> pip install prophet pandas numpy --break-system-packages
> ```

### 5. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` sesuai konfigurasi lokal:

```env
APP_NAME=AffrenFlow
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=affren_flow
DB_USERNAME=root
DB_PASSWORD=

# Path ke Python — sesuaikan dengan environment
PYTHON_BIN=python
# Windows (contoh): PYTHON_BIN=C:/Python310/python.exe
# Linux/Mac:        PYTHON_BIN=python3
```

### 6. Buat Database

Buat database `affren_flow` di MySQL:

```sql
CREATE DATABASE affren_flow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## Migration & Seeder

### Jalankan Migration

```bash
php artisan migrate
```

### Jalankan Seeder (semua)

```bash
php artisan db:seed
```

Perintah ini akan menjalankan seluruh seeder secara berurutan:

| Urutan | Seeder                  | Keterangan                               |
| :----: | ----------------------- | ---------------------------------------- |
|   1    | `RoleSeeder`            | Membuat role: super_admin, Admin, Mandor |
|   2    | `KategoriProyekSeeder`  | Kategori proyek konstruksi               |
|   3    | `JenisProyekSeeder`     | Jenis proyek per kategori                |
|   4    | `ProyekTransaksiSeeder` | Data simulasi 24 bulan untuk Prophet     |

> **Akun default setelah seeder:**
>
> | Role        | Email                       | Password        |
> | ----------- | --------------------------- | --------------- |
> | Super Admin | `superadmin@superadmin.com` | `superadmin123` |
> | Admin       | `admintest@admintest.com`   | `admintest123`  |
> | Mandor      | `mandortest@mandortest.com` | `mandortest123` |

### Reset & Seed Ulang (fresh)

```bash
php artisan migrate:fresh --seed
```

> ⚠️ Perintah ini akan **menghapus seluruh data** dan memulai dari awal.

### Jalankan Seeder Tertentu

```bash
# Hanya data proyek & transaksi (data simulasi Prophet)
php artisan db:seed --class=ProyekTransaksiSeeder
```

---

## Menjalankan Aplikasi

### Development

Jalankan dua terminal secara bersamaan:

**Terminal 1 — Laravel server:**

```bash
php artisan serve
```

**Terminal 2 — Vite dev server:**

```bash
npm run dev
```

Akses aplikasi di: `http://localhost:8000`

### Production Build

```bash
npm run build
php artisan optimize
```

---

## Struktur Direktori Penting

```
affren-flow/
├── app/
│   ├── Http/Controllers/
│   │   ├── ProyekController.php
│   │   ├── TransaksiController.php
│   │   ├── DashboardController.php
│   │   └── ForecastController.php
│   ├── Models/
│   │   ├── Proyek.php
│   │   ├── Transaksi.php
│   │   └── ItemTransaksi.php
│   ├── Services/
│   │   └── FinanceService.php          # Logika agregasi cash flow
│   └── python/
│       └── prophet_runner.py           # Script Prophet (Python)
├── database/
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── RoleSeeder.php
│       ├── KategoriProyekSeeder.php
│       ├── JenisProyekSeeder.php
│       └── ProyekTransaksiSeeder.php   # Data simulasi 24 bulan
└── resources/
    └── js/
        └── pages/
            ├── dashboard/
            ├── proyek/
            ├── transaction/
            └── forecasting/
```

---

## Fitur Utama

- **Manajemen Proyek** — CRUD proyek dengan tracking pagu, pajak, status, dan mandor
- **Pencatatan Transaksi** — Input pengeluaran per kategori (material, jasa tukang, operasional, mandor, biaya tak terduga) lengkap dengan item detail
- **Analisis Laba Rugi** — Perbandingan anggaran vs realisasi per proyek
- **Dashboard** — Ringkasan keuangan perusahaan dengan filter periode
- **Cash Flow Agregasi** — Rekap pemasukan & pengeluaran bulanan perusahaan
- **Forecasting Prophet** — Prediksi cash flow hingga 24 bulan ke depan dengan confidence interval 95% dan metrik MAE/MAPE

---

## Konfigurasi Python (Prophet)

Script Prophet berada di `app/python/prophet_runner.py`. Pastikan variabel `PYTHON_BIN` di `.env` mengarah ke binary Python yang sudah terinstall Prophet.

**Verifikasi instalasi Prophet:**

```bash
python -c "from prophet import Prophet; print('Prophet OK')"
```

**Jika menggunakan virtual environment:**

```bash
# Buat venv
python -m venv venv

# Aktifkan (Windows)
venv\Scripts\activate

# Aktifkan (Linux/Mac)
source venv/bin/activate

# Install
pip install prophet pandas numpy

# Set di .env
PYTHON_BIN=C:/path/to/project/venv/Scripts/python.exe
```

---

## Troubleshooting

**Migration error foreign key:**

```bash
# Jalankan dengan urutan yang benar
php artisan migrate:fresh
php artisan db:seed
```

**Prophet tidak ditemukan:**

```bash
# Cek path Python
where python      # Windows
which python3     # Linux/Mac

# Update PYTHON_BIN di .env sesuai output di atas
```

**Vite error saat npm run dev:**

```bash
npm install
npm run dev
```

**Permission error storage/logs:**

```bash
chmod -R 775 storage bootstrap/cache   # Linux/Mac
php artisan storage:link
```

---

## Lisensi

Dikembangkan untuk keperluan penelitian skripsi — **Universitas Raharja, 2026**.

> _Implementasi Metode Prophet untuk Prediksi Cash Flow pada Sistem Manajemen Keuangan Proyek Konstruksi_
>
> **Ahmad Herkal Taqiyudin** — NIM: 2222476488
