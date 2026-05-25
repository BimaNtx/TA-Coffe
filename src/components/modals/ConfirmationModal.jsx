import React from 'react';

// 📌 [COMPONENT] ConfirmationModal: Pop-up peringatan (Safety Lock) sebelum mengeksekusi aksi destruktif (seperti Hapus Data).
// 🔄 Menerima props untuk mengontrol visibilitas (isOpen) dan eksekusi fungsi (onConfirm, onClose) dari komponen induk.
const ConfirmationModal = ({ isOpen, title, message, onConfirm, onClose }) => {

  // ⚙️ [LOGIC] Early Return: Jangan render apapun ke DOM browser jika status isOpen adalah false.
  if (!isOpen) return null;

  return (
    // 🖼️ [UI] Latar belakang gelap (Overlay) dengan posisi absolute menutupi layar.
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
          display: 'inline-block', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: '#000000', background: 'rgba(255,80,80,0.9)', padding: '0.2rem 0.5rem', marginBottom: '1.25rem',
        }}>
          WARNING
        </span>

        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.75rem 0', lineHeight: 1.1 }}>
          {title}
        </h3>

        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: 400, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, margin: '0 0 2rem 0' }}>
          {message}
        </p>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

        {/* ⚙️ [LOGIC] Eksekusi onConfirm (lanjutkan hapus) atau onClose (batalkan). */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'color 0.15s ease, border-color 0.15s ease' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.6)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
          >
            Batal
          </button>

          <button
            onClick={onConfirm}
            style={{ flex: 1, background: 'rgba(200,30,30,0.9)', color: '#ffffff', border: '1px solid rgba(255,80,80,0.4)', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(220,40,40,1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(200,30,30,0.9)'}
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;