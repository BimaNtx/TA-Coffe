// 📌 [COMPONENT] FullCatalogView: Halaman mandiri yang menampilkan seluruh daftar kopi (tanpa limitasi).
// 🎨 Menggunakan CSS Grid khusus (tanpa import ProductCatalog) demi mempertahankan desain brutalism.

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import OrderForm from './OrderForm';

// ⚙️ [LOGIC] Mengubah angka mentah menjadi format Rupiah standar.
const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// 🎨 [STYLES] Kamus objek CSS Inline murni agar tidak perlu membuat file module eksternal.
const S = {
  page: { minHeight: '100vh', backgroundColor: '#000000', paddingTop: '6rem' },
  inner: { maxWidth: '1400px', margin: '0 auto', padding: '0 5%' },
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', padding: '0', fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: 'color 0.2s ease' },
  header: { paddingTop: '3rem', paddingBottom: '3rem', borderBottom: '1px solid rgba(255,255,255,0.12)' },
  eyebrow: { fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '1rem', display: 'block' },
  title: { fontFamily: 'Inter, sans-serif', fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.03em', textTransform: 'uppercase', color: '#FFFFFF', margin: 0 },
  count: { fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: '1.5rem', display: 'block' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 0, borderLeft: '1px solid rgba(255,255,255,0.12)', borderTop: '1px solid rgba(255,255,255,0.12)', margin: '0' },
  cell: { borderRight: '1px solid rgba(255,255,255,0.12)', borderBottom: '1px solid rgba(255,255,255,0.12)', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#000000', transition: 'background-color 0.25s ease', cursor: 'default', position: 'relative' },
  img: { width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', mixBlendMode: 'lighten', filter: 'grayscale(100%) contrast(1.2)', transition: 'filter 0.4s ease', display: 'block' },
  info: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' },
  productName: { fontFamily: 'Inter, sans-serif', fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 700, letterSpacing: '-0.02em', color: '#FFFFFF', margin: 0, lineHeight: 1.1 },
  price: { fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', fontWeight: 500, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' },
  badge: { display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.35)', padding: '0.2rem 0.5rem', width: 'fit-content' },
  orderBtn: { background: 'none', border: 'none', borderBottom: '1px solid transparent', borderRadius: 0, padding: '0', fontFamily: 'Inter, sans-serif', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.2s ease, border-color 0.2s ease', marginTop: '0.25rem', alignSelf: 'flex-start' },
};

// 🧩 [CHILD COMPONENT] Mencetak kotak (sel) individual untuk masing-masing produk kopi di dalam grid tabel.
const ProductCell = ({ product, index, onSelect }) => {
  const tersedia = product.is_available !== false;

  // ⚙️ [LOGIC] Menangkap ID produk yang diklik dan auto-scroll ke form pembayaran.
  const handleOrder = () => {
    if (!tersedia) return;
    onSelect(product.id);
    document.getElementById('section-pesan')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    // 🎨 [ANIMATION] Efek opacity muncul bertahap per sel (Staggered Grid Reveal).
    <motion.div
      style={{ ...S.cell, opacity: tersedia ? 1 : 0.6 }}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: tersedia ? 1 : 0.6, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#000000'; }}
    >
      <img src={product.image_url || '/bag1.png'} alt={`Foto ${product.name}`} style={S.img} loading="lazy" />

      <div style={S.info}>
        {!tersedia && <span style={S.badge}>Habis</span>}
        <h3 style={S.productName}>{product.name}</h3>
        <span style={S.price}>{formatRupiah(product.price)}</span>

        <button
          style={{ ...S.orderBtn, opacity: tersedia ? 1 : 0.3, cursor: tersedia ? 'pointer' : 'not-allowed' }}
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

// 🧩 [MAIN COMPONENT] Komposisi utama halaman (Header, Grid Produk, dan Form Pesan).
const FullCatalogView = ({ products, onSelectProduct, onBack, orderItems, setOrderItems, globalSettings }) => {

  // ⚙️ [LOGIC] Menggunakan jeda 50ms (setTimeout) untuk memaksa scroll browser kembali ke paling atas (Y=0) setiap kali view ini dibuka.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={S.page}>
      <div style={S.inner}>

        {/* 🧭 [ROUTING] Tombol kembali memanggil fungsi `onBack` yang berasal dari App.jsx untuk mengubah currentView. */}
        <button
          onClick={onBack}
          style={S.backBtn}
          onMouseEnter={e => { e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
          aria-label="Kembali ke beranda"
        >
          ← Return to Roastery
        </button>

        <header style={S.header}>
          <span style={S.eyebrow}>Single Origin Collection</span>
          <h1 style={S.title}>The<br />Collection</h1>
          <span style={S.count}>{products.length} Lots Available · Lumajang, East Java</span>
        </header>

      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>
        {/* 🔄 [RENDER] Looping data Array Supabase untuk mengisi cell tabel grid. */}
        <div style={S.grid}>
          {products.map((product, index) => (
            <ProductCell key={product.id} product={product} index={index} onSelect={onSelectProduct} />
          ))}
        </div>
      </div>

      {/* 🧩 [CHILD COMPONENT] Memasukkan meja kasir (OrderForm) di bagian paling bawah halaman. */}
      <OrderForm
        products={products}
        globalSettings={globalSettings}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
      />
    </div>
  );
};

export default FullCatalogView;