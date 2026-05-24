// 📌 [COMPONENT] ProductCatalog: Menampilkan daftar produk (kopi) di halaman utama.
// 🔄 Menerima data dari App.jsx dan meneruskan interaksi user (klik pesan/lihat semua menu).

import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './ProductCatalog.module.css';

// ⚙️ [LOGIC] Mengubah angka mentah menjadi format Rupiah standar.
const formatHarga = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// 🧩 [CHILD COMPONENT] Tampilan satu baris untuk masing-masing produk kopi.
const ProductCard = ({ product, index, onSelect }) => {
  // ⚙️ [LOGIC] Cek ketersediaan produk agar tombol "Pesan" bisa di-disable jika habis.
  const tersedia = product.is_available !== false;

  // ⚙️ [LOGIC] Lempar ID produk ke keranjang (App.jsx) lalu auto-scroll ke form pembayaran.
  const handleOrder = () => {
    if (!tersedia) return;
    onSelect(product.id);
    document.getElementById('section-pesan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // 🎨 [ANIMATION] Efek muncul pelan-pelan dari bawah saat user men-scroll layar.
    <motion.article
      className={styles.productRow}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* 🖼️ Area Gambar */}
      <div className={styles.rowImage}>
        <img
          src={product.image_url || '/bag1.png'}
          alt={`Foto ${product.name}`}
          className={styles.productImg}
          loading="lazy"
        />
      </div>

      {/* 📝 Area Nama Produk & Tag Habis */}
      <div className={styles.rowInfo}>
        <h3 className={styles.productName}>{product.name}</h3>
        {!tersedia && (
          <span className={styles.habisTag}>HABIS</span>
        )}
      </div>

      {/* 💰 Area Harga & Tombol Pesan */}
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

// 🧩 [MAIN COMPONENT] Menyusun judul section, daftar produk, dan tombol "Lihat Semua".
const ProductCatalog = ({ products = [], onSelectProduct, onViewAll, hideViewAll = false }) => {

  return (
    <section id="catalog" className={styles.catalogSection}>

      {/* 🎨 [ANIMATION] Header/Judul Section */}
      <motion.div
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <span className={styles.eyebrow}>Single Origin Collection</span>
        <h2 className={styles.sectionTitle}>Our Curated Beans</h2>
        <p className={styles.sectionSubtitle}>
          Dipilih langsung dari petani terpercaya di seluruh kepulauan Indonesia.
        </p>
      </motion.div>

      {/* 🔄 [RENDER] Looping data produk dari database untuk mencetak deretan ProductCard */}
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

      {/* 🧭 [ROUTING] Tombol navigasi ke menu lengkap. Disembunyikan jika sudah di halaman Full Catalog. */}
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