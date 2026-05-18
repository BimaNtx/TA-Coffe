/**
 * AdminDashboard.jsx — Halaman Admin Real-Time Bima Coffee
 *
 * Konsep React & Backend untuk Laporan RPL:
 *   1. useState    — state pesanan, produk, tab, dan modal
 *   2. useEffect   — fetch data saat komponen mount
 *   3. async/await — operasi INSERT / UPDATE / DELETE ke Supabase
 *   4. Props       — products & onProductsChange diterima dari App.jsx
 *   5. CRUD        — Create, Read, Update, Delete pada tabel `produk`
 */

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../supabaseClient';
import styles from './AdminDashboard.module.css';
import SuccessModal from '../modals/SuccessModal';
import OrderList from './OrderList';
import ProductManager from './ProductManager';

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace('.', ':');
};

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(amount ?? 0);


// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ navigateTo, products = [], onProductsChange, globalSettings = {}, onSettingsChange, userRole }) => {

  // ── State Pesanan ─────────────────────────────────────────
  const [orders,   setOrders]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * printOrder — pesanan yang sedang dicetak.
   * null  = tidak ada yang dicetak.
   * object = data pesanan yang dipilih kasir untuk dicetak.
   */
  const [printOrder, setPrintOrder] = useState(null);

  // ── State Tab ─────────────────────────────────────────────
  /**
   * activeTab — mengontrol tab yang aktif di dashboard
   * 'orders'   → tabel pesanan
   * 'menu'     → kelola produk (CRUD)
   * 'settings' → pengaturan global (pajak)
   */
  const [activeTab, setActiveTab] = useState('orders');

  // searchQuery, statusFilter, currentPage — telah dipindahkan ke OrderList.jsx

  // ── State Modal Pesanan ───────────────────────────────────
  /**
   * successModal — mengontrol SuccessModal untuk error operasi pesanan.
   * { open: bool, title: string, message: string }
   */
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });

  /** Helper: tampilkan SuccessModal untuk error pesanan */
  const showSuccess = (title, message) => setSuccessModal({ open: true, title, message });

  // State & logika produk/pengaturan → telah dipindahkan ke ProductManager.jsx

  // ─────────────────────────────────────────────────────────
  // FETCH PESANAN
  // ─────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pesanan')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setOrders(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  // ─────────────────────────────────────────────────────────
  // UPDATE STATUS PESANAN
  // ─────────────────────────────────────────────────────────
  const handleUpdateStatus = async (id, currentStatus) => {
    let newStatus;
    if (currentStatus === 'Pending')       newStatus = 'Diproses';
    else if (currentStatus === 'Diproses') newStatus = 'Selesai';
    else return;

    const { error } = await supabase.from('pesanan').update({ status: newStatus }).eq('id', id);
    if (error) {
      showSuccess('Gagal Update Status', 'Terjadi kesalahan: ' + error.message);
      return;
    }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  // ─────────────────────────────────────────────────────────
  // CETAK STRUK (KASIR)
  // ─────────────────────────────────────────────────────────

  /**
   * handlePrintOrder — simpan pesanan ke state printOrder,
   * lalu setelah 1 frame (agar DOM ter-render), panggil window.print().
   *
   * Delay via setTimeout memastikan elemen struk sudah ada di DOM
   * sebelum dialog cetak muncul.
   */
  const handlePrintOrder = (order) => {
    setPrintOrder(order);
    setTimeout(() => window.print(), 200);
  };


  // ─────────────────────────────────────────────────────────
  // KALKULASI STATISTIK + PAGINASI
  // ─────────────────────────────────────────────────────────
  const totalPendapatan = orders.reduce((sum, o) => sum + (o.total_harga ?? 0), 0);
  const jumlahPending   = orders.filter(o => o.status === 'Pending').length;
  const STATS = [
    { title: 'Pesanan Baru',        value: jumlahPending,                  suffix: 'Pending'  },
    { title: 'Total Pendapatan',    value: formatCurrency(totalPendapatan), suffix: ''         },
    { title: 'Total Semua Pesanan', value: orders.length,                  suffix: 'Pesanan'  },
  ];

  // filteredOrders, totalPages, currentOrders — telah dipindahkan ke OrderList.jsx

  // ─────────────────────────────────────────────────────────
  // DATA PROCESSING UNTUK GRAFIK (useMemo = hanya re-kalkulasi saat orders berubah)
  // ─────────────────────────────────────────────────────────

  /**
   * revenueData — Total pendapatan per tanggal (DD/MM) untuk LineChart.
   * Iterasi orders, group by tanggal, jumlahkan total_harga.
   */
  const revenueData = useMemo(() => {
    const map = {};
    // Urutkan orders ascending agar grafik kiri→kanan = lama→baru
    const sorted = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    sorted.forEach(o => {
      if (!o.created_at) return;
      const d   = new Date(o.created_at);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + (o.total_harga ?? 0);
    });
    return Object.entries(map).map(([tanggal, pendapatan]) => ({ tanggal, pendapatan }));
  }, [orders]);

  /**
   * topProductsData — 5 produk terlaris berdasarkan total qty dari detail_pesanan.
   * Resolve nama produk menggunakan prop products.
   */
  const topProductsData = useMemo(() => {
    const qtyMap = {};
    orders.forEach(o => {
      if (!Array.isArray(o.detail_pesanan)) return;
      o.detail_pesanan.forEach(item => {
        if (!item.productId) return;
        qtyMap[item.productId] = (qtyMap[item.productId] ?? 0) + Number(item.quantity ?? 1);
      });
    });
    return Object.entries(qtyMap)
      .sort((a, b) => b[1] - a[1])   // sort descending
      .slice(0, 5)                    // ambil 5 teratas
      .map(([productId, terjual]) => {
        const prod = products.find(p => p.id === productId);
        const nama = prod?.name ?? productId.replace(/-/g, ' ');
        // Potong nama panjang agar tidak overflow label sumbu X
        return { nama: nama.length > 14 ? nama.slice(0, 13) + '…' : nama, terjual };
      });
  }, [orders, products]);

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <section className={styles.adminContainer}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.brand}>Bima Coffee</h1>
          <h2 className={styles.consoleTitle}>Admin Console (Role: {userRole || 'KOSONG'})</h2>
        </div>
        <button className={styles.logoutBtn} onClick={() => navigateTo('landing')}>
          LOGOUT <span aria-hidden="true">→</span>
        </button>
      </header>

      <main className={styles.mainContent}>

        {/* STATISTIK */}
        <div className={styles.statsGrid}>
          {STATS.map((stat, i) => (
            <div key={i} className={styles.statCard}>
              <h3 className={styles.statTitle}>{stat.title}</h3>
              <div className={styles.statValueGroup}>
                <span className={styles.statValue}>{stat.value}</span>
                {stat.suffix && <span className={styles.statSuffix}>{stat.suffix}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* NAVIGASI TAB — overflowX: auto agar bisa di-swipe di layar sempit */}
        <div
          className={styles.tabNav}
          style={{
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <button className={`${styles.tabBtn} ${activeTab === 'orders'   ? styles.tabActive : ''}`} onClick={() => setActiveTab('orders')}>
            Daftar Pesanan
          </button>
          {/*
            Tab "Kelola Menu" dan "Pengaturan" hanya ditampilkan kepada owner.
            Kasir dan Barista secara default hanya melihat tab Daftar Pesanan.
          */}
          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'menu'     ? styles.tabActive : ''}`} onClick={() => setActiveTab('menu')}>
              Kelola Menu
            </button>
          )}
          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>
              Pengaturan
            </button>
          )}
          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'laporan' ? styles.tabActive : ''}`} onClick={() => setActiveTab('laporan')}>
              Laporan
            </button>
          )}
        </div>

        {/* ═══════ TAB: DAFTAR PESANAN ═══════ */}
        {activeTab === 'orders' && (
          <OrderList
            orders={orders}
            isLoading={isLoading}
            onRefresh={fetchOrders}
            onUpdateStatus={handleUpdateStatus}
            onPrintOrder={handlePrintOrder}
            userRole={userRole}
          />
        )}

        {/* ═══════ TAB: KELOLA MENU & PENGATURAN ═══════ */}
        {/* Dikelola sepenuhnya oleh ProductManager — termasuk modal & CRUD Supabase */}
        {(activeTab === 'menu' || activeTab === 'settings') && (
          <ProductManager
            products={products}
            globalSettings={globalSettings}
            onProductsChange={onProductsChange}
            onSettingsChange={onSettingsChange}
            activeTab={activeTab}
          />
        )}

        {/* ═══════ TAB: LAPORAN ANALITIK ═══════ */}
        {activeTab === 'laporan' && (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Laporan Analitik</h3>
              <span className={styles.tableCount}>{orders.length} Data Pesanan</span>
            </div>

            {orders.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Belum ada data pesanan untuk ditampilkan.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', padding: '1.5rem 0' }}>

                {/* ── Grafik 1: Tren Pendapatan ──────────────────── */}
                <div>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
                    letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', marginBottom: '1rem',
                  }}>
                    Tren Pendapatan Harian
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueData} margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="tanggal"
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={v => {
                          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}jt`;
                          if (v >= 1_000)    return `${(v / 1_000).toFixed(0)}rb`;
                          return v;
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#0d0d0d',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '6px',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                        formatter={v => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v), 'Pendapatan']}
                        labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                        cursor={{ stroke: 'rgba(255,255,255,0.08)' }}
                      />
                      <Line
                        type="monotone"
                        dataKey="pendapatan"
                        stroke="#d4a96a"
                        strokeWidth={2}
                        dot={{ r: 3, fill: '#d4a96a', strokeWidth: 0 }}
                        activeDot={{ r: 5, fill: '#fff', stroke: '#d4a96a', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* ── Grafik 2: Menu Terlaris ────────────────────── */}
                <div>
                  <p style={{
                    fontFamily: 'Inter, sans-serif', fontSize: '0.65rem',
                    letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)',
                    textTransform: 'uppercase', marginBottom: '1rem',
                  }}>
                    5 Menu Terlaris
                  </p>
                  {topProductsData.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem' }}>
                      Tidak ada data detail pesanan.
                    </p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topProductsData} margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(255,255,255,0.06)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="nama"
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: '#0d0d0d',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '6px',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '12px',
                            color: '#fff',
                          }}
                          formatter={v => [v, 'Terjual']}
                          labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}
                          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        <Bar
                          dataKey="terjual"
                          fill="#d4a96a"
                          radius={[4, 4, 0, 0]}
                          maxBarSize={56}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

      </main>

      {/* Modal Notifikasi Sukses (untuk error pesanan) */}
      <SuccessModal
        isOpen={successModal.open}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ open: false, title: '', message: '' })}
      />

      {/* STRUK CETAK KASIR — tersembunyi di layar, hanya tampil saat window.print() */}
      {printOrder && (
        <>
          {/* Inject @media print rule ke <head> secara dinamis */}
          <style>{`
            /* Sembunyikan struk di layar biasa */
            #admin-receipt-area { 
              display: none; 
            }
            
            /* Aturan saat tombol print ditekan */
            @media print {
              @page { margin: 0; } /* Buang margin kertas bawaan browser */
              body * { visibility: hidden !important; }
              
              #admin-receipt-area {
                display: block !important;
                visibility: visible !important;
                position: absolute !important;
                top: 0 !important; left: 0 !important;
                width: 80mm !important; /* Lebar standar printer kasir */
                background: white !important;
              }
              
              #admin-receipt-area * { 
                visibility: visible !important; 
                color: black !important;
              }

              /* Mencegah struk terpotong di tengah-tengah saat ganti halaman */
              #admin-receipt-area > div {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `}</style>

          {/* Struk double copy — JANGAN PAKAI style inline display none di sini! */}
          <div id="admin-receipt-area">
            {/* Resolve nama produk dari ID menggunakan prop products */}
            {['— STRUK PELANGGAN —', '— SALINAN DAPUR / BARISTA —'].map((label, copyIdx) => {
              const d = new Date();
              const tgl = d.toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' });
              const jam = d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false });
              return (
                <div key={copyIdx} style={{
                  width: '76mm', padding: '4mm 2mm', background: '#fff', color: '#000',
                  fontFamily: "'Courier New', Courier, monospace", fontSize: '10pt', lineHeight: 1.5,
                  boxSizing: 'border-box',
                }}>
                  {/* Header */}
                  <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                    <div style={{ fontSize: '15pt', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'Georgia, serif' }}>BIMA COFFEE</div>
                    <div style={{ fontSize: '8pt', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Specialty Coffee Roaster</div>
                    <div style={{ fontSize: '8pt', color: '#444' }}>Lumajang, East Java</div>
                  </div>

                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Info transaksi */}
                  <div style={{ fontSize: '8pt', color: '#333', marginBottom: '1mm' }}>{tgl}   {jam}</div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span>Kasir</span><span>Admin</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>Tipe</span>
                    <span>{printOrder.tipe_pesanan === 'DINE_IN' ? `Dine In — Meja ${printOrder.nomor_meja}` : 'Takeaway'}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Pelanggan */}
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span>Pelanggan</span><span>{printOrder.nama || '—'}</span></div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}><span>WA</span><span>{printOrder.nomor_wa || '—'}</span></div>

                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Item pesanan */}
                  <div style={{ fontWeight:'bold', fontSize:'8pt', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'1mm' }}>PESANAN</div>
                  {Array.isArray(printOrder.detail_pesanan) && printOrder.detail_pesanan.map((item, i) => {
                    const prod  = products.find(p => p.id === item.productId);
                    const qty   = Number(item.quantity);
                    const harga = prod?.price ?? 0;
                    return (
                      <div key={i} style={{ marginBottom: '2mm' }}>
                        <div style={{ fontWeight:'bold' }}>{prod?.name ?? item.productId}</div>
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span> {qty} x Rp {harga.toLocaleString('id-ID')}</span>
                          <span>Rp {(harga * qty).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Harga */}
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>Subtotal</span>
                    <span>Rp {(printOrder.subtotal ?? printOrder.total_harga ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  {printOrder.pajak_ppn > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span>PPN {globalSettings.pajak_persen ?? 11}%</span>
                      <span>Rp {printOrder.pajak_ppn.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div style={{ borderTop: '2px solid #000', margin: '3mm 0' }} />
                  <div style={{ display:'flex', justifyContent:'space-between', fontWeight:'bold' }}>
                    <span>TOTAL</span>
                    <span>Rp {(printOrder.total_harga ?? 0).toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Pembayaran */}
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span>Metode Bayar</span><span>{printOrder.metode_bayar || '—'}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  {/* Footer */}
                  <div style={{ textAlign:'center', marginTop:'2mm' }}>
                    <div style={{ fontStyle:'italic', fontSize:'9pt' }}>Terima kasih telah</div>
                    <div style={{ fontStyle:'italic', fontSize:'9pt' }}>mampir ke Bima Coffee ☕</div>
                    <div style={{ fontSize:'7pt', color:'#666', marginTop:'2mm', fontStyle:'italic' }}>Struk ini berlaku sebagai bukti pembayaran</div>
                  </div>

                  {/* Label salinan */}
                  <div style={{ textAlign:'center', fontSize:'7.5pt', letterSpacing:'0.1em', color:'#555', marginTop:'3mm', paddingTop:'2mm', borderTop:'1px dotted #999' }}>
                    {label}
                  </div>

                  {/* Garis potong antar salinan (hanya setelah copy pertama) */}
                  {copyIdx === 0 && (
                    <div style={{ textAlign:'center', fontSize:'7pt', color:'#888', padding:'4mm 0', letterSpacing:'0.04em' }}>
                      ✂ ───────── POTONG DI SINI ───────── ✂
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};

export default AdminDashboard;
