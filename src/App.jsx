// 📌 [COMPONENT] App: Root Component (Manajer Utama) Bima Coffee.
// 🧭 Mengatur navigasi halaman (Routing) dan membagikan data (State Lifting) ke seluruh komponen anak.

import { useRef, useLayoutEffect, useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useScroll, useTransform, useSpring } from 'framer-motion';

import AuthPage from './components/admin/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import SessionExpiredModal from './components/modals/SessionExpiredModal';
import LandingPageView from './components/landing/LandingPageView';
import FullCatalogView from './components/landing/FullCatalogView';

import './App.css';

// 🎨 [ANIMATION] Konstanta perhitungan transisi ukuran dan posisi logo.
const NAVBAR_HEIGHT = 80;
const ANIM_END = 300;
const SPRING = { stiffness: 400, damping: 40, mass: 1, restDelta: 0.001 };

function App() {
  const logoRef = useRef(null);
  const { scrollY } = useScroll();

  // 📌 [STATE] Referensi timer deteksi idle (menggunakan useRef agar tidak memicu re-render berulang).
  const idleTimerRef = useRef(null);

  // 🧭 [ROUTING] State pengganti react-router. Menyimpan posisi halaman dengan fallback aman dari localStorage.
  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('bimaCoffeeView');
    const VALID_VIEWS = ['landing', 'auth', 'admin', 'full_catalog'];
    return VALID_VIEWS.includes(saved) ? saved : 'landing';
  });

  // 🧭 [ROUTING] Fungsi pembantu untuk pindah halaman, reset scroll ke atas, dan hapus sisa URL (hash).
  const navigateTo = (view) => {
    setCurrentView(view);
    window.history.replaceState(null, '', window.location.pathname);
    window.scrollTo(0, 0);
  };

  // ⚙️ [LOGIC] Auto-save: simpan halaman terakhir ke memori browser setiap kali user pindah view.
  useEffect(() => {
    localStorage.setItem('bimaCoffeeView', currentView);
  }, [currentView]);

  // ⚙️ [LOGIC] Pembersih awal: hapus hash fragment di URL jika user me-refresh halaman secara paksa.
  useEffect(() => {
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo(0, 0);
    }
  }, []);

  // 📌 [STATE] Data master produk (diangkat ke sini agar bisa dipakai Katalog dan form Kasir).
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // 📌 [STATE] Peran admin yang sedang login ('owner', 'kasir', 'barista').
  const [userRole, setUserRole] = useState(null);

  // 📌 [STATE] Flag pemicu untuk memunculkan pop-up sesi habis (auto-logout).
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  // 🚀 [FETCH] Mengambil daftar seluruh produk kopi dari database Supabase (diurutkan abjad).
  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    const { data, error } = await supabase.from('produk').select('*').order('name', { ascending: true });
    if (!error) setProducts(data ?? []);
    setIsLoadingProducts(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  // 📌 [STATE] Pengaturan global (contoh: status dan persentase pajak PPN).
  const [globalSettings, setGlobalSettings] = useState({
    pajak_aktif: false,
    pajak_persen: 11,
  });

  // 🚀 [FETCH] Mengambil konfigurasi pajak dari database.
  const fetchSettings = async () => {
    const { data, error } = await supabase.from('pengaturan').select('pajak_aktif, pajak_persen').eq('id', 1).single();
    if (!error && data) setGlobalSettings(data);
  };

  useEffect(() => { fetchSettings(); }, []);

  // 🚀 [FETCH] Memantau status login. Jika ada sesi aktif, tarik data role/peran user dari tabel profiles.
  useEffect(() => {
    const getRoleFromDB = async (userId) => {
      console.log("🔍 [DEBUG] Mencoba ambil role untuk ID User:", userId);
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      console.log("📦 [DEBUG] Data dari Supabase:", data);
      console.log("🚨 [DEBUG] Error dari Supabase:", error);

      if (data && !error) {
        setUserRole(data.role);
      } else {
        setUserRole(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) getRoleFromDB(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) getRoleFromDB(session.user.id);
      else setUserRole(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ⚙️ [LOGIC] Sensor Keamanan (Idle Timeout): Waktu maksimal admin pasif sebelum ditendang keluar.
  const IDLE_TIMEOUT = 600000; // 10 menit

  // ⚙️ [LOGIC] Memantau pergerakan mouse/keyboard. Jika tidak ada aktivitas, otomatis eksekusi logout.
  useEffect(() => {
    if (currentView !== 'admin') return; // Hanya aktif di halaman dashboard admin

    const handleLogout = async () => {
      await supabase.auth.signOut();
      setUserRole(null);
      setIsSessionExpired(true);
    };

    const resetTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = setTimeout(handleLogout, IDLE_TIMEOUT);
    };

    const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'click', 'scroll'];
    ACTIVITY_EVENTS.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      ACTIVITY_EVENTS.forEach(event => window.removeEventListener(event, resetTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [currentView]);

  // 📌 [STATE] "Nampan Belanja" — menyimpan daftar pesanan sementara yang dibagikan antar komponen.
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  // ⚙️ [LOGIC] Mengisi kopi ke baris keranjang yang kosong, lalu otomatis gulir (scroll) ke form kasir.
  const smartAddProduct = (selectedId) => {
    setOrderItems(prev => {
      const sudahAda = prev.some(item => item.productId === selectedId);
      if (sudahAda) return prev;

      const indexKosong = prev.findIndex(item => item.productId === '');
      if (indexKosong !== -1) {
        return prev.map((item, i) => i === indexKosong ? { ...item, productId: selectedId } : item);
      }

      const MAKS_PRODUK = products.length || 3;
      if (prev.length < MAKS_PRODUK) return [...prev, { productId: selectedId, quantity: 1 }];
      return prev;
    });

    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 🎨 [ANIMATION] Mengukur layar user untuk menentukan titik awal dan akhir transisi logo.
  const [yStart, setYStart] = useState(-200);
  const [yEnd, setYEnd] = useState(-200);

  useLayoutEffect(() => {
    if (!logoRef.current) return;
    const recalc = () => {
      const vh = window.innerHeight;
      const logoH = logoRef.current.offsetHeight;
      setYStart(vh / 2 - logoH / 2);
      setYEnd(NAVBAR_HEIGHT / 2 - logoH / 2);
    };
    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // 🎨 [ANIMATION] Mengubah nilai scroll menjadi animasi pergerakan (Y) dan ukuran (Scale) dengan fisika pegas.
  const rawY = useTransform(scrollY, [0, ANIM_END], [yStart, yEnd]);
  const rawScale = useTransform(scrollY, [0, ANIM_END], [1, 0.27]);
  const y = useSpring(rawY, SPRING);
  const scale = useSpring(rawScale, SPRING);

  // ⚙️ [LOGIC] Menutup modal "Sesi Habis" dan mengembalikan user ke halaman login (auth).
  const handleLoginBack = () => {
    setIsSessionExpired(false);
    navigateTo('auth');
  };

  // 🔄 [RENDER] Conditional Rendering: Menampilkan komponen UI berdasarkan string yang tersimpan di `currentView`.
  return (
    <>
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
          products={products.slice(0, 3)}
          globalSettings={globalSettings}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          smartAddProduct={smartAddProduct}
          logoRef={logoRef}
          y={y}
          scale={scale}
          scrollY={scrollY}
          onViewAll={() => navigateTo('full_catalog')}
        />
      )}

      {currentView === 'full_catalog' && (
        <FullCatalogView
          products={products}
          onSelectProduct={smartAddProduct}
          onBack={() => navigateTo('landing')}
          orderItems={orderItems}
          setOrderItems={setOrderItems}
          globalSettings={globalSettings}
        />
      )}

      {/* Pop-up Modal yang muncul melayang jika isSessionExpired = true */}
      {isSessionExpired && (
        <SessionExpiredModal onLoginBack={handleLoginBack} />
      )}
    </>
  );
}

export default App;