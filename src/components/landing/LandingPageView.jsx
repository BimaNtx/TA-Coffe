import React from 'react';

import Navbar         from '../common/Navbar';
import Hero           from './Hero';
import IntroSection   from './IntroSection';
import BeanSection    from './BeanSection';
import ProductCatalog from './ProductCatalog';
import OrderForm      from './OrderForm';
import Footer         from '../common/Footer';

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
 *   @prop {object}   scrollY         — scroll tracker dari framer-motion
 *   @prop {function} onViewAll       — callback navigasi ke full_catalog
 */
const LandingPageView = ({
  navigateTo, products, globalSettings, orderItems, setOrderItems,
  smartAddProduct, scrollY, onViewAll,
}) => (
  <div
    className="app-container"
    style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#000000' }}
  >
    <Navbar scrollY={scrollY} navbarHeight={NAVBAR_HEIGHT} animEnd={ANIM_END} />

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
