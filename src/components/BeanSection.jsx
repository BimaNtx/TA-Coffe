import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './BeanSection.module.css';

const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

const BeanSection = () => {
  const sectionRef = useRef(null);

  // 'start 0.8' means animation begins when the section top hits 80% of viewport
  // This creates overlap — the bean emerges while IntroSection is still visible
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.8', 'end start'],
  });

  // Bean rotation: full 360° mapped to scroll progress
  const rawBeanRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const beanRotate = useSpring(rawBeanRotate, SPRING);

  // Bean subtle scale pulse
  const rawBeanScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.85, 1.05, 0.9]);
  const beanScale = useSpring(rawBeanScale, SPRING);

  // Background text horizontal scroll: right-to-left
  const rawTextX = useTransform(scrollYProgress, [0, 1], ['20%', '-20%']);
  const textX = useSpring(rawTextX, SPRING);

  // Second line moves opposite direction
  const rawTextX2 = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const textX2 = useSpring(rawTextX2, SPRING);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* Moving background text */}
      <div className={styles.bgTextWrapper} aria-hidden="true">
        <motion.div className={styles.bgTextLine} style={{ x: textX }}>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
          <span className={styles.dot}>·</span>
          <span>AUTHENTIC ROASTERY</span>
        </motion.div>
        <motion.div className={`${styles.bgTextLine} ${styles.bgTextLine2}`} style={{ x: textX2 }}>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
          <span className={styles.dot}>·</span>
          <span>SINGLE ORIGIN</span>
        </motion.div>
      </div>

      {/* Foreground: massive spinning bean */}
      <div className={styles.beanWrapper}>
        <motion.img
          src="/bean.png"
          alt="Coffee bean"
          className={styles.bean}
          style={{ rotate: beanRotate, scale: beanScale }}
        />
      </div>
    </section>
  );
};

export default BeanSection;
