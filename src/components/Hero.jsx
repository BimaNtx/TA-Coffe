/**
 * Hero.jsx
 *
 * Section 1 — Halaman pembuka (Landing Screen)
 *
 * Yang dirender di Hero:
 *   - Judul raksasa "BIMA COFFEE" statis di tengah layar
 *   - Overlay gelap di atas background foto
 *   - Indikator scroll (animasi bouncing "Explore ↓")
 */

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react'; // ikon panah bawah dari library Lucide
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.heroSection}>

      {/* Overlay hitam semi-transparan di atas background foto */}
      <div className={styles.overlay} />

      {/* Judul raksasa statis — ikut scroll secara natural */}
      <div className={styles.heroTitle}>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: '900',
          lineHeight: '0.85',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          display: 'block',
        }}>
          BIMA
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: '900',
          lineHeight: '0.85',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          display: 'block',
        }}>
          COFFEE
        </span>
      </div>

      {/*
        INDIKATOR SCROLL — memberi tahu user untuk scroll ke bawah
        ─────────────────────────────────────────────────────────────
        animate={{ y: [0, 10, 0] }}
        → Elemen bergerak: di posisi normal (0) → turun 10px → kembali ke normal (0)
        → Ini disebut "keyframe animation" — daftar nilai yang dilewati secara berurutan

        transition={{ repeat: Infinity, duration: 1.5 }}
        → Animasi diulang selamanya (Infinity), sekali putaran = 1.5 detik
        → ease: "easeInOut" membuat gerakan terasa smooth (lambat-cepat-lambat)
      */}
      <div className={styles.scrollIndicator}>
        <motion.div
          className={styles.scrollInner}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <span className={styles.scrollText}>Explore</span>
          <ChevronDown className={styles.scrollIcon} size={24} />
        </motion.div>
      </div>

    </section>
  );
};

export default Hero;
