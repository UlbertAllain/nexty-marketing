"use client";

import Link from "next/link";
import type { Lead } from "@/features/leads/types";
import { PriorityBadge, StatusBadge } from "./status-badge";
import { ScoreBar } from "./score-bar";
import { EmptyState } from "./empty-state";

export function LeadTable({ leads }: { leads: Lead[] }) {
  if (!leads.length) return <EmptyState title="Tidak ada lead" text="Coba ubah filter atau tambahkan lead baru." />;

  return (
    <div className="table-shell">
      <table className="data-table">
        <thead>
          <tr>
            <th>Bisnis</th>
            <th>Kategori</th>
            <th>Prioritas</th>
            <th>Score</th>
            <th>Status</th>
            <th>Social</th>
            <th>Offer</th>
            <th>Next action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link className="table-primary" href={`/leads/${lead.id}`}>{lead.business}</Link>
                <span className="table-secondary">{lead.area || "Area belum diisi"}</span>
              </td>
              <td>{lead.niche}</td>
              <td><PriorityBadge value={lead.priority} /></td>
              <td><ScoreBar value={lead.opportunityScore} /></td>
              <td><StatusBadge value={lead.stage} /></td>
              <td><span className="table-secondary social-table-value">{lead.social?.instagramHandle || lead.primarySocial || "—"}</span></td>
              <td className="table-wrap">{lead.recommendedOffer}</td>
              <td className="table-wrap">{lead.nextAction || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
