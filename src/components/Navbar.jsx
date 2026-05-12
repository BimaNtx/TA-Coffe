/**
 * Navbar.jsx
 *
 * Komponen navigasi yang selalu tampil di bagian atas layar (position: fixed).
 *
 * Fitur utama:
 *   - Efek "glassmorphism" — navbar menjadi buram/transparan saat user scroll ke bawah
 *   - Animasi berbasis scroll menggunakan useTransform Framer Motion
 *
 * Props yang diterima dari App.jsx:
 *   @prop {MotionValue<number>} scrollY      — nilai posisi scroll saat ini (dalam px)
 *   @prop {number}             navbarHeight  — tinggi navbar dalam px (default: 80)
 *   @prop {number}             animEnd       — titik scroll (px) dimana animasi selesai
 */

import { useTransform, motion } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar = ({ scrollY, navbarHeight, animEnd }) => {

  /**
   * glassFactor — angka antara 0 dan 1 yang mengontrol intensitas efek glass
   *
   * useTransform bekerja seperti "pemetaan nilai":
   *   - Saat scrollY = animEnd * 0.5 (setengah jalan) → glassFactor = 0 (transparan)
   *   - Saat scrollY = animEnd (penuh)                 → glassFactor = 1 (buram)
   *
   * Mengapa kita mulai dari setengah (animEnd * 0.5)?
   * Agar glass effect muncul sedikit lebih lambat dari animasi logo,
   * menciptakan urutan visual yang lebih menarik.
   */
  const glassFactor = useTransform(scrollY, [animEnd * 0.5, animEnd], [0, 1]);

  /**
   * bgColor — warna latar navbar, berubah dari transparan ke semi-hitam
   *
   * useTransform di sini menerima fungsi (bukan array angka) karena kita
   * perlu membangun string CSS secara dinamis: `rgba(10, 8, 8, ${opacity})`
   *
   * Saat glassFactor = 0 → rgba(10, 8, 8, 0)    = sepenuhnya transparan
   * Saat glassFactor = 1 → rgba(10, 8, 8, 0.55)  = semi-hitam
   */
  const bgColor = useTransform(
    glassFactor,
    (v) => `rgba(0, 0, 0, ${v})`
  );

  /**
   * blur — efek blur backdrop (mengaburkan konten di belakang navbar)
   *
   * Saat glassFactor = 0 → blur(0px)   = tidak ada blur
   * Saat glassFactor = 1 → blur(10px)  = blur maksimal
   *
   * backdropFilter adalah properti CSS modern untuk efek "frosted glass".
   * WebkitBackdropFilter dibutuhkan untuk browser Safari.
   */
  const blur = useTransform(
    glassFactor,
    (v) => `blur(${v * 10}px)`
  );

  /**
   * borderAlpha — opacity garis bawah navbar
   *
   * Saat masih di atas (glassFactor=0) → garis tidak terlihat
   * Setelah scroll (glassFactor=1) → garis tipis putih (opacity 0.08) muncul
   */
  const borderAlpha = useTransform(
    glassFactor,
    (v) => `rgba(255, 255, 255, ${v * 0.08})`
  );

  return (
    /**
     * motion.nav — elemen <nav> yang bisa menerima animasi Framer Motion
     *
     * style={{ backgroundColor, backdropFilter, ... }} menghubungkan
     * nilai-nilai useTransform ke properti CSS secara langsung dan real-time.
     * Tidak ada re-render React — nilai diupdate langsung oleh Framer Motion.
     */
    <motion.nav
      className={styles.navbar}
      style={{
        height: navbarHeight,
        backgroundColor: bgColor,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,     // prefix untuk Safari
        borderBottomColor: borderAlpha,
      }}
    >
      <div className={styles.navContainer}>

        {/* Link kiri */}
        <div className={styles.navLinks}>
          <a href="#order"   className={styles.link}>Shop</a>
          <a href="#catalog" className={styles.link}>Menu</a>
        </div>

        {/*
          Kolom tengah yang kosong — ini adalah "tempat duduk" logo.
          Logo BIMA COFFEE dirender di App.jsx dengan position:fixed,
          dan secara visual akan "mendarat" tepat di tengah celah ini.
          aria-hidden="true" menyembunyikannya dari screen reader.
        */}
        <div className={styles.logoGap} aria-hidden="true" />

        {/* Link kanan */}
        <div className={`${styles.navLinks} ${styles.navLinksRight}`}>
          <a href="#story"   className={styles.link}>Our Story</a>
          <a href="#contact" className={styles.link}>Contact</a>
        </div>

      </div>
    </motion.nav>
  );
};

export default Navbar;
