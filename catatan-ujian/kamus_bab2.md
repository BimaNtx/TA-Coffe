# 📖 Kamus Bab 2: Logika Public — Landing Page

---

## 🗺️ Peta File Bab 2

| File | Lokasi | Fungsi |
|---|---|---|
| `LandingPageView.jsx` | `src/components/landing/` | **Daftar isi / Pengatur urutan.** Nyusun Hero, Intro, Catalog, OrderForm. Nggak bikin komponen sendiri, cuma manggil dan ngoper data (Props Drilling). |
| `Hero.jsx` | `src/components/landing/` | **Bagian paling atas.** Teks besar BIMA COFFEE dan gambar kopi. Pakai animasi *auto-play* berulang. |
| `IntroSection.jsx` | `src/components/landing/` | **Cerita Kopi.** Ada bunga muter & teks muncul satu-satu dari bawah (*Staggered Reveal*). Animasi jalan berdasarkan **Scroll**. |
| `BeanSection.jsx` | `src/components/landing/` | **Biji Kopi Gede.** Biji kopinya muter & bernapas, teks di belakang jalan beda arah (*Counter-Parallax*). Animasi berdasarkan **Scroll**. |
| `ProductCatalog.jsx` | `src/components/landing/` | **Katalog Menu Utama.** Nyetak 3 kartu kopi pakai `.map()`. Punya tombol tambah pesan. Animasi muncul sekali saat layar digeser ke bagian ini (`whileInView`). |
| `FullCatalogView.jsx` | `src/components/landing/` | **Katalog Lengkap.** Halaman beda, isinya grid brutalist. Tampilannya diketik langsung di file (Inline Style Javascript), nggak pakai file CSS `.module`. |
| `OrderForm.jsx` | `src/components/landing/` | **Mesin Kasir (Boss Level).** Form input nama/WA, hitung pajak otomatis, validasi isian kosong, dan tombol kirim ke database Supabase. |
| `Navbar.jsx` | `src/components/common/` | **Menu Atas.** Transparan kalau di atas, jadi hitam blur kalau di-scroll bawah. Kalau scroll ke bawah dia ngumpet, scroll naik dia muncul lagi. |
| `Footer.jsx` | `src/components/common/` | **Bagian Bawah.** Stempel tulisan raksasa terpotong. Punya **tombol rahasia** buat masuk panel Admin. |

---

## 📌 2.1 — Cara Halaman Disusun (LandingPageView)

- Halaman Landing disusun berurutan dari atas ke bawah.
- File ini adalah **tukang pos**. Dia nerima data `products` atau `orderItems` dari bos (`App.jsx`), lalu di-oper (Props Drilling) ke komponen yang butuh (misalnya `ProductCatalog` dan `OrderForm`).
- `Hero` nggak dikasih Props apa-apa karena dia statis (isinya teks mati dan gambar).

---

## 📌 2.2 & 2.3 — Rahasia Animasi (Framer Motion)

Semua pergerakan mulus di web kamu pakai bantuan `Framer Motion`. 
Pola animasinya (terutama yang ngikutin Scroll):
1. **`useScroll`**: Ngukur udah berapa persen user geser layar ke bawah (dari 0 sampai 1).
2. **`useTransform`**: Nerjemahin angka scroll jadi pergerakan. (Misal: 0 ke 1 diubah jadi putaran 0 derajat sampai 180 derajat).
3. **`useSpring`**: Rem otomatis. Bikin gerakannya ada efek "pegas/per" biar nggak kaku kayak robot pas scrollnya berhenti.

**Beda Animasi Hero dan Biji Kopi:**
- `Hero`: Pakai **Auto-play** (`repeat: Infinity`). Kalau user diem, animasinya tetep gerak (naik turun).
- `Intro & Bean`: Pakai **Scroll-driven**. Kalau user diem, animasinya ikut diem.

---

## 📌 2.4 — Logika Katalog (ProductCatalog)

