# 📖 Kamus Bab 3: Logika Private — Sistem Login & Sesi

---

## 🗺️ Peta File Bab 3

| File | Lokasi | Fungsi |
|---|---|---|
| `AuthPage.jsx` | `src/components/admin/` | **Pintu Masuk Kasir.** Halaman untuk memasukkan Email dan Password. |
| `App.jsx` | `src/` | **Otak & Satpam Keamanan.** Mengatur gembok sesi dan sensor deteksi afk (Idle Timer). |

---

## 📌 3.1 — Sistem Login (AuthPage.jsx)

- **Tidak Ada Form Register:** Keamanan tingkat pertama. Pegawai nggak boleh bikin akun sendiri. Akun hanya bisa dibuat dari dalam dashboard (database) Supabase oleh pemilik toko.
- **`supabase.auth.signInWithPassword()`**: Kode kunci untuk nyuruh Supabase mencocokkan email dan password.
- **Anti Double-Klik (`isSubmitting`)**: Saat tombol login ditekan, sistem otomatis membuat tombol tidak bisa ditekan lagi (`disabled`) sampai jawaban dari Supabase datang. Ini mencegah server kelebihan beban (spam request).
- **Auto-Clear Error**: Saat user salah masukin password dan muncul tulisan merah, tulisan itu langsung hilang otomatis pas user mulai ngetik ulang (`onChange`). Biar pengalaman pengguna (UX) lebih nyaman.

---

## 📌 3.2 — Penjaga Pintu Admin & Sensor Nganggur (App.jsx)

### 1. CCTV Sistem (`onAuthStateChange`)
Fungsi `App.jsx` akan mengecek terus-menerus apakah pengunjung punya "Tiket" (Session) yang valid. Kalau session-nya hilang, status aksesnya (role) langsung dicabut.

### 2. Sensor Anti-Lalai (`Idle Timer Timeout`)
Fitur ini dipasang khusus HANYA di halaman `admin` untuk mencegah penyalahgunaan kalau perangkat kasir ditinggal nyala.
- **Cara kerjanya**: Aplikasi punya timer (misal: 10 menit = 600000 ms). Kalau kasir ngetik, ngeklik, atau geser mouse, timer otomatis ngulang dari 0 (`clearTimeout`).
- Kalau 10 menit kasir diam sama sekali (pergi ke toilet dll), React otomatis memanggil `supabase.auth.signOut()` (keluar akun).
- **Pop-up Sesi Habis**: Begitu di-logout otomatis, layar admin ditutup secara paksa dengan Pop-up Sesi Habis (`isSessionExpired = true`). 

---

## 💬 Pertanyaan Ujian & Cara Menjawabnya

**Q1: "Kenapa di halaman login tidak ada tombol Daftar / Register?"**
> *Jawab: "Demi keamanan, Pak/Bu. Ini aplikasi kasir yang sifatnya private. Pembuatan akun baru hanya boleh dilakukan oleh pihak manajemen (owner) secara manual melalui dashboard Supabase, bukan oleh publik."*

**Q2: "Coba jelaskan fungsi `async/await` saat proses Login!"**
> *Jawab: "Proses mencocokkan email dan password ke server Supabase membutuhkan waktu. Kata `await` memaksa kode React untuk berhenti sejenak dan menunggu hingga Supabase memberikan jawaban (berhasil atau gagal), sebelum melanjutkan ke baris kode berikutnya."*

**Q3: "Apa fungsi Idle Timer Timeout dan bagaimana cara kerjanya?"**
> *Jawab: "Ini adalah fitur keamanan otomatis. Jika di halaman admin tidak terdeteksi adanya aktivitas kursor, klik, atau ketikan dari keyboard selama 10 menit berturut-turut, sistem akan secara otomatis melakukan Logout (keluar akun) dan menutup layar dengan peringatan Sesi Habis. Ini mencegah penyalahgunaan jika perangkat kasir ditinggalkan tanpa pengawasan."*
