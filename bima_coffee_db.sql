-- ==========================================
-- FILE: bima_coffee_db.sql
-- DOKUMENTASI DATABASE BIMA COFFEE ROASTERY
-- ==========================================

-- ==========================================
-- 1. TABEL PROFIL & TRIGGER (USER ROLES)
-- ==========================================
-- Buat tabel profil untuk menyimpan role pengguna
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  role text DEFAULT 'barista' CHECK (role IN ('owner', 'kasir', 'barista')),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Aktifkan Row Level Security (RLS) agar aman
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Fungsi otomatis untuk membuat baris profil saat ada user baru daftar (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', 'barista');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ==========================================
-- 2. RLS POLICIES UNTUK PROFIL
-- ==========================================
-- Hapus aturan (policy) lama yang menyebabkan infinite loop
DROP POLICY IF EXISTS "Owner bisa mengubah data profil apa saja" ON public.profiles;
DROP POLICY IF EXISTS "Profil bisa dilihat oleh semua pengguna terautentikasi" ON public.profiles;

-- Aturan: "Siapapun yang sudah login (authenticated) boleh membaca tabel profil"
CREATE POLICY "Boleh dibaca user login" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Aturan: "User hanya boleh mengupdate baris datanya sendiri"
CREATE POLICY "Boleh update data sendiri" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);


-- ==========================================
-- 3. TABEL PENGATURAN PAJAK
-- ==========================================
-- Buat tabel pengaturan
CREATE TABLE public.pengaturan (
  id int4 PRIMARY KEY DEFAULT 1,
  pajak_aktif boolean DEFAULT false,
  pajak_persen int4 DEFAULT 11
);

-- Masukkan data awal (default: pajak mati, 11%)
INSERT INTO public.pengaturan (id, pajak_aktif, pajak_persen) VALUES (1, false, 11);

-- Buka akses agar React bisa membaca dan mengubahnya
ALTER TABLE public.pengaturan ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bebas akses pengaturan" ON public.pengaturan FOR ALL USING (true);


-- ==========================================
-- 4. TABEL PRODUK
-- ==========================================
-- Membuat tabel produk
CREATE TABLE public.produk (
  id text PRIMARY KEY,
  name text NOT NULL,
  price int8 NOT NULL,
  is_available boolean DEFAULT true,
  image_url text -- Opsional, untuk link foto kopi
);

-- Mengaktifkan RLS (Satpam) untuk tabel produk
ALTER TABLE public.produk ENABLE ROW LEVEL SECURITY;

-- Aturan: Siapa saja boleh LIHAT produk
CREATE POLICY "Siapa saja boleh lihat produk" 
ON public.produk FOR SELECT 
USING (true);

-- Aturan: Hanya Admin (yang sudah login) boleh TAMBAH/EDIT/HAPUS produk
CREATE POLICY "Hanya admin yang boleh kelola produk" 
ON public.produk FOR ALL 
TO authenticated 
USING (true);

-- Masukkan data awal (agar aplikasi tidak blank saat dites)
INSERT INTO public.produk (id, name, price, is_available)
VALUES 
  ('semeru-espresso', 'Semeru Espresso', 85000, true),
  ('mandheling-gayo', 'Mandheling Gayo', 90000, true),
  ('toraja-kalosi', 'Toraja Kalosi', 95000, true);


-- ==========================================
-- 5. TABEL PESANAN (CORE)
-- ==========================================
CREATE TABLE public.pesanan (
  id bigint primary key generated always as identity,
  nama text not null,
  nomor_wa text not null,
  alamat text not null,
  detail_pesanan jsonb not null,
  total_harga integer not null,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- ==========================================
-- 6. UPDATE KOLOM SOP KASIR (PESANAN)
-- ==========================================
-- Menambahkan kolom-kolom baru untuk SOP Kasir
ALTER TABLE public.pesanan 
ADD COLUMN tipe_pesanan text DEFAULT 'TAKEAWAY',
ADD COLUMN nomor_meja text,
ADD COLUMN metode_bayar text DEFAULT 'CASH',
ADD COLUMN subtotal int8, 
ADD COLUMN pajak_ppn int8 DEFAULT 0,
ADD COLUMN kasir_bertugas text;


-- ==========================================
-- 7. RLS POLICIES UNTUK PESANAN
-- ==========================================
-- Aktifkan fitur Satpam (RLS) pada tabel pesanan
ALTER TABLE public.pesanan ENABLE ROW LEVEL SECURITY;

-- Kebijakan untuk Pelanggan (Public/Anon): Mereka hanya boleh memasukkan data (INSERT)
CREATE POLICY "Pelanggan bisa buat pesanan" 
ON public.pesanan FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Kebijakan untuk Admin (Sudah Login/Authenticated): Admin boleh melihat semua data (SELECT)
CREATE POLICY "Admin bisa lihat semua pesanan" 
ON public.pesanan FOR SELECT 
TO authenticated 
USING (true);

-- Kebijakan untuk Admin (Sudah Login/Authenticated): Admin boleh memperbarui data (UPDATE)
CREATE POLICY "Admin bisa ubah status pesanan" 
ON public.pesanan FOR UPDATE 
TO authenticated 
USING (true);