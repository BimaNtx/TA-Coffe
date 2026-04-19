/**
 * AuthPage.jsx
 *
 * Halaman Autentikasi (Login & Register) berdesain premium.
 *
 * Konsep React untuk Laporan RPL:
 *   1. useState (Boolean) — mengontrol state toggle "Login" atau "Register"
 *   2. Conditional Rendering — mengubah form input dan judul berdasarkan state
 *   3. Event Handler — e.preventDefault() menangani submit formulir
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AuthPage.module.css';

const AuthPage = ({ navigateTo }) => {
  /**
   * STATE TOGGLE: isLogin
   *
   * Bernilai 'true'  -> Menampilkan form masuk (Login)
   * Bernilai 'false' -> Menampilkan form daftar (Register)
   * State ini akan dibalik nilainya saat user mengklik teks di bagian bawah.
   */
  const [isLogin, setIsLogin] = useState(true);

  // State untuk data input form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * handleAuth
   * Mencegah halaman reload saat form dikirimkan (default behavior form HTML),
   * lalu menampilkan alert dummy sebagai simulasi sukses.
   */
  const handleAuth = (e) => {
    e.preventDefault();
    // Simulasi login sukses: langsung pindah ke halaman Admin Dashboard
    // Nanti ganti dengan validasi username + password dari Supabase
    navigateTo('admin');
  };

  return (
    <section className={styles.authContainer}>
      {/* Efek dekorasi cahaya tipis di background */}
      <div className={styles.ambientLight}></div>

      {/* Wrapper form dengan animasi masuk */}
      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={styles.cardHeader}>
          <h1 className={styles.brandTitle}>Bima Coffee</h1>
          <p className={styles.subtitle}>
            {isLogin ? 'Masuk ke akun Anda' : 'Bergabunglah bersama kami'}
          </p>
        </div>

        {/* 
          AnimatePresence + motion.form memungkinkan animasi transisi 
          saat form berubah dari Login ke Register 
        */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isLogin ? 'login' : 'register'}
            className={styles.formGroup}
            onSubmit={handleAuth}
            initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Input Nama (Hanya tampil di mode Register) */}
            {!isLogin && (
              <div className={styles.inputWrap}>
                <label htmlFor="name" className={styles.label}>Nama Lengkap</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.inputField}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>
            )}

            <div className={styles.inputWrap}>
              <label htmlFor="email" className={styles.label}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className={styles.inputWrap}>
              <label htmlFor="password" className={styles.label}>Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              {isLogin ? 'MASUK' : 'DAFTAR'}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className={styles.toggleWrap}>
          {/* 
            Bagian Toggle Mode
            Mengubah nilai isLogin ke kebalikannya (!isLogin) saat teks diklik.
          */}
          <p className={styles.toggleText}>
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Buat di sini.' : 'Masuk di sini.'}
            </button>
          </p>
          {/* Kembali ke halaman utama tanpa login */}
          <button
            type="button"
            className={styles.toggleBtn}
            style={{ marginTop: '0.75rem', display: 'block', width: '100%', opacity: 0.5 }}
            onClick={() => navigateTo('landing')}
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </motion.div>
    </section>
  );
};

export default AuthPage;
