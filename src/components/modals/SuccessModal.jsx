import React from 'react';

// ─────────────────────────────────────────────────────────────
// MODAL: NOTIFIKASI SUKSES — Brutalist System Alert
// Props: isOpen, title, message, onClose
// ─────────────────────────────────────────────────────────────
const SuccessModal = ({ isOpen, title, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.15s ease',
    }}>
      <div style={{
        background: '#000000',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '380px',
      }}>

        {/* ── Status tag — brutalist badge ── */}
        <span style={{
          display: 'inline-block',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: '#000000',
          background: '#ffffff',
          padding: '0.2rem 0.5rem',
          marginBottom: '1.25rem',
        }}>
          STATUS: OK
        </span>

        {/* ── Title — Inter 800 uppercase ── */}
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.4rem',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#ffffff',
          margin: '0 0 0.75rem 0',
          lineHeight: 1.1,
        }}>
          {title}
        </h3>

        {/* ── Message ── */}
        <p style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.8rem',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.65,
          margin: '0 0 2rem 0',
        }}>
          {message}
        </p>

        {/* Thin divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

        {/* ── OK Button — sharp, white, uppercase ── */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            background: '#ffffff',
            color: '#000000',
            border: 'none',
            borderRadius: '0',
            padding: '0.85rem',
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
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
