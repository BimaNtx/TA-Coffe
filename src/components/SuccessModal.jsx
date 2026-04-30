import React from 'react';

// ─────────────────────────────────────────────────────────────
// Shared style constants (diperlukan oleh tombol di dalam modal)
// ─────────────────────────────────────────────────────────────
const btnPrimaryStyle = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────
// MODAL: NOTIFIKASI SUKSES
// Props: isOpen, title, message, onClose
// ─────────────────────────────────────────────────────────────
const SuccessModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: '#0a0808', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px', padding: '2rem', width: '100%', maxWidth: '360px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)', textAlign: 'center',
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>✅</div>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          {message}
        </p>
        <button onClick={onClose} style={{ ...btnPrimaryStyle, flex: 'none', width: '100%' }}>OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;
