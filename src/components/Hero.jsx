/**
 * Hero.jsx — Editorial Grid Layout
 *
 * Terinspirasi: tillerdigital.com, atomic.black
 * Layout: 12-column grid asimetris
 *   - Kolom 1-7 : teks raksasa BIMA / COFFEE
 *   - Kolom 6-12: gambar sinematik biji kopi (overlap ke kolom teks)
 *   - Metadata bar di bawah bergaya "data sheet"
 */

import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>

      {/* ── Grid utama 12 kolom ───────────────────────────────── */}
      <div className={styles.grid}>

        {/* ── Blok teks (kolom 1–7) ───────────────────────────── */}
        <div className={styles.textBlock}>

          {/* Label atas — "PREMIUM ROASTERY" */}
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Premium Roastery</span>
            <span className={styles.eyebrowDivider} />
            <span className={styles.eyebrow}>Est. 2024</span>
          </div>

          {/* Teks raksasa: BIMA kiri, COFFEE kanan */}
          <div className={styles.titleStack}>
            <h1 className={styles.wordBima}>BIMA</h1>
            <p  className={styles.wordCoffee}>COFFEE</p>
          </div>

          {/* Tagline bawah teks */}
          <p className={styles.tagline}>
            Single origin · Arabica · Highlands of Lumajang
          </p>
        </div>

        {/* ── Blok gambar — gradient overlay agar menyatu ke hitam ── */}
        <div className={styles.imageBlock}>
          <div className={styles.imageContainer}>
            <div className={styles.imageOverlay} />
            <img
              src="/hero-beans.png"
              alt="Dark-roasted coffee beans macro — Bima Coffee"
              className={styles.heroImage}
            />
          </div>
        </div>

      </div>

      {/* ── Bottom metadata bar ───────────────────────────────── */}
      <div className={styles.bottomBar}>

        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Lumajang, Indonesia</span>
          <span className={styles.metaSep} />
          <span className={styles.metaLabel}>1200 m asl</span>
          <span className={styles.metaSep} />
          <span className={styles.metaLabel}>Full Washed</span>
        </div>

        {/* CTA scroll — pojok kanan bawah */}
        <motion.div
          className={styles.scrollCta}
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <span className={styles.ctaText}>Scroll to Discover</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" className={styles.ctaArrow}>
            <line x1="7" y1="0" x2="7" y2="18" stroke="currentColor" strokeWidth="1"/>
            <polyline points="2,13 7,19 12,13" fill="none" stroke="currentColor" strokeWidth="1"/>
          </svg>
        </motion.div>

      </div>

    </section>
  );
};

export default Hero;
