/**
 * Footer.jsx
 *
 * Komponen penutup landing page BIMA COFFEE.
 *
 * Struktur:
 *   1. Top Row  — 3 kolom: identitas, navigasi, sosial media
 *   2. Divider  — garis tipis
 *   3. Copyright — metadata kecil
 *   4. Big Brand — teks "BIMA COFFEE" besar di bawah
 */

import styles from './Footer.module.css';

// ─────────────────────────────────────────────────────────────
// DATA NAVIGASI & SOSIAL
// Dipisah sebagai konstanta agar mudah diubah
// ─────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Shop',    href: '#shop'    },
  { label: 'Story',   href: '#story'   },
  { label: 'Contact', href: '#order'   },
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'WhatsApp',  href: 'https://wa.me/6281234567890' },
];

// ─────────────────────────────────────────────────────────────
// HELPER: scroll ke atas halaman
// window.scrollTo dengan behavior: 'smooth' membuat
// animasi scroll halus tanpa library tambahan
// ─────────────────────────────────────────────────────────────
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className={styles.footer}>

    {/* ── Top Row: 3-column grid ──────────────────────────── */}
    <div className={styles.topRow}>

      {/* Kolom 1: Identitas brand */}
      <div className={styles.identityCol}>
        <p className={styles.brandSmall}>BIMA COFFEE</p>
        <p className={styles.tagline}>
          Crafted with passion in<br />Lumajang, East Java.
        </p>
        <p className={styles.coords}>8.1333° S, 113.2167° E</p>
      </div>

      {/* Kolom 2: Navigasi halaman */}
      <nav className={styles.navCol} aria-label="Footer navigation">
        <p className={styles.colHeading}>Navigate</p>
        <ul className={styles.linkList}>
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Kolom 3: Sosial media + tombol back to top */}
      <div className={styles.socialCol}>
        <p className={styles.colHeading}>Connect</p>
        <ul className={styles.linkList}>
          {SOCIAL_LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                className={styles.link}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} ↗
              </a>
            </li>
          ))}
        </ul>

        {/* Tombol kembali ke atas */}
        <button
          onClick={scrollToTop}
          className={styles.backToTop}
          aria-label="Kembali ke atas"
        >
          ↑ Back to Top
        </button>
      </div>

    </div>

    {/* ── Divider ─────────────────────────────────────────── */}
    <hr className={styles.divider} />

    {/* ── Copyright bar ───────────────────────────────────── */}
    <div className={styles.copyright}>
      <span>© 2026 Bima Ananta</span>
      <span>Built with React</span>
    </div>

    {/* ── Architectural Brand Name (bottom) ───────────────── */}
    {/*
      Dibuat sangat besar (12vw+) dan tipis agar terasa
      seperti brand fashion high-end. Teks ini sengaja
      sedikit terpotong di bawah (overflow hidden pada .footer).
    */}
    <div className={styles.bigBrandWrap} aria-hidden="true">
      <p className={styles.bigBrand}>Bima Coffee</p>
    </div>

  </footer>
);

export default Footer;
