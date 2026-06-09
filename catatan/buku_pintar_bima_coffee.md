# 📖 Buku Pintar Ujian RPL: Bima Coffee (Versi Refactor)

Buku ini berisi ringkasan seluruh sistem (Bab 1 sampai Bab 5) menggunakan bahasa "warung" yang gampang diingat saat presentasi di depan dosen penguji.

---

## 🏗️ BAB 1: Arsitektur & Keamanan (Fondasi)

### 1. File Pusat (`App.jsx` & `main.jsx`)
- **`main.jsx`**: Pintu gerbang utama. Fungsinya cuma satu: mencolokkan mesin React ke dalam kerangka HTML (elemen ber-ID `root`).
- **`App.jsx`**: "Direktur Utama" alias otak website. Di sinilah **State Lifting** (data yang dibagi-bagi ke komponen bawah) diatur. Termasuk data `products`, `orderItems` (keranjang), `globalSettings`, dan mengatur Halaman mana yang sedang tampil (Routing).

### 2. State-Based Routing (Pindah Halaman Tanpa React Router)
Website ini **tidak** menggunakan library tambahan seperti `react-router-dom`. Sebagai gantinya, ia menggunakan State bernama `currentView` (isinya: `landing`, `auth`, `admin`, `full_catalog`).
- **Cara Kerja:** React cuma menyembunyikan halaman yang tidak aktif dan memunculkan halaman yang namanya sedang terpilih di `currentView`.
- **Auto-Save Halaman (`useEffect`)**: Setiap kali pindah halaman, nama halamannya disimpan ke `localStorage`. Jadi kalau pembeli nggak sengaja nge-refresh browser (F5), layarnya gak balik dari awal, tapi tetap di halaman terakhir.

### 3. Koneksi Supabase (`supabaseClient.js` & `.env.local`)
- Kunci brankas database ditaruh di file tersembunyi bernama `.env.local` biar nggak bisa dicolong orang lewat GitHub.
- Keamanan datanya dilindungi oleh **Row Level Security (RLS)** di server Supabase. Walaupun Kunci (API Key) ini sifatnya publik (Anon Key), pengunjung biasa tetap **tidak bisa** menghapus atau mengganti harga kopi, karena database tahu pengunjung itu bukan Admin.

---

## 🎡 BAB 2: Logika Halaman Depan & Animasi (Public)

### 1. Struktur Landing Page (`LandingPageView.jsx`)
- Halaman ini cuma bertugas menyusun komponen: `Hero`, `Intro`, `Bean`, `Catalog`, dan `OrderForm` dari atas ke bawah secara berurutan.

### 2. Animasi Framer Motion (Scroll-Driven)
Di web ini, animasi nggak pakai CSS biasa, tapi pakai library `framer-motion`. Penguji pasti tanya bedanya.
- **Auto-Play (`Hero.jsx`)**: Teks "Scroll to Discover" muter naik-turun terus-terusan walau user diam. Kodenya: `animate={{ y: [0, 7, 0] }}` dengan `repeat: Infinity`.
- **Scroll-Driven (`IntroSection` & `BeanSection`)**: Bunga muter dan biji kopi membesar. Ini pakai trik `useScroll` dan `useTransform`. Kalau jarimu berhenti nge-scroll, animasinya ikut berhenti.
- **Fisika Pegas (`useSpring`)**: Dipakai supaya animasi scroll-nya terasa halus dan empuk (nggak kaku).
- **In-View (`ProductCatalog`)**: Kartu kopi muncul bergantian (staggered) dari bawah saat pertama kali nongol di layar. Kodenya pakai `whileInView` dan cuma jalan sekali (`viewport={{once:true}}`).

### 3. Logika Keranjang (`smartAddProduct`)
Fungsi cerdas saat tombol "Pesan" diklik:
1. **Pencegah Dobel**: Mengecek keranjang. Kalau kopi itu sudah dipesan sebelumnya, klik diabaikan. User disuruh ganti jumlah `quantity` di kotak bawah.
2. **Auto-Scroll**: Begitu sukses diklik, layar otomatis meluncur ke form kasir bawah.

### 4. Navbar Pintar & Footer Stempel
- **Smart-Hide Navbar**: Navbar bakal transparan di atas, dan jadi hitam blur kalau di-scroll bawah. Kerennya, kalau user nge-scroll ke bawah navbar ngumpet (biar layar lega), pas scroll ke atas navbar nongol lagi.
- **Tombol Rahasia Footer**: Di tulisan *Copyright* paling bawah, ada tombol kecil bertuliskan "Admin Console" buat masuk ke ruang rahasia kasir.

