"use client";

import { FormEvent, useEffect, useState } from "react";
import { BarChart3, CheckCircle2, Search, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/modules/auth/auth-context";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch {
      setError("Email atau password salah. Coba periksa lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-shell">
        <aside className="login-hero">
          <div className="login-hero-brand">
            <div className="brand-mark">N</div>
            <strong className="brand-wordmark">Nexty<span>Leads</span></strong>
          </div>

          <div className="login-hero-copy">
            <p className="eyebrow">Untuk tim marketing NextyLabs</p>
            <h1>Lebih banyak peluang untuk pertumbuhan Anda.</h1>
            <p>
              Temukan calon klien, bangun koneksi, dan capai target lebih cepat
              dengan data yang lebih terstruktur.
            </p>
          </div>

          <div className="login-benefits">
            <div><Search size={16} /><span>Temukan calon klien potensial</span></div>
            <div><Sparkles size={16} /><span>Analisis kebutuhan dengan AI</span></div>
            <div><CheckCircle2 size={16} /><span>Tindak lanjut lebih terarah</span></div>
          </div>

          <div className="login-visual" aria-hidden="true">
            <div className="login-visual-card login-visual-card-main">
              <div className="login-visual-icon"><BarChart3 size={18} /></div>
              <div>
                <span>Peluang minggu ini</span>
                <strong>+28%</strong>
              </div>
            </div>
            <div className="login-visual-card login-visual-card-small">
              <span>Kandidat baru</span>
              <strong>15</strong>
            </div>
          </div>
        </aside>

        <div className="login-form-pane">
          <div className="login-form-content">
            <div className="login-form-head">
              <p className="eyebrow">Selamat datang kembali</p>
              <h2>Masuk ke NextyLeads</h2>
              <p>Masuk untuk melanjutkan pencarian dan pengelolaan calon klien.</p>
            </div>

            <form onSubmit={onSubmit} className="login-form">
              <label className="field">
                <span>Email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@nextylabs.id"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Password</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </label>
              {error ? <p className="form-error">{error}</p> : null}
              <Button type="submit" disabled={busy}>{busy ? "Sedang masuk…" : "Masuk"}</Button>
            </form>

            <p className="login-security-note">
              Akses internal NextyLabs. Gunakan akun yang sudah terdaftar.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
