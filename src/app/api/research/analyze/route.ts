import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  getBearerToken,
  verifyFirebaseIdToken,
} from "@/lib/firebase/server-rest";
import { buildResearchAnalysis } from "@/modules/intelligence/intelligence.service";
import { researchRequestSchema } from "@/modules/intelligence/intelligence.schema";
import { researchLeadWithOpenAI } from "@/modules/intelligence/openai-research.service";
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

function mapResearchError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message === "OPENAI_API_KEY is not configured.") {
    const environment = process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown";
    return errorResponse(
      503,
      "OPENAI_API_KEY belum tersedia pada environment deployment ini.",
      [
        `Environment aktif: ${environment}.`,
        "Jika memakai branch preview, aktifkan variable untuk Preview lalu redeploy.",
      ],
    );
  }

  if (message.startsWith("OPENAI_REQUEST_FAILED_401")) {
    return errorResponse(
      502,
      "API key OpenAI ditolak.",
      ["Periksa apakah OPENAI_API_KEY benar, masih aktif, dan berasal dari project OpenAI yang tepat."],
    );
  }

  if (message.startsWith("OPENAI_REQUEST_FAILED_403")) {
    return errorResponse(
      502,
      "Project OpenAI tidak memiliki izin untuk request ini.",
      ["Periksa permission API key dan akses model pada project OpenAI."],
    );
  }

  if (message.startsWith("OPENAI_REQUEST_FAILED_429")) {
    return errorResponse(
      429,
      "Quota atau rate limit OpenAI sedang membatasi request.",
      ["Periksa API Billing, credit balance, usage limit, dan rate limit project OpenAI."],
    );
  }

  if (message.startsWith("OPENAI_REQUEST_FAILED_400")) {
    return errorResponse(
      502,
      "OpenAI menolak konfigurasi request.",
      [
        "Periksa OPENAI_RESEARCH_MODEL dan konfigurasi Responses API.",
        "Model default yang dipakai aplikasi adalah gpt-5.6-terra.",
      ],
    );
  }

  if (
    message === "OPENAI_RESEARCH_HAS_NO_WEB_SOURCES" ||
    message === "OPENAI_RESEARCH_HAS_NO_VERIFIED_SOURCES"
  ) {
    return errorResponse(
      422,
      "AI belum menemukan sumber publik yang cukup untuk membuat analisis terverifikasi.",
      ["Coba pastikan nama bisnis, website, atau profil sosial lead sudah cukup spesifik lalu jalankan riset ulang."],
    );
  }

  if (
    message === "OPENAI_EMPTY_OUTPUT" ||
    message === "OPENAI_INVALID_JSON" ||
    message.startsWith("OPENAI_RESPONSE_")
  ) {
    return errorResponse(
      502,
      "Respons model AI belum dapat diproses dengan aman.",
      ["Silakan coba riset ulang. Jika berulang, cek log server untuk detail provider."],
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
    return errorResponse(401, "Sesi tidak valid atau sudah kedaluwarsa.");
  }

  try {
    const body = await request.json();
    const { leadId } = researchRequestSchema.parse(body);

    const lead = await getLeadForResearch(leadId, idToken);
    if (!lead) {
      return errorResponse(404, "Calon klien tidak ditemukan.");
    }

    const draft = await researchLeadWithOpenAI(lead);
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
