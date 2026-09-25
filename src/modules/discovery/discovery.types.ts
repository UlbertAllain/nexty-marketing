import type { Prospect } from "@/modules/leads/types";
import type { DiscoveryArea, DiscoveryCategory } from "./discovery.constants";

export interface DiscoveryRunResult {
  runId: string;
  area: DiscoveryArea;
  category: DiscoveryCategory;
  searchedSources: number;
  analyzedCandidates: number;
  inserted: number;
  duplicates: number;
  candidates: Prospect[];
}
