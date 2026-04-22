/**
 * AuthPage.jsx
 *
 * Halaman Login Admin — Bima Coffee
 *
 * Konsep React & Keamanan untuk Laporan RPL:
 *   1. async/await   — menunggu respons API Supabase tanpa membekukan UI
 *   2. try/catch     — menangani error: email salah, password salah, dll
 *   3. finally       — memastikan loading SELALU dimatikan setelah proses selesai
 *   4. Supabase Auth — signInWithPassword(email, password) untuk autentikasi
 *
 * Catatan Keamanan (untuk laporan):
 *   Fitur Register sengaja dihapus dari UI ini.
 *   Pembuatan akun admin hanya bisa dilakukan melalui Supabase Dashboard
 *   (Authentication → Users → Invite User) agar tidak sembarangan orang
 *   bisa membuat akun admin secara mandiri.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../supabaseClient';
import styles from './AuthPage.module.css';

const AuthPage = ({ navigateTo }) => {

  // ─────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────

  // Nilai input form — terhubung ke value dan onChange setiap <input>
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');

  /**
   * isSubmitting — true saat menunggu respons dari Supabase
   * Menonaktifkan tombol login agar tidak bisa diklik dua kali (double submit).
   */
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * errorMessage — menyimpan pesan error dari Supabase (jika login gagal)
   * Contoh pesan: "Invalid login credentials" → tampil sebagai teks merah.
   */
  const [errorMessage, setErrorMessage] = useState('');

  // ─────────────────────────────────────────────────────────────
  // FUNGSI LOGIN
  // ─────────────────────────────────────────────────────────────

  /**
   * handleAuth — dijalankan saat form di-submit
   *
   * Alur:
   *   1. Cegah reload halaman
   *   2. Aktifkan loading, kosongkan error lama
   *   3. Panggil supabase.auth.signInWithPassword()
   *   4. Berhasil → pindah ke Admin Dashboard
   *   5. Gagal    → tampilkan pesan error
   *   6. Matikan loading (selalu, via finally)
   */
  const handleAuth = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // ── Pemanggilan API Supabase ───────────────────────────
      // signInWithPassword() mencocokkan email & password dengan
      // data di tabel auth.users milik Supabase.
      // Jika cocok, Supabase mengembalikan session token secara otomatis.
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        // Login gagal — tampilkan pesan error dari Supabase
        setErrorMessage(error.message);
      } else {
        // Login berhasil — arahkan ke halaman Admin Dashboard
        navigateTo('admin');
      }

    } catch (err) {
      // Tangkap error tak terduga (misal: tidak ada koneksi internet)
      setErrorMessage('Terjadi kesalahan. Periksa koneksi internet Anda.');

    } finally {
      // finally selalu berjalan, baik login berhasil maupun gagal
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <section className={styles.authContainer}>
      {/* Efek dekorasi cahaya tipis di background */}
      <div className={styles.ambientLight}></div>

      {/* Card login dengan animasi masuk dari bawah */}
      <motion.div
        className={styles.authCard}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.brandTitle}>Bima Coffee</h1>
          <p className={styles.subtitle}>Masuk ke panel admin</p>
        </div>

        {/* Form Login */}
        <form className={styles.formGroup} onSubmit={handleAuth}>

          <div className={styles.inputWrap}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMessage(''); // bersihkan error saat user mengetik ulang
              }}
              className={styles.inputField}
              placeholder="admin@email.com"
              required
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
                setErrorMessage(''); // bersihkan error saat user mengetik ulang
              }}
              className={styles.inputField}
              placeholder="••••••••"
              required
            />
          </div>

          {/*
            Pesan Error dari Supabase
            Hanya muncul jika errorMessage tidak kosong.
            ⚠ sebagai penanda visual agar mudah diperhatikan.
          */}
          {errorMessage && (
            <p style={{
              fontFamily: 'Inter, sans-serif',
              fontSize:   '0.75rem',
              color:      '#ff6b6b',
              margin:     '0 0 0.75rem 0',
              letterSpacing: '0.02em',
              lineHeight: '1.5',
            }}>
              ⚠ {errorMessage}
            </p>
          )}

          {/*
            Tombol Submit
            disabled saat isSubmitting = true → mencegah double-click
            Teks berubah menjadi "MEMPROSES..." sebagai feedback visual ke user
          */}
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
            style={{
              opacity: isSubmitting ? 0.6 : 1,
              cursor:  isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'MEMPROSES...' : 'MASUK'}
          </button>
        </form>

        {/* Tombol kembali ke halaman utama */}
        <div className={styles.toggleWrap}>
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
