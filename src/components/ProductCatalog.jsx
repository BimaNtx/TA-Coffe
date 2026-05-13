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
// KOMPONEN: ProductRow — satu baris per produk (gaya editorial list)
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onSelect }) => {
  const tersedia = product.is_available !== false; // default anggap tersedia

  const handleOrder = () => {
    if (!tersedia) return;
    onSelect(product.id);
    // Smooth scroll ke form pemesanan — optional chaining (?.) aman
    // dipakai di kedua halaman (landing & full_catalog)
    document.getElementById('section-pesan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.article
      className={styles.productRow}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Kiri: Gambar */}
      <div className={styles.rowImage}>
        <img
          src={product.image_url || '/bag1.png'}
          alt={`Foto ${product.name}`}
          className={styles.productImg}
          loading="lazy"
        />
      </div>

      {/* Tengah: Nama produk */}
      <div className={styles.rowInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        {!tersedia && (
          <span className={styles.habisTag}>HABIS</span>
        )}
      </div>

      {/* Kanan: Harga + Tombol */}
      <div className={styles.rowAction}>
        <span className={styles.price}>{formatHarga(product.price)}</span>
        <button
          className={styles.orderBtn}
          onClick={handleOrder}
          disabled={!tersedia}
          aria-label={tersedia ? `Pesan ${product.name}` : `${product.name} sedang habis`}
          style={{ opacity: tersedia ? 1 : 0.35, cursor: tersedia ? 'pointer' : 'not-allowed' }}
        >
          {tersedia ? 'Pesan' : 'Habis'}
        </button>
      </div>
    </motion.article>
  );
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA: ProductCatalog
// ─────────────────────────────────────────────────────────────
/**
 * onViewAll  — callback dari App.jsx untuk navigasi ke halaman Full Catalog.
 *              Hanya digunakan di mode landing (hideViewAll tidak di-set).
 * hideViewAll — jika true, tombol "Lihat Semua Menu" disembunyikan.
 *              Digunakan saat ProductCatalog dipakai di dalam FullCatalogView.
 */
const ProductCatalog = ({ products = [], onSelectProduct, onViewAll, hideViewAll = false }) => {

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
        ── List Produk ───────────────────────────────────────
        .map() menghasilkan satu <ProductRow> per produk.
        `key={product.id}` wajib ada agar React bisa melacak
        perubahan list dengan efisien.
      */}
      <div className={styles.catalogList}>
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onSelect={onSelectProduct}
          />
        ))}
      </div>

      {/*
        ── Tombol Lihat Semua Menu ───────────────────────────
        Disembunyikan saat hideViewAll === true (mode FullCatalogView).
        Memanggil onViewAll() dari App.jsx untuk navigasi ke 'full_catalog'.
      */}
      {!hideViewAll && (
        <motion.div
          className={styles.viewAllWrap}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            className={styles.viewAllBtn}
            onClick={() => onViewAll?.()}
          >
            <span>Lihat Semua Menu</span>
            <span className={styles.btnArrow}>↗</span>
          </button>
        </motion.div>
      )}

    </section>
  );
};

export default ProductCatalog;
