# 📖 Kamus Bab 1: Arsitektur Utama & Koneksi Supabase

---

## 🗺️ Peta File Bab 1

| File | Lokasi | Fungsi |
|---|---|---|
| `index.html` | `/index.html` | File pertama yang dibuka browser. Berisi kotak kosong `<div id="root">` dan perintah jalankan `main.jsx` |
| `main.jsx` | `/src/main.jsx` | Menempelkan React ke kotak kosong `<div id="root">`. Merender komponen `App` |
| `App.jsx` | `/src/App.jsx` | **Bos besar.** Pusat komando seluruh website. Semua halaman dan data penting diatur dari sini |
| `.env.local` | `/.env.local` | Brankas rahasia. Menyimpan alamat (URL) dan kunci (anon key) database Supabase |
| `supabaseClient.js` | `/src/supabaseClient.js` | Jembatan ke database. Baca kredensial dari `.env.local`, bikin sambungan, lalu di-export supaya file lain bisa pakai |

---

## 📌 1.1 — Cara Website Nyala (Entry Point)

### Alur
```
index.html → main.jsx → App.jsx
```

### Penjelasan
1. **Browser buka `index.html`** → di dalamnya ada kotak kosong `<div id="root">` dan script ke `main.jsx`
2. **`main.jsx` jalan** → cari kotak `id="root"`, lalu bilang ke React: "Isi kotak ini pakai komponen `App`"
3. **`App.jsx` mulai bekerja** → semua halaman, data, dan logika diatur dari sini

### Yang perlu diingat
- ID di `main.jsx` (`document.getElementById('root')`) **harus sama persis** dengan ID di `index.html` (`<div id="root">`)
- Kalau beda → React dapat `null` → **crash, layar putih kosong**
- `<StrictMode>` itu bukan tampilan. Ini mode development supaya React kasih peringatan kalau ada kode yang kurang bener

### 💬 Contoh jawaban untuk penguji
> *"Browser buka `index.html`, lalu `main.jsx` menempel React ke `<div id="root">`, lalu `App.jsx` yang mengatur semuanya mulai jalan."*

---

## 📌 1.2 — Cara Ngobrol sama Database (Koneksi Supabase)

### 2 File yang dibutuhkan

**`.env.local`** — Berisi:
- `VITE_SUPABASE_URL` → alamat database kamu di internet
- `VITE_SUPABASE_ANON_KEY` → kunci masuk (bersifat publik)

**`supabaseClient.js`** — Baca kedua nilai di atas, lalu bikin sambungan:
```jsx
const supabase = createClient(url, key);
```

### Yang perlu diingat
- Variabel di `.env.local` **WAJIB** diawali `VITE_` supaya Vite mau bacakan ke kode
- Tanpa awalan `VITE_` → nilainya jadi `undefined` → koneksi gagal → semua fitur database mati
- `.env.local` **nggak ke-upload ke GitHub** (dilindungi `.gitignore`)
- Cara baca di kode: `import.meta.env.VITE_NAMA_VARIABEL`
- Sambungan `supabase` di-export → file manapun bisa import dan pakai

### ⚠️ Catatan Keamanan (Sering Ditanya Penguji!)
- **URL dan anon key BISA dilihat semua orang** yang buka website kamu (lewat F12 / DevTools)
- Ini memang **dirancang begitu** — anon key itu bersifat publik
- **Data tetap aman** karena dilindungi **Row Level Security (RLS)** di Supabase
- RLS = aturan di database, contoh: "Tabel produk boleh dibaca semua orang, tapi cuma admin yang boleh edit"
- Jadi **keamanan datanya bukan dari menyembunyikan kunci, tapi dari aturan di database**

### 💬 Contoh jawaban untuk penguji
> *"Kredensial disimpan di `.env.local` dengan prefix `VITE_`. File `supabaseClient.js` baca kredensial itu dan bikin koneksi pakai `createClient`, lalu di-export supaya bisa dipakai di file manapun."*
>
> Kalau ditanya soal keamanan:
> *"Anon key memang terlihat di frontend, tapi data tetap aman karena dilindungi Row Level Security (RLS) di Supabase."*

---

## 📌 1.3 — Cara Pindah Halaman (State-Based Routing)

