"use client";

import type { DiscoveryArea, DiscoveryCategory } from "./discovery.constants";
import type { DiscoveryRunResult } from "./discovery.types";

type DiscoveryApiResponse =
  | { success: true; message: string; data: DiscoveryRunResult }
  | { success: false; message: string; errors?: string[] };

export async function requestTargetDiscovery(
  input: { area: DiscoveryArea; category: DiscoveryCategory; maxCandidates: number },
  idToken: string,
): Promise<DiscoveryRunResult> {
  const response = await fetch("/api/discovery/targets", {
    method: "POST",
    headers: {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as DiscoveryApiResponse;

  if (!response.ok || !payload.success) {
    const detail = !payload.success && payload.errors?.length ? ` ${payload.errors.join(" ")}` : "";
    throw new Error(`${payload.message || "AI Target Discovery gagal."}${detail}`);
  }

  return payload.data;
}
