/**
 * App.jsx — Root komponen BIMA COFFEE Landing Page
 *
 * Urutan section:
 *   1. Navbar      — navigasi tetap di atas
 *   2. Hero        — halaman pembuka dengan logo animasi
 *   3. IntroSection— pengenalan brand dengan bunga kopi
 *   4. BeanSection — biji kopi berputar
 *   5. ProductCatalog — daftar produk dalam grid
 *   6. OrderForm   — formulir pemesanan multi-produk
 *   7. Footer      — penutup dengan brand besar
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
      <ProductCatalog />
      <OrderForm />
      <Footer />
    </div>
  );
}

export default App;