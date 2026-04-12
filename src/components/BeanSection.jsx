/**
 * BeanSection.jsx
 *
 * Section 3 — Biji Kopi Berputar ("The Big Bean")
 *
 * Konsep Framer Motion yang dipelajari di sini:
 *   1. useRef       — menandai elemen HTML agar bisa diukur oleh Framer Motion
 *   2. useScroll    — melacak seberapa jauh user sudah scroll dalam section ini
 *   3. useTransform — mengubah angka scroll menjadi nilai animasi (rotate, x, y, dll)
 *   4. useSpring    — menambahkan fisika pegas agar animasi terasa smooth/natural
 */

import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './BeanSection.module.css';

/**
 * SPRING CONFIG (konfigurasi pegas)
 *
 * stiffness  : seberapa kaku pegas — semakin tinggi, semakin cepat mengejar target
 * damping    : hambatan pegas — semakin tinggi, semakin cepat berhenti bergoyang
 * restDelta  : jarak minimum sebelum animasi dianggap selesai (optimasi performa)
 */
const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

const BeanSection = () => {
  /**
   * useRef — Membuat referensi ke elemen <section>
   *
   * Bayangkan useRef seperti "tanda tangan" yang kita tempel ke elemen HTML.
   * Dengan ref ini, Framer Motion bisa mengukur posisi section di halaman.
   */
  const sectionRef = useRef(null);

  /**
   * useScroll — Melacak progress scroll dalam section ini
   *
   * `scrollYProgress` adalah angka antara 0 dan 1:
   *   0 = section baru mulai terlihat di bawah layar
   *   1 = section sudah lewat dari atas layar
   *
   * `offset: ['start 0.8', 'end start']` berarti:
   *   - Animasi MULAI saat bagian atas section mencapai 80% tinggi viewport
   *   - Animasi SELESAI saat bagian bawah section meninggalkan atas layar
   *   - Efek: biji kopi mulai berputar sedikit lebih awal, menciptakan
   *     transisi yang seamless dari IntroSection di atasnya
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end start'],
  });

  /**
   * useTransform — Mengubah angka scroll (0-1) menjadi nilai rotasi (0-360)
   *
   * Cara membaca: "Saat scroll dari 0 ke 1, ubah rotate dari 0° ke 360°"
   * Artinya biji kopi berputar satu putaran penuh saat user meng-scroll
   * melewati seluruh section ini.
   *
   * useSpring membungkus nilai ini agar tidak langsung loncat —
   * nilai "dikejar" dengan fisika pegas.
   */
  const rawBeanRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const beanRotate    = useSpring(rawBeanRotate, SPRING);

  /**
   * Scale pulse — biji kopi sedikit mengecil di awal, membesar di tengah,
   * lalu mengecil kembali. Memberi kesan "breathing" atau "bernyawa".
   *
   * [0, 0.5, 1] adalah input positions (scroll progress)
   * [0.85, 1.05, 0.9] adalah output values (scale)
   */
  const rawBeanScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.9]);
  const beanScale    = useSpring(rawBeanScale, SPRING);

  /**
   * Background text — bergerak secara horizontal berlawanan arah
   * untuk menciptakan efek parallax (kedalaman visual).
   *
   * Line 1: bergerak dari kanan ke kiri  (+20% → -20%)
   * Line 2: bergerak dari kiri ke kanan  (-15% → +15%)
   *
   * Ini disebut "counter-parallax" — dua elemen berlawanan arah
   * membuat tampilan terasa lebih dinamis dan tiga dimensi.
   */
  const rawTextX  = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const textX     = useSpring(rawTextX, SPRING);

  const rawTextX2 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const textX2    = useSpring(rawTextX2, SPRING);

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* Teks latar belakang yang bergerak — hanya dekorasi, disembunyikan dari screen reader */}
      <div className={styles.bgTextWrapper} aria-hidden="true">

        {/* Baris 1: bergerak ke kiri saat scroll turun */}
        <motion.div className={styles.bgTextLine} style={{ x: textX }}>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
        </motion.div>

        {/* Baris 2: bergerak ke kanan saat scroll turun */}
        <motion.div className={`${styles.bgTextLine} ${styles.bgTextLine2}`} style={{ x: textX2 }}>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
        </motion.div>
      </div>

      {/* Biji kopi besar di tengah — berputar dan berdenyut sesuai scroll */}
      <div className={styles.beanWrapper}>
        <motion.img
          src="/bean.png"
          alt="Coffee bean"
          className={styles.bean}
          style={{ rotate: beanRotate, scale: beanScale }}
        />
      </div>

    </section>
  );
};

export default BeanSection;
