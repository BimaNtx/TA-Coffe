# BIMA COFFEE — Specialty Coffee Roaster ☕

Sistem *Point of Sales* (POS) dan *Landing Page* interaktif yang dibangun menggunakan React.js dan Supabase. Proyek ini dikembangkan sebagai tugas implementasi nyata sistem kasir dan katalog digital untuk *coffee shop*.

## 🚀 Fitur Utama

Sistem ini memisahkan antarmuka pengguna menjadi dua bagian utama menggunakan pendekatan *State-Based Routing* dan *Role-Based Access Control* (RBAC).

### 1. Customer Facing (Landing Page & Order)
* **Katalog Interaktif:** Menampilkan kurasi biji kopi *single-origin* dengan efek animasi *scroll* berbasis Framer Motion.
* **Smart Cart System:** Penambahan menu cerdas yang mencegah duplikasi item.
* **Formulir Pemesanan POS:** Mendukung dua tipe pesanan (*Dine In* dan *Takeaway*).
* **Kalkulasi Otomatis:** Menghitung total harga, *subtotal*, dan pengenaan pajak PPN secara *real-time*.

### 2. Admin Console (Dashboard & Manajemen)
* **Manajemen Pesanan (Kasir):** Memantau pesanan masuk, memperbarui status (Pending → Diproses → Selesai), dan sistem cetak struk (Thermal Printer Style via `@media print`).
* **Manajemen Menu (CRUD):** Tambah, edit, hapus, dan ubah status ketersediaan produk (khusus role *Owner*).
* **Pengaturan Global:** Konfigurasi status pajak PPN dan persentasenya.
* **Laporan Analitik:** Visualisasi tren pendapatan harian dan menu terlaris menggunakan grafik *Recharts*.
* **Sistem Keamanan:** Autentikasi Supabase, pembatasan akses (*Barista* tidak dapat melihat harga/struk), dan fitur *Auto-Logout* (Idle Timeout).

## 🛠️ Tech Stack

* **Frontend Framework:** [React.js](https://react.dev/) (Vite)
* **Backend & Database:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
* **Styling & UI:** CSS Modules (High-Contrast Brutalism Design)
* **Animation:** [Framer Motion](https://www.framer.com/motion/)
* **Data Visualization:** [Recharts](https://recharts.org/)

## 📦 Panduan Instalasi (Lokal)

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda:

1. **Clone repositori ini:**
   ```bash
   git clone [https://github.com/username-kamu/bima-coffee.git](https://github.com/username-kamu/bima-coffee.git)
   cd bima-coffee
   ```

2. **Install dependensi (Package Modules):**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file baru bernama `.env.local` di root folder, lalu isi dengan kredensial Supabase Anda:
   ```env
   VITE_SUPABASE_URL=https://[PROJECT_ID].supabase.co
   VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
   ```

4. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:5173/`

## 📂 Struktur Direktori Utama

```text
src/
├── components/
│   ├── admin/      # Logika dashboard, CRUD menu, dan tabel pesanan
│   ├── landing/    # Komponen halaman publik (Hero, Katalog, Form)
│   └── modals/     # Sistem pop-up (Alert, Konfirmasi, Sukses)
├── App.jsx         # Root component & State-Based Routing Controller
├── App.css         # Variabel CSS global
└── main.jsx        # React DOM entry point
```

## 👨‍💻 Pengembang

Dikembangkan oleh **Bima Ananta**