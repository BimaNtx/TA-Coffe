import { useRef } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import styles from './CraftSection.module.css';

const SPRING = { stiffness: 75, damping: 22, restDelta: 0.001 };

const CraftSection = () => {
  const wrapperRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ['start start', 'end end'],
  });

  // Scale: 1 (hold, word readable) → 150 (hole massively overflows viewport)
  // The enormous scale is intentional: it guarantees zero white edges remain.
  const rawScale = useTransform(
    scrollYProgress,
    [0,   0.35, 0.42, 1.0],
    [1,   1,    1.4,  150]
  );
  const scale = useSpring(rawScale, SPRING);

  // Opacity: secondary cleanup — fades the white overlay to 0 by scroll 0.9.
  // Even if a stray white pixel survives the scale, opacity kills it.
  const rawOverlayOpacity = useTransform(
    scrollYProgress,
    [0,   0.70, 0.90],
    [1,   1,    0]
  );
  const overlayOpacity = useSpring(rawOverlayOpacity, SPRING);

  // Label: fades in quickly, disappears before the explosion
  const rawLabelOpacity = useTransform(
    scrollYProgress,
    [0, 0.06, 0.28, 0.40],
    [0,  1,    1,    0]
  );
  const labelOpacity = useSpring(rawLabelOpacity, SPRING);

  // Subtitle: below the sticky, appears only once the explosion is complete
  const rawSubOpacity = useTransform(scrollYProgress, [0.88, 1.0], [0, 1]);
  const subOpacity = useSpring(rawSubOpacity, SPRING);

  return (
    <section ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.sticky}>

        {/*
          ── LAYER 1: STATIC BACKGROUND IMAGE ─────────────────────
          z-index: 1. Does NOT scale. Does NOT animate.
          Visible only through the "CRAFTED" hole while the
          white overlay is in place, then fully revealed once
          the overlay has scaled off-screen.
        */}
        <img
          src="/craft-bw.png"
          alt="Traditional coffee sorting"
          className={styles.bgImage}
        />

        {/*
          ── LAYER 2: THE "PUNCHED WHITE PAPER" ──────────────────
          z-index: 2. This is what scales.

          HOW IT WORKS:
          The SVG contains a <mask> where:
            • A white <rect> covers the full viewBox → overlay is white everywhere
            • A black <text> punches a hole in that rect → the word shape becomes transparent
          The masked <rect fill="white"> is then drawn to screen.

          Result: Pure white everywhere EXCEPT inside the letter shapes of "CRAFTED"
          — those pixels are transparent, revealing the static image on Layer 1 beneath.

          As Framer Motion scales this element to 32×:
            • The white area moves off-screen (clipped by sticky's overflow:hidden)
            • The "CRAFTED" hole expands until it fills the entire viewport
            → Background image is now fully revealed. The user has "stepped through" the word.
        */}
        <motion.div
          className={styles.overlayWrapper}
          style={{ scale, opacity: overlayOpacity }}
        >
          <svg
            className={styles.punchSvg}
            viewBox="0 0 1440 810"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <mask id="punch-mask">
                {/* White = the SVG mask is opaque (= the white overlay is solid) */}
                <rect x="0" y="0" width="1440" height="810" fill="white" />
                {/*
                  Black text = the mask becomes transparent here
                  → this punches a HOLE in the white rect in the shape of the letters
                  Cormorant Garamond is loaded as a web font on the page,
                  so it renders inside inline SVG correctly.
                */}
                <text
                  x="720"
                  y="480"
                  textAnchor="middle"
                  dominantBaseline="auto"
                  fontFamily="'Cormorant Garamond', Georgia, serif"
                  fontWeight="700"
                  fontSize="260"
                  letterSpacing="12"
                  fill="black"
                >
                  CRAFTED
                </text>
              </mask>
            </defs>

            {/* The white rectangle with the punch-out mask applied */}
            <rect
              x="0" y="0"
              width="1440" height="810"
              fill="white"
              mask="url(#punch-mask)"
            />
          </svg>
        </motion.div>

        {/* Section label — sits above both layers */}
        <motion.div
          className={styles.topLabel}
          style={{ opacity: labelOpacity }}
          aria-hidden="true"
        >
          <span className={styles.labelLine} />
          <span className={styles.labelText}>The Craft</span>
          <span className={styles.labelLine} />
        </motion.div>

      </div>
      {/* ── end sticky ──────────────────────────────────── */}

      {/* Subtitle: outside sticky, appears after the explosion */}
      <motion.div
        className={styles.subtitleWrap}
        style={{ opacity: subOpacity }}
      >
        <p className={styles.subtitle}>From our hands to your cup.</p>
      </motion.div>

    </section>
  );
};

export default CraftSection;