### Konsep
- Nggak pakai library `react-router-dom`
- Cukup pakai **satu variabel** bernama `currentView` (App.jsx, baris 63)
- Isinya teks biasa: `'landing'` / `'auth'` / `'admin'` / `'full_catalog'`
- **Ganti isi teksnya = pindah halaman**

### Cara kerja di kode

**Variabel halaman** (baris 63-70):
```jsx
const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('bimaCoffeeView');
    const VALID_VIEWS = ['landing', 'auth', 'admin', 'full_catalog'];
    return VALID_VIEWS.includes(saved) ? saved : 'landing';
});
```
- Pertama kali buka → cek localStorage, ada halaman tersimpan?
- Kalau ada DAN masuk daftar valid → pakai itu
- Kalau nggak ada atau nilainya aneh → paksa ke `'landing'`

**Fungsi pindah halaman** — `navigateTo` (baris 78-85):
Melakukan **3 hal** setiap dipanggil:
1. Ganti isi `currentView` ke halaman tujuan
2. Hapus hash dari URL (misal `#order`)
3. Paksa scroll ke posisi paling atas

**Tampilkan halaman yang aktif** (baris 366-415):
```jsx
{currentView === 'auth'    && <AuthPage />}
{currentView === 'admin'   && <AdminDashboard />}
{currentView === 'landing' && <LandingPageView />}
```
- React cek satu per satu: "currentView isinya apa?"
- **Cuma 1** yang cocok dan tampil, sisanya disembunyikan

**Simpan otomatis** (baris 94-96):
- Setiap ganti halaman → simpan ke localStorage
- Kalau refresh browser → halaman nggak reset, tetap di halaman terakhir
- Yang disimpan: kunci `bimaCoffeeView`, isinya nama halaman (misal `admin`)

### Yang perlu diingat
- Kalau set `currentView` ke nilai yang **nggak ada di conditional rendering** (misal `'about'`) → layar **KOSONG** (bukan landing!)
- Array `VALID_VIEWS` cuma menjaga saat **pertama kali buka / refresh**. Kalau kode-nya sendiri set nilai aneh, nggak ada yang nahan
- `SessionExpiredModal` ditaruh **di luar** semua blok halaman → bisa muncul di atas halaman manapun, nggak terikat `currentView`

### 💬 Contoh jawaban untuk penguji
> *"Saya pakai state-based routing. Variabel `currentView` menentukan halaman mana yang aktif. Saat nilainya berubah, React otomatis render komponen yang sesuai. Nggak perlu library router karena project ini skalanya kecil."*

---

## 📌 1.4 — Cara Data Mengalir (State Lifting & Props Drilling)

### Konsep
- **Data penting disimpan di App.jsx** (tempat tertinggi), bukan di komponen kecil
- Lalu **dikirimkan ke bawah** lewat props (barang kiriman)
- Tujuannya: **satu sumber data** → semua komponen dapat data yang sama → selalu sinkron

### Daftar data penting di App.jsx

| Nama | Baris | Isinya | Siapa yang pakai |
|---|---|---|---|
| `products` | 121 | Daftar produk kopi dari database | Landing, FullCatalog, Admin |
| `orderItems` | 296 | Daftar pesanan yang sedang dibuat customer | Landing, FullCatalog |
| `globalSettings` | 162 | Pengaturan toko (pajak aktif/tidak, berapa %) | Landing, FullCatalog, Admin |
| `userRole` | 129 | Peran user yang login (owner/kasir/barista) | Admin |
| `currentView` | 63 | Halaman yang sedang aktif | Semua (navigasi) |
| `isSessionExpired` | 136 | Apakah sesi admin sudah habis | SessionExpiredModal |

### Contoh pengiriman data

```jsx
<LandingPageView products={products.slice(0, 3)} />
```
→ Landing dapat **3 produk pertama** (preview)

```jsx
<FullCatalogView products={products} />
```
→ FullCatalog dapat **semua produk**

```jsx
<AdminDashboard products={products} onProductsChange={fetchProducts} />
```
→ Admin dapat semua produk + **fungsi untuk refresh data** setelah CRUD

