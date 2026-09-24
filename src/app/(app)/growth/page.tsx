"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { useReferenceData } from "@/modules/reference/reference.hooks";
import contentPlan from "@/data/seed/content-plan.json";
import growthPlan from "@/data/seed/growth-plan.json";
import partnerships from "@/data/seed/partnerships.json";
import portfolioProof from "@/data/seed/portfolio-proof.json";

type Tab = "content" | "plan" | "partners" | "portfolio";

const tabs: Array<{ key: Tab; label: string; description: string }> = [
  { key: "content", label: "Konten", description: "Kalender konten, strategi kanal, distribusi pendiri, kampanye audit, dan rencana situs web." },
  { key: "plan", label: "Rencana pertumbuhan", description: "Rencana kerja 30 hari, peta jalan 30/60/90 hari, dan pembagian peran." },
  { key: "partners", label: "Kemitraan", description: "Kerja sama mitra, menghubungi kembali relasi lama, dan program referensi." },
  { key: "portfolio", label: "Bukti portofolio", description: "Proyek mana yang paling cocok ditunjukkan ke jenis calon klien tertentu." },
];

export default function GrowthPage() {
  const [tab, setTab] = useState<Tab>("content");
  const { data: liveContentPlan } = useReferenceData("content-plan", contentPlan);
  const { data: liveGrowthPlan } = useReferenceData("growth-plan", growthPlan);
  const { data: livePartnerships } = useReferenceData("partnerships", partnerships);
  const { data: livePortfolioProof } = useReferenceData("portfolio-proof", portfolioProof);
  const active = tabs.find((item) => item.key === tab)!;
  const data = tab === "content"
    ? liveContentPlan
    : tab === "plan"
      ? liveGrowthPlan
      : tab === "partners"
        ? livePartnerships
        : livePortfolioProof;

  return (
    <>
      <PageHeader
        eyebrow="Rencana pertumbuhan"
        title="Strategi untuk menambah peluang baru"
        description="Gunakan halaman ini untuk perencanaan mingguan atau bulanan. Pekerjaan harian tetap dikerjakan dari menu Hari ini."
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
