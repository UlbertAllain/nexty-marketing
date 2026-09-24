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

    return errorResponse(
      500,
      "Riset AI gagal diproses. Coba lagi setelah konfigurasi dan koneksi diperiksa.",
    );
  }
}