- Punya 2 bagian dalam 1 file: `ProductCatalog` (induk pencetak) dan `ProductCard` (cetakannya).
- Nyetak banyak kartu sekaligus pakai **`.map()`**. Ini ibarat mesin fotokopi array.
- Kalo data URL gambar kopi dari Supabase kosong, otomatis diganti gambar `/bag1.png` berkat kode fallback: `image_url || '/bag1.png'`. Biar web nggak kelihatan rusak.

---

## 📌 2.5 — Keranjang Pintar (`smartAddProduct`)

Fungsi pintar yang ada di `App.jsx` tapi dipanggil pas user ngeklik tombol "Pesan" di katalog.
Kenapa pintar?
1. **Pencegah Dobel**: Kalau ngeklik menu yang *sama persis* dua kali, keranjang nggak bakal nambah (ditolak). User harus ngedit jumlah (quantity) langsung di form kasir.
2. **Auto-Scroll**: Begitu sukses ditambah, layar **otomatis nge-geser (scroll)** ke form kasir di bagian bawah buat ngasih tau "nih kopimu udah masuk".

---

## 📌 2.6 — Mesin Kasir (OrderForm - Boss Level)

Ini tempat kalkulator dan filter terjadi:
- **Kalkulasi Otomatis**: Nggak ada tombol "=" (sama dengan). Setiap user nambah quantity atau klik kopi, React *langsung* ngulang hitungan (Subtotal + Pajak = Total) secara instan.
- **Validasi Keras (`handleSubmit`)**: Begitu ditekan "Konfirmasi", React ngecek dulu. *Nama kosong? WA kurang?* Kalau ada yang nggak beres, keluar tulisan merah dan proses distop.
- **Pop-Up Konfirmasi (`isConfirmModalOpen`)**: Fitur "Kasir Nanya Balik". User disuruh baca lagi sebelum data *bener-bener* dikirim ke Supabase (`processFinalOrder`).

**Cara Edit Data Kopi (`updateItem`)**
Menggunakan sistem **Immutable Update**.
`{ ...item, quantity: 3 }`
Artinya: *"Tolong salin/fotokopi persis isi baris pesanan ini, tapi timpa/ubah khusus bagian quantity-nya jadi 3."*
Di React, data nggak boleh dicoret langsung, harus dibikin salinan barunya.

---

## 📌 2.7 — Navbar Pintar & Footer Brutal

- **Navbar Glassmorphism**: Nembus pandang di awal, jadi hitam pas digeser. Diatur pakai deteksi pergerakan `scroll`.
- **Navbar Smart-Hide**: Fitur ngebaca arah geseran jari/mouse. Geser ke bawah = ngumpet. Geser ke atas = nongol. Biar layar terkesan luas baca konten.
- **Footer Brutalist**: Desain gaya pabrik dengan teks gede terpotong. Di situ kamu naruh **tombol rahasia** buat pindah ke halaman Admin Console.

---

## 💬 3 Pertanyaan yang Sering Muncul dari Penguji & Jawabannya

**Q1: "Gimana cara website kamu bisa langsung ngitung harga waktu saya nambah jumlah kopi?"**
> *Jawab: "Karena saya pakai state React. Setiap kali jumlah keranjang (`orderItems`) berubah, React secara otomatis melakukan render ulang dan menjalankan rumus perhitungan (Subtotal + Pajak) di background. Jadi harganya selalu real-time tanpa perlu tombol Hitung."*

**Q2: "Animasi biji kopinya ini pakai video atau GIF?"**
> *Jawab: "Bukan Pak/Bu. Itu gambar biasa (PNG) yang saya animasikan menggunakan library Framer Motion. Putaran dan besar-kecilnya gambar terikat langsung dengan posisi scroll pengguna, sehingga terasa sangat halus berkat sistem fisika useSpring."*

**Q3: "Kalau user milih Dine In tapi lupa masukin nomor meja, pesanan tetep masuk ke database nggak?"**
> *Jawab: "Tidak akan masuk, Pak/Bu. Di dalam `OrderForm.jsx` saya punya fungsi validasi di tahap pertama (`handleSubmit`). Fungsi itu akan mendeteksi form yang kosong, menampilkan teks error merah, dan menghentikan proses sebelum data sempat dikirim ke Supabase."*
