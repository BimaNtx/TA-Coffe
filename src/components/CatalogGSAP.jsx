import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './CatalogGSAP.module.css';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    title: 'Signature Blend',
    subtitle: 'Roasted Beans',
    origin: 'Lumajang, East Java',
    altitude: '1,200 M',
    process: 'Full Washed',
    notes: 'Dark Chocolate · Toasted Caramel · Bold Spice',
    price: 'IDR 185.000',
    weight: '340g · Whole Bean',
    img: '/catalog-roasted.png',
  },
  {
    id: 2,
    title: 'Single Espresso',
    subtitle: 'Espresso',
    origin: 'Semeru Reserve',
    altitude: '1,350 M',
    process: 'Honey Process',
    notes: 'Rich Crema · Intense Body · Lingering Finish',
    price: 'IDR 42.000',
    weight: 'Single Shot · 30ml',
    img: '/catalog-espresso.png',
  },
  {
    id: 3,
    title: 'Pour Over Set',
    subtitle: 'Drip Coffee',
    origin: 'Gayo Highland, Sumatra',
    altitude: '1,500 M',
    process: 'Wet Hulled',
    notes: 'Clean Clarity · Bright Acidity · Floral Finish',
    price: 'IDR 65.000',
    weight: 'Manual Brew · V60',
    img: '/catalog-drip.png',
  },
  {
    id: 4,
    title: 'Black Velvet',
    subtitle: 'Cold Brew',
    origin: 'Toraja, Sulawesi',
    altitude: '1,400 M',
    process: 'Natural',
    notes: 'Smooth Caramel · Brown Sugar · Nutty Finish',
    price: 'IDR 58.000',
    weight: '355ml · Bottled',
    img: '/catalog-coldbrew.png',
  },
];

const CatalogGSAP = () => {
  const containerRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);
  const imageRefs = useRef([]);
  const textRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // ── Pin the entire split container while content scrolls ──
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: () => `+=${rightColRef.current.scrollHeight - window.innerHeight}`,
        pin: leftColRef.current,
        pinSpacing: false,
        anticipatePin: 1,
      });

      // ── Per-product image transitions ──
      // Each text block triggers its corresponding image
      textRefs.current.forEach((textEl, i) => {
        if (!textEl || !imageRefs.current[i]) return;

        // Fade + slide in the image when its text block enters the viewport
        gsap.fromTo(
          imageRefs.current[i],
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: textEl,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        // If there's a previous image, fade it out when this block enters
        if (i > 0 && imageRefs.current[i - 1]) {
          gsap.to(imageRefs.current[i - 1], {
            opacity: 0,
            y: -30,
            duration: 0.4,
            ease: 'power2.in',
            scrollTrigger: {
              trigger: textEl,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          });
        }
      });

      // ── Stagger-in for each text block's inner children ──
      textRefs.current.forEach((textEl) => {
        if (!textEl) return;
        const children = textEl.querySelectorAll('[data-anim]');
        gsap.fromTo(
          children,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: textEl,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      });
    }, containerRef);

    // ── Cleanup on unmount (prevents memory leaks) ──
    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} id="catalog">
      {/* Section header */}
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>The Collection</p>
        <h2 className={styles.sectionTitle}>Our Catalog</h2>
        <div className={styles.headerRule} />
      </div>

      {/* 50:50 Split */}
      <div ref={containerRef} className={styles.splitContainer}>

        {/* ── LEFT: Sticky image stack ── */}
        <div ref={leftColRef} className={styles.leftCol}>
          <div className={styles.imageStack}>
            {products.map((p, i) => (
              <div
                key={p.id}
                ref={(el) => (imageRefs.current[i] = el)}
                className={styles.imageWrap}
                style={{ opacity: i === 0 ? 1 : 0 }} // First image visible by default
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className={styles.productImage}
                />
              </div>
            ))}
          </div>
          {/* Corner index on the image side */}
          <span className={styles.imageIndex} aria-hidden="true">
            BIMA COFFEE ·<br />CATALOG 2026
          </span>
        </div>

        {/* ── RIGHT: Scrolling text blocks ── */}
        <div ref={rightColRef} className={styles.rightCol}>
          {products.map((p, i) => (
            <div
              key={p.id}
              ref={(el) => (textRefs.current[i] = el)}
              className={styles.textBlock}
            >
              <span data-anim className={styles.productNumber}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p data-anim className={styles.productSubtitle}>
                {p.subtitle}
              </p>
              <h3 data-anim className={styles.productTitle}>
                {p.title}
              </h3>
              <div data-anim className={styles.rule} />
              <div data-anim className={styles.metaGrid}>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Origin</span>
                  <span className={styles.metaVal}>{p.origin}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Altitude</span>
                  <span className={styles.metaVal}>{p.altitude}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Process</span>
                  <span className={styles.metaVal}>{p.process}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Spec</span>
                  <span className={styles.metaVal}>{p.weight}</span>
                </div>
              </div>
              <p data-anim className={styles.notes}>
                {p.notes}
              </p>
              <div data-anim className={styles.priceRow}>
                <span className={styles.price}>{p.price}</span>
                <button className={styles.addBtn}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CatalogGSAP;
