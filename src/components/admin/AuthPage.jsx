// 📌 [COMPONENT] AuthPage: Halaman Login Admin.
// 🔒 Fitur Register sengaja dihilangkan. Admin baru hanya bisa ditambahkan via Supabase Dashboard demi keamanan.

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import styles from './AuthPage.module.css';

const AuthPage = ({ navigateTo }) => {

  // 📌 [STATE] Kredensial input pengguna.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 📌 [STATE] Mencegah tombol login diklik berulang kali saat sistem sedang memproses (Double Submit).
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 📌 [STATE] Menyimpan pesan error dari Supabase untuk ditampilkan ke layar (misal: "Invalid credentials").
  const [errorMessage, setErrorMessage] = useState('');

  // 🚀 [FETCH] Menangani proses login menggunakan metode bawaan Supabase Auth.
  const handleAuth = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // 🚀 [FETCH] Mencocokkan data dengan tabel auth.users di Supabase. Jika valid, session token otomatis tersimpan.
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setErrorMessage(error.message);
      } else {
        // 🧭 [ROUTING] Login sukses, arahkan langsung ke Dashboard Admin.
        navigateTo('admin');
      }
    } catch (err) {
      // ⚙️ [LOGIC] Fallback jika terjadi error di luar Supabase (contoh: koneksi internet terputus).
      setErrorMessage('Terjadi kesalahan. Periksa koneksi internet Anda.');
    } finally {
      // ⚙️ [LOGIC] Blok finally selalu dieksekusi untuk mematikan status loading, apapun hasil akhirnya (sukses/gagal).
      setIsSubmitting(false);
    }
  };

  return (
    <section className={styles.authContainer}>

      {/* 🧭 [ROUTING] Tombol kembali ke Landing Page */}
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigateTo('landing')}
        aria-label="Kembali ke beranda"
      >
        ← Return to Roastery
      </button>

      {/* 🎨 [ANIMATION] Form login melayang dengan efek brutalist */}
      <motion.div
        className={styles.authForm}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.cardHeader}>
          <span className={styles.eyebrow}>Bima Coffee · Admin Portal</span>
          <h1 className={styles.brandTitle}>
            System<br />Access
          </h1>
          <p className={styles.subtitle}>Authorized Personnel Only</p>
        </div>

        <div className={styles.divider} />

        <form className={styles.formGroup} onSubmit={handleAuth} noValidate>
          <div className={styles.inputWrap}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // ⚙️ [LOGIC] Bersihkan error lama segera setelah user mencoba mengetik ulang.
                setErrorMessage('');
              }}
              className={styles.inputField}
              placeholder="admin@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.inputWrap}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMessage('');
              }}
              className={styles.inputField}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/* 🖼️ [UI] Area pesan error (hanya muncul jika state errorMessage terisi) */}
          {errorMessage && (
            <p className={styles.errorMsg}>
              ⚠ {errorMessage}
            </p>
          )}

          {/* ⚙️ [LOGIC] Tombol dilumpuhkan (disabled) selama proses fetch untuk mencegah spam klik */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'PROCESSING...' : 'AUTHENTICATE'}
          </button>
        </form>

        <div className={styles.statusLine}>
          <span className={styles.statusDot} />
          <span className={styles.statusText}>
            {isSubmitting ? 'Verifying credentials...' : 'Secure connection established'}
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default AuthPage;