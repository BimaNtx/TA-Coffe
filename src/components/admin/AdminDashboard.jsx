// 📌 [COMPONENT] AdminDashboard: Pusat kendali admin Bima Coffee.
// 🔄 Menangani navigasi antar menu admin (pesanan, produk, pengaturan, laporan) dan merender grafik statistik.

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

// ⚙️ [LOGIC] Helper formatting untuk tanggal ISO ke format lokal, dan angka ke Rupiah.
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

const AdminDashboard = ({ navigateTo, products = [], onProductsChange, globalSettings = {}, onSettingsChange, userRole }) => {

  // 📌 [STATE] Menyimpan data seluruh pesanan dan status loading fetch data.
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 📌 [STATE] Menyimpan data SATU pesanan yang dipilih kasir untuk dicetak struknya.
  const [printOrder, setPrintOrder] = useState(null);

  // 📌 [STATE] Mengontrol tab mana yang sedang aktif (orders, menu, settings, laporan).
  const [activeTab, setActiveTab] = useState('orders');

  // 📌 [STATE] Mengontrol munculnya modal notifikasi jika update data ke DB gagal.
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  const showSuccess = (title, message) => setSuccessModal({ open: true, title, message });

  // 🚀 [FETCH] (Read) Menarik seluruh data pesanan dari Supabase, diurutkan dari yang terbaru.
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

  // 🚀 [FETCH] (Update) Mengubah status pesanan secara bertahap (Pending -> Diproses -> Selesai) di DB.
  const handleUpdateStatus = async (id, currentStatus) => {
    let newStatus;
    if (currentStatus === 'Pending') newStatus = 'Diproses';
    else if (currentStatus === 'Diproses') newStatus = 'Selesai';
    else return;

    const { error } = await supabase.from('pesanan').update({ status: newStatus }).eq('id', id);
    if (error) {
      showSuccess('Gagal Update Status', 'Terjadi kesalahan: ' + error.message);
      return;
    }
    // ⚙️ [LOGIC] Update state lokal agar UI langsung berubah tanpa perlu fetch ulang semua data.
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  // ⚙️ [LOGIC] Fitur Cetak Struk: Masukkan data ke state, tunggu sedikit agar React me-render HTML, lalu panggil dialog print bawaan browser.
  const handlePrintOrder = (order) => {
    setPrintOrder(order);
    setTimeout(() => window.print(), 200);
  };

  // ⚙️ [LOGIC] Kalkulasi matematika untuk 3 kotak statistik di bagian atas dashboard.
  const totalPendapatan = orders.reduce((sum, o) => sum + (o.total_harga ?? 0), 0);
  const jumlahPending = orders.filter(o => o.status === 'Pending').length;
  const STATS = [
    { title: 'Pesanan Baru', value: jumlahPending, suffix: 'Pending' },
    { title: 'Total Pendapatan', value: formatCurrency(totalPendapatan), suffix: '' },
    { title: 'Total Semua Pesanan', value: orders.length, suffix: 'Pesanan' },
  ];

  // ⚙️ [LOGIC] useMemo: Mengelompokkan data pendapatan per-tanggal agar Recharts bisa membuat LineChart.
  // (Menggunakan useMemo agar kalkulasi berat ini hanya jalan kalau data `orders` berubah).
  const revenueData = useMemo(() => {
    const map = {};
    const sorted = [...orders].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    sorted.forEach(o => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      map[key] = (map[key] ?? 0) + (o.total_harga ?? 0);
    });
    return Object.entries(map).map(([tanggal, pendapatan]) => ({ tanggal, pendapatan }));
  }, [orders]);

  // ⚙️ [LOGIC] useMemo: Menghitung 5 kopi terlaris dari array bersarang (detail_pesanan) untuk BarChart.
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
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, terjual]) => {
        const prod = products.find(p => p.id === productId);
        const nama = prod?.name ?? productId.replace(/-/g, ' ');
        return { nama: nama.length > 14 ? nama.slice(0, 13) + '…' : nama, terjual };
      });
  }, [orders, products]);

  return (
    <section className={styles.adminContainer}>

      {/* 🖼️ [UI] Header Admin */}
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

        {/* 🔄 [RENDER] Kotak Statistik */}
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

        {/* 🧭 [ROUTING] Navigasi Tab dengan Sistem Role (Hanya Owner yang bisa atur menu dan laporan) */}
        <div
          className={styles.tabNav}
          style={{ overflowX: 'auto', whiteSpace: 'nowrap', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          <button className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`} onClick={() => setActiveTab('orders')}>Daftar Pesanan</button>

          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'menu' ? styles.tabActive : ''}`} onClick={() => setActiveTab('menu')}>Kelola Menu</button>
          )}
          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>Pengaturan</button>
          )}
          {userRole === 'owner' && (
            <button className={`${styles.tabBtn} ${activeTab === 'laporan' ? styles.tabActive : ''}`} onClick={() => setActiveTab('laporan')}>Laporan</button>
          )}
        </div>

        {/* 🔄 [RENDER] Pendelegasian ke sub-komponen sesuai tab aktif */}
        {activeTab === 'orders' && (
          <OrderList orders={orders} isLoading={isLoading} onRefresh={fetchOrders} onUpdateStatus={handleUpdateStatus} onPrintOrder={handlePrintOrder} userRole={userRole} />
        )}

        {(activeTab === 'menu' || activeTab === 'settings') && (
          <ProductManager products={products} globalSettings={globalSettings} onProductsChange={onProductsChange} onSettingsChange={onSettingsChange} activeTab={activeTab} />
        )}

        {/* 📊 [RENDER] Tab Laporan & Grafik (Recharts) */}
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

                {/* Grafik 1: LineChart Tren Pendapatan */}
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    Tren Pendapatan Harian
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={revenueData} margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis dataKey="tanggal" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}jt` : v >= 1_000 ? `${(v / 1_000).toFixed(0)}rb` : v} />
                      <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff' }} formatter={v => [new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v), 'Pendapatan']} labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }} cursor={{ stroke: 'rgba(255,255,255,0.08)' }} />
                      <Line type="monotone" dataKey="pendapatan" stroke="#d4a96a" strokeWidth={2} dot={{ r: 3, fill: '#d4a96a', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#fff', stroke: '#d4a96a', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Grafik 2: BarChart Menu Terlaris */}
                <div>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: '1rem' }}>
                    5 Menu Terlaris
                  </p>
                  {topProductsData.length === 0 ? (
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'Inter, sans-serif', fontSize: '0.8rem' }}>Tidak ada data detail pesanan.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topProductsData} margin={{ top: 5, right: 24, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                        <XAxis dataKey="nama" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 10, fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', fontFamily: 'Inter, sans-serif', fontSize: '12px', color: '#fff' }} formatter={v => [v, 'Terjual']} labelStyle={{ color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                        <Bar dataKey="terjual" fill="#d4a96a" radius={[4, 4, 0, 0]} maxBarSize={56} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      <SuccessModal isOpen={successModal.open} title={successModal.title} message={successModal.message} onClose={() => setSuccessModal({ open: false, title: '', message: '' })} />

      {/* 🖨️ [UI] Struk Rahasia: Hanya tampil di kertas saat perintah window.print() dijalankan berkat tag @media print */}
      {printOrder && (
        <>
          <style>{`
            #admin-receipt-area { display: none; }
            @media print {
              @page { margin: 0; }
              body * { visibility: hidden !important; }
              #admin-receipt-area {
                display: block !important; visibility: visible !important; position: absolute !important;
                top: 0 !important; left: 0 !important; width: 80mm !important; background: white !important;
              }
              #admin-receipt-area * { visibility: visible !important; color: black !important; }
              #admin-receipt-area > div { page-break-inside: avoid; break-inside: avoid; }
            }
          `}</style>

          <div id="admin-receipt-area">
            {['— STRUK PELANGGAN —', '— SALINAN DAPUR / BARISTA —'].map((label, copyIdx) => {
              const d = new Date();
              const tgl = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
              const jam = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
              return (
                <div key={copyIdx} style={{
                  width: '76mm', padding: '4mm 2mm', background: '#fff', color: '#000',
                  fontFamily: "'Courier New', Courier, monospace", fontSize: '10pt', lineHeight: 1.5, boxSizing: 'border-box',
                }}>
                  <div style={{ textAlign: 'center', marginBottom: '2mm' }}>
                    <div style={{ fontSize: '15pt', fontWeight: 900, letterSpacing: '0.2em', fontFamily: 'Georgia, serif' }}>BIMA COFFEE</div>
                    <div style={{ fontSize: '8pt', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Specialty Coffee Roaster</div>
                    <div style={{ fontSize: '8pt', color: '#444' }}>Lumajang, East Java</div>
                  </div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ fontSize: '8pt', color: '#333', marginBottom: '1mm' }}>{tgl}   {jam}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Kasir</span><span>Admin</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tipe</span><span>{printOrder.tipe_pesanan === 'DINE_IN' ? `Dine In — Meja ${printOrder.nomor_meja}` : 'Takeaway'}</span></div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Pelanggan</span><span>{printOrder.nama || '—'}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>WA</span><span>{printOrder.nomor_wa || '—'}</span></div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ fontWeight: 'bold', fontSize: '8pt', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '1mm' }}>PESANAN</div>
                  {Array.isArray(printOrder.detail_pesanan) && printOrder.detail_pesanan.map((item, i) => {
                    const prod = products.find(p => p.id === item.productId);
                    const qty = Number(item.quantity);
                    const harga = prod?.price ?? 0;
                    return (
                      <div key={i} style={{ marginBottom: '2mm' }}>
                        <div style={{ fontWeight: 'bold' }}>{prod?.name ?? item.productId}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span> {qty} x Rp {harga.toLocaleString('id-ID')}</span>
                          <span>Rp {(harga * qty).toLocaleString('id-ID')}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>Rp {(printOrder.subtotal ?? printOrder.total_harga ?? 0).toLocaleString('id-ID')}</span></div>
                  {printOrder.pajak_ppn > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>PPN {globalSettings.pajak_persen ?? 11}%</span><span>Rp {printOrder.pajak_ppn.toLocaleString('id-ID')}</span></div>
                  )}
                  <div style={{ borderTop: '2px solid #000', margin: '3mm 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>TOTAL</span><span>Rp {(printOrder.total_harga ?? 0).toLocaleString('id-ID')}</span></div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Metode Bayar</span><span>{printOrder.metode_bayar || '—'}</span></div>
                  <div style={{ borderTop: '1px dashed #000', margin: '3mm 0' }} />

                  <div style={{ textAlign: 'center', marginTop: '2mm' }}>
                    <div style={{ fontStyle: 'italic', fontSize: '9pt' }}>Terima kasih telah</div>
                    <div style={{ fontStyle: 'italic', fontSize: '9pt' }}>mampir ke Bima Coffee ☕</div>
                    <div style={{ fontSize: '7pt', color: '#666', marginTop: '2mm', fontStyle: 'italic' }}>Struk ini berlaku sebagai bukti pembayaran</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '7.5pt', letterSpacing: '0.1em', color: '#555', marginTop: '3mm', paddingTop: '2mm', borderTop: '1px dotted #999' }}>{label}</div>

                  {copyIdx === 0 && (
                    <div style={{ textAlign: 'center', fontSize: '7pt', color: '#888', padding: '4mm 0', letterSpacing: '0.04em' }}>✂ ───────── POTONG DI SINI ───────── ✂</div>
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