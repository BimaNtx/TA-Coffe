import React from 'react';

// 📌 [COMPONENT] SessionExpiredModal: Pop-up peringatan bahwa sesi Admin telah habis (Auto-Logout).
// 🔄 Menerima fungsi onLoginBack dari App.jsx untuk menutup modal dan mengembalikan user ke halaman Auth.
const SessionExpiredModal = ({ onLoginBack }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.92)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
    animation: 'fadeIn 0.2s ease',
  }}>
    <div style={{
      background: '#000000',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '0',
      padding: '2.5rem',
      width: '100%',
      maxWidth: '380px',
    }}>

      {/* 🖼️ [UI] Label status (badge) bertema brutalist */}
      <span style={{
        display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700,
        letterSpacing: '0.2em', textTransform: 'uppercase', color: '#000000',
        background: 'rgba(255,255,255,0.85)', padding: '0.2rem 0.5rem', marginBottom: '1.25rem',
      }}>
        SESSION TERMINATED
      </span>

      {/* 🖼️ [UI] Judul Modal */}
      <h2 style={{
        fontFamily: 'Inter, sans-serif', fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.1,
      }}>
        Sesi Berakhir
      </h2>

      {/* 📝 [UI] Pesan penjelasan penyebab sesi berakhir */}
      <p style={{
        fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)',
        lineHeight: 1.65, margin: '0 0 2rem 0',
      }}>
        Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas.
        Silakan masuk kembali untuk melanjutkan.
      </p>

      {/* 🎨 [STYLES] Garis pembatas tipis (Divider) */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

      {/* 🧭 [ROUTING] Tombol aksi utama untuk memicu fungsi kembali ke halaman Login */}
      <button
        onClick={onLoginBack}
        style={{
          width: '100%', background: '#ffffff', color: '#000000', border: 'none', borderRadius: '0',
          padding: '0.85rem 1rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.88)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
      >
        Login Kembali
      </button>
    </div>
  </div>
);

export default SessionExpiredModal;