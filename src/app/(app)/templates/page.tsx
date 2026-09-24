"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CopyableTemplate } from "@/components/copyable-template";
import { CustomMessageTemplateManager } from "@/components/custom-message-template-manager";
import { getStageLabel } from "@/components/status-badge";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { useReferenceData } from "@/modules/reference/reference.hooks";
import { toIndonesianMarketingCopy, toNaturalIndonesianResearchText } from "@/modules/leads/copy";
import commonTemplates from "@/data/seed/common-templates.json";
import objections from "@/data/seed/objections.json";
import discovery from "@/data/seed/discovery.json";
import offers from "@/data/seed/offers.json";
import conversationTree from "@/data/seed/conversation-tree.json";
import proposalSections from "@/data/seed/proposal-sections.json";
import miniAudit from "@/data/seed/mini-audit.json";

type Tab = "chat" | "custom" | "objection" | "discovery" | "conversation" | "offer" | "proposal" | "audit";

export default function TemplatesPage() {
  const [tab, setTab] = useState<Tab>("chat");
  const [query, setQuery] = useState("");
  const { data: liveCommonTemplates } = useReferenceData("common-templates", commonTemplates);
  const { data: liveObjections } = useReferenceData("objections", objections);
  const { data: liveDiscovery } = useReferenceData("discovery", discovery);
  const { data: liveOffers } = useReferenceData("offers", offers);
  const { data: liveConversationTree } = useReferenceData("conversation-tree", conversationTree);
  const { data: liveProposalSections } = useReferenceData("proposal-sections", proposalSections);
  const { data: liveMiniAudit } = useReferenceData("mini-audit", miniAudit);
  const localizedCommonTemplates = useMemo(
    () => liveCommonTemplates.map((item) =>
      commonTemplates.find((fallback) => fallback.scenario === item.scenario) ?? item,
    ),
    [liveCommonTemplates],
  );
  const templateList = useMemo(
    () => localizedCommonTemplates.filter((item) => `${item.scenario} ${item.useWhen} ${item.template}`.toLowerCase().includes(query.toLowerCase())),
    [localizedCommonTemplates, query],
  );

  return (
    <>
      <PageHeader eyebrow="Contoh pesan" title="Siapkan dan kelola pesan tim" description="Gunakan contoh bawaan sebagai referensi. Buat pesan kustom untuk gaya komunikasi atau kebutuhan tim yang ingin disimpan sendiri." />
      <div className="tool-tabs scroll-tabs">
        <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>Contoh bawaan</button>
        <button className={tab === "custom" ? "active" : ""} onClick={() => setTab("custom")}>Pesan kustom</button>
        <button className={tab === "objection" ? "active" : ""} onClick={() => setTab("objection")}>Balas keberatan</button>
        <button className={tab === "discovery" ? "active" : ""} onClick={() => setTab("discovery")}>Pertanyaan kebutuhan</button>
        <button className={tab === "conversation" ? "active" : ""} onClick={() => setTab("conversation")}>Alur percakapan</button>
        <button className={tab === "offer" ? "active" : ""} onClick={() => setTab("offer")}>Penawaran & harga</button>
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>Audit singkat</button>
        <button className={tab === "proposal" ? "active" : ""} onClick={() => setTab("proposal")}>Proposal</button>
      </div>

      {tab === "chat" ? (
        <>
          <label className="search-field template-search"><Search size={16} /><input placeholder="Cari contoh pesan…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <div className="template-grid">{templateList.map((item) => <CopyableTemplate key={item.scenario} title={toIndonesianMarketingCopy(item.scenario)} description={toIndonesianMarketingCopy(item.useWhen)} text={item.template} />)}</div>
        </>
      ) : null}

      {tab === "custom" ? <CustomMessageTemplateManager /> : null}

      {tab === "objection" ? <div className="objection-grid">{liveObjections.map((item) => (
        <article className="panel objection-card" key={item.objection}>
          <div className="panel-heading"><div><p className="eyebrow">Calon klien bilang</p><h2>“{item.objection}”</h2></div></div>
          <dl className="definition-list">
            <div><dt>Artinya kemungkinan</dt><dd>{toNaturalIndonesianResearchText(item.meaning, "Ada keberatan yang perlu dipahami lebih dulu.")}</dd></div>
            <div><dt>Tanya dulu</dt><dd>{toNaturalIndonesianResearchText(item.question, "Tanyakan hal yang membuat calon klien masih ragu.")}</dd></div>
            <div><dt>Arah jawaban</dt><dd>{toNaturalIndonesianResearchText(item.response, "Jawab sesuai kebutuhan tanpa memaksa.")}</dd></div>
            <div><dt>Langkah berikutnya</dt><dd>{toIndonesianMarketingCopy(item.nextAction)}</dd></div>
            <div><dt>Hindari</dt><dd>{toNaturalIndonesianResearchText(item.avoid, "Hindari respons yang terlalu memaksa.")}</dd></div>
          </dl>
        </article>
      ))}</div> : null}

      {tab === "discovery" ? <div className="panel"><div className="question-list">{liveDiscovery.map((item, index) => (
        <div className="question-row" key={item.area}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{toIndonesianMarketingCopy(item.area)}</strong><p>{toIndonesianMarketingCopy(item.question)}</p><small>{toIndonesianMarketingCopy(item.why)}</small></div></div>
      ))}</div></div> : null}

      {tab === "conversation" ? <div className="panel"><div className="conversation-list">{liveConversationTree.map((item, index) => (
        <div className="conversation-row" key={`${item.from}-${item.response}-${index}`}>
          <div><span className="label">Dari</span><strong>{toIndonesianMarketingCopy(item.from)}</strong></div>
          <div><span className="label">Calon klien</span><strong>{toIndonesianMarketingCopy(item.response)}</strong><small>{toNaturalIndonesianResearchText(item.interpretation, "Perlu dipahami lebih lanjut.")}</small></div>
          <div><span className="label">Lakukan</span><strong>{toNaturalIndonesianResearchText(item.nextAction, "Tentukan langkah berikutnya sesuai respons calon klien.")}</strong><small>{toIndonesianMarketingCopy(item.asset)} · {toIndonesianMarketingCopy(item.wait)}</small></div>
          <div><span className="label">Status CRM</span><strong>{getStageLabel(item.crmStage)}</strong><small>{toIndonesianMarketingCopy(item.exit)}</small></div>
        </div>
      ))}</div></div> : null}

      {tab === "offer" ? <div className="offer-grid">{liveOffers.map((item) => (
        <article className="panel offer-card" key={item.name}>
          <p className="eyebrow">{toIndonesianMarketingCopy(item.startingRange)}</p><h2>{toIndonesianMarketingCopy(item.name)}</h2><p>{toNaturalIndonesianResearchText(item.target, "Untuk bisnis yang membutuhkan solusi ini.")}</p>
          <div className="offer-scope">{toNaturalIndonesianResearchText(item.scope, "Cakupan disesuaikan dengan kebutuhan bisnis.")}</div>
          <dl className="definition-list compact-def"><div><dt>Pembayaran</dt><dd>{toIndonesianMarketingCopy(item.payment)}</dd></div><div><dt>Cocok untuk</dt><dd>{toNaturalIndonesianResearchText(item.bestUse, "Disesuaikan dengan kebutuhan bisnis.")}</dd></div><div><dt>Catatan penting</dt><dd>{toNaturalIndonesianResearchText(item.guardrail, "Cakupan dan batas pekerjaan harus jelas.")}</dd></div></dl>
        </article>
      ))}</div> : null}

      {tab === "proposal" ? <div className="proposal-list">{liveProposalSections.map((item) => (
        <article className="panel proposal-card" key={item.section}>
          <p className="eyebrow">{toIndonesianMarketingCopy(item.owner)}</p><h2>{toIndonesianMarketingCopy(item.section)}</h2><p>{toNaturalIndonesianResearchText(item.purpose, "Bagian proposal yang perlu disiapkan.")}</p>
          <dl className="definition-list"><div><dt>Wajib ada</dt><dd>{toNaturalIndonesianResearchText(item.mustInclude, "Isi sesuai kebutuhan calon klien.")}</dd></div><div><dt>Jangan masukkan</dt><dd>{toNaturalIndonesianResearchText(item.doNotInclude, "Hindari informasi yang tidak membantu keputusan.")}</dd></div><div><dt>Pertanyaan calon klien</dt><dd>{toNaturalIndonesianResearchText(item.clientQuestion, "Apa yang perlu calon klien pahami dari bagian ini?")}</dd></div><div><dt>Syarat lanjut</dt><dd>{toNaturalIndonesianResearchText(item.gate, "Pastikan tahap sebelumnya sudah selesai.")}</dd></div></dl>
        </article>
      ))}</div> : null}

      {tab === "audit" ? <section className="panel reference-page-panel"><RawSheetView data={liveMiniAudit as RawSheet} intro="Daftar audit singkat dari sumber data tetap lengkap, tetapi digunakan hanya setelah calon klien memberi izin atau menunjukkan ketertarikan." /></section> : null}
    </>
  );
}
