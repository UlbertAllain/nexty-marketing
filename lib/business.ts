import type { Lead, LeadStatus, Potential, Template } from "./types";

export const MAX_LEAD_IMPORT_ROWS = 5000;

export const LEAD_FIELD_LIMITS = {
  companyName: 120,
  category: 80,
  contactName: 100,
  phone: 32,
  email: 160,
  instagram: 200,
  website: 500,
  googleMaps: 1000,
  notes: 2000,
} as const;

export const statusLabel: Record<LeadStatus, string> = {
  NEW: "Belum dihubungi",
  READY_TO_CONTACT: "Pesan sudah dibuka",
  CONTACTED: "Sudah dikirim",
  WAITING_REPLY: "Menunggu jawaban",
  REPLIED: "Sudah membalas",
  QUALIFIED: "Peluang cocok",
  MEETING: "Jadwal pertemuan",
  PROPOSAL: "Penawaran dikirim",
  NEGOTIATION: "Sedang negosiasi",
  DEAL: "Berhasil jadi klien",
  NOT_INTERESTED: "Belum berminat",
  LOST: "Peluang berhenti",
};

const transitions: Record<LeadStatus, LeadStatus[]> = {
  NEW: ["READY_TO_CONTACT", "CONTACTED", "NOT_INTERESTED"],
  READY_TO_CONTACT: ["CONTACTED", "NEW", "NOT_INTERESTED"],
  CONTACTED: ["WAITING_REPLY", "REPLIED", "NOT_INTERESTED"],
  WAITING_REPLY: ["REPLIED", "NOT_INTERESTED", "LOST"],
  REPLIED: ["QUALIFIED", "NOT_INTERESTED", "LOST"],
  QUALIFIED: ["MEETING", "PROPOSAL", "NOT_INTERESTED", "LOST"],
  MEETING: ["PROPOSAL", "NEGOTIATION", "NOT_INTERESTED", "LOST"],
  PROPOSAL: ["NEGOTIATION", "DEAL", "LOST"],
  NEGOTIATION: ["DEAL", "LOST"],
  DEAL: [],
  NOT_INTERESTED: ["READY_TO_CONTACT"],
  LOST: ["READY_TO_CONTACT"],
};

export const allowedTransitions = (status: LeadStatus) => transitions[status];

export function assertTransition(from: LeadStatus, to: LeadStatus) {
  if (from !== to && !transitions[from].includes(to)) {
    throw new Error(
      `Perkembangan "${statusLabel[from]}" belum bisa langsung dipindahkan ke "${statusLabel[to]}".`,
    );
  }
}

export const normalizeCompany = (value: string) =>
  value.trim().toLocaleLowerCase("id-ID").replace(/\s+/g, " ");

export function normalizePhone(value: string) {
  let phone = value.replace(/[^\d+]/g, "");
  if (phone.startsWith("+")) phone = phone.slice(1);
  if (phone.startsWith("0")) phone = `62${phone.slice(1)}`;
  return phone;
}

export const isValidWhatsApp = (value: string) =>
  /^62[1-9]\d{7,12}$/.test(normalizePhone(value));

function validateLength(
  errors: string[],
  label: string,
  value: string | undefined,
  max: number,
) {
  if (value && value.trim().length > max) {
    errors.push(`${label} maksimal ${max} karakter.`);
  }
}

export function validateLead(input: Partial<Lead>) {
  const errors: string[] = [];
  if (!input.companyName?.trim()) errors.push("Nama perusahaan belum diisi.");

  validateLength(errors, "Nama perusahaan", input.companyName, LEAD_FIELD_LIMITS.companyName);
  validateLength(errors, "Jenis usaha", input.category, LEAD_FIELD_LIMITS.category);
  validateLength(errors, "Nama kontak", input.contactName, LEAD_FIELD_LIMITS.contactName);
  validateLength(errors, "Nomor WhatsApp", input.phone, LEAD_FIELD_LIMITS.phone);
  validateLength(errors, "Email", input.email, LEAD_FIELD_LIMITS.email);
  validateLength(errors, "Instagram", input.instagram, LEAD_FIELD_LIMITS.instagram);
  validateLength(errors, "Website", input.website, LEAD_FIELD_LIMITS.website);
  validateLength(errors, "Google Maps", input.googleMaps, LEAD_FIELD_LIMITS.googleMaps);
  validateLength(errors, "Catatan", input.notes, LEAD_FIELD_LIMITS.notes);

  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.push("Alamat email belum sesuai format.");
  }
  if (input.phone && !isValidWhatsApp(input.phone)) {
    errors.push("Nomor WhatsApp belum sesuai format Indonesia.");
  }
  return errors;
}

export function generateMessage(
  template: Pick<Template, "content">,
  lead: Pick<Lead, "companyName" | "contactName" | "category">,
) {
  return template.content
    .replaceAll("{{company_name}}", lead.companyName)
    .replaceAll("{{contact_name}}", lead.contactName || "Bapak/Ibu")
    .replaceAll("{{category}}", lead.category || "bisnis");
}

export function whatsappDraftUrl(phone: string, message: string) {
  const normalized = normalizePhone(phone);
  if (!isValidWhatsApp(normalized)) {
    throw new Error("Nomor WhatsApp belum siap digunakan.");
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function instagramUrl(value: string) {
  const trimmed = value.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const handle = trimmed
    .replace(/^@/, "")
    .replace(/^instagram\.com\//i, "")
    .replace(/\/$/, "");
  return `https://www.instagram.com/${encodeURIComponent(handle)}/`;
}

export function googleMapsUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
}

export function websiteUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function isDueAt(value: string, now = new Date()) {
  const dueAt = new Date(value).getTime();
  return Number.isFinite(dueAt) && dueAt <= now.getTime();
}

export function metrics(leads: Lead[]) {
  const contacted = leads.filter(
    (item) => !["NEW", "READY_TO_CONTACT"].includes(item.status),
  ).length;
  const replied = leads.filter((item) =>
    [
      "REPLIED",
      "QUALIFIED",
      "MEETING",
      "PROPOSAL",
      "NEGOTIATION",
      "DEAL",
    ].includes(item.status),
  ).length;
  const deal = leads.filter((item) => item.status === "DEAL").length;

  return {
    total: leads.length,
    contacted,
    replied,
    deal,
    responseRate: contacted ? Math.round((replied / contacted) * 100) : 0,
    conversionRate: leads.length ? Math.round((deal / leads.length) * 100) : 0,
  };
}

export const potentialLabel: Record<Potential, string> = {
  LOW: "Pantau",
  MEDIUM: "Menjanjikan",
  HIGH: "Prioritas",
};
