/**
 * App.jsx — Root komponen BIMA COFFEE
 *
 * Menggunakan teknik "State-Based Routing":
 *   Berpindah halaman tanpa install react-router-dom,
 *   cukup dengan mengubah nilai state `currentView`.
 *
 * Nilai `currentView` yang tersedia:
 *   'landing' → Halaman utama (Hero, Katalog, Order Form, dll)
 *   'auth'    → Halaman Login / Register
 *   'admin'   → Halaman Admin Console (Dashboard)
 *
 * State Lifting yang tetap berjalan:
 *   `orderItems` dibagi antara ProductCatalog dan OrderForm.
 */

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';

import Navbar          from './components/Navbar';
import Hero            from './components/Hero';
import IntroSection    from './components/IntroSection';
import BeanSection     from './components/BeanSection';
import ProductCatalog  from './components/ProductCatalog';
import OrderForm       from './components/OrderForm';
import Footer          from './components/Footer';
import AuthPage        from './components/AuthPage';
import AdminDashboard  from './components/AdminDashboard';

import './App.css';

// ─────────────────────────────────────────────────────────────
// KONSTANTA ANIMASI LOGO
// ─────────────────────────────────────────────────────────────
const NAVBAR_HEIGHT = 80;
const ANIM_END      = 300;
const SPRING        = { stiffness: 400, damping: 40, mass: 1, restDelta: 0.001 };

// ─────────────────────────────────────────────────────────────
// LANDING PAGE VIEW — dibungkus agar bisa di-mount/unmount bersih
// ─────────────────────────────────────────────────────────────
/**
 * LandingPageView menerima props dari App:
 *   @prop {function} navigateTo
 *   @prop {Array}    products        — daftar produk dari Supabase
 *   @prop {Array}    orderItems
 *   @prop {function} setOrderItems
 *   @prop {function} smartAddProduct
 *   @prop {object}   logoRef, y, scale, scrollY
 */
