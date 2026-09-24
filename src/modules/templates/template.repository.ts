"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { customMessageTemplateSchema } from "./template.schema";
import type {
  CustomMessageTemplate,
  CustomMessageTemplateInput,
  MessageTemplateCategory,
} from "./template.types";

function toMillis(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "toMillis" in value &&
    typeof (value as { toMillis?: unknown }).toMillis === "function"
  ) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function mapTemplate(id: string, data: DocumentData): CustomMessageTemplate {
  return {
    id,
    title: String(data.title ?? ""),
    category: String(data.category ?? "lainnya") as MessageTemplateCategory,
    usage: String(data.usage ?? ""),
    body: String(data.body ?? ""),
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
  };
}

export function subscribeCustomMessageTemplates(
  callback: (items: CustomMessageTemplate[]) => void,
): Unsubscribe {
  return onSnapshot(collection(db, "messageTemplates"), (snapshot) => {
    const items = snapshot.docs
      .map((item) => mapTemplate(item.id, item.data()))
      .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));

    callback(items);
  });
}

export async function createCustomMessageTemplate(input: CustomMessageTemplateInput) {
  const parsed = customMessageTemplateSchema.parse(input);

  const ref = await addDoc(collection(db, "messageTemplates"), {
    ...parsed,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateCustomMessageTemplate(
  id: string,
  input: CustomMessageTemplateInput,
) {
  const parsed = customMessageTemplateSchema.parse(input);

  await updateDoc(doc(db, "messageTemplates", id), {
    ...parsed,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteCustomMessageTemplate(id: string) {
  await deleteDoc(doc(db, "messageTemplates", id));
}
