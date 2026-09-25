const GROQ_RESPONSES_URL = "https://api.groq.com/openai/v1/responses";
const DEFAULT_RESEARCH_MODEL = "openai/gpt-oss-120b";

type OutputContent = {
  type?: string;
  text?: string;
};

type GroqOutputItem = {
  type?: string;
  content?: OutputContent[];
};

type GroqResponse = {
  status?: string;
  error?: {
    message?: string;
  } | null;
  output?: GroqOutputItem[];
};

export interface StructuredGroqRequest {
  instructions: string;
  input: string;
  jsonSchema: unknown;
}

export interface StructuredGroqResponse {
  model: string;
  outputText: string;
}

function getGroqConfig() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");

  return {
    apiKey,
    model: process.env.GROQ_RESEARCH_MODEL || DEFAULT_RESEARCH_MODEL,
  };
}

function extractOutputText(response: GroqResponse): string {
  return (response.output ?? [])
    .filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((content) => content.type === "output_text")
    .map((content) => content.text ?? "")
    .join("")
    .trim();
}

export async function createGroqStructuredResponse(
  request: StructuredGroqRequest,
): Promise<StructuredGroqResponse> {
  const { apiKey, model } = getGroqConfig();

  const response = await fetch(GROQ_RESPONSES_URL, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions: request.instructions,
      input: request.input,
      text: {
        format: request.jsonSchema,
      },
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as GroqResponse;

  if (!response.ok) {
    throw new Error(
      `GROQ_REQUEST_FAILED_${response.status}: ${payload.error?.message || "Unknown Groq error"}`,
    );
  }

  if (payload.status && payload.status !== "completed") {
    throw new Error(`GROQ_RESPONSE_${payload.status.toUpperCase()}`);
  }

  const outputText = extractOutputText(payload);
  if (!outputText) throw new Error("GROQ_EMPTY_OUTPUT");

  return {
    model,
    outputText,
  };
}
