"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { seedWorkspace } from "@/features/settings/seed";
import coverage from "@/data/seed/excel-coverage.json";

export default function SettingsPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function seed() {
    if (!window.confirm("Sinkronkan seluruh data Excel terbaru ke Firestore? Data riset/template akan diperbarui, tetapi progress CRM lead yang sudah berjalan tidak akan di-reset.")) return;
    setBusy(true); setStatus("");
    try {
      const result = await seedWorkspace();
      setStatus(`Selesai: ${result.sheets} sheet, ${result.leads} lead, ${result.prospects} prospect, ${result.socialProfiles} profil sosial, ${result.researchQueue} research item, ${result.dailyKpis} KPI harian, dan ${result.researchSources} sumber.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal melakukan sinkronisasi.");
    } finally {
      setBusy(false);
    }
  }

  const totalCells = coverage.reduce((sum, item) => sum + item.nonEmptyCells, 0);

  return (
    <>
      <PageHeader
        eyebrow="Workspace"
        title="Settings & data Excel"
        description="Excel sekarang menjadi sumber awal data. Sistem menyimpan versi terstruktur untuk workflow dan snapshot mentah untuk memastikan tidak ada data yang hilang."
      />
      <div className="settings-grid">
        <section className="panel setting-card">
          <Database size={20} />
          <div>
            <h2>Sinkronkan seluruh workbook</h2>
            <p>Import semua 18 sheet dari Excel terbaru. Lead/prospect dipakai sebagai data operasional, sedangkan planning/reference tetap tersimpan di sistem sebagai source-of-truth.</p>
          </div>
          <Button onClick={seed} disabled={busy}>{busy ? "Menyinkronkan…" : "Sinkronkan Excel"}</Button>
          {status ? <p className="setting-status">{status}</p> : null}
        </section>

        <section className="panel setting-card">
          <ShieldCheck size={20} />
          <div><h2>Akses single-user</h2><p>Gunakan Firebase Email/Password untuk akun marketing. Firestore Rules pada repo mewajibkan user terautentikasi.</p></div>
        </section>

        <section className="panel full-setting">
          <div className="panel-heading">
            <div><p className="eyebrow">Excel parity</p><h2>Semua sheet sudah punya tujuan di sistem</h2></div>
            <div className="page-actions"><span className="coverage-pill"><CheckCircle2 size={14} />18 / 18 mapped</span><Link className="button secondary compact" href="/data-vault">Buka Data Vault</Link></div>
          </div>
          <p className="muted small">Total {totalCells.toLocaleString("id-ID")} sel non-kosong dipertahankan dalam layer snapshot. Data yang dipakai sehari-hari juga dinormalisasi agar UI tidak berubah menjadi Excel versi web.</p>
          <div className="coverage-grid">
            {coverage.map((item) => (
              <div className="coverage-row" key={item.sheet}>
                <div><strong>{item.sheet}</strong><span>{item.range}</span></div>
                <div><span>Masuk ke</span><strong>{item.destination}</strong></div>
                <div><span>Data</span><strong>{item.nonEmptyCells} sel</strong></div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel full-setting">
          <div><h2>Otomatisasi chat</h2><p>Untuk WhatsApp cold outreach, sistem membuka WhatsApp dengan pesan yang sudah dipersonalisasi. Setelah benar-benar dikirim, klik “Tandai terkirim”; sistem otomatis mengubah stage dan membuat follow-up D+2 / D+5. Instagram/TikTok/Facebook/LinkedIn ditampilkan sebagai channel shortcut dan template tetap bisa dicopy.</p><p className="muted small">Direct-send WhatsApp tanpa klik Send memerlukan WhatsApp Business Cloud API resmi dan approval template. Belum dipaksakan ke V1 agar flow tetap aman dan mudah.</p></div>
        </section>
      </div>
    </>
  );
}
