/**
 * ProductCatalog.jsx
 *
 * Section 4 — Katalog Produk "Our Curated Beans"
 *
 * ─────────────────────────────────────────────────────────────
 * FITUR UTAMA:
 *   1. Menampilkan 3 produk unggulan menggunakan .map()
 *   2. Tombol "PESAN SEKARANG" → onSelectProduct() + smooth-scroll ke form
 *   3. Tombol "LIHAT SEMUA MENU" → membuka Custom Modal di dalam komponen ini
 *
 * PROPS:
 *   @prop {function} onSelectProduct — fungsi dari App.jsx yang dipanggil
 *         saat user memilih produk, membawa productId sebagai argumen.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ProductCatalog.module.css';

// Helper: format harga dari angka ke Rupiah — contoh: 85000 → "Rp 85.000"
const formatHarga = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// ─────────────────────────────────────────────────────────────
// KOMPONEN: ProductCard — satu kartu per produk
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onSelect }) => {
  const tersedia = product.is_available !== false; // default anggap tersedia

  const handleOrder = () => {
    if (tersedia) onSelect(product.id);
  };

  return (
    <motion.article
      className={styles.productCard}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      <div className={styles.cardImage}>
        <img
          src={product.image_url || '/bag1.png'}
          alt={`Foto ${product.name}`}
          className={styles.productImg}
          loading="lazy"
        />
        {/* Badge "Habis" jika stok tidak tersedia */}
        {!tersedia && (
          <span style={{
            position: 'absolute', top: '0.75rem', right: '0.75rem',
            background: 'rgba(0,0,0,0.75)', color: '#ff6b6b',
            fontSize: '0.65rem', letterSpacing: '0.12em',
            padding: '0.25rem 0.6rem', borderRadius: '3px',
          }}>HABIS</span>
        )}
      </div>

      <div className={styles.cardBody}>
        <h3 className={styles.productName}>{product.name}</h3>

        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            {/* product.price dari Supabase adalah angka, diformat ke Rupiah */}
            <span className={styles.price}>{formatHarga(product.price)}</span>
          </div>
          <button
            className={styles.orderBtn}
            onClick={handleOrder}
            disabled={!tersedia}
            aria-label={tersedia ? `Pesan ${product.name}` : `${product.name} sedang habis`}
            style={{ opacity: tersedia ? 1 : 0.45, cursor: tersedia ? 'pointer' : 'not-allowed' }}
          >
            {tersedia ? 'Pesan Sekarang' : 'Habis'}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA: ProductCatalog
// ─────────────────────────────────────────────────────────────
const ProductCatalog = ({ products = [], onSelectProduct }) => {

  /**
   * isModalOpen — state yang mengontrol tampil/tidaknya modal
   *
   * false (default) = modal tersembunyi
   * true            = modal tampil
   *
   * Cara kerja conditional rendering:
   *   {isModalOpen && <div>...</div>}
   *   Jika isModalOpen = false → React tidak merender apapun
   *   Jika isModalOpen = true  → React merender <div>...
   */
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section id="catalog" className={styles.catalogSection}>

      {/* ── Judul Section ──────────────────────────────── */}
      <motion.div
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.eyebrow}>Single Origin Collection</span>
        <h2   className={styles.sectionTitle}>Our Curated Beans</h2>
        <p    className={styles.sectionSubtitle}>
          Dipilih langsung dari petani terpercaya di seluruh kepulauan Indonesia.
        </p>
      </motion.div>

      {/*
        ── Grid Produk ──────────────────────────────────────
        .map() menghasilkan satu <ProductCard> per produk.
        `key={product.id}` wajib ada agar React bisa melacak
        perubahan list dengan efisien.
      */}
      <div className={styles.catalogGrid}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      {/* ── Tombol Lihat Semua Menu ─────────────────────── */}
      <motion.div
        className={styles.viewAllWrap}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* setIsModalOpen(true) mengubah state → React re-render → modal muncul */}
        <button
          className={styles.viewAllBtn}
          onClick={() => setIsModalOpen(true)}
        >
          <span>Lihat Semua Menu</span>
          <span className={styles.btnArrow}>↗</span>
        </button>
      </motion.div>

      {/*
        ── Modal "Coming Soon" ─────────────────────────────
        Hanya dirender jika isModalOpen === true.

        Struktur:
          modalOverlay  — latar gelap fullscreen, klik di sini = tutup
            modalBox    — kotak konten di tengah
              (klik di sini TIDAK menutup, karena stopPropagation)
      */}
      {isModalOpen && (
        <div
          className={styles.modalOverlay}
          onClick={() => setIsModalOpen(false)}
        >
          {/*
            e.stopPropagation() — mencegah event klik di dalam kotak
            meneruskan (bubble up) ke .modalOverlay.
            Tanpa ini: klik di dalam kotak akan menutup modal.
          */}
          <div
            className={styles.modalBox}
            onClick={(e) => e.stopPropagation()}
          >
            <span className={styles.modalEyebrow}>Segera Hadir</span>
            <h3   className={styles.modalTitle}>Coming Soon</h3>
            <p    className={styles.modalText}>
              Katalog lengkap sedang diracik oleh barista kami.
              <br />
              Nantikan pengalaman memesan yang lebih lengkap.
            </p>
            <div className={styles.modalDivider} />
            {/* setIsModalOpen(false) = tutup modal */}
            <button
              className={styles.modalCloseBtn}
              onClick={() => setIsModalOpen(false)}
            >
              Kembali
            </button>
          </div>
        </div>
      )}

    </section>
  );
};

export default ProductCatalog;
