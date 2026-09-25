"use client";

import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { ResearchAnalysis } from "./types";

type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

type ApiFailure = {
  success: false;
  message: string;
  errors?: string[];
};

export async function requestLeadResearch(
  leadId: string,
  idToken: string,
): Promise<ResearchAnalysis> {
  const response = await fetch("/api/research/analyze", {
    method: "POST",
    headers: {
      authorization: `Bearer ${idToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ leadId }),
  });

  const payload = (await response.json()) as
    | ApiSuccess<ResearchAnalysis>
    | ApiFailure;

  if (!response.ok || !payload.success) {
    const details =
      !payload.success && payload.errors?.length
        ? ` ${payload.errors.join(" ")}`
        : "";
    throw new Error(`${payload.message || "Riset AI gagal."}${details}`);
  }

  return payload.data;
}

export function subscribeResearchAnalysis(
  analysisId: string,
  callback: (analysis: ResearchAnalysis | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "researchAnalyses", analysisId), (snapshot) => {
    callback(
      snapshot.exists()
        ? (snapshot.data() as ResearchAnalysis)
        : null,
    );
  });
}
