"use client";

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Activity, Lead, LeadStage, Prospect } from "./types";

function withId<T>(data: DocumentData, id: string) {
  return { ...data, id } as T;
}

export function subscribeLeads(callback: (items: Lead[]) => void): Unsubscribe {
  const q = query(collection(db, "leads"), orderBy("opportunityScore", "desc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => withId<Lead>(item.data(), item.id))));
}

export function subscribeLead(id: string, callback: (item: Lead | null) => void): Unsubscribe {
  return onSnapshot(doc(db, "leads", id), (snapshot) => {
    callback(snapshot.exists() ? withId<Lead>(snapshot.data(), snapshot.id) : null);
  });
}

export function subscribeProspects(callback: (items: Prospect[]) => void): Unsubscribe {
  const q = query(collection(db, "prospects"), orderBy("fitScore", "desc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => withId<Prospect>(item.data(), item.id))));
}

export function subscribeActivities(leadId: string, callback: (items: Activity[]) => void): Unsubscribe {
  const q = query(collection(db, "leads", leadId, "activities"), orderBy("occurredAt", "desc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => withId<Activity>(item.data(), item.id))));
}

export async function updateLead(id: string, patch: Partial<Lead>) {
  await updateDoc(doc(db, "leads", id), { ...patch, updatedAt: serverTimestamp() });
}

export async function changeLeadStage(lead: Lead, stage: LeadStage) {
  if (lead.stage === stage) return;
  await updateLead(lead.id, { stage });
  await addDoc(collection(db, "leads", lead.id, "activities"), {
    type: "stage_changed",
    body: `${lead.stage} → ${stage}`,
    occurredAt: serverTimestamp(),
  });
}

export async function createLead(input: Partial<Lead> & Pick<Lead, "business" | "niche" | "phone">) {
  const ref = doc(collection(db, "leads"));
  await setDoc(ref, {
    id: ref.id,
    leadType: "Client",
    area: "",
    primaryDigitalAsset: "",
    googleRating: 0,
    reviewCount: 0,
    demandScore: 0,
    digitalGapScore: 0,
    opsComplexityScore: 0,
    ticketPotentialScore: 0,
    decisionEaseScore: 0,
    opportunityScore: 50,
    priority: "B",
    hasNow: "",
    verifiedGap: "",
    publicFriction: "",
    evidenceStatus: "Manual lead",
    recommendedOffer: "Business Digital Audit",
    solutionConcept: "",
    firstContactAngle: "",
    contactRoute: "WhatsApp",
    stage: "New",
    nextAction: "Riset singkat lalu kirim chat pertama",
    researchDate: new Date().toISOString().slice(0, 10),
    source1: "",
    source2: "",
    guardrail: "Jangan klaim proses internal sebelum discovery.",
    personalizationChecklist: "Cek website/Instagram sebelum mengirim.",
    templates: {
      FIRST_OUTREACH: `Halo Kak, saya dari NextyLabs. Saya sempat melihat ${input.business} dan punya beberapa ide untuk merapikan customer journey atau operasional digitalnya. Kalau berkenan, saya bisa kirim 2–3 poin audit singkat dulu.`,
      INTERESTED_REPLY: "Siap Kak. Saya kirim satu halaman singkat dulu, lalu kalau relevan baru kita validasi prosesnya 15–20 menit.",
      FOLLOW_UP_D2: "Halo Kak, izin follow-up. Saya bisa kirim 2–3 poin audit singkat langsung di chat ini supaya Kakak bisa nilai dulu.",
      FOLLOW_UP_D5: "Halo Kak, saya follow-up terakhir supaya tidak mengganggu. Kalau belum prioritas sekarang tidak apa-apa. Terima kasih.",
      MEETING_CTA: "Kalau poinnya relevan, boleh kita call/ketemu 15–20 menit untuk memahami flow dan bottleneck utamanya?",
    },
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}


export async function promoteProspect(prospect: Prospect) {
  if (prospect.targetId) return prospect.targetId;
  const newId = await createLead({
    business: prospect.business,
    niche: prospect.niche,
    phone: prospect.phone,
    area: prospect.region,
    primaryDigitalAsset: prospect.publicAssets,
    googleRating: prospect.rating,
    reviewCount: prospect.reviews,
    opportunityScore: prospect.fitScore,
    priority: prospect.fitScore >= 80 ? "A" : prospect.fitScore >= 65 ? "B" : "C",
    hasNow: prospect.publicAssets,
    verifiedGap: prospect.potentialGap,
    publicFriction: prospect.publicFriction,
    recommendedOffer: prospect.recommendedOffer || "Business Digital Audit",
    firstContactAngle: prospect.notes,
    source1: prospect.source1,
    source2: prospect.source2,
    evidenceStatus: prospect.researchLevel,
    guardrail: "Prospect dipromosikan dari research pool. Validasi hipotesis sebelum menyebut proses internal.",
  });
  await updateDoc(doc(db, "prospects", prospect.id), {
    targetId: newId,
    poolStatus: "Qualified Target",
    updatedAt: serverTimestamp(),
  });
  return newId;
}
