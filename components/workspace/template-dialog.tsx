"use client";

import { useState } from "react";
import { Dialog } from "./dialog";
import { saveTemplate } from "@/lib/repository";

const DEFAULT_TEMPLATE = {
  title: "",
  category: "Semua bisnis",
  content: "",
  isDefault: false,
};

export function TemplateDialog({
  ownerId,
  onClose,
  onSaved,
}: {
  ownerId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState(DEFAULT_TEMPLATE);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    <Dialog title="Buat pesan siap pakai" onClose={onClose}>
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
            {busy ? "Menyimpanâ€¦" : "Simpan pesan"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
