/**
 * AuthPage.jsx
 *
 * Halaman Login Admin — Bima Coffee
 * Visual: "Brutalist Security Gate" — tajam, minimalis, tipografi agresif.
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
import { supabase } from '../../supabaseClient';
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

      {/* ── Back-to-home — fixed top-left text link, like FullCatalogView ── */}
      <button
        type="button"
        className={styles.backLink}
        onClick={() => navigateTo('landing')}
        aria-label="Kembali ke beranda"
      >
        ← Return to Roastery
      </button>

      {/* ── Form: free-floating, no card wrapper ── */}
      <motion.div
        className={styles.authForm}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── Header ── */}
        <div className={styles.cardHeader}>
          <span className={styles.eyebrow}>Bima Coffee · Admin Portal</span>
          <h1 className={styles.brandTitle}>
            System<br />Access
          </h1>
          <p className={styles.subtitle}>Authorized Personnel Only</p>
        </div>

        {/* Thin divider between header and form */}
        <div className={styles.divider} />

        {/* ── Login Form ── */}
        <form className={styles.formGroup} onSubmit={handleAuth} noValidate>

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
                setErrorMessage(''); // bersihkan error saat user mengetik ulang
              }}
              className={styles.inputField}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {/*
            Pesan Error dari Supabase
            Hanya muncul jika errorMessage tidak kosong.
            ⚠ sebagai penanda visual agar mudah diperhatikan.
          */}
          {errorMessage && (
            <p className={styles.errorMsg}>
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
          >
            {isSubmitting ? 'PROCESSING...' : 'AUTHENTICATE'}
          </button>
        </form>

        {/* ── Bottom status indicator ── */}
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
