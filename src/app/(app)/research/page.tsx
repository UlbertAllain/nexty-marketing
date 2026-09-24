"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ScoreBar } from "@/components/score-bar";
import { SocialLinks } from "@/components/social-links";
import { useProspects } from "@/modules/leads/hooks";
import { promoteProspect } from "@/modules/leads/repository";
import researchQueue from "@/data/seed/research-queue.json";
import socialProfiles from "@/data/seed/social-media.json";
import sources from "@/data/seed/sources.json";
import type { SocialProfile } from "@/modules/leads/types";

type Tab = "pool" | "queue" | "social" | "sources";

export default function ResearchPage() {
  const { items, loading } = useProspects();
  const [tab, setTab] = useState<Tab>("pool");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("needs-research");
  const [busyId, setBusyId] = useState("");
  const router = useRouter();

  const q = query.toLowerCase();
  const prospects = useMemo(() => items.filter((item) => {
    const matchQuery = !q || `${item.business} ${item.niche} ${item.region} ${item.recommendedOffer}`.toLowerCase().includes(q);
    const matchStatus = status === "all" ||
      (status === "needs-research" && item.poolStatus !== "Qualified Target") ||
      (status === "qualified" && item.poolStatus === "Qualified Target") ||
      (status === "ready" && item.researchLevel.toLowerCase().includes("deep"));
    return matchQuery && matchStatus;
  }), [items, q, status]);

  const queue = useMemo(() => researchQueue.filter((item) => !q || `${item.business} ${item.niche} ${item.region} ${item.whyInteresting} ${item.nextResearch}`.toLowerCase().includes(q)), [q]);
  const socials = useMemo(() => socialProfiles.filter((item) => !q || `${item.business} ${item.niche} ${item.area} ${item.instagramHandle} ${item.verificationStatus}`.toLowerCase().includes(q)), [q]);
  const sourceRows = useMemo(() => sources.filter((item) => !q || `${item.business} ${item.sourceType} ${item.usedFor} ${item.confidence}`.toLowerCase().includes(q)), [q]);

  async function promote(item: (typeof items)[number]) {
    setBusyId(item.id);
    try { router.push(`/leads/${await promoteProspect(item)}`); } finally { setBusyId(""); }
  }

  return (
    <>
      <PageHeader eyebrow="Cari prospect" title="Cari dan siapkan calon client" description="Gunakan halaman ini saat daftar lead mulai menipis. Pilih calon bisnis, cek datanya, lalu jadikan lead kalau sudah layak dihubungi." />
      <div className="tool-tabs">
        <button className={tab === "pool" ? "active" : ""} onClick={() => setTab("pool")}>Daftar prospect · 129</button>
        <button className={tab === "queue" ? "active" : ""} onClick={() => setTab("queue")}>Perlu diriset · 88</button>
        <button className={tab === "social" ? "active" : ""} onClick={() => setTab("social")}>Akun sosial · 69</button>
        <button className={tab === "sources" ? "active" : ""} onClick={() => setTab("sources")}>Sumber data · 138</button>
      </div>

      <section className="filter-bar">
        <label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari bisnis, area, kategori, handle…" /></label>
        {tab === "pool" ? <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="needs-research">Masih perlu riset</option><option value="ready">Riset lengkap</option><option value="qualified">Sudah jadi lead</option><option value="all">Semua prospect</option></select> : null}
        <span className="result-count">{tab === "pool" ? prospects.length : tab === "queue" ? queue.length : tab === "social" ? socials.length : sourceRows.length} item</span>
      </section>

      {tab === "pool" ? (
        loading ? <div className="panel muted">Memuat prospect pool…</div> : !prospects.length ? <EmptyState title="Tidak ada prospect" text="Coba ubah filter." /> : <div className="research-list">{prospects.map((item) => (
          <article className="research-row" key={item.id}>
            <div className="research-business"><span className="tiny muted">{item.id} · {item.region}</span><strong>{item.business}</strong><span>{item.niche}</span></div>
            <div className="research-evidence"><span className="label">Yang terlihat</span><p>{item.publicAssets || "Belum ada ringkasan."}</p></div>
            <div className="research-evidence"><span className="label">Potensi gap</span><p>{item.potentialGap || "Belum diriset."}</p></div>
            <div className="research-score"><ScoreBar value={item.fitScore} /><span className="tiny muted">{item.researchLevel}</span></div>
            <div className="research-actions">{item.source1 ? <a className="icon-button" href={item.source1} target="_blank" rel="noreferrer" title="Buka sumber"><ArrowUpRight size={16} /></a> : null}{item.targetId ? <Link className="button secondary compact" href={`/leads/${item.targetId}`}>Buka lead</Link> : <button className="button compact" disabled={busyId === item.id} onClick={() => promote(item)}>{busyId === item.id ? "Memproses…" : "Jadikan lead"}</button>}</div>
          </article>
        ))}</div>
      ) : null}

      {tab === "queue" ? <div className="queue-grid">{queue.map((item) => (
        <article className="panel queue-card" key={`${item.rank}-${item.business}`}>
          <div className="queue-card-head"><div><span className="tiny muted">#{item.rank} · {item.region}</span><h2>{item.business}</h2><p>{item.niche}</p></div><ScoreBar value={Number(item.fitScore) || 0} /></div>
          <dl className="definition-list"><div><dt>Kenapa menarik</dt><dd>{item.whyInteresting}</dd></div><div><dt>Riset berikutnya</dt><dd>{item.nextResearch}</dd></div><div><dt>Offer</dt><dd>{item.recommendedOffer}</dd></div><div><dt>Authority risk</dt><dd>{item.authorityRisk}</dd></div></dl>
          {item.source ? <a className="text-link" href={item.source} target="_blank" rel="noreferrer">Buka sumber <ArrowUpRight size={14} /></a> : null}
        </article>
      ))}</div> : null}

      {tab === "social" ? <div className="social-directory">{socials.map((item) => (
        <article className="panel social-card" key={item.leadId}>
          <div className="social-card-head"><div><span className="tiny muted">{item.leadId} · {item.area}</span><h2>{item.business}</h2><p>{item.niche}</p></div><span className={item.verificationStatus.startsWith("Verified") ? "verification verified" : "verification needs-check"}>{item.verificationStatus}</span></div>
          <SocialLinks social={item as SocialProfile} />
          {item.notes ? <p className="tiny muted social-note">{item.notes}</p> : null}
          {item.verificationSource ? <a className="text-link" href={item.verificationSource} target="_blank" rel="noreferrer">Sumber verifikasi <ArrowUpRight size={14} /></a> : null}
        </article>
      ))}</div> : null}

      {tab === "sources" ? <div className="table-shell"><table className="data-table source-table"><thead><tr><th>Bisnis</th><th>Jenis</th><th>Dipakai untuk</th><th>Confidence / caveat</th><th>Sumber</th></tr></thead><tbody>{sourceRows.map((item) => <tr key={item.id}><td><strong>{item.business}</strong><span className="table-secondary">{item.checkedAt}</span></td><td>{item.sourceType}</td><td className="table-wrap">{item.usedFor}</td><td className="table-wrap">{item.confidence}</td><td><a className="text-link" href={item.url} target="_blank" rel="noreferrer">Buka <ArrowUpRight size={13} /></a></td></tr>)}</tbody></table></div> : null}
    </>
  );
}
