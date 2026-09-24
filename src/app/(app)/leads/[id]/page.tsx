"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { MessageComposer } from "@/components/message-composer";
import { PageHeader } from "@/components/page-header";
import { getStageLabel, PriorityBadge, StatusBadge } from "@/components/status-badge";
import { SocialLinks } from "@/components/social-links";
import { useActivities, useLead } from "@/modules/leads/hooks";
import { changeLeadStage, updateLead } from "@/modules/leads/repository";
import { LEAD_STAGES, type LeadStage } from "@/modules/leads/types";
import { DEFAULT_RESEARCH_GUARDRAIL, getVerificationLabel, toIndonesianMarketingCopy } from "@/modules/leads/copy";
import { buildWhatsAppUrl } from "@/lib/utils/phone";
import { formatDate } from "@/lib/utils/date";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { item: lead, loading } = useLead(params.id);
  const activities = useActivities(params.id);
  const [saving, setSaving] = useState(false);

if (loading) return <div className="panel muted">Memuat data calon klien…</div>;
if (!lead) return <div className="panel">Calon klien tidak ditemukan.</div>;

const leadId = lead.id;

async function saveField(field: "nextAction" | "notes", value: string) {
  setSaving(true);

  try {
    await updateLead(leadId, { [field]: value });
  } finally {
    setSaving(false);
  }
}

  const scores = [
    ["Potensi kebutuhan", lead.demandScore], ["Celah digital", lead.digitalGapScore], ["Kompleksitas operasional", lead.opsComplexityScore],
    ["Potensi nilai proyek", lead.ticketPotentialScore], ["Kemudahan keputusan", lead.decisionEaseScore],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={toIndonesianMarketingCopy(lead.niche)}
        title={lead.business}
        description={`${lead.area || "Area belum diisi"} · ${lead.phone ? `WhatsApp ${lead.phone}` : "Nomor WhatsApp belum diisi"}`}
        actions={<div className="header-badges"><PriorityBadge value={lead.priority} /><StatusBadge value={lead.stage} /></div>}
      />

      <section className="lead-detail-grid">
        <div className="lead-main-stack">
          <section className="panel social-overview-panel">
            <div className="panel-heading"><div><p className="eyebrow">Kontak bisnis</p><h2>Situs web & media sosial</h2><p className="panel-description">Gunakan bagian ini untuk cek profil bisnis sebelum mengirim pesan.</p></div><span className={lead.social?.verificationStatus?.startsWith("Verified") ? "verification verified" : "verification needs-check"}>{getVerificationLabel(lead.social?.verificationStatus || lead.socialVerification)}</span></div>
            <SocialLinks social={lead.social} />
            {lead.social?.notes ? <p className="tiny muted social-note">{toIndonesianMarketingCopy(lead.social.notes)}</p> : null}
          </section>

          <MessageComposer lead={lead} />

          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">Ringkasan riset</p><h2>Kenapa bisnis ini layak dihubungi?</h2><p className="panel-description">Baca bagian ini kalau butuh konteks sebelum mengirim pesan atau bertemu.</p></div><span className="score-large">{lead.opportunityScore}<small>/100</small></span></div>
            <div className="score-factor-grid">{scores.map(([label, value]) => <div className="score-factor" key={label}><span>{label}</span><strong>{value}/5</strong></div>)}</div>
            <div className="research-grid">
              <ResearchBlock label="Aset digital yang terlihat" text={lead.primaryDigitalAsset} />
              <ResearchBlock label="Yang sudah dimiliki" text={lead.hasNow} />
              <ResearchBlock label="Peluang perbaikan" text={lead.verifiedGap} />
              <ResearchBlock label="Masalah yang terlihat" text={lead.publicFriction} />
              <ResearchBlock label="Status data" text={lead.evidenceStatus} />
              <ResearchBlock label="Penawaran yang cocok" text={lead.recommendedOffer} />
              <ResearchBlock label="Ide solusi" text={lead.solutionConcept} />
              <ResearchBlock label="Sudut pembuka pesan" text={lead.firstContactAngle} />
            </div>
            <div className="guardrail"><strong>Catatan penting:</strong> {toIndonesianMarketingCopy(lead.guardrail) || DEFAULT_RESEARCH_GUARDRAIL}</div>
            <div className="source-row">
              {lead.source1 ? <a href={lead.source1} target="_blank" rel="noreferrer">Sumber 1 <ExternalLink size={13} /></a> : null}
              {lead.source2 ? <a href={lead.source2} target="_blank" rel="noreferrer">Sumber 2 <ExternalLink size={13} /></a> : null}
              {lead.social?.verificationSource ? <a href={lead.social.verificationSource} target="_blank" rel="noreferrer">Verifikasi media sosial <ExternalLink size={13} /></a> : null}
            </div>
          </section>

          <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Riwayat calon klien</p><h2>Aktivitas terakhir</h2></div></div><ActivityTimeline activities={activities} /></section>
        </div>

        <aside className="lead-side-stack">
          <section className="panel sticky-panel">
            <p className="eyebrow">Perbarui perkembangan</p>
            <label className="field"><span>Status lead</span><select value={lead.stage} onChange={(e) => changeLeadStage(lead, e.target.value as LeadStage)}>{LEAD_STAGES.map((stage) => <option key={stage} value={stage}>{getStageLabel(stage)}</option>)}</select></label>
            <label className="field"><span>Langkah berikutnya</span><textarea defaultValue={toIndonesianMarketingCopy(lead.nextAction)} rows={4} onBlur={(e) => saveField("nextAction", e.target.value)} /></label>
            <label className="field"><span>Catatan tim</span><textarea defaultValue={lead.notes ?? ""} rows={5} onBlur={(e) => saveField("notes", e.target.value)} placeholder="Contoh: sudah balas, minta dihubungi Jumat…" /></label>
            <p className="tiny muted">{saving ? "Menyimpan…" : "Tersimpan otomatis setelah selesai mengetik."}</p>
            <hr />
            <div className="detail-list">
              <div><span>Terakhir diriset</span><strong>{lead.researchDate || "—"}</strong></div>
              <div><span>Nilai Google</span><strong>{lead.googleRating ? `${lead.googleRating} · ${lead.reviewCount} ulasan` : "—"}</strong></div>
              <div><span>Jalur kontak utama</span><strong>{toIndonesianMarketingCopy(lead.contactRoute) || "—"}</strong></div>
              <div><span>Kontak terakhir</span><strong>{formatDate(lead.lastContactAt)}</strong></div>
              <div><span>Tindak lanjut berikutnya</span><strong>{formatDate(lead.nextFollowUpAt)}</strong></div>
            </div>
            {lead.phone ? <a className="button secondary full-button" target="_blank" rel="noreferrer" href={buildWhatsAppUrl(lead.phone, "")}><Phone size={15} />Buka WhatsApp</a> : null}
          </section>
        </aside>
      </section>
    </>
  );
}

function ResearchBlock({ label, text }: { label: string; text: string }) {
  return <div className="research-block"><span>{label}</span><p>{toIndonesianMarketingCopy(text) || "Belum ada data."}</p></div>;
}
