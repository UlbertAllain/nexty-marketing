"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
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
      <section className="login-card">
        <div className="login-brand-row">
          <div className="brand-mark">N</div>
          <div>
            <strong>NextyLeads</strong>
            <span>Marketing workspace</span>
          </div>
        </div>

        <div className="login-intro">
          <p className="eyebrow">NextyLabs Internal</p>
          <h1>Masuk ke workspace marketing</h1>
          <p className="muted">Kelola lead, follow-up, dan progress marketing dari satu tempat.</p>
        </div>

        <form onSubmit={onSubmit} className="stack-lg">
          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" placeholder="nama@nextylabs.id" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" autoComplete="current-password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <Button type="submit" disabled={busy}>{busy ? "Sedang masuk…" : "Masuk"}</Button>
        </form>
      </section>
    </main>
  );
}
