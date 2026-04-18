/**
 * App.jsx — Root komponen BIMA COFFEE Landing Page
 *
 * Urutan section:
 *   1. Navbar         — navigasi tetap di atas
 *   2. Hero           — halaman pembuka dengan logo animasi
 *   3. IntroSection   — pengenalan brand dengan bunga kopi
 *   4. BeanSection    — biji kopi berputar
 *   5. ProductCatalog — katalog produk; klik "Pesan" → isi form otomatis
 *   6. OrderForm      — formulir pemesanan; menerima pilihan dari katalog
 *   7. Footer         — penutup dengan brand besar
 *
 * ALUR DATA (Prop Drilling):
 *   App.jsx menyimpan `selectedProduct` (string ID produk).
 *   ProductCatalog → App (lewat onSelectProduct) → OrderForm (lewat defaultProductId)
 *   Ini contoh nyata "state lifting" — state dinaikkan ke komponen terdekat
 *   yang menjadi induk dari dua komponen yang perlu berbagi data.
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
   * selectedProduct — STATE BERSAMA antara Catalog dan Order Form
   *
   * Mengapa state ini ada di App.jsx, bukan di ProductCatalog atau OrderForm?
   * Karena kedua komponen tersebut adalah SAUDARA (sibling) — mereka tidak
   * bisa langsung berbagi data satu sama lain.
   *
   * Solusinya: "State Lifting" (angkat state ke komponen induk = App.jsx)
   * App.jsx menjadi perantara:
   *   • ProductCatalog SET nilainya lewat callback `onSelectProduct`
   *   • OrderForm READ nilainya lewat prop `defaultProductId`
   */
  const [selectedProduct, setSelectedProduct] = useState('');

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
        onSelectProduct: fungsi yang diberikan ke ProductCatalog.
        Saat user klik "PESAN SEKARANG", ProductCatalog memanggil
        fungsi ini dengan ID produk yang dipilih.
        App.jsx menyimpannya di state `selectedProduct`.
      */}
      <ProductCatalog onSelectProduct={setSelectedProduct} />

      {/*
        defaultProductId: nilai dari `selectedProduct` diteruskan ke OrderForm.
        Saat nilainya berubah, useEffect di dalam OrderForm akan otomatis
        mengisi dropdown baris pertama dengan produk yang dipilih.
      */}
      <OrderForm defaultProductId={selectedProduct} />
      <Footer />
    </div>
  );
}

export default App;