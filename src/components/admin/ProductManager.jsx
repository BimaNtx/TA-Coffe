// 📌 [COMPONENT] ProductManager: Menangani Tab "Kelola Menu" dan "Pengaturan" di Admin Dashboard.
// 🔄 Berisi logika CRUD (Create, Read, Update, Delete) untuk produk kopi dan update persentase pajak ke Supabase.

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './AdminDashboard.module.css';
import ConfirmationModal from '../modals/ConfirmationModal';
import SuccessModal from '../modals/SuccessModal';

// ⚙️ [LOGIC] Helper formatting angka ke format Rupiah.
const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(amount ?? 0);

// 🎨 [STYLES] Konstanta gaya (inline styles) yang dipakai bersama di area Form dan Settings.
const labelStyle = { display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '0.5rem' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0', padding: '0.7rem 0.9rem', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.2s ease' };
const btnPrimaryStyle = { flex: 1, background: '#fff', color: '#000', border: 'none', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' };
const btnSecondaryStyle = { flex: 1, background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '0', padding: '0.75rem', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer' };

// 🧩 [CHILD COMPONENT] Modal Pop-up Form untuk Create (Tambah) dan Update (Edit) Produk.
const ProductFormModal = ({ initial, onSave, onClose }) => {
  // 📌 [STATE] Jika `initial` ada isinya, berarti form masuk ke mode Edit. Jika kosong, berarti mode Tambah Baru.
  const [name, setName] = useState(initial?.name ?? '');
  const [price, setPrice] = useState(initial?.price ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  // ⚙️ [LOGIC] Tahap validasi form sebelum data dikirim ke komponen induk untuk disimpan.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (name.trim().length < 3) { setError('Nama produk minimal 3 karakter.'); return; }
    if (!price || Number(price) <= 0) { setError('Harga harus lebih dari Rp 0.'); return; }

    setIsSaving(true);
    await onSave({ name: name.trim(), price: Number(price) });
    setIsSaving(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0', padding: '2.5rem', width: '100%', maxWidth: '400px' }}>
        <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '0.75rem' }}>Admin Console · Menu</span>
        <h3 style={{ fontFamily: 'Inter, sans-serif', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#ffffff', margin: '0 0 0.5rem 0', lineHeight: 1 }}>
          {initial ? 'Edit Produk' : 'Tambah Produk'}
        </h3>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.25rem 0 1.75rem' }} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Nama Produk</label>
            <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Contoh: Semeru Espresso" onFocus={e => e.target.style.borderColor = '#ffffff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
          </div>
          <div>
            <label style={labelStyle}>Harga (Rp)</label>
            <input type="number" step="1000" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} placeholder="Contoh: 85000" onFocus={e => e.target.style.borderColor = '#ffffff'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.15)'} />
          </div>

          {error && (
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,80,80,0.9)', margin: 0, paddingLeft: '0.75rem', borderLeft: '2px solid rgba(255,80,80,0.6)' }}>⚠ {error}</p>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <button type="submit" disabled={isSaving} style={{ ...btnPrimaryStyle, opacity: isSaving ? 0.55 : 1 }}>{isSaving ? 'Menyimpan...' : 'Simpan'}</button>
            <button type="button" onClick={onClose} style={btnSecondaryStyle}>Batal</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 🧩 [MAIN COMPONENT] ProductManager
// 🔄 Menerima data produk & pengaturan (State Lifting) dari App.jsx melalui AdminDashboard.jsx.
const ProductManager = ({ products, globalSettings = {}, onProductsChange, onSettingsChange, activeTab }) => {

  // 📌 [STATE] Mengontrol Modal Form Produk (Tambah/Edit).
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // 📌 [STATE] Mengontrol Modal Konfirmasi (Safety Lock) sebelum Delete dieksekusi.
  const [modalDelete, setModalDelete] = useState({ open: false, id: null, name: '' });

  // 📌 [STATE] Mengontrol Modal Sukses untuk memberikan feedback operasi.
  const [successModal, setSuccessModal] = useState({ open: false, title: '', message: '' });
  const showSuccess = (title, message) => setSuccessModal({ open: true, title, message });

  // 📌 [STATE] Menampung draft perubahan pajak di admin sebelum disimpan permanen ke database.
  const [localSettings, setLocalSettings] = useState({
    pajak_aktif: globalSettings.pajak_aktif ?? false,
    pajak_persen: globalSettings.pajak_persen ?? 11,
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // ⚙️ [LOGIC] Sinkronisasi data pajak (jika ada update dari server/App.jsx, timpa draft lokal).
  useEffect(() => {
    setLocalSettings({
      pajak_aktif: globalSettings.pajak_aktif ?? false,
      pajak_persen: globalSettings.pajak_persen ?? 11,
    });
  }, [globalSettings.pajak_aktif, globalSettings.pajak_persen]);

  // 🚀 [FETCH] (Create / Update) Menyimpan produk ke DB Supabase, lalu memanggil fungsi refresh (onProductsChange).
  const handleSaveProduct = async ({ name, price }) => {
    if (editingProduct) {
      // Skenario Edit (UPDATE)
      const { error } = await supabase.from('produk').update({ name, price }).eq('id', editingProduct.id);
      if (error) { showSuccess('Gagal Update', 'Terjadi kesalahan: ' + error.message); return; }
    } else {
      // Skenario Tambah Baru (INSERT). ID dibuat otomatis dari nama produk.
      const generatedId = name.toLowerCase().trim().replace(/\s+/g, '-');
      const { error } = await supabase.from('produk').insert({ id: generatedId, name, price, is_available: true });
      if (error) { showSuccess('Gagal Tambah', 'Terjadi kesalahan: ' + error.message); return; }
    }

    setShowProductModal(false);
    setEditingProduct(null);
    onProductsChange();
    showSuccess(editingProduct ? 'Produk Diperbarui' : 'Produk Ditambahkan', `"${name}" berhasil ${editingProduct ? 'diperbarui' : 'ditambahkan'} ke daftar menu.`);
  };

  // 🚀 [FETCH] (Update) Mengubah status "Tersedia" menjadi "Habis" dan sebaliknya secara instan di DB.
  const handleToggleAvailable = async (product) => {
    const newVal = !product.is_available;
    const { error } = await supabase.from('produk').update({ is_available: newVal }).eq('id', product.id);
    if (error) { showSuccess('Gagal Ubah Stok', 'Terjadi kesalahan: ' + error.message); return; }
    onProductsChange();
  };

  // ⚙️ [LOGIC] Menahan aksi Delete dan memunculkan Modal Konfirmasi terlebih dahulu.
  const handleDeleteProduct = (id, name) => {
    setModalDelete({ open: true, id, name });
  };

  // 🚀 [FETCH] (Delete) Menghapus baris produk secara permanen dari Supabase jika user setuju.
  const confirmDeleteProduct = async () => {
    const { id, name } = modalDelete;
    setModalDelete({ open: false, id: null, name: '' });
    const { error } = await supabase.from('produk').delete().eq('id', id);

    if (error) { showSuccess('Gagal Hapus', 'Terjadi kesalahan: ' + error.message); return; }

    onProductsChange();
    showSuccess('Produk Dihapus', `"${name}" berhasil dihapus dari daftar menu.`);
  };

  // 🚀 [FETCH] (Update) Menyimpan persentase pajak baru ke DB Supabase pada baris pengaturan (id=1).
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    const { error } = await supabase.from('pengaturan').update({ pajak_aktif: localSettings.pajak_aktif, pajak_persen: Number(localSettings.pajak_persen) }).eq('id', 1);
    setIsSavingSettings(false);

    if (error) { showSuccess('Gagal Menyimpan', 'Terjadi kesalahan: ' + error.message); return; }

    onSettingsChange();
    showSuccess('Pengaturan Disimpan', 'Pengaturan pajak berhasil disimpan ke database.');
  };

  return (
    <>
      {/* ═══════ PANEL: TAB KELOLA MENU ═══════ */}
      {activeTab === 'menu' && (
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Kelola Menu Kopi</h3>
            <button className={styles.refreshBtn} style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '0.5rem 1rem' }} onClick={() => { setEditingProduct(null); setShowProductModal(true); }}>
              + Tambah Produk
            </button>
          </div>

          {products.length === 0 ? (
            <div className={styles.emptyState}><p className={styles.emptyText}>Belum ada produk. Klik "Tambah Produk".</p></div>
          ) : (
            <div style={{ maxHeight: '65vh', overflowY: 'auto', paddingRight: '6px' }}>
              <div style={{ width: '100%', overflowX: 'auto', display: 'block', whiteSpace: 'nowrap' }}>
                <table className={styles.ordersTable}>
                  <thead>
                    <tr style={{ position: 'sticky', top: 0, backgroundColor: '#0b0b0b', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th>Nama Produk</th>
                      <th>Harga</th>
                      <th>Stok / Status</th>
                      <th style={{ textAlign: 'right' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 🔄 [RENDER] Looping data master produk untuk ditampilkan sebagai baris tabel */}
                    {products.map(p => (
                      <tr key={p.id}>
                        <td className={styles.tdName}>{p.name}</td>
                        <td className={styles.tdPrice}>{formatCurrency(p.price)}</td>
                        <td>
                          <button onClick={() => handleToggleAvailable(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }} title="Klik untuk ubah stok">
                            <span className={`${styles.statusBadge} ${p.is_available ? styles.badgeDone : styles.badgePending}`}>
                              {p.is_available ? 'Tersedia' : 'Habis'}
                            </span>
                          </button>
                        </td>
                        <td className={styles.tdAction} style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button className={styles.actionBtn} onClick={() => { setEditingProduct(p); setShowProductModal(true); }}>Edit</button>
                          <button className={styles.actionBtn} style={{ borderColor: 'rgba(255,80,80,0.3)', color: '#ff6b6b' }} onClick={() => handleDeleteProduct(p.id, p.name)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════ PANEL: TAB PENGATURAN PAJAK ═══════ */}
      {activeTab === 'settings' && (
        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>Pengaturan Pajak</h3>
          </div>
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>

            {/* Toggle Status Pajak */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ ...labelStyle, marginBottom: '0.2rem', fontSize: '0.8rem' }}>Aktifkan Pajak</p>
                <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>Pajak akan dihitung otomatis di setiap transaksi</p>
              </div>
              <button
                type="button"
                onClick={() => setLocalSettings(s => ({ ...s, pajak_aktif: !s.pajak_aktif }))}
                style={{ width: '48px', height: '26px', borderRadius: '13px', border: 'none', background: localSettings.pajak_aktif ? '#fff' : 'rgba(255,255,255,0.15)', position: 'relative', cursor: 'pointer', transition: 'background 0.25s', flexShrink: 0 }}
                aria-label="Toggle pajak"
              >
                <span style={{ position: 'absolute', top: '3px', left: localSettings.pajak_aktif ? '25px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: localSettings.pajak_aktif ? '#000' : 'rgba(255,255,255,0.5)', transition: 'left 0.25s' }} />
              </button>
            </div>

            {/* Input Nilai Persen Pajak */}
            <div>
              <label style={labelStyle}>Persentase Pajak (%)</label>
              <input type="number" min={0} max={100} value={localSettings.pajak_persen} onChange={e => setLocalSettings(s => ({ ...s, pajak_persen: e.target.value }))} disabled={!localSettings.pajak_aktif} style={{ ...inputStyle, opacity: localSettings.pajak_aktif ? 1 : 0.4, maxWidth: '120px' }} />
            </div>

            {localSettings.pajak_aktif && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)' }}>
                Setiap transaksi Rp 100.000 akan dikenakan pajak Rp {Math.round(100000 * (localSettings.pajak_persen / 100)).toLocaleString('id-ID')}
              </p>
            )}

            <button onClick={handleSaveSettings} disabled={isSavingSettings} style={{ ...btnPrimaryStyle, maxWidth: '200px', opacity: isSavingSettings ? 0.6 : 1 }}>
              {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        </div>
      )}

      {/* 🧩 [MODALS] Kumpulan Modal yang dipanggil sesuai state */}
      {showProductModal && (
        <ProductFormModal initial={editingProduct} onSave={handleSaveProduct} onClose={() => { setShowProductModal(false); setEditingProduct(null); }} />
      )}

      <ConfirmationModal isOpen={modalDelete.open} title="Hapus Produk" message={`Yakin ingin menghapus "${modalDelete.name}"? Tindakan ini tidak bisa dibatalkan.`} onConfirm={confirmDeleteProduct} onClose={() => setModalDelete({ open: false, id: null, name: '' })} />

      <SuccessModal isOpen={successModal.open} title={successModal.title} message={successModal.message} onClose={() => setSuccessModal({ open: false, title: '', message: '' })} />
    </>
  );
};

export default ProductManager;