export type ResearchConfidence = "low" | "medium" | "high";
export type EvidenceType =
  | "website"
  | "social"
  | "google_business"
  | "directory"
  | "news"
  | "other";

export type FindingCategory =
  | "digital_presence"
  | "conversion"
  | "sales_process"
  | "customer_experience"
  | "operations"
  | "lead_management"
  | "automation"
  | "commerce"
  | "booking"
  | "catalog"
  | "crm"
  | "internal_system";

export interface ResearchEvidence {
  id: string;
  type: EvidenceType;
  title: string;
  url: string;
  excerpt?: string;
  checkedAt: string;
  confidence: ResearchConfidence;
}

export interface ObservedAsset {
  type: string;
  label: string;
  value?: string;
  status: "verified" | "observed";
  evidenceIds: string[];
}

export interface ResearchFinding {
  id: string;
  category: FindingCategory;
  statement: string;
  interpretation?: string;
  evidenceIds: string[];
  confidence: ResearchConfidence;
}

export interface BusinessGap {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  impact: string;
  evidenceIds: string[];
  confidence: ResearchConfidence;
  tags: string[];
}

export interface RecommendedOffer {
  serviceId: string;
  serviceName: string;
  reason: string;
  matchedGapIds: string[];
  fitScore: number;
}

export interface OpportunityScoringInput {
  digitalGap: number;
  businessNeed: number;
  serviceFit: number;
  ticketPotential: number;
  contactability: number;
  evidenceQuality: number;
}

export interface OpportunityScoring extends OpportunityScoringInput {
  opportunityScore: number;
}

export interface OutreachStrategy {
  targetRole: string;
  angle: string;
  openingStrategy: string;
  avoid: string[];
  draftMessage: string;
}

export interface ResearchAnalysis {
  id: string;
  leadId: string;
  business: string;
  summary: string;
  assets: ObservedAsset[];
  findings: ResearchFinding[];
  gaps: BusinessGap[];
  recommendedOffers: RecommendedOffer[];
  scoring: OpportunityScoring;
  outreach: OutreachStrategy;
  sources: ResearchEvidence[];
  model?: string;
  researchedAt: string;
}

export interface ResearchAnalysisDraft {
  leadId: string;
  business: string;
  summary: string;
  assets: ObservedAsset[];
  findings: ResearchFinding[];
  gaps: BusinessGap[];
  scoringInput: OpportunityScoringInput;
  outreach: OutreachStrategy;
  sources: ResearchEvidence[];
  model?: string;
}
