"use client";

import Link from "next/link";
import { ArrowRight, MessageSquareText, Search, TrendingUp, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { TaskList } from "@/components/task-list";
import { PriorityBadge } from "@/components/status-badge";
import { ScoreBar } from "@/components/score-bar";
import { useLeads, useLeadStats } from "@/features/leads/hooks";
import { useTasks } from "@/features/tasks/hooks";
import prospects from "@/data/seed/prospect-pool.json";
import socialProfiles from "@/data/seed/social-media.json";

export default function DashboardPage() {
  const { items: leads } = useLeads();
  const stats = useLeadStats(leads);
  const { overdue, dueToday } = useTasks();
  const verifiedSocial = socialProfiles.filter((item) => item.verificationStatus.startsWith("Verified")).length;
  const priority = leads.filter((lead) => lead.priority === "A" && ["New", "Qualified"].includes(lead.stage)).sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, 6);

  return (
    <>
      <PageHeader eyebrow="Hari ini" title="Kerjakan next action, bukan buka semua data" description="Follow-up yang jatuh tempo dikerjakan dulu. Setelah itu ambil target Priority A. Research, content, report, dan planning tetap ada tetapi tidak mengganggu flow harian." actions={<Link className="button" href="/leads/new">Tambah lead</Link>} />
      <section className="stat-grid">
        <StatCard label="Follow-up terlambat" value={overdue.length} note="Selesaikan ini dulu" />
        <StatCard label="Follow-up hari ini" value={dueToday.length} note="Jangan sampai lewat" />
        <StatCard label="Priority A belum dihubungi" value={stats.priorityA} note="Sumber outbound utama" />
        <StatCard label="Social verified" value={`${verifiedSocial}/69`} note={`${prospects.length} total prospect pool`} />
      </section>

      <section className="dashboard-grid">
        <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Follow-up</p><h2>Yang harus dibereskan sekarang</h2></div><Link href="/tasks" className="text-link">Lihat semua <ArrowRight size={15} /></Link></div><TaskList tasks={[...overdue, ...dueToday].slice(0, 8)} compact /></div>
        <div className="panel"><div className="panel-heading"><div><p className="eyebrow">Priority Queue</p><h2>Target berikutnya untuk dihubungi</h2></div><Link href="/leads" className="text-link">Buka daftar <ArrowRight size={15} /></Link></div><div className="priority-list">{priority.map((lead, index) => <Link className="priority-row" key={lead.id} href={`/leads/${lead.id}`}><span className="rank">{index + 1}</span><div className="priority-main"><strong>{lead.business}</strong><span>{lead.niche} · {lead.area}</span></div><PriorityBadge value={lead.priority} /><ScoreBar value={lead.opportunityScore} /></Link>)}{!priority.length ? <p className="muted small">Belum ada Priority A yang siap dihubungi.</p> : null}</div></div>
      </section>

      <section className="quick-grid four">
        <Link className="quick-card" href="/leads"><UsersRound size={20} /><div><strong>Leads</strong><span>Pipeline, social, research, template personal.</span></div><ArrowRight size={18} /></Link>
        <Link className="quick-card" href="/research"><Search size={20} /><div><strong>Research</strong><span>Prospect pool, research queue, social, sources.</span></div><ArrowRight size={18} /></Link>
        <Link className="quick-card" href="/templates"><MessageSquareText size={20} /><div><strong>Templates</strong><span>Chat, objection, discovery, audit, proposal.</span></div><ArrowRight size={18} /></Link>
        <Link className="quick-card" href="/growth"><TrendingUp size={20} /><div><strong>Growth</strong><span>Content, roadmap, partnerships, portfolio proof.</span></div><ArrowRight size={18} /></Link>
      </section>
    </>
  );
}
