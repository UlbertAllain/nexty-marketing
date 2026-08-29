"use client";

import { useState } from "react";
import { saveTemplate } from "@/lib/repository";
import type { Template } from "@/lib/types";
import { Dialog } from "./dialog";

type TemplateForm = Pick<
  Template,
  "title" | "category" | "content" | "isDefault"
> & {
  id?: string;
  createdAt?: string;
};

function templateToForm(template?: Template): TemplateForm {
  return {
    id: template?.id,
    createdAt: template?.createdAt,
    title: template?.title || "",
    category: template?.category || "Semua bisnis",
    content: template?.content || "",
    isDefault: template?.isDefault || false,
  };
}

export function TemplateDialog({
  ownerId,
  template,
  onClose,
  onSaved,
}: {
  ownerId: string;
  template?: Template;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<TemplateForm>(() => templateToForm(template));
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const editing = Boolean(template);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setBusy(true);
      setError("");
      await saveTemplate(ownerId, data);
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Pesan belum bisa disimpan.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      title={editing ? "Edit pesan siap pakai" : "Buat pesan siap pakai"}
      onClose={onClose}
    >
      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Nama pesan
          <input
            required
            value={data.title}
            onChange={(event) => setData({ ...data, title: event.target.value })}
            placeholder="Contoh: Perkenalan pertama"
          />
        </label>

        <label>
          Cocok untuk usaha
          <input
            value={data.category}
            onChange={(event) =>
              setData({ ...data, category: event.target.value })
            }
            placeholder="Kafe, klinik, atau semua bisnis"
          />
        </label>

        <label className="wide">
          Isi pesan
          <textarea
            rows={10}
            required
            value={data.content}
            onChange={(event) =>
              setData({ ...data, content: event.target.value })
            }
            placeholder="Halo {{contact_name}}, saya ..."
          />
          <small>
            Gunakan {"{{contact_name}}"}, {"{{company_name}}"}, dan {"{{category}}"}
            untuk data yang akan diisi otomatis saat pesan dipakai.
          </small>
        </label>

        <label className="check wide">
          <input
            type="checkbox"
            checked={data.isDefault}
            onChange={(event) =>
              setData({ ...data, isDefault: event.target.checked })
            }
          />
          Gunakan sebagai pilihan utama
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
                : "Simpan pesan"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
