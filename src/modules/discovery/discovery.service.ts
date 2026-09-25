import { createGroqStructuredResponse } from "@/lib/ai/groq-responses";
import { searchWeb, type TavilySearchResult } from "@/lib/search/tavily";
import type { Prospect } from "@/modules/leads/types";
import { matchOffersToGaps } from "@/modules/intelligence/offer-matcher";
import type { BusinessGap } from "@/modules/intelligence/types";
import {
  DISCOVERY_AREA_QUERY,
  DISCOVERY_CATEGORY_QUERY,
  type DiscoveryArea,
  type DiscoveryCategory,
} from "./discovery.constants";
import {
  DISCOVERY_JSON_SCHEMA,
  discoveryAiResultSchema,
} from "./discovery.schema";

type SearchEvidence = {
  id: string;
  title: string;
  url: string;
  excerpt: string;
  score: number;
};

function normalizeIdentity(value: string): string {
  return value.toLowerCase().replace(/\b(pt|cv|ud)\.?\s+/g, "").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function hashIdentity(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function clamp(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function safeHttpUrl(value: string): string {
  if (!value.trim()) return "";

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function mergeSearchResults(results: TavilySearchResult[][]): SearchEvidence[] {
  const seen = new Set<string>();
  const merged: SearchEvidence[] = [];

  for (const group of results) {
    for (const result of group) {
      const url = safeHttpUrl(result.url);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      merged.push({
        id: `src_${merged.length + 1}`,
        title: result.title || url,
        url,
        excerpt: result.content.slice(0, 900),
        score: result.score,
      });
    }
  }

  return merged.slice(0, 32);
}

function buildQueries(area: DiscoveryArea, category: DiscoveryCategory): string[] {
  const areaQuery = DISCOVERY_AREA_QUERY[area];
  return DISCOVERY_CATEGORY_QUERY[category].map(
    (categoryQuery) => `${categoryQuery} ${areaQuery} bisnis usaha website instagram WhatsApp alamat layanan`,
  );
}

function buildPrompt(area: DiscoveryArea, category: DiscoveryCategory, maxCandidates: number, evidence: SearchEvidence[]) {
  return {
    instructions: `
You are the Target Discovery reasoning engine inside NextyLeads.
The application already searched the public web. Identify real businesses from supplied evidence that could plausibly need software or digital services from NextyLabs.

Rules:
1. Use only PUBLIC SEARCH EVIDENCE. Never invent a business.
2. Every candidate must reference at least one supplied evidence ID.
3. Never invent phone, address, rating, website, Instagram, product, or service.
4. Unsupported fields must be empty strings or 0.
5. Prefer operating businesses in the requested area.
6. Do not infer private internal systems or workflows.
7. Missing public capability only means "not found in checked public sources".
8. Prefer candidates with concrete observable digital opportunity relevant to NextyLabs.
9. Avoid government entities, giant national brands, marketplaces, news sites, and businesses outside the requested area.
10. Fewer verified candidates are better than weak or fabricated candidates.
11. Signals are research signals only; the application calculates final fit.
12. Write summaries in natural Indonesian.
`.trim(),
    input: `
REQUEST
Area: ${area}
Category: ${category}
Maximum candidates: ${maxCandidates}

PUBLIC SEARCH EVIDENCE
${JSON.stringify(evidence, null, 2)}

For each candidate, identify offering, visible digital assets, one evidence-backed opportunity, why it may fit NextyLabs, allowed gap tags, explicit rating/reviews if present, and four research signals from 0-100.
`.trim(),
  };
}

function buildOffer(candidate: { potentialGap: string; gapTags: string[]; evidenceIds: string[] }) {
  if (!candidate.gapTags.length) return null;

  const gap: BusinessGap = {
    id: "discovery-gap",
    category: "digital_presence",
    title: "Discovery opportunity",
    description: candidate.potentialGap,
    impact: candidate.potentialGap,
    evidenceIds: candidate.evidenceIds,
    confidence: "medium",
    tags: candidate.gapTags,
  };

  return matchOffersToGaps([gap], 1)[0] ?? null;
}

function calculateFitScore(signals: { businessRelevance: number; digitalOpportunity: number; contactability: number; evidenceStrength: number }, serviceFit: number): number {
  return clamp(
    signals.businessRelevance * 0.25 +
    signals.digitalOpportunity * 0.30 +
    signals.contactability * 0.15 +
    signals.evidenceStrength * 0.15 +
    serviceFit * 0.15,
  );
}

export async function discoverProspects(input: {
  area: DiscoveryArea;
  category: DiscoveryCategory;
  maxCandidates: number;
  existingBusinessNames: Set<string>;
  runId: string;
}): Promise<{ prospects: Prospect[]; searchedSources: number; analyzedCandidates: number; duplicates: number }> {
  const queries = buildQueries(input.area, input.category);
  const searchGroups = await Promise.all(queries.map((query) => searchWeb(query, 8)));
  const evidence = mergeSearchResults(searchGroups);

  if (!evidence.length) throw new Error("DISCOVERY_NO_SEARCH_RESULTS");

  const prompt = buildPrompt(input.area, input.category, input.maxCandidates, evidence);
  const response = await createGroqStructuredResponse({
    instructions: prompt.instructions,
    input: prompt.input,
    jsonSchema: DISCOVERY_JSON_SCHEMA,
  });

  let raw: unknown;
  try {
    raw = JSON.parse(response.outputText);
  } catch {
    throw new Error("DISCOVERY_INVALID_JSON");
  }

  const parsed = discoveryAiResultSchema.parse(raw);
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const localSeen = new Set<string>();
  const prospects: Prospect[] = [];
  let duplicates = 0;

  for (const candidate of parsed.candidates.slice(0, input.maxCandidates)) {
    const identity = normalizeIdentity(candidate.business);
    if (!identity) continue;

    if (input.existingBusinessNames.has(identity) || localSeen.has(identity)) {
      duplicates += 1;
      continue;
    }

    const validEvidenceIds = [...new Set(candidate.evidenceIds.filter((id) => evidenceById.has(id)))];
    if (!validEvidenceIds.length) continue;

    localSeen.add(identity);
    const offer = buildOffer({ potentialGap: candidate.potentialGap, gapTags: candidate.gapTags, evidenceIds: validEvidenceIds });
    const fitScore = calculateFitScore(candidate.signals, offer?.fitScore ?? 0);
    const sourceUrls = validEvidenceIds.map((id) => evidenceById.get(id)?.url || "").filter(Boolean);

    prospects.push({
      id: `AI-${hashIdentity(identity)}`,
      targetId: "",
      business: candidate.business,
      region: candidate.region || input.area,
      niche: candidate.niche,
      rating: candidate.rating,
      reviews: candidate.reviews,
      phone: candidate.phone,
      publicAssets: candidate.publicAssets,
      researchLevel: candidate.signals.evidenceStrength >= 70 ? "AI Discovery · Evidence kuat" : "AI Discovery · Perlu verifikasi",
      potentialGap: candidate.potentialGap,
      publicFriction: candidate.publicFriction,
      recommendedOffer: offer?.serviceName || "Audit Digital Bisnis",
      authorityRisk: candidate.signals.contactability >= 70 ? "Low" : candidate.signals.contactability >= 40 ? "Medium" : "High",
      fitScore,
      poolStatus: "Discovered",
      source1: sourceUrls[0] || "",
      source2: sourceUrls[1] || "",
      notes: candidate.whyPotential,
      website: safeHttpUrl(candidate.website),
      instagram: safeHttpUrl(candidate.instagram),
      address: candidate.address,
      offerSummary: candidate.offerSummary,
      discoveryRunId: input.runId,
      discoveredAt: new Date().toISOString(),
      discoverySourceCount: validEvidenceIds.length,
    });
  }

  return {
    prospects,
    searchedSources: evidence.length,
    analyzedCandidates: parsed.candidates.length,
    duplicates,
  };
}

export function normalizeDiscoveryBusinessName(value: string): string {
  return normalizeIdentity(value);
}
