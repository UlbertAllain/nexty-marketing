import { listFirestoreCollection, setFirestoreDocument } from "@/lib/firebase/server-rest";
import type { Lead, Prospect } from "@/modules/leads/types";
import type { DiscoveryCandidate, DiscoveryRunResult } from "./discovery.types";
import { normalizeDiscoveryBusinessName } from "./discovery.service";

export async function getExistingDiscoveryBusinessNames(idToken: string): Promise<Set<string>> {
  const [discoveryCandidates, prospects, leads] = await Promise.all([
    listFirestoreCollection<DiscoveryCandidate>("discoveryCandidates", idToken),
    listFirestoreCollection<Prospect>("prospects", idToken),
    listFirestoreCollection<Lead>("leads", idToken),
  ]);

  return new Set(
    [...discoveryCandidates, ...prospects, ...leads]
      .map((item) => normalizeDiscoveryBusinessName(item.business || ""))
      .filter(Boolean),
  );
}

export async function saveDiscoveryRun(result: DiscoveryRunResult, idToken: string): Promise<void> {
  for (const candidate of result.candidates) {
    await setFirestoreDocument(
      "discoveryCandidates",
      candidate.id,
      candidate as unknown as Record<string, unknown>,
      idToken,
    );
  }

  await setFirestoreDocument(
    "discoveryRuns",
    result.runId,
    {
      runId: result.runId,
      area: result.area,
      category: result.category,
      searchedSources: result.searchedSources,
      analyzedCandidates: result.analyzedCandidates,
      inserted: result.inserted,
      duplicates: result.duplicates,
      candidateIds: result.candidates.map((item) => item.id),
      createdAt: new Date().toISOString(),
    },
    idToken,
  );
}
