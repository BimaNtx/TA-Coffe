# 📖 Kamus Bab 4 & 5: Logika Admin (Dashboard) & Pengaturan Global

---

## 🗺️ Peta File Admin & Global

| File | Lokasi | Fungsi |
|---|---|---|
| `AdminDashboard.jsx` | `src/components/admin/` | **Manajer Cabang.** Navigasi tab (Pesanan, Menu, Pengaturan, Laporan), mengatur otoritas Role (kasir vs owner), dan punya sihir cetak struk CSS. |
| `OrderList.jsx` | `src/components/admin/` | **Meja Daftar Pesanan.** Nampilin semua pesanan, punya fitur pencarian (*Live Search*) instan tanpa muter-muter (reload). |
| `ProductManager.jsx` | `src/components/admin/` | **Dapur CRUD Utama.** Tempat eksekusi *Create, Read, Update, Delete* kopi dan menyimpan settingan Pajak. |
| `App.jsx` | `src/` | **Hulu Sungai (State Lifting).** Mengambil data pajak dari Supabase dan mendistribusikan kabarnya ke seluruh website (Hilir). |

---

## 📌 4.1 — AdminDashboard (Sang Manajer)

- **Conditional Rendering (Tab Navigasi)**: Cara React mindah-mindahin tampilan halaman tanpa ngebuka file HTML baru, cukup menyembunyikan bagian yang gak diklik dan memunculkan yang diklik (contoh: tab 'orders', 'menu').
- **Role-Based Access Control (Otoritas Jabatan)**: 
  - Karyawan biasa (Kasir) cuma bisa lihat menu "Daftar Pesanan".
  - Barista malah lebih ketat lagi, kolom Harga & Pembayaran disembunyikan pakai kode `userRole !== 'barista'`.
  - Hanya Pemilik (Owner) yang bisa melihat dan mengklik tab "Kelola Menu", "Pengaturan", dan "Laporan".
- **Sihir Cetak Struk (`@media print`)**: Teknik CSS khusus yang memaksa mesin printer HANYA mencetak layout kotak struk kasir dan menyembunyikan semua tombol, warna, dan navigasi website lainnya saat fungsi `window.print()` dipanggil.

---

## 📌 4.2 — Mesin CRUD & Filter Instan

### OrderList (Fitur Cari Instan)
- **Client-side Filtering (`.filter()`)**: Pencarian di website kamu sangat cepat karena data tidak dicari di server Supabase, melainkan dicari langsung di dalam memori perangkat kasir (laptop/HP) setiap kali kasir mengetik huruf di kolom pencarian.

### ProductManager (CRUD Supabase)
- **C**reate: `.insert()` — Menambah kopi baru. Sebelum ditambah, nama kopi diubah jadi huruf kecil, dibersihkan spasinya (`.trim`), dan spasi tengahnya diubah jadi strip (`.replace`) agar jadi ID yang unik.
- **R**ead: `fetchProducts()` — Membaca (menarik) seluruh data kopi dari database lalu diurutkan sesuai abjad.
- **U**pdate: `.update()` — Digunakan untuk 2 hal: (1) Ngedit harga/nama kopi, (2) Tombol sakelar ganti status Stok dari 'Tersedia' ke 'Habis'.
- **D**elete: `.delete()` — Digunakan untuk menghapus kopi secara permanen. Tapi dikunci pakai Modal Konfirmasi (Pop-up yakin) biar kasir gak gak sengaja kepencet.
- **`onProductsChange()` (Tombol Refresh Gaib)**: Setelah berhasil Tambah/Edit/Hapus, fungsi ini dipanggil supaya website otomatis me-refresh data tampilan layarnya sendiri secara otomatis.

---

## 📌 Bab 5 — Arus Pajak Global (State Lifting)

- **State Lifting (Sistem Hulu Hilir)**: 
  Fitur PPN menggunakan sistem *arus air*. `App.jsx` (Hulu) mengambil data pengaturan PPN dari Supabase, lalu menyebarkan status pajaknya (Hilir) ke 3 tempat:
  1. Ke `ProductManager` (agar Owner bisa ngubah persentasenya).
  2. Ke `OrderForm` (agar mesin kasir tahu saatnya nambah hitungan pajak ke total belanja).
  3. Ke `AdminDashboard` (agar printer struk tahu untuk menyelipkan baris tulisan PPN).
- Saat Owner merubah pajak dari 11% ke 12% dan menyimpan, `App.jsx` akan mendeteksi perubahan, mengambil (fetch) ulang data 12% tersebut, dan seketika semua hitungan kasir di seluruh website akan menyesuaikan secara otomatis.

---

## 💬 FAQ Penguji (Pertanyaan Jagoan)

**Q1: "Bagaimana cara Anda mengamankan agar Karyawan biasa tidak bisa menghapus/mengganti harga menu?"**
> *Jawab: "Saya menerapkan Role-Based Access Control (RBAC). Pertama di sisi tampilan (Frontend), jika peran yang login bukan 'owner', saya menyembunyikan seluruh tombol menu 'Kelola Menu' dan 'Pengaturan'. Kedua di sisi Server (Backend), saya mengamankan database Supabase dengan sistem RLS (Row Level Security) sehingga karyawan tidak bisa membobolnya meski mengutak-atik kode website."*

**Q2: "Jika saya melakukan pencarian nama pelanggan di Daftar Pesanan, apakah proses itu membebani kuota request database server Anda?"**
> *Jawab: "Tidak, Pak/Bu. Fitur pencarian saya menggunakan metode Client-Side Filtering dengan fungsi JavaScript `.filter()`. Pencarian dilakukan seketika di dalam memori browser lokal perangkat setelah seluruh data ditarik di awal, sehingga tidak mengirimkan request berulang ke server Supabase, membuatnya sangat cepat dan hemat kuota server."*

**Q3: "Apa maksud kode `@media print` yang ada di AdminDashboard?"**
> *Jawab: "Kode itu adalah teknik khusus CSS. Fungsinya untuk mengambil alih tampilan saat browser menjalankan perintah cetak (print). Seluruh antarmuka website berwarna warni akan disembunyikan oleh CSS tersebut, dan ia hanya akan menampilkan dan mencetak kerangka layout khusus struk kasir berukuran kertas thermal."*
