"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Task } from "@/modules/leads/types";

export function subscribeTasks(callback: (items: Task[]) => void): Unsubscribe {
  const q = query(collection(db, "tasks"), orderBy("dueAt", "asc"));
  return onSnapshot(q, (snapshot) => callback(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Task))));
}

export async function completeTask(id: string) {
  await updateDoc(doc(db, "tasks", id), { status: "done", completedAt: serverTimestamp() });
}
