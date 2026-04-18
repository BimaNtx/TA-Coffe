/**
 * App.jsx — Root komponen BIMA COFFEE Landing Page
 *
 * Urutan section:
 *   1. Navbar         — navigasi tetap di atas
 *   2. Hero           — halaman pembuka dengan logo animasi
 *   3. IntroSection   — pengenalan brand dengan bunga kopi
 *   4. BeanSection    — biji kopi berputar
 *   5. ProductCatalog — katalog produk; klik "Pesan" → Smart Add ke form
 *   6. OrderForm      — formulir pemesanan; menerima orderItems dari App
 *   7. Footer         — penutup dengan brand besar
 *
 * ALUR DATA (State Lifting):
 *   `orderItems` disimpan di App.jsx karena dibutuhkan oleh dua komponen:
 *   • ProductCatalog  — menulis data lewat smartAddProduct()
 *   • OrderForm       — membaca & mengedit data lewat props
 *
 *   Pola ini disebut "Single Source of Truth" — satu sumber data
 *   yang dikontrol oleh komponen induk (App.jsx).
 */

import { useRef, useLayoutEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

import Navbar         from './components/Navbar';
import Hero           from './components/Hero';
import IntroSection   from './components/IntroSection';
import BeanSection    from './components/BeanSection';
import ProductCatalog from './components/ProductCatalog';
import OrderForm      from './components/OrderForm';
import Footer         from './components/Footer';

import './App.css';

// ─────────────────────────────────────────────────────────────
// KONSTANTA ANIMASI LOGO
// ─────────────────────────────────────────────────────────────
const NAVBAR_HEIGHT = 80;   // harus sama dengan nilai di Navbar.module.css
const ANIM_END      = 300;  // jarak scroll (px) sebelum animasi selesai
const SPRING        = { stiffness: 400, damping: 40, mass: 1, restDelta: 0.001 };

function App() {
  const logoRef      = useRef(null);
  const { scrollY } = useScroll();

  /**
   * orderItems — STATE BERSAMA antara ProductCatalog dan OrderForm
   *
   * Disimpan di App.jsx (bukan di OrderForm) karena ProductCatalog
   * juga perlu membaca dan menulis data ini lewat smartAddProduct().
   *
   * Bentuk data: array of objects
   *   [{ productId: 'semeru-espresso', quantity: 1 }, ...]
   *
   * State ini diteruskan ke OrderForm sebagai prop agar form bisa
   * menampilkan dan mengedit baris-baris pesanan.
   */
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  /**
   * smartAddProduct — logika cerdas saat user klik "PESAN SEKARANG"
   *
   * Dipanggil oleh ProductCatalog dengan membawa `selectedId` (string ID kopi).
   * Tiga tahap keputusan (if–else if–else):
   *
   * @param {string} selectedId - ID produk yang dipilih user
   */
  const smartAddProduct = (selectedId) => {
    setOrderItems(prev => {
      // ── Tahap 1: Cek Duplikasi ─────────────────────────────
      // Apakah produk ini sudah ada di dalam salah satu baris?
      // some() mengembalikan true jika ADA minimal satu baris yang cocok.
      const sudahAda = prev.some(item => item.productId === selectedId);

      if (sudahAda) {
        // Produk sudah dipilih sebelumnya → tidak perlu ubah apapun.
        // Cukup scroll ke form (dilakukan di bawah, di luar setOrderItems).
        return prev; // kembalikan array tanpa perubahan
      }

      // ── Tahap 2: Cari Baris Kosong ─────────────────────────
      // Apakah ada baris yang productId-nya masih kosong (belum dipilih)?
      // findIndex() mengembalikan INDEX pertama yang cocok, atau -1 jika tidak ada.
      const indexKosong = prev.findIndex(item => item.productId === '');

      if (indexKosong !== -1) {
        // Ada baris kosong → isi baris kosong PERTAMA dengan produk yang dipilih.
        // map() menelusuri array: hanya baris di indexKosong yang diubah,
        // baris lain dikembalikan apa adanya.
        return prev.map((item, i) =>
          i === indexKosong
            ? { ...item, productId: selectedId } // isi baris kosong ini
            : item                                // baris lain: tidak diubah
        );
      }

      // ── Tahap 3: Tambah Baris Baru ─────────────────────────
      // Tidak ada duplikat, tidak ada baris kosong.
      // Periksa apakah masih ada "slot" (jumlah baris < jumlah varian produk).
      // Jika ya, tambahkan baris baru di akhir array menggunakan spread operator.
      const MAKS_PRODUK = 3; // sesuai jumlah di PRODUCTS (Semeru, Mandheling, Toraja)
      if (prev.length < MAKS_PRODUK) {
        return [...prev, { productId: selectedId, quantity: 1 }];
      }

      // Jika sudah penuh dan tidak ada baris kosong, tidak ada yang bisa dilakukan.
      return prev;
    });

    // Scroll ke form pesanan setelah state diupdate
    // setTimeout kecil memberi waktu React menyelesaikan render ulang
    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Posisi awal & akhir logo (diukur setelah render pertama)
  const [yStart, setYStart] = useState(-200);
  const [yEnd,   setYEnd]   = useState(-200);

  /**
   * useLayoutEffect
   * Mengukur tinggi logo setelah elemen ada di DOM,
   * lalu menghitung posisi Y awal (tengah layar) dan akhir (tengah navbar).
   */
  useLayoutEffect(() => {
    if (!logoRef.current) return;

    const recalc = () => {
      const vh    = window.innerHeight;
      const logoH = logoRef.current.offsetHeight;

      setYStart(vh / 2 - logoH / 2);               // tengah layar
      setYEnd(NAVBAR_HEIGHT / 2 - logoH / 2);       // tengah navbar
    };

    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // useTransform: memetakan nilai scrollY ke nilai Y dan scale
  const rawY     = useTransform(scrollY, [0, ANIM_END], [yStart, yEnd]);
  const rawScale = useTransform(scrollY, [0, ANIM_END], [1, 0.27]);

  // useSpring: menambahkan efek "kenyal" pada animasi
  const y     = useSpring(rawY,     SPRING);
  const scale = useSpring(rawScale, SPRING);

  return (
    <div
      className="app-container"
      style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}
    >
      {/* Navbar selalu tampil di atas */}
      <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

      {/* Logo beranimasi: bergerak dari tengah layar ke tengah navbar */}
      <div className="logo-anchor">
        <motion.div ref={logoRef} className="logo-motion" style={{ y, scale }}>
          <span className="logo-line">BIMA</span>
          <span className="logo-line">COFFEE</span>
        </motion.div>
      </div>

      {/* Bagian-bagian halaman */}
      <Hero />
      <IntroSection />
      <BeanSection />

      {/*
        onSelectProduct menerima fungsi smartAddProduct dari App.jsx.
        Saat user klik "PESAN SEKARANG", ProductCatalog memanggil
        fungsi ini — TANPA lagi melakukan scroll sendiri (sudah dihandle
        di dalam smartAddProduct).
      */}
      <ProductCatalog onSelectProduct={smartAddProduct} />

      {/*
        orderItems   — data baris pesanan (array) dari App.jsx
        setOrderItems — fungsi untuk mengubah baris pesanan dari dalam form
        Dengan pola ini OrderForm bisa menambah, menghapus, dan mengubah
        baris tanpa perlu mengangkat state lebih jauh.
      */}
      <OrderForm orderItems={orderItems} setOrderItems={setOrderItems} />
      <Footer />
    </div>
  );
}

export default App;