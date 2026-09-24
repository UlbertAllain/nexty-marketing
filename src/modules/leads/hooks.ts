"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lead, Prospect, Activity } from "./types";
import { subscribeActivities, subscribeLead, subscribeLeads, subscribeProspects } from "./repository";

export function useLeads() {
  const [items, setItems] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeLeads((next) => { setItems(next); setLoading(false); }), []);
  return { items, loading };
}

export function useLead(id: string) {
  const [item, setItem] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeLead(id, (next) => { setItem(next); setLoading(false); }), [id]);
  return { item, loading };
}

export function useProspects() {
  const [items, setItems] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => subscribeProspects((next) => { setItems(next); setLoading(false); }), []);
  return { items, loading };
}

export function useActivities(leadId: string) {
  const [items, setItems] = useState<Activity[]>([]);
  useEffect(() => subscribeActivities(leadId, setItems), [leadId]);
  return items;
}

export function useLeadStats(leads: Lead[]) {
  return useMemo(() => ({
    priorityA: leads.filter((lead) => lead.priority === "A" && ["New", "Qualified"].includes(lead.stage)).length,
    active: leads.filter((lead) => !["Won", "Lost", "Not Qualified"].includes(lead.stage)).length,
    meetings: leads.filter((lead) => lead.stage === "Meeting").length,
    proposals: leads.filter((lead) => lead.stage === "Proposal").length,
    won: leads.filter((lead) => lead.stage === "Won").length,
  }), [leads]);
}
