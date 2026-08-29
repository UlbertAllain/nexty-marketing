"use client";

import { useState } from "react";
import { createLead, updateLead } from "@/lib/repository";
import type { Lead } from "@/lib/types";
import { Dialog } from "./dialog";

type LeadForm = Pick<
  Lead,
  | "companyName"
  | "category"
  | "contactName"
  | "phone"
  | "email"
  | "instagram"
  | "website"
  | "googleMaps"
  | "potential"
  | "notes"
>;

const EMPTY_FORM: LeadForm = {
  companyName: "",
  category: "",
  contactName: "",
  phone: "",
  email: "",
  instagram: "",
  website: "",
  googleMaps: "",
  potential: "MEDIUM",
  notes: "",
};

function leadToForm(lead?: Lead): LeadForm {
  if (!lead) return EMPTY_FORM;

  return {
    companyName: lead.companyName,
    category: lead.category,
    contactName: lead.contactName,
    phone: lead.phone,
    email: lead.email,
    instagram: lead.instagram,
    website: lead.website,
    googleMaps: lead.googleMaps,
    potential: lead.potential,
    notes: lead.notes,
  };
}

export function LeadDialog({
  ownerId,
  lead,
  onClose,
  onSaved,
}: {
  ownerId: string;
  lead?: Lead;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<LeadForm>(() => leadToForm(lead));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = Boolean(lead);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");

      if (lead) {
        await updateLead(ownerId, lead, data);
      } else {
        await createLead(ownerId, data);
      }

      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : editing
            ? "Data calon klien belum bisa diperbarui."
            : "Calon klien belum bisa disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      title={editing ? "Edit data calon klien" : "Tambahkan calon klien"}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="wide">
          Nama perusahaan
          <input
            required
            value={data.companyName}
            onChange={(event) =>
              setData({ ...data, companyName: event.target.value })
            }
            placeholder="Contoh: Kopi Senja"
          />
        </label>

        <label>
          Jenis usaha
          <input
            value={data.category}
            onChange={(event) =>
              setData({ ...data, category: event.target.value })
            }
            placeholder="Kafe, klinik, tokoâ€¦"
          />
        </label>

        <label>
          Nama yang bisa dihubungi
          <input
            value={data.contactName}
            onChange={(event) =>
              setData({ ...data, contactName: event.target.value })
            }
            placeholder="Budi"
          />
        </label>

        <label>
          Nomor WhatsApp
          <input
            value={data.phone}
            onChange={(event) => setData({ ...data, phone: event.target.value })}
            placeholder="08xxxxxxxxxx"
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={data.email}
            onChange={(event) => setData({ ...data, email: event.target.value })}
          />
        </label>

        <label>
          Prioritas
          <select
            value={data.potential}
            onChange={(event) =>
              setData({
                ...data,
                potential: event.target.value as Lead["potential"],
              })
            }
          >
            <option value="LOW">Pantau</option>
            <option value="MEDIUM">Menjanjikan</option>
            <option value="HIGH">Prioritas</option>
          </select>
        </label>

        <label>
          Instagram
          <input
            value={data.instagram}
            onChange={(event) =>
              setData({ ...data, instagram: event.target.value })
            }
            placeholder="@namabisnis"
          />
        </label>

        <label>
          Website
          <input
            value={data.website}
            onChange={(event) =>
              setData({ ...data, website: event.target.value })
            }
            placeholder="namabisnis.com"
          />
        </label>

        <label className="wide">
          Google Maps
          <input
            value={data.googleMaps}
            onChange={(event) =>
              setData({ ...data, googleMaps: event.target.value })
            }
            placeholder="Tempel link atau alamat lokasi"
          />
        </label>

        <label className="wide">
          Catatan
          <textarea
            rows={4}
            value={data.notes}
            onChange={(event) => setData({ ...data, notes: event.target.value })}
            placeholder="Informasi yang membantu saat menghubungi calon klien"
          />
        </label>

        {error && <div className="error-box wide">{error}</div>}

        <div className="modal-actions wide">
          <button type="button" className="secondary" onClick={onClose}>
            Batal
          </button>
          <button className="primary" disabled={busy}>
            {busy
              ? "Menyimpanâ€¦"
              : editing
                ? "Simpan perubahan"
                : "Simpan calon klien"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
