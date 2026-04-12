/**
 * Hero.jsx
 *
 * Section 1 — Halaman pembuka (Landing Screen)
 *
 * Catatan desain:
 *   Logo "BIMA COFFEE" TIDAK dirender di sini.
 *   Logo dirender di App.jsx agar bisa bergerak bebas antara
 *   Hero (tengah layar) dan Navbar (atas layar) dengan satu animasi.
 *
 * Yang dirender di Hero:
 *   - Overlay gelap di atas background
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