const LandingPageView = ({
  navigateTo, products, orderItems, setOrderItems,
  smartAddProduct, logoRef, y, scale, scrollY
}) => (
  <div
    className="app-container"
    style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}
  >
    <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

    {/* Logo beranimasi: bergerak dari tengah layar ke tengah navbar */}
    <div className="logo-anchor">
      <motion.div ref={logoRef} className="logo-motion" style={{ y, scale }}>
        <span className="logo-line">BIMA</span>
        <span className="logo-line">COFFEE</span>
      </motion.div>
    </div>

    <Hero />
    <IntroSection />
    <BeanSection />

    {/* products diteruskan agar katalog dan form memakai data live dari database */}
    <ProductCatalog products={products} onSelectProduct={smartAddProduct} />
    <OrderForm products={products} orderItems={orderItems} setOrderItems={setOrderItems} />

    <Footer navigateTo={navigateTo} />
  </div>
);

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA APP
// ─────────────────────────────────────────────────────────────
function App() {
  const logoRef      = useRef(null);
  const { scrollY } = useScroll();

  /**
   * currentView — State utama navigasi halaman
   *
   * Ini adalah pengganti react-router-dom yang sederhana.
   * Cukup ubah nilai string ini untuk "berpindah halaman".
   *
   * Nilai yang tersedia: 'landing' | 'auth' | 'admin'
   *
   * Lazy initializer: fungsi di dalam useState() dijalankan SEKALI saat pertama render.
   * localStorage.getItem() membaca nilai yang tersimpan dari sesi sebelumnya.
   * Jika tidak ada nilai tersimpan (buka pertama kali), fallback ke 'landing'.
   */
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('bimaCoffeeView') || 'landing';
  });

  /**
   * navigateTo — fungsi pembantu untuk berpindah halaman
   * Diteruskan ke semua komponen anak yang butuh pindah halaman.
   *
   * @param {string} view - nama halaman tujuan
   */
  const navigateTo = (view) => {
    setCurrentView(view);
    // Hapus hash fragment (#order, #catalog, dll) dari URL agar tidak
    // menyebabkan auto-scroll saat user me-refresh halaman
    window.history.replaceState(null, '', window.location.pathname);
    // Langsung ke paling atas (tanpa animasi agar transisi halaman terasa tegas)
    window.scrollTo(0, 0);
  };

  /**
   * useEffect #1 — sinkronisasi currentView ke localStorage
   *
   * Setiap kali currentView berubah (user berpindah halaman),
   * nilai baru langsung disimpan ke localStorage.
   * Sehingga jika halaman di-refresh, state tidak hilang.
   */
  useEffect(() => {
    localStorage.setItem('bimaCoffeeView', currentView);
  }, [currentView]);

  /**
   * useEffect #2 — pembersih hash saat pertama kali halaman dimuat
   *
   * Skenario: user me-refresh halaman saat URL masih mengandung hash
   * (misal: localhost:5173/#order). Efek ini membersihkan hash tersebut
   * dan mengembalikan scroll ke atas SEBELUM React merender apapun.
   *
   * Array dependensi kosong [] = hanya berjalan SEKALI saat mount.
   */
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo(0, 0);
    }
  }, []);

  // ── State Produk (dari Supabase) ─────────────────────────

  /**
   * products — daftar produk live dari tabel `produk` di Supabase
   * Digunakan oleh ProductCatalog (kartu) dan OrderForm (dropdown).
   * Disimpan di App agar AdminDashboard bisa memperbarui via onProductsChange.
   */
  const [products,          setProducts]          = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('name', { ascending: true });
    if (!error) setProducts(data ?? []);
    setIsLoadingProducts(false);
  };

  // Muat produk sekali saat komponen pertama kali dirender
  useEffect(() => { fetchProducts(); }, []);

  // ── State Lifting: orderItems ─────────────────────────────
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  /**
   * smartAddProduct — logika cerdas saat user klik "PESAN SEKARANG"
   * Tiga tahap: cek duplikat → isi baris kosong → tambah baris baru
   */
  const smartAddProduct = (selectedId) => {
    setOrderItems(prev => {
      const sudahAda   = prev.some(item => item.productId === selectedId);
      if (sudahAda) return prev;

      const indexKosong = prev.findIndex(item => item.productId === '');
      if (indexKosong !== -1) {
        return prev.map((item, i) =>
          i === indexKosong ? { ...item, productId: selectedId } : item
        );
      }

      const MAKS_PRODUK = products.length || 3; // ikuti jumlah produk aktual dari database
      if (prev.length < MAKS_PRODUK) {
        return [...prev, { productId: selectedId, quantity: 1 }];
      }

      return prev;
    });

    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // ── Animasi Logo ──────────────────────────────────────────
  const [yStart, setYStart] = useState(-200);
  const [yEnd,   setYEnd]   = useState(-200);

  useLayoutEffect(() => {
    if (!logoRef.current) return;
    const recalc = () => {
      const vh    = window.innerHeight;
      const logoH = logoRef.current.offsetHeight;
      setYStart(vh / 2 - logoH / 2);
      setYEnd(NAVBAR_HEIGHT / 2 - logoH / 2);
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  const rawY     = useTransform(scrollY, [0, ANIM_END], [yStart, yEnd]);
  const rawScale = useTransform(scrollY, [0, ANIM_END], [1, 0.27]);
  const y        = useSpring(rawY,     SPRING);
  const scale    = useSpring(rawScale, SPRING);

  // ─────────────────────────────────────────────────────────
  // CONDITIONAL RENDERING — State-Based Routing
  //
  // React melihat nilai `currentView` dan memutuskan komponen
  // mana yang akan ditampilkan. Hanya satu yang aktif sekaligus.
  // ─────────────────────────────────────────────────────────
  if (currentView === 'auth') {
    // Halaman Login / Register
    return <AuthPage navigateTo={navigateTo} />;
  }

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        navigateTo={navigateTo}
        products={products}
        onProductsChange={fetchProducts}
      />
    );
  }

  // Default: Halaman Landing Page
  return (
    <LandingPageView
      navigateTo={navigateTo}
      products={products}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
      smartAddProduct={smartAddProduct}
      logoRef={logoRef}
      y={y}
      scale={scale}
      scrollY={scrollY}
    />
  );
}

export default App;