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
        eyebrow="Kerja hari ini"
        title="Fokus ke pekerjaan yang paling penting"
        description="Kerjakan dari atas ke bawah: tindak lanjut yang terlambat, jadwal hari ini, lalu hubungi calon klien prioritas."
        actions={<Link className="button" href="/leads/new"><Plus size={16} />Tambah calon klien</Link>}
      />

      <section className="focus-strip">
        <div className="focus-copy">
          <span className="focus-kicker">Mulai dari sini</span>
          <strong>Jangan buka semua menu sekaligus.</strong>
          <p>Selesaikan pekerjaan yang punya tenggat dulu, baru cari calon klien baru.</p>
        </div>
        <div className="focus-steps" aria-label="Urutan kerja hari ini">
          <Link href="/tasks" className="focus-step">
            <span>1</span>
            <div><strong>{overdue.length} terlambat</strong><small>Bereskan tindak lanjut</small></div>
          </Link>
          <Link href="/tasks" className="focus-step">
            <span>2</span>
            <div><strong>{dueToday.length} hari ini</strong><small>Hubungi sesuai jadwal</small></div>
          </Link>
          <Link href="/leads" className="focus-step">
            <span>3</span>
            <div><strong>{stats.priorityA} calon klien utama</strong><small>Mulai pendekatan baru</small></div>
          </Link>
        </div>
      </section>

      <section className="stat-grid">
        <StatCard label="Tindak lanjut terlambat" value={overdue.length} note={overdue.length ? "Prioritas pertama hari ini" : "Aman, tidak ada yang tertinggal"} />
        <StatCard label="Tindak lanjut hari ini" value={dueToday.length} note="Hubungi sebelum hari selesai" />
        <StatCard label="Calon klien prioritas A" value={stats.priorityA} note="Belum dihubungi" />
        <StatCard label="Calon klien aktif" value={stats.active} note="Calon klien yang masih diproses" />
      </section>

      <section className="dashboard-grid">
        <section className="panel panel-primary">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Kerjakan sekarang</p>
              <h2>Tindak lanjut yang perlu perhatian</h2>
              <p className="panel-description">Klik nama bisnis untuk membuka detail dan pesan yang perlu dikirim.</p>
            </div>
            <Link href="/tasks" className="text-link">Lihat semua <ArrowRight size={15} /></Link>
          </div>
          <TaskList tasks={urgentTasks} compact />
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Setelah tindak lanjut selesai</p>
              <h2>Calon klien berikutnya untuk dihubungi</h2>
              <p className="panel-description">Urutan berdasarkan prioritas dan nilai peluang.</p>
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
        <div>
          <p className="eyebrow">Butuh pekerjaan berikutnya?</p>
          <h2>Pilih sesuai kebutuhan</h2>
        </div>
        <div className="quick-action-grid">
          <Link href="/leads" className="quick-action">
            <UsersRound size={18} />
            <div><strong>Lihat semua calon klien</strong><span>Cek status dan langkah berikutnya tiap bisnis.</span></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/research" className="quick-action">
            <Search size={18} />
            <div><strong>Cari calon klien baru</strong><span>Dipakai saat daftar calon klien mulai menipis.</span></div>
            <ArrowRight size={16} />
          </Link>
          <Link href="/templates" className="quick-action">
            <MessageSquareText size={18} />
            <div><strong>Buka contoh pesan</strong><span>Cari contoh pesan, jawaban keberatan, dan pertanyaan kebutuhan.</span></div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
