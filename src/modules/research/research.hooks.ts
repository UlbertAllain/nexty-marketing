"use client";

import { useEffect, useState } from "react";
import type { SocialProfile } from "@/modules/leads/types";
import {
  subscribeResearchQueue,
  subscribeResearchSources,
  subscribeSocialProfiles,
} from "./research.repository";
import type { ResearchQueueItem, ResearchSource } from "./research.types";

function useSubscription<T>(subscribe: (callback: (items: T[]) => void) => () => void) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribe((next) => {
    setItems(next);
    setLoading(false);
  }), [subscribe]);

  return { items, loading };
}

export function useResearchQueue() {
  return useSubscription<ResearchQueueItem>(subscribeResearchQueue);
}

export function useSocialProfiles() {
  return useSubscription<SocialProfile>(subscribeSocialProfiles);
}

export function useResearchSources() {
  return useSubscription<ResearchSource>(subscribeResearchSources);
}
