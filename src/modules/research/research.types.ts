export interface ResearchQueueItem {
  id: string;
  rank: number;
  business: string;
  region: string;
  niche: string;
  fitScore: number;
  researchLevel: string;
  authorityRisk: string;
  whyInteresting: string;
  nextResearch: string;
  recommendedOffer: string;
  source: string;
  decision: string;
}

export interface ResearchSource {
  id: string;
  business: string;
  sourceType: string;
  url: string;
  checkedAt: string;
  usedFor: string;
  confidence: string;
}
