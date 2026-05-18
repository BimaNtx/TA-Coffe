/**
 * OrderForm.jsx — Multi-Product Order Form
 *
 * Konsep React yang digunakan (untuk laporan RPL):
 *   1. useState          — menyimpan state form, array item, dan modal
 *   2. Array.map()       — merender setiap baris item secara dinamis
 *   3. Immutable update  — mengupdate array tanpa mutasi langsung
 *   4. AnimatePresence   — animasi swap form ↔ pesan sukses
 *   5. Validasi form     — mencegah data yang tidak lengkap terkirim
 *   6. Modal konfirmasi  — menampilkan ringkasan sebelum data dikirim
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OrderForm.module.css';

import { supabase } from '../../supabaseClient';

// Helper: format angka ke format Rupiah — contoh: 85000 → "Rp 85.000"
const formatRupiah = (num) => 'Rp ' + Number(num).toLocaleString('id-ID');

// ─────────────────────────────────────────────────────────────
// PESAN SUKSES — ditampilkan setelah pesanan berhasil dikonfirmasi
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA
// ─────────────────────────────────────────────────────────────
/**
 * Props yang diterima dari App.jsx:
 *   @prop {Array}    products      — daftar produk dari Supabase (via App.jsx)
 *   @prop {Array}    orderItems    — array baris pesanan (state dari App.jsx)
 *   @prop {function} setOrderItems — fungsi updater untuk mengubah array tsb
 *
 * Kenapa tidak ada useState untuk orderItems di sini?
 * Karena state-nya sudah "diangkat" ke App.jsx (state lifting) agar
 * ProductCatalog dan OrderForm bisa berbagi data yang sama.
 */
