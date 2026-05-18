import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './AdminDashboard.module.css';
import ConfirmationModal from '../modals/ConfirmationModal';
import SuccessModal from '../modals/SuccessModal';

// ─────────────────────────────────────────────────────────────
// HELPER: Format mata uang Rupiah
// ─────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(amount ?? 0);

// ─────────────────────────────────────────────────────────────
// SHARED STYLES (lokal — dipakai oleh form & settings)
// ─────────────────────────────────────────────────────────────
const labelStyle        = { display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' };
const inputStyle        = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0', padding: '0.7rem 0.9rem', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s ease' };
const btnPrimaryStyle   = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' };
const btnSecondaryStyle = { flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' };

// ─────────────────────────────────────────────────────────────
// MODAL FORM: Tambah / Edit Produk
// Props: initial, onSave, onClose
// ─────────────────────────────────────────────────────────────
const ProductFormModal = ({ initial, onSave, onClose }) => {
  const [name,     setName]     = useState(initial?.name  ?? '');
  const [price,    setPrice]    = useState(initial?.price ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi 1: Nama minimal 3 karakter (bukan hanya spasi)
    if (name.trim().length < 3) {
      setError('Nama produk minimal 3 karakter.');
      return;
    }

    // Validasi 2: Harga harus angka positif
    if (!price || Number(price) <= 0) {
      setError('Harga harus lebih dari Rp 0.');
      return;
    }

    setIsSaving(true);
    await onSave({ name: name.trim(), price: Number(price) });
    setIsSaving(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#000000',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '0',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '400px',
      }}>
        {/* ── Eyebrow / kategori ── */}
        <span style={{
          display: 'block',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.6rem',
          fontWeight: 700,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)',
          marginBottom: '0.75rem',
        }}>Admin Console · Menu</span>

        {/* ── Judul modal — Inter 800 uppercase ── */}
        <h3 style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: '1.6rem',
          fontWeight: 800,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: '#ffffff',
          margin: '0 0 0.5rem 0',
          lineHeight: 1,
        }}>
          {initial ? 'Edit Produk' : 'Tambah Produk'}
        </h3>

        {/* Thin divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.25rem 0 1.75rem' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nama Produk</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputStyle}
              placeholder="Contoh: Semeru Espresso"
              onFocus={e  => e.target.style.borderColor = '#ffffff'}
              onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Harga (Rp)</label>
            <input
              type="number"
              step="1000"
              value={price}
              onChange={e => setPrice(e.target.value)}
              style={inputStyle}
              placeholder="Contoh: 85000"
              onFocus={e  => e.target.style.borderColor = '#ffffff'}
              onBlur={e   => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
            />
          </div>

          {error && (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '0.7rem',
              color: 'rgba(255,80,80,0.9)',
              margin: 0,
              paddingLeft: '0.75rem',
              borderLeft: '2px solid rgba(255,80,80,0.6)',
            }}>⚠ {error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{ ...btnPrimaryStyle, opacity: isSaving ? 0.55 : 1 }}
            >
              {isSaving ? 'Menyimpan...' : 'Simpan'}
            </button>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA: PRODUCT MANAGER
//
// Props:
//   products         — array produk dari App.jsx (via AdminDashboard)
//   globalSettings   — { pajak_aktif, pajak_persen } dari App.jsx
//   onProductsChange — callback refetch produk ke App.jsx
//   onSettingsChange — callback refetch pengaturan ke App.jsx
//   activeTab        — 'menu' | 'settings', untuk render panel yang tepat
// ─────────────────────────────────────────────────────────────
const ProductManager = ({ products, globalSettings = {}, onProductsChange, onSettingsChange, activeTab }) => {

  // ── State Modal Form Produk ───────────────────────────────
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct,   setEditingProduct]   = useState(null);

  // ── State Modal Konfirmasi Hapus ──────────────────────────
  /**
   * modalDelete — mengontrol ConfirmationModal untuk hapus produk.
   * { open: bool, id: string, name: string }
   */
  const [modalDelete, setModalDelete] = useState({ open: false, id: null, name: '' });

  // ── State Modal Sukses ────────────────────────────────────
  /**
   * successModal — mengontrol SuccessModal setelah operasi DB berhasil.
   * { open: bool, title: string, message: string }
   */
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });

  /** Helper: tampilkan SuccessModal dengan pesan tertentu */
  const showSuccess = (title, message) => setSuccessModal({ open: true, title, message });

  // ── State Pengaturan Pajak Lokal ──────────────────────────
  /**
   * localSettings — salinan sementara globalSettings untuk form edit.
   * Perubahan di sini belum disimpan ke DB sampai admin klik "Simpan".
   */
  const [localSettings, setLocalSettings] = useState({
    pajak_aktif:  globalSettings.pajak_aktif  ?? false,
    pajak_persen: globalSettings.pajak_persen ?? 11,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sinkronkan localSettings saat globalSettings dari App berubah
  useEffect(() => {
    setLocalSettings({
      pajak_aktif:  globalSettings.pajak_aktif  ?? false,
      pajak_persen: globalSettings.pajak_persen ?? 11,
    });
  }, [globalSettings.pajak_aktif, globalSettings.pajak_persen]);

  // ─────────────────────────────────────────────────────────
  // CRUD PRODUK
  // ─────────────────────────────────────────────────────────

  /**
   * handleSaveProduct — INSERT jika tambah baru, UPDATE jika edit.
   * Setelah berhasil, panggil onProductsChange() agar App.jsx
   * melakukan refetch sehingga ProductCatalog & OrderForm ikut update.
   */
  const handleSaveProduct = async ({ name, price }) => {
    if (editingProduct) {
      const { error } = await supabase
        .from('produk').update({ name, price }).eq('id', editingProduct.id);
      if (error) {
        showSuccess('Gagal Update', 'Terjadi kesalahan: ' + error.message);
        return;
      }
    } else {
      // Generate id dari nama produk: spasi → strip, huruf kecil
      // Contoh: "Semeru Espresso" → "semeru-espresso"
      const generatedId = name.toLowerCase().trim().replace(/\s+/g, '-');
      const { error } = await supabase
        .from('produk').insert({ id: generatedId, name, price, is_available: true });
      if (error) {
        showSuccess('Gagal Tambah', 'Terjadi kesalahan: ' + error.message);
        return;
      }
    }
    setShowProductModal(false);
    setEditingProduct(null);
    onProductsChange();
    showSuccess(
      editingProduct ? 'Produk Diperbarui' : 'Produk Ditambahkan',
      `"${name}" berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'} ke daftar menu.`
    );
  };

  const handleToggleAvailable = async (product) => {
    const newVal = !product.is_available;
    const { error } = await supabase
      .from('produk').update({ is_available: newVal }).eq('id', product.id);
    if (error) {
      showSuccess('Gagal Ubah Stok', 'Terjadi kesalahan: ' + error.message);
      return;
    }
    onProductsChange();
  };

  /**
   * handleDeleteProduct — buka ConfirmationModal dulu.
   * Eksekusi delete ke Supabase HANYA jika user konfirmasi di modal.
   */
  const handleDeleteProduct = (id, name) => {
    setModalDelete({ open: true, id, name });
  };

  const confirmDeleteProduct = async () => {
    const { id, name } = modalDelete;
    setModalDelete({ open: false, id: null, name: '' });
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (error) {
      showSuccess('Gagal Hapus', 'Terjadi kesalahan: ' + error.message);
      return;
    }
    onProductsChange();
    showSuccess('Produk Dihapus', `"${name}" berhasil dihapus dari daftar menu.`);
  };

  // ─────────────────────────────────────────────────────────
  // SIMPAN PENGATURAN PAJAK
  // ─────────────────────────────────────────────────────────
  /**
   * handleSaveSettings — UPDATE baris id=1 di tabel `pengaturan`.
   * Setelah berhasil, panggil onSettingsChange() agar App.jsx
   * melakukan refetch dan menyebarkan nilai baru ke OrderForm.
   */
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await supabase
      .from('pengaturan')
      .update({
        pajak_aktif:  localSettings.pajak_aktif,
        pajak_persen: Number(localSettings.pajak_persen),
      })
      .eq('id', 1);
    setIsSavingSettings(false);
    if (error) {
      showSuccess('Gagal Menyimpan', 'Terjadi kesalahan: ' + error.message);
      return;
    }
    onSettingsChange();
    showSuccess('Pengaturan Disimpan', 'Pengaturan pajak berhasil disimpan ke database.');
  };

  // ─────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────
  return (
    <>
      {/* ═══════ PANEL: KELOLA MENU ═══════ */}
      {activeTab === 'menu' && (
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Kelola Menu Kopi</h3>
            <button
              className={styles.refreshBtn}
              style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem 1rem' }}
              onClick={() => { setEditingProduct(null); setShowProductModal(true); }}
            >
              + Tambah Produk
            </button>
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyState}><p className={styles.emptyText}>Belum ada produk. Klik "Tambah Produk".</p></div>
          ) : (
            /* Scrollable wrapper — semua produk tampil sekaligus */
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '6px' }}>
              {/* Inner: horizontal scroll — mobile fix */}
              <div style={{ width: '100%', overflowX: 'auto', display: 'block', whiteSpace: 'nowrap' }}>
              <table className={styles.ordersTable}>
                <thead>
                  <tr style={{
                    position: 'sticky', top: 0,
                    backgroundColor: '#0b0b0b',
                    zIndex: 10,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <th>Nama Produk</th>
                    <th>Harga</th>
                    <th>Stok / Status</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td className={styles.tdName}>{p.name}</td>
                      <td className={styles.tdPrice}>{formatCurrency(p.price)}</td>
                      <td>
                        {/* Toggle Stok: klik badge untuk toggle is_available */}
                        <button
                          onClick={() => handleToggleAvailable(p)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          title="Klik untuk ubah stok"
                        >
                          <span className={`${styles.statusBadge} ${p.is_available ? styles.badgeDone : styles.badgePending}`}>
                            {p.is_available ? 'Tersedia' : 'Habis'}
                          </span>
                        </button>
                      </td>
                      <td className={styles.tdAction} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {/* Tombol Edit */}
                        <button
                          className={styles.actionBtn}
                          onClick={() => { setEditingProduct(p); setShowProductModal(true); }}
                        >
                          Edit
                        </button>
                        {/* Tombol Hapus */}
                        <button
                          className={styles.actionBtn}
                          style={{ borderColor: 'rgba(255,80,80,0.3)', color: '#ff6b6b' }}
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div> {/* /inner: horizontal scroll */}
            </div>
          )}
        </div>
      )}

      {/* ═══════ PANEL: PENGATURAN PAJAK ═══════ */}
      {activeTab === 'settings' && (
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Pengaturan Pajak</h3>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>

            {/* Toggle Pajak Aktif */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ ...labelStyle, marginBottom: '0.2rem', fontSize: '0.8rem' }}>Aktifkan Pajak</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                  Pajak akan dihitung otomatis di setiap transaksi
                </p>
              </div>
              {/* Toggle switch visual */}
              <button
                type="button"
                onClick={() => setLocalSettings(s => ({ ...s, pajak_aktif: !s.pajak_aktif }))}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px', border: 'none',
                  background: localSettings.pajak_aktif ? '#fff' : 'rgba(255,255,255,0.15)',
                  position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0,
                }}
                aria-label="Toggle pajak"
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: localSettings.pajak_aktif ? '25px' : '3px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: localSettings.pajak_aktif ? '#000' : 'rgba(255,255,255,0.5)',
                  transition: 'left 0.25s',
                }} />
              </button>
            </div>

            {/* Input Persentase Pajak */}
            <div>
              <label style={labelStyle}>Persentase Pajak (%)</label>
              <input
                type="number"
                min={0} max={100}
                value={localSettings.pajak_persen}
                onChange={e => setLocalSettings(s => ({ ...s, pajak_persen: e.target.value }))}
                disabled={!localSettings.pajak_aktif}
                style={{ ...inputStyle, opacity: localSettings.pajak_aktif ? 1 : 0.4, maxWidth: '120px' }}
              />
            </div>

            {/* Preview kalkulasi */}
            {localSettings.pajak_aktif && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)' }}>
                Setiap transaksi Rp 100.000 akan dikenakan pajak Rp {Math.round(100000 * (localSettings.pajak_persen / 100)).toLocaleString('id-ID')}
              </p>
            )}

            <button
              onClick={handleSaveSettings}
              disabled={isSavingSettings}
              style={{ ...btnPrimaryStyle, maxWidth: '200px', opacity: isSavingSettings ? 0.6 : 1 }}
            >
              {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit Produk */}
      {showProductModal && (
        <ProductFormModal
          initial={editingProduct}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null); }}
        />
      )}

      {/* Modal Konfirmasi Hapus Produk */}
      <ConfirmationModal
        isOpen={modalDelete.open}
        title="Hapus Produk"
        message={`Yakin ingin menghapus "${modalDelete.name}"? Tindakan ini tidak bisa dibatalkan.`}
        onConfirm={confirmDeleteProduct}
        onClose={() => setModalDelete({ open: false, id: null, name: '' })}
      />

      {/* Modal Notifikasi Sukses */}
      <SuccessModal
        isOpen={successModal.open}
        title={successModal.title}
        message={successModal.message}
        onClose={() => setSuccessModal({ open: false, title: '', message: '' })}
      />
    </>
  );
};

export default ProductManager;
