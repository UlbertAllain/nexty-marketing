"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Database, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { seedWorkspace } from "@/modules/settings/seed";
import { useReferenceData } from "@/modules/reference/reference.hooks";
import { toIndonesianMarketingCopy } from "@/modules/leads/copy";
import coverage from "@/data/seed/excel-coverage.json";

export default function SettingsPage() {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: liveCoverage } = useReferenceData("excel-coverage", coverage);

  async function seed() {
    if (!window.confirm("Sinkronkan seluruh data Excel terbaru ke Firestore? Data riset dan contoh pesan akan diperbarui, tetapi perkembangan calon klien yang sudah berjalan tidak akan direset.")) return;
    setBusy(true); setStatus("");
    try {
      const result = await seedWorkspace();
      setStatus(`Selesai: ${result.sheets} lembar, ${result.leads} calon klien, ${result.prospects} prospek riset, ${result.socialProfiles} profil media sosial, ${result.researchQueue} data riset, ${result.dailyKpis} target harian, dan ${result.researchSources} sumber.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Gagal melakukan sinkronisasi.");
    } finally {
      setBusy(false);
    }
  }

  const totalCells = liveCoverage.reduce((sum, item) => sum + item.nonEmptyCells, 0);

  return (
    <>
      <PageHeader
        eyebrow="Pengaturan"
        title="Pengaturan sistem & data"
        description="Bagian ini untuk administrator atau pengelola sistem. Tim pemasaran sehari-hari tidak perlu membuka halaman ini."
      />
      <div className="settings-grid">
        <section className="panel setting-card">
          <Database size={20} />
          <div>
            <h2>Sinkronkan seluruh data Excel</h2>
            <p>Masukkan semua 18 lembar dari Excel terbaru. Data calon klien dipakai untuk pekerjaan harian, sedangkan rencana dan data acuan tetap tersimpan sebagai sumber data utama.</p>
          </div>
          <Button onClick={seed} disabled={busy}>{busy ? "Menyinkronkan…" : "Sinkronkan Excel"}</Button>
          {status ? <p className="setting-status">{status}</p> : null}
        </section>

        <section className="panel setting-card">
          <ShieldCheck size={20} />
          <div><h2>Akses satu pengguna</h2><p>Gunakan email dan kata sandi Firebase untuk akun pemasaran. Aturan keamanan Firestore mewajibkan pengguna sudah masuk.</p></div>
        </section>

        <section className="panel full-setting">
          <div className="panel-heading">
            <div><p className="eyebrow">Kesesuaian data Excel</p><h2>Semua lembar sudah punya tujuan di sistem</h2></div>
            <div className="page-actions"><span className="coverage-pill"><CheckCircle2 size={14} />18 / 18 terpetakan</span><Link className="button secondary compact" href="/data-vault">Buka data sumber</Link></div>
          </div>
          <p className="muted small">Total {totalCells.toLocaleString("id-ID")} sel non-kosong tetap disimpan sebagai salinan sumber. Data yang dipakai sehari-hari dirapikan agar tampilan tidak berubah menjadi Excel versi web.</p>
          <div className="coverage-grid">
            {liveCoverage.map((item) => (
              <div className="coverage-row" key={item.sheet}>
                <div><strong>{item.sheet}</strong><span>{item.range}</span></div>
                <div><span>Masuk ke</span><strong>{toIndonesianMarketingCopy(item.destination)}</strong></div>
                <div><span>Data</span><strong>{item.nonEmptyCells} sel</strong></div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel full-setting">
          <div><h2>Otomatisasi pesan</h2><p>Untuk pendekatan awal lewat WhatsApp, sistem membuka WhatsApp dengan pesan yang sudah disiapkan. Setelah benar-benar dikirim, klik “Tandai terkirim”; sistem otomatis memperbarui status dan membuat jadwal tindak lanjut H+2 / H+5. Tautan Instagram, TikTok, Facebook, dan LinkedIn tetap tersedia sebagai jalan pintas.</p><p className="muted small">Pengiriman WhatsApp secara langsung tanpa menekan tombol kirim memerlukan WhatsApp Business Cloud API resmi dan persetujuan template. Fitur itu belum dipaksakan agar alurnya tetap aman dan sederhana.</p></div>
        </section>
      </div>
    </>
  );
}
