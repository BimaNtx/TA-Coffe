/**
 * ProductCatalog.jsx
 *
 * Section 4 — "Our Curated Beans"
 * Menampilkan daftar produk kopi dalam grid responsif.
 *
 * Konsep React yang dipelajari di sini:
 *   1. Array.map()   — merender banyak elemen dari satu array data
 *   2. Props         — mengirim data dari komponen induk ke komponen anak
 *   3. whileInView   — animasi otomatis saat elemen masuk viewport
 *   4. key prop      — identitas unik setiap elemen dalam list
 */

import { motion } from 'framer-motion';
import styles from './ProductCatalog.module.css';

// ─────────────────────────────────────────────────────────────
// DATA PRODUK (lokal — siap diganti dengan fetch dari database)
//
// Kenapa data dipisah ke konstanta di luar komponen?
// Agar komponen tidak perlu "tahu" datanya — ia hanya bertugas
// menampilkan data yang diberikan kepadanya. Prinsip ini disebut
// "separation of concerns" (pemisahan tanggung jawab).
// ─────────────────────────────────────────────────────────────
const products = [
  {
    id: 1,                       // kunci unik untuk React
    name:        'Semeru Espresso',
    origin:      'Lumajang, East Java',
    price:       'Rp 85.000',
    weight:      '200g',
    description: 'Dark roast dengan karakter bold dan full body. Cocok untuk espresso shot maupun manual brew yang kuat.',
    notes:       'Dark Chocolate · Full Body · Bold',
    image:       '/bag1.png',
  },
  {
    id: 2,
    name:        'Mandheling Gayo',
    origin:      'Aceh Tengah, Sumatra',
    price:       'Rp 90.000',
    weight:      '200g',
    description: 'Medium-dark roast dengan kompleksitas tinggi. Proses wet-hull menghasilkan karakter earthy yang khas Sumatra.',
    notes:       'Earthy · Cedar · Complex Spice',
    image:       '/bag2.png',
  },
  {
    id: 3,
    name:        'Toraja Kalosi',
    origin:      'Tana Toraja, Sulawesi',
    price:       'Rp 95.000',
    weight:      '200g',
    description: 'Medium roast yang smooth dan round. Natural process menghasilkan sweetness alami yang menonjol.',
    notes:       'Caramelized Sugar · Smooth · Nutty',
    image:       '/bag1.png',
  },
];

// ─────────────────────────────────────────────────────────────
// KOMPONEN ProductCard — Kartu untuk satu produk
//
// Menerima dua props:
//   `product` — satu objek dari array products di atas
//   `index`   — posisi urutan (0, 1, 2) untuk menghitung jeda stagger
// ─────────────────────────────────────────────────────────────
const ProductCard = ({ product, index }) => (
  <motion.article
    className={styles.card}

    /**
     * initial — posisi/kondisi AWAL elemen sebelum animasi berjalan
     * Elemen dimulai dari: tidak terlihat (opacity:0) dan 40px di bawah posisi asli (y:40)
     */
    initial={{ opacity: 0, y: 40 }}

    /**
     * whileInView — posisi/kondisi TARGET saat elemen masuk ke viewport
     * Elemen akan bergerak menuju: terlihat penuh (opacity:1) dan posisi normal (y:0)
     *
     * Jadi efeknya: kartu "muncul dari bawah" saat user scroll ke bagian ini.
     */
    whileInView={{ opacity: 1, y: 0 }}

    /**
     * viewport — mengatur kapan animasi whileInView dipicu
     *
     * once: true    → animasi hanya berjalan SEKALI (tidak berulang saat scroll balik)
     * amount: 0.2   → animasi dipicu saat 20% elemen sudah terlihat di layar
     *                 (tidak harus menunggu seluruh kartu terlihat)
     */
    viewport={{ once: true, amount: 0.2 }}

    /**
     * transition — mengatur "bagaimana" animasi berjalan
     *
     * duration: 0.6    → animasi memakan waktu 0.6 detik
     * delay: index * 0.12 → kartu ke-2 mulai 0.12 detik setelah kartu ke-1
     *                        kartu ke-3 mulai 0.24 detik setelah kartu ke-1
     *                        Ini menciptakan efek "stagger" (muncul berjenjang)
     * ease: [0.22, 1, 0.36, 1] → kurva kecepatan kustom (cubic bezier)
     *                             terasa: cepat di awal, melambat di akhir
     */
    transition={{
      duration: 0.6,
      delay: index * 0.12,
      ease: [0.22, 1, 0.36, 1],
    }}

    /**
     * whileHover — animasi yang aktif saat mouse berada di atas elemen
     * Kartu naik 6px saat di-hover, kembali ke posisi saat mouse pergi.
     */
    whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
  >
    {/* Area gambar produk */}
    <div className={styles.imageWrapper}>
      <img
        src={product.image}
        alt={`Foto produk ${product.name}`}
        className={styles.image}
        loading="lazy"   // browser memuat gambar hanya jika/saat hampir terlihat
      />
    </div>

    {/* Area teks informasi produk */}
    <div className={styles.info}>
      <span className={styles.origin}>{product.origin}</span>
      <h3   className={styles.name}>{product.name}</h3>
      <p    className={styles.notes}>{product.notes}</p>
      <p    className={styles.description}>{product.description}</p>

      {/* Baris harga dan tombol pesan */}
      <div className={styles.footer}>
        <div className={styles.priceGroup}>
          <span className={styles.price}>{product.price}</span>
          <span className={styles.weight}>{product.weight}</span>
        </div>
        <button
          className={styles.orderButton}
          aria-label={`Pesan ${product.name}`}
          onClick={() => alert(`Memesan: ${product.name}`)}
        >
          Pesan Sekarang
        </button>
      </div>
    </div>
  </motion.article>
);

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA ProductCatalog — Section pembungkus
// ─────────────────────────────────────────────────────────────
const ProductCatalog = () => (
  <section className={styles.section} id="shop">

    {/* Judul section — muncul dari bawah saat masuk viewport */}
    <motion.div
      className={styles.header}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className={styles.eyebrow}>Single Origin Collection</span>
      <h2   className={styles.title}>Our Curated Beans</h2>
      <p    className={styles.subtitle}>
        Dipilih langsung dari petani terpercaya di seluruh kepulauan Indonesia.
      </p>
    </motion.div>

    {/*
      Grid produk — dirender menggunakan map()
      ─────────────────────────────────────────
      Kenapa map() dan bukan menulis kartu satu per satu?

      Tanpa map() (cara manual, tidak efisien):
        <ProductCard product={products[0]} index={0} />
        <ProductCard product={products[1]} index={1} />
        <ProductCard product={products[2]} index={2} />

      Dengan map() (cara React, otomatis dan scalable):
        products.map((product, index) => <ProductCard ... />)

      Keuntungan map():
        1. Jika data bertambah menjadi 10 produk, kode tidak perlu diubah
        2. Jika nanti data dari database, bisa langsung di-map juga
        3. Kode lebih singkat dan mudah dibaca

      `key={product.id}` WAJIB ada di elemen paling luar loop.
      Ini membantu React melacak perubahan list dengan efisien.
    */}
    <div className={styles.grid}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}    // identitas unik — gunakan ID, bukan index
          product={product}   // kirim seluruh objek produk sebagai prop
          index={index}       // kirim posisi urutan untuk delay stagger
        />
      ))}
    </div>

  </section>
);

export default ProductCatalog;
