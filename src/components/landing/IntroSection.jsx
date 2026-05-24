// 📌 [COMPONENT] IntroSection: Area cerita brand dengan efek animasi scroll (Parallax & Stagger).
// 🔄 Semua animasi berjalan proporsional mengikuti seberapa jauh user men-scroll layar (tidak ada timer).

import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './IntroSection.module.css';

// 🎨 [ANIMATION] Konfigurasi physics (pegas) untuk memastikan transisi animasi terasa natural.
const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

// ⚙️ [LOGIC] Helper untuk menghitung jeda (stagger) antar baris teks agar tidak muncul secara bersamaan.
const stagger = (base, i, step = 0.04) => [base + i * step, base + i * step + 0.12];

const IntroSection = () => {
  // 📌 [STATE] Referensi elemen utama (section) untuk mendeteksi posisi scroll user.
  const sectionRef = useRef(null);

  // 🎨 [ANIMATION] Melacak progress scroll user (nilai 0 s/d 1) khusus di area section ini saja.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // 🎨 [ANIMATION] Kalkulasi putaran bunga (0° ke 180°) mengikuti nilai scrollYProgress.
  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate = useSpring(rawRotate, SPRING);

  // 🎨 [ANIMATION] Efek parallax bunga: bergerak vertikal berlawanan arah scroll agar terasa mengambang.
  const rawFlowerY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const flowerY = useSpring(rawFlowerY, SPRING);

  // ⚙️ [LOGIC] Pabrik pembuat nilai animasi (opacity & Y) untuk masing-masing baris teks.
  const makeLineAnim = (i) => {
    const [start, end] = stagger(0.15, i);
    const rawO = useTransform(scrollYProgress, [start, end], [0, 1]);
    const rawY = useTransform(scrollYProgress, [start, end], [28, 0]);

    return {
      opacity: useSpring(rawO, SPRING),
      y: useSpring(rawY, SPRING),
    };
  };

  // 🎨 [ANIMATION] Menentukan urutan kemunculan elemen. Index 0 = pertama, 4 = terakhir.
  const eyebrow = makeLineAnim(0);
  const heading1 = makeLineAnim(1);
  const heading2 = makeLineAnim(2);
  const bodyAnim = makeLineAnim(3);
  const dividerAnim = makeLineAnim(4);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      id="story"
      style={{ position: 'relative', minHeight: '100vh', width: '100%', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5rem 2rem' }}
    >
      {/* 🖼️ [UI] Dekorasi koordinat statis di 4 sudut layar */}
      <div className={`${styles.meta} ${styles.metaTL}`}>
        <span>8°07'S 113°13'E</span>
        <span>LUMAJANG, EAST JAVA</span>
      </div>
      <div className={`${styles.meta} ${styles.metaTR}`}>
        <span>VARIETY: ARABICA</span>
        <span>ALTITUDE: 1200M</span>
      </div>
      <div className={`${styles.meta} ${styles.metaBL}`}>
        <span>PROCESS: FULL WASHED</span>
        <span>HARVEST: 2025</span>
      </div>
      <div className={`${styles.meta} ${styles.metaBR}`}>
        <span>LOT: BC-0421</span>
        <span>SCORE: 87.5 SCA</span>
      </div>

      <div className={styles.container}>
        {/* 🖼️ [UI] Kolom Kiri: Bunga berputar dan mengambang (Parallax) */}
        <div className={styles.flowerCol}>
          <motion.img
            src="/flower.png"
            alt="White coffee flower"
            className={styles.flower}
            style={{ rotate, y: flowerY }}
          />
        </div>

        {/* 🖼️ [UI] Kolom Kanan: Teks berjenjang (Staggered Reveal) */}
        <div className={styles.textCol}>
          <motion.span className={styles.eyebrow} style={eyebrow}>
            Our Origin
          </motion.span>

          <h2 className={styles.heading}>
            <motion.span className={styles.headingLine} style={heading1}>
              Sourced from the
            </motion.span>
            <motion.span className={styles.headingLine} style={heading2}>
              Heart of Indonesia
            </motion.span>
          </h2>

          <motion.p className={styles.body} style={bodyAnim}>
            From the volcanic highlands of Sumatra to the terraced slopes of
            Flores, every bean carries the character of its origin — nurtured by
            generations of farmers who understand the land as intimately as the
            craft.
          </motion.p>

          <motion.div className={styles.divider} style={dividerAnim} />
        </div>
      </div>
    </section>
  );
};

export default IntroSection;