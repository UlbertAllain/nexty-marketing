import * as XLSX from "xlsx";
import type { Lead, LeadStatus, Potential } from "./types";

type CellValue = string | number | boolean | Date | null | undefined;

export type LeadImportPreview = {
  rows: Partial<Lead>[];
  sheetsRead: number;
  rowsWithoutCompany: number;
  sheetsWithoutHeader: string[];
};

const aliases = {
  companyName: ["company name", "nama perusahaan", "nama usaha", "nama bisnis", "perusahaan", "usaha", "bisnis"],
  category: ["category", "kategori", "bidang usaha", "jenis usaha", "bidang bisnis"],
  contactName: ["contact name", "nama kontak", "contact person", "nama pic", "pic"],
  phone: ["phone", "whatsapp", "wa", "nomor whatsapp", "no whatsapp", "no wa", "kontak", "nomor kontak", "no hp", "telepon", "nomor telepon"],
  email: ["email", "alamat email", "e mail"],
  instagram: ["instagram", "ig", "akun instagram"],
  website: ["website", "situs", "web"],
  googleMaps: ["link google maps", "google maps", "google map", "maps", "lokasi google maps"],
  potential: ["potential", "potensi", "prioritas"],
  status: ["status", "status follow up", "perkembangan"],
  notes: ["notes", "catatan", "keterangan"],
} as const;

type FieldName = keyof typeof aliases;
const fieldByHeader = new Map<string, FieldName>();
for (const [field, names] of Object.entries(aliases) as [FieldName, readonly string[]][]) {
  for (const name of names) fieldByHeader.set(name, field);
}

function normalizeHeader(value: CellValue) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[_–—-]+/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function text(value: CellValue) {
  const result = String(value ?? "").trim();
  return /^(?:-|–|—|n\/?a|null)$/i.test(result) ? "" : result;
}

function potential(value: CellValue): Potential {
  const normalized = normalizeHeader(value);
  if (["high", "tinggi", "utama", "prioritas"].includes(normalized)) return "HIGH";
  if (["low", "rendah", "pantau"].includes(normalized)) return "LOW";
  return "MEDIUM";
}

function status(value: CellValue): LeadStatus {
  const normalized = normalizeHeader(value);
  const statuses: Record<string, LeadStatus> = {
    "belum dihubungi": "NEW",
    "siap dihubungi": "READY_TO_CONTACT",
    "pesan sudah dibuka": "READY_TO_CONTACT",
    "sudah dihubungi": "CONTACTED",
    "sudah dikirim": "CONTACTED",
    "menunggu balasan": "WAITING_REPLY",
    "menunggu jawaban": "WAITING_REPLY",
    "sudah membalas": "REPLIED",
    "peluang cocok": "QUALIFIED",
    "jadwal pertemuan": "MEETING",
    "penawaran dikirim": "PROPOSAL",
    "sedang negosiasi": "NEGOTIATION",
    "berhasil jadi klien": "DEAL",
    "belum berminat": "NOT_INTERESTED",
    "peluang berhenti": "LOST",
  };
  return statuses[normalized] ?? "NEW";
}

function phone(value: CellValue) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const digits = Math.trunc(value).toLocaleString("en-US", { useGrouping: false, maximumFractionDigits: 0 });
    return digits.startsWith("0") || digits.startsWith("62") ? digits : `0${digits}`;
  }
  const first = text(value).split(/[\n/,;]+/).map(item => item.trim()).find(Boolean) ?? "";
  const digits = first.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("0") || digits.startsWith("62") ? digits : `0${digits}`;
}

function otherPhones(value: CellValue) {
  if (typeof value !== "string") return "";
  const parts = value.split(/[\n/,;]+/).map(item => item.replace(/\D/g, "")).filter(Boolean);
  return parts.length > 1 ? `Nomor kontak lain: ${parts.slice(1).join(", ")}` : "";
}

function findHeader(rows: CellValue[][]) {
  let best: { index: number; fields: Map<FieldName, number>; score: number } | null = null;
  for (let index = 0; index < Math.min(rows.length, 25); index++) {
    const fields = new Map<FieldName, number>();
    rows[index].forEach((value, column) => {
      const field = fieldByHeader.get(normalizeHeader(value));
      if (field && !fields.has(field)) fields.set(field, column);
    });
    const score = fields.size;
    if (fields.has("companyName") && score >= 2 && (!best || score > best.score)) best = { index, fields, score };
  }
  return best;
}

function rowValue(row: CellValue[], fields: Map<FieldName, number>, field: FieldName) {
  const column = fields.get(field);
  return column === undefined ? "" : row[column];
}

export function parseLeadWorkbook(workbook: XLSX.WorkBook): LeadImportPreview {
  const result: LeadImportPreview = { rows: [], sheetsRead: 0, rowsWithoutCompany: 0, sheetsWithoutHeader: [] };
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;
    const rawRows = XLSX.utils.sheet_to_json<CellValue[]>(sheet, { header: 1, defval: "", raw: true });
    const header = findHeader(rawRows);
    if (!header) {
      if (rawRows.some(row => row.some(value => text(value)))) result.sheetsWithoutHeader.push(sheetName);
      continue;
    }
    result.sheetsRead++;
    for (const rawRow of rawRows.slice(header.index + 1)) {
      if (!rawRow.some(value => text(value))) continue;
      const companyName = text(rowValue(rawRow, header.fields, "companyName"));
      if (!companyName) {
        result.rowsWithoutCompany++;
        continue;
      }
      const rawPhone = rowValue(rawRow, header.fields, "phone");
      const notes = [text(rowValue(rawRow, header.fields, "notes")), otherPhones(rawPhone)].filter(Boolean).join(" · ");
      result.rows.push({
        companyName,
        category: text(rowValue(rawRow, header.fields, "category")) || sheetName,
        contactName: text(rowValue(rawRow, header.fields, "contactName")),
        phone: phone(rawPhone),
        email: text(rowValue(rawRow, header.fields, "email")),
        instagram: text(rowValue(rawRow, header.fields, "instagram")),
        website: text(rowValue(rawRow, header.fields, "website")),
        googleMaps: text(rowValue(rawRow, header.fields, "googleMaps")),
        potential: potential(rowValue(rawRow, header.fields, "potential")),
        status: status(rowValue(rawRow, header.fields, "status")),
        notes,
      });
    }
  }
  return result;
}
