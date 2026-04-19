/**
 * AdminDashboard.jsx
 *
 * Halaman khusus untuk Admin memantau pesanan masuk.
 *
 * Fitur (Mockup/Dummy):
 * 1. Menampilkan 3 widget ringkasan metrik statistik.
 * 2. Tabel data pesanan pelanggan.
 * 3. Fitur Update Status pesanan untuk mengubah badge (Pending -> Proses -> Selesai).
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AdminDashboard.module.css';

// ─────────────────────────────────────────────────────────────
// DATA DUMMY
// (Akan digantikan oleh data asli dari Database nantinya)
// ─────────────────────────────────────────────────────────────

const SUMMARY_STATS = [
  { id: 1, title: 'Pesanan Baru', value: '12',  suffix: 'Pesanan' },
  { id: 2, title: 'Total Pendapatan', value: '1.45', suffix: 'Juta Rp' },
  { id: 3, title: 'Kopi Terlaris', value: 'Semeru', suffix: 'Espresso' },
];

const INITIAL_ORDERS = [
  {
    id: '#ORD-001',
    customer: 'Bima Ananta',
    items: 'Semeru Espresso (x2)',
    total: 170000,
    status: 'Selesai'
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Wijaya',
    items: 'Toraja Kalosi (x1)',
    total: 95000,
    status: 'Proses'
  },
  {
    id: '#ORD-003',
    customer: 'Andi Setiawan',
    items: 'Mandheling Gayo (x3)',
    total: 270000,
    status: 'Pending'
  },
  {
    id: '#ORD-004',
    customer: 'Risa Pramesti',
    items: 'Semeru Espresso (x1), Toraja (x1)',
    total: 180000,
    status: 'Pending'
  }
];

// Helper untuk format rupiah (Contoh: 150000 -> "Rp 150.000")
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  /**
   * handleUpdateStatus
   * Berfungsi merotasi status pesanan saat tombol "Update Status" diklik.
   * Urutan rotasi: Pending -> Proses -> Selesai.
   */
  const handleUpdateStatus = (orderId) => {
    setOrders(prevOrders => 
      prevOrders.map(order => {
        if (order.id !== orderId) return order; // jika bukan yang dicari, biarkan

        // Logika perubahan badge
        let nextStatus = order.status;
        if (order.status === 'Pending') nextStatus = 'Proses';
        else if (order.status === 'Proses') nextStatus = 'Selesai';
        // jika sudah "Selesai", biarkan saja atau bisa muter lagi ke 'Pending' jika mau.

        return { ...order, status: nextStatus };
      })
    );
  };

  /**
   * getBadgeClass
   * Mengembalikan class CSS yang sesuai untuk mewarnai badge satus.
   */
  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending': return styles.badgePending;
      case 'Proses':  return styles.badgeProcessing;
      case 'Selesai': return styles.badgeDone;
      default:        return styles.badgePending;
    }
  };

  return (
    <section className={styles.adminContainer}>
      
      {/* HEADER KONSOL */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.brand}>Bima Coffee</h1>
          <h2 className={styles.consoleTitle}>Admin Console</h2>
        </div>
        <button 
          className={styles.logoutBtn} 
          onClick={() => window.alert('Keluar dari sistem...')}
        >
          LOGOUT <span aria-hidden="true">→</span>
        </button>
      </header>

      <main className={styles.mainContent}>
        
        {/* WIDGET STATISTIK */}
        <div className={styles.statsGrid}>
          {SUMMARY_STATS.map((stat, i) => (
            <motion.div 
              key={stat.id} 
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className={styles.statTitle}>{stat.title}</h3>
              <div className={styles.statValueGroup}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statSuffix}>{stat.suffix}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* TABEL PESANAN TERKINI */}
        <motion.div 
          className={styles.tableSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Pesanan Masuk</h3>
            <span className={styles.tableCount}>{orders.length} Total</span>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>ID Pesanan</th>
                  <th>Nama Pelanggan</th>
                  <th>Detail Pesanan (Kopi)</th>
                  <th>Total Harga</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {orders.map(order => (
                    <motion.tr 
                      key={order.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <td className={styles.tdId}>{order.id}</td>
                      <td className={styles.tdName}>{order.customer}</td>
                      <td className={styles.tdItems}>{order.items}</td>
                      <td className={styles.tdPrice}>{formatCurrency(order.total)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.tdAction}>
                        <button 
                          className={styles.actionBtn}
                          onClick={() => handleUpdateStatus(order.id)}
                          disabled={order.status === 'Selesai'}
                        >
                          {order.status === 'Selesai' ? 'Lengkap' : 'Update Status'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>

      </main>
    </section>
  );
};

export default AdminDashboard;
