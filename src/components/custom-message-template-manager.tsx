"use client";

import { FormEvent, useState } from "react";
import { Check, Clipboard, Pencil, Plus, Trash2, X } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import {
  createCustomMessageTemplate,
  deleteCustomMessageTemplate,
  updateCustomMessageTemplate,
} from "@/modules/templates/template.repository";
import { useCustomMessageTemplates } from "@/modules/templates/template.hooks";
import {
  MESSAGE_TEMPLATE_CATEGORIES,
  MESSAGE_TEMPLATE_CATEGORY_LABELS,
  type CustomMessageTemplate,
  type CustomMessageTemplateInput,
  type MessageTemplateCategory,
} from "@/modules/templates/template.types";

const EMPTY_FORM: CustomMessageTemplateInput = {
  title: "",
  category: "pesan-awal",
  usage: "",
  body: "",
};

export function CustomMessageTemplateManager() {
  const { items, loading } = useCustomMessageTemplates();
  const [form, setForm] = useState<CustomMessageTemplateInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [copiedId, setCopiedId] = useState("");

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId("");
    setShowForm(false);
    setFormError("");
  }

  function startCreate() {
    setForm(EMPTY_FORM);
    setEditingId("");
    setFormError("");
    setShowForm(true);
  }

  function startEdit(item: CustomMessageTemplate) {
    setForm({
      title: item.title,
      category: item.category,
      usage: item.usage,
      body: item.body,
    });
    setEditingId(item.id);
    setFormError("");
    setShowForm(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setFormError("");

    try {
      if (editingId) {
        await updateCustomMessageTemplate(editingId, form);
      } else {
        await createCustomMessageTemplate(form);
      }
      resetForm();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Pesan belum bisa disimpan. Periksa kembali isian.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: CustomMessageTemplate) {
    const confirmed = window.confirm(
      `Hapus pesan “${item.title}”? Pesan yang dihapus tidak bisa dikembalikan.`,
    );
    if (!confirmed) return;
    await deleteCustomMessageTemplate(item.id);
  }

  async function copy(item: CustomMessageTemplate) {
    await navigator.clipboard.writeText(item.body);
    setCopiedId(item.id);
    window.setTimeout(() => setCopiedId(""), 1500);
  }

  return (
    <section className="custom-template-manager">
      <div className="panel template-manager-head">
        <div>
          <p className="eyebrow">Pesan kustom</p>
          <h2>Simpan pesan yang sering dipakai tim</h2>
          <p className="panel-description">
            Pesan di sini milik tim dan tidak akan tertimpa saat data Excel disinkronkan.
          </p>
        </div>
        <button className="button" onClick={startCreate}>
          <Plus size={16} />Tambah pesan
        </button>
      </div>

      {showForm ? (
        <form className="panel custom-template-form" onSubmit={submit}>
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingId ? "Edit pesan" : "Pesan baru"}</p>
              <h2>{editingId ? "Perbarui pesan kustom" : "Buat pesan kustom"}</h2>
            </div>
            <button type="button" className="icon-button" onClick={resetForm} title="Tutup formulir">
              <X size={16} />
            </button>
          </div>

          <div className="form-grid two">
            <label className="field">
              <span>Judul</span>
              <input
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
                placeholder="Contoh: Tindak lanjut setelah proposal"
                maxLength={80}
                required
              />
            </label>

            <label className="field">
              <span>Kategori</span>
              <select
                value={form.category}
                onChange={(event) =>
                  setForm({
                    ...form,
                    category: event.target.value as MessageTemplateCategory,
                  })
                }
              >
                {MESSAGE_TEMPLATE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {MESSAGE_TEMPLATE_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field full">
              <span>Kapan dipakai</span>
              <input
                value={form.usage}
                onChange={(event) => setForm({ ...form, usage: event.target.value })}
                placeholder="Contoh: dipakai 2–3 hari setelah proposal dikirim"
                maxLength={160}
              />
            </label>

            <label className="field full">
              <span>Isi pesan</span>
              <textarea
                value={form.body}
                onChange={(event) => setForm({ ...form, body: event.target.value })}
                placeholder="Tulis pesan dengan bahasa yang natural dan mudah disesuaikan…"
                rows={7}
                maxLength={3000}
                required
              />
              <small>{form.body.length}/3000 karakter</small>
            </label>
          </div>

          {formError ? <p className="form-error">{formError}</p> : null}

          <div className="form-actions custom-template-form-actions">
            <button type="button" className="button secondary" onClick={resetForm}>
              Batal
            </button>
            <button type="submit" className="button" disabled={saving}>
              {saving ? "Menyimpan…" : editingId ? "Simpan perubahan" : "Simpan pesan"}
            </button>
          </div>
        </form>
      ) : null}

      {loading ? (
        <div className="panel muted">Memuat pesan kustom…</div>
      ) : !items.length ? (
        <EmptyState
          title="Belum ada pesan kustom"
          text="Tambahkan pesan yang sering dipakai tim agar tidak perlu menulis ulang dari awal."
        />
      ) : (
        <div className="custom-template-grid">
          {items.map((item) => (
            <article className="panel custom-template-card" key={item.id}>
              <div className="custom-template-card-head">
                <div>
                  <span className="custom-template-category">
                    {MESSAGE_TEMPLATE_CATEGORY_LABELS[item.category]}
                  </span>
                  <h2>{item.title}</h2>
                  {item.usage ? <p>{item.usage}</p> : null}
                </div>
                <div className="custom-template-actions">
                  <button className="icon-button" onClick={() => startEdit(item)} title="Edit pesan">
                    <Pencil size={15} />
                  </button>
                  <button className="icon-button danger-action" onClick={() => remove(item)} title="Hapus pesan">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              <p className="custom-template-body">{item.body}</p>

              <button className="button secondary compact" onClick={() => copy(item)}>
                {copiedId === item.id ? <Check size={15} /> : <Clipboard size={15} />}
                {copiedId === item.id ? "Tersalin" : "Salin pesan"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
