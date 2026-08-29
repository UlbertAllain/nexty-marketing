"use client";

import { type FormEvent, useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

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
      setError("Email atau kata sandi belum benar. Periksa kembali akun marketing.");
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
      setError("Masukkan email terlebih dahulu untuk mengirim tautan reset kata sandi.");
      return;
    }

    try {
      setResetBusy(true);
      setError("");
      setNotice("");
      await sendPasswordResetEmail(auth, email.trim());
      setNotice("Tautan untuk membuat kata sandi baru sudah dikirim. Periksa kotak masuk atau folder spam.");
    } catch {
      setError("Tautan reset belum bisa dikirim. Periksa alamat email dan konfigurasi Firebase.");
    } finally {
      setResetBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story">
        <div className="login-story-top">
          <div className="brand-mark">N</div>
          <span>MARKETING DESK · INTERNAL</span>
        </div>
        <div className="login-copy">
          <p className="eyebrow">NEXTY LABS</p>
          <h1>Follow-up rapi. Kerja tetap ringan.</h1>
          <p>
            Satu tempat untuk calon klien, pesan WhatsApp, dan pengingat—tanpa
            mengubah pekerjaan sederhana menjadi CRM yang ribet.
          </p>
        </div>
        <div className="login-principles">
          <span>01 · Lihat prioritas</span>
          <span>02 · Hubungi</span>
          <span>03 · Catat hasil</span>
        </div>
      </section>

      <section className="login-panel">
        <form onSubmit={login} className="login-card">
          <span className="lock">
            <LockKeyhole size={19} />
          </span>
          <div className="login-heading">
            <span className="eyebrow">AKSES INTERNAL</span>
            <h2>Masuk ke ruang kerja</h2>
            <p>Gunakan akun marketing Nexty.</p>
          </div>

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
