// 📌 [COMPONENT] OrderForm: Form kasir multi-produk (Boss Level). 
// Menangani state input, validasi data, kalkulasi otomatis (pajak & total), serta submit ke Supabase.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OrderForm.module.css';

import { supabase } from '../../supabaseClient';

// ⚙️ [LOGIC] Helper untuk memformat angka menjadi mata uang Rupiah.
const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// 🧩 [CHILD COMPONENT] Tampilan statis jika pesanan berhasil (alternatif selain modal).
const SuccessMessage = () => (
  <motion.div
    className={styles.successBox}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    role="status"
    aria-live="polite"
  >
    <span className={styles.successIcon}>✓</span>
    <h3 className={styles.successTitle}>Pesanan Diterima!</h3>
    <p className={styles.successText}>
      Terima kasih! Barista kami akan segera menghubungi Anda.
    </p>
  </motion.div>
);

// 🔄 [PROPS] Menerima data master produk, pengaturan pajak, dan keranjang belanja (orderItems) dari App.jsx (State Lifting).
const OrderForm = ({ products = [], globalSettings = {}, orderItems, setOrderItems }) => {

  // 📌 [STATE] Data identitas pelanggan.
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // 📌 [STATE] Status form dan UI.
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 📌 [STATE] Data transaksi POS.
  const [orderType, setOrderType] = useState('TAKEAWAY');
  const [tableNumber, setTableNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  // ⚙️ [LOGIC] Mereset seluruh isi form kembali ke nilai awal dan menutup modal setelah pesanan selesai.
  const handleCloseSuccess = () => {
    setName('');
    setPhone('');
    setNotes('');
    setOrderItems([{ productId: '', quantity: 1 }]);
    setOrderType('TAKEAWAY');
    setTableNumber('');
    setPaymentMethod('CASH');
    setIsSuccess(false);
    setIsConfirmModalOpen(false);
  };

  // ⚙️ [LOGIC] Menambah baris array pesanan kosong yang baru.
  const addItem = () => {
    setOrderItems(prev => [...prev, { productId: '', quantity: 1 }]);
  };

  // ⚙️ [LOGIC] Menghapus satu baris pesanan berdasarkan index-nya.
  const removeItem = (indexToRemove) => {
    setOrderItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  // ⚙️ [LOGIC] Immutable Update: Memperbarui nilai (kopi atau jumlah) pada baris pesanan tertentu tanpa merusak state asli.
  const updateItem = (index, field, value) => {
    setOrderItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  // ⚙️ [LOGIC] Kalkulasi Harga Otomatis: Menghitung subtotal, nilai pajak, dan harga total akhir.
  const isMaxItems = orderItems.length >= products.length;
  const filledItems = orderItems.filter(item => item.productId !== '');
  const totalQuantity = filledItems.reduce((sum, item) => sum + Number(item.quantity), 0);

  const subtotal = filledItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * Number(item.quantity) : 0);
  }, 0);
  const taxAmount = globalSettings.pajak_aktif
    ? Math.round(subtotal * ((globalSettings.pajak_persen ?? 11) / 100))
    : 0;
  const totalPrice = subtotal + taxAmount;

  // ⚙️ [LOGIC] Memeriksa apakah ada field wajib yang terlewat sebelum data bisa diproses.
  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Nama wajib diisi.';
    if (!phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi.';
    if (!notes.trim()) newErrors.notes = 'Alamat / catatan wajib diisi.';
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      newErrors.tableNumber = 'Nomor meja wajib diisi untuk Dine In.';
    }
    const hasEmpty = orderItems.some(item => !item.productId);
    if (hasEmpty) newErrors.items = 'Pilih kopi untuk semua baris.';
    return newErrors;
  };

  // ⚙️ [LOGIC] Tahap 1 Submit: Cegat input dengan validasi. Jika lolos semua, tampilkan Modal Konfirmasi (jangan langsung submit).
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (filledItems.length === 0) {
      alert('Pilih minimal satu kopi terlebih dahulu!');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // 🚀 [FETCH] Tahap 2 Submit: Memasukkan (INSERT) data pesanan final ke tabel `pesanan` di Supabase.
  const processFinalOrder = async () => {
    setIsSubmitting(true);
    try {
      const payloadData = {
        nama: name,
        nomor_wa: phone,
        alamat: notes,
        detail_pesanan: filledItems,
        tipe_pesanan: orderType,
        nomor_meja: orderType === 'DINE_IN' ? tableNumber : null,
        metode_bayar: paymentMethod,
        subtotal: subtotal,
        pajak_ppn: taxAmount,
        total_harga: totalPrice,
      };

      console.log('Mengirim ke Supabase:', payloadData);
      const { error } = await supabase.from('pesanan').insert([payloadData]);
      if (error) throw error;

      setIsSuccess(true); // Ubah tampilan modal jadi sukses
    } catch (err) {
      console.error('Database Error:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ⚙️ [LOGIC] Menghilangkan pesan teks merah (error) secara real-time begitu user mulai mengetik.
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <section className={styles.section} id="section-pesan">
      <div className={styles.container}>

        {/* 🎨 [ANIMATION] Kolom Kiri: Informasi Promo & List Harga */}
        <motion.div
          className={styles.leftCol}
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>Pesan Langsung</span>
          <h2 className={styles.heading}>Place Your<br />Order</h2>
          <p className={styles.subtext}>
            Dipesan hari ini, diroasting esok pagi.
            <br />Gratis ongkir untuk wilayah Lumajang.
          </p>
          <ul className={styles.productList}>
            {products.map(p => <li key={p.id}>{p.name} — {formatRupiah(p.price)}</li>)}
          </ul>

          <div className={styles.imageWrap}>
            <img src="/barista-editorial.png" alt="Barista menuang kopi" className={styles.editorialImg} loading="lazy" />
          </div>
          <p className={styles.editorialCaption}>
            Roasted in Lumajang, East Java<br />Small Batch — Crafted with Precision
          </p>
        </motion.div>

        {/* 🎨 [ANIMATION] Kolom Kanan: Form Input Pesanan */}
        <motion.div
          className={styles.rightCol}
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <AnimatePresence mode="wait">
            {isSubmitted ? (
              <SuccessMessage key="success" />
            ) : (
              <motion.form key="form" className={styles.form} onSubmit={handleSubmit} noValidate exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>

                {/* 📝 Field: Nama & WhatsApp */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="name" className={styles.label}>Nama <span className={styles.required}>*</span></label>
                  <input id="name" type="text" value={name} onChange={e => { setName(e.target.value); clearError('name'); }} className={`${styles.input} ${errors.name ? styles.inputError : ''}`} placeholder="Masukkan nama Anda" />
                  {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="phone" className={styles.label}>Nomor WhatsApp <span className={styles.required}>*</span></label>
                  <input id="phone" type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); clearError('phone'); }} className={`${styles.input} ${errors.phone ? styles.inputError : ''}`} placeholder="Contoh: 08123456789" />
                  {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                </div>

                {/* 📝 Field: Tipe Pesanan (Dine In / Takeaway) */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Tipe Pesanan</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {['DINE_IN', 'TAKEAWAY'].map(type => (
                      <button
                        key={type} type="button" onClick={() => { setOrderType(type); setTableNumber(''); }}
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '0', fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
                          fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer', transition: 'all 0.2s',
                          background: orderType === type ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                          color: orderType === type ? '#000000' : 'rgba(255,255,255,0.45)',
                          border: `1px solid ${orderType === type ? '#FFFFFF' : 'rgba(255,255,255,0.15)'}`
                        }}
                      >
                        {type === 'DINE_IN' ? '🪑 Dine In' : '🥡 Takeaway'}
                      </button>
                    ))}
                  </div>
                </div>

                {orderType === 'DINE_IN' && (
                  <div className={styles.fieldGroup}>
                    <label htmlFor="tableNumber" className={styles.label}>Nomor Meja <span className={styles.required}>*</span></label>
                    <input id="tableNumber" type="text" value={tableNumber} onChange={e => { setTableNumber(e.target.value); clearError('tableNumber'); }} className={`${styles.input} ${errors.tableNumber ? styles.inputError : ''}`} placeholder="Contoh: 5 atau A3" />
                    {errors.tableNumber && <span className={styles.errorMsg}>{errors.tableNumber}</span>}
                  </div>
                )}

                {/* 🔄 [RENDER] Looping Array item pesanan */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Pilihan Kopi <span className={styles.required}>*</span></label>
                  <div className={styles.itemsList}>
                    {orderItems.map((item, index) => (
                      <div key={index} className={styles.itemRow}>
                        <select
                          value={item.productId} onChange={e => { updateItem(index, 'productId', e.target.value); clearError('items'); }}
                          className={`${styles.input} ${styles.select} ${styles.selectFlex}`}
                        >
                          <option value="">— Pilih kopi —</option>
                          {products.map(p => {
                            const isDuplicate = orderItems.some((otherItem, otherIndex) => otherIndex !== index && otherItem.productId === p.id);
                            const isUnavailable = p.is_available === false;
                            const isDisabled = isDuplicate || isUnavailable;
                            return (
                              <option key={p.id} value={p.id} disabled={isDisabled}>
                                {isUnavailable ? `(Habis) ${p.name}` : isDuplicate ? `${p.name} (Sudah dipilih)` : p.name}
                              </option>
                            );
                          })}
                        </select>

                        <input type="number" min={1} max={99} value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} className={`${styles.input} ${styles.qtyInput}`} />
                        <button type="button" onClick={() => removeItem(index)} disabled={orderItems.length === 1} className={styles.removeBtn}>×</button>
                      </div>
                    ))}
                  </div>
                  {errors.items && <span className={styles.errorMsg}>{errors.items}</span>}

                  <button type="button" onClick={addItem} disabled={isMaxItems} className={isMaxItems ? styles.addItemBtnDisabled : styles.addItemBtn}>
                    {isMaxItems ? 'Semua Menu Telah Dipilih' : '+ Tambah Kopi'}
                  </button>
                </div>

                {/* 💰 Area Ringkasan Kalkulasi */}
                <div className={styles.summary}>
                  <span className={styles.summaryLabel}>Total Item: <strong>{totalQuantity}</strong></span>
                  {subtotal > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                      {globalSettings.pajak_aktif && (
                        <>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Subtotal: {formatRupiah(subtotal)}</span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)' }}>PPN {globalSettings.pajak_persen ?? 11}%: +{formatRupiah(taxAmount)}</span>
                        </>
                      )}
                      <span className={styles.summaryPrice}>{formatRupiah(totalPrice)}</span>
                    </div>
                  )}
                </div>

                {/* 📝 Field: Catatan & Metode Pembayaran */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="notes" className={styles.label}>Alamat &amp; Catatan <span className={styles.required}>*</span></label>
                  <textarea id="notes" value={notes} onChange={e => { setNotes(e.target.value); clearError('notes'); }} className={`${styles.input} ${styles.textarea} ${errors.notes ? styles.inputError : ''}`} placeholder="Alamat pengiriman atau catatan khusus..." rows={3} />
                  {errors.notes && <span className={styles.errorMsg}>{errors.notes}</span>}
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="paymentMethod" className={styles.label}>Metode Pembayaran</label>
                  <select id="paymentMethod" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className={`${styles.input} ${styles.select}`}>
                    <option value="CASH">💵 Cash</option>
                    <option value="QRIS">📱 QRIS</option>
                    <option value="DEBIT">💳 Kartu Debit</option>
                  </select>
                </div>

                <button type="submit" className={styles.submitButton}>Konfirmasi Pesanan</button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 🧩 [CHILD COMPONENT] Modal Konfirmasi (Menimpa layer form jika ditekan Confirm) */}
      {isConfirmModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            {isSuccess ? (
              <div className={styles.modalSuccessView}>
                <span className={styles.modalSuccessIcon}>✓</span>
                <h3 className={styles.modalSuccessTitle}>Pesanan Terkirim!</h3>
                {orderType === 'DINE_IN' ? (
                  <p className={styles.modalSuccessText}>
                    Silakan ke kasir untuk membayar dengan <strong>{paymentMethod}</strong> dan sebutkan nama <strong>{name}</strong>.<br />
                    Pesanan akan diantar ke <strong>Meja {tableNumber}</strong>.
                  </p>
                ) : (
                  <p className={styles.modalSuccessText}>
                    Silakan ke kasir untuk membayar dengan <strong>{paymentMethod}</strong>.<br />
                    Gunakan nama <strong>{name}</strong> sebagai bukti pengambilan pesanan Anda.
                  </p>
                )}
                <button className={styles.modalBtnPrimary} onClick={handleCloseSuccess}>Kembali ke Menu</button>
              </div>
            ) : (
              <>
                <span className={styles.modalEyebrow}>Periksa kembali pesanan Anda</span>
                <h3 className={styles.modalTitle}>Konfirmasi Pesanan</h3>
                <div className={styles.modalDivider} />

                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>Info Transaksi</p>
                  <div className={styles.modalInfoGrid}>
                    <span className={styles.modalKey}>Tipe</span>
                    <span className={styles.modalVal}>{orderType === 'DINE_IN' ? `Dine In — Meja ${tableNumber}` : 'Takeaway'}</span>
                    <span className={styles.modalKey}>Pembayaran</span>
                    <span className={styles.modalVal}>{paymentMethod}</span>
                  </div>
                </div>
                <div className={styles.modalDivider} />

                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>Data Pemesan</p>
                  <div className={styles.modalInfoGrid}>
                    <span className={styles.modalKey}>Nama</span><span className={styles.modalVal}>{name}</span>
                    <span className={styles.modalKey}>WhatsApp</span><span className={styles.modalVal}>{phone}</span>
                    <span className={styles.modalKey}>Alamat</span><span className={styles.modalVal}>{notes}</span>
                  </div>
                </div>
                <div className={styles.modalDivider} />

                <div className={styles.modalSection}>
                  <p className={styles.modalSectionLabel}>Daftar Pesanan</p>
                  {filledItems.map((item, i) => {
                    const product = products.find(p => p.id === item.productId);
                    const itemSubtotal = product ? product.price * Number(item.quantity) : 0;
                    return (
                      <div key={i} className={styles.modalItemRow}>
                        <span className={styles.modalItemName}>{product?.name}</span>
                        <span className={styles.modalItemQty}>×{item.quantity}</span>
                        <span className={styles.modalItemPrice}>{formatRupiah(itemSubtotal)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className={styles.modalDivider} />

                <div className={styles.modalTotalRow}>
                  <span className={styles.modalTotalLabel}>Subtotal</span>
                  <span className={styles.modalTotalPrice} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{formatRupiah(subtotal)}</span>
                </div>
                {globalSettings?.pajak_aktif && (
                  <div className={styles.modalTotalRow}>
                    <span className={styles.modalTotalLabel}>PPN 11%</span>
                    <span className={styles.modalTotalPrice} style={{ fontSize: '0.85rem', color: 'rgba(255,200,100,0.7)' }}>+{formatRupiah(taxAmount)}</span>
                  </div>
                )}
                <div className={styles.modalTotalRow}>
                  <span className={styles.modalTotalLabel}>Total</span>
                  <span className={styles.modalTotalPrice}>{formatRupiah(totalPrice)}</span>
                </div>

                <div className={styles.modalActions}>
                  <button className={styles.modalBtnSecondary} onClick={() => setIsConfirmModalOpen(false)} disabled={isSubmitting}>Kembali / Edit</button>
                  <button className={styles.modalBtnPrimary} onClick={processFinalOrder} disabled={isSubmitting}>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi & Pesan'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </section>
  );
};

export default OrderForm;