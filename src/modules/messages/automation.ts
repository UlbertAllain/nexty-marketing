"use client";

import { addDays } from "date-fns";
import {
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Lead, LeadTemplateKey } from "@/modules/leads/types";

const nextRule: Partial<Record<LeadTemplateKey, { key: LeadTemplateKey; days: number; type: "follow_up_d2" | "follow_up_d5"; title: string }>> = {
  FIRST_OUTREACH: { key: "FOLLOW_UP_D2", days: 2, type: "follow_up_d2", title: "Tindak lanjut H+2" },
  FOLLOW_UP_D2: { key: "FOLLOW_UP_D5", days: 3, type: "follow_up_d5", title: "Tindak lanjut terakhir" },
};

export async function recordOutboundMessage(lead: Lead, templateKey: LeadTemplateKey, body: string) {
  const batch = writeBatch(db);
  const leadRef = doc(db, "leads", lead.id);
  const activityRef = doc(collection(db, "leads", lead.id, "activities"));
  const now = new Date();
  const rule = nextRule[templateKey];

  batch.set(activityRef, {
    type: "message_sent",
    body,
    templateKey,
    channel: "whatsapp",
    occurredAt: serverTimestamp(),
  });

  const leadPatch: Record<string, unknown> = {
    lastContactAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (templateKey === "FIRST_OUTREACH") {
    leadPatch.firstContactAt = lead.firstContactAt ?? serverTimestamp();
    if (["New", "Qualified"].includes(lead.stage)) leadPatch.stage = "Contacted";
  }

  if (templateKey === "INTERESTED_REPLY" && ["Contacted", "Responded"].includes(lead.stage)) {
    leadPatch.stage = "Responded";
    leadPatch.nextAction = "Siapkan mini audit singkat";
  }

  if (templateKey === "MEETING_CTA") {
    leadPatch.stage = "Interested";
    leadPatch.nextAction = "Tentukan jadwal penggalian kebutuhan";
  }

  if (rule) {
    const dueDate = addDays(now, rule.days);
    const taskRef = doc(db, "tasks", `${lead.id}-${rule.key}`);
    batch.set(taskRef, {
      leadId: lead.id,
      business: lead.business,
      type: rule.type,
      title: rule.title,
      templateKey: rule.key,
      status: "open",
      dueAt: Timestamp.fromDate(dueDate),
      createdAt: serverTimestamp(),
    }, { merge: true });
    leadPatch.nextFollowUpAt = Timestamp.fromDate(dueDate);
    leadPatch.nextAction = rule.title;
  } else if (templateKey === "FOLLOW_UP_D5") {
    leadPatch.nextFollowUpAt = null;
    leadPatch.nextAction = "Hentikan tindak lanjut aktif; tunggu respons atau jadwalkan untuk dihubungi lagi nanti";
  }

  if (templateKey === "FOLLOW_UP_D2" || templateKey === "FOLLOW_UP_D5") {
    const currentTaskRef = doc(db, "tasks", `${lead.id}-${templateKey}`);
    batch.set(currentTaskRef, { status: "done", completedAt: serverTimestamp() }, { merge: true });
  }
  batch.update(leadRef, leadPatch);
  await batch.commit();
}
