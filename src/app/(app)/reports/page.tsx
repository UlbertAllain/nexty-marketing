"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { getStageLabel } from "@/components/status-badge";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { LEAD_STAGES } from "@/modules/leads/types";
import { useLeads, useLeadStats } from "@/modules/leads/hooks";
import { useTasks } from "@/modules/tasks/hooks";
import { useReferenceData } from "@/modules/reference/reference.hooks";
import dailyKpis from "@/data/seed/daily-kpi.json";
import weeklyReview from "@/data/seed/weekly-review.json";
import cashflow from "@/data/seed/cashflow.json";

type Tab = "live" | "daily" | "weekly" | "cashflow";

export default function ReportsPage() {
  const { items } = useLeads();
  const stats = useLeadStats(items);
  const { overdue, dueToday } = useTasks();
  const [tab, setTab] = useState<Tab>("live");
  const { data: liveDailyKpis } = useReferenceData("daily-kpis", dailyKpis);
  const { data: liveWeeklyReview } = useReferenceData("weekly-review", weeklyReview);
  const { data: liveCashflow } = useReferenceData("cashflow", cashflow);
  const total = Math.max(items.length, 1);

  return (
    <>
      <PageHeader eyebrow="Laporan" title="Lihat kondisi pemasaran secara ringkas" description="Gunakan perkembangan saat ini untuk melihat kondisi terbaru. Target, evaluasi mingguan, dan arus kas dipakai saat peninjauan, bukan untuk pekerjaan harian." />
      <div className="tool-tabs">
        <button className={tab === "live" ? "active" : ""} onClick={() => setTab("live")}>Perkembangan saat ini</button>
        <button className={tab === "daily" ? "active" : ""} onClick={() => setTab("daily")}>Target 30 hari</button>
        <button className={tab === "weekly" ? "active" : ""} onClick={() => setTab("weekly")}>Evaluasi mingguan</button>
        <button className={tab === "cashflow" ? "active" : ""} onClick={() => setTab("cashflow")}>Arus kas</button>
      </div>

      {tab === "live" ? <>
        <section className="stat-grid"><StatCard label="Total calon klien" value={items.length} /><StatCard label="Pertemuan" value={stats.meetings} /><StatCard label="Proposal" value={stats.proposals} /><StatCard label="Berhasil" value={stats.won} /></section>
        <section className="dashboard-grid reports-grid">
          <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Perkembangan</p><h2>Status calon klien</h2></div></div><div className="bar-list">{LEAD_STAGES.map((stage) => { const count = items.filter((lead) => lead.stage === stage).length; return <div className="bar-row" key={stage}><span>{getStageLabel(stage)}</span><div className="bar-track"><div style={{ width: `${(count / total) * 100}%` }} /></div><strong>{count}</strong></div>; })}</div></div>
          <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Kedisiplinan</p><h2>Kondisi tindak lanjut</h2></div></div><div className="large-metric"><strong>{overdue.length}</strong><span>tindak lanjut terlambat</span></div><div className="large-metric"><strong>{dueToday.length}</strong><span>jatuh tempo hari ini</span></div><p className="muted small">Target operasional: jumlah tindak lanjut yang terlambat kembali ke 0 setiap hari.</p></div>
        </section>
      </> : null}

      {tab === "daily" ? <section className="panel reference-page-panel"><div className="panel-heading"><div><p className="eyebrow">Target 30 hari</p><h2>Target harian dari Excel</h2></div><span className="muted small">Hasil aktual akan terisi dari aktivitas sistem setelah dipakai rutin.</span></div><div className="reference-table-shell"><table className="reference-table kpi-table"><thead><tr><th>Hari</th><th>Tanggal</th><th>Calon klien</th><th>Kontak awal</th><th>Tindak lanjut</th><th>Pertemuan</th><th>Konten</th><th>Mitra</th></tr></thead><tbody>{liveDailyKpis.map((row) => <tr key={row.id}><td>{row.Day}</td><td>{row.Date}</td><td>{row["Qualified Target"]}</td><td>{row["Outreach Target"]}</td><td>{row["Follow-up Target"]}</td><td>{row["Meeting Target"]}</td><td>{row["Content Published"] || "—"}</td><td>{row["Partner Contacts"] || "—"}</td></tr>)}</tbody></table></div></section> : null}

      {tab === "weekly" ? <section className="panel reference-page-panel"><RawSheetView data={liveWeeklyReview as RawSheet} intro="Perkembangan mingguan, pencapaian 30 hari, analisis calon klien yang tidak lanjut, dan percobaan A/B dari Excel ditampilkan di sini." /></section> : null}
      {tab === "cashflow" ? <section className="panel reference-page-panel"><RawSheetView data={liveCashflow as RawSheet} intro="Target uang masuk, nilai kontrak, dan simulasi pendapatan dari data Excel tetap tersimpan di sistem." /></section> : null}
    </>
  );
}
