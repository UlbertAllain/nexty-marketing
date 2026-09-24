"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { LeadTable } from "@/components/lead-table";
import { PageHeader } from "@/components/page-header";
import { LEAD_STAGES } from "@/modules/leads/types";
import { useLeads } from "@/modules/leads/hooks";

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
        eyebrow="Daftar lead"
        title="Semua bisnis yang sedang dikerjakan"
        description="Cari bisnis, lihat statusnya, lalu buka detail untuk melihat pesan dan pekerjaan berikutnya."
        actions={<Link href="/leads/new" className="button"><Plus size={16} />Tambah lead</Link>}
      />

      <section className="filter-bar leads-filter">
        <label className="search-field">
          <Search size={16} />
          <input
            placeholder="Cari nama bisnis, kategori, area, atau offer…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="select-filter">
          <span>Prioritas</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="all">Semua</option>
            <option value="A">Prioritas A</option>
            <option value="B">Prioritas B</option>
            <option value="C">Prioritas C</option>
          </select>
        </label>

        <label className="select-filter">
          <span>Status</span>
          <select value={stage} onChange={(event) => setStage(event.target.value)}>
            <option value="all">Semua</option>
            {LEAD_STAGES.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>

        <span className="result-count">{loading ? "Memuat…" : `${leads.length} dari ${items.length} lead`}</span>
      </section>

      <div className="table-help">
        <strong>Tips:</strong>
        <span>Mulai dari Prioritas A, lalu cek kolom “Langkah berikutnya”.</span>
      </div>

      <LeadTable leads={leads} />
    </>
  );
}
