import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.overlay}></div>

      {/* The logo has been extracted to App.jsx so it can float over both Hero and Navbar */}

      <div className={styles.scrollIndicator}>
        <motion.div
          className={styles.scrollInner}
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <span className={styles.scrollText}>Explore</span>
          <ChevronDown className={styles.scrollIcon} size={24} />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
