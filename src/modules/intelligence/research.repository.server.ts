import type { Lead } from "@/modules/leads/types";
import {
  getFirestoreDocument,
  setFirestoreDocument,
} from "@/lib/firebase/server-rest";
import type { ResearchAnalysis } from "./types";

export async function getLeadForResearch(
  leadId: string,
  idToken: string,
): Promise<Lead | null> {
  const lead = await getFirestoreDocument<Omit<Lead, "id">>(
    "leads",
    leadId,
    idToken,
  );

  return lead ? { ...lead, id: leadId } as Lead : null;
}

export async function saveResearchAnalysis(
  analysis: ResearchAnalysis,
  idToken: string,
): Promise<void> {
  await setFirestoreDocument(
    "researchAnalyses",
    analysis.id,
    analysis as unknown as Record<string, unknown>,
    idToken,
  );
}
