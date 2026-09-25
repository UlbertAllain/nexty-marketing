import type { Prospect } from "@/modules/leads/types";
import type { DiscoveryArea, DiscoveryCategory } from "./discovery.constants";

export type DiscoveryCandidateStatus = "pending" | "added";

export interface DiscoveryCandidate extends Prospect {
  discoveryStatus: DiscoveryCandidateStatus;
  addedToProspectsAt?: string;
}

export interface DiscoveryRunResult {
  runId: string;
  area: DiscoveryArea;
  category: DiscoveryCategory;
  searchedSources: number;
  analyzedCandidates: number;
  inserted: number;
  duplicates: number;
  candidates: DiscoveryCandidate[];
}
