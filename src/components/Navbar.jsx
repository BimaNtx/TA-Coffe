import { useTransform, motion } from 'framer-motion';
import styles from './Navbar.module.css';

const Navbar = ({ scrollY, navbarHeight, animEnd }) => {
  // Glass effect kicks in as the logo starts leaving the hero
  const glassFactor = useTransform(scrollY, [animEnd * 0.5, animEnd], [0, 1]);

  const bgColor = useTransform(
    glassFactor,
    (v) => `rgba(10, 8, 8, ${v * 0.55})`
  );
  const blur = useTransform(
    glassFactor,
    (v) => `blur(${v * 10}px)`
  );
  const borderAlpha = useTransform(
    glassFactor,
    (v) => `rgba(255, 255, 255, ${v * 0.08})`
  );

  return (
    <motion.nav
      className={styles.navbar}
      style={{
        height: navbarHeight,
        backgroundColor: bgColor,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        borderBottomColor: borderAlpha,
      }}
    >
      <div className={styles.navContainer}>
        {/* Left links */}
        <div className={styles.navLinks}>
          <a href="#shop" className={styles.link}>Shop</a>
          <a href="#menu" className={styles.link}>Menu</a>
        </div>

        {/* Center gap: the exact space the logo lands into */}
        <div className={styles.logoGap} aria-hidden="true" />

        {/* Right links */}
        <div className={`${styles.navLinks} ${styles.navLinksRight}`}>
          <a href="#story" className={styles.link}>Our Story</a>
          <a href="#contact" className={styles.link}>Contact</a>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
