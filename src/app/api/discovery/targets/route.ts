import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getBearerToken, verifyFirebaseIdToken } from "@/lib/firebase/server-rest";
import { discoveryRequestSchema } from "@/modules/discovery/discovery.schema";
import { discoverProspects } from "@/modules/discovery/discovery.service";
import { getExistingDiscoveryBusinessNames, saveDiscoveryRun } from "@/modules/discovery/discovery.repository.server";
import type { DiscoveryRunResult } from "@/modules/discovery/discovery.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function errorResponse(status: number, message: string, errors: string[] = []) {
  return NextResponse.json({ success: false, message, errors }, { status });
}

function mapDiscoveryError(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message === "GROQ_API_KEY is not configured.") return errorResponse(503, "GROQ_API_KEY belum tersedia pada deployment ini.");
  if (message === "TAVILY_API_KEY is not configured.") return errorResponse(503, "TAVILY_API_KEY belum tersedia pada deployment ini.");

  if (message.startsWith("GROQ_REQUEST_FAILED_429") || message.startsWith("TAVILY_REQUEST_FAILED_429")) {
    return errorResponse(429, "Free-tier AI/search sedang terkena rate limit atau credit limit.", ["Tunggu sebentar lalu jalankan discovery lagi."]);
  }

  if (message.startsWith("GROQ_REQUEST_FAILED_401")) return errorResponse(502, "API key Groq ditolak.");
  if (message.startsWith("TAVILY_REQUEST_FAILED_401")) return errorResponse(502, "API key Tavily ditolak.");
  if (message === "DISCOVERY_NO_SEARCH_RESULTS") return errorResponse(422, "Belum ditemukan sumber publik yang cukup untuk area/kategori ini.");
  if (message === "DISCOVERY_INVALID_JSON" || message === "GROQ_EMPTY_OUTPUT" || message.startsWith("GROQ_RESPONSE_")) {
    return errorResponse(502, "Respons AI discovery belum dapat diproses dengan aman.");
  }
  if (message.startsWith("FIRESTORE_")) return errorResponse(502, "Kandidat discovery gagal dibaca atau disimpan ke Firestore.");

  return errorResponse(500, "AI Target Discovery gagal diproses.", ["Periksa Function Logs untuk /api/discovery/targets."]);
}

function createRunId() {
  return `DISC-${Date.now().toString(36).toUpperCase()}`;
}

export async function POST(request: Request) {
  const idToken = getBearerToken(request);
  if (!idToken) return errorResponse(401, "Autentikasi diperlukan.");

  try {
    await verifyFirebaseIdToken(idToken);
  } catch {
    return errorResponse(401, "Sesi tidak valid atau sudah kedaluwarsa.");
  }

  try {
    const input = discoveryRequestSchema.parse(await request.json());
    const runId = createRunId();
    const existingBusinessNames = await getExistingDiscoveryBusinessNames(idToken);
    const discovered = await discoverProspects({ ...input, existingBusinessNames, runId });

    const result: DiscoveryRunResult = {
      runId,
      area: input.area,
      category: input.category,
      searchedSources: discovered.searchedSources,
      analyzedCandidates: discovered.analyzedCandidates,
      inserted: discovered.prospects.length,
      duplicates: discovered.duplicates,
      candidates: discovered.prospects,
    };

    await saveDiscoveryRun(result, idToken);

    return NextResponse.json({
      success: true,
      message: `Discovery selesai. ${result.inserted} kandidat baru ditemukan.`,
      data: result,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(400, "Parameter discovery tidak valid.", error.issues.map((issue) => issue.message));
    }

    console.error("Target discovery failed:", error);
    return mapDiscoveryError(error);
  }
}
