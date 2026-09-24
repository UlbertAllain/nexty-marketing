import { createStructuredWebResponse } from "@/lib/ai/openai-responses";
import type { Lead } from "@/modules/leads/types";
import {
  AI_RESEARCH_JSON_SCHEMA,
  aiResearchResultSchema,
} from "./intelligence.schema";
import { buildResearchPrompt } from "./prompts";
import type {
  ResearchAnalysisDraft,
  ResearchEvidence,
} from "./types";

function normalizeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathname =
      url.pathname.length > 1
        ? url.pathname.replace(/\/+$/, "")
        : url.pathname;
    return `${hostname}${pathname}`;
  } catch {
    return null;
  }
}

function buildTrustedUrlSet(sourceUrls: string[]): Set<string> {
  const trustedUrls = new Set<string>();

  for (const sourceUrl of sourceUrls) {
    const normalized = normalizeUrl(sourceUrl);
    if (normalized) trustedUrls.add(normalized);
  }

  return trustedUrls;
}

function keepTrustedSources(
  sources: Array<Omit<ResearchEvidence, "checkedAt">>,
  trustedUrls: Set<string>,
  checkedAt: string,
): ResearchEvidence[] {
  const seenIds = new Set<string>();

  return sources
    .filter((source) => {
      if (seenIds.has(source.id)) return false;
      const normalized = normalizeUrl(source.url);
      if (!normalized || !trustedUrls.has(normalized)) return false;
      seenIds.add(source.id);
      return true;
    })
    .map((source) => ({
      ...source,
      excerpt: source.excerpt || undefined,
      checkedAt,
    }));
}

function sanitizeEvidenceIds(ids: string[], validIds: Set<string>): string[] {
  return [...new Set(ids.filter((id) => validIds.has(id)))];
}

export async function researchLeadWithOpenAI(
  lead: Lead,
): Promise<ResearchAnalysisDraft> {
  const prompt = buildResearchPrompt(lead);
  const response = await createStructuredWebResponse({
    instructions: prompt.instructions,
    input: prompt.input,
    jsonSchema: AI_RESEARCH_JSON_SCHEMA,
  });

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(response.outputText);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  const parsed = aiResearchResultSchema.parse(parsedJson);
  const checkedAt = new Date().toISOString();
  const trustedUrls = buildTrustedUrlSet(response.sourceUrls);

  if (!trustedUrls.size) {
    throw new Error("OPENAI_RESEARCH_HAS_NO_WEB_SOURCES");
  }

  const sources = keepTrustedSources(parsed.sources, trustedUrls, checkedAt);
  if (!sources.length) {
    throw new Error("OPENAI_RESEARCH_HAS_NO_VERIFIED_SOURCES");
  }

  const validEvidenceIds = new Set(sources.map((source) => source.id));

  const assets = parsed.assets
    .map((asset) => ({
      ...asset,
      value: asset.value || undefined,
      evidenceIds: sanitizeEvidenceIds(asset.evidenceIds, validEvidenceIds),
    }))
    .filter((asset) => asset.evidenceIds.length > 0);

  const findings = parsed.findings
    .map((finding) => ({
      ...finding,
      interpretation: finding.interpretation || undefined,
      evidenceIds: sanitizeEvidenceIds(finding.evidenceIds, validEvidenceIds),
    }))
    .filter((finding) => finding.evidenceIds.length > 0);

  const gaps = parsed.gaps
    .map((gap) => ({
      ...gap,
      evidenceIds: sanitizeEvidenceIds(gap.evidenceIds, validEvidenceIds),
    }))
    .filter((gap) => gap.evidenceIds.length > 0);

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
    model: response.model,
  };
}
