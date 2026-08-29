"use client";
import { FormEvent, useState } from "react";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export function LoginScreen() {
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [resetBusy, setResetBusy] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault();
    if (!auth) {
      setError("Firebase belum disiapkan. Ikuti README.md terlebih dahulu.");
      return;
    }
    try {
      setBusy(true);
      setError("");
      setNotice("");
      await signInWithEmailAndPassword(auth, email.trim(), password);
      location.href = "/dashboard";
    } catch {
      setError(
        "Email atau kata sandi belum benar. Jika belum punya akun, minta admin membuatkannya di Firebase.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    if (!auth) {
      setError("Firebase belum disiapkan. Ikuti README.md terlebih dahulu.");
      return;
    }
    if (!email.trim()) {
      setError(
        "Masukkan email terlebih dahulu untuk mengirim tautan reset kata sandi.",
      );
      return;
    }
    try {
      setResetBusy(true);
      setError("");
      setNotice("");
      await sendPasswordResetEmail(auth, email.trim());
      setNotice(
        "Tautan untuk membuat kata sandi baru sudah dikirim ke email tersebut. Periksa kotak masuk atau folder spam.",
      );
    } catch {
      setError(
        "Email belum bisa dikirimi tautan reset. Periksa alamat email atau pengaturan Email/Password di Firebase.",
      );
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="brand-mark">N</div>
        <div>
          <p className="eyebrow">NEXTY LABS · INTERNAL</p>
          <h1>Hubungi calon klien tanpa kehilangan jejak.</h1>
          <p>
            Pesan sudah disiapkan, daftar yang belum dihubungi terlihat jelas,
            dan pengingat dibuat tanpa proses yang rumit.
          </p>
        </div>
        <small>Ruang kerja marketing · 2026</small>
      </section>
      <section className="login-panel">
        <form onSubmit={login} className="login-card">
          <span className="lock">
            <LockKeyhole size={19} />
          </span>
          <h2>Masuk ke ruang kerja</h2>
          <p>Gunakan email dan kata sandi akun marketing Nexty.</p>
          <label>
            <span className="label-with-icon">
              <Mail size={15} /> Email
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="nama@nexty.id"
              required
            />
          </label>
          <label>
            Kata sandi
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan kata sandi"
              required
            />
          </label>
          {notice && <div className="notice-box">{notice}</div>}
          {error && <div className="error-box">{error}</div>}
          <button disabled={busy}>
            {busy ? "Memproses…" : "Masuk"}
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            className="text-button"
            disabled={resetBusy}
            onClick={resetPassword}
          >
            {resetBusy ? "Mengirim tautan…" : "Lupa kata sandi?"}
          </button>
        </form>
      </section>
    </main>
  );
}
