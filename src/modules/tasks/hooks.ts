"use client";

import { useEffect, useMemo, useState } from "react";
import { startOfDay } from "date-fns";
import { subscribeTasks } from "./repository";
import type { Task } from "@/features/leads/types";

export function useTasks() {
  const [items, setItems] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeTasks((next) => { setItems(next); setLoading(false); }), []);
  const open = useMemo(() => items.filter((item) => item.status === "open"), [items]);
  const today = startOfDay(new Date());
  const overdue = open.filter((item) => item.dueAt.toDate() < today);
  const dueToday = open.filter((item) => {
    const d = item.dueAt.toDate();
    return d >= today && d < new Date(today.getTime() + 86400000);
  });
  return { items, open, overdue, dueToday, loading };
}
