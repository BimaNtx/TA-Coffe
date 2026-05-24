/**
 * Navbar.jsx
 *
 * Komponen navigasi yang selalu tampil di bagian atas layar (position: fixed).
 *
 * Fitur utama:
 *   - Efek background hitam solid saat user scroll ke bawah
 *   - Smart hide-on-scroll: sembunyi saat scroll turun, muncul saat scroll naik
 *   - Animasi berbasis scroll menggunakan useTransform Framer Motion
 *   - Fullscreen Brutalist Overlay Menu untuk tampilan mobile
 *
 * Props yang diterima dari App.jsx:
 *   @prop {MotionValue<number>} scrollY      — nilai posisi scroll saat ini (dalam px)
 *   @prop {number}             navbarHeight  — tinggi navbar dalam px (default: 80)
 *   @prop {number}             animEnd       — titik scroll (px) dimana animasi selesai
 */

import { useState } from 'react';
import { useTransform, useScroll as usePageScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar = ({ scrollY, navbarHeight, animEnd }) => {

  // ─────────────────────────────────────────────────────────────
  // SMART HIDE-ON-SCROLL
  // ─────────────────────────────────────────────────────────────

  const [isHidden, setIsHidden] = useState(false);

  // ─────────────────────────────────────────────────────────────
  // MOBILE MENU STATE
  // ─────────────────────────────────────────────────────────────
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * usePageScroll() membuat scrollY lokal untuk deteksi ARAH scroll.
   * Berbeda dari prop `scrollY` (dari App.jsx) yang dipakai untuk
   * animasi glass/logo — keduanya bisa hidup berdampingan.
   */
  const { scrollY: pageScrollY } = usePageScroll();

  useMotionValueEvent(pageScrollY, 'change', (latest) => {
    const previous = pageScrollY.getPrevious() ?? 0;
    // Sembunyikan saat scroll KE BAWAH dan sudah melewati 150px
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  /**
   * glassFactor — angka antara 0 dan 1 yang mengontrol intensitas efek glass
   */
  const glassFactor = useTransform(scrollY, [animEnd * 0.5, animEnd], [0, 1]);

  /**
   * bgColor — warna latar navbar, berubah dari transparan ke semi-hitam
   */
  const bgColor = useTransform(
    glassFactor,
    (v) => `rgba(0, 0, 0, ${v})`
  );

  /**
   * blur — efek blur backdrop (mengaburkan konten di belakang navbar)
   */
  const blur = useTransform(
    glassFactor,
    (v) => `blur(${v * 10}px)`
  );

  /**
   * borderAlpha — opacity garis bawah navbar
   */
  const borderAlpha = useTransform(
    glassFactor,
    (v) => `rgba(255, 255, 255, ${v * 0.08})`
  );

  // ─────────────────────────────────────────────────────────────
  // TAUTAN NAVIGASI (satu sumber kebenaran untuk desktop & overlay)
  // ─────────────────────────────────────────────────────────────
  const NAV_LINKS = [
    { label: 'Shop', href: '#section-pesan' },
    { label: 'Menu', href: '#catalog' },
    { label: 'Our Story', href: '#story' },
    { label: 'Contact', href: '#contact' },
  ];

  /** Tutup overlay dan scroll ke anchor */
  const handleOverlayLink = (href) => {
    setIsMobileMenuOpen(false);
    // Beri waktu overlay untuk fade-out sebelum scroll
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <>
      {/* ── NAVBAR UTAMA ── */}
      <motion.nav
        className={styles.navbar}
        variants={{
          visible: { y: 0 },
          hidden: { y: '-100%' },
        }}
        animate={isHidden && !isMobileMenuOpen ? 'hidden' : 'visible'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          height: navbarHeight,
          backgroundColor: bgColor,
          backdropFilter: blur,
          WebkitBackdropFilter: blur,
          borderBottomColor: borderAlpha,
        }}
      >
        <div className={styles.navContainer}>

          {/* Link kiri — disembunyikan di mobile via CSS */}
          <div className={styles.navLinks}>
            <a href="#section-pesan" className={styles.link}>Shop</a>
            <a href="#catalog" className={styles.link}>Menu</a>
          </div>

          {/* Logo teks di tengah navbar */}
          <span style={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: '800',
            fontSize: '1rem',
            letterSpacing: '0.08em',
            color: '#FFFFFF',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Bima Coffee
          </span>

          {/* Link kanan — disembunyikan di mobile via CSS */}
          <div className={`${styles.navLinks} ${styles.navLinksRight}`}>
            <a href="#story" className={styles.link}>Our Story</a>
            <a href="#contact" className={styles.link}>Contact</a>
          </div>

          {/* ── Tombol MENU mobile — hanya tampil di mobile via CSS ── */}
          <button
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Buka menu navigasi"
            aria-expanded={isMobileMenuOpen}
          >
            [ MENU ]
          </button>

        </div>
      </motion.nav>

      {/* ── FULLSCREEN BRUTALIST OVERLAY MENU ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {/* Tombol CLOSE — pojok kanan atas */}
            <button
              className={styles.overlayClose}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Tutup menu"
            >
              [ CLOSE ]
            </button>

            {/* ── Tautan navigasi — besar, aggressive ── */}
            <nav className={styles.overlayLinks}>
              {NAV_LINKS.map(({ label, href }) => (
                <motion.a
                  key={href}
                  href={href}
                  className={styles.overlayLink}
                  onClick={(e) => {
                    e.preventDefault();
                    handleOverlayLink(href);
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {label}
                </motion.a>
              ))}
            </nav>

            {/* ── Footer info di overlay ── */}
            <span className={styles.overlayFooter}>
              Bima Coffee · Lumajang, East Java
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
