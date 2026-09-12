"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { LeadTable } from "@/components/lead-table";
import { PageHeader } from "@/components/page-header";
import { LEAD_STAGES, type LeadPriority } from "@/features/leads/types";
import { useLeads } from "@/features/leads/hooks";

export default function LeadsPage() {
  const { items, loading } = useLeads();
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("all");
  const [stage, setStage] = useState("all");

  const leads = useMemo(() => items.filter((lead) => {
    const matchQuery = !query || `${lead.business} ${lead.niche} ${lead.area} ${lead.recommendedOffer}`.toLowerCase().includes(query.toLowerCase());
    const matchPriority = priority === "all" || lead.priority === priority;
    const matchStage = stage === "all" || lead.stage === stage;
    return matchQuery && matchPriority && matchStage;
  }), [items, query, priority, stage]);

  return (
    <>
      <PageHeader
        eyebrow="Pipeline"
        title="Leads"
        description="Semua bisnis yang sudah cukup terverifikasi untuk dikerjakan marketing."
        actions={<Link href="/leads/new" className="button"><Plus size={16} />Tambah lead</Link>}
      />

      <section className="filter-bar">
        <label className="search-field"><Search size={16} /><input placeholder="Cari bisnis, niche, area, offer…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="all">Semua prioritas</option>
          {(["A", "B", "C"] as LeadPriority[]).map((item) => <option key={item} value={item}>Priority {item}</option>)}
        </select>
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="all">Semua status</option>
          {LEAD_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <span className="result-count">{leads.length} lead</span>
      </section>

      {loading ? <div className="panel muted">Memuat leads…</div> : <LeadTable leads={leads} />}
    </>
  );
}
