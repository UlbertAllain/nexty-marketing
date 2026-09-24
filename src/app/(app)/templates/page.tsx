"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CopyableTemplate } from "@/components/copyable-template";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { useReferenceData } from "@/modules/reference/reference.hooks";
import commonTemplates from "@/data/seed/common-templates.json";
import objections from "@/data/seed/objections.json";
import discovery from "@/data/seed/discovery.json";
import offers from "@/data/seed/offers.json";
import conversationTree from "@/data/seed/conversation-tree.json";
import proposalSections from "@/data/seed/proposal-sections.json";
import miniAudit from "@/data/seed/mini-audit.json";

type Tab = "chat" | "objection" | "discovery" | "conversation" | "offer" | "proposal" | "audit";

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
  const templateList = useMemo(
    () => liveCommonTemplates.filter((item) => `${item.scenario} ${item.useWhen} ${item.template}`.toLowerCase().includes(query.toLowerCase())),
    [liveCommonTemplates, query],
  );

  return (
    <>
      <PageHeader eyebrow="Template pesan" title="Contoh pesan untuk berbagai situasi" description="Pilih sesuai kebutuhan. Untuk menghubungi bisnis tertentu, buka detail lead agar pesannya bisa disesuaikan dulu." />
      <div className="tool-tabs scroll-tabs">
        <button className={tab === "chat" ? "active" : ""} onClick={() => setTab("chat")}>Pesan awal</button>
        <button className={tab === "objection" ? "active" : ""} onClick={() => setTab("objection")}>Balas keberatan</button>
        <button className={tab === "discovery" ? "active" : ""} onClick={() => setTab("discovery")}>Pertanyaan discovery</button>
        <button className={tab === "conversation" ? "active" : ""} onClick={() => setTab("conversation")}>Alur percakapan</button>
        <button className={tab === "offer" ? "active" : ""} onClick={() => setTab("offer")}>Offer & harga</button>
        <button className={tab === "audit" ? "active" : ""} onClick={() => setTab("audit")}>Mini audit</button>
        <button className={tab === "proposal" ? "active" : ""} onClick={() => setTab("proposal")}>Proposal</button>
      </div>

      {tab === "chat" ? (
        <>
          <label className="search-field template-search"><Search size={16} /><input placeholder="Cari template…" value={query} onChange={(e) => setQuery(e.target.value)} /></label>
          <div className="template-grid">{templateList.map((item) => <CopyableTemplate key={item.scenario} title={item.scenario} description={item.useWhen} text={item.template} />)}</div>
        </>
      ) : null}

      {tab === "objection" ? <div className="objection-grid">{liveObjections.map((item) => (
        <article className="panel objection-card" key={item.objection}>
          <div className="panel-heading"><div><p className="eyebrow">Prospect bilang</p><h2>“{item.objection}”</h2></div></div>
          <dl className="definition-list">
            <div><dt>Artinya kemungkinan</dt><dd>{item.meaning}</dd></div>
            <div><dt>Tanya dulu</dt><dd>{item.question}</dd></div>
            <div><dt>Arah jawaban</dt><dd>{item.response}</dd></div>
            <div><dt>Next action</dt><dd>{item.nextAction}</dd></div>
            <div><dt>Hindari</dt><dd>{item.avoid}</dd></div>
          </dl>
        </article>
      ))}</div> : null}

      {tab === "discovery" ? <div className="panel"><div className="question-list">{liveDiscovery.map((item, index) => (
        <div className="question-row" key={item.area}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{item.area}</strong><p>{item.question}</p><small>{item.why}</small></div></div>
      ))}</div></div> : null}

      {tab === "conversation" ? <div className="panel"><div className="conversation-list">{liveConversationTree.map((item, index) => (
        <div className="conversation-row" key={`${item.from}-${item.response}-${index}`}>
          <div><span className="label">Dari</span><strong>{item.from}</strong></div>
          <div><span className="label">Prospect</span><strong>{item.response}</strong><small>{item.interpretation}</small></div>
          <div><span className="label">Lakukan</span><strong>{item.nextAction}</strong><small>{item.asset} · {item.wait}</small></div>
          <div><span className="label">CRM</span><strong>{item.crmStage}</strong><small>{item.exit}</small></div>
        </div>
      ))}</div></div> : null}

      {tab === "offer" ? <div className="offer-grid">{liveOffers.map((item) => (
        <article className="panel offer-card" key={item.name}>
          <p className="eyebrow">{item.startingRange}</p><h2>{item.name}</h2><p>{item.target}</p>
          <div className="offer-scope">{item.scope}</div>
          <dl className="definition-list compact-def"><div><dt>Pembayaran</dt><dd>{item.payment}</dd></div><div><dt>Cocok untuk</dt><dd>{item.bestUse}</dd></div><div><dt>Guardrail</dt><dd>{item.guardrail}</dd></div></dl>
        </article>
      ))}</div> : null}

      {tab === "proposal" ? <div className="proposal-list">{liveProposalSections.map((item) => (
        <article className="panel proposal-card" key={item.section}>
          <p className="eyebrow">{item.owner}</p><h2>{item.section}</h2><p>{item.purpose}</p>
          <dl className="definition-list"><div><dt>Wajib ada</dt><dd>{item.mustInclude}</dd></div><div><dt>Jangan masukkan</dt><dd>{item.doNotInclude}</dd></div><div><dt>Pertanyaan client</dt><dd>{item.clientQuestion}</dd></div><div><dt>Gate</dt><dd>{item.gate}</dd></div></dl>
        </article>
      ))}</div> : null}

      {tab === "audit" ? <section className="panel reference-page-panel"><RawSheetView data={liveMiniAudit as RawSheet} intro="Checklist Mini Audit dari Excel tetap lengkap, tetapi dibuka hanya saat lead sudah memberi izin atau menunjukkan ketertarikan." /></section> : null}
    </>
  );
}
