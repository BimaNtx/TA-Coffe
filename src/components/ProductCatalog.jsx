/**
 * ProductCatalog.jsx
 *
 * Section 4 — Katalog Produk "Our Curated Beans"
 *
 * ─────────────────────────────────────────────────────────────
 * FITUR UTAMA:
 *   1. Menampilkan 3 produk unggulan menggunakan .map()
 *   2. Tombol "PESAN SEKARANG" → memanggil onSelectProduct()
 *      lalu smooth-scroll otomatis ke Section 5 (Order Form)
 *   3. Tombol "LIHAT SEMUA MENU" di bagian bawah
 *
 * PROPS:
 *   @prop {function} onSelectProduct — fungsi dari App.jsx yang
 *         dipanggil saat user memilih produk. Membawa productId
 *         sebagai argumen, lalu App.jsx meneruskannya ke OrderForm.
 * ─────────────────────────────────────────────────────────────
 */

import { motion } from 'framer-motion';
import styles from './ProductCatalog.module.css';

// ─────────────────────────────────────────────────────────────
// DATA PRODUK
//
// Setiap objek memiliki `id` yang SAMA persis dengan value
// di <select> dropdown OrderForm.jsx.
// Ini penting agar saat "PESAN SEKARANG" diklik, dropdown di
// form langsung menampilkan produk yang benar.
// ─────────────────────────────────────────────────────────────
const products = [
  {
    id:          'semeru-espresso',      // harus cocok dengan OrderForm PRODUCTS
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
// KOMPONEN: ProductCard
//
// Satu kartu untuk satu produk.
// Menerima props: `product` (data produk) dan `onSelect` (fungsi).
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index, onSelect }) => {

  /**
   * handleOrder — fungsi yang berjalan saat tombol "PESAN SEKARANG" diklik
   *
   * Langkah 1: Panggil onSelect(product.id) → App.jsx menyimpan pilihan ini
   *            dan meneruskannya ke OrderForm sebagai nilai awal dropdown.
   *
   * Langkah 2: Smooth-scroll ke elemen dengan id="order"
   *            document.getElementById('order') mencari <section id="order">
   *            di OrderForm.jsx. scrollIntoView membuat halaman bergerak halus.
   */
  const handleOrder = () => {
    // Beritahu App.jsx produk mana yang dipilih
    onSelect(product.id);

    // Tunggu sedikit agar state App.jsx sempat update,
    // baru lakukan scroll (100ms biasanya cukup)
    setTimeout(() => {
      document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <motion.article
      className={styles.productCard}

      /**
       * Animasi masuk kartu:
       * initial    = posisi awal (tak terlihat, 40px di bawah)
       * whileInView = posisi target (terlihat penuh, posisi normal)
       * viewport    = trigger: 20% kartu terlihat, hanya sekali
       * transition  = delay berbeda per kartu → efek muncul berjenjang
       */
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,        // kartu ke-2 terlambat 0.12 detik, dst.
        ease: [0.22, 1, 0.36, 1],
      }}

      // Animasi hover: kartu sedikit naik
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      {/* Area foto produk */}
      <div className={styles.cardImage}>
        <img
          src={product.image}
          alt={`Foto ${product.name}`}
          className={styles.productImg}
          loading="lazy"
        />
      </div>

      {/* Area informasi teks */}
      <div className={styles.cardBody}>

        {/* Label asal daerah */}
        <span className={styles.originTag}>{product.origin}</span>

        {/* Nama produk */}
        <h3 className={styles.productName}>{product.name}</h3>

        {/* Tasting notes (karakter rasa) */}
        <p className={styles.tastingNotes}>{product.notes}</p>

        {/* Deskripsi singkat */}
        <p className={styles.productDesc}>{product.description}</p>

        {/* Baris bawah: harga + tombol */}
        <div className={styles.cardFooter}>
          <div className={styles.priceBlock}>
            <span className={styles.price}>{product.price}</span>
            <span className={styles.weight}>{product.weight}</span>
          </div>

          {/*
            Tombol PESAN SEKARANG
            onClick memanggil handleOrder() yang sudah didefinisikan di atas.
            aria-label membantu screen reader membaca tombol dengan konteks yang benar.
          */}
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
const ProductCatalog = ({ onSelectProduct }) => (
  <section className={styles.catalogSection} id="shop">

    {/* ── Judul Section ──────────────────────────────── */}
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

    {/*
      ── Grid Produk ────────────────────────────────────
      .map() menghasilkan satu <ProductCard> per produk.

      Kenapa tidak tulis manual?
        Jika data berubah (misalnya dari database), kode ini
        otomatis menyesuaikan tanpa perlu diubah sama sekali.

      `key={product.id}` → identitas unik wajib untuk setiap
      elemen dalam .map() agar React bisa melacak perubahan.
    */}
    <div className={styles.catalogGrid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          index={index}
          onSelect={onSelectProduct}   // teruskan prop dari App.jsx ke kartu
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
      <a
        href="/menu.pdf"           // ganti dengan link PDF menu yang sesungguhnya
        target="_blank"
        rel="noreferrer"
        className={styles.viewAllBtn}
      >
        <span>Lihat Semua Menu</span>
        <span className={styles.btnArrow}>↗</span>
      </a>
    </motion.div>

  </section>
);

export default ProductCatalog;
