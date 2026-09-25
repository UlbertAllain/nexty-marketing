"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { MessageComposer } from "@/components/message-composer";
import { PageHeader } from "@/components/page-header";
import { ResearchIntelligencePanel } from "@/components/research-intelligence-panel";
import { getStageLabel, PriorityBadge, StatusBadge } from "@/components/status-badge";
import { SocialLinks } from "@/components/social-links";
import { useActivities, useLead } from "@/modules/leads/hooks";
import { changeLeadStage, updateLead } from "@/modules/leads/repository";
import { LEAD_STAGES, type LeadStage } from "@/modules/leads/types";
import { DEFAULT_RESEARCH_GUARDRAIL, getVerificationLabel, toIndonesianMarketingCopy, toIndonesianResearchField, type LeadResearchField } from "@/modules/leads/copy";
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
    ["Potensi kebutuhan", lead.demandScore],
    ["Celah digital", lead.digitalGapScore],
    ["Kompleksitas operasional", lead.opsComplexityScore],
    ["Potensi nilai proyek", lead.ticketPotentialScore],
    ["Kemudahan keputusan", lead.decisionEaseScore],
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

          <ResearchIntelligencePanel lead={lead} />

          <MessageComposer lead={lead} />

          <section className="panel research-summary-panel">
            <div className="panel-heading research-summary-heading">
              <div>
                <p className="eyebrow">Ringkasan riset</p>
                <h2>Inti yang perlu diketahui</h2>
                <p className="panel-description">Baca tiga poin utama ini dulu. Detail lengkap tersedia di bawah kalau dibutuhkan.</p>
              </div>
              <div className="research-score">
                <strong>{lead.opportunityScore}</strong>
                <span>/100</span>
                <small>Prioritas internal</small>
              </div>
            </div>

            <div className="research-key-grid">
              <ResearchKeyPoint
                label="Peluang utama"
                value={toIndonesianResearchField("verifiedGap", lead.verifiedGap)}
              />
              <ResearchKeyPoint
                label="Penawaran yang cocok"
                value={toIndonesianResearchField("recommendedOffer", lead.recommendedOffer)}
              />
              <ResearchKeyPoint
                label="Cara membuka percakapan"
                value={toIndonesianResearchField("firstContactAngle", lead.firstContactAngle)}
              />
            </div>

            <div className="score-factor-grid compact-score-grid">
              {scores.map(([label, value]) => (
                <div className="score-factor compact-score" key={label}>
                  <span>{label}</span>
                  <strong>{value}/5</strong>
                </div>
              ))}
            </div>

            <details className="research-details">
              <summary>
                <span>Lihat detail riset lengkap</span>
                <small>Aset, kondisi saat ini, masalah, ide solusi, dan sumber</small>
              </summary>

              <div className="research-details-content">
                <div className="research-grid">
                  <ResearchBlock field="primaryDigitalAsset" label="Aset digital yang terlihat" text={lead.primaryDigitalAsset} />
                  <ResearchBlock field="hasNow" label="Yang sudah dimiliki" text={lead.hasNow} />
                  <ResearchBlock field="publicFriction" label="Masalah yang terlihat" text={lead.publicFriction} />
                  <ResearchBlock field="evidenceStatus" label="Status data" text={lead.evidenceStatus} />
                  <ResearchBlock field="solutionConcept" label="Ide solusi" text={lead.solutionConcept} />
                </div>

                <div className="guardrail">
                  <strong>Catatan penting:</strong>{" "}
                  {toIndonesianResearchField("guardrail", lead.guardrail) || DEFAULT_RESEARCH_GUARDRAIL}
                </div>

                <div className="source-row">
                  {lead.source1 ? <a href={lead.source1} target="_blank" rel="noreferrer">Sumber 1 <ExternalLink size={13} /></a> : null}
                  {lead.source2 ? <a href={lead.source2} target="_blank" rel="noreferrer">Sumber 2 <ExternalLink size={13} /></a> : null}
                  {lead.social?.verificationSource ? <a href={lead.social.verificationSource} target="_blank" rel="noreferrer">Verifikasi media sosial <ExternalLink size={13} /></a> : null}
                </div>
              </div>
            </details>

            <p className="research-score-footnote">
              Nilai /100 adalah skor prioritas internal, bukan persentase peluang menjadi klien.
            </p>
          </section>

          <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Riwayat calon klien</p><h2>Aktivitas terakhir</h2></div></div><ActivityTimeline activities={activities} /></section>
        </div>

        <aside className="lead-side-stack">
          <section className="panel sticky-panel">
            <p className="eyebrow">Perbarui perkembangan</p>
            <label className="field"><span>Status lead</span><select value={lead.stage} onChange={(e) => changeLeadStage(lead, e.target.value as LeadStage)}>{LEAD_STAGES.map((stage) => <option key={stage} value={stage}>{getStageLabel(stage)}</option>)}</select></label>
            <label className="field"><span>Langkah berikutnya</span><textarea defaultValue={toIndonesianResearchField("nextAction", lead.nextAction)} rows={4} onBlur={(e) => saveField("nextAction", e.target.value)} /></label>
            <label className="field"><span>Catatan tim</span><textarea defaultValue={lead.notes ?? ""} rows={5} onBlur={(e) => saveField("notes", e.target.value)} placeholder="Contoh: sudah balas, minta dihubungi Jumat…" /></label>
            <p className="tiny muted">{saving ? "Menyimpan…" : "Tersimpan otomatis setelah selesai mengetik."}</p>
            <hr />
            <div className="detail-list">
              <div><span>Terakhir diriset</span><strong>{lead.researchDate || "—"}</strong></div>
              <div><span>Nilai Google</span><strong>{lead.googleRating ? `${lead.googleRating} · ${lead.reviewCount} ulasan` : "—"}</strong></div>
              <div><span>Jalur kontak utama</span><strong>{toIndonesianResearchField("contactRoute", lead.contactRoute) || "—"}</strong></div>
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

function ResearchKeyPoint({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="research-key-point">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function ResearchBlock({
  field,
  label,
  text,
}: {
  field: LeadResearchField;
  label: string;
  text: string;
}) {
  return (
    <div className="research-block">
      <span>{label}</span>
      <p>{toIndonesianResearchField(field, text)}</p>
    </div>
  );
}
