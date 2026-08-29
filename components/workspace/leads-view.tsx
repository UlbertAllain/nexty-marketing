"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Check,
  ExternalLink,
  FileUp,
  MapPin,
  Pencil,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";
import {
  allowedTransitions,
  generateMessage,
  googleMapsUrl,
  instagramUrl,
  potentialLabel,
  statusLabel,
  websiteUrl,
  whatsappDraftUrl,
} from "@/lib/business";
import {
  confirmWhatsAppSent,
  recordWhatsAppOpened,
  updateLeadStatus,
} from "@/lib/repository";
import type { Lead, LeadStatus, Message, Template } from "@/lib/types";
import { EmptyState } from "./dialog";
import { LeadDialog } from "./lead-dialog";

function bestTemplate(lead: Lead, templates: Template[]) {
  return (
    templates.find(
      (item) => item.category.toLowerCase() === lead.category.toLowerCase(),
    ) ??
    templates.find((item) => item.isDefault) ??
    templates[0]
  );
}

export function LeadsView({
  ownerId,
  leads,
  templates,
  messages,
  onAdd,
  onRefresh,
  onImport,
  notify,
}: {
  ownerId: string;
  leads: Lead[];
  templates: Template[];
  messages: Message[];
  onAdd: () => void;
  onRefresh: () => void;
  onImport: () => void;
  notify: (text: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return leads
      .filter((lead) =>
        [
          lead.companyName,
          lead.contactName,
          lead.category,
          lead.website,
          lead.email,
          lead.phone,
          lead.instagram,
        ]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      )
      .sort(
        (a, b) =>
          Number(a.status !== "NEW") - Number(b.status !== "NEW") ||
          b.createdAt.localeCompare(a.createdAt),
      );
  }, [leads, search]);

  const draftFor = (leadId: string) =>
    messages.find(
      (item) => item.leadId === leadId && item.status === "DRAFT",
    );

  async function openWhatsApp(lead: Lead) {
    const key = `open:${lead.id}`;
    if (actionBusy) return;

    try {
      setActionBusy(key);
      const template = bestTemplate(lead, templates);
      if (!template) {
        throw new Error("Buat satu pesan siap pakai terlebih dahulu.");
      }

      const content = generateMessage(template, lead);
      window.open(
        whatsappDraftUrl(lead.normalizedPhone, content),
        "_blank",
        "noopener,noreferrer",
      );
      await recordWhatsAppOpened(ownerId, lead, content);
      notify(
        "WhatsApp dibuka dengan pesan yang sudah terisi. Tekan Send di WhatsApp, lalu konfirmasi di sistem.",
      );
      onRefresh();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "WhatsApp belum bisa dibuka.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  async function markSent(lead: Lead, message: Message) {
    const key = `sent:${lead.id}`;
    if (actionBusy) return;

    try {
      setActionBusy(key);
      await confirmWhatsAppSent(ownerId, lead, message.id, 3);
      notify(
        "Ditandai sudah dikirim. Pengingat tiga hari lagi dibuat otomatis.",
      );
      onRefresh();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Progres belum bisa disimpan.",
      );
    } finally {
      setActionBusy(null);
    }
  }

  return (
    <>
      <div className="toolbar">
        <div className="search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari perusahaan, kontak, nomor, atau website"
            aria-label="Cari calon klien"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setSearch("")}
              aria-label="Hapus pencarian"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <button className="secondary" onClick={onImport}>
          <FileUp size={17} />
          Ambil dari Excel
        </button>
        <button className="primary" onClick={onAdd}>
          <Plus size={17} />
          Tambah calon klien
        </button>
      </div>

      <div className="list-summary">
        <span>
          <b>{filtered.length}</b> dari {leads.length} calon klien
        </span>
        {search && (
          <button type="button" onClick={() => setSearch("")}>
            Reset pencarian
          </button>
        )}
      </div>

      <div className="table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Perusahaan</th>
              <th>Orang yang dihubungi</th>
              <th>Instagram</th>
              <th>Google Maps</th>
              <th>Prioritas</th>
              <th>Perkembangan</th>
              <th>Aksi cepat</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => {
              const draft = draftFor(lead.id);
              const busyKey = draft ? `sent:${lead.id}` : `open:${lead.id}`;
              const currentBusy = actionBusy === busyKey;

              return (
                <tr key={lead.id} onClick={() => setSelected(lead)}>
                  <td>
                    <b>{lead.companyName}</b>
                    <small>{lead.category}</small>
                  </td>
                  <td>
                    {lead.contactName || "Belum ada nama"}
                    <small>{lead.phone || "Nomor perlu dilengkapi"}</small>
                  </td>
                  <td>
                    {lead.instagram ? (
                      <a
                        className="data-link"
                        href={instagramUrl(lead.instagram)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <AtSign size={14} />
                        <span>
                          <b>Buka profil</b>
                          <small>{lead.instagram}</small>
                        </span>
                      </a>
                    ) : (
                      <span className="missing-data">Belum tersedia</span>
                    )}
                  </td>
                  <td>
                    {lead.googleMaps ? (
                      <a
                        className="data-link"
                        href={googleMapsUrl(lead.googleMaps)}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MapPin size={14} />
                        <span>
                          <b>Lihat lokasi</b>
                          <small>Google Maps</small>
                        </span>
                      </a>
                    ) : (
                      <span className="missing-data">Belum tersedia</span>
                    )}
                  </td>
                  <td>
                    <span className={`potential ${lead.potential.toLowerCase()}`}>
                      {potentialLabel[lead.potential]}
                    </span>
                  </td>
                  <td>
                    <span className={`status s-${lead.status.toLowerCase()}`}>
                      {statusLabel[lead.status]}
                    </span>
                  </td>
                  <td>
                    {draft ? (
                      <button
                        className="quick-action confirm"
                        disabled={Boolean(actionBusy)}
                        onClick={async (event) => {
                          event.stopPropagation();
                          await markSent(lead, draft);
                        }}
                      >
                        <Check size={15} />
                        {currentBusy ? "Menyimpan..." : "Sudah dikirim"}
                      </button>
                    ) : (
                      <button
                        className="quick-action"
                        disabled={!lead.normalizedPhone || Boolean(actionBusy)}
                        onClick={async (event) => {
                          event.stopPropagation();
                          await openWhatsApp(lead);
                        }}
                      >
                        <Send size={15} />
                        {currentBusy ? "Membuka..." : "Buka WhatsApp"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState>
            {leads.length
              ? "Tidak ada calon klien yang cocok dengan pencarian ini."
              : "Belum ada calon klien. Tambahkan manual atau ambil dari Excel."}
          </EmptyState>
        )}
      </div>

      {selected && (
        <LeadPanel
          ownerId={ownerId}
          lead={selected}
          templates={templates}
          draft={draftFor(selected.id)}
          close={() => setSelected(null)}
          edit={() => {
            setSelected(null);
            setEditing(selected);
          }}
          done={() => {
            setSelected(null);
            onRefresh();
          }}
          notify={notify}
        />
      )}

      {editing && (
        <LeadDialog
          ownerId={ownerId}
          lead={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify("Data calon klien sudah diperbarui.");
            onRefresh();
          }}
        />
      )}
    </>
  );
}

function LeadPanel({
  ownerId,
  lead,
  templates,
  draft,
  close,
  edit,
  done,
  notify,
}: {
  ownerId: string;
  lead: Lead;
  templates: Template[];
  draft: Message | undefined;
  close: () => void;
  edit: () => void;
  done: () => void;
  notify: (text: string) => void;
}) {
  const initial = bestTemplate(lead, templates);
  const [templateId, setTemplateId] = useState(initial?.id || "");
  const [message, setMessage] = useState(
    initial ? generateMessage(initial, lead) : "",
  );
  const [reminder, setReminder] = useState(true);
  const [busy, setBusy] = useState(false);
  const next = allowedTransitions(lead.status);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) close();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [busy, close]);

  function chooseTemplate(id: string) {
    setTemplateId(id);
    const selectedTemplate = templates.find((item) => item.id === id);
    setMessage(selectedTemplate ? generateMessage(selectedTemplate, lead) : "");
  }

  async function open() {
    if (busy) return;

    try {
      setBusy(true);
      window.open(
        whatsappDraftUrl(lead.normalizedPhone, message),
        "_blank",
        "noopener,noreferrer",
      );
      await recordWhatsAppOpened(ownerId, lead, message);
      notify(
        "Pesan sudah dibuka di WhatsApp. Setelah menekan Send, kembali dan tandai sudah dikirim.",
      );
      done();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "WhatsApp belum bisa dibuka.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    if (!draft || busy) return;

    try {
      setBusy(true);
      await confirmWhatsAppSent(ownerId, lead, draft.id, reminder ? 3 : 0);
      notify(
        reminder
          ? "Pesan ditandai terkirim dan pengingat tiga hari lagi dibuat."
          : "Pesan ditandai sudah dikirim.",
      );
      done();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Progres belum bisa disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function updateStatus(status: LeadStatus) {
    if (busy) return;

    try {
      setBusy(true);
      await updateLeadStatus(ownerId, lead, status);
      notify("Perkembangan calon klien sudah diperbarui.");
      done();
    } catch (error) {
      notify(
        error instanceof Error
          ? error.message
          : "Perkembangan belum bisa diperbarui.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="drawer-backdrop" onMouseDown={() => !busy && close()}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Detail ${lead.companyName}`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="drawer-close"
          onClick={close}
          aria-label="Tutup"
          disabled={busy}
        >
          <X />
        </button>

        <span className="eyebrow">RINGKASAN CALON KLIEN</span>
        <h2>{lead.companyName}</h2>
        <p>
          {lead.category} / {lead.contactName || "Nama kontak belum diisi"}
        </p>

        <div className="drawer-actions">
          <button className="secondary" onClick={edit} disabled={busy}>
            <Pencil size={15} />
            Edit data
          </button>
        </div>

        {(lead.instagram || lead.googleMaps || lead.website) && (
          <div className="business-links">
            {lead.instagram && (
              <a
                href={instagramUrl(lead.instagram)}
                target="_blank"
                rel="noreferrer"
              >
                <AtSign size={17} />
                <span>
                  <b>Instagram</b>
                  <small>{lead.instagram}</small>
                </span>
              </a>
            )}
            {lead.googleMaps && (
              <a
                href={googleMapsUrl(lead.googleMaps)}
                target="_blank"
                rel="noreferrer"
              >
                <MapPin size={17} />
                <span>
                  <b>Google Maps</b>
                  <small>Lihat lokasi usaha</small>
                </span>
              </a>
            )}
            {lead.website && (
              <a
                href={websiteUrl(lead.website)}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink size={17} />
                <span>
                  <b>Website</b>
                  <small>{lead.website}</small>
                </span>
              </a>
            )}
          </div>
        )}

        {(lead.phone || lead.email) && (
          <div className="contact-summary">
            {lead.phone && (
              <span>
                <b>WhatsApp</b>
                {lead.phone}
              </span>
            )}
            {lead.email && (
              <span>
                <b>Email</b>
                {lead.email}
              </span>
            )}
          </div>
        )}

        {draft && (
          <div className="attention">
            WhatsApp sudah dibuka, tetapi belum dikonfirmasi terkirim.
          </div>
        )}

        <div className="drawer-section">
          <label>
            Pilih pesan siap pakai
            <select
              value={templateId}
              disabled={busy}
              onChange={(event) => chooseTemplate(event.target.value)}
            >
              <option value="">Tulis pesan sendiri</option>
              {templates.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>

          <label>
            Pesan yang akan disiapkan
            <textarea
              rows={9}
              value={message}
              disabled={busy}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Pilih pesan siap pakai atau tulis pesan sendiri."
            />
            <small>
              Nama kontak, perusahaan, dan jenis usaha sudah diisi otomatis.
            </small>
          </label>

          {draft ? (
            <>
              <label className="check">
                <input
                  type="checkbox"
                  checked={reminder}
                  disabled={busy}
                  onChange={(event) => setReminder(event.target.checked)}
                />
                Ingatkan lagi tiga hari setelah pesan dikirim
              </label>
              <button className="primary full" onClick={confirm} disabled={busy}>
                <Check size={16} />
                {busy ? "Menyimpan..." : "Tandai sudah dikirim"}
              </button>
            </>
          ) : (
            <button
              className="primary full"
              disabled={!message || !lead.normalizedPhone || busy}
              onClick={open}
            >
              <Send size={16} />
              {busy ? "Membuka..." : "Buka pesan di WhatsApp"}
            </button>
          )}

          <a className="secondary full" href={`/follow-up?lead=${lead.id}`}>
            Atur pengingat sendiri
          </a>

          {next.length > 0 && (
            <label>
              Catat perkembangan
              <select
                defaultValue=""
                disabled={busy}
                onChange={async (event) => {
                  if (!event.target.value) return;
                  await updateStatus(event.target.value as LeadStatus);
                }}
              >
                <option value="">Pilih perkembangan...</option>
                {next.map((status) => (
                  <option key={status} value={status}>
                    {statusLabel[status]}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="note">
            <b>Catatan</b>
            <p>{lead.notes || "Belum ada catatan."}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
