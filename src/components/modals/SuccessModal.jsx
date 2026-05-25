import React from 'react';

// 📌 [COMPONENT] SuccessModal: Pop-up notifikasi generik untuk menampilkan pesan sukses atau info sistem.
// 🔄 Menerima props state (isOpen, title, message) dan fungsi (onClose) dari komponen induk yang memanggilnya.
const SuccessModal = ({ isOpen, title, message, onClose }) => {

  // ⚙️ [LOGIC] Early Return: Mencegah React memproses dan merender elemen DOM jika modal sedang tidak aktif.
  if (!isOpen) return null;

  return (
    // 🖼️ [UI] Latar belakang gelap (Overlay) dengan z-index tinggi (2000) agar menutupi seluruh antarmuka.
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.15s ease',
    }}>
      {/* 🖼️ [UI] Kotak Modal Utama bergaya High-Contrast Brutalism */}
      <div style={{
        background: '#000000',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '380px',
      }}>

        <span style={{
          display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: '#000000', background: '#ffffff',
          padding: '0.2rem 0.5rem', marginBottom: '1.25rem',
        }}>
          STATUS: OK
        </span>

        {/* 📝 [UI] Judul dan isi pesan bersifat dinamis (mengikuti teks yang dikirim oleh komponen induk) */}
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.1 }}>
          {title}
        </h3>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 2rem 0' }}>
          {message}
        </p>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

        {/* ⚙️ [LOGIC] Tombol untuk memicu fungsi penutup modal (mengubah state isOpen menjadi false di komponen induk) */}
        <button
          onClick={onClose}
          style={{
            width: '100%', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '0', padding: '0.85rem',
            fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em',
            textTransform: 'uppercase', cursor: 'pointer', transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.88)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;