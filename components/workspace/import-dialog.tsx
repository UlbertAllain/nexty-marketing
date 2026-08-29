"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { importLeads } from "@/lib/repository";
import {
  parseLeadWorkbook,
  readLeadWorkbook,
  validateSpreadsheetFile,
  type LeadImportPreview,
} from "@/lib/spreadsheet-import";
import type { Lead } from "@/lib/types";
import { Dialog } from "./dialog";

export function ImportDialog({
  ownerId,
  onClose,
  onSaved,
  notify,
}: {
  ownerId: string;
  onClose: () => void;
  onSaved: () => void;
  notify: (text: string) => void;
}) {
  const [rows, setRows] = useState<Partial<Lead>[]>([]);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState<LeadImportPreview | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function read(file: File) {
    setFileName(file.name);
    setRows([]);
    setPreview(null);
    setError("");

    const fileError = validateSpreadsheetFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    try {
      const workbook = readLeadWorkbook(await file.arrayBuffer());
      const parsed = parseLeadWorkbook(workbook);
      setRows(parsed.rows);
      setPreview(parsed);
      if (!parsed.rows.length) {
        setError(
          "Tidak ada data yang bisa dimasukkan. Pastikan ada kolom Nama Usaha atau Nama Perusahaan.",
        );
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "File belum bisa dibaca. Gunakan file Excel .xlsx atau .xls yang tidak rusak.",
      );
    }
  }

  async function submitImport() {
    if (!rows.length || saving) return;

    try {
      setSaving(true);
      setError("");
      const result = await importLeads(ownerId, rows);
      notify(
        `${result.imported} calon klien masuk, ${result.duplicates} data ganda dilewati, ${result.invalid} data perlu diperiksa.`,
      );
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Data belum bisa dimasukkan. Coba kembali beberapa saat lagi.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog title="Ambil calon klien dari Excel" onClose={onClose}>
      <div className="import-box">
        <label>
          <FileUp />
          <b>Pilih file Excel</b>
          <span>
            {fileName || "Format .xlsx/.xls, maksimal 5 MB dan 5.000 calon klien"}
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            disabled={saving}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void read(file);
            }}
          />
        </label>

        {error && <div className="attention">{error}</div>}

        {rows.length > 0 && (
          <>
            <p>
              <b>{rows.length}</b> calon klien terbaca dari {preview?.sheetsRead || 1}{" "}
              sheet. Data ganda akan dilewati.
            </p>
            {preview?.rowsWithoutCompany ? (
              <p>{preview.rowsWithoutCompany} baris tanpa nama perusahaan dilewati.</p>
            ) : null}
            {preview?.sheetsWithoutHeader.length ? (
              <p>
                Sheet yang tidak dikenali: {preview.sheetsWithoutHeader.join(", ")}.
              </p>
            ) : null}
            <div className="preview-list">
              {rows.slice(0, 5).map((row, index) => (
                <div key={`${row.companyName || "row"}-${index}`}>
                  <b>{row.companyName}</b>
                  <span>{row.phone || "Nomor belum tersedia"}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="secondary" onClick={onClose} disabled={saving}>
            Batal
          </button>
          <button
            className="primary"
            disabled={!rows.length || saving}
            onClick={submitImport}
          >
            {saving ? "Memasukkan..." : `Masukkan ${rows.length} data`}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
