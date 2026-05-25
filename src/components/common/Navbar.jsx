// 📌 [COMPONENT] Navbar: Navigasi utama yang selalu melayang di atas layar (sticky).
// 🎨 Dilengkapi efek glassmorphism (transparan ke blur) dan fitur Smart Hide-on-Scroll.

import { useState } from 'react';
import { useTransform, useScroll as usePageScroll, useMotionValueEvent, motion, AnimatePresence } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar = ({ scrollY, navbarHeight, animEnd }) => {

  // 📌 [STATE] Mengontrol visibilitas navbar (sembunyi saat scroll turun, muncul saat scroll naik).
  const [isHidden, setIsHidden] = useState(false);

  // 📌 [STATE] Mengontrol status buka/tutup menu fullscreen khusus untuk tampilan mobile.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🎨 [ANIMATION] Melacak pergerakan scroll halaman secara global untuk mendeteksi arah scroll.
  const { scrollY: pageScrollY } = usePageScroll();

  // ⚙️ [LOGIC] Membandingkan posisi scroll saat ini dengan sebelumnya. Jika turun > 150px, sembunyikan Navbar.
  useMotionValueEvent(pageScrollY, 'change', (latest) => {
    const previous = pageScrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
  });

  // 🎨 [ANIMATION] Serangkaian efek transformasi gaya (style) navbar yang berubah beriringan dengan posisi scroll user.
  const glassFactor = useTransform(scrollY, [animEnd * 0.5, animEnd], [0, 1]);
  const bgColor = useTransform(glassFactor, (v) => `rgba(0, 0, 0, ${v})`);
  const blur = useTransform(glassFactor, (v) => `blur(${v * 10}px)`);
  const borderAlpha = useTransform(glassFactor, (v) => `rgba(255, 255, 255, ${v * 0.08})`);

  // ⚙️ [LOGIC] Master daftar tautan agar konsisten digunakan di mode Desktop maupun Mobile.
  const NAV_LINKS = [
    { label: 'Shop', href: '#section-pesan' },
    { label: 'Menu', href: '#catalog' },
    { label: 'Our Story', href: '#story' },
    { label: 'Contact', href: '#contact' },
  ];

  // ⚙️ [LOGIC] Menutup menu mobile, menunggu 200ms agar animasi fade-out selesai, lalu auto-scroll ke section yang dituju.
  const handleOverlayLink = (href) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  return (
    <>
      {/* 🖼️ [UI] Navbar Utama (Desktop & Tablet) */}
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
          <div className={styles.navLinks}>
            <a href="#section-pesan" className={styles.link}>Shop</a>
            <a href="#catalog" className={styles.link}>Menu</a>
          </div>

          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: '800', fontSize: '1rem', letterSpacing: '0.08em', color: '#FFFFFF', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Bima Coffee
          </span>

          <div className={`${styles.navLinks} ${styles.navLinksRight}`}>
            <a href="#story" className={styles.link}>Our Story</a>
            <a href="#contact" className={styles.link}>Contact</a>
          </div>

          {/* 📱 [UI] Tombol Hamburger Menu (Hanya terlihat di layar kecil via CSS) */}
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

      {/* 📱 [UI] Fullscreen Overlay Menu khusus Mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <button className={styles.overlayClose} onClick={() => setIsMobileMenuOpen(false)} aria-label="Tutup menu">
              [ CLOSE ]
            </button>

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