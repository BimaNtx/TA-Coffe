import { useRef, useLayoutEffect, useState } from 'react';
import { useScroll, useTransform, useSpring, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import IntroSection from './components/IntroSection';
import BeanSection from './components/BeanSection';
import ProductShowcase from './components/ProductShowcase';
import Shop from './components/Shop';
import './App.css';

const NAVBAR_HEIGHT = 80; // must match Navbar CSS
const ANIM_END = 300; // tighter range = faster, more intentional transition
const SPRING = { stiffness: 400, damping: 40, mass: 1, restDelta: 0.001 };

function App() {
  const logoRef = useRef(null);
  const { scrollY } = useScroll();

  // ── Measure logo height after first paint ────────────────────────
  // We need pixel values so useSpring can interpolate properly.
  // Default to -200 (reasonable for a ~200px tall logo at scale:1)
  // so there is no position "flash" before measurement.
  const [yStart, setYStart] = useState(-200);
  const [yEnd, setYEnd] = useState(-200);

  useLayoutEffect(() => {
    if (!logoRef.current) return;

    const recalc = () => {
      const vh = window.innerHeight;
      const logoH = logoRef.current.offsetHeight;

      // Center of screen:  anchor(top:0) + 50vh - logoH/2
      setYStart(vh / 2 - logoH / 2);

      // Center of navbar:  anchor(top:0) + navbarCenter - logoH/2
      setYEnd(NAVBAR_HEIGHT / 2 - logoH / 2);
    };

    recalc();
    window.addEventListener('resize', recalc);
    return () => window.removeEventListener('resize', recalc);
  }, []);

  // ── Scroll → raw transform values (pure numbers) ─────────────────
  const rawY     = useTransform(scrollY, [0, ANIM_END], [yStart, yEnd]);
  const rawScale = useTransform(scrollY, [0, ANIM_END], [1, 0.27]);

  // ── Spring layer gives buttery, weighty feel ──────────────────────
  const y     = useSpring(rawY,     SPRING);
  const scale = useSpring(rawScale, SPRING);

  return (
    <div className="app-container">
      <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

      {/*
        TWO-ELEMENT CENTERING PATTERN
        ┌─ logo-anchor  (CSS only)  position:fixed, left:50%, translateX(-50%)
        │   Framer Motion never touches this div → horizontal centering is permanent
        └─── logo-motion (FM only)  animates y + scale as pure pixel numbers
      */}
      <div className="logo-anchor">
        <motion.div
          ref={logoRef}
          className="logo-motion"
          style={{ y, scale }}
        >
          <span className="logo-line">BIMA</span>
          <span className="logo-line">COFFEE</span>
        </motion.div>
      </div>

      <Hero />
      <IntroSection />
      <BeanSection />
      <ProductShowcase />
      <Shop />
    </div>
  );
}

export default App;