### Alur update data setelah admin CRUD
```
Admin simpan produk baru
    → data masuk ke database Supabase
    → Admin panggil onProductsChange (= fetchProducts milik App)
    → App ambil ulang data dari database
    → State "products" di App berubah
    → Semua komponen yang pakai products otomatis dapat data terbaru
```

### Yang perlu diingat
- Kalau kirim `orderItems` tanpa `setOrderItems` → komponen bisa **lihat** data tapi **nggak bisa ubah**
- `orderItems` = layar TV (bisa lihat), `setOrderItems` = remote TV (bisa ganti)
- Props Drilling punya **kelemahan**: kalau project besar, data harus dioper lewat banyak komponen perantara yang nggak butuh datanya. Solusi untuk project besar: **React Context API** atau **Zustand/Redux**
- Untuk project kamu yang skalanya kecil-menengah, props drilling **masih oke**

### 💬 Contoh jawaban untuk penguji
> *"State penting seperti products dan orderItems saya simpan di App.jsx supaya jadi satu sumber data. Semua komponen yang butuh tinggal terima lewat props. Kalau admin ubah data, App fetch ulang dari database, lalu semua komponen otomatis dapat data terbaru."*

---

## 📌 1.5 — Cara Folder Diatur & CSS Modules

### Struktur folder
```
components/
├── landing/   → tampilan untuk CUSTOMER (pengunjung)
├── admin/     → tampilan untuk PENGELOLA (setelah login)
├── common/    → dipakai BERSAMA (Navbar, Footer)
└── modals/    → semua POP-UP
```

Logikanya: **kelompokkan berdasarkan siapa yang pakai**.

### CSS Modules
- File CSS dinamai `NamaKomponen.module.css` (ada kata `.module`)
- **Gunanya:** mencegah nama class bentrok antar komponen
- Vite otomatis bikin nama class jadi **unik** di belakang layar
- `.title` di Hero jadi `Hero_title_x7f2a`, `.title` di Admin jadi `Admin_title_k9b3c`

### Cara pakai di kode
```jsx
import styles from './Hero.module.css';    // import jadi variabel
<section className={styles.hero}>          // pakai lewat variabel
```

### Bedanya dengan CSS biasa
| CSS Biasa | CSS Modules |
|---|---|
| `className="hero"` | `className={styles.hero}` |
| Nama class bisa bentrok | Nama class selalu unik |
| Berlaku global | Terisolasi per komponen |

### Yang perlu diingat
- `Receipt.css` (tanpa `.module`) → sengaja global karena butuh aturan `@media print` untuk cetak struk
- Kalau bikin komponen baru untuk landing → taruh di `components/landing/`
- Kalau komponen itu dipakai di landing DAN admin → taruh di `components/common/`

### 💬 Contoh jawaban untuk penguji
> *"Folder dikelompokkan berdasarkan fitur: landing untuk customer, admin untuk pengelola, common untuk yang dipakai bersama. Saya pakai CSS Modules supaya class antar komponen tidak bentrok — Vite otomatis bikin nama unik."*

---

## 🧪 Catatan dari Sesi Tanya-Jawab

### ❌ Kesalahan yang harus dihindari

1. **"Anon key harus disembunyikan supaya aman"**
   → SALAH. Anon key memang bisa dilihat publik. Keamanan dari **RLS di database**, bukan dari menyembunyikan kunci.

2. **"Kalau currentView diisi nilai aneh, tampil halaman landing"**
   → SALAH (kalau di runtime). Yang tampil adalah **layar kosong** karena nggak ada conditional rendering yang cocok. Whitelist `VALID_VIEWS` cuma bekerja saat inisialisasi dari localStorage.

3. **"Tambah halaman baru cukup edit 2 tempat"**
   → KURANG. Butuh **4 langkah**: bikin file komponen → import di App.jsx → tambah ke VALID_VIEWS → tambah conditional rendering.

### ✅ Poin yang sudah dikuasai
- Alur `index.html → main.jsx → App.jsx`
- Kenapa variabel `.env.local` harus diawali `VITE_`
- Cara kerja `navigateTo` (3 fungsinya)
- Kenapa state di-lift ke App.jsx (single source of truth)
- Bedanya CSS biasa vs CSS Modules
- Pengelompokan folder berdasarkan siapa yang pakai
