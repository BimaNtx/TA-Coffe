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
  { label: 'Shop',    href: '#order'   }, // Memanggil Form Pemesanan
  { label: 'Story',   href: '#story'   }, // Menuju bagian Intro
  { label: 'Contact', href: '#contact' }, // Menuju Footer ini sendiri
];

const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com' },
  {
    label: 'WhatsApp',
    // Menggunakan API resmi wa.me agar otomatis membuka aplikasi WhatsApp
    // Format: wa.me/kodenegaranomor (62 untuk Indonesia, tanpa angka 0 di awal)
    href: 'https://wa.me/6281234567890'
  },
];

// ─────────────────────────────────────────────────────────────
// HELPER: scroll ke atas halaman
//
// Cara kerja window.scrollTo:
//   top: 0             -> menggulir dokumen kembali ke titik 0px (paling atas)
//   behavior: 'smooth' -> menciptakan efek guliran animasi yang mulus
// Fungsi bawaan browser ini sangat praktis, tidak butuh library eksternal.
// ─────────────────────────────────────────────────────────────
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
/**
 * @prop {function} navigateTo — fungsi berpindah halaman dari App.jsx
 *   Digunakan untuk link tersembunyi "Admin Console" di bagian bawah.
 */
const Footer = ({ navigateTo }) => (
  <footer id="contact" className={styles.footer}>

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
                rel="noopener noreferrer"
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
      {/*
        Link tersembunyi ke Admin Console.
        Terlihat seperti teks copyright biasa agar tidak mencolok.
        Menggunakan navigateTo('auth') dari App.jsx untuk berpindah
        ke halaman login sebelum masuk ke dashboard admin.
      */}
      <button
        onClick={() => navigateTo('auth')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          color: 'rgba(255,255,255,0.12)',
          letterSpacing: '0.08em',
          padding: 0,
          transition: 'color 0.3s',
        }}
        onMouseEnter={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
        onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.12)'}
        title="Admin Area"
      >
        Admin Console
      </button>
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
