import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './ProductShowcase.module.css';

const cards = [
  {
    id: 0,
    index: '01',
    title: 'Semeru Espresso',
    subtitle: 'Lumajang Local · East Java',
    altitude: '1200M',
    process: 'Full Washed',
    roast: 'Dark',
    notes: 'Dark Chocolate · Bold · Full Body',
    bg: 'var(--card-1)',
    img: '/bag1.png',
  },
  {
    id: 1,
    index: '02',
    title: 'Mandheling Gayo',
    subtitle: 'Aceh Tengah · Sumatra',
    altitude: '1500M',
    process: 'Wet Hulled',
    roast: 'Medium-Dark',
    notes: 'Earthy · Complex Spices · Cedar',
    bg: 'var(--card-2)',
    img: '/bag2.png',
  },
  {
    id: 2,
    index: '03',
    title: 'Toraja Kalosi',
    subtitle: 'Tana Toraja · Sulawesi',
    altitude: '1400M',
    process: 'Natural',
    roast: 'Medium',
    notes: 'Smooth · Caramelized Sugar · Nutty',
    bg: 'var(--card-3)',
    img: '/bag1.png',
  },
];

// Content variants — slides up and fades in when card enters view
const contentVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.07,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const StickyCard = ({ card }) => {
  const cardRef = useRef(null);

  // Parallax for the bag image within its own card
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'end start'],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);

  return (
    <div ref={cardRef} className={styles.stickyCard}>
      <div
        className={styles.cardInner}
        style={{ background: card.bg }}
      >
        {/* Top edge accent — makes the card edge visible while stacking */}
        <div className={styles.cardEdge} />

        {/* Left: product image with parallax */}
        <div className={styles.imageCol}>
          <motion.div className={styles.imageWrap} style={{ y: imgY }}>
            <motion.img
              src={card.img}
              alt={card.title}
              className={styles.bagImg}
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>
        </div>

        {/* Right: text content with staggered entrance */}
        <motion.div
          className={styles.textCol}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.5 }}
        >
          <motion.span
            className={styles.cardIndex}
            variants={contentVariants}
            custom={0}
          >
            {card.index} / 03
          </motion.span>

          <motion.h2
            className={styles.cardTitle}
            variants={contentVariants}
            custom={1}
          >
            {card.title}
          </motion.h2>

          <motion.p
            className={styles.cardSubtitle}
            variants={contentVariants}
            custom={2}
          >
            {card.subtitle}
          </motion.p>

          <motion.div
            className={styles.divider}
            variants={contentVariants}
            custom={3}
          />

          <motion.div
            className={styles.metaGrid}
            variants={contentVariants}
            custom={4}
          >
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Altitude</span>
              <span className={styles.metaValue}>{card.altitude}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Process</span>
              <span className={styles.metaValue}>{card.process}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Roast</span>
              <span className={styles.metaValue}>{card.roast}</span>
            </div>
          </motion.div>

          <motion.p
            className={styles.notes}
            variants={contentVariants}
            custom={5}
          >
            {card.notes}
          </motion.p>

          <motion.button
            className={styles.cta}
            variants={contentVariants}
            custom={6}
          >
            <span>Explore Origin</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

const ProductShowcase = () => (
  <section className={styles.wrapper} id="shop">
    {cards.map((card) => (
      <StickyCard key={card.id} card={card} />
    ))}
  </section>
);

export default ProductShowcase;
