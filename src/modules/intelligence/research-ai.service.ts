import { createGroqStructuredResponse } from "@/lib/ai/groq-responses";
import { searchWeb, type TavilySearchResult } from "@/lib/search/tavily";
import type { Lead } from "@/modules/leads/types";
import {
  AI_RESEARCH_JSON_SCHEMA,
  aiResearchResultSchema,
} from "./intelligence.schema";
import {
  buildProspectSearchQuery,
  buildResearchPrompt,
} from "./prompts";
import type {
  EvidenceType,
  ResearchAnalysisDraft,
  ResearchConfidence,
  ResearchEvidence,
} from "./types";

function getEvidenceType(url: string): EvidenceType {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (
      hostname.includes("instagram.com") ||
      hostname.includes("facebook.com") ||
      hostname.includes("linkedin.com") ||
      hostname.includes("tiktok.com") ||
      hostname.includes("x.com") ||
      hostname.includes("twitter.com")
    ) {
      return "social";
    }

    if (
      hostname.includes("google.com") ||
      hostname.includes("google.co.id") ||
      hostname.includes("maps.app.goo.gl")
    ) {
      return "google_business";
    }

    return "website";
  } catch {
    return "other";
  }
}

function getEvidenceConfidence(score: number): ResearchConfidence {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

function toResearchEvidence(
  results: TavilySearchResult[],
  checkedAt: string,
): ResearchEvidence[] {
  const seenUrls = new Set<string>();

  return results
    .filter((result) => {
      if (seenUrls.has(result.url)) return false;
      seenUrls.add(result.url);
      return true;
    })
    .map((result, index) => ({
      id: `src_${index + 1}`,
      type: getEvidenceType(result.url),
      title: result.title || result.url,
      url: result.url,
      excerpt: result.content.slice(0, 800) || undefined,
      checkedAt,
      confidence: getEvidenceConfidence(result.score),
    }));
}

function sanitizeEvidenceIds(
  ids: string[],
  validIds: Set<string>,
): string[] {
  return [...new Set(ids.filter((id) => validIds.has(id)))];
}

export async function researchLead(
  lead: Lead,
): Promise<ResearchAnalysisDraft> {
  const checkedAt = new Date().toISOString();
  const query = buildProspectSearchQuery(lead);
  const searchResults = await searchWeb(query, 8);

  if (!searchResults.length) {
    throw new Error("TAVILY_NO_RESULTS");
  }

  const availableSources = toResearchEvidence(searchResults, checkedAt);
  const validEvidenceIds = new Set(
    availableSources.map((source) => source.id),
  );

  const prompt = buildResearchPrompt(lead, availableSources);
  const response = await createGroqStructuredResponse({
    instructions: prompt.instructions,
    input: prompt.input,
    jsonSchema: AI_RESEARCH_JSON_SCHEMA,
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(response.outputText);
  } catch {
    throw new Error("GROQ_INVALID_JSON");
  }

  const parsed = aiResearchResultSchema.parse(parsedJson);

  const assets = parsed.assets
    .map((asset) => ({
      ...asset,
      value: asset.value || undefined,
      evidenceIds: sanitizeEvidenceIds(
        asset.evidenceIds,
        validEvidenceIds,
      ),
    }))
    .filter((asset) => asset.evidenceIds.length > 0);

  const findings = parsed.findings
    .map((finding) => ({
      ...finding,
      interpretation: finding.interpretation || undefined,
      evidenceIds: sanitizeEvidenceIds(
        finding.evidenceIds,
        validEvidenceIds,
      ),
    }))
    .filter((finding) => finding.evidenceIds.length > 0);

  const gaps = parsed.gaps
    .map((gap) => ({
      ...gap,
      evidenceIds: sanitizeEvidenceIds(
        gap.evidenceIds,
        validEvidenceIds,
      ),
    }))
    .filter((gap) => gap.evidenceIds.length > 0);

  const usedEvidenceIds = new Set([
    ...assets.flatMap((asset) => asset.evidenceIds),
    ...findings.flatMap((finding) => finding.evidenceIds),
    ...gaps.flatMap((gap) => gap.evidenceIds),
  ]);

  const sources = availableSources.filter((source) =>
    usedEvidenceIds.has(source.id),
  );

  if (!sources.length) {
    throw new Error("RESEARCH_HAS_NO_VERIFIED_EVIDENCE");
  }

  return {
    leadId: lead.id,
    business: lead.business,
    summary: parsed.summary,
    assets,
    findings,
    gaps,
    scoringSignals: parsed.scoringSignals,
    outreach: parsed.outreach,
    sources,
    model: `groq:${response.model}`,
  };
}