const OrderForm = ({ products = [], globalSettings = {}, orderItems, setOrderItems }) => {
  // State lokal: hanya dibutuhkan oleh form ini, tidak dibagikan ke komponen lain
  const [name,  setName]  = useState('');

  /**
   * STATE: phone
   * Menyimpan nomor WhatsApp pelanggan.
   * Catatan database: field ini akan digunakan sebagai identifikasi
   * pelanggan (foreign key) saat diintegrasikan ke tabel `customers`.
   */
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  // State error: menyimpan pesan error per field { name: '...', phone: '...', ... }
  const [errors,      setErrors]      = useState({});

  // State tampilan: apakah form sudah berhasil disubmit?
  const [isSubmitted, setIsSubmitted] = useState(false);

  /**
   * isConfirmModalOpen — mengontrol tampil/tidaknya Modal Konfirmasi
   *
   * Alur:
   *   false (default) → form tampil biasa
   *   true            → Modal Ringkasan Pesanan muncul di atas form
   *
   * Diubah ke true saat SEMUA validasi berhasil dilewati di handleSubmit.
   * Diubah ke false saat user klik "KEMBALI / EDIT" di dalam modal.
   */
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // State loading saat sedang mengirim data ke Supabase
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * isSuccess — menandai apakah INSERT ke Supabase berhasil
   *
   * false (default) → modal menampilkan Ringkasan Pesanan
   * true            → modal berubah menampilkan tampilan sukses yang elegan
   *
   * Pola ini disebut Conditional Rendering:
   * Komponen yang ditampilkan bergantung pada nilai state ini.
   */
  const [isSuccess, setIsSuccess] = useState(false);

  // ── State POS Baru ────────────────────────────────────────
  /**
   * orderType — tipe transaksi: makan di tempat atau bawa pulang
   */
  const [orderType,     setOrderType]     = useState('TAKEAWAY');
  const [tableNumber,   setTableNumber]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');

  /**
   * applyTax & paymentMethod dikelola di sini, BUKAN oleh pelanggan.
   * Pajak dihitung otomatis dari globalSettings yang diatur Admin.
   */



  /**
   * handleCloseSuccess — dipanggil HANYA saat user klik "KEMBALI KE MENU"
   * di tampilan sukses dalam modal.
   *
   * Fungsi ini melakukan 2 hal sekaligus:
   *   1. Mereset semua state form kembali ke nilai kosong/awal
   *   2. Menutup modal konfirmasi
   *
   * Catatan: Fungsi ini TIDAK dipasang di tombol lain manapun,
   * agar form tidak ikut terhapus saat user klik "Batal" di tengah proses.
   */
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

  // ─────────────────────────────────────────────────────────────
  // FUNGSI MANIPULASI ARRAY orderItems
  // ─────────────────────────────────────────────────────────────

  /**
   * addItem — menambah baris pesanan baru
   * Menggunakan spread [...prev, item] bukan push() karena React
   * butuh reference array baru untuk mendeteksi perubahan state.
   */
  const addItem = () => {
    setOrderItems(prev => [...prev, { productId: '', quantity: 1 }]);
  };

  /**
   * removeItem — menghapus baris pada index tertentu
   * filter() membuat array baru yang hanya berisi elemen
   * yang index-nya BUKAN index yang ingin dihapus.
   */
  const removeItem = (indexToRemove) => {
    setOrderItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  /**
   * updateItem — mengubah satu field pada satu baris
   *
   * Immutable update pattern:
   *   map() menelusuri array → item di index yang dituju dibuat ulang
   *   dengan nilai baru, item lain dikembalikan apa adanya.
   *
   * @param {number} index - index baris yang diubah
   * @param {string} field - nama field ('productId' atau 'quantity')
   * @param {any}    value - nilai baru
   */
  const updateItem = (index, field, value) => {
    setOrderItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: value }  // buat objek baru dengan nilai terupdate
          : item                          // baris lain: biarkan apa adanya
      )
    );
  };

  // ─────────────────────────────────────────────────────────────
  // KALKULASI
  // ─────────────────────────────────────────────────────────────

  const isMaxItems  = orderItems.length >= products.length;
  const filledItems = orderItems.filter(item => item.productId !== '');

  const totalQuantity = filledItems.reduce(
    (sum, item) => sum + Number(item.quantity), 0
  );

  /**
   * subtotal  — harga sebelum pajak
   * taxAmount — dihitung otomatis dari globalSettings (dikelola Admin)
   *              Pelanggan tidak bisa mengubah nilai ini.
   * totalPrice— nilai final yang dikirim ke database kolom `total_harga`
   */
  const subtotal    = filledItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.productId);
    return sum + (product ? product.price * Number(item.quantity) : 0);
  }, 0);
  const taxAmount   = globalSettings.pajak_aktif
    ? Math.round(subtotal * ((globalSettings.pajak_persen ?? 11) / 100))
    : 0;
  const totalPrice  = subtotal + taxAmount;

  // ─────────────────────────────────────────────────────────────
  // VALIDASI
  // ─────────────────────────────────────────────────────────────

  /**
   * validate — memeriksa semua field wajib sebelum submit
   * Mengembalikan objek berisi pesan error untuk setiap field.
   * Jika objek kosong {}, berarti semua validasi lolos.
   */
  const validate = () => {
    const newErrors = {};
    if (!name.trim())  newErrors.name  = 'Nama wajib diisi.';
    if (!phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi.';
    if (!notes.trim()) newErrors.notes = 'Alamat / catatan wajib diisi.';
    // Nomor meja wajib diisi jika tipe pesanan Dine In
    if (orderType === 'DINE_IN' && !tableNumber.trim()) {
      newErrors.tableNumber = 'Nomor meja wajib diisi untuk Dine In.';
    }
    const hasEmpty = orderItems.some(item => !item.productId);
    if (hasEmpty) newErrors.items = 'Pilih kopi untuk semua baris.';
    return newErrors;
  };

  // ─────────────────────────────────────────────────────────────
  // SUBMIT — 2 tahap: validasi dulu, lalu tampilkan modal konfirmasi
  // ─────────────────────────────────────────────────────────────

  /**
   * handleSubmit — dipanggil saat tombol "Confirm Order" diklik
   *
   * Tahap 1: Jalankan validasi. Jika ada error, tampilkan dan berhenti.
   * Tahap 2: Saring baris kosong. Jika tidak ada kopi, alert dan berhenti.
   * Tahap 3: Semua lolos → tampilkan Modal Konfirmasi (BUKAN langsung submit).
   *
   * Kenapa tidak langsung submit?
   * Agar user bisa memeriksa ringkasan pesanannya sekali lagi
   * sebelum data benar-benar dikirim ke database.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Jalankan semua pengecekan validasi
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return; // hentikan jika ada field yang belum diisi
    }

    // Saring baris kosong yang lupa dipilih kopi
    const validItems = filledItems; // sudah dihitung di atas
    if (validItems.length === 0) {
      alert('Pilih minimal satu kopi terlebih dahulu!');
      return;
    }

    // Semua lolos → buka Modal Konfirmasi
    setIsConfirmModalOpen(true);
  };

  /**
   * processFinalOrder — dipanggil saat user klik "KONFIRMASI & PESAN" di modal
   *
   * Fungsi ini diubah menjadi async agar bisa melakukan request
   * database secara asynchronous tanpa membuat browser hang.
   */
  const processFinalOrder = async () => {
    setIsSubmitting(true);

    try {
      /**
       * payloadData — objek yang dikirim ke tabel `pesanan` di Supabase
       * Kolom baru: tipe_pesanan, nomor_meja, metode_bayar,
       *             subtotal, pajak_ppn, total_harga
       */
      const payloadData = {
        nama:           name,
        nomor_wa:       phone,
        alamat:         notes,
        detail_pesanan: filledItems,
        tipe_pesanan:   orderType,
        nomor_meja:     orderType === 'DINE_IN' ? tableNumber : null,
        metode_bayar:   paymentMethod,
        subtotal:       subtotal,
        pajak_ppn:      taxAmount,
        total_harga:    totalPrice,
      };

      console.log('Mengirim ke Supabase:', payloadData);

      const { error } = await supabase
        .from('pesanan')
        .insert([payloadData]);

      if (error) throw error;

      // Sukses: tampilkan layar konfirmasi di dalam modal (bukan alert)
      setIsSuccess(true);

    } catch (err) {
      console.error('Database Error:', err);
      alert('Terjadi kesalahan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // HELPER: hapus error satu field saat user mulai mengetik
  // Efek: teks merah "wajib diisi" langsung hilang saat user mengetik
  // ─────────────────────────────────────────────────────────────
  const clearError = (field) => {
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <section className={styles.section} id="section-pesan">
      <div className={styles.container}>

        {/* ── Kiri: heading ──────────────────────────────── */}
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
            <br />
            Gratis ongkir untuk wilayah Lumajang.
          </p>
          <ul className={styles.productList}>
            {products.map(p => (
              <li key={p.id}>
                {p.name} — {formatRupiah(p.price)}
              </li>
            ))}
          </ul>

          {/* ── Editorial Image Insert ───────────────────── */}
          <div className={styles.imageWrap}>
            <img
              src="/barista-editorial.png"
              alt="Barista menuang kopi pour-over Bima Coffee"
              className={styles.editorialImg}
              loading="lazy"
            />
          </div>
          <p className={styles.editorialCaption}>
            Roasted in Lumajang, East Java<br />
            Small Batch — Crafted with Precision
          </p>
        </motion.div>

        {/* ── Kanan: form ────────────────────────────────── */}
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
              <motion.form
                key="form"
                className={styles.form}
                onSubmit={handleSubmit}
                noValidate
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >

                {/* Field: Nama */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="name" className={styles.label}>
                    Nama <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => {
                      setName(e.target.value);
                      clearError('name'); // hapus error saat user mulai mengetik
                    }}
                    className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                    placeholder="Masukkan nama Anda"
                    autoComplete="name"
                  />
                  {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
                </div>

                {/* Field: Nomor WhatsApp */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="phone" className={styles.label}>
                    Nomor WhatsApp <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={e => {
                      /**
                       * Regex /\D/g — hapus karakter BUKAN angka secara real-time
                       *
                       * \D = "Non-Digit" (bukan 0-9)
                       * g  = "global" → ganti SEMUA kemunculan, bukan hanya yang pertama
                       *
                       * Contoh: user ketik "081a" → state phone = "081"
                       */
                      setPhone(e.target.value.replace(/\D/g, ''));
                      clearError('phone');
                    }}
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    placeholder="Contoh: 08123456789"
                    autoComplete="tel"
                  />
                  {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                </div>

                {/* ── Tipe Pesanan (Toggle: Dine In / Takeaway) ──── */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Tipe Pesanan</label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    {['DINE_IN', 'TAKEAWAY'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setOrderType(type); setTableNumber(''); }}
                        style={{
                          flex: 1, padding: '0.75rem', borderRadius: '0',
                          fontFamily: 'Inter, sans-serif', fontSize: '0.7rem',
                          fontWeight: 600, letterSpacing: '0.12em', cursor: 'pointer',
                          transition: 'all 0.2s',
                          background:   orderType === type ? '#FFFFFF' : 'rgba(255,255,255,0.05)',
                          color:        orderType === type ? '#000000' : 'rgba(255,255,255,0.45)',
                          border: `1px solid ${orderType === type ? '#FFFFFF' : 'rgba(255,255,255,0.15)'}`,
                        }}
                      >
                        {type === 'DINE_IN' ? '🪑 Dine In' : '🥡 Takeaway'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Nomor Meja (hanya muncul saat Dine In) ──────── */}
                {orderType === 'DINE_IN' && (
                  <div className={styles.fieldGroup}>
                    <label htmlFor="tableNumber" className={styles.label}>
                      Nomor Meja <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="tableNumber"
                      type="text"
                      value={tableNumber}
                      onChange={e => {
                        setTableNumber(e.target.value);
                        clearError('tableNumber');
                      }}
                      className={`${styles.input} ${errors.tableNumber ? styles.inputError : ''}`}
                      placeholder="Contoh: 5 atau A3"
                    />
                    {errors.tableNumber && <span className={styles.errorMsg}>{errors.tableNumber}</span>}
                  </div>
                )}

                {/* ── Daftar item pesanan (dinamis) ───────── */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Pilihan Kopi <span className={styles.required}>*</span>
                  </label>

                  {/*
                    map() merender satu baris per elemen dalam orderItems.
                    `item`  = objek ({ productId, quantity })
                    `index` = posisi dalam array (0, 1, 2, ...)
                    `key`   = wajib diisi React agar bisa track perubahan list
                  */}
                  <div className={styles.itemsList}>
                    {orderItems.map((item, index) => (
                      <div key={index} className={styles.itemRow}>

                        {/* Dropdown pilih kopi */}
                        <select
                          value={item.productId}
                          onChange={e => {
                            updateItem(index, 'productId', e.target.value);
                            clearError('items');
                          }}
                          className={`${styles.input} ${styles.select} ${styles.selectFlex}`}
                          aria-label={`Produk baris ${index + 1}`}
                        >
                          <option value="">— Pilih kopi —</option>
                          {products.map(p => {
                            /**
                             * Cek duplikasi: apakah produk ini sudah dipilih di baris lain?
                             * some() mengembalikan true jika ada baris LAIN (bukan baris ini)
                             * yang sudah memilih produk yang sama.
                             */
                            const isDuplicate = orderItems.some(
                              (otherItem, otherIndex) =>
                                otherIndex !== index &&
                                otherItem.productId === p.id
                            );
                            // Produk juga di-disable jika stok habis
                            const isUnavailable = p.is_available === false;
                            const isDisabled = isDuplicate || isUnavailable;
                            return (
                              <option key={p.id} value={p.id} disabled={isDisabled}>
                                {isUnavailable
                                  ? `(Habis) ${p.name}`
                                  : isDuplicate
                                    ? `${p.name} (Sudah dipilih)`
                                    : p.name}
                              </option>
                            );
                          })}
                        </select>

                        {/* Input jumlah */}
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={e => updateItem(index, 'quantity', e.target.value)}
                          className={`${styles.input} ${styles.qtyInput}`}
                          aria-label={`Jumlah baris ${index + 1}`}
                        />

                        {/* Tombol hapus baris — disabled jika hanya 1 baris */}
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={orderItems.length === 1}
                          className={styles.removeBtn}
                          aria-label={`Hapus baris ${index + 1}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  {errors.items && <span className={styles.errorMsg}>{errors.items}</span>}

                  {/*
                    Tombol tambah baris — disabled & ganti teks jika semua produk sudah dipilih
                  */}
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={isMaxItems}
                    className={isMaxItems ? styles.addItemBtnDisabled : styles.addItemBtn}
                  >
                    {isMaxItems ? 'Semua Menu Telah Dipilih' : '+ Tambah Kopi'}
                  </button>
                </div>

                {/* ── Ringkasan Harga (otomatis, tidak bisa diubah pelanggan) ── */}
                <div className={styles.summary}>
                  <span className={styles.summaryLabel}>
                    Total Item: <strong>{totalQuantity}</strong>
                  </span>
                  {subtotal > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                      {globalSettings.pajak_aktif && (
                        <>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                            Subtotal: {formatRupiah(subtotal)}
                          </span>
                          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.75rem', color: 'rgba(255,200,100,0.7)' }}>
                            PPN {globalSettings.pajak_persen ?? 11}%: +{formatRupiah(taxAmount)}
                          </span>
                        </>
                      )}
                      <span className={styles.summaryPrice}>{formatRupiah(totalPrice)}</span>
                    </div>
                  )}
                </div>

                {/* Field: Alamat & Catatan — wajib diisi */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="notes" className={styles.label}>
                    Alamat &amp; Catatan <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={e => {
                      setNotes(e.target.value);
                      clearError('notes');
                    }}
                    className={`${styles.input} ${styles.textarea} ${errors.notes ? styles.inputError : ''}`}
                    placeholder="Alamat pengiriman atau catatan khusus..."
                    rows={3}
                  />
                  {errors.notes && <span className={styles.errorMsg}>{errors.notes}</span>}
                </div>

                {/* ── Metode Pembayaran ───────────────────────── */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="paymentMethod" className={styles.label}>Metode Pembayaran</label>
                  <select
                    id="paymentMethod"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className={`${styles.input} ${styles.select}`}
                  >
                    <option value="CASH">💵 Cash</option>
                    <option value="QRIS">📱 QRIS</option>
                    <option value="DEBIT">💳 Kartu Debit</option>
                  </select>
                </div>

                {/* Tombol buka Modal Konfirmasi */}
                <button type="submit" className={styles.submitButton}>
                  Konfirmasi Pesanan
                </button>

              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      {/*
        ── Modal Ringkasan Pesanan ─────────────────────────────
        Hanya dirender saat isConfirmModalOpen === true.

        Alur data ke modal:
          1. User isi form (name, phone, notes, orderItems)
          2. Klik "Konfirmasi Pesanan" → handleSubmit() → validasi lolos
          3. setIsConfirmModalOpen(true) → modal muncul
          4. Modal menampilkan data dari state (name, phone, filledItems, totalPrice)
          5. User klik "KONFIRMASI & PESAN" → processFinalOrder() → selesai
      */}
      {isConfirmModalOpen && (
        <div
          className={styles.modalOverlay}
        >
          <div
            className={styles.modalBox}
          >
            {/*
              CONDITIONAL RENDERING MODAL
              ─────────────────────────────────────────────────────────
              Konsep: "Jika (isSuccess === true) tampilkan A, jika tidak tampilkan B"

              isSuccess = false → tampilkan Ringkasan Pesanan (Order Summary)
              isSuccess = true  → tampilkan layar Sukses yang elegan

              Cara memicunya:
                processFinalOrder() berhasil → setIsSuccess(true) → render berubah
                Tombol "KEMBALI KE MENU"    → handleCloseSuccess() → semuanya reset
            */}
            {isSuccess ? (
              /* ── Tampilan Sukses — Instruksi ke Kasir ── */
              <div className={styles.modalSuccessView}>
                <span className={styles.modalSuccessIcon}>✓</span>
                <h3 className={styles.modalSuccessTitle}>Pesanan Terkirim!</h3>

                {orderType === 'DINE_IN' ? (
                  /*
                   * DINE IN — instruksikan pelanggan ke kasir,
                   * sebutkan nama, dan tunggu di meja.
                   */
                  <p className={styles.modalSuccessText}>
                    Silakan ke kasir untuk membayar dengan{' '}
                    <strong>{paymentMethod}</strong> dan sebutkan nama{' '}
                    <strong>{name}</strong>.<br />
                    Pesanan akan diantar ke{' '}
                    <strong>Meja {tableNumber}</strong>.
                  </p>
                ) :
                (
                  /*
                   * TAKEAWAY — instruksi yang sudah diperbarui dengan nama
                   */
                  <p className={styles.modalSuccessText}>
                    Silakan ke kasir untuk membayar dengan <strong>{paymentMethod}</strong>. <br/>
                    Gunakan nama <strong>{name}</strong> sebagai bukti pengambilan pesanan Anda.
                  </p>
                )}

                <button
                  className={styles.modalBtnPrimary}
                  onClick={handleCloseSuccess}
                >
                  Kembali ke Menu
                </button>
              </div>
            ) : (
              /* ── Tampilan Ringkasan Pesanan (default) ── */
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
                    <span className={styles.modalKey}>Nama</span>
                    <span className={styles.modalVal}>{name}</span>
                    <span className={styles.modalKey}>WhatsApp</span>
                    <span className={styles.modalVal}>{phone}</span>
                    <span className={styles.modalKey}>Alamat</span>
                    <span className={styles.modalVal}>{notes}</span>
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
                  <button
                    className={styles.modalBtnSecondary}
                    onClick={() => setIsConfirmModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Kembali / Edit
                  </button>
                  <button
                    className={styles.modalBtnPrimary}
                    onClick={processFinalOrder}
                    disabled={isSubmitting}
                  >
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
