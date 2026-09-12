"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Phone } from "lucide-react";
import { ActivityTimeline } from "@/components/activity-timeline";
import { MessageComposer } from "@/components/message-composer";
import { PageHeader } from "@/components/page-header";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { SocialLinks } from "@/components/social-links";
import { useActivities, useLead } from "@/features/leads/hooks";
import { changeLeadStage, updateLead } from "@/features/leads/repository";
import { LEAD_STAGES, type LeadStage } from "@/features/leads/types";
import { buildWhatsAppUrl } from "@/lib/utils/phone";
import { formatDate } from "@/lib/utils/date";

export default function LeadDetailPage() {
  const params = useParams<{ id: string }>();
  const { item: lead, loading } = useLead(params.id);
  const activities = useActivities(params.id);
  const [saving, setSaving] = useState(false);

if (loading) return <div className="panel muted">Memuat lead…</div>;
if (!lead) return <div className="panel">Lead tidak ditemukan.</div>;

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
    ["Demand", lead.demandScore], ["Digital gap", lead.digitalGapScore], ["Ops complexity", lead.opsComplexityScore],
    ["Ticket potential", lead.ticketPotentialScore], ["Decision ease", lead.decisionEaseScore],
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={`${lead.id} · ${lead.niche}`}
        title={lead.business}
        description={`${lead.area || "Area belum diisi"} · ${lead.phone || "Kontak belum diisi"}`}
        actions={<div className="header-badges"><PriorityBadge value={lead.priority} /><StatusBadge value={lead.stage} /></div>}
      />

      <section className="lead-detail-grid">
        <div className="lead-main-stack">
          <section className="panel social-overview-panel">
            <div className="panel-heading"><div><p className="eyebrow">Channel publik</p><h2>Kontak dan social media</h2></div><span className={lead.social?.verificationStatus?.startsWith("Verified") ? "verification verified" : "verification needs-check"}>{lead.social?.verificationStatus || lead.socialVerification || "Belum diverifikasi"}</span></div>
            <SocialLinks social={lead.social} />
            {lead.social?.notes ? <p className="tiny muted social-note">{lead.social.notes}</p> : null}
          </section>

          <MessageComposer lead={lead} />

          <section className="panel">
            <div className="panel-heading"><div><p className="eyebrow">Research</p><h2>Apa yang kita tahu</h2></div><span className="score-large">{lead.opportunityScore}<small>/100</small></span></div>
            <div className="score-factor-grid">{scores.map(([label, value]) => <div className="score-factor" key={label}><span>{label}</span><strong>{value}/5</strong></div>)}</div>
            <div className="research-grid">
              <ResearchBlock label="Aset digital utama" text={lead.primaryDigitalAsset} />
              <ResearchBlock label="Sudah punya apa" text={lead.hasNow} />
              <ResearchBlock label="Gap terverifikasi / indikasi" text={lead.verifiedGap} />
              <ResearchBlock label="Friction publik" text={lead.publicFriction} />
              <ResearchBlock label="Evidence status" text={lead.evidenceStatus} />
              <ResearchBlock label="Offer yang disarankan" text={lead.recommendedOffer} />
              <ResearchBlock label="Konsep solusi" text={lead.solutionConcept} />
              <ResearchBlock label="First-contact angle" text={lead.firstContactAngle} />
            </div>
            <div className="guardrail"><strong>Guardrail:</strong> {lead.guardrail}</div>
            <div className="source-row">
              {lead.source1 ? <a href={lead.source1} target="_blank" rel="noreferrer">Sumber 1 <ExternalLink size={13} /></a> : null}
              {lead.source2 ? <a href={lead.source2} target="_blank" rel="noreferrer">Sumber 2 <ExternalLink size={13} /></a> : null}
              {lead.social?.verificationSource ? <a href={lead.social.verificationSource} target="_blank" rel="noreferrer">Social verification <ExternalLink size={13} /></a> : null}
            </div>
          </section>

          <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Riwayat</p><h2>Aktivitas</h2></div></div><ActivityTimeline activities={activities} /></section>
        </div>

        <aside className="lead-side-stack">
          <section className="panel sticky-panel">
            <p className="eyebrow">Kontrol lead</p>
            <label className="field"><span>Status</span><select value={lead.stage} onChange={(e) => changeLeadStage(lead, e.target.value as LeadStage)}>{LEAD_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}</select></label>
            <label className="field"><span>Next action</span><textarea defaultValue={lead.nextAction} rows={4} onBlur={(e) => saveField("nextAction", e.target.value)} /></label>
            <label className="field"><span>Catatan internal</span><textarea defaultValue={lead.notes ?? ""} rows={5} onBlur={(e) => saveField("notes", e.target.value)} placeholder="Tambahkan konteks percakapan…" /></label>
            <p className="tiny muted">{saving ? "Menyimpan…" : "Perubahan tersimpan saat keluar dari field."}</p>
            <hr />
            <div className="detail-list">
              <div><span>Research</span><strong>{lead.researchDate || "—"}</strong></div>
              <div><span>Rating</span><strong>{lead.googleRating ? `${lead.googleRating} · ${lead.reviewCount} review` : "—"}</strong></div>
              <div><span>Kontak via</span><strong>{lead.contactRoute || "—"}</strong></div>
              <div><span>Last contact</span><strong>{formatDate(lead.lastContactAt)}</strong></div>
              <div><span>Next follow-up</span><strong>{formatDate(lead.nextFollowUpAt)}</strong></div>
            </div>
            {lead.phone ? <a className="button secondary full-button" target="_blank" rel="noreferrer" href={buildWhatsAppUrl(lead.phone, "")}><Phone size={15} />Buka WhatsApp</a> : null}
          </section>
        </aside>
      </section>
    </>
  );
}

function ResearchBlock({ label, text }: { label: string; text: string }) {
  return <div className="research-block"><span>{label}</span><p>{text || "Belum ada data."}</p></div>;
}
