/**
 * AdminDashboard.jsx — Halaman Admin Real-Time Bima Coffee
 *
 * Konsep React & Backend untuk Laporan RPL:
 *   1. useState    — menyimpan data pesanan dan status loading
 *   2. useEffect   — menjalankan fetchOrders() saat halaman pertama dibuka
 *   3. async/await — menunggu respons database tanpa membekukan browser
 *   4. JSONB map() — mengubah data array JSON dari Supabase menjadi teks yang terbaca
 *   5. Supabase    — operasi SELECT (baca) dan UPDATE (ubah status) ke tabel `pesanan`
 */

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './AdminDashboard.module.css';

// ─────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────

/**
 * formatDate — mengubah string ISO timestamp menjadi format yang mudah dibaca
 * Contoh: "2025-04-19T04:07:00Z" → "19 Apr, 04:07"
 */
const formatDate = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  return d.toLocaleString('id-ID', {
    day:    '2-digit',
    month:  'short',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace('.', ':');
};

/** formatCurrency — Contoh: 95000 → "Rp 95.000" */
const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(amount ?? 0);

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const AdminDashboard = ({ navigateTo }) => {

  // State array pesanan — diisi dari Supabase
  const [orders, setOrders] = useState([]);

  // State loading — true saat data belum tiba dari database
  const [isLoading, setIsLoading] = useState(true);

  // ─────────────────────────────────────────────────────────────
  // PAGINASI
  // ─────────────────────────────────────────────────────────────

  /**
   * currentPage — halaman tabel yang sedang aktif (dimulai dari 1)
   * itemsPerPage — jumlah baris yang ditampilkan per halaman
   *
   * Konsep: Data dari Supabase disimpan penuh di state `orders`,
   * lalu kita potong (slice) sesuai halaman aktif sebelum dirender.
   * Ini disebut "Client-Side Pagination".
   */
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ─────────────────────────────────────────────────────────────
  // FETCH DATA (READ dari Supabase)
  // ─────────────────────────────────────────────────────────────

  /**
   * fetchOrders — mengambil semua baris dari tabel `pesanan`
   *
   * .select('*')  → ambil semua kolom
   * .order(...)   → urutkan dari paling baru (descending)
   *
   * Hasilnya dimasukkan ke state `orders` agar ditampilkan di tabel.
   */
  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pesanan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Gagal mengambil data:', error.message);
    } else {
      setOrders(data); // simpan data dari Supabase ke state lokal React
    }
    setIsLoading(false);
  };

  /**
   * useEffect — dipanggil otomatis saat komponen pertama kali dirender
   * Array kosong [] berarti efek ini hanya berjalan SEKALI (on-mount).
   * Analogi: seperti constructor di Java/Python yang dijalankan saat objek dibuat.
   */
  useEffect(() => {
    fetchOrders();
  }, []);

  // ─────────────────────────────────────────────────────────────
  // UPDATE STATUS (UPDATE ke Supabase)
  // ─────────────────────────────────────────────────────────────

  /**
   * handleUpdateStatus — mengubah status pesanan di database dan di UI
   *
   * Rotasi status: Pending → Diproses → Selesai
   *
   * Setelah UPDATE di Supabase berhasil, kita juga update state `orders`
   * secara lokal menggunakan map() agar UI langsung berubah
   * tanpa harus memanggil fetchOrders() lagi (lebih efisien).
   *
   * @param {string|number} id            - Primary key baris yang akan diupdate
   * @param {string}        currentStatus - Status saat ini
   */
  const handleUpdateStatus = async (id, currentStatus) => {
    // Tentukan status berikutnya
    let newStatus;
    if (currentStatus === 'Pending')   newStatus = 'Diproses';
    else if (currentStatus === 'Diproses') newStatus = 'Selesai';
    else return; // Jika sudah 'Selesai', tidak ada perubahan

    // Kirim perintah UPDATE ke Supabase
    const { error } = await supabase
      .from('pesanan')
      .update({ status: newStatus })
      .eq('id', id); // .eq() = WHERE id = id (hanya update baris ini)

    if (error) {
      console.error('Gagal update status:', error.message);
      alert('Gagal mengubah status: ' + error.message);
      return;
    }

    // Update state lokal agar UI berubah langsung (tanpa refresh halaman)
    setOrders(prev =>
      prev.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  // ─────────────────────────────────────────────────────────────
  // KALKULASI STATISTIK + PAGINASI
  // ─────────────────────────────────────────────────────────────
  const totalPendapatan = orders.reduce((sum, o) => sum + (o.total_harga ?? 0), 0);
  const jumlahPending   = orders.filter(o => o.status === 'Pending').length;
  const STATS = [
    { title: 'Pesanan Baru',        value: jumlahPending,                  suffix: 'Pending'  },
    { title: 'Total Pendapatan',    value: formatCurrency(totalPendapatan), suffix: ''         },
    { title: 'Total Semua Pesanan', value: orders.length,                  suffix: 'Pesanan'  },
  ];

  // totalPages: berapa halaman yang dibutuhkan untuk semua data?
  // Math.ceil membulatkan ke atas agar sisa data tidak hilang.
  // Contoh: 23 data ÷ 10 per halaman = 2.3 → dibulatkan menjadi 3 halaman.
  const totalPages = Math.ceil(orders.length / itemsPerPage);

  // currentOrders: potongan data yang ditampilkan di halaman aktif
  // .slice(start, end) mengambil elemen dari index start hingga sebelum end.
  // Contoh halaman 2: slice(10, 20) → ambil data index ke-10 s.d. 19.
  const currentOrders = orders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <section className={styles.adminContainer}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.headerTitles}>
          <h1 className={styles.brand}>Bima Coffee</h1>
          <h2 className={styles.consoleTitle}>Admin Console</h2>
        </div>
        <button
          className={styles.logoutBtn}
          onClick={() => navigateTo('landing')}
        >
          LOGOUT <span aria-hidden="true">→</span>
        </button>
      </header>

      <main className={styles.mainContent}>

        {/* STATISTIK RINGKASAN */}
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

        {/* TABEL PESANAN */}
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Pesanan Masuk</h3>
            <div className={styles.tableActions}>
              <span className={styles.tableCount}>{orders.length} Total</span>
              {/* Tombol refresh manual jika user ingin data terbaru */}
              <button className={styles.refreshBtn} onClick={fetchOrders}>
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Tampilan loading saat data belum tiba dari Supabase */}
          {isLoading ? (
            <div className={styles.loadingState}>
              <p className={styles.loadingText}>Memuat data pesanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyText}>Belum ada pesanan masuk.</p>
            </div>
          ) : (
            <>
              {/* Tabel data pesanan */}
              <div className={styles.tableContainer}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr>
                      <th>Tanggal</th>
                      <th>Pelanggan</th>
                      <th>Kontak &amp; Alamat</th>
                      <th>Pesanan (Kopi)</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id}>

                        {/* Kolom 1: Tanggal */}
                        <td className={styles.tdDate}>
                          {formatDate(order.created_at)}
                        </td>

                        {/* Kolom 2: Nama Pelanggan */}
                        <td className={styles.tdName}>
                          {order.nama ?? '—'}
                        </td>

                        {/* Kolom 3: Kontak & Alamat */}
                        <td className={styles.tdContact}>
                          <div className={styles.tdContactInner}>
                            <span className={styles.contactWa}>{order.nomor_wa}</span>
                            <span className={styles.contactAddress}>{order.alamat}</span>
                          </div>
                        </td>

                        {/* Kolom 4: Pesanan JSONB
                            detail_pesanan berisi array: [{ productId, quantity }, ...]
                            .map() mengubah setiap item menjadi chip teks yang terbaca */}
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

                        {/* Kolom 5: Total Harga */}
                        <td className={styles.tdPrice}>
                          {formatCurrency(order.total_harga)}
                        </td>

                        {/* Kolom 6: Status badge */}
                        <td>
                          <span className={`${styles.statusBadge} ${
                            order.status === 'Pending'  ? styles.badgePending    :
                            order.status === 'Diproses' ? styles.badgeProcessing :
                            styles.badgeDone
                          }`}>
                            {order.status}
                          </span>
                        </td>

                        {/* Kolom 7: Aksi */}
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

              {/*
                Footer Paginasi — hanya ditampilkan jika ada lebih dari 1 halaman.
                totalPages > 1 mencegah kontrol paginasi muncul saat data sedikit.
              */}
              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {/* Tombol Previous — mundur satu halaman */}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Prev
                  </button>

                  {/* Indikator halaman saat ini */}
                  <span className={styles.pageInfo}>
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                  </span>

                  {/* Tombol Next — maju satu halaman */}
                  <button
                    className={styles.pageBtn}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </main>
    </section>
  );
};

export default AdminDashboard;
