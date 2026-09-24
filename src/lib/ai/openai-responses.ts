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

export interface StructuredWebResponse {
  model: string;
  outputText: string;
  sourceUrls: string[];
}

export interface StructuredWebRequest {
  instructions: string;
  input: string;
  jsonSchema: unknown;
}

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

function collectSourceUrls(response: OpenAIResponse): string[] {
  const urls = new Set<string>();

  for (const item of response.output ?? []) {
    for (const source of item.action?.sources ?? []) {
      if (source.url) urls.add(source.url);
    }

    if (item.action?.url) urls.add(item.action.url);

    for (const content of item.content ?? []) {
      for (const annotation of content.annotations ?? []) {
        if (annotation.type === "url_citation" && annotation.url) {
          urls.add(annotation.url);
        }
      }
    }
  }

  return [...urls];
}

export async function createStructuredWebResponse(
  request: StructuredWebRequest,
): Promise<StructuredWebResponse> {
  const { apiKey, model } = getOpenAIConfig();

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
      tool_choice: "auto",
      include: ["web_search_call.action.sources"],
      instructions: request.instructions,
      input: request.input,
      text: {
        format: request.jsonSchema,
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
  if (!outputText) throw new Error("OPENAI_EMPTY_OUTPUT");

  return {
    model,
    outputText,
    sourceUrls: collectSourceUrls(payload),
  };
}
