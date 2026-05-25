// 📌 [COMPONENT] OrderList: Tabel Daftar Pesanan Masuk.
// 🔄 Menerima data pesanan utuh (State Lifting) dari AdminDashboard dan menampilkannya dengan fitur Live Search & Filter.

import React, { useState } from 'react';
import styles from './AdminDashboard.module.css';

// ⚙️ [LOGIC] Helper formatting untuk tanggal ke format lokal dan angka ke Rupiah.
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

// 🧩 [MAIN COMPONENT] Menerima banyak callback props karena seluruh aksi (ubah status/print) dieksekusi di komponen induk (AdminDashboard).
const OrderList = ({ orders, isLoading, onRefresh, onUpdateStatus, onPrintOrder, userRole }) => {

  // 📌 [STATE] Input kata kunci untuk mencari nama pelanggan atau nomor WA (Live Search).
  const [searchQuery, setSearchQuery] = useState('');

  // 📌 [STATE] Dropdown filter status pesanan (Semua / Pending / Diproses / Selesai).
  const [statusFilter, setStatusFilter] = useState('Semua');

  // ⚙️ [LOGIC] Client-Side Filtering: Data disaring langsung di browser setiap kali user mengetik/memilih filter, tanpa perlu load ulang dari database.
  const filteredOrders = orders.filter(order => {
    // Saring berdasarkan Status
    if (statusFilter !== 'Semua' && order.status !== statusFilter) return false;

    // Saring berdasarkan input Teks (Search) secara case-insensitive
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nama = order.nama?.toLowerCase() ?? '';
      const wa = order.nomor_wa?.toLowerCase() ?? '';
      if (!nama.includes(q) && !wa.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Pesanan Masuk</h3>
        <div className={styles.tableActions}>
          <span className={styles.tableCount}>
            {filteredOrders.length !== orders.length
              ? `${filteredOrders.length} dari ${orders.length}`
              : `${orders.length} Total`}
          </span>
          <button className={styles.refreshBtn} onClick={onRefresh}>↻ Refresh</button>
        </div>
      </div>

      {/* 🖼️ [UI] Bar Pencarian (Search) & Dropdown Filter */}
      <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem', alignItems: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="🔍  Cari nama pelanggan atau nomor WA..."
          style={{ flex: '1 1 220px', minWidth: '180px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.55rem 0.9rem', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        />

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.78rem', cursor: 'pointer', outline: 'none', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.35)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
        >
          <option value="Semua">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Diproses">Diproses</option>
          <option value="Selesai">Selesai</option>
        </select>

        {/* ⚙️ [LOGIC] Tombol Reset hanya muncul saat ada kata kunci search atau filter yang aktif. */}
        {(searchQuery || statusFilter !== 'Semua') && (
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('Semua'); }}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '6px', padding: '0.55rem 0.75rem', color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'color 0.2s, border-color 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            ✕ Reset
          </button>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loadingState}><p className={styles.loadingText}>Memuat data pesanan...</p></div>
      ) : orders.length === 0 ? (
        <div className={styles.emptyState}><p className={styles.emptyText}>Belum ada pesanan masuk.</p></div>
      ) : filteredOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>Tidak ada pesanan yang cocok dengan pencarian {statusFilter !== 'Semua' ? ` & filter "${statusFilter}"` : ''}.</p>
        </div>
      ) : (
        <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '6px' }}>
          <div style={{ width: '100%', overflowX: 'auto', display: 'block', whiteSpace: 'nowrap' }}>
            <table className={styles.ordersTable}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, backgroundColor: '#0b0b0b', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th>Tanggal</th>
                  <th>Pelanggan</th>
                  <th>Kontak &amp; Alamat</th>
                  <th>Pesanan (Kopi)</th>
                  <th>Tipe &amp; Meja</th>
                  {/* 🔒 [SECURITY] Role-Based UI: Kolom Harga dan Metode Bayar disembunyikan untuk role Barista (hanya butuh lihat kopi). */}
                  {userRole !== 'barista' && <th>Bayar</th>}
                  {userRole !== 'barista' && <th>Total</th>}
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {/* 🔄 [RENDER] Looping data hasil saringan (bukan data asli). */}
                {filteredOrders.map(order => (
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

                    {/* 🔒 [SECURITY] Menyembunyikan informasi finansial untuk Barista */}
                    {userRole !== 'barista' && <td className={styles.tdPrice}>{order.metode_bayar ?? '—'}</td>}
                    {userRole !== 'barista' && <td className={styles.tdPrice}>{formatCurrency(order.total_harga)}</td>}

                    <td>
                      <span className={`${styles.statusBadge} ${order.status === 'Pending' ? styles.badgePending : order.status === 'Diproses' ? styles.badgeProcessing : styles.badgeDone}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={styles.tdAction}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <button className={styles.actionBtn} onClick={() => onUpdateStatus(order.id, order.status)} disabled={order.status === 'Selesai'}>
                          {order.status === 'Selesai' ? 'Selesai ✓' : order.status === 'Diproses' ? '→ Selesai' : '→ Diproses'}
                        </button>

                        {/* 🔒 [SECURITY] Tombol print hanya tersedia untuk Owner dan Kasir */}
                        {userRole !== 'barista' && (
                          <button className={styles.actionBtn} style={{ borderColor: 'rgba(255,255,255,0.25)', color: 'rgba(255,255,255,0.7)' }} onClick={() => onPrintOrder(order)}>
                            🖨 Struk
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderList;