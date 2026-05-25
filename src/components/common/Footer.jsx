// 📌 [COMPONENT] Footer: Area paling bawah halaman (Edge-to-Edge Brutalist Anchor).
// 🖼️ Berisi informasi brand, tautan navigasi, dan "pintu rahasia" menuju sistem Admin.

import styles from './Footer.module.css';

// ⚙️ [LOGIC] Helper untuk menggulir layar kembali ke posisi paling atas secara mulus.
const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// 🔄 [PROPS] Menerima fungsi navigateTo dari App.jsx untuk mengubah currentView (routing).
const Footer = ({ navigateTo }) => (
  <footer id="contact" className={styles.footer}>

    {/* 🖼️ [UI] Baris Atas: Informasi lokasi dan kumpulan tautan */}
    <div className={styles.topRow}>

      <div className={styles.infoCol}>
        <p className={styles.brandName}>Bima Coffee</p>
        <p className={styles.infoText}>
          Single-origin specialty coffee<br />
          roasted in Lumajang, East Java.<br />
          8.1333° S, 113.2167° E
        </p>
      </div>

      <div className={styles.linksRow}>
        <div className={styles.linkGroup}>
          <p className={styles.groupHeading}>Menu</p>
          <a href="#catalog" className={styles.link}>Our Beans</a>
          <a href="#section-pesan" className={styles.link}>Order</a>
          <a href="#story" className={styles.link}>Story</a>
        </div>

        <div className={styles.linkGroup}>
          <p className={styles.groupHeading}>Connect</p>
          <a href="https://instagram.com" className={styles.link} target="_blank" rel="noopener noreferrer">Instagram ↗</a>
          <a href="https://wa.me/6281234567890" className={styles.link} target="_blank" rel="noopener noreferrer">WhatsApp ↗</a>
          <button onClick={scrollToTop} className={styles.link} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
            Back to Top ↑
          </button>
        </div>
      </div>
    </div>

    {/* 🔒 [SECURITY] Strip Hak Cipta & Pintu Masuk Admin */}
    <div className={styles.copyright}>
      <span>© 2026 Bima Coffee</span>

      {/* 🧭 [ROUTING] Tombol admin sengaja dibuat kecil/tersembunyi agar tidak mencolok bagi pelanggan biasa */}
      <button onClick={() => navigateTo('auth')} className={styles.adminBtn} title="Admin Area">
        Admin Console
      </button>

      <span>Lumajang, East Java</span>
    </div>

    {/* 🎨 [STYLES] Tipografi Raksasa (Giant Stamp) 
        Menggunakan ukuran font '16vw' agar otomatis menyesuaikan lebar layar (responsif tanpa media query).
        Margin bawah dipotong agar memberikan efek stempel brutalist yang agresif.
    */}
    <p className={styles.stamp} aria-hidden="true">
      Bima Coffee
    </p>

  </footer>
);

export default Footer;