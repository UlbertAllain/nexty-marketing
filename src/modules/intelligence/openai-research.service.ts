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

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const DEFAULT_RESEARCH_MODEL = "gpt-5.6-terra";

type UrlSource = {
  url?: string;
};

type UrlAnnotation = {
  type?: string;
  url?: string;
};

type OutputContent = {
  type?: string;
  text?: string;
  annotations?: UrlAnnotation[];
};

type OpenAIOutputItem = {
  type?: string;
  action?: {
    sources?: UrlSource[];
    url?: string;
  };
  content?: OutputContent[];
};

type OpenAIResponse = {
  status?: string;
  error?: {
    message?: string;
  } | null;
  output?: OpenAIOutputItem[];
};

function getOpenAIConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured.");

  return {
    apiKey,
    model: process.env.OPENAI_RESEARCH_MODEL || DEFAULT_RESEARCH_MODEL,
  };
}

function extractOutputText(response: OpenAIResponse): string {
  return (response.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .join("")
    .trim();
}

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

function extractTrustedUrls(response: OpenAIResponse): Set<string> {
  const urls = new Set<string>();

  for (const item of response.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      const normalized = source.url ? normalizeUrl(source.url) : null;
      if (normalized) urls.add(normalized);
    }

    if (item.action?.url) {
      const normalized = normalizeUrl(item.action.url);
      if (normalized) urls.add(normalized);
    }

    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type !== "url_citation" || !annotation.url) continue;
        const normalized = normalizeUrl(annotation.url);
        if (normalized) urls.add(normalized);
      }
    }
  }

  return urls;
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
  const { apiKey, model } = getOpenAIConfig();
  const prompt = buildResearchPrompt(lead);

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      store: false,
      reasoning: { effort: "medium" },
      tools: [
        {
          type: "web_search",
          search_context_size: "high",
        },
      ],
      instructions: prompt.instructions,
      input: prompt.input,
      text: {
        format: AI_RESEARCH_JSON_SCHEMA,
      },
      max_output_tokens: 7000,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as OpenAIResponse;

  if (!response.ok) {
    throw new Error(
      `OPENAI_REQUEST_FAILED_${response.status}: ${payload.error?.message || "Unknown OpenAI error"}`,
    );
  }

  if (payload.status && payload.status !== "completed") {
    throw new Error(`OPENAI_RESPONSE_${payload.status.toUpperCase()}`);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) {
    throw new Error("OPENAI_EMPTY_OUTPUT");
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(outputText);
  } catch {
    throw new Error("OPENAI_INVALID_JSON");
  }

  const parsed = aiResearchResultSchema.parse(parsedJson);
  const checkedAt = new Date().toISOString();
  const trustedUrls = extractTrustedUrls(payload);

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
    model,
  };
}
