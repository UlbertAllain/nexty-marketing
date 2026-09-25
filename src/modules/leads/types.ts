import type { Timestamp } from "firebase/firestore";

export const LEAD_STAGES = [
  "New", "Qualified", "Contacted", "Responded", "Interested", "Meeting", "Proposal",
  "Won", "Lost", "Follow Up Later", "Not Qualified",
] as const;

export type LeadStage = typeof LEAD_STAGES[number];
export type LeadPriority = "A" | "B" | "C";
export type LeadTemplateKey = "FIRST_OUTREACH" | "INTERESTED_REPLY" | "FOLLOW_UP_D2" | "FOLLOW_UP_D5" | "MEETING_CTA";
export type LeadTemplates = Record<LeadTemplateKey, string>;

export interface SocialProfile {
  leadId: string;
  business: string;
  niche: string;
  area: string;
  instagramHandle: string;
  instagramUrl: string;
  tiktokHandle: string;
  tiktokUrl: string;
  facebookUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  linkInBioUrl: string;
  verificationStatus: string;
  checkedAt: string;
  verificationSource: string;
  notes: string;
}

export interface FollowUpSeed {
  leadId?: string;
  business?: string;
  priority?: string;
  stage?: string;
  firstContact?: string;
  followUpD2?: string;
  followUpD5?: string;
  lastReply?: string;
  nextAction?: string;
  nextDate?: string;
  dueStatus?: string;
  owner?: string;
  result?: string;
  lostReason?: string;
}

export interface Lead {
  id: string;
  business: string;
  niche: string;
  leadType: string;
  area: string;
  phone: string;
  primaryDigitalAsset: string;
  googleRating: number;
  reviewCount: number;
  demandScore: number;
  digitalGapScore: number;
  opsComplexityScore: number;
  ticketPotentialScore: number;
  decisionEaseScore: number;
  opportunityScore: number;
  priority: LeadPriority;
  hasNow: string;
  verifiedGap: string;
  publicFriction: string;
  evidenceStatus: string;
  recommendedOffer: string;
  solutionConcept: string;
  firstContactAngle: string;
  contactRoute: string;
  stage: LeadStage;
  nextAction: string;
  researchDate: string;
  source1: string;
  source2: string;
  guardrail: string;
  primarySocial?: string;
  instagram?: string;
  website?: string;
  socialVerification?: string;
  latestResearchAnalysisId?: string;
  social?: SocialProfile;
  followUpSeed?: FollowUpSeed;
  personalizationChecklist: string;
  templates: LeadTemplates;
  notes?: string;
  firstContactAt?: Timestamp | null;
  lastContactAt?: Timestamp | null;
  nextFollowUpAt?: Timestamp | null;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Prospect {
  id: string;
  targetId: string;
  business: string;
  region: string;
  niche: string;
  rating: number;
  reviews: number;
  phone: string;
  publicAssets: string;
  researchLevel: string;
  potentialGap: string;
  publicFriction: string;
  recommendedOffer: string;
  authorityRisk: string;
  fitScore: number;
  poolStatus: string;
  source1: string;
  source2: string;
  notes: string;
  website?: string;
  instagram?: string;
  address?: string;
  offerSummary?: string;
  discoveryRunId?: string;
  discoveredAt?: string;
  discoverySourceCount?: number;
}

export interface Activity {
  id: string;
  type: "message_sent" | "stage_changed" | "note" | "meeting" | "proposal";
  body?: string;
  templateKey?: LeadTemplateKey;
  channel?: "whatsapp" | "instagram" | "facebook" | "tiktok" | "linkedin" | "manual";
  occurredAt: Timestamp;
}

export interface Task {
  id: string;
  leadId: string;
  business: string;
  type: "follow_up_d2" | "follow_up_d5" | "manual";
  title: string;
  templateKey?: LeadTemplateKey;
  status: "open" | "done";
  dueAt: Timestamp;
  createdAt: Timestamp;
}
