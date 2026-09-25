"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareText, Plus, Search, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TaskList } from "@/components/task-list";
import { PriorityBadge } from "@/components/status-badge";
import { ScoreBar } from "@/components/score-bar";
import { useLeads, useLeadStats } from "@/modules/leads/hooks";
import { useTasks } from "@/modules/tasks/hooks";
import { toIndonesianMarketingCopy } from "@/modules/leads/copy";

export default function DashboardPage() {
  const { items: leads } = useLeads();
  const stats = useLeadStats(leads);
  const { overdue, dueToday } = useTasks();

  const priority = leads
    .filter((lead) => lead.priority === "A" && ["New", "Qualified"].includes(lead.stage))
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 6);

  const urgentTasks = [...overdue, ...dueToday].slice(0, 8);

  return (
    <>
      <PageHeader
        eyebrow="Hari ini"
        title="Selamat datang, Tim Marketing"
        description="Ringkasan aktivitas, prioritas, dan peluang yang perlu dikerjakan hari ini."
        actions={<Link className="button" href="/leads/new"><Plus size={16} />Tambah calon klien</Link>}
      />

      <section className="stat-grid dashboard-stat-grid">
        <StatCard label="Calon klien aktif" value={stats.active} note="Masih dalam proses" />
        <StatCard label="Tindak lanjut hari ini" value={dueToday.length} note="Perlu diselesaikan hari ini" />
        <StatCard label="Terlambat" value={overdue.length} note={overdue.length ? "Prioritas pertama" : "Tidak ada yang tertinggal"} />
        <StatCard label="Prioritas A" value={stats.priorityA} note="Peluang terbaik saat ini" />
      </section>

      <section className="dashboard-grid dashboard-main-grid">
        <section className="panel dashboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Aktivitas hari ini</p>
              <h2>Tindak lanjut yang perlu perhatian</h2>
              <p className="panel-description">Mulai dari jadwal yang paling mendesak.</p>
            </div>
            <Link href="/tasks" className="text-link">Lihat semua <ArrowRight size={15} /></Link>
          </div>
          <TaskList tasks={urgentTasks} compact />
        </section>

        <section className="panel dashboard-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Peluang terbaik</p>
              <h2>Calon klien berikutnya</h2>
              <p className="panel-description">Diurutkan berdasarkan prioritas dan skor peluang.</p>
            </div>
            <Link href="/leads" className="text-link">Buka daftar <ArrowRight size={15} /></Link>
          </div>
          <div className="priority-list">
            {priority.map((lead, index) => (
              <Link className="priority-row" key={lead.id} href={`/leads/${lead.id}`}>
                <span className="rank">{index + 1}</span>
                <div className="priority-main">
                  <strong>{lead.business}</strong>
                  <span>{toIndonesianMarketingCopy(lead.niche)} · {lead.area || "Area belum diisi"}</span>
                </div>
                <PriorityBadge value={lead.priority} />
                <ScoreBar value={lead.opportunityScore} />
              </Link>
            ))}
            {!priority.length ? <p className="empty-inline">Belum ada calon klien prioritas A yang perlu dihubungi.</p> : null}
          </div>
        </section>
      </section>

      <section className="quick-action-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Akses cepat</p>
            <h2>Lanjutkan pekerjaan</h2>
          </div>
        </div>
        <div className="quick-action-grid">
          <Link href="/leads" className="quick-action">
            <UsersRound size={18} />
            <div><strong>Daftar calon klien</strong><span>Cek status, prioritas, dan langkah berikutnya.</span></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/research" className="quick-action">
            <Search size={18} />
            <div><strong>Cari calon klien baru</strong><span>Gunakan AI Discovery saat kandidat mulai menipis.</span></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/templates" className="quick-action">
            <MessageSquareText size={18} />
            <div><strong>Contoh pesan</strong><span>Buka template, jawaban keberatan, dan pesan follow-up.</span></div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
