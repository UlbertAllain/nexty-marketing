"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { CalendarClock, Check, Plus } from "lucide-react";
import { completeReminder, scheduleReminder } from "@/lib/repository";
import type { FollowUp, Lead } from "@/lib/types";
import { Dialog, EmptyState } from "./dialog";

export function FollowupsView({
  ownerId,
  items,
  leads,
  onRefresh,
  notify,
}: {
  ownerId: string;
  items: FollowUp[];
  leads: Lead[];
  onRefresh: () => void;
  notify: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [initialLeadId, setInitialLeadId] = useState("");
  const active = items
    .filter((item) => item.status === "ACTIVE")
    .sort((a, b) => a.date.localeCompare(b.date));

  useEffect(() => {
    const url = new URL(window.location.href);
    const leadId = url.searchParams.get("lead") || "";
    const canSchedule = leads.some(
      (lead) => lead.id === leadId && lead.status !== "DEAL",
    );

    if (!leadId || !canSchedule) return;

    setInitialLeadId(leadId);
    setOpen(true);
    url.searchParams.delete("lead");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [leads]);

  function openNewReminder() {
    setInitialLeadId("");
    setOpen(true);
  }

  return (
    <>
      <div className="hero-row compact">
        <div>
          <span className="eyebrow">PENGINGAT</span>
          <h2>Ingat siapa yang perlu dihubungi kembali.</h2>
          <p>
            Pengingat muncul saat aplikasi dibuka. Tidak ada pesan yang dikirim
            diam-diam.
          </p>
        </div>
        <button className="primary" onClick={openNewReminder}>
          <Plus size={17} />
          Buat pengingat
        </button>
      </div>

      <div className="follow-list">
        {active.map((item) => {
          const due = new Date(item.date) <= new Date();
          const lead = leads.find((candidate) => candidate.id === item.leadId);

          return (
            <article key={item.id}>
              <time>
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </time>
              <div>
                <h3>{lead?.companyName || "Calon klien"}</h3>
                <p>{item.reason}</p>
                <small>{new Date(item.date).toLocaleString("id-ID")}</small>
              </div>
              <button
                className={due ? "quick-action confirm" : "quick-action"}
                onClick={async () => {
                  await completeReminder(ownerId, item);
                  notify("Pengingat ditandai selesai.");
                  onRefresh();
                }}
              >
                <Check size={15} />
                Selesai
              </button>
            </article>
          );
        })}

        {!active.length && <EmptyState>Belum ada pengingat aktif.</EmptyState>}
      </div>

      {open && (
        <ReminderDialog
          ownerId={ownerId}
          leads={leads}
          initialLeadId={initialLeadId}
          close={() => setOpen(false)}
          saved={() => {
            setOpen(false);
            onRefresh();
          }}
          notify={notify}
        />
      )}
    </>
  );
}

function ReminderDialog({
  ownerId,
  leads,
  initialLeadId,
  close,
  saved,
  notify,
}: {
  ownerId: string;
  leads: Lead[];
  initialLeadId: string;
  close: () => void;
  saved: () => void;
  notify: (text: string) => void;
}) {
  const [leadId, setLeadId] = useState(initialLeadId);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Dialog title="Buat pengingat" onClose={close}>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            await scheduleReminder(ownerId, {
              leadId,
              date: new Date(date).toISOString(),
              reason,
              notes,
            });
            notify("Pengingat sudah dibuat.");
            saved();
          } catch (error) {
            notify(
              error instanceof Error
                ? error.message
                : "Pengingat belum bisa dibuat.",
            );
          }
        }}
      >
        <label className="wide">
          Calon klien
          <select
            required
            value={leadId}
            onChange={(event) => setLeadId(event.target.value)}
          >
            <option value="">Pilih calon klien</option>
            {leads
              .filter((lead) => lead.status !== "DEAL")
              .map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.companyName}
                </option>
              ))}
          </select>
        </label>

        <label className="wide">
          Waktu menghubungi kembali
          <input
            required
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label className="wide">
          Tujuan
          <input
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tanyakan keputusan setelah penawaran"
          />
        </label>

        <label className="wide">
          Catatan tambahan
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="modal-actions wide">
          <button type="button" className="secondary" onClick={close}>
            Batal
          </button>
          <button className="primary">
            <CalendarClock size={16} />
            Simpan pengingat
          </button>
        </div>
      </form>
    </Dialog>
  );
}
