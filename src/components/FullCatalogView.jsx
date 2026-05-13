/**
 * FullCatalogView.jsx — Architectural Inventory Grid
 *
 * Halaman mandiri (TIDAK mengimpor ProductCatalog) agar:
 *   1. Judul tidak dobel
 *   2. Tata letak bisa dikontrol penuh (CSS Grid tanpa gap)
 *   3. Desain selaras dengan tema High-Contrast Brutalism
 *
 * Props dari App.jsx:
 *   @prop {Array}    products        — semua produk dari Supabase
 *   @prop {function} onSelectProduct — callback saat produk dipilih
 *   @prop {function} onBack          — kembali ke landing page
 *   @prop {Array}    orderItems
 *   @prop {function} setOrderItems
 *   @prop {object}   globalSettings  — pengaturan pajak
 */

import { motion } from 'framer-motion';
import OrderForm  from './OrderForm';

// Helper: format harga ke Rupiah — 85000 → "Rp 85.000"
const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// ─────────────────────────────────────────────────────────────
// STYLES — inline murni agar tidak perlu file CSS baru
// ─────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#000000',
    paddingTop: '6rem',
  },
  inner: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 5%',
  },

  // Navigasi kembali — text link tanpa border
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    padding: '0',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },

  // Header
  header: {
    paddingTop: '3rem',
    paddingBottom: '3rem',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
  },
  eyebrow: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.22em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '1rem',
    display: 'block',
  },
  title: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'clamp(3rem, 8vw, 6rem)',
    fontWeight: 900,
    lineHeight: 0.9,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    margin: 0,
  },
  count: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.72rem',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.3)',
    marginTop: '1.5rem',
    display: 'block',
  },

  // Grid — tanpa gap, border pada sel membentuk tabel arsitektur
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 0,
    borderLeft: '1px solid rgba(255,255,255,0.12)',
    borderTop: '1px solid rgba(255,255,255,0.12)',
    margin: '0',        // flush ke edge inner container
  },

  // Sel produk — border kanan & bawah membentuk grid garis
  cell: {
    borderRight: '1px solid rgba(255,255,255,0.12)',
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    backgroundColor: '#000000',
    transition: 'background-color 0.25s ease',
    cursor: 'default',
    position: 'relative',
  },

  // Gambar produk — blending agar kotak abu-abu hilang
  img: {
    width: '100%',
    aspectRatio: '1 / 1',
    objectFit: 'contain',
    mixBlendMode: 'lighten',
    filter: 'grayscale(100%) contrast(1.2)',
    transition: 'filter 0.4s ease',
    display: 'block',
  },

  // Info produk di bawah gambar
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
    marginTop: 'auto',
    paddingTop: '1.25rem',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  productName: {
    fontFamily: 'Inter, sans-serif',
    fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
    margin: 0,
    lineHeight: 1.1,
  },
  price: {
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.04em',
  },

  // Badge "HABIS"
  badge: {
    display: 'inline-block',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.62rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#FFFFFF',
    border: '1px solid rgba(255,255,255,0.35)',
    padding: '0.2rem 0.5rem',
    width: 'fit-content',
  },

  // Tombol ADD TO ORDER — text link minimalis
  orderBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '1px solid transparent',
    borderRadius: 0,
    padding: '0',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.55)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    transition: 'color 0.2s ease, border-color 0.2s ease',
    marginTop: '0.25rem',
    alignSelf: 'flex-start',
  },
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN SEL PRODUK
// ─────────────────────────────────────────────────────────────
const ProductCell = ({ product, index, onSelect }) => {
  const tersedia = product.is_available !== false;

  const handleOrder = () => {
    if (!tersedia) return;
    onSelect(product.id);
    document.getElementById('section-pesan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.div
      style={{
        ...S.cell,
        opacity: tersedia ? 1 : 0.6,
      }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: tersedia ? 1 : 0.6, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000000'; }}
    >
      {/* Gambar */}
      <img
        src={product.image_url || '/bag1.png'}
        alt={`Foto ${product.name}`}
        style={S.img}
        loading="lazy"
      />

      {/* Info */}
      <div style={S.info}>
        {!tersedia && <span style={S.badge}>Habis</span>}
        <h3 style={S.productName}>{product.name}</h3>
        <span style={S.price}>{formatRupiah(product.price)}</span>

        <button
          style={{
            ...S.orderBtn,
            opacity: tersedia ? 1 : 0.3,
            cursor: tersedia ? 'pointer' : 'not-allowed',
          }}
          onClick={handleOrder}
          disabled={!tersedia}
          aria-label={tersedia ? `Pesan ${product.name}` : `${product.name} habis`}
          onMouseEnter={e => {
            if (!tersedia) return;
            e.currentTarget.style.color = '#FFFFFF';
            e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.4)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            e.currentTarget.style.borderBottomColor = 'transparent';
          }}
        >
          {tersedia ? '+ Add to Order' : 'Unavailable'}
        </button>
      </div>
    </motion.div>
  );
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
const FullCatalogView = ({ products, onSelectProduct, onBack, orderItems, setOrderItems, globalSettings }) => (
  <div style={S.page}>
    <div style={S.inner}>

      {/* ── Navigasi Kembali — text link ─────────────────── */}
      <button
        onClick={onBack}
        style={S.backBtn}
        onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
        aria-label="Kembali ke beranda"
      >
        ← Return to Roastery
      </button>

      {/* ── Header Raksasa ───────────────────────────────── */}
      <header style={S.header}>
        <span style={S.eyebrow}>Single Origin Collection</span>
        <h1 style={S.title}>
          The<br />Collection
        </h1>
        <span style={S.count}>{products.length} Lots Available · Lumajang, East Java</span>
      </header>

    </div>

    {/* ── Architectural Inventory Grid ─────────────────── */}
    {/*
      Grid tanpa gap — border kanan & bawah tiap sel membentuk
      tabel arsitektur ala editorial design. flush ke pinggir.
    */}
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
      <div style={S.grid}>
        {products.map((product, index) => (
          <ProductCell
            key={product.id}
            product={product}
            index={index}
            onSelect={onSelectProduct}
          />
        ))}
      </div>
    </div>

    {/* ── Form Pemesanan ───────────────────────────────── */}
    <OrderForm
      products={products}
      globalSettings={globalSettings}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
    />
  </div>
);

export default FullCatalogView;
