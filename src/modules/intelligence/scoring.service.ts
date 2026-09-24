import type {
  OpportunityScoring,
  OpportunityScoringInput,
} from "./types";

export const OPPORTUNITY_SCORE_WEIGHTS = {
  digitalGap: 0.25,
  businessNeed: 0.25,
  serviceFit: 0.2,
  ticketPotential: 0.15,
  contactability: 0.1,
  evidenceQuality: 0.05,
} as const satisfies Record<keyof OpportunityScoringInput, number>;

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function calculateOpportunityScore(
  input: OpportunityScoringInput,
): OpportunityScoring {
  const normalized: OpportunityScoringInput = {
    digitalGap: clampScore(input.digitalGap),
    businessNeed: clampScore(input.businessNeed),
    serviceFit: clampScore(input.serviceFit),
    ticketPotential: clampScore(input.ticketPotential),
    contactability: clampScore(input.contactability),
    evidenceQuality: clampScore(input.evidenceQuality),
  };

  const weightedScore = (
    Object.keys(OPPORTUNITY_SCORE_WEIGHTS) as Array<
      keyof OpportunityScoringInput
    >
  ).reduce(
    (total, key) =>
      total + normalized[key] * OPPORTUNITY_SCORE_WEIGHTS[key],
    0,
  );

  return {
    ...normalized,
    opportunityScore: Math.round(weightedScore),
  };
}
