/**
 * OrderForm.jsx — Multi-Product Order
 *
 * Konsep React yang digunakan (untuk laporan RPL):
 *   1. useState          — menyimpan state form dan array item
 *   2. Array.map()       — merender setiap baris item secara dinamis
 *   3. Immutable update  — mengupdate array tanpa mutasi langsung
 *   4. AnimatePresence   — animasi swap form ↔ pesan sukses
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './OrderForm.module.css';

// ─────────────────────────────────────────────────────────────
// DATA PRODUK (siap diganti dengan fetch dari database)
// ─────────────────────────────────────────────────────────────
const PRODUCTS = [
  { id: 'semeru-espresso', name: 'Semeru Espresso',  price: 85000 },
  { id: 'mandheling-gayo', name: 'Mandheling Gayo',  price: 90000 },
  { id: 'toraja-kalosi',   name: 'Toraja Kalosi',    price: 95000 },
];

// Helper: format angka ke format Rupiah
const formatRupiah = (num) =>
  'Rp ' + num.toLocaleString('id-ID');

// ─────────────────────────────────────────────────────────────
// PESAN SUKSES
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
const OrderForm = () => {
  // State untuk field nama dan catatan pengiriman
  const [name,  setName]  = useState('');

  /**
   * STATE: phone
   *
   * Menyimpan nomor WhatsApp pelanggan.
   * Catatan database: field ini akan digunakan sebagai identifikasi
   * pelanggan (foreign key) saat diintegrasikan ke tabel `customers`.
   */
  const [phone, setPhone] = useState('');

  const [notes, setNotes] = useState('');

  /**
   * STATE UTAMA: orderItems
   *
   * Berupa ARRAY of objects. Setiap objek = satu baris item.
   * Contoh isi state saat ada 2 item:
   *   [
   *     { productId: 'semeru-espresso', quantity: 2 },
   *     { productId: 'toraja-kalosi',   quantity: 1 },
   *   ]
   *
   * Dimulai dengan satu baris kosong agar form tidak tampak hampa.
   */
  const [orderItems, setOrderItems] = useState([
    { productId: '', quantity: 1 },
  ]);

  const [errors,      setErrors]      = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // ── Fungsi untuk menambah baris item baru ─────────────────
  /**
   * addItem
   * Menambahkan objek baris baru ke array orderItems.
   *
   * PENTING: Kita menggunakan spread operator [...prev, newRow]
   * bukan push(). Ini karena React butuh reference baru
   * agar bisa mendeteksi perubahan state.
   */
  const addItem = () => {
    setOrderItems(prev => [...prev, { productId: '', quantity: 1 }]);
  };

  // ── Fungsi untuk menghapus baris item ─────────────────────
  /**
   * removeItem
   * Menghapus baris pada index tertentu dari array.
   *
   * filter() membuat array baru yang hanya berisi elemen
   * yang index-nya BUKAN index yang ingin dihapus.
   *
   * @param {number} indexToRemove - index baris yang dihapus
   */
  const removeItem = (indexToRemove) => {
    setOrderItems(prev =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  // ── Fungsi untuk mengupdate nilai dalam satu baris ────────
  /**
   * updateItem
   * Mengubah satu field (productId atau quantity) pada baris tertentu.
   *
   * Cara kerjanya (immutable update pattern):
   *   1. map() menelusuri setiap elemen array
   *   2. Jika index elemen SAMA dengan index yang ingin diubah,
   *      buat objek baru: { ...item, [field]: value }
   *   3. Jika bukan index yang dimaksud, kembalikan item apa adanya
   *
   * Ini adalah cara "React-friendly" mengupdate array of objects.
   *
   * @param {number} index  - index baris yang diubah
   * @param {string} field  - nama property ('productId' atau 'quantity')
   * @param {any}    value  - nilai baru
   */
  const updateItem = (index, field, value) => {
    setOrderItems(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [field]: value }  // baris yang diubah: buat objek baru
          : item                          // baris lain: biarkan apa adanya
      )
    );
  };

  // ── Hitung total item & total harga ───────────────────────
  /**
   * totalQuantity
   * Menjumlahkan semua quantity menggunakan reduce().
   * reduce() seperti "akumulator" — mulai dari 0, tambah setiap quantity.
   */
  const totalQuantity = orderItems.reduce(
    (sum, item) => sum + Number(item.quantity), 0
  );

  /**
   * totalPrice
   * Menghitung total harga dengan mencari harga produk berdasarkan ID,
   * lalu mengalikan dengan quantity setiap baris.
   */
  const totalPrice = orderItems.reduce((sum, item) => {
    const product = PRODUCTS.find(p => p.id === item.productId);
    return sum + (product ? product.price * Number(item.quantity) : 0);
  }, 0);

  // ── Validasi ──────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!name.trim())  newErrors.name  = 'Nama wajib diisi.';
    if (!phone.trim()) newErrors.phone = 'Nomor WhatsApp wajib diisi.';
    const hasEmpty = orderItems.some(item => !item.productId);
    if (hasEmpty) newErrors.items = 'Pilih kopi untuk semua baris.';
    return newErrors;
  };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Data siap dikirim ke API / database
    const orderPayload = { name, phone, notes, items: orderItems, totalPrice };
    console.log('Data pesanan:', orderPayload);

    // TODO: ganti dengan fetch('/api/orders', { method: 'POST', body: JSON.stringify(orderPayload) })

    setIsSubmitted(true);
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <section className={styles.section} id="order">
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
            {PRODUCTS.map(p => (
              <li key={p.id}>
                {p.name} — {formatRupiah(p.price)}
              </li>
            ))}
          </ul>
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
                    onChange={e => setName(e.target.value)}
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
                    onChange={e => setPhone(e.target.value)}
                    className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                    placeholder="Contoh: 08123456789"
                    autoComplete="tel"
                  />
                  {errors.phone && <span className={styles.errorMsg}>{errors.phone}</span>}
                </div>

                {/* ── Daftar item pesanan (dinamis) ───────── */}
                <div className={styles.fieldGroup}>
                  <label className={styles.label}>
                    Pilihan Kopi <span className={styles.required}>*</span>
                  </label>

                  {/*
                    map() merender satu <div> baris per elemen dalam orderItems.
                    `item`  = objek pada index tersebut ({ productId, quantity })
                    `index` = posisi dalam array (0, 1, 2, ...)
                    `key`   = wajib diisi React agar bisa track perubahan list
                  */}
                  <div className={styles.itemsList}>
                    {orderItems.map((item, index) => (
                      <div key={index} className={styles.itemRow}>

                        {/* Dropdown pilih kopi (60% lebar) */}
                        <select
                          value={item.productId}
                          onChange={e =>
                            // updateItem dipanggil dengan index baris ini
                            // sehingga hanya baris ini yang berubah di state
                            updateItem(index, 'productId', e.target.value)
                          }
                          className={`${styles.input} ${styles.select} ${styles.selectFlex}`}
                          aria-label={`Produk baris ${index + 1}`}
                        >
                          <option value="">— Pilih kopi —</option>
                          {PRODUCTS.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>

                        {/* Input jumlah (20% lebar) */}
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={item.quantity}
                          onChange={e =>
                            updateItem(index, 'quantity', e.target.value)
                          }
                          className={`${styles.input} ${styles.qtyInput}`}
                          aria-label={`Jumlah baris ${index + 1}`}
                        />

                        {/* Tombol hapus baris (20% lebar) — disabled jika hanya 1 baris */}
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

                  {/* Tombol tambah baris baru */}
                  <button
                    type="button"
                    onClick={addItem}
                    className={styles.addItemBtn}
                  >
                    + Tambah Kopi
                  </button>
                </div>

                {/* ── Ringkasan pesanan ───────────────────── */}
                <div className={styles.summary}>
                  <span className={styles.summaryLabel}>
                    Total Item: <strong>{totalQuantity}</strong>
                  </span>
                  {totalPrice > 0 && (
                    <span className={styles.summaryPrice}>
                      {formatRupiah(totalPrice)}
                    </span>
                  )}
                </div>

                {/* Field: Alamat / Catatan */}
                <div className={styles.fieldGroup}>
                  <label htmlFor="notes" className={styles.label}>
                    Alamat & Catatan
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Alamat pengiriman atau catatan khusus..."
                    rows={3}
                  />
                </div>

                {/* Submit */}
                <button type="submit" className={styles.submitButton}>
                  Confirm Order
                </button>

              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

      </div>
    </section>
  );
};

export default OrderForm;
