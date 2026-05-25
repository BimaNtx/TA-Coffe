// 📌 [COMPONENT] Hero: Bagian paling atas (wajah) website dengan desain Editorial Grid asimetris (Brutalist).
// 🖼️ Fokus murni pada presentasi visual (UI/UX) tanpa ada logika fetching data.

import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero}>

      {/* 🖼️ [UI] Layout Grid Utama: Membagi area untuk teks raksasa di kiri dan gambar di kanan. */}
      <div className={styles.grid}>

        <div className={styles.textBlock}>
          {/* 🖼️ [UI] Label Metadata Atas */}
          <div className={styles.eyebrowRow}>
            <span className={styles.eyebrow}>Premium Roastery</span>
            <span className={styles.eyebrowDivider} />
            <span className={styles.eyebrow}>Est. 2024</span>
          </div>

          {/* 🖼️ [UI] Teks Utama (Tipografi Agresif) */}
          <div className={styles.titleStack}>
            <h1 className={styles.wordBima}>BIMA</h1>
            <p className={styles.wordCoffee}>COFFEE</p>
          </div>

          <p className={styles.tagline}>
            Single origin · Arabica · Highlands of Lumajang
          </p>
        </div>

        {/* 🖼️ [UI] Blok Gambar dengan efek gradient transparan agar menyatu dengan background hitam. */}
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

      {/* 🖼️ [UI] Baris Bawah: Menampilkan informasi spesifikasi kopi. */}
      <div className={styles.bottomBar}>

        <div className={styles.metaGroup}>
          <span className={styles.metaLabel}>Lumajang, Indonesia</span>
          <span className={styles.metaSep} />
          <span className={styles.metaLabel}>1200 m asl</span>
          <span className={styles.metaSep} />
          <span className={styles.metaLabel}>Full Washed</span>
        </div>

        {/* 🎨 [ANIMATION] Call to Action (CTA) Scroll: Animasi panah bergerak naik-turun (loop tak terhingga). */}
        <motion.div
          className={styles.scrollCta}
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
        >
          <span className={styles.ctaText}>Scroll to Discover</span>
          <svg width="14" height="22" viewBox="0 0 14 22" fill="none" className={styles.ctaArrow}>
            <line x1="7" y1="0" x2="7" y2="18" stroke="currentColor" strokeWidth="1" />
            <polyline points="2,13 7,19 12,13" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </motion.div>

      </div>

    </section>
  );
};

export default Hero;