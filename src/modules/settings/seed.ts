"use client";

import { collection, doc, getDocs, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import targets from "@/data/seed/targets.json";
import prospects from "@/data/seed/prospect-pool.json";
import socialProfiles from "@/data/seed/social-media.json";
import researchQueue from "@/data/seed/research-queue.json";
import dailyKpis from "@/data/seed/daily-kpi.json";
import researchSources from "@/data/seed/sources.json";
import excelWorkbook from "@/data/seed/excel-workbook.json";
import commonTemplates from "@/data/seed/common-templates.json";
import objections from "@/data/seed/objections.json";
import discovery from "@/data/seed/discovery.json";
import offers from "@/data/seed/offers.json";
import conversationTree from "@/data/seed/conversation-tree.json";
import proposalSections from "@/data/seed/proposal-sections.json";
import miniAudit from "@/data/seed/mini-audit.json";
import weeklyReview from "@/data/seed/weekly-review.json";
import cashflow from "@/data/seed/cashflow.json";
import contentPlan from "@/data/seed/content-plan.json";
import growthPlan from "@/data/seed/growth-plan.json";
import partnerships from "@/data/seed/partnerships.json";
import portfolioProof from "@/data/seed/portfolio-proof.json";
import excelCoverage from "@/data/seed/excel-coverage.json";
import { buildIndonesianLeadTemplates, DEFAULT_PERSONALIZATION_CHECKLIST, DEFAULT_RESEARCH_GUARDRAIL, toIndonesianMarketingCopy, toIndonesianResearchField, toNaturalIndonesianResearchText } from "@/modules/leads/copy";

function chunk<T>(items: T[], size = 350) {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) result.push(items.slice(i, i + size));
  return result;
}

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function writeCollection<T>(name: string, items: T[], idFor: (item: T, index: number) => string) {
  for (const group of chunk(items)) {
    const batch = writeBatch(db);
    group.forEach((item, index) => {
      batch.set(doc(db, name, idFor(item, index)), { ...(item as object), updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
  }
}

export async function seedWorkspace() {
  const existingLeadSnapshot = await getDocs(collection(db, "leads"));
  const existingLeadIds = new Set(existingLeadSnapshot.docs.map((item) => item.id));

  for (const group of chunk(targets)) {
    const batch = writeBatch(db);
    group.forEach((lead) => {
      const exists = existingLeadIds.has(lead.id);
      const localizedLead = {
        ...lead,
        niche: toIndonesianMarketingCopy(lead.niche),
        primaryDigitalAsset: toIndonesianResearchField("primaryDigitalAsset", lead.primaryDigitalAsset),
        hasNow: toIndonesianResearchField("hasNow", lead.hasNow),
        verifiedGap: toIndonesianResearchField("verifiedGap", lead.verifiedGap),
        publicFriction: toIndonesianResearchField("publicFriction", lead.publicFriction),
        evidenceStatus: toIndonesianResearchField("evidenceStatus", lead.evidenceStatus),
        recommendedOffer: toIndonesianResearchField("recommendedOffer", lead.recommendedOffer),
        solutionConcept: toIndonesianResearchField("solutionConcept", lead.solutionConcept),
        firstContactAngle: toIndonesianResearchField("firstContactAngle", lead.firstContactAngle),
        nextAction: toIndonesianResearchField("nextAction", lead.nextAction),
        guardrail: toIndonesianResearchField("guardrail", lead.guardrail) || DEFAULT_RESEARCH_GUARDRAIL,
        personalizationChecklist: DEFAULT_PERSONALIZATION_CHECKLIST,
        templates: buildIndonesianLeadTemplates(lead.business, lead.primaryDigitalAsset),
        social: lead.social ? {
          ...lead.social,
          niche: toIndonesianMarketingCopy(lead.social.niche),
          notes: toNaturalIndonesianResearchText(lead.social.notes, ""),
        } : lead.social,
      };
      const payload: Record<string, unknown> = { ...localizedLead, updatedAt: serverTimestamp() };
      if (exists) {
        // Enrich the research/template/social dataset without destroying live CRM progress.
        delete payload.stage;
        delete payload.nextAction;
        delete payload.notes;
        delete payload.firstContactAt;
        delete payload.lastContactAt;
        delete payload.nextFollowUpAt;
        delete payload.createdAt;
      } else {
        payload.createdAt = serverTimestamp();
      }
      batch.set(doc(db, "leads", lead.id), payload, { merge: true });
    });
    await batch.commit();
  }

  const localizedProspects = prospects.map((item) => ({
    ...item,
    niche: toIndonesianMarketingCopy(item.niche),
    publicAssets: toNaturalIndonesianResearchText(item.publicAssets, "Informasi publik perlu diperiksa kembali."),
    potentialGap: toNaturalIndonesianResearchText(item.potentialGap, "Peluang perbaikan masih perlu divalidasi."),
    publicFriction: toNaturalIndonesianResearchText(item.publicFriction, "Belum ada masalah publik yang tervalidasi."),
    recommendedOffer: toIndonesianMarketingCopy(item.recommendedOffer),
    notes: toNaturalIndonesianResearchText(item.notes, "Periksa kembali informasi publik terbaru sebelum menghubungi."),
  }));

  const localizedSocialProfiles = socialProfiles.map((item) => ({
    ...item,
    niche: toIndonesianMarketingCopy(item.niche),
    notes: toNaturalIndonesianResearchText(item.notes, ""),
  }));

  const localizedResearchQueue = researchQueue.map((item) => ({
    ...item,
    niche: toIndonesianMarketingCopy(item.niche),
    whyInteresting: toNaturalIndonesianResearchText(item.whyInteresting),
    nextResearch: toNaturalIndonesianResearchText(item.nextResearch, "Periksa kembali kanal publik terbaru sebelum menghubungi."),
    recommendedOffer: toIndonesianMarketingCopy(item.recommendedOffer),
    decision: toIndonesianMarketingCopy(item.decision),
  }));

  const localizedResearchSources = researchSources.map((item) => ({
    ...item,
    sourceType: toIndonesianMarketingCopy(item.sourceType),
    usedFor: toNaturalIndonesianResearchText(item.usedFor, "Digunakan untuk mendukung riset bisnis."),
    confidence: toNaturalIndonesianResearchText(item.confidence, "Perlu diverifikasi kembali sebelum digunakan."),
  }));

  await writeCollection("prospects", localizedProspects, (item) => (item as { id: string }).id);
  await writeCollection("socialProfiles", localizedSocialProfiles, (item) => (item as { leadId: string }).leadId);
  await writeCollection("researchQueue", localizedResearchQueue, (_, index) => `RQ-${String(index + 1).padStart(3, "0")}`);
  await writeCollection("dailyKpis", dailyKpis, (item) => (item as { id: string }).id);
  await writeCollection("researchSources", localizedResearchSources, (item) => (item as { id: string }).id);

  const referenceDocuments = {
    "common-templates": commonTemplates,
    objections,
    discovery,
    offers,
    "conversation-tree": conversationTree,
    "proposal-sections": proposalSections,
    "mini-audit": miniAudit,
    "weekly-review": weeklyReview,
    cashflow,
    "content-plan": contentPlan,
    "growth-plan": growthPlan,
    partnerships,
    "portfolio-proof": portfolioProof,
    "excel-coverage": excelCoverage,
    "daily-kpis": dailyKpis,
  } as const;

  await Promise.all(
    Object.entries(referenceDocuments).map(([key, payload]) =>
      setDoc(
        doc(db, "referenceData", key),
        { payload, updatedAt: serverTimestamp() },
        { merge: true },
      ),
    ),
  );

  // Exact Excel parity layer: every sheet is also stored as a raw snapshot.
  // This makes the workbook fully traceable even when a cell is not part of a normalized workflow yet.
  const sheets = (excelWorkbook as { sheets: Array<{ name: string; range: string; values: unknown[][]; formulas: unknown[] }> }).sheets;
  for (let i = 0; i < sheets.length; i += 10) {
    const batch = writeBatch(db);
    sheets.slice(i, i + 10).forEach((sheet, offset) => {
      const index = i + offset;
      batch.set(doc(db, "excelSheets", `${String(index).padStart(2, "0")}-${slug(sheet.name)}`), {
        name: sheet.name,
        sourceRange: sheet.range,
        rows: sheet.values,
        formulas: sheet.formulas,
        sourceWorkbook: "Nexty marketing - Social Enriched.xlsx",
        importedAt: serverTimestamp(),
      }, { merge: true });
    });
    await batch.commit();
  }

  await setDoc(doc(db, "meta", "excel-seed-v2"), {
    sourceWorkbook: "Nexty marketing - Social Enriched.xlsx",
    importedAt: serverTimestamp(),
    sheets: sheets.length,
    leads: targets.length,
    prospects: prospects.length,
    socialProfiles: socialProfiles.length,
    researchQueue: researchQueue.length,
    dailyKpis: dailyKpis.length,
    researchSources: researchSources.length,
    referenceDocuments: Object.keys(referenceDocuments).length,
    note: "All 18 Excel sheets are preserved in excelSheets; functional data is additionally normalized into app collections.",
  }, { merge: true });

  return {
    sheets: sheets.length,
    leads: targets.length,
    prospects: prospects.length,
    socialProfiles: socialProfiles.length,
    researchQueue: researchQueue.length,
    dailyKpis: dailyKpis.length,
    researchSources: researchSources.length,
  };
}
