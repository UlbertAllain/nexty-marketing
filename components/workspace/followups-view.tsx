"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { CalendarClock, Check, Plus } from "lucide-react";
import { isDueAt } from "@/lib/business";
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
  const [completingId, setCompletingId] = useState<string | null>(null);

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

  async function finishReminder(item: FollowUp) {
    if (completingId) return;

    try {
      setCompletingId(item.id);
      await completeReminder(ownerId, item);
      notify("Pengingat ditandai selesai.");
      onRefresh();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Pengingat belum bisa diselesaikan.",
      );
    } finally {
      setCompletingId(null);
    }
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

      <div className="list-summary">
        <span>
          <b>{active.length}</b> pengingat aktif
        </span>
      </div>

      <div className="follow-list">
        {active.map((item) => {
          const due = isDueAt(item.date);
          const lead = leads.find((candidate) => candidate.id === item.leadId);
          const completing = completingId === item.id;

          return (
            <article key={item.id} className={due ? "due" : ""}>
              <time>
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </time>
              <div>
                <h3>{lead?.companyName || "Calon klien"}</h3>
                <p>{item.reason}</p>
                <small>
                  {due ? "Jatuh tempo / " : ""}
                  {new Date(item.date).toLocaleString("id-ID")}
                </small>
              </div>
              <button
                className={due ? "quick-action confirm" : "quick-action"}
                disabled={Boolean(completingId)}
                onClick={() => finishReminder(item)}
              >
                <Check size={15} />
                {completing ? "Menyimpan..." : "Selesai"}
              </button>
            </article>
          );
        })}

        {!active.length && (
          <EmptyState>
            Belum ada pengingat aktif. Buat pengingat saat ada calon klien yang
            perlu dihubungi kembali.
          </EmptyState>
        )}
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
  const [saving, setSaving] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    try {
      setSaving(true);
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
        error instanceof Error ? error.message : "Pengingat belum bisa dibuat.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Buat pengingat" onClose={() => !saving && close()}>
      <form className="form-grid" onSubmit={submit}>
        <label className="wide">
          Calon klien
          <select
            required
            value={leadId}
            disabled={saving}
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
            disabled={saving}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label className="wide">
          Tujuan
          <input
            required
            value={reason}
            disabled={saving}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tanyakan keputusan setelah penawaran"
          />
        </label>

        <label className="wide">
          Catatan tambahan
          <textarea
            value={notes}
            disabled={saving}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="modal-actions wide">
          <button
            type="button"
            className="secondary"
            onClick={close}
            disabled={saving}
          >
            Batal
          </button>
          <button className="primary" disabled={saving}>
            <CalendarClock size={16} />
            {saving ? "Menyimpan..." : "Simpan pengingat"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
