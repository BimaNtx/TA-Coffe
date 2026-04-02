import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './IntroSection.module.css';

const SPRING = { stiffness: 100, damping: 30, restDelta: 0.001 };

// Stagger helper: creates offset scroll ranges for sequential reveals
const stagger = (base, i, step = 0.04) => [base + i * step, base + i * step + 0.12];

const IntroSection = () => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // ── Flower animations ────────────────────────────────
  const rawRotate = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const rotate = useSpring(rawRotate, SPRING);
  const rawFlowerY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const flowerY = useSpring(rawFlowerY, SPRING);

  // ── SVG path draw (flower → heading connector) ───────
  const rawPathLength = useTransform(scrollYProgress, [0.1, 0.5], [0, 1]);
  const pathLength = useSpring(rawPathLength, SPRING);
  const rawPathOpacity = useTransform(scrollYProgress, [0.08, 0.15, 0.55, 0.65], [0, 0.6, 0.6, 0]);
  const pathOpacity = useSpring(rawPathOpacity, SPRING);

  // ── Staggered text reveals ───────────────────────────
  // Each line gets its own offset range so they cascade in
  const textLines = [
    { key: 'eyebrow', base: 0.15 },
    { key: 'heading1', base: 0.15 },
    { key: 'heading2', base: 0.15 },
    { key: 'body', base: 0.15 },
    { key: 'divider', base: 0.15 },
  ];

  const makeLineAnim = (i) => {
    const [start, end] = stagger(0.15, i);
    const rawO = useTransform(scrollYProgress, [start, end], [0, 1]);
    const rawY = useTransform(scrollYProgress, [start, end], [28, 0]);
    return {
      opacity: useSpring(rawO, SPRING),
      y: useSpring(rawY, SPRING),
    };
  };

  const eyebrow = makeLineAnim(0);
  const heading1 = makeLineAnim(1);
  const heading2 = makeLineAnim(2);
  const bodyAnim = makeLineAnim(3);
  const dividerAnim = makeLineAnim(4);

  return (
    <section ref={sectionRef} className={styles.section} id="story">

      {/* ── Metadata accents (corner data) ──────────────── */}
      <div className={`${styles.meta} ${styles.metaTL}`}>
        <span>8°07'S 113°13'E</span>
        <span>LUMAJANG, EAST JAVA</span>
      </div>
      <div className={`${styles.meta} ${styles.metaTR}`}>
        <span>VARIETY: ARABICA</span>
        <span>ALTITUDE: 1200M</span>
      </div>
      <div className={`${styles.meta} ${styles.metaBL}`}>
        <span>PROCESS: FULL WASHED</span>
        <span>HARVEST: 2025</span>
      </div>
      <div className={`${styles.meta} ${styles.metaBR}`}>
        <span>LOT: BC-0421</span>
        <span>SCORE: 87.5 SCA</span>
      </div>

      <div className={styles.container}>

        {/* ── Left: Flower + SVG connector line ─────────── */}
        <div className={styles.flowerCol}>
          <motion.img
            src="/flower.png"
            alt="White coffee flower"
            className={styles.flower}
            style={{ rotate, y: flowerY }}
          />

          {/* SVG path that "draws itself" from flower toward text */}
          <motion.svg
            className={styles.pathSvg}
            viewBox="0 0 300 200"
            fill="none"
            style={{ opacity: pathOpacity }}
          >
            <motion.path
              d="M 60 20 C 120 20, 140 100, 220 100 C 260 100, 280 60, 300 80"
              stroke="rgba(245, 240, 235, 0.5)"
              strokeWidth="0.5"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </motion.svg>
        </div>

        {/* ── Right: Staggered text reveals ─────────────── */}
        <div className={styles.textCol}>
          <motion.span className={styles.eyebrow} style={eyebrow}>
            Our Origin
          </motion.span>

          <h2 className={styles.heading}>
            <motion.span className={styles.headingLine} style={heading1}>
              Sourced from the
            </motion.span>
            <motion.span className={styles.headingLine} style={heading2}>
              Heart of Indonesia
            </motion.span>
          </h2>

          <motion.p className={styles.body} style={bodyAnim}>
            From the volcanic highlands of Sumatra to the terraced slopes of
            Flores, every bean carries the character of its origin — nurtured by
            generations of farmers who understand the land as intimately as the
            craft.
          </motion.p>

          <motion.div className={styles.divider} style={dividerAnim} />
        </div>
      </div>
    </section>
  );
};

export default IntroSection;
