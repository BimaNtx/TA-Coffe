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
// MODAL: SESI BERAKHIR (Session Expired)
// ─────────────────────────────────────────────────────────────
/**
 * SessionExpiredModal — ditampilkan saat Auto-Logout terpicu.
 * Menggantikan alert() browser agar tetap senada dark theme.
 *
 * @prop {function} onLoginBack — dipanggil saat tombol "Login Kembali" diklik
 */
const SessionExpiredModal = ({ onLoginBack }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.80)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.25s ease',
  }}>
    <div style={{
      background: '#0a0808',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '2.5rem 2rem',
      width: '100%', maxWidth: '380px',
      textAlign: 'center',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Ikon */}
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>

      {/* Judul */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '1.6rem', fontWeight: 700,
        color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.02em',
      }}>
        Sesi Berakhir
      </h2>

      {/* Deskripsi */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.82rem', lineHeight: 1.65,
        color: 'rgba(255, 255, 255, 0.45)',
        marginBottom: '2rem',
      }}>
        Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas.
        Silakan masuk kembali untuk melanjutkan.
      </p>

      {/* Tombol CTA */}
      <button
        onClick={onLoginBack}
        style={{
          width: '100%',
          background: '#fff', color: '#000',
          border: 'none', borderRadius: '6px',
          padding: '0.75rem 1rem',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.72rem', letterSpacing: '0.14em',
          fontWeight: 600, cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        LOGIN KEMBALI
      </button>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// LANDING PAGE VIEW — dibungkus agar bisa di-mount/unmount bersih
// ─────────────────────────────────────────────────────────────
/**
 * LandingPageView menerima props dari App:
 *   @prop {function} navigateTo
 *   @prop {Array}    products        — daftar produk dari Supabase
 *   @prop {object}   globalSettings  — pengaturan pajak dari Supabase
 *   @prop {Array}    orderItems
 *   @prop {function} setOrderItems
 *   @prop {function} smartAddProduct
 *   @prop {object}   logoRef, y, scale, scrollY
 */
const LandingPageView = ({
  navigateTo, products, globalSettings, orderItems, setOrderItems,
  smartAddProduct, logoRef, y, scale, scrollY
}) => (
  <div
    className="app-container"
    style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}
  >
    <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

    <div className="logo-anchor">
      <motion.div ref={logoRef} className="logo-motion" style={{ y, scale }}>
        <span className="logo-line">BIMA</span>
        <span className="logo-line">COFFEE</span>
      </motion.div>
    </div>

    <Hero />
    <IntroSection />
    <BeanSection />

    <ProductCatalog products={products} onSelectProduct={smartAddProduct} />
    {/* globalSettings diteruskan agar kalkulasi pajak menggunakan nilai dari database */}
    <OrderForm
      products={products}
      globalSettings={globalSettings}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
    />

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
   * idleTimerRef — menyimpan ID dari setTimeout aktif.
   * Menggunakan useRef (bukan useState) agar update ID tidak
   * memicu re-render komponen setiap kali timer di-reset.
   */
  const idleTimerRef = useRef(null);

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

  /**
   * userRole — role pengguna yang sedang login, diambil dari tabel `profiles`.
   * Nilai yang mungkin: 'owner' | 'kasir' | 'barista' | null
   * null berarti belum ada sesi aktif atau role belum selesai di-fetch.
   */
  const [userRole, setUserRole] = useState(null);

  /**
   * isSessionExpired — flag yang memicu tampilnya SessionExpiredModal.
   * true  = modal ditampilkan (sesi habis karena idle).
   * false = kondisi normal, modal tidak tampil.
   */
  const [isSessionExpired, setIsSessionExpired] = useState(false);

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

  // ── State Pengaturan Global (dari Supabase) ───────────────

  /**
   * globalSettings — konfigurasi aplikasi yang dikelola admin
   * Diambil dari tabel `pengaturan` baris id=1 di Supabase.
   *
   * Struktur: { pajak_aktif: boolean, pajak_persen: number }
   *
   * Digunakan oleh OrderForm untuk kalkulasi otomatis tanpa
   * membiarkan pelanggan mengubah pajak sendiri.
   */
  const [globalSettings, setGlobalSettings] = useState({
    pajak_aktif: false,
    pajak_persen: 11,
  });

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('pengaturan')
      .select('pajak_aktif, pajak_persen')
      .eq('id', 1)
      .single();
    if (!error && data) setGlobalSettings(data);
  };

  // Muat pengaturan sekali saat mount, bersamaan dengan produk
  useEffect(() => { fetchSettings(); }, []);

  // ── Fetch Role User dari Supabase Profiles ────────────────

  /**
   * useEffect #role — Memantau perubahan sesi autentikasi (login/logout).
   *
   * Saat sesi aktif ditemukan, lakukan fetch ke tabel `profiles` untuk
   * mendapatkan role user yang sedang login, lalu simpan ke state `userRole`.
   * Saat logout, reset userRole kembali ke null.
   *
   * onAuthStateChange juga menangkap sesi awal via event 'INITIAL_SESSION',
   * sehingga tidak perlu memanggil getSession() secara terpisah.
   */
  // ── Fetch Role User dari Supabase Profiles ────────────────
  useEffect(() => {
    // Fungsi pembantu untuk nembak ke database profil
    // Fungsi pembantu untuk nembak ke database profil
    const getRoleFromDB = async (userId) => {
      console.log("🔍 [DEBUG] Mencoba ambil role untuk ID User:", userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      console.log("📦 [DEBUG] Data dari Supabase:", data);
      console.log("🚨 [DEBUG] Error dari Supabase:", error);

      if (data && !error) {
        setUserRole(data.role); // Berhasil dapat role!
      } else {
        setUserRole(null);
      }
    };

    // 1. Cek paksa saat halaman pertama kali di-refresh
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) getRoleFromDB(session.user.id);
    });

    // 2. Pantau kalau ada yang baru login atau logout
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          getRoleFromDB(session.user.id);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Auto-Logout: Idle Timeout ─────────────────────────────

  /**
   * IDLE_TIMEOUT — durasi tidak aktif (ms) sebelum sesi otomatis berakhir.
   *
   * Saat ini: 1 menit (60_000 ms) — untuk keperluan testing.
   * Produksi: ganti ke 10 menit (600000 ms).
   */
  const IDLE_TIMEOUT = 600000; // 10 menit

  /**
   * useEffect #idle — Deteksi ketidakaktifan user dan logout otomatis.
   *
   * Hanya aktif saat currentView === 'admin' agar timer tidak berjalan
   * di halaman landing atau auth (tidak ada sesi yang perlu dijaga).
   *
   * Alur kerja:
   *   1. Pasang event listener untuk setiap interaksi user.
   *   2. Setiap interaksi memanggil resetTimer().
   *   3. resetTimer() membersihkan timer lama dan membuat timer baru.
   *   4. Jika tidak ada interaksi selama IDLE_TIMEOUT ms, jalankan logout.
   *   5. Saat currentView berubah (bukan 'admin') atau komponen unmount,
   *      bersihkan semua listener dan timer.
   */
  useEffect(() => {
    // Guard: hanya jalankan saat user berada di halaman admin
    if (currentView !== 'admin') return;

    const handleLogout = async () => {
      await supabase.auth.signOut();
      setUserRole(null);
      // Tampilkan modal custom — JANGAN navigateTo dulu agar modal
      // bisa muncul di atas view yang sedang aktif sebelum user diklik.
      setIsSessionExpired(true);
    };

    const resetTimer = () => {
      // Bersihkan timer lama agar tidak ada duplikat yang berjalan
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      // Buat timer baru
      idleTimerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT);
    };

    // Event-event yang dianggap sebagai "aktivitas user"
    const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'];

    // Pasang semua listener
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer));

    // Mulai timer pertama kali saat halaman admin dibuka
    resetTimer();

    // Cleanup: hapus semua listener dan timer saat:
    //   - currentView berubah (user pindah dari halaman admin)
    //   - komponen unmount
    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView]); // Re-run setiap currentView berubah (aktifkan/nonaktifkan guard)

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
  // Direfactor dari pola early-return menjadi satu return tunggal
  // agar SessionExpiredModal dapat selalu di-render di atas semua
  // view (landing, auth, maupun admin) tanpa terpotong early-return.
  // ─────────────────────────────────────────────────────────

  /**
   * handleLoginBack — dipanggil saat user klik "Login Kembali" di modal.
   * Sembunyikan modal dulu, baru navigasi ke halaman auth.
   */
  const handleLoginBack = () => {
    setIsSessionExpired(false);
    navigateTo('auth');
  };

  return (
    <>
      {/* ── View aktif berdasarkan currentView ── */}
      {currentView === 'auth' && (
        <AuthPage navigateTo={navigateTo} />
      )}

      {currentView === 'admin' && (
        <AdminDashboard
          navigateTo={navigateTo}
          products={products}
          onProductsChange={fetchProducts}
          globalSettings={globalSettings}
          onSettingsChange={fetchSettings}
          userRole={userRole}
        />
      )}

      {currentView === 'landing' && (
        <LandingPageView
          navigateTo={navigateTo}
          products={products}
          globalSettings={globalSettings}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          smartAddProduct={smartAddProduct}
          logoRef={logoRef}
          y={y}
          scale={scale}
          scrollY={scrollY}
        />
      )}

      {/* ── SessionExpiredModal: selalu bisa overlay di atas view manapun ── */}
      {isSessionExpired && (
        <SessionExpiredModal onLoginBack={handleLoginBack} />
      )}
    </>
  );
}

export default App;