import type {
  OpportunityScoring,
  OpportunityScoringInput,
  ResearchEvidence,
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

export function calculateEvidenceQuality(
  sources: ResearchEvidence[],
): number {
  if (!sources.length) return 0;

  const confidenceWeight = {
    low: 40,
    medium: 70,
    high: 100,
  } as const;

  const averageConfidence =
    sources.reduce(
      (total, source) => total + confidenceWeight[source.confidence],
      0,
    ) / sources.length;

  const sourceCoverage = Math.min(100, sources.length * 20);
  const sourceDiversity = Math.min(
    100,
    new Set(sources.map((source) => source.type)).size * 25,
  );

  return clampScore(
    averageConfidence * 0.5 +
      sourceCoverage * 0.3 +
      sourceDiversity * 0.2,
  );
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
