import { z } from "zod";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";

const tavilyResponseSchema = z.object({
  results: z.array(
    z.object({
      title: z.string().catch(""),
      url: z.string().url(),
      content: z.string().catch(""),
      score: z.number().min(0).max(1).catch(0.5),
    }),
  ).catch([]),
});

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

function getTavilyApiKey(): string {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not configured.");
  return apiKey;
}

export async function searchWeb(
  query: string,
  maxResults = 8,
): Promise<TavilySearchResult[]> {
  const response = await fetch(TAVILY_SEARCH_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${getTavilyApiKey()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: query.slice(0, 400),
      topic: "general",
      search_depth: "basic",
      max_results: Math.min(10, Math.max(1, maxResults)),
      include_answer: false,
      include_raw_content: false,
      include_images: false,
    }),
    cache: "no-store",
  });

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error(`TAVILY_REQUEST_FAILED_${response.status}: Invalid JSON response`);
  }

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null && "detail" in payload
        ? String((payload as { detail?: unknown }).detail ?? "Unknown Tavily error")
        : "Unknown Tavily error";

    throw new Error(`TAVILY_REQUEST_FAILED_${response.status}: ${message}`);
  }

  return tavilyResponseSchema.parse(payload).results;
}
