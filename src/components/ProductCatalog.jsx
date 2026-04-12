/**
 * ProductCatalog.jsx
 *
 * Section 4 — "Our Curated Beans"
 * Menampilkan daftar produk kopi dalam bentuk grid responsif.
 *
 * Struktur komponen:
 *   - `products` : data lokal (siap diganti dengan data dari database)
 *   - `ProductCard` : kartu individu per produk
 *   - `ProductCatalog` : section utama yang membungkus grid
 *
 * Animasi:
 *   - Framer Motion `whileHover` untuk efek scale pada kartu
 *   - `whileInView` untuk fade-in saat elemen masuk viewport
 */

import { motion } from 'framer-motion';
import styles from './ProductCatalog.module.css';

// ─────────────────────────────────────────────────────────────
// DATA PRODUK
// Catatan: Struktur objek ini dirancang agar mudah diganti
// dengan data dari API/database pada pengembangan selanjutnya.
// ─────────────────────────────────────────────────────────────
const products = [
  {
    id: 1,
    name: 'Semeru Espresso',
    origin: 'Lumajang, East Java',
    price: 'Rp 85.000',
    weight: '200g',
    description:
      'Dark roast dengan karakter bold dan full body. Cocok untuk espresso shot maupun manual brew yang kuat.',
    notes: 'Dark Chocolate · Full Body · Bold',
    image: '/bag1.png',
  },
  {
    id: 2,
    name: 'Mandheling Gayo',
    origin: 'Aceh Tengah, Sumatra',
    price: 'Rp 90.000',
    weight: '200g',
    description:
      'Medium-dark roast dengan kompleksitas tinggi. Proses wet-hull menghasilkan karakter earthy yang khas Sumatra.',
    notes: 'Earthy · Cedar · Complex Spice',
    image: '/bag2.png',
  },
  {
    id: 3,
    name: 'Toraja Kalosi',
    origin: 'Tana Toraja, Sulawesi',
    price: 'Rp 95.000',
    weight: '200g',
    description:
      'Medium roast yang smooth dan round. Natural process menghasilkan sweetness alami yang menonjol.',
    notes: 'Caramelized Sugar · Smooth · Nutty',
    image: '/bag1.png',
  },
];

// ─────────────────────────────────────────────────────────────
// KOMPONEN KARTU PRODUK
// Menerima satu objek `product` sebagai props.
// ─────────────────────────────────────────────────────────────

/**
 * @param {{ product: typeof products[0], index: number }} props
 */
const ProductCard = ({ product, index }) => (
  <motion.article
    className={styles.card}
    // Fade-in + slide-up saat kartu masuk viewport
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{
      duration: 0.6,
      delay: index * 0.12, // stagger antar kartu
      ease: [0.22, 1, 0.36, 1],
    }}
    // Scale up saat di-hover
    whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
  >
    {/* Gambar produk */}
    <div className={styles.imageWrapper}>
      <img
        src={product.image}
        alt={`Foto produk ${product.name}`}
        className={styles.image}
        loading="lazy"
      />
    </div>

    {/* Informasi produk */}
    <div className={styles.info}>
      {/* Origin tag */}
      <span className={styles.origin}>{product.origin}</span>

      {/* Nama produk */}
      <h3 className={styles.name}>{product.name}</h3>

      {/* Tasting notes */}
      <p className={styles.notes}>{product.notes}</p>

      {/* Deskripsi singkat */}
      <p className={styles.description}>{product.description}</p>

      {/* Baris harga & tombol */}
      <div className={styles.footer}>
        <div className={styles.priceGroup}>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.weight}>{product.weight}</span>
        </div>

        <button
          className={styles.orderButton}
          aria-label={`Pesan ${product.name}`}
          onClick={() => alert(`Memesan: ${product.name}`)} // placeholder
        >
          Pesan Sekarang
        </button>
      </div>
    </div>
  </motion.article>
);

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA — SECTION CATALOG
// ─────────────────────────────────────────────────────────────
const ProductCatalog = () => (
  <section className={styles.section} id="shop">

    {/* Header section */}
    <motion.div
      className={styles.header}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.eyebrow}>Single Origin Collection</span>
      <h2 className={styles.title}>Our Curated Beans</h2>
      <p className={styles.subtitle}>
        Dipilih langsung dari petani terpercaya di seluruh kepulauan Indonesia.
      </p>
    </motion.div>

    {/* Grid produk */}
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>

  </section>
);

export default ProductCatalog;
