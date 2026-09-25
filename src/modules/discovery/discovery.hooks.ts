"use client";

import { useEffect, useState } from "react";
import { subscribeDiscoveryCandidates } from "./discovery.repository";
import type { DiscoveryCandidate } from "./discovery.types";

export function useDiscoveryCandidates() {
  const [items, setItems] = useState<DiscoveryCandidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      subscribeDiscoveryCandidates((next) => {
        setItems(next);
        setLoading(false);
      }),
    [],
  );

  return { items, loading };
}
