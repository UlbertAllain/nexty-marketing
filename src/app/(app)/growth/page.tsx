"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import contentPlan from "@/data/seed/content-plan.json";
import growthPlan from "@/data/seed/growth-plan.json";
import partnerships from "@/data/seed/partnerships.json";
import portfolioProof from "@/data/seed/portfolio-proof.json";

type Tab = "content" | "plan" | "partners" | "portfolio";

const tabs: Array<{ key: Tab; label: string; description: string }> = [
  { key: "content", label: "Content", description: "Kalender, channel strategy, founder distribution, audit campaign, dan website plan." },
  { key: "plan", label: "Growth Plan", description: "30-day war plan, roadmap 30/60/90 hari, dan pembagian peran." },
  { key: "partners", label: "Partnerships", description: "White-label, reactivation, dan referral program." },
  { key: "portfolio", label: "Portfolio Proof", description: "Project mana yang cocok ditunjukkan ke jenis prospect tertentu." },
];

export default function GrowthPage() {
  const [tab, setTab] = useState<Tab>("content");
  const active = tabs.find((item) => item.key === tab)!;
  const data = tab === "content" ? contentPlan : tab === "plan" ? growthPlan : tab === "partners" ? partnerships : portfolioProof;

  return (
    <>
      <PageHeader
        eyebrow="Growth workspace"
        title="Planning yang tidak mengganggu kerja harian"
        description="Data Content Plan, Growth Plan, Partnership, Referral, Reactivation, dan Portfolio Proof dari Excel tetap masuk — tapi dikumpulkan dalam satu halaman supaya sidebar tidak penuh."
      />
      <div className="tool-tabs growth-tabs">
        {tabs.map((item) => <button key={item.key} className={tab === item.key ? "active" : ""} onClick={() => setTab(item.key)}>{item.label}</button>)}
      </div>
      <section className="panel reference-page-panel">
        <div className="panel-heading"><div><p className="eyebrow">{active.label}</p><h2>{active.description}</h2></div></div>
        <RawSheetView data={data as RawSheet} />
      </section>
    </>
  );
}
