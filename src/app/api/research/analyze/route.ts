import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerToken,
  verifyFirebaseIdToken,
} from "@/lib/firebase/server-rest";
import { buildResearchAnalysis } from "@/modules/intelligence/intelligence.service";
import { researchRequestSchema } from "@/modules/intelligence/intelligence.schema";
import { researchLead } from "@/modules/intelligence/research-ai.service";
import {
  getLeadForResearch,
  saveResearchAnalysis,
} from "@/modules/intelligence/research.repository.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorResponse(
  status: number,
  message: string,
  errors: string[] = [],
) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

function environmentHelp(variable: string) {
  const environment =
    process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown";

  return [
    `Environment aktif: ${environment}.`,
    `Pastikan ${variable} aktif untuk Preview lalu redeploy.`,
  ];
}

function mapResearchError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message === "GROQ_API_KEY is not configured.") {
    return errorResponse(
      503,
      "GROQ_API_KEY belum tersedia pada deployment ini.",
      environmentHelp("GROQ_API_KEY"),
    );
  }

  if (message === "TAVILY_API_KEY is not configured.") {
    return errorResponse(
      503,
      "TAVILY_API_KEY belum tersedia pada deployment ini.",
      environmentHelp("TAVILY_API_KEY"),
    );
  }

  if (message.startsWith("GROQ_REQUEST_FAILED_401")) {
    return errorResponse(
      502,
      "API key Groq ditolak.",
      ["Periksa GROQ_API_KEY dan pastikan key masih aktif."],
    );
  }

  if (message.startsWith("GROQ_REQUEST_FAILED_403")) {
    return errorResponse(
      502,
      "Groq tidak mengizinkan model atau request ini.",
      ["Periksa model permission dan GROQ_RESEARCH_MODEL."],
    );
  }

  if (message.startsWith("GROQ_REQUEST_FAILED_429")) {
    return errorResponse(
      429,
      "Free-tier Groq sedang terkena rate limit.",
      ["Tunggu sebentar lalu jalankan riset ulang."],
    );
  }

  if (message.startsWith("GROQ_REQUEST_FAILED_400")) {
    return errorResponse(
      502,
      "Groq menolak konfigurasi model atau structured output.",
      [
        "Periksa GROQ_RESEARCH_MODEL.",
        "Default aplikasi: openai/gpt-oss-120b.",
      ],
    );
  }

  if (message.startsWith("TAVILY_REQUEST_FAILED_401")) {
    return errorResponse(
      502,
      "API key Tavily ditolak.",
      ["Periksa TAVILY_API_KEY dan pastikan key masih aktif."],
    );
  }

  if (message.startsWith("TAVILY_REQUEST_FAILED_429")) {
    return errorResponse(
      429,
      "Credit atau rate limit Tavily sedang membatasi pencarian.",
      ["Periksa credit Tavily atau tunggu sebelum menjalankan riset ulang."],
    );
  }

  if (message.startsWith("TAVILY_REQUEST_FAILED_")) {
    return errorResponse(
      502,
      "Tavily gagal mengambil sumber publik.",
      ["Periksa status Tavily dan konfigurasi search API."],
    );
  }

  if (message === "TAVILY_NO_RESULTS") {
    return errorResponse(
      422,
      "Belum ditemukan sumber publik yang cukup untuk calon klien ini.",
      ["Pastikan nama bisnis, area, website, atau profil sosial cukup spesifik."],
    );
  }

  if (
    message === "GROQ_EMPTY_OUTPUT" ||
    message === "GROQ_INVALID_JSON" ||
    message.startsWith("GROQ_RESPONSE_")
  ) {
    return errorResponse(
      502,
      "Respons Groq belum dapat diproses dengan aman.",
      ["Silakan coba riset ulang. Jika berulang, cek log server."],
    );
  }

  if (message === "RESEARCH_HAS_NO_VERIFIED_EVIDENCE") {
    return errorResponse(
      422,
      "AI belum menghasilkan temuan yang dapat dihubungkan ke evidence Tavily.",
      ["Coba riset ulang atau lengkapi website/profil sosial calon klien."],
    );
  }

  if (message.startsWith("FIRESTORE_")) {
    return errorResponse(
      502,
      "Data riset gagal dibaca atau disimpan ke Firestore.",
      ["Periksa Firebase project, authentication, dan Firestore Security Rules."],
    );
  }

  return errorResponse(
    500,
    "Riset AI gagal diproses karena error server yang belum teridentifikasi.",
    ["Periksa Function Logs Vercel untuk request /api/research/analyze."],
  );
}

export async function POST(request: Request) {
  const idToken = getBearerToken(request);
  if (!idToken) {
    return errorResponse(401, "Autentikasi diperlukan.");
  }

  try {
    await verifyFirebaseIdToken(idToken);
  } catch {
    return errorResponse(
      401,
      "Sesi tidak valid atau sudah kedaluwarsa.",
    );
  }

  try {
    const body = await request.json();
    const { leadId } = researchRequestSchema.parse(body);

    const lead = await getLeadForResearch(leadId, idToken);
    if (!lead) {
      return errorResponse(404, "Calon klien tidak ditemukan.");
    }

    const draft = await researchLead(lead);
    const analysis = buildResearchAnalysis(draft);

    await saveResearchAnalysis(analysis, idToken);

    return NextResponse.json({
      success: true,
      message: "Riset AI selesai dan tersimpan.",
      data: analysis,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        400,
        "Data riset tidak valid.",
        error.issues.map((issue) => issue.message),
      );
    }

    console.error("AI research failed:", error);
    return mapResearchError(error);
  }
}
