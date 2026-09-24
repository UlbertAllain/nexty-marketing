"use client";

import {
  collection,
  onSnapshot,
  orderBy,
  query,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { SocialProfile } from "@/modules/leads/types";
import type { ResearchQueueItem, ResearchSource } from "./research.types";

function withId<T>(data: DocumentData, id: string) {
  return { ...data, id } as T;
}

export function subscribeResearchQueue(callback: (items: ResearchQueueItem[]) => void): Unsubscribe {
  const researchQuery = query(collection(db, "researchQueue"), orderBy("rank", "asc"));
  return onSnapshot(researchQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => withId<ResearchQueueItem>(item.data(), item.id)));
  });
}

export function subscribeSocialProfiles(callback: (items: SocialProfile[]) => void): Unsubscribe {
  const socialQuery = query(collection(db, "socialProfiles"), orderBy("business", "asc"));
  return onSnapshot(socialQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => item.data() as SocialProfile));
  });
}

export function subscribeResearchSources(callback: (items: ResearchSource[]) => void): Unsubscribe {
  const sourceQuery = query(collection(db, "researchSources"), orderBy("id", "asc"));
  return onSnapshot(sourceQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => withId<ResearchSource>(item.data(), item.id)));
  });
}
