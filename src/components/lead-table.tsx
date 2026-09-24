"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Lead } from "@/modules/leads/types";
import { toIndonesianMarketingCopy } from "@/modules/leads/copy";
import { PriorityBadge, StatusBadge } from "./status-badge";
import { ScoreBar } from "./score-bar";
import { EmptyState } from "./empty-state";

export function LeadTable({ leads }: { leads: Lead[] }) {
  if (!leads.length) {
    return <EmptyState title="Calon klien tidak ditemukan" text="Coba ubah pencarian atau penyaring, atau tambahkan calon klien baru." />;
  }

  return (
    <div className="table-shell lead-table-shell">
      <table className="data-table lead-table">
        <thead>
          <tr>
            <th>Bisnis</th>
            <th>Prioritas</th>
            <th>Status</th>
            <th>Penawaran yang cocok</th>
            <th>Langkah berikutnya</th>
            <th aria-label="Aksi" />
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <Link className="table-primary" href={`/leads/${lead.id}`}>{lead.business}</Link>
                <span className="table-secondary">{toIndonesianMarketingCopy(lead.niche)} · {lead.area || "Area belum diisi"}</span>
              </td>
              <td>
                <div className="priority-cell">
                  <PriorityBadge value={lead.priority} />
                  <ScoreBar value={lead.opportunityScore} />
                </div>
              </td>
              <td><StatusBadge value={lead.stage} /></td>
              <td className="table-wrap">{toIndonesianMarketingCopy(lead.recommendedOffer) || "Belum ditentukan"}</td>
              <td className="table-wrap next-action-cell">{toIndonesianMarketingCopy(lead.nextAction) || "Belum ada langkah berikutnya"}</td>
              <td>
                <Link className="row-action" href={`/leads/${lead.id}`} aria-label={`Buka detail ${lead.business}`}>
                  <ArrowRight size={16} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
