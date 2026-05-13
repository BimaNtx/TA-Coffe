/**
 * Hero.jsx
 *
 * Section 1 — Editorial Hero "Bima Coffee"
 *
 * Desain terinspirasi atomic.black & trucknroll.com:
 *   - Layout asimetris: "BIMA" kiri atas, "COFFEE" kanan bawah
 *   - Gambar biji kopi besar bertumpuk dengan teks (z-index overlap)
 *   - Metadata tipografi kecil di pojok dan garis pemisah tipis
 *   - CTA "SCROLL TO DISCOVER" minimalis di pojok kiri bawah
 */

import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>

      {/* ── Metadata pojok kiri atas ─────────────────────────── */}
      <div className={styles.metaTopLeft}>
        <span className={styles.metaLabel}>Premium Roastery</span>
        <span className={styles.metaDivider} />
        <span className={styles.metaLabel}>Est. 2024</span>
      </div>

      {/* ── Metadata pojok kanan atas ────────────────────────── */}
      <div className={styles.metaTopRight}>
        <span className={styles.metaLabel}>Lumajang, Indonesia</span>
        <span className={styles.metaDivider} />
        <span className={styles.metaLabel}>Single Origin</span>
      </div>

      {/* ── Area tipografi utama (asimetris) ─────────────────── */}
      <div className={styles.titleArea}>

        {/* "BIMA" — kiri atas, z-index rendah agar gambar overlap */}
        <h1 className={styles.wordBima}>BIMA</h1>

        {/*
          Gambar biji kopi — posisi absolut di tengah, z-index di antara
          dua kata sehingga "COFFEE" seolah di atas gambar.
        */}
        <div className={styles.imageWrap}>
          <img
            src="/bean.png"
            alt="Biji kopi pilihan Bima Coffee"
            className={styles.heroImage}
          />
        </div>

        {/* "COFFEE" — kanan bawah, z-index lebih tinggi dari gambar */}
        <p className={styles.wordCoffee}>COFFEE</p>

      </div>

      {/* ── Garis horizontal + CTA di pojok bawah kiri ──────── */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomLeft}>
          <motion.div
            className={styles.scrollCta}
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <span className={styles.ctaText}>Scroll to Discover</span>
            {/* Panah tipis SVG — lebih editorial dari ikon library */}
            <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className={styles.ctaArrow}>
              <line x1="8" y1="0" x2="8" y2="20" stroke="#FFFFFF" strokeWidth="1"/>
              <polyline points="3,15 8,21 13,15" fill="none" stroke="#FFFFFF" strokeWidth="1"/>
            </svg>
          </motion.div>
        </div>

        {/* Nomor seri editorial di pojok kanan bawah */}
        <div className={styles.bottomRight}>
          <span className={styles.metaLabel}>BC — 001</span>
        </div>
      </div>

    </section>
  );
};

export default Hero;
