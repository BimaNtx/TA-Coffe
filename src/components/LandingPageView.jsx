import React from 'react';
import { motion } from 'framer-motion';

import Navbar         from './Navbar';
import Hero           from './Hero';
import IntroSection   from './IntroSection';
import BeanSection    from './BeanSection';
import ProductCatalog from './ProductCatalog';
import OrderForm      from './OrderForm';
import Footer         from './Footer';

// Konstanta animasi logo — harus selaras dengan nilai di App.jsx
const NAVBAR_HEIGHT = 80;
const ANIM_END      = 300;

/**
 * LandingPageView — tampilan halaman utama Bima Coffee.
 *
 * Props dari App:
 *   @prop {function} navigateTo
 *   @prop {Array}    products        — max 3 produk teratas (di-slice di App)
 *   @prop {object}   globalSettings  — pengaturan pajak dari Supabase
 *   @prop {Array}    orderItems
 *   @prop {function} setOrderItems
 *   @prop {function} smartAddProduct
 *   @prop {object}   logoRef         — ref ke elemen logo untuk animasi
 *   @prop {object}   y, scale        — spring values dari framer-motion
 *   @prop {object}   scrollY         — scroll tracker dari framer-motion
 *   @prop {function} onViewAll       — callback navigasi ke full_catalog
 */
const LandingPageView = ({
  navigateTo, products, globalSettings, orderItems, setOrderItems,
  smartAddProduct, logoRef, y, scale, scrollY, onViewAll,
}) => (
  <div
    className="app-container"
    style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}
  >
    <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

<div className="logo-anchor" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <motion.div
        ref={logoRef}
        className="logo-motion"
        style={{
          y, scale,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: '900',
          lineHeight: '0.85',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          margin: 0
        }}>
          BIMA
        </span>
        <span style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 'clamp(5rem, 15vw, 12rem)',
          fontWeight: '900',
          lineHeight: '0.85',
          letterSpacing: '-0.02em',
          color: '#FFFFFF',
          margin: 0
        }}>
          COFFEE
        </span>
      </motion.div>
    </div>

    <Hero />
    <IntroSection />
    <BeanSection />

    {/* Hanya 3 produk teratas di landing — tombol "Lihat Semua" menuju Full Catalog */}
    <ProductCatalog products={products} onSelectProduct={smartAddProduct} onViewAll={onViewAll} />
    {/* globalSettings diteruskan agar kalkulasi pajak menggunakan nilai dari database */}
    <OrderForm
      products={products}
      globalSettings={globalSettings}
      orderItems={orderItems}
      setOrderItems={setOrderItems}
    />

    <Footer navigateTo={navigateTo} />
  </div>
);

export default LandingPageView;
