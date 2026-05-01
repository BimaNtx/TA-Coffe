import React from 'react';

/**
 * SessionExpiredModal — ditampilkan saat Auto-Logout terpicu.
 * Menggantikan alert() browser agar tetap senada dark theme.
 *
 * @prop {function} onLoginBack — dipanggil saat tombol "Login Kembali" diklik
 */
const SessionExpiredModal = ({ onLoginBack }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.80)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 0.25s ease',
  }}>
    <div style={{
      background: '#0a0808',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '2.5rem 2rem',
      width: '100%', maxWidth: '380px',
      textAlign: 'center',
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Ikon */}
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>

      {/* Judul */}
      <h2 style={{
        fontFamily: 'Cormorant Garamond, Georgia, serif',
        fontSize: '1.6rem', fontWeight: 700,
        color: '#fff', marginBottom: '0.75rem', letterSpacing: '0.02em',
      }}>
        Sesi Berakhir
      </h2>

      {/* Deskripsi */}
      <p style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: '0.82rem', lineHeight: 1.65,
        color: 'rgba(255, 255, 255, 0.45)',
        marginBottom: '2rem',
      }}>
        Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas.
        Silakan masuk kembali untuk melanjutkan.
      </p>

      {/* Tombol CTA */}
      <button
        onClick={onLoginBack}
        style={{
          width: '100%',
          background: '#fff', color: '#000',
          border: 'none', borderRadius: '6px',
          padding: '0.75rem 1rem',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.72rem', letterSpacing: '0.14em',
          fontWeight: 600, cursor: 'pointer',
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        LOGIN KEMBALI
      </button>
    </div>
  </div>
);

export default SessionExpiredModal;
