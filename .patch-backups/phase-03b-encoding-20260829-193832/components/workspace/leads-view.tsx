"use client";

import { useMemo, useState } from "react";
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

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return leads
      .filter((lead) =>
        `${lead.companyName} ${lead.contactName} ${lead.category} ${lead.website}`
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
    try {
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
    }
  }

  async function markSent(lead: Lead, message: Message) {
    try {
      await confirmWhatsAppSent(ownerId, lead, message.id, 3);
      notify(
        "Ditandai sudah dikirim. Pengingat tiga hari lagi dibuat otomatis.",
      );
      onRefresh();
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Progres belum bisa disimpan.",
      );
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
            placeholder="Cari perusahaan, kontak, jenis usaha, atau website"
          />
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
                        onClick={async (event) => {
                          event.stopPropagation();
                          await markSent(lead, draft);
                        }}
                      >
                        <Check size={15} />
                        Sudah dikirim
                      </button>
                    ) : (
                      <button
                        className="quick-action"
                        disabled={!lead.normalizedPhone}
                        onClick={async (event) => {
                          event.stopPropagation();
                          await openWhatsApp(lead);
                        }}
                      >
                        <Send size={15} />
                        Buka WhatsApp
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {!filtered.length && (
          <EmptyState>Belum ada calon klien yang sesuai pencarian.</EmptyState>
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
  const next = allowedTransitions(lead.status);

  function chooseTemplate(id: string) {
    setTemplateId(id);
    const selectedTemplate = templates.find((item) => item.id === id);
    setMessage(
      selectedTemplate ? generateMessage(selectedTemplate, lead) : "",
    );
  }

  async function open() {
    try {
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
    }
  }

  async function confirm() {
    if (!draft) return;

    try {
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
    }
  }

  return (
    <div className="drawer-backdrop" onMouseDown={close}>
      <aside className="drawer" onMouseDown={(event) => event.stopPropagation()}>
        <button className="drawer-close" onClick={close} aria-label="Tutup">
          <X />
        </button>

        <span className="eyebrow">RINGKASAN CALON KLIEN</span>
        <h2>{lead.companyName}</h2>
        <p>
          {lead.category} Â· {lead.contactName || "Nama kontak belum diisi"}
        </p>

        <div className="drawer-actions">
          <button className="secondary" onClick={edit}>
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
                  onChange={(event) => setReminder(event.target.checked)}
                />
                Ingatkan lagi tiga hari setelah pesan dikirim
              </label>
              <button className="primary full" onClick={confirm}>
                <Check size={16} />
                Tandai sudah dikirim
              </button>
            </>
          ) : (
            <button
              className="primary full"
              disabled={!message || !lead.normalizedPhone}
              onClick={open}
            >
              <Send size={16} />
              Buka pesan di WhatsApp
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
                onChange={async (event) => {
                  if (!event.target.value) return;
                  await updateLeadStatus(
                    ownerId,
                    lead,
                    event.target.value as LeadStatus,
                  );
                  done();
                }}
              >
                <option value="">Pilih perkembanganâ€¦</option>
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
