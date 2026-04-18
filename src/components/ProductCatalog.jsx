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

// ─────────────────────────────────────────────────────────────
// DATA PRODUK
// Setiap `id` harus cocok persis dengan PRODUCTS di OrderForm.jsx
// agar dropdown form bisa terisi otomatis.
// ─────────────────────────────────────────────────────────────
const products = [
  {
    id:          'semeru-espresso',
    name:        'Semeru Espresso',
    origin:      'Lumajang, East Java',
    price:       'Rp 85.000',
    weight:      '200g',
    notes:       'Dark Chocolate · Full Body · Bold',
    description: 'Dark roast dengan karakter bold dan full body. Cocok untuk espresso shot maupun manual brew yang kuat.',
    image:       '/bag1.png',
  },
  {
    id:          'mandheling-gayo',
    name:        'Mandheling Gayo',
    origin:      'Aceh Tengah, Sumatra',
    price:       'Rp 90.000',
    weight:      '200g',
    notes:       'Earthy · Cedar · Complex Spice',
    description: 'Medium-dark roast dengan kompleksitas tinggi. Proses wet-hull menghasilkan karakter earthy khas Sumatra.',
    image:       '/bag2.png',
  },
  {
    id:          'toraja-kalosi',
    name:        'Toraja Kalosi',
    origin:      'Tana Toraja, Sulawesi',
    price:       'Rp 95.000',
    weight:      '200g',
    notes:       'Caramelized Sugar · Smooth · Nutty',
    description: 'Medium roast yang smooth dan round. Natural process menghasilkan sweetness alami yang menonjol.',
    image:       '/bag1.png',
  },
];

// ─────────────────────────────────────────────────────────────
// KOMPONEN: ProductCard — satu kartu per produk
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onSelect }) => {

  /**
   * handleOrder — dipanggil saat tombol "PESAN SEKARANG" diklik
   *
   * Cukup panggil onSelect(product.id).
   * Logika Smart Add (cek duplikat, isi baris kosong, tambah baris baru)
   * dan scroll ke form semuanya sudah diurus oleh smartAddProduct() di App.jsx.
   */
  const handleOrder = () => {
    onSelect(product.id);
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
          src={product.image}
          alt={`Foto ${product.name}`}
          className={styles.productImg}
          loading="lazy"
        />
      </div>

      <div className={styles.cardBody}>
        <span className={styles.originTag}>{product.origin}</span>
        <h3   className={styles.productName}>{product.name}</h3>
        <p    className={styles.tastingNotes}>{product.notes}</p>
        <p    className={styles.productDesc}>{product.description}</p>

        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{product.price}</span>
            <span className={styles.weight}>{product.weight}</span>
          </div>
          <button
            className={styles.orderBtn}
            onClick={handleOrder}
            aria-label={`Pesan ${product.name}`}
          >
            Pesan Sekarang
          </button>
        </div>
      </div>
    </motion.article>
  );
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA: ProductCatalog
// ─────────────────────────────────────────────────────────────
const ProductCatalog = ({ onSelectProduct }) => {

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
