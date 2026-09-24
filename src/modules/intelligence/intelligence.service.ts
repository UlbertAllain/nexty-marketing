import { matchOffersToGaps } from "./offer-matcher";
import { calculateOpportunityScore } from "./scoring.service";
import type {
  ResearchAnalysis,
  ResearchAnalysisDraft,
} from "./types";

function createAnalysisId(leadId: string, researchedAt: string): string {
  const timestamp = researchedAt.replace(/[^0-9]/g, "").slice(0, 14);
  return `${leadId}-${timestamp || "research"}`;
}

export function buildResearchAnalysis(
  draft: ResearchAnalysisDraft,
  researchedAt = new Date().toISOString(),
): ResearchAnalysis {
  const recommendedOffers = matchOffersToGaps(draft.gaps);
  const strongestOfferFit = recommendedOffers[0]?.fitScore ?? 0;

  const scoring = calculateOpportunityScore({
    ...draft.scoringInput,
    serviceFit:
      draft.scoringInput.serviceFit > 0
        ? draft.scoringInput.serviceFit
        : strongestOfferFit,
  });

  return {
    id: createAnalysisId(draft.leadId, researchedAt),
    leadId: draft.leadId,
    business: draft.business,
    summary: draft.summary,
    assets: draft.assets,
    findings: draft.findings,
    gaps: draft.gaps,
    recommendedOffers,
    scoring,
    outreach: draft.outreach,
    sources: draft.sources,
    model: draft.model,
    researchedAt,
  };
}
