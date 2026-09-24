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
    {
      label: "Potensi kebutuhan",
      value: lead.demandScore,
      help: "Seberapa besar kemungkinan bisnis membutuhkan solusi digital atau sistem.",
    },
    {
      label: "Celah digital",
      value: lead.digitalGapScore,
      help: "Seberapa jelas ruang perbaikan pada situs web, kanal digital, atau alur pelanggan.",
    },
    {
      label: "Kompleksitas operasional",
      value: lead.opsComplexityScore,
      help: "Seberapa kompleks aktivitas bisnis yang berpotensi terbantu oleh sistem.",
    },
    {
      label: "Potensi nilai proyek",
      value: lead.ticketPotentialScore,
      help: "Perkiraan skala dan nilai pekerjaan jika kebutuhan benar-benar tervalidasi.",
    },
    {
      label: "Kemudahan keputusan",
      value: lead.decisionEaseScore,
      help: "Seberapa mudah tim menjangkau pengambil keputusan dan melanjutkan pembicaraan.",
    },
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
            <div className="panel-heading"><div><p className="eyebrow">Ringkasan riset</p><h2>Kenapa bisnis ini layak dihubungi?</h2><p className="panel-description">Bagian ini merangkum hasil riset publik dan hipotesis awal untuk membantu menentukan pendekatan.</p></div><span className="score-large">{lead.opportunityScore}<small>/100</small></span></div>
            <div className="research-score-note"><strong>Cara membaca skor:</strong> skor 1–5 dan nilai /100 adalah alat prioritas internal, bukan persentase peluang closing. Semakin tinggi nilainya, semakin layak calon klien diperiksa atau dihubungi lebih dulu.</div>
            <div className="score-factor-grid">{scores.map((score) => <div className="score-factor" key={score.label}><span>{score.label}</span><strong>{score.value}/5</strong><small>{score.help}</small></div>)}</div>
            <div className="research-grid">
              <ResearchBlock field="primaryDigitalAsset" label="Aset digital yang terlihat" help="Aset publik yang ditemukan saat riset, misalnya situs web, Google Maps, Instagram, atau kanal pemesanan." text={lead.primaryDigitalAsset} />
              <ResearchBlock field="hasNow" label="Yang sudah dimiliki" help="Hal yang sudah tersedia atau sudah berjalan pada bisnis berdasarkan informasi publik." text={lead.hasNow} />
              <ResearchBlock field="verifiedGap" label="Peluang perbaikan" help="Ruang yang berpotensi diperbaiki. Ini bukan berarti bisnis pasti memiliki masalah tersebut." text={lead.verifiedGap} />
              <ResearchBlock field="publicFriction" label="Masalah yang terlihat" help="Keluhan atau hambatan yang benar-benar terlihat dari sumber publik dan cukup relevan untuk dicatat." text={lead.publicFriction} />
              <ResearchBlock field="evidenceStatus" label="Status data" help="Menjelaskan seberapa kuat hasil riset dan bagian mana yang masih perlu divalidasi langsung." text={lead.evidenceStatus} />
              <ResearchBlock field="recommendedOffer" label="Penawaran yang cocok" help="Layanan NextyLabs yang paling relevan sebagai hipotesis awal, bukan penawaran final." text={lead.recommendedOffer} />
              <ResearchBlock field="solutionConcept" label="Ide solusi" help="Gambaran awal solusi yang mungkin relevan setelah kebutuhan bisnis dikonfirmasi." text={lead.solutionConcept} />
              <ResearchBlock field="firstContactAngle" label="Sudut pembuka pesan" help="Topik aman untuk membuka percakapan tanpa mengklaim kondisi internal bisnis." text={lead.firstContactAngle} />
            </div>
            <div className="guardrail"><strong>Catatan penting:</strong> {toIndonesianResearchField("guardrail", lead.guardrail) || DEFAULT_RESEARCH_GUARDRAIL}</div>
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

function ResearchBlock({
  field,
  label,
  help,
  text,
}: {
  field: LeadResearchField;
  label: string;
  help: string;
  text: string;
}) {
  return (
    <div className="research-block">
      <span>{label}</span>
      <small>{help}</small>
      <p>{toIndonesianResearchField(field, text)}</p>
    </div>
  );
}
