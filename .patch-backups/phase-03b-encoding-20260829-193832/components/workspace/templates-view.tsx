"use client";

import { useState } from "react";
import { Pencil, Plus } from "lucide-react";
import type { Template } from "@/lib/types";
import { EmptyState } from "./dialog";
import { TemplateDialog } from "./template-dialog";

export function TemplatesView({
  ownerId,
  templates,
  onAdd,
  onRefresh,
  notify,
}: {
  ownerId: string;
  templates: Template[];
  onAdd: () => void;
  onRefresh: () => void;
  notify: (text: string) => void;
}) {
  const [editing, setEditing] = useState<Template | null>(null);

  return (
    <>
      <div className="hero-row compact">
        <div>
          <span className="eyebrow">PESAN SIAP PAKAI</span>
          <h2>Tulis sekali, pakai berkali-kali.</h2>
          <p>
            Nama kontak, perusahaan, dan jenis usaha akan dimasukkan otomatis
            sebelum WhatsApp dibuka.
          </p>
        </div>
        <button className="primary" onClick={onAdd}>
          <Plus size={17} />
          Buat pesan
        </button>
      </div>

      <div className="card-grid">
        {templates.map((item) => (
          <article className="template-card" key={item.id}>
            <div className="template-card-head">
              <span>{item.category}</span>
              <button
                className="template-edit"
                onClick={() => setEditing(item)}
                aria-label={`Edit ${item.title}`}
              >
                <Pencil size={14} />
                Edit
              </button>
            </div>
            <h3>{item.title}</h3>
            <p>{item.content}</p>
            <small>{item.isDefault ? "Pilihan utama" : "Pesan khusus"}</small>
          </article>
        ))}

        {!templates.length && (
          <EmptyState>
            Buat satu pesan utama agar membuka WhatsApp tetap cepat.
          </EmptyState>
        )}
      </div>

      {editing && (
        <TemplateDialog
          ownerId={ownerId}
          template={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            notify("Pesan siap pakai sudah diperbarui.");
            onRefresh();
          }}
        />
      )}
    </>
  );
}
