"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clipboard, ExternalLink } from "lucide-react";
import type { Lead, LeadTemplateKey } from "@/modules/leads/types";
import { buildIndonesianLeadTemplates, DEFAULT_PERSONALIZATION_CHECKLIST } from "@/modules/leads/copy";
import { recordOutboundMessage } from "@/modules/messages/automation";
import { buildWhatsAppUrl } from "@/lib/utils/phone";
import { Button } from "./ui/button";

const templateLabels: Record<LeadTemplateKey, string> = {
  FIRST_OUTREACH: "Pesan pertama",
  INTERESTED_REPLY: "Kalau tertarik",
  FOLLOW_UP_D2: "Tindak lanjut H+2",
  FOLLOW_UP_D5: "Tindak lanjut terakhir",
  MEETING_CTA: "Ajak bertemu",
};

export function MessageComposer({ lead }: { lead: Lead }) {
  const templates = useMemo(() => buildIndonesianLeadTemplates(lead.business, lead.primaryDigitalAsset), [lead.business, lead.primaryDigitalAsset]);
  const initialKey: LeadTemplateKey = lead.stage === "New" || lead.stage === "Qualified" ? "FIRST_OUTREACH" : "FOLLOW_UP_D2";
  const [key, setKey] = useState<LeadTemplateKey>(initialKey);
  const [message, setMessage] = useState(templates[initialKey] ?? "");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const url = useMemo(() => buildWhatsAppUrl(lead.phone, message), [lead.phone, message]);

  function choose(next: LeadTemplateKey) {
    setKey(next);
    setMessage(templates[next] ?? "");
    setCopied(false);
  }

  async function copy() {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  async function markSent() {
    setBusy(true);
    try {
      await recordOutboundMessage(lead, key, message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel composer-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Kirim pesan</p>
          <h2>Siapkan pesan untuk calon klien ini</h2>
        </div>
        <span className="channel-pill">WhatsApp</span>
      </div>

      <div className="template-tabs" role="tablist">
        {(Object.keys(templateLabels) as LeadTemplateKey[]).map((item) => (
          <button key={item} className={item === key ? "template-tab active" : "template-tab"} onClick={() => choose(item)}>
            {templateLabels[item]}
          </button>
        ))}
      </div>

      <textarea className="message-editor" value={message} onChange={(e) => setMessage(e.target.value)} rows={9} />
      <p className="composer-note"><strong>Cek sebelum kirim:</strong> {DEFAULT_PERSONALIZATION_CHECKLIST}</p>

      <div className="composer-actions">
        <button className="button secondary" onClick={copy}><Clipboard size={16} />{copied ? "Tersalin" : "Salin pesan"}</button>
        <a className={url ? "button secondary" : "button secondary disabled"} href={url || undefined} target="_blank" rel="noreferrer">
          <ExternalLink size={16} />Buka di WhatsApp
        </a>
        <Button onClick={markSent} disabled={busy || !message.trim()}>
          <CheckCircle2 size={16} />{busy ? "Menyimpan…" : "Tandai terkirim"}
        </Button>
      </div>
      <p className="tiny muted">Setelah pesan benar-benar terkirim di WhatsApp, kembali ke sini lalu klik “Tandai terkirim”. Sistem akan membuat jadwal tindak lanjut berikutnya secara otomatis.</p>
    </section>
  );
}
