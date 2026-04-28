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
import { supabase } from '../supabaseClient';
import styles from './AdminDashboard.module.css';

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
// MODAL FORM: Tambah / Edit Produk
// ─────────────────────────────────────────────────────────────
const ProductFormModal = ({ initial, onSave, onClose }) => {
  const [name,      setName]      = useState(initial?.name  ?? '');
  const [price,     setPrice]     = useState(initial?.price ?? '');
  const [isSaving,  setIsSaving]  = useState(false);
  const [error,     setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !price) { setError('Nama dan harga wajib diisi.'); return; }
    setIsSaving(true);
    await onSave({ name: name.trim(), price: Number(price) });
    setIsSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#0a0808', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px', padding: '2rem', width: '100%', maxWidth: '380px',
      }}>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#fff', marginBottom: '1.5rem' }}>
          {initial ? 'Edit Produk' : 'Tambah Produk'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Nama Produk</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Contoh: Semeru Espresso" />
          </div>
          <div>
            <label style={labelStyle}>Harga (Rp)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} placeholder="Contoh: 85000" />
          </div>
          {error && <p style={{ color: '#ff6b6b', fontSize: '0.75rem' }}>⚠ {error}</p>}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="submit" disabled={isSaving} style={btnPrimaryStyle}>
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem' };
const inputStyle = { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '0.6rem 0.8rem', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', boxSizing: 'border-box' };
const btnPrimaryStyle   = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };
const btnSecondaryStyle = { flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ navigateTo, products = [], onProductsChange, globalSettings = {}, onSettingsChange, userRole }) => {

  // ── State Pesanan ─────────────────────────────────────────
  const [orders,   setOrders]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // ── State Modal Produk ────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null);

  // ── State Pengaturan Lokal ─────────────────────────────────
  /**
   * localSettings — salinan sementara globalSettings untuk form edit.
   * Perubahan di sini belum disimpan ke DB sampai admin klik "Simpan".
   */
  const [localSettings, setLocalSettings] = useState({
    pajak_aktif:  globalSettings.pajak_aktif  ?? false,
    pajak_persen: globalSettings.pajak_persen ?? 11,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sinkronkan localSettings saat globalSettings dari App berubah
  useEffect(() => {
    setLocalSettings({
      pajak_aktif:  globalSettings.pajak_aktif  ?? false,
      pajak_persen: globalSettings.pajak_persen ?? 11,
    });
  }, [globalSettings.pajak_aktif, globalSettings.pajak_persen]);

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
    if (error) { alert('Gagal update status: ' + error.message); return; }
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

  /**
   * handleClosePrint — bersihkan state setelah dialog cetak ditutup.
   * Dipanggil saat user selesai mencetak atau menekan Batal.
   */
  const handleClosePrint = () => setPrintOrder(null);

  // ─────────────────────────────────────────────────────────
  // SIMPAN PENGATURAN PAJAK
  // ─────────────────────────────────────────────────────────
  /**
   * handleSaveSettings — UPDATE baris id=1 di tabel `pengaturan`
   * Setelah berhasil, panggil onSettingsChange() agar App.jsx
   * melakukan refetch dan menyebarkan nilai baru ke OrderForm.
   */
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await supabase
      .from('pengaturan')
      .update({
        pajak_aktif:  localSettings.pajak_aktif,
        pajak_persen: Number(localSettings.pajak_persen),
      })
      .eq('id', 1);
    setIsSavingSettings(false);
    if (error) { alert('Gagal simpan pengaturan: ' + error.message); return; }
    onSettingsChange(); // minta App.jsx refetch globalSettings
    alert('Pengaturan berhasil disimpan!');
  };

  // ─────────────────────────────────────────────────────────
  // CRUD PRODUK
  // ─────────────────────────────────────────────────────────

  /**
   * handleSaveProduct — INSERT jika tambah baru, UPDATE jika edit
   * Setelah berhasil, panggil onProductsChange() agar App.jsx
   * melakukan refetch sehingga ProductCatalog & OrderForm ikut update.
   */
  const handleSaveProduct = async ({ name, price }) => {
    if (editingProduct) {
      // UPDATE produk yang sudah ada
      const { error } = await supabase
        .from('produk')
        .update({ name, price })
        .eq('id', editingProduct.id);
      if (error) { alert('Gagal update: ' + error.message); return; }
    } else {
      // INSERT produk baru
      const { error } = await supabase
        .from('produk')
        .insert({ name, price, is_available: true });
      if (error) { alert('Gagal tambah: ' + error.message); return; }
    }
    setShowProductModal(false);
    setEditingProduct(null);
    onProductsChange(); // minta App.jsx untuk refresh state products
  };

  /**
   * handleToggleAvailable — toggle is_available (aktif/habis)
   * Langsung update di database dan perbarui state di App.jsx.
   */
  const handleToggleAvailable = async (product) => {
    const newVal = !product.is_available;
    const { error } = await supabase
      .from('produk')
      .update({ is_available: newVal })
      .eq('id', product.id);
    if (error) { alert('Gagal ubah stok: ' + error.message); return; }
    onProductsChange();
  };

  /**
   * handleDeleteProduct — hapus produk dari database
   * Menampilkan konfirmasi sederhana sebelum menghapus.
   */
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Hapus produk "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (error) { alert('Gagal hapus: ' + error.message); return; }
    onProductsChange();
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

  const totalPages    = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

        {/*
          NAVIGASI TAB
          Mengontrol activeTab state. React re-render tabel yang sesuai.
        */}
        <div className={styles.tabNav}>
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
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Pesanan Masuk</h3>
              <div className={styles.tableActions}>
                <span className={styles.tableCount}>{orders.length} Total</span>
                <button className={styles.refreshBtn} onClick={fetchOrders}>↻ Refresh</button>
              </div>
            </div>

            {isLoading ? (
              <div className={styles.loadingState}><p className={styles.loadingText}>Memuat data pesanan...</p></div>
            ) : orders.length === 0 ? (
              <div className={styles.emptyState}><p className={styles.emptyText}>Belum ada pesanan masuk.</p></div>
            ) : (
              <>
                <div className={styles.tableContainer}>
                  <table className={styles.ordersTable}>
                    <thead>
                      <tr>
                        <th>Tanggal</th><th>Pelanggan</th>
                        <th>Kontak &amp; Alamat</th><th>Pesanan (Kopi)</th>
                        <th>Tipe &amp; Meja</th><th>Bayar</th>
                        <th>Total</th><th>Status</th><th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map(order => (
                        <tr key={order.id}>
                          <td className={styles.tdDate}>{formatDate(order.created_at)}</td>
                          <td className={styles.tdName}>{order.nama ?? '—'}</td>
                          <td className={styles.tdContact}>
                            <div className={styles.tdContactInner}>
                              <span className={styles.contactWa}>{order.nomor_wa}</span>
                              <span className={styles.contactAddress}>{order.alamat}</span>
                            </div>
                          </td>
                          <td className={styles.tdItems}>
                            <div className={styles.tdItemsInner}>
                              {Array.isArray(order.detail_pesanan)
                                ? order.detail_pesanan.map((item, i) => (
                                    <span key={i} className={styles.itemChip}>
                                      {item.quantity}× {item.productId?.replace(/-/g, ' ')}
                                    </span>
                                  ))
                                : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                              }
                            </div>
                          </td>
                          <td className={styles.tdPrice}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem' }}>
                              <span>{order.tipe_pesanan ?? '—'}</span>
                              {order.nomor_meja && (
                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>Meja {order.nomor_meja}</span>
                              )}
                            </div>
                          </td>
                          <td className={styles.tdPrice}>{order.metode_bayar ?? '—'}</td>
                          <td className={styles.tdPrice}>{formatCurrency(order.total_harga)}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${
                              order.status === 'Pending'  ? styles.badgePending    :
                              order.status === 'Diproses' ? styles.badgeProcessing :
                              styles.badgeDone
                            }`}>{order.status}</span>
                          </td>
                          <td className={styles.tdAction}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {/* Ubah Status */}
                              <button
                                className={styles.actionBtn}
                                onClick={() => handleUpdateStatus(order.id, order.status)}
                                disabled={order.status === 'Selesai'}
                              >
                                {order.status === 'Selesai'  ? 'Selesai ✓' :
                                 order.status === 'Diproses' ? '→ Selesai'  :
                                 '→ Diproses'}
                              </button>
                              {/* Cetak Struk */}
                              <button
                                className={styles.actionBtn}
                                style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }}
                                onClick={() => handlePrintOrder(order)}
                              >
                                🖨 Struk
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>← Prev</button>
                    <span className={styles.pageInfo}>Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong></span>
                    <button className={styles.pageBtn} onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Next →</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══════ TAB: KELOLA MENU ═══════ */}
        {activeTab === 'menu' && (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Kelola Menu Kopi</h3>
              <button
                className={styles.refreshBtn}
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem 1rem' }}
                onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
              >
                + Tambah Produk
              </button>
            </div>

            {products.length === 0 ? (
              <div className={styles.emptyState}><p className={styles.emptyText}>Belum ada produk. Klik "Tambah Produk".</p></div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Stok / Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className={styles.tdName}>{p.name}</td>
                        <td className={styles.tdPrice}>{formatCurrency(p.price)}</td>
                        <td>
                          {/* Toggle Stok: klik badge untuk toggle is_available */}
                          <button
                            onClick={() => handleToggleAvailable(p)}
                            style={{
                              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                            }}
                            title="Klik untuk ubah stok"
                          >
                            <span className={`${styles.statusBadge} ${p.is_available ? styles.badgeDone : styles.badgePending}`}>
                              {p.is_available ? 'Tersedia' : 'Habis'}
                            </span>
                          </button>
                        </td>
                        <td className={styles.tdAction} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {/* Tombol Edit */}
                          <button
                            className={styles.actionBtn}
                            onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                          >
                            Edit
                          </button>
                          {/* Tombol Hapus */}
                          <button
                            className={styles.actionBtn}
                            style={{ borderColor: 'rgba(255,80,80,0.3)', color: '#ff6b6b' }}
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════ TAB: PENGATURAN ═══════ */}
        {activeTab === 'settings' && (
          <div className={styles.tableSection}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableTitle}>Pengaturan Pajak</h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>

              {/* Toggle Pajak Aktif */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ ...labelStyle, marginBottom: '0.2rem', fontSize: '0.8rem' }}>Aktifkan Pajak</p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    Pajak akan dihitung otomatis di setiap transaksi
                  </p>
                </div>
                {/* Toggle switch visual */}
                <button
                  type="button"
                  onClick={() => setLocalSettings(s => ({ ...s, pajak_aktif: !s.pajak_aktif }))}
                  style={{
                    width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                    background: localSettings.pajak_aktif ? '#fff' : 'rgba(255,255,255,0.15)',
                    position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0,
                  }}
                  aria-label="Toggle pajak"
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: localSettings.pajak_aktif ? '25px' : '3px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    background: localSettings.pajak_aktif ? '#000' : 'rgba(255,255,255,0.5)',
                    transition: 'left 0.25s',
                  }} />
                </button>
              </div>

              {/* Input Persentase Pajak */}
              <div>
                <label style={labelStyle}>Persentase Pajak (%)</label>
                <input
                  type="number"
                  min={0} max={100}
                  value={localSettings.pajak_persen}
                  onChange={e => setLocalSettings(s => ({ ...s, pajak_persen: e.target.value }))}
                  disabled={!localSettings.pajak_aktif}
                  style={{ ...inputStyle, opacity: localSettings.pajak_aktif ? 1 : 0.4, maxWidth: '120px' }}
                />
              </div>

              {/* Preview kalkulasi */}
              {localSettings.pajak_aktif && (
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)' }}>
                  Setiap transaksi Rp 100.000 akan dikenakan pajak Rp {Math.round(100000 * (localSettings.pajak_persen / 100)).toLocaleString('id-ID')}
                </p>
              )}

              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                style={{ ...btnPrimaryStyle, maxWidth: '200px', opacity: isSavingSettings ? 0.6 : 1 }}
              >
                {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </button>
            </div>
          </div>
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

      {/* Modal Form Produk */}
      {showProductModal && (
        <ProductFormModal
          initial={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}

      {/*
        ── STRUK CETAK KASIR ────────────────────────────────────────
        Komponen ini tersembunyi di layar (display:none via CSS inline).
        Saat window.print() dipanggil, @media print di <style> tag ini
        menyembunyikan SELURUH elemen website dan hanya menampilkan struk.

        FIX 7-PAGE BUG: overflow:hidden + height:auto pada #admin-receipt-area
        memastikan tidak ada halaman kosong yang dicetak.
      *{/*
        ── STRUK CETAK KASIR ────────────────────────────────────────
      */}
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
