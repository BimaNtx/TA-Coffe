/**
 * IntroSection.jsx
 *
 * Section 2 — Pengenalan Brand ("Our Origin")
 *
 * Fitur animasi yang ada di section ini:
 *   1. Bunga kopi (flower.png) — berputar dan bergerak naik saat scroll
 *   2. Garis SVG  — "menggambar dirinya sendiri" dari bunga ke arah teks
 *   3. Teks berjenjang — muncul satu per satu dengan jeda (stagger)
 *
 * Semua animasi TERIKAT pada scroll — jika user berhenti scroll,
 * animasi juga ikut berhenti (tidak ada loop atau timer).
 */

import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './IntroSection.module.css';

/**
 * SPRING CONFIG
 * Nilainya sama dengan BeanSection untuk konsistensi "rasa" animasi
 * di seluruh halaman.
 */
const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

/**
 * stagger() — Helper function untuk membuat range waktu yang bergeser
 *
 * Digunakan agar setiap baris teks muncul dengan sedikit jeda dari baris sebelumnya.
 *
 * Contoh untuk baris ke-2 (i=1), base=0.15, step=0.04:
 *   start = 0.15 + 1 * 0.04 = 0.19
 *   end   = 0.19 + 0.12     = 0.31
 * → Baris ke-2 muncul saat scrollYProgress berada di antara 0.19 dan 0.31
 *
 * @param {number} base - scroll progress awal munculnya baris pertama
 * @param {number} i    - index baris (0, 1, 2, dst.)
 * @param {number} step - jeda antar baris dalam satuan scroll progress
 */
const stagger = (base, i, step = 0.04) => [base + i * step, base + i * step + 0.12];

const IntroSection = () => {
  const sectionRef = useRef(null);

  /**
   * useScroll dengan offset ['start end', 'end start']
   *
   * 'start end' — animasi MULAI saat bagian ATAS section menyentuh bagian BAWAH viewport
   *               (= section mulai masuk dari bawah layar)
   * 'end start' — animasi SELESAI saat bagian BAWAH section menyentuh bagian ATAS viewport
   *               (= section sepenuhnya meninggalkan layar ke atas)
   *
   * Ini adalah setup paling umum untuk animasi scroll yang mencakup seluruh section.
   */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // ─────────────────────────────────────────────────────────────
  // ANIMASI BUNGA
  // ─────────────────────────────────────────────────────────────

  /**
   * Rotasi bunga: berputar dari 0° menjadi 180° selama user scroll
   * melewati seluruh section.
   */
  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate    = useSpring(rawRotate, SPRING);

  /**
   * Parallax vertikal bunga: bergerak ke atas (-60px) saat scroll turun.
   * Karena bergerak lebih lambat dari konten normal, terasa "mengambang".
   */
  const rawFlowerY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const flowerY    = useSpring(rawFlowerY, SPRING);

  // ─────────────────────────────────────────────────────────────
  // ANIMASI GARIS SVG (Path Drawing)
  // ─────────────────────────────────────────────────────────────

  /**
   * pathLength adalah property khusus Framer Motion untuk SVG.
   *
   * Nilai 0 = garis belum tergambar sama sekali
   * Nilai 1 = garis sudah tergambar penuh
   *
   * Dengan memetakan scroll progress ke pathLength,
   * kita bisa membuat garis "menggambar dirinya sendiri" seiring scroll.
   */
  const rawPathLength  = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const pathLength     = useSpring(rawPathLength, SPRING);

  /**
   * pathOpacity — garis muncul dan menghilang secara otomatis.
   * Punya 4 breakpoint: muncul cepat, bertahan, lalu memudar.
   *
   * [0.08, 0.15, 0.55, 0.65] → [0, 0.6, 0.6, 0]
   * Artinya: muncul di scroll 8-15%, bertahan hingga 55%, lalu hilang di 55-65%
   */
  const rawPathOpacity = useTransform(
    scrollYProgress,
    [0.08, 0.15, 0.55, 0.65],
    [0,    0.6,  0.6,  0]
  );
  const pathOpacity = useSpring(rawPathOpacity, SPRING);

  // ─────────────────────────────────────────────────────────────
  // TEKS BERJENJANG (STAGGER)
  // ─────────────────────────────────────────────────────────────

  /**
   * makeLineAnim() — membuat animasi opacity + y untuk satu baris teks
   *
   * Setiap baris mendapat `i` yang berbeda → range scroll yang berbeda
   * → baris pertama muncul lebih dulu dari baris kedua, dst.
   *
   * Ini adalah pola umum "staggered reveal" dalam web animation.
   *
   * @param {number} i - urutan baris (0 = pertama muncul)
   */
  const makeLineAnim = (i) => {
    const [start, end] = stagger(0.15, i);

    // opacity: 0 → 1 (dari transparan ke terlihat)
    const rawO = useTransform(scrollYProgress, [start, end], [0, 1]);

    // y: 28px → 0px (dari bawah ke posisi normal)
    const rawY = useTransform(scrollYProgress, [start, end], [28, 0]);

    return {
      opacity: useSpring(rawO, SPRING),
      y:       useSpring(rawY, SPRING),
    };
  };

  // Buat animasi untuk masing-masing elemen teks
  const eyebrow    = makeLineAnim(0); // "Our Origin" — muncul pertama
  const heading1   = makeLineAnim(1); // "Sourced from the"
  const heading2   = makeLineAnim(2); // "Heart of Indonesia"
  const bodyAnim   = makeLineAnim(3); // Paragraf deskripsi
  const dividerAnim = makeLineAnim(4); // Garis pembatas — muncul terakhir

  return (
    <section ref={sectionRef} className={styles.section} id="story">

      {/* ── Data koordinat di pojok-pojok (hanya dekorasi visual) ── */}
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

        {/* ── Kolom Kiri: Bunga + Garis SVG ─────────────────── */}
        <div className={styles.flowerCol}>

          {/*
            motion.img memungkinkan kita mengaplikasikan nilai animasi Framer Motion
            langsung ke elemen <img> melalui prop `style`.
            `rotate` dan `y` berasal dari useTransform + useSpring di atas.
          */}
          <motion.img
            src="/flower.png"
            alt="White coffee flower"
            className={styles.flower}
            style={{ rotate, y: flowerY }}
          />

          {/*
            SVG dengan pathLength — "menggambar dirinya sendiri" seiring scroll.
            motion.path mendukung animasi `pathLength` secara native.
          */}
          <motion.svg
            className={styles.pathSvg}
            viewBox="0 0 300 200"
            fill="none"
            style={{ opacity: pathOpacity }}
          >
            <motion.path
              d="M 60 20 C 120 20, 140 100, 220 100 C 260 100, 280 60, 300 80"
              stroke="rgba(245, 240, 235, 0.5)"
              strokeWidth="0.5"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </motion.svg>
        </div>

        {/* ── Kolom Kanan: Teks Berjenjang ─────────────────────── */}
        <div className={styles.textCol}>

          {/*
            Setiap elemen teks dibungkus dengan motion.span atau motion.p.
            Prop `style` menerima objek dari makeLineAnim() yang berisi
            nilai opacity dan y yang sudah diolah dengan useSpring.
          */}

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

          {/* Garis pembatas tipis — muncul paling terakhir */}
          <motion.div className={styles.divider} style={dividerAnim} />
        </div>

      </div>
    </section>
  );
};

export default IntroSection;
