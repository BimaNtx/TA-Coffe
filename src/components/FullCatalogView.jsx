import React from 'react';
import ProductCatalog from './ProductCatalog';
import OrderForm      from './OrderForm';

/**
 * FullCatalogView — menampilkan SEMUA produk dengan header + tombol kembali.
 *
 * Props dari App:
 *   @prop {Array}    products        — semua produk (tidak di-slice)
 *   @prop {function} onSelectProduct — callback saat produk dipilih (smartAddProduct)
 *   @prop {function} onBack          — callback navigasi kembali ke landing
 *   @prop {Array}    orderItems
 *   @prop {function} setOrderItems
 *   @prop {object}   globalSettings  — pengaturan pajak dari Supabase
 */
const FullCatalogView = ({ products, onSelectProduct, onBack, orderItems, setOrderItems, globalSettings }) => (
  <div
    style={{
      minHeight: '100vh',
      backgroundColor: '#18181B',
      paddingTop: '5rem',
    }}
  >
    {/* ── Tombol Kembali ── */}
    <div style={{ padding: '0 2rem 0', maxWidth: '1200px', margin: '0 auto' }}>
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: 'none', border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '6px', padding: '0.5rem 1.1rem',
          fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
          letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)',
          cursor: 'pointer', transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#F3F4F6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
      >
        ← Kembali ke Beranda
      </button>
    </div>

    {/* ── Heading ── */}
    <div style={{ textAlign: 'center', padding: '2rem 2rem 0' }}>
      <span style={{
        display: 'block', fontFamily: 'Inter, sans-serif',
        fontSize: '0.9rem', letterSpacing: '0.2em',
        color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase',
        marginBottom: '0.75rem',
      }}>
        Full Collection
      </span>
      <h1 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700,
        color: '#F3F4F6', margin: '0 0 0.5rem',
      }}>
        Semua Menu Kami
      </h1>
      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: '0.95rem', fontWeight: 400,
        color: 'rgba(255,255,255,0.75)', margin: 0,
      }}>
        {products.length} produk tersedia
      </p>
    </div>

    {/* ── Grid Produk Penuh — pakai ulang ProductCatalog tanpa tombol "Lihat Semua" ── */}
    <ProductCatalog
      products={products}
      onSelectProduct={onSelectProduct}
      hideViewAll
    />

    {/* ── Form Pemesanan — tersedia langsung di halaman Full Catalog ── */}
    <OrderForm
      products={products}
      globalSettings={globalSettings}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
    />
  </div>
);

export default FullCatalogView;
