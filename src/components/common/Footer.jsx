/**
 * Footer.jsx — Edge-to-Edge Brutalist Anchor
 *
 * Struktur:
 *   1. topRow    — Info kiri, Links besar di kanan
 *   2. copyright — strip tipis dengan admin console tersembunyi
 *   3. stamp     — "BIMA COFFEE" 16vw, terpotong di dasar layar
 */

import styles from './Footer.module.css';

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

/**
 * @prop {function} navigateTo — fungsi dari App.jsx untuk ke halaman auth/admin
 */
const Footer = ({ navigateTo }) => (
  <footer id="contact" className={styles.footer}>

    {/* ── Top Row ──────────────────────────────────────────── */}
    <div className={styles.topRow}>

      {/* Kiri: Brand & Info */}
      <div className={styles.infoCol}>
        <p className={styles.brandName}>Bima Coffee</p>
        <p className={styles.infoText}>
          Single-origin specialty coffee<br />
          roasted in Lumajang, East Java.<br />
          8.1333° S, 113.2167° E
        </p>
      </div>

      {/* Kanan: Link Groups */}
      <div className={styles.linksRow}>

        <div className={styles.linkGroup}>
          <p className={styles.groupHeading}>Menu</p>
          <a href="#catalog"        className={styles.link}>Our Beans</a>
          <a href="#section-pesan"  className={styles.link}>Order</a>
          <a href="#story"          className={styles.link}>Story</a>
        </div>

        <div className={styles.linkGroup}>
          <p className={styles.groupHeading}>Connect</p>
          <a
            href="https://instagram.com"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram ↗
          </a>
          <a
            href="https://wa.me/6281234567890"
            className={styles.link}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp ↗
          </a>
          <button
            onClick={scrollToTop}
            className={styles.link}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}
          >
            Back to Top ↑
          </button>
        </div>

      </div>
    </div>

    {/* ── Copyright Strip ───────────────────────────────────── */}
    {/*
      Admin Console disembunyikan di sini agar tidak mencolok.
      navigateTo('auth') akan membawa ke halaman login admin.
    */}
    <div className={styles.copyright}>
      <span>© 2026 Bima Coffee</span>
      <button
        onClick={() => navigateTo('auth')}
        className={styles.adminBtn}
        title="Admin Area"
      >
        Admin Console
      </button>
      <span>Lumajang, East Java</span>
    </div>

    {/* ── Giant Stamp ───────────────────────────────────────── */}
    {/*
      font-size: 16vw — otomatis selebar layar tanpa media query.
      margin-bottom negatif memotong bagian bawah huruf,
      efek stamp editorial yang agresif dan membekas.
    */}
    <p className={styles.stamp} aria-hidden="true">
      Bima Coffee
    </p>

  </footer>
);

export default Footer;
