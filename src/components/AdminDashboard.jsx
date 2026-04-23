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

import { useState, useEffect } from 'react';
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
const btnPrimaryStyle = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };
const btnSecondaryStyle = { flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ navigateTo, products = [], onProductsChange }) => {

  // ── State Pesanan ─────────────────────────────────────────
  const [orders,   setOrders]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ── State Tab ─────────────────────────────────────────────
  /**
   * activeTab — mengontrol tab yang aktif di dashboard
   * 'orders'  → tampilkan tabel pesanan
   * 'menu'    → tampilkan tabel kelola menu (CRUD produk)
   */
  const [activeTab, setActiveTab] = useState('orders');

  // ── State Modal Produk ────────────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null); // null = mode tambah

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
    if (currentStatus === 'Pending')   newStatus = 'Diproses';
    else if (currentStatus === 'Diproses') newStatus = 'Selesai';
    else return;

    const { error } = await supabase.from('pesanan').update({ status: newStatus }).eq('id', id);
    if (error) { alert('Gagal update status: ' + error.message); return; }
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
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
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <section className={styles.adminContainer}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.brand}>Bima Coffee</h1>
          <h2 className={styles.consoleTitle}>Admin Console</h2>
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
          <button
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Daftar Pesanan
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'menu' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('menu')}
          >
            Kelola Menu
          </button>
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
                          <td className={styles.tdPrice}>{formatCurrency(order.total_harga)}</td>
                          <td>
                            <span className={`${styles.statusBadge} ${
                              order.status === 'Pending'  ? styles.badgePending    :
                              order.status === 'Diproses' ? styles.badgeProcessing :
                              styles.badgeDone
                            }`}>{order.status}</span>
                          </td>
                          <td className={styles.tdAction}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleUpdateStatus(order.id, order.status)}
                              disabled={order.status === 'Selesai'}
                            >
                              {order.status === 'Selesai'  ? 'Selesai ✓' :
                               order.status === 'Diproses' ? '→ Selesai'  :
                               '→ Diproses'}
                            </button>
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

      </main>

      {/* Modal Form Produk */}
      {showProductModal && (
        <ProductFormModal
          initial={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}
    </section>
  );
};

export default AdminDashboard;
