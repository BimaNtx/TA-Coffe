import React from 'react';

// ─────────────────────────────────────────────────────────────
// Shared style constants (diperlukan oleh tombol di dalam modal)
// ─────────────────────────────────────────────────────────────
const btnPrimaryStyle   = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };
const btnSecondaryStyle = { flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '4px', padding: '0.65rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', letterSpacing: '0.12em', cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────
// MODAL: KONFIRMASI HAPUS
// Props: isOpen, title, message, onConfirm, onClose
// ─────────────────────────────────────────────────────────────
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose }) => {
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
        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⚠️</div>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.4rem', color: '#fff', marginBottom: '0.6rem' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: '1.75rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onClose} style={btnSecondaryStyle}>Batal</button>
          <button
            onClick={onConfirm}
            style={{ ...btnPrimaryStyle, background: '#c0392b', color: '#fff', border: 'none' }}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
