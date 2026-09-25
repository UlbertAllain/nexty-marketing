"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TargetDiscoveryPanel } from "@/components/target-discovery-panel";
import { EmptyState } from "@/components/empty-state";
import { ScoreBar } from "@/components/score-bar";
import { SocialLinks } from "@/components/social-links";
import { useProspects } from "@/modules/leads/hooks";
import { promoteProspect } from "@/modules/leads/repository";
import { useResearchQueue, useResearchSources, useSocialProfiles } from "@/modules/research/research.hooks";
import { getAuthorityRiskLabel, getResearchLevelLabel, getVerificationLabel, toIndonesianMarketingCopy, toNaturalIndonesianResearchText } from "@/modules/leads/copy";

type Tab = "pool" | "queue" | "social" | "sources";

export default function ResearchPage() {
  const { items, loading } = useProspects();
  const { items: researchQueue, loading: queueLoading } = useResearchQueue();
  const { items: socialProfiles, loading: socialLoading } = useSocialProfiles();
  const { items: sources, loading: sourceLoading } = useResearchSources();
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
      <PageHeader eyebrow="Cari calon klien" title="Cari dan siapkan calon klien" description="Gunakan halaman ini saat daftar calon klien mulai menipis. Pilih bisnis yang cocok, cek datanya, lalu masukkan ke daftar kerja kalau sudah layak dihubungi." />

      <TargetDiscoveryPanel />

      <div className="tool-tabs">
        <button className={tab === "pool" ? "active" : ""} onClick={() => setTab("pool")}>Daftar calon klien · {items.length}</button>
        <button className={tab === "queue" ? "active" : ""} onClick={() => setTab("queue")}>Perlu diriset · {researchQueue.length}</button>
        <button className={tab === "social" ? "active" : ""} onClick={() => setTab("social")}>Akun media sosial · {socialProfiles.length}</button>
        <button className={tab === "sources" ? "active" : ""} onClick={() => setTab("sources")}>Sumber data · {sources.length}</button>
      </div>

      <section className="filter-bar">
        <label className="search-field"><Search size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari bisnis, area, kategori, atau akun…" /></label>
        {tab === "pool" ? <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="needs-research">Masih perlu riset</option><option value="ready">Riset lengkap</option><option value="qualified">Sudah jadi calon klien</option><option value="all">Semua calon klien</option></select> : null}
        <span className="result-count">{tab === "pool" && loading ? "Memuat…" : tab === "queue" && queueLoading ? "Memuat…" : tab === "social" && socialLoading ? "Memuat…" : tab === "sources" && sourceLoading ? "Memuat…" : `${tab === "pool" ? prospects.length : tab === "queue" ? queue.length : tab === "social" ? socials.length : sourceRows.length} data`}</span>
      </section>

      {tab === "pool" ? (
        loading ? <div className="panel muted">Memuat daftar calon klien…</div> : !prospects.length ? <EmptyState title="Tidak ada calon klien" text="Coba ubah penyaring." /> : <div className="research-list">{prospects.map((item) => (
          <article className="research-row" key={item.id}>
            <div className="research-business"><span className="tiny muted">{item.id} · {item.region}{item.discoveryRunId ? " · AI Discovery" : ""}</span><strong>{item.business}</strong><span>{toIndonesianMarketingCopy(item.niche)}</span></div>
            <div className="research-evidence"><span className="label">Yang terlihat</span><p>{toIndonesianMarketingCopy(item.publicAssets) || "Belum ada ringkasan."}</p></div>
            <div className="research-evidence"><span className="label">Peluang perbaikan</span><p>{toNaturalIndonesianResearchText(item.potentialGap, "Belum ada peluang perbaikan yang tervalidasi.")}</p></div>
            <div className="research-score"><ScoreBar value={item.fitScore} /><span className="tiny muted">{getResearchLevelLabel(item.researchLevel)}</span></div>
            <div className="research-actions">{item.source1 ? <a className="icon-button" href={item.source1} target="_blank" rel="noreferrer" title="Buka sumber"><ArrowUpRight size={16} /></a> : null}{item.targetId ? <Link className="button secondary compact" href={`/leads/${item.targetId}`}>Buka calon klien</Link> : <button className="button compact" disabled={busyId === item.id} onClick={() => promote(item)}>{busyId === item.id ? "Memproses…" : "Masukkan ke daftar"}</button>}</div>
            {item.discoveryRunId ? (
              <details className="discovery-candidate-details">
                <summary>Lihat data AI discovery</summary>
                <div className="discovery-candidate-grid">
                  <div><span>Lokasi / alamat</span><strong>{item.address || item.region || "Belum ditemukan"}</strong></div>
                  <div><span>Kontak</span><strong>{item.phone || "Belum ditemukan"}</strong></div>
                  <div><span>Yang ditawarkan</span><strong>{item.offerSummary || "Belum diringkas"}</strong></div>
                  <div><span>Rekomendasi</span><strong>{item.recommendedOffer || "Audit Digital Bisnis"}</strong></div>
                </div>
                <div className="discovery-link-row">
                  {item.website ? <a href={item.website} target="_blank" rel="noreferrer">Website <ArrowUpRight size={12} /></a> : null}
                  {item.instagram ? <a href={item.instagram} target="_blank" rel="noreferrer">Instagram <ArrowUpRight size={12} /></a> : null}
                  {item.source1 ? <a href={item.source1} target="_blank" rel="noreferrer">Evidence 1 <ArrowUpRight size={12} /></a> : null}
                  {item.source2 ? <a href={item.source2} target="_blank" rel="noreferrer">Evidence 2 <ArrowUpRight size={12} /></a> : null}
                </div>
                <p>{item.notes}</p>
              </details>
            ) : null}
          </article>
        ))}</div>
      ) : null}

      {tab === "queue" ? <div className="queue-grid">{queue.map((item) => (
        <article className="panel queue-card" key={`${item.rank}-${item.business}`}>
          <div className="queue-card-head"><div><span className="tiny muted">#{item.rank} · {item.region}</span><h2>{item.business}</h2><p>{toIndonesianMarketingCopy(item.niche)}</p></div><ScoreBar value={Number(item.fitScore) || 0} /></div>
          <dl className="definition-list"><div><dt>Kenapa menarik</dt><dd>{toNaturalIndonesianResearchText(item.whyInteresting)}</dd></div><div><dt>Riset berikutnya</dt><dd>{toNaturalIndonesianResearchText(item.nextResearch, "Periksa kembali kanal publik terbaru sebelum menghubungi.")}</dd></div><div><dt>Penawaran yang cocok</dt><dd>{toIndonesianMarketingCopy(item.recommendedOffer)}</dd></div><div><dt>Risiko akses pengambil keputusan</dt><dd>{getAuthorityRiskLabel(item.authorityRisk)}</dd></div></dl>
          {item.source ? <a className="text-link" href={item.source} target="_blank" rel="noreferrer">Buka sumber <ArrowUpRight size={14} /></a> : null}
        </article>
      ))}</div> : null}

      {tab === "social" ? <div className="social-directory">{socials.map((item) => (
        <article className="panel social-card" key={item.leadId}>
          <div className="social-card-head"><div><span className="tiny muted">{item.leadId} · {item.area}</span><h2>{item.business}</h2><p>{toIndonesianMarketingCopy(item.niche)}</p></div><span className={(item.verificationStatus.startsWith("Verified") || item.verificationStatus.startsWith("Terverifikasi")) ? "verification verified" : "verification needs-check"}>{getVerificationLabel(item.verificationStatus)}</span></div>
          <SocialLinks social={item} />
          {item.notes ? <p className="tiny muted social-note">{toNaturalIndonesianResearchText(item.notes, "Catatan verifikasi perlu diperiksa kembali.")}</p> : null}
          {item.verificationSource ? <a className="text-link" href={item.verificationSource} target="_blank" rel="noreferrer">Sumber verifikasi <ArrowUpRight size={14} /></a> : null}
        </article>
      ))}</div> : null}

      {tab === "sources" ? <div className="table-shell"><table className="data-table source-table"><thead><tr><th>Bisnis</th><th>Jenis</th><th>Dipakai untuk</th><th>Tingkat keyakinan / catatan</th><th>Sumber</th></tr></thead><tbody>{sourceRows.map((item) => <tr key={item.id}><td><strong>{item.business}</strong><span className="table-secondary">{item.checkedAt}</span></td><td>{toIndonesianMarketingCopy(item.sourceType)}</td><td className="table-wrap">{toNaturalIndonesianResearchText(item.usedFor, "Digunakan untuk mendukung riset bisnis.")}</td><td className="table-wrap">{toNaturalIndonesianResearchText(item.confidence, "Perlu diverifikasi kembali sebelum digunakan untuk menghubungi calon klien.")}</td><td><a className="text-link" href={item.url} target="_blank" rel="noreferrer">Buka <ArrowUpRight size={13} /></a></td></tr>)}</tbody></table></div> : null}
    </>
  );
}
