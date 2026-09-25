"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Prospect } from "@/modules/leads/types";
import type { DiscoveryCandidate } from "./discovery.types";

function withId<T>(data: DocumentData, id: string) {
  return { ...data, id } as T;
}

export function subscribeDiscoveryCandidates(
  callback: (items: DiscoveryCandidate[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, "discoveryCandidates"),
    orderBy("fitScore", "desc"),
  );

  return onSnapshot(q, (snapshot) => {
    callback(
      snapshot.docs.map((item) =>
        withId<DiscoveryCandidate>(item.data(), item.id),
      ),
    );
  });
}

function toProspect(candidate: DiscoveryCandidate): Prospect {
  const {
    discoveryStatus: _discoveryStatus,
    addedToProspectsAt: _addedToProspectsAt,
    ...prospect
  } = candidate;

  return {
    ...prospect,
    targetId: prospect.targetId || "",
    poolStatus: "Needs Research",
  };
}

export async function addDiscoveryCandidateToProspects(
  candidate: DiscoveryCandidate,
): Promise<void> {
  const now = new Date().toISOString();

  await setDoc(
    doc(db, "prospects", candidate.id),
    toProspect(candidate),
  );

  await updateDoc(
    doc(db, "discoveryCandidates", candidate.id),
    {
      discoveryStatus: "added",
      addedToProspectsAt: now,
    },
  );
}

export async function approveLegacyDiscoveryProspect(
  prospect: Prospect,
): Promise<void> {
  const now = new Date().toISOString();

  await setDoc(
    doc(db, "discoveryCandidates", prospect.id),
    {
      ...prospect,
      discoveryStatus: "added",
      addedToProspectsAt: now,
    } satisfies DiscoveryCandidate,
  );

  await updateDoc(
    doc(db, "prospects", prospect.id),
    {
      poolStatus: "Needs Research",
    },
  );
}
