// 📌 [COMPONENT] BeanSection: Area visual transisi dengan gambar biji kopi raksasa di tengah.
// 🎨 Menampilkan efek parallax pada teks latar dan rotasi pada biji kopi berdasarkan pergerakan scroll.

import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './BeanSection.module.css';

// 🎨 [ANIMATION] Konfigurasi physics pegas untuk transisi animasi yang mulus dan natural.
const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

const BeanSection = () => {
  // 📌 [STATE] Referensi ke elemen section utama agar Framer Motion bisa mengukur posisinya di layar.
  const sectionRef = useRef(null);

  // 🎨 [ANIMATION] Melacak progress scroll user (0 s/d 1) khusus saat melewati area section ini.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end start'],
  });

  // 🎨 [ANIMATION] Kalkulasi rotasi biji kopi: berputar 360 derajat secara penuh mengikuti arah scroll.
  const rawBeanRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const beanRotate = useSpring(rawBeanRotate, SPRING);

  // 🎨 [ANIMATION] Kalkulasi skala: biji sedikit mengecil di awal, membesar di tengah, lalu mengecil kembali (efek denyut).
  const rawBeanScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.9]);
  const beanScale = useSpring(rawBeanScale, SPRING);

  // 🎨 [ANIMATION] Efek Counter-Parallax: baris teks 1 dan 2 bergerak saling berlawanan arah secara horizontal.
  const rawTextX = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const textX = useSpring(rawTextX, SPRING);

  const rawTextX2 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const textX2 = useSpring(rawTextX2, SPRING);

  return (
    <section ref={sectionRef} className={styles.section}>

      {/* 🖼️ [UI] Dekorasi teks latar belakang (disembunyikan dari screen reader agar aksesibilitas aman) */}
      <div className={styles.bgTextWrapper} aria-hidden="true">

        <motion.div className={styles.bgTextLine} style={{ x: textX }}>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
        </motion.div>

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

      {/* 🖼️ [UI] Biji kopi utama di tengah layar */}
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