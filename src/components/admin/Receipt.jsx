// 📌 [COMPONENT] Receipt: Template Struk Digital ala Thermal Printer POS.
// 🖨️ Menggunakan teknik CSS @media print agar hanya muncul di kertas cetak dan tidak terlihat di layar web biasa.

import './Receipt.css';

// ⚙️ [LOGIC] Helper untuk memformat angka menjadi Rupiah ringkas dan format tanggal/jam.
const rp = (num) => Number(num).toLocaleString('id-ID');

const formatDateTime = (date) => {
  const d = date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  const t = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  return `${d}  ${t}`;
};

// 🧩 [CHILD COMPONENT] PadLine: Mengatur teks agar sejajar rata kiri (nama) dan rata kanan (harga) layaknya struk fisik.
const PadLine = ({ left, right, bold = false }) => {
  const Tag = bold ? 'strong' : 'span';
  return (
    <div className="rcpt-line">
      <Tag className="rcpt-left">{left}</Tag>
      <Tag className="rcpt-right">{right}</Tag>
    </div>
  );
};

// 🧩 [CHILD COMPONENT] ReceiptCopy: Desain untuk satu lembar salinan struk transaksi.
// 🔄 Menerima seluruh data transaksi dari OrderForm menggunakan teknik Props Drilling.
const ReceiptCopy = ({
  copyLabel, nama, phone, orderType, tableNumber,
  paymentMethod, filledItems, products,
  subtotal, taxAmount, totalPrice, globalSettings, printedAt,
}) => (
  <div className="rcpt-wrapper">

    {/* 🖼️ [UI] Header Struk */}
    <div className="rcpt-center">
      <div className="rcpt-brand">BIMA COFFEE</div>
      <div className="rcpt-tagline">Specialty Coffee Roaster</div>
      <div className="rcpt-address">Lumajang, East Java</div>
    </div>

    <div className="rcpt-dashed" />

    {/* 📝 [UI] Info Transaksi & Kasir */}
    <div className="rcpt-meta">
      <div className="rcpt-date">{formatDateTime(printedAt)}</div>
      <PadLine left="Kasir" right="Admin" />
      <PadLine
        left="Tipe"
        right={orderType === 'DINE_IN' ? `Dine In — Meja ${tableNumber}` : 'Takeaway'}
      />
    </div>

    <div className="rcpt-dashed" />

    {/* 📝 [UI] Data Pelanggan */}
    <PadLine left="Pelanggan" right={nama || '—'} />
    <PadLine left="WA" right={phone || '—'} />

    <div className="rcpt-dashed" />

    {/* 🔄 [RENDER] Looping Daftar Pesanan */}
    <div className="rcpt-section-label">PESANAN</div>
    {filledItems.map((item, i) => {
      const prod = products.find(p => p.id === item.productId);
      const qty = Number(item.quantity);
      const harga = prod ? prod.price : 0;
      const lineTotal = harga * qty;
      return (
        <div key={i} className="rcpt-item">
          <div className="rcpt-item-name">{prod?.name ?? item.productId}</div>
          <PadLine left={`  ${qty} x Rp ${rp(harga)}`} right={`Rp ${rp(lineTotal)}`} />
        </div>
      );
    })}

    <div className="rcpt-dashed" />

    {/* 💰 [UI] Kalkulasi Total Akhir */}
    <PadLine left="Subtotal" right={`Rp ${rp(subtotal)}`} />
    {globalSettings?.pajak_aktif && (
      <PadLine left={`PPN ${globalSettings.pajak_persen ?? 11}%`} right={`Rp ${rp(taxAmount)}`} />
    )}

    <div className="rcpt-dashed-bold" />

    <PadLine left="TOTAL" right={`Rp ${rp(totalPrice)}`} bold />

    <div className="rcpt-dashed" />

    {/* 💳 [UI] Info Pembayaran */}
    <PadLine left="Metode Bayar" right={paymentMethod} />
    {paymentMethod === 'CASH' && <PadLine left="Kembalian" right="—" />}

    <div className="rcpt-dashed" />

    {/* 🖼️ [UI] Footer Struk */}
    <div className="rcpt-center">
      <div className="rcpt-thankyou">Terima kasih telah</div>
      <div className="rcpt-thankyou">mampir ke Bima Coffee ☕</div>
      <div className="rcpt-footer-note">Struk ini berlaku sebagai bukti pembayaran</div>
    </div>

    <div className="rcpt-copy-label">{copyLabel}</div>

  </div>
);

// 🧩 [MAIN COMPONENT] Komponen Induk untuk merender 2 salinan (Pelanggan & Dapur) dalam satu halaman cetak.
const Receipt = (props) => {
  const printedAt = new Date();

  return (
    // 🖨️ [UI] ID 'receipt-print-area' ini yang ditangkap oleh CSS khusus @media print
    <div id="receipt-print-area" aria-hidden="true">

      <ReceiptCopy {...props} copyLabel="— STRUK PELANGGAN —" printedAt={printedAt} />

      {/* Garis Potong Kertas */}
      <div className="rcpt-cut-line">
        <span>✂ ─────────────────── POTONG DI SINI ─────────────────── ✂</span>
      </div>

      <ReceiptCopy {...props} copyLabel="— SALINAN DAPUR —" printedAt={printedAt} />

    </div>
  );
};

export default Receipt;