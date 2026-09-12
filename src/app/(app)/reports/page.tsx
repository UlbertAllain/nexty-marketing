"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { LEAD_STAGES } from "@/features/leads/types";
import { useLeads, useLeadStats } from "@/features/leads/hooks";
import { useTasks } from "@/features/tasks/hooks";
import dailyKpis from "@/data/seed/daily-kpi.json";
import weeklyReview from "@/data/seed/weekly-review.json";
import cashflow from "@/data/seed/cashflow.json";

type Tab = "live" | "daily" | "weekly" | "cashflow";

export default function ReportsPage() {
  const { items } = useLeads();
  const stats = useLeadStats(items);
  const { overdue, dueToday } = useTasks();
  const [tab, setTab] = useState<Tab>("live");
  const total = Math.max(items.length, 1);

  return (
    <>
      <PageHeader eyebrow="Reporting" title="Funnel, KPI, weekly review, dan cashflow" description="Semua reporting dari Excel tetap ada. Live Pipeline membaca Firestore; target KPI/weekly/cashflow awal berasal dari workbook terbaru." />
      <div className="tool-tabs">
        <button className={tab === "live" ? "active" : ""} onClick={() => setTab("live")}>Live Pipeline</button>
        <button className={tab === "daily" ? "active" : ""} onClick={() => setTab("daily")}>Daily KPI · 30 hari</button>
        <button className={tab === "weekly" ? "active" : ""} onClick={() => setTab("weekly")}>Weekly Review</button>
        <button className={tab === "cashflow" ? "active" : ""} onClick={() => setTab("cashflow")}>Cashflow</button>
      </div>

      {tab === "live" ? <>
        <section className="stat-grid"><StatCard label="Total qualified lead" value={items.length} /><StatCard label="Meeting" value={stats.meetings} /><StatCard label="Proposal" value={stats.proposals} /><StatCard label="Won" value={stats.won} /></section>
        <section className="dashboard-grid reports-grid">
          <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Pipeline</p><h2>Status lead</h2></div></div><div className="bar-list">{LEAD_STAGES.map((stage) => { const count = items.filter((lead) => lead.stage === stage).length; return <div className="bar-row" key={stage}><span>{stage}</span><div className="bar-track"><div style={{ width: `${(count / total) * 100}%` }} /></div><strong>{count}</strong></div>; })}</div></div>
          <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Hygiene</p><h2>Follow-up health</h2></div></div><div className="large-metric"><strong>{overdue.length}</strong><span>follow-up terlambat</span></div><div className="large-metric"><strong>{dueToday.length}</strong><span>jatuh tempo hari ini</span></div><p className="muted small">Target operasional: overdue kembali ke 0 setiap hari.</p></div>
        </section>
      </> : null}

      {tab === "daily" ? <section className="panel reference-page-panel"><div className="panel-heading"><div><p className="eyebrow">30-day KPI</p><h2>Target harian dari Excel</h2></div><span className="muted small">Actual akan hidup dari aktivitas sistem setelah dipakai rutin.</span></div><div className="reference-table-shell"><table className="reference-table kpi-table"><thead><tr><th>Hari</th><th>Tanggal</th><th>Qualified</th><th>Outreach</th><th>Follow-up</th><th>Meeting</th><th>Content</th><th>Partner</th></tr></thead><tbody>{dailyKpis.map((row) => <tr key={row.id}><td>{row.Day}</td><td>{row.Date}</td><td>{row["Qualified Target"]}</td><td>{row["Outreach Target"]}</td><td>{row["Follow-up Target"]}</td><td>{row["Meeting Target"]}</td><td>{row["Content Published"] || "—"}</td><td>{row["Partner Contacts"] || "—"}</td></tr>)}</tbody></table></div></section> : null}

      {tab === "weekly" ? <section className="panel reference-page-panel"><RawSheetView data={weeklyReview as RawSheet} intro="Weekly Funnel, 30-day scoreboard, Lost Analysis, dan A/B Experiments dari Excel digabung di sini." /></section> : null}
      {tab === "cashflow" ? <section className="panel reference-page-panel"><RawSheetView data={cashflow as RawSheet} intro="Target cash-in, contract value, dan simulasi revenue dari workbook tetap tersimpan di sistem." /></section> : null}
    </>
  );
}