---

## 🔒 BAB 3: Sistem Login & Penjaga Pintu (Private)

### 1. Halaman Login (`AuthPage.jsx`)
- **Tanpa Tombol Daftar**: Form "Register" sengaja dihilangkan. Akun admin cuma bisa dibuat secara manual dari dalam Dashboard Supabase langsung.
- **Anti Spam**: Saat tombol "Authenticate" ditekan, ada variabel `isSubmitting = true` yang bikin tombol langsung abu-abu mati (disabled). Ini biar kasir gak neken tombol dua kali dan bikin server jebol.
- **Async/Await**: Kode dipaksa menunggu jawaban (berhasil/gagal) dari server Supabase sebelum merubah tampilan layar.

### 2. Penjaga Pintu / Satpam (`App.jsx`)
Gimana kalau orang nekat ngetik URL `#admin` di browser?
- **CCTV Session (`onAuthStateChange`)**: Satpam bakal terus ngecek "Tiket" (Session) user. Kalau dia nggak punya tiket tapi maksa masuk halaman admin, layarnya bakal otomatis ditutup Pop-up "Sesi Habis".
- **Idle Timer (Sensor Pasif)**: Kalau kasir pergi ke toilet selama 10 menit (mouse & keyboard diam), sistem akan otomatis mencabut tiketnya (`signOut`) lalu ngusir dia kembali ke halaman depan demi keamanan dari orang iseng.

---

## 💼 BAB 4: Dapur Restoran & CRUD (Admin)

Pusat kendali admin diatur oleh `AdminDashboard.jsx`.

### 1. Navigasi Berbasis Role (Otoritas)
Hanya akun yang punya role `'owner'` yang bisa melihat tombol tab "Kelola Menu" dan "Pengaturan". Kalau yang login Barista atau Kasir, tombol itu otomatis dihilangkan oleh kode JavaScript.

### 2. Live Search & Filter (`OrderList.jsx`)
Pencarian nama pelanggan atau WhatsApp di tabel pesanan dilakukan secara *Client-Side Filtering*.
Artinya, JavaScript (`.filter`) menyaring data langsung di memori browser secara kilat tiap kali kamu mengetik huruf, tanpa perlu ngirim *request* dan nge-load ulang database. Sangat ringan!

### 3. Pabrik CRUD (`ProductManager.jsx`)
- **Create (`.insert`)**: Bikin menu baru. Sistem otomatis bikin ID unik dengan cara ngubah huruf jadi kecil dan spasi diganti strip.
- **Read**: Data pesanan ditarik pakai `fetchProducts()`.
- **Update (`.update`)**: Ganti nama/harga kopi, atau ngeklik tombol cepat untuk ganti status "Tersedia" jadi "Habis".
- **Delete (`.delete`)**: Hapus kopi permanen. Tapi dikunci pakai Modal Konfirmasi biar kasir gak kepencet.
- **Refresh Gaib (`onProductsChange`)**: Setiap habis aksi nambah/hapus kopi, React otomatis nge-fetch ulang (refresh) tanpa ngerubah posisi layar.

### 4. Sihir Cetak Struk
Saat tombol Cetak ditekan, kode CSS sakti bernama `@media print` akan langsung menyembunyikan semua warna dan layout website, lalu *hanya memunculkan* satu kotak struk putih berukuran kertas kasir (thermal). Kemudian browser menjalankan perintah `window.print()`.

---

## 🌍 BAB 5: Arus Pajak PPN (State Lifting Lanjutan)

Fitur Pajak menggunakan sistem arus sungai (Hulu-Hilir).
- **Hulu (`App.jsx`)**: Supabase ngirim data pajak 11% ke penampungan `globalSettings`.
- **Hilir**: 
  - Mengalir ke `OrderForm`: Mesin kalkulator nambahin 11% ke total belanja.
  - Mengalir ke `ProductManager`: Biar Pemilik bisa ngerubah angkanya dari 11% jadi 12%.
  - Saat diubah ke 12% dan disimpan, Hulu (`App.jsx`) bakal memanggil ulang (fetch) angka baru tersebut, lalu seketika semua hitungan kasir berubah mengikuti angka 12% tanpa perlu *refresh* website.

---
*Semangat Ujiannya! Kamu menguasai ini dari kulit sampai tulang-tulangnya.* 🔥
