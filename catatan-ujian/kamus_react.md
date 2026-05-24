# 📖 Kamus React — Bahasa Warung

Buka file ini kapan aja kalau lupa istilah!

---

## Istilah Dasar

| Istilah | Artinya (Bahasa Warung) | Contoh di Project Kamu |
|---|---|---|
| **State** | Variabel yang kalau berubah, layar otomatis berubah juga. Kayak papan skor — angka berubah, penonton langsung lihat. | `products`, `currentView`, `orderItems` |
| **setState / set...** | Tombol untuk mengubah state. Kamu **nggak bisa** ubah state langsung, harus lewat tombol ini. | `setProducts`, `setCurrentView`, `setOrderItems` |
| **Props** | Barang kiriman dari komponen induk ke komponen anak. Kayak ibu kasih uang jajan ke anak — anak terima, tapi nggak bisa ubah jumlahnya. | `<LandingPageView products={...} />` |
| **Komponen** | Satu blok tampilan yang bisa dipakai ulang. Kayak LEGO — satu balok punya fungsi sendiri, digabung jadi rumah. | `Navbar`, `ProductCatalog`, `OrderForm` |
| **Render** | Proses React menggambar tampilan ke layar. Setiap state berubah, React "gambar ulang" bagian yang terpengaruh. | — |
| **Re-render** | Gambar ulang. Terjadi otomatis saat state atau props berubah. | — |

---

## Istilah Fungsi

| Istilah | Artinya | Contoh |
|---|---|---|
| **fetch** | Mengambil data dari database/internet. Kayak pesan makanan — kamu minta, tunggu, lalu datanya datang. | `fetchProducts()` = ambil daftar produk dari Supabase |
| **async / await** | Cara menunggu data yang belum datang. `async` = "fungsi ini akan ada proses nunggu". `await` = "tunggu sampai selesai baru lanjut baris berikutnya". | `const { data } = await supabase.from('produk').select('*')` |
| **useEffect** | Perintah React: "Jalankan kode ini SETELAH tampilan selesai digambar". Biasa dipakai untuk fetch data, pasang timer, dll. | Fetch produk saat halaman pertama kali dibuka |
| **useState** | Cara membuat state (variabel reaktif). Hasilnya sepasang: [nilainya, tombolUbah]. | `const [products, setProducts] = useState([])` |
| **import / export** | `export` = bikin fungsi/variabel bisa dipakai file lain. `import` = ambil fungsi/variabel dari file lain. | `export const supabase` → `import { supabase }` |

---

## Istilah Arsitektur

| Istilah | Artinya |
|---|---|
| **State Lifting** | Menyimpan data di komponen paling atas (App.jsx) supaya bisa dibagikan ke semua anak. Kayak Wi-Fi router di lantai 2 — semua lantai dapat sinyal. |
| **Props Drilling** | Mengirim data dari atas ke bawah melewati beberapa komponen. Kayak estafet — tongkat dioper dari pelari 1 ke 2 ke 3. |
| **Conditional Rendering** | Tampilkan komponen HANYA kalau syarat terpenuhi. Kayak lampu otomatis — gelap nyala, terang mati. |
| **Lazy Initializer** | Nilai awal state yang dihitung sekali saja saat pertama kali muncul, tidak diulang setiap render. Kayak isi formulir pendaftaran — cuma sekali pas daftar. |

---

## Peta Fungsi Penting di App.jsx

| Nama | Baris | Fungsi (Bahasa Warung) |
|---|---|---|
| `currentView` | 63 | Menentukan halaman mana yang tampil sekarang |
| `setCurrentView` | 63 | Tombol pindah halaman |
| `navigateTo()` | 78 | Fungsi pembantu pindah halaman (pakai setCurrentView + scroll ke atas) |
| `products` | 121 | Daftar semua produk kopi dari database |
| `setProducts` | 121 | Tombol update daftar produk |
| `fetchProducts()` | 138 | Ambil ulang data produk dari Supabase |
| `orderItems` | 296 | Daftar pesanan yang sedang dibuat customer |
| `setOrderItems` | 296 | Tombol ubah daftar pesanan |
| `smartAddProduct()` | 302 | Logika pintar saat user klik "PESAN SEKARANG" |
| `globalSettings` | 162 | Pengaturan toko (pajak aktif/tidak, berapa persen) |
| `fetchSettings()` | 167 | Ambil ulang pengaturan dari Supabase |
| `userRole` | 129 | Peran user yang login (owner/kasir/barista) |
| `isSessionExpired` | 136 | Penanda apakah sesi admin sudah habis |
