/**
 * Receipt.jsx — Komponen Struk Digital Thermal Style
 *
 * Konsep untuk Laporan RPL:
 *   1. Props drilling     — semua data pesanan diterima dari OrderForm via props
 *   2. @media print CSS  — elemen di luar struk disembunyikan saat cetak
 *   3. window.print()    — API browser native untuk memicu dialog cetak
 *   4. Double copy       — render komponen 2× dalam satu halaman (Pelanggan + Dapur)
 *
 * Desain mengikuti standar struk thermal POS seperti Moka / Majoo:
 *   - Lebar terbatas (58–80mm setara)
 *   - Font monospace untuk alignment harga
 *   - Garis putus-putus sebagai separator
 */

import './Receipt.css';

// ─────────────────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────────────────

/** Format angka ke Rupiah tanpa simbol panjang: 85000 → "85.000" */
const rp = (num) => Number(num).toLocaleString('id-ID');

/** Format tanggal/jam dari Date object */
const formatDateTime = (date) => {
  const d = date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const t = date.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
  return `${d}  ${t}`;
};

/**
 * padLine — membuat satu baris dengan teks kiri & kanan yang sejajar
 * menggunakan karakter spasi agar terlihat rata seperti struk fisik.
 *
 * @param {string} left  - teks di kiri (nama item)
 * @param {string} right - teks di kanan (harga)
 * @param {number} total - total karakter per baris (default 32)
 */
const PadLine = ({ left, right, bold = false }) => {
  const Tag = bold ? 'strong' : 'span';
  return (
    <div className="rcpt-line">
      <Tag className="rcpt-left">{left}</Tag>
      <Tag className="rcpt-right">{right}</Tag>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// SATU SALINAN STRUK
// ─────────────────────────────────────────────────────────────

/**
 * ReceiptCopy — satu salinan struk (dirender 2× untuk Pelanggan & Dapur)
 *
 * @prop {string}   copyLabel     — "STRUK PELANGGAN" atau "SALINAN DAPUR"
 * @prop {string}   nama          — nama pelanggan
 * @prop {string}   phone         — nomor WA
 * @prop {string}   orderType     — 'DINE_IN' | 'TAKEAWAY'
 * @prop {string}   tableNumber   — nomor meja (jika Dine In)
 * @prop {string}   paymentMethod — metode pembayaran
 * @prop {Array}    filledItems   — array { productId, quantity }
 * @prop {Array}    products      — daftar produk untuk resolve nama & harga
 * @prop {number}   subtotal      — subtotal sebelum pajak
 * @prop {number}   taxAmount     — jumlah pajak
 * @prop {number}   totalPrice    — total akhir
 * @prop {object}   globalSettings— { pajak_aktif, pajak_persen }
 * @prop {Date}     printedAt     — waktu cetak
 */
const ReceiptCopy = ({
  copyLabel, nama, phone, orderType, tableNumber,
  paymentMethod, filledItems, products,
  subtotal, taxAmount, totalPrice, globalSettings, printedAt,
}) => (
  <div className="rcpt-wrapper">

    {/* ── HEADER ── */}
    <div className="rcpt-center">
      <div className="rcpt-brand">BIMA COFFEE</div>
      <div className="rcpt-tagline">Specialty Coffee Roaster</div>
      <div className="rcpt-address">Lumajang, East Java</div>
    </div>

    <div className="rcpt-dashed" />

    {/* ── INFO TRANSAKSI ── */}
    <div className="rcpt-meta">
      <div className="rcpt-date">{formatDateTime(printedAt)}</div>
      <PadLine left="Kasir" right="Admin" />
      <PadLine
        left="Tipe"
        right={orderType === 'DINE_IN' ? `Dine In — Meja ${tableNumber}` : 'Takeaway'}
      />
    </div>

    <div className="rcpt-dashed" />

    {/* ── DATA PELANGGAN ── */}
    <PadLine left="Pelanggan" right={nama || '—'} />
    <PadLine left="WA" right={phone || '—'} />

    <div className="rcpt-dashed" />

    {/* ── DAFTAR ITEM ── */}
    <div className="rcpt-section-label">PESANAN</div>
    {filledItems.map((item, i) => {
      const prod    = products.find(p => p.id === item.productId);
      const qty     = Number(item.quantity);
      const harga   = prod ? prod.price : 0;
      const lineTotal = harga * qty;
      return (
        <div key={i} className="rcpt-item">
          <div className="rcpt-item-name">{prod?.name ?? item.productId}</div>
          <PadLine
            left={`  ${qty} x Rp ${rp(harga)}`}
            right={`Rp ${rp(lineTotal)}`}
          />
        </div>
      );
    })}

    <div className="rcpt-dashed" />

    {/* ── KALKULASI HARGA ── */}
    <PadLine left="Subtotal" right={`Rp ${rp(subtotal)}`} />
    {globalSettings?.pajak_aktif && (
      <PadLine
        left={`PPN ${globalSettings.pajak_persen ?? 11}%`}
        right={`Rp ${rp(taxAmount)}`}
      />
    )}

    <div className="rcpt-dashed-bold" />

    <PadLine left="TOTAL" right={`Rp ${rp(totalPrice)}`} bold />

    <div className="rcpt-dashed" />

    {/* ── PEMBAYARAN ── */}
    <PadLine left="Metode Bayar" right={paymentMethod} />
    {paymentMethod === 'CASH' && (
      <PadLine left="Kembalian" right="—" />
    )}

    <div className="rcpt-dashed" />

    {/* ── FOOTER ── */}
    <div className="rcpt-center">
      <div className="rcpt-thankyou">Terima kasih telah</div>
      <div className="rcpt-thankyou">mampir ke Bima Coffee ☕</div>
      <div className="rcpt-footer-note">Struk ini berlaku sebagai bukti pembayaran</div>
    </div>

    {/* ── LABEL SALINAN ── */}
    <div className="rcpt-copy-label">{copyLabel}</div>

  </div>
);

// ─────────────────────────────────────────────────────────────
// KOMPONEN UTAMA: Receipt (double copy)
// ─────────────────────────────────────────────────────────────

/**
 * Receipt — merender DUA salinan struk sekaligus dalam satu halaman cetak.
 * Elemen ini tersembunyi saat tampil di layar (display:none),
 * dan baru muncul saat browser dalam mode @media print.
 *
 * Cara kerja:
 *   - `id="receipt-print-area"` dipakai sebagai selektor di CSS print
 *   - Dua <ReceiptCopy> dipisah oleh garis pemotong (cut line)
 */
const Receipt = (props) => {
  const printedAt = new Date();

  return (
    <div id="receipt-print-area" aria-hidden="true">

      {/* Salinan 1 — untuk Pelanggan */}
      <ReceiptCopy {...props} copyLabel="— STRUK PELANGGAN —" printedAt={printedAt} />

      {/* Garis pemotong antar salinan */}
      <div className="rcpt-cut-line">
        <span>✂ ─────────────────── POTONG DI SINI ─────────────────── ✂</span>
      </div>

      {/* Salinan 2 — untuk Dapur / Kasir */}
      <ReceiptCopy {...props} copyLabel="— SALINAN DAPUR —" printedAt={printedAt} />

    </div>
  );
};

export default Receipt;
