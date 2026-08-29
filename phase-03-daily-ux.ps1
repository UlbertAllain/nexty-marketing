param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host "[Phase 03] $Message" -ForegroundColor Cyan
}

function Get-ProjectPath([string]$RelativePath) {
    return Join-Path $ProjectRoot $RelativePath
}

function Backup-File([string]$RelativePath, [string]$BackupRoot) {
    $source = Get-ProjectPath $RelativePath
    if (-not (Test-Path -LiteralPath $source)) {
        throw "File wajib tidak ditemukan: $RelativePath"
    }

    $destination = Join-Path $BackupRoot $RelativePath
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Force -Path $destinationDirectory | Out-Null
    Copy-Item -LiteralPath $source -Destination $destination -Force
}

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$packagePath = Get-ProjectPath "package.json"

if (-not (Test-Path -LiteralPath $packagePath)) {
    throw "Jalankan patch dari root project nexty-marketing."
}

$package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
if ($package.name -ne "nexty-labs-marketing-crm") {
    throw "package.json tidak dikenali. Patch dibatalkan."
}

$requiredFiles = @(
    "lib/repository.ts",
    "lib/business.ts",
    "lib/types.ts",
    "components/workspace/lead-dialog.tsx",
    "components/workspace/leads-view.tsx",
    "components/workspace/template-dialog.tsx",
    "components/workspace/templates-view.tsx",
    "components/workspace/followups-view.tsx",
    "components/crm-app.tsx",
    "tests/business.test.ts",
    "app/globals.css"
)

foreach ($relativePath in $requiredFiles) {
    if (-not (Test-Path -LiteralPath (Get-ProjectPath $relativePath))) {
        throw "File wajib tidak ditemukan: $relativePath"
    }
}

$repositoryBefore = Get-Content -Raw -LiteralPath (Get-ProjectPath "lib/repository.ts")
$typesBefore = Get-Content -Raw -LiteralPath (Get-ProjectPath "lib/types.ts")
$templateBefore = Get-Content -Raw -LiteralPath (Get-ProjectPath "components/workspace/template-dialog.tsx")
$cssBefore = Get-Content -Raw -LiteralPath (Get-ProjectPath "app/globals.css")

if (
    -not $repositoryBefore.Contains('existingDrafts.docs.slice(1)') -or
    -not $repositoryBefore.Contains('isAutomaticFollowUp') -or
    -not $typesBefore.Contains('status:"DRAFT"|"SENT"|"CANCELLED"')
) {
    throw "Phase 02 belum terdeteksi. Jalankan phase-02-fix-marketing-flow.ps1 terlebih dahulu."
}

if (
    $templateBefore.Contains('@/lib/ai-template') -or
    $templateBefore.Contains('/api/ai/generate-template') -or
    $templateBefore.Contains('Sparkles') -or
    $cssBefore.Contains('.generator-box')
) {
    throw "Phase 01 belum bersih. Jalankan phase-01-clean-ai.ps1 terlebih dahulu."
}

if ($repositoryBefore -match 'export\s+async\s+function\s+updateLead\s*\(') {
    throw "Phase 03 tampaknya sudah pernah diterapkan. Patch dibatalkan agar tidak menimpa perubahan lanjutan."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Get-ProjectPath ".patch-backups/phase-03-$timestamp"

foreach ($relativePath in $requiredFiles) {
    if ($relativePath -eq "lib/types.ts") { continue }
    Backup-File $relativePath $backupRoot
}

Write-Step "Backup file Phase 03 dibuat"
Write-Step "Menambahkan edit lead tanpa mengubah status/pipeline"

$repositoryContent = @'
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  assertTransition,
  normalizeCompany,
  normalizePhone,
  validateLead,
} from "./business";
import type { FollowUp, Lead, LeadStatus, Template } from "./types";

const AUTO_FOLLOW_UP_REASON = "Periksa apakah sudah ada balasan";
const AUTO_FOLLOW_UP_NOTES =
  "Dibuat otomatis setelah pesan ditandai terkirim.";

function mustDb() {
  if (!db) {
    throw new Error("Firebase belum siap. Periksa isi .env.local.");
  }

  return db;
}

function withoutUndefined(data: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  );
}

function earliestDate(dates: string[]) {
  return dates.length ? [...dates].sort()[0] : null;
}

function isAutomaticFollowUp(data: Record<string, unknown>) {
  return (
    data.reason === AUTO_FOLLOW_UP_REASON && data.notes === AUTO_FOLLOW_UP_NOTES
  );
}

async function listActiveFollowUps(ownerId: string, leadId: string) {
  return getDocs(
    query(
      collection(mustDb(), "followups"),
      where("ownerId", "==", ownerId),
      where("leadId", "==", leadId),
      where("status", "==", "ACTIVE"),
    ),
  );
}

export async function listOwned<T>(
  collectionName: string,
  ownerId: string,
  max = 500,
) {
  const snapshot = await getDocs(
    query(
      collection(mustDb(), collectionName),
      where("ownerId", "==", ownerId),
      orderBy("createdAt", "desc"),
      limit(max),
    ),
  );

  return snapshot.docs.map(
    (item) => ({ id: item.id, ...item.data() }) as T,
  );
}

function leadDocument(
  id: string,
  ownerId: string,
  input: Partial<Lead>,
  now: string,
): Lead {
  return {
    id,
    ownerId,
    companyName: input.companyName!.trim(),
    normalizedCompanyName: normalizeCompany(input.companyName!),
    category: input.category?.trim() || "Lainnya",
    contactName: input.contactName?.trim() || "",
    phone: input.phone?.trim() || "",
    normalizedPhone: normalizePhone(input.phone || ""),
    email: input.email?.trim() || "",
    instagram: input.instagram?.trim() || "",
    website: input.website?.trim() || "",
    googleMaps: input.googleMaps?.trim() || "",
    potential: input.potential || "MEDIUM",
    status: input.status || "NEW",
    contactHealth: input.phone ? "READY" : "NEED_CHECK",
    notes: input.notes?.trim() || "",
    followUpAt: null,
    lastContactAt: null,
    lastReplyAt: null,
    attentionReason: null,
    createdAt: now,
    updatedAt: now,
  };
}

export async function createLead(ownerId: string, input: Partial<Lead>) {
  const errors = validateLead(input);
  if (errors.length) throw new Error(errors.join(" "));

  const database = mustDb();
  const normalizedCompanyName = normalizeCompany(input.companyName!);
  const duplicate = await getDocs(
    query(
      collection(database, "leads"),
      where("ownerId", "==", ownerId),
      where("normalizedCompanyName", "==", normalizedCompanyName),
      limit(1),
    ),
  );

  if (!duplicate.empty) {
    throw new Error("Perusahaan ini sudah ada di daftar calon klien.");
  }

  const now = new Date().toISOString();
  const ref = doc(collection(database, "leads"));
  const lead = leadDocument(ref.id, ownerId, input, now);
  const batch = writeBatch(database);

  batch.set(ref, withoutUndefined(lead));
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: ref.id,
    type: "LEAD_CREATED",
    description: `${lead.companyName} ditambahkan ke daftar calon klien.`,
    createdAt: now,
  });

  await batch.commit();
  return lead;
}

export async function updateLead(
  ownerId: string,
  lead: Lead,
  input: Partial<Lead>,
) {
  const next = { ...lead, ...input };
  const errors = validateLead(next);
  if (errors.length) throw new Error(errors.join(" "));

  const database = mustDb();
  const normalizedCompanyName = normalizeCompany(next.companyName);
  const duplicate = await getDocs(
    query(
      collection(database, "leads"),
      where("ownerId", "==", ownerId),
      where("normalizedCompanyName", "==", normalizedCompanyName),
      limit(2),
    ),
  );

  if (duplicate.docs.some((item) => item.id !== lead.id)) {
    throw new Error("Perusahaan ini sudah ada di daftar calon klien.");
  }

  const now = new Date().toISOString();
  const phone = next.phone?.trim() || "";
  const normalizedPhone = normalizePhone(phone);

  await setDoc(
    doc(database, "leads", lead.id),
    {
      ownerId,
      companyName: next.companyName.trim(),
      normalizedCompanyName,
      category: next.category?.trim() || "Lainnya",
      contactName: next.contactName?.trim() || "",
      phone,
      normalizedPhone,
      email: next.email?.trim() || "",
      instagram: next.instagram?.trim() || "",
      website: next.website?.trim() || "",
      googleMaps: next.googleMaps?.trim() || "",
      potential: next.potential || "MEDIUM",
      contactHealth: normalizedPhone ? "READY" : "NEED_CHECK",
      notes: next.notes?.trim() || "",
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function updateLeadStatus(
  ownerId: string,
  lead: Lead,
  status: LeadStatus,
) {
  assertTransition(lead.status, status);

  const database = mustDb();
  const now = new Date().toISOString();
  const batch = writeBatch(database);

  batch.update(doc(database, "leads", lead.id), {
    ownerId,
    status,
    attentionReason: null,
    updatedAt: now,
  });
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: lead.id,
    type: "STATUS_CHANGED",
    description: `Perkembangan ${lead.companyName} menjadi ${status}.`,
    createdAt: now,
  });

  if (status === "DEAL") {
    const active = await listActiveFollowUps(ownerId, lead.id);
    active.docs.forEach((item) =>
      batch.update(item.ref, { status: "CANCELLED", updatedAt: now }),
    );
    batch.update(doc(database, "leads", lead.id), { followUpAt: null });
  }

  await batch.commit();
}

export async function saveTemplate(
  ownerId: string,
  input: Partial<Template>,
) {
  if (!input.title?.trim() || !input.content?.trim()) {
    throw new Error("Nama dan isi pesan perlu dilengkapi.");
  }

  const database = mustDb();
  const now = new Date().toISOString();
  const ref = input.id
    ? doc(database, "templates", input.id)
    : doc(collection(database, "templates"));

  await setDoc(
    ref,
    {
      ownerId,
      category: input.category?.trim() || "Semua bisnis",
      title: input.title.trim(),
      content: input.content.trim(),
      isDefault: Boolean(input.isDefault),
      createdAt: input.createdAt || now,
      updatedAt: now,
    },
    { merge: true },
  );
}

export async function recordWhatsAppOpened(
  ownerId: string,
  lead: Lead,
  content: string,
) {
  const database = mustDb();
  const now = new Date().toISOString();
  const existingDrafts = await getDocs(
    query(
      collection(database, "messages"),
      where("ownerId", "==", ownerId),
      where("leadId", "==", lead.id),
      where("status", "==", "DRAFT"),
    ),
  );

  const messageRef =
    existingDrafts.docs[0]?.ref ?? doc(collection(database, "messages"));
  const batch = writeBatch(database);

  if (existingDrafts.empty) {
    batch.set(messageRef, {
      ownerId,
      leadId: lead.id,
      content,
      direction: "outgoing",
      status: "DRAFT",
      createdAt: now,
      updatedAt: now,
    });
  } else {
    batch.update(messageRef, { content, updatedAt: now });
    existingDrafts.docs.slice(1).forEach((item) =>
      batch.update(item.ref, { status: "CANCELLED", updatedAt: now }),
    );
  }

  batch.update(doc(database, "leads", lead.id), {
    status: lead.status === "NEW" ? "READY_TO_CONTACT" : lead.status,
    updatedAt: now,
  });
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: lead.id,
    type: "WHATSAPP_OPENED",
    description: `Pesan untuk ${lead.companyName} dibuka di WhatsApp dan menunggu konfirmasi.`,
    createdAt: now,
  });

  await batch.commit();
  return messageRef.id;
}

export async function confirmWhatsAppSent(
  ownerId: string,
  lead: Lead,
  messageId: string,
  remindInDays = 3,
) {
  const database = mustDb();
  const now = new Date();
  const nowIso = now.toISOString();
  const active = await listActiveFollowUps(ownerId, lead.id);
  const automatic = active.docs.filter((item) =>
    isAutomaticFollowUp(item.data()),
  );
  const manual = active.docs.filter(
    (item) => !isAutomaticFollowUp(item.data()),
  );
  const batch = writeBatch(database);

  batch.update(doc(database, "messages", messageId), {
    status: "SENT",
    updatedAt: nowIso,
  });
  batch.update(doc(database, "leads", lead.id), {
    status: ["NEW", "READY_TO_CONTACT"].includes(lead.status)
      ? "CONTACTED"
      : lead.status,
    lastContactAt: nowIso,
    attentionReason: null,
    updatedAt: nowIso,
  });
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: lead.id,
    type: "MESSAGE_SENT",
    description: `Pesan untuk ${lead.companyName} ditandai sudah dikirim.`,
    createdAt: nowIso,
  });

  let automaticDate: string | null = null;

  if (remindInDays > 0) {
    automaticDate = new Date(
      now.getTime() + remindInDays * 86_400_000,
    ).toISOString();

    const primaryAutomatic = automatic[0];
    if (primaryAutomatic) {
      batch.update(primaryAutomatic.ref, {
        date: automaticDate,
        reason: AUTO_FOLLOW_UP_REASON,
        notes: AUTO_FOLLOW_UP_NOTES,
        status: "ACTIVE",
        updatedAt: nowIso,
      });
    } else {
      const followRef = doc(collection(database, "followups"));
      batch.set(followRef, {
        ownerId,
        leadId: lead.id,
        date: automaticDate,
        reason: AUTO_FOLLOW_UP_REASON,
        notes: AUTO_FOLLOW_UP_NOTES,
        status: "ACTIVE",
        createdAt: nowIso,
        updatedAt: nowIso,
      });
    }

    automatic.slice(1).forEach((item) =>
      batch.update(item.ref, { status: "CANCELLED", updatedAt: nowIso }),
    );
  } else {
    automatic.forEach((item) =>
      batch.update(item.ref, { status: "CANCELLED", updatedAt: nowIso }),
    );
  }

  const nextFollowUpAt = earliestDate([
    ...manual.map((item) => String(item.data().date)),
    ...(automaticDate ? [automaticDate] : []),
  ]);

  batch.update(doc(database, "leads", lead.id), {
    followUpAt: nextFollowUpAt,
  });

  await batch.commit();
}

export async function scheduleReminder(
  ownerId: string,
  input: { leadId: string; date: string; reason: string; notes: string },
) {
  if (new Date(input.date) <= new Date()) {
    throw new Error("Pilih waktu yang belum lewat.");
  }

  const database = mustDb();
  const active = await listActiveFollowUps(ownerId, input.leadId);
  const now = new Date().toISOString();
  const ref = doc(collection(database, "followups"));
  const batch = writeBatch(database);
  const nextFollowUpAt = earliestDate([
    input.date,
    ...active.docs.map((item) => String(item.data().date)),
  ]);

  batch.set(ref, {
    ownerId,
    ...input,
    status: "ACTIVE",
    createdAt: now,
    updatedAt: now,
  });
  batch.update(doc(database, "leads", input.leadId), {
    followUpAt: nextFollowUpAt,
    updatedAt: now,
  });
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: input.leadId,
    type: "FOLLOWUP_CREATED",
    description: "Pengingat untuk menghubungi kembali dibuat.",
    createdAt: now,
  });

  await batch.commit();
  return ref.id;
}

export async function completeReminder(ownerId: string, item: FollowUp) {
  const database = mustDb();
  const active = await listActiveFollowUps(ownerId, item.leadId);
  const now = new Date().toISOString();
  const batch = writeBatch(database);
  const remainingDates = active.docs
    .filter((activeItem) => activeItem.id !== item.id)
    .map((activeItem) => String(activeItem.data().date));

  batch.update(doc(database, "followups", item.id), {
    status: "COMPLETED",
    updatedAt: now,
  });
  batch.update(doc(database, "leads", item.leadId), {
    followUpAt: earliestDate(remainingDates),
    updatedAt: now,
  });
  batch.set(doc(collection(database, "activities")), {
    ownerId,
    leadId: item.leadId,
    type: "FOLLOWUP_COMPLETED",
    description: "Pengingat selesai dikerjakan.",
    createdAt: now,
  });

  await batch.commit();
}

export async function importLeads(ownerId: string, rows: Partial<Lead>[]) {
  const database = mustDb();
  const existing = await getDocs(
    query(collection(database, "leads"), where("ownerId", "==", ownerId)),
  );
  const names = new Set(
    existing.docs.map((item) => item.data().normalizedCompanyName),
  );

  let duplicates = 0;
  let invalid = 0;
  const accepted: Partial<Lead>[] = [];

  for (const row of rows) {
    if (validateLead(row).length) {
      invalid++;
      continue;
    }

    const name = normalizeCompany(row.companyName!);
    if (names.has(name)) {
      duplicates++;
      continue;
    }

    names.add(name);
    accepted.push(row);
  }

  for (let start = 0; start < accepted.length; start += 200) {
    const now = new Date().toISOString();
    const batch = writeBatch(database);

    for (const row of accepted.slice(start, start + 200)) {
      const ref = doc(collection(database, "leads"));
      const lead = leadDocument(ref.id, ownerId, row, now);
      batch.set(ref, withoutUndefined(lead));
      batch.set(doc(collection(database, "activities")), {
        ownerId,
        leadId: ref.id,
        type: "LEAD_CREATED",
        description: `${lead.companyName} dimasukkan dari Excel.`,
        createdAt: now,
      });
    }

    await batch.commit();
  }

  const imported = accepted.length;
  await addDoc(collection(database, "activities"), {
    ownerId,
    leadId: "",
    type: "IMPORT",
    description: `Import selesai: ${imported} masuk, ${duplicates} ganda dilewati, ${invalid} perlu diperbaiki.`,
    createdAt: new Date().toISOString(),
  });

  return { imported, duplicates, invalid };
}
'@
Set-Content -LiteralPath (Get-ProjectPath "lib/repository.ts") -Value $repositoryContent -Encoding utf8

$businessContent = @'
import type { Lead, LeadStatus, Potential, Template } from "./types";

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
      `Perkembangan â€œ${statusLabel[from]}â€ belum bisa langsung dipindahkan ke â€œ${statusLabel[to]}â€.`,
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

export function validateLead(input: Partial<Lead>) {
  const errors: string[] = [];
  if (!input.companyName?.trim()) errors.push("Nama perusahaan belum diisi.");
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
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
'@
Set-Content -LiteralPath (Get-ProjectPath "lib/business.ts") -Value $businessContent -Encoding utf8
Write-Step "Website sekarang bisa dibuka langsung dan dinormalisasi ke HTTPS"

$leadDialogContent = @'
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
'@
Set-Content -LiteralPath (Get-ProjectPath "components/workspace/lead-dialog.tsx") -Value $leadDialogContent -Encoding utf8
Write-Step "Form calon klien sekarang mendukung create dan edit"

$leadsViewContent = @'
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
'@
Set-Content -LiteralPath (Get-ProjectPath "components/workspace/leads-view.tsx") -Value $leadsViewContent -Encoding utf8

$templateDialogContent = @'
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
'@
Set-Content -LiteralPath (Get-ProjectPath "components/workspace/template-dialog.tsx") -Value $templateDialogContent -Encoding utf8
Write-Step "Pesan siap pakai sekarang bisa diedit tanpa AI"

$templatesViewContent = @'
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
'@
Set-Content -LiteralPath (Get-ProjectPath "components/workspace/templates-view.tsx") -Value $templatesViewContent -Encoding utf8

$followupsViewContent = @'
"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { CalendarClock, Check, Plus } from "lucide-react";
import { completeReminder, scheduleReminder } from "@/lib/repository";
import type { FollowUp, Lead } from "@/lib/types";
import { Dialog, EmptyState } from "./dialog";

export function FollowupsView({
  ownerId,
  items,
  leads,
  onRefresh,
  notify,
}: {
  ownerId: string;
  items: FollowUp[];
  leads: Lead[];
  onRefresh: () => void;
  notify: (text: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [initialLeadId, setInitialLeadId] = useState("");
  const active = items
    .filter((item) => item.status === "ACTIVE")
    .sort((a, b) => a.date.localeCompare(b.date));

  useEffect(() => {
    const url = new URL(window.location.href);
    const leadId = url.searchParams.get("lead") || "";
    const canSchedule = leads.some(
      (lead) => lead.id === leadId && lead.status !== "DEAL",
    );

    if (!leadId || !canSchedule) return;

    setInitialLeadId(leadId);
    setOpen(true);
    url.searchParams.delete("lead");
    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, [leads]);

  function openNewReminder() {
    setInitialLeadId("");
    setOpen(true);
  }

  return (
    <>
      <div className="hero-row compact">
        <div>
          <span className="eyebrow">PENGINGAT</span>
          <h2>Ingat siapa yang perlu dihubungi kembali.</h2>
          <p>
            Pengingat muncul saat aplikasi dibuka. Tidak ada pesan yang dikirim
            diam-diam.
          </p>
        </div>
        <button className="primary" onClick={openNewReminder}>
          <Plus size={17} />
          Buat pengingat
        </button>
      </div>

      <div className="follow-list">
        {active.map((item) => {
          const due = new Date(item.date) <= new Date();
          const lead = leads.find((candidate) => candidate.id === item.leadId);

          return (
            <article key={item.id}>
              <time>
                {new Date(item.date).toLocaleDateString("id-ID", {
                  day: "2-digit",
                  month: "short",
                })}
              </time>
              <div>
                <h3>{lead?.companyName || "Calon klien"}</h3>
                <p>{item.reason}</p>
                <small>{new Date(item.date).toLocaleString("id-ID")}</small>
              </div>
              <button
                className={due ? "quick-action confirm" : "quick-action"}
                onClick={async () => {
                  await completeReminder(ownerId, item);
                  notify("Pengingat ditandai selesai.");
                  onRefresh();
                }}
              >
                <Check size={15} />
                Selesai
              </button>
            </article>
          );
        })}

        {!active.length && <EmptyState>Belum ada pengingat aktif.</EmptyState>}
      </div>

      {open && (
        <ReminderDialog
          ownerId={ownerId}
          leads={leads}
          initialLeadId={initialLeadId}
          close={() => setOpen(false)}
          saved={() => {
            setOpen(false);
            onRefresh();
          }}
          notify={notify}
        />
      )}
    </>
  );
}

function ReminderDialog({
  ownerId,
  leads,
  initialLeadId,
  close,
  saved,
  notify,
}: {
  ownerId: string;
  leads: Lead[];
  initialLeadId: string;
  close: () => void;
  saved: () => void;
  notify: (text: string) => void;
}) {
  const [leadId, setLeadId] = useState(initialLeadId);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <Dialog title="Buat pengingat" onClose={close}>
      <form
        className="form-grid"
        onSubmit={async (event) => {
          event.preventDefault();

          try {
            await scheduleReminder(ownerId, {
              leadId,
              date: new Date(date).toISOString(),
              reason,
              notes,
            });
            notify("Pengingat sudah dibuat.");
            saved();
          } catch (error) {
            notify(
              error instanceof Error
                ? error.message
                : "Pengingat belum bisa dibuat.",
            );
          }
        }}
      >
        <label className="wide">
          Calon klien
          <select
            required
            value={leadId}
            onChange={(event) => setLeadId(event.target.value)}
          >
            <option value="">Pilih calon klien</option>
            {leads
              .filter((lead) => lead.status !== "DEAL")
              .map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.companyName}
                </option>
              ))}
          </select>
        </label>

        <label className="wide">
          Waktu menghubungi kembali
          <input
            required
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </label>

        <label className="wide">
          Tujuan
          <input
            required
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tanyakan keputusan setelah penawaran"
          />
        </label>

        <label className="wide">
          Catatan tambahan
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        <div className="modal-actions wide">
          <button type="button" className="secondary" onClick={close}>
            Batal
          </button>
          <button className="primary">
            <CalendarClock size={16} />
            Simpan pengingat
          </button>
        </div>
      </form>
    </Dialog>
  );
}
'@
Set-Content -LiteralPath (Get-ProjectPath "components/workspace/followups-view.tsx") -Value $followupsViewContent -Encoding utf8
Write-Step "Link follow-up dari detail lead sekarang langsung memilih lead terkait"

$crmAppContent = @'
"use client";
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "./auth-provider";
import { listOwned } from "@/lib/repository";
import type { Activity, FollowUp, Lead, Message, Template } from "@/lib/types";
import { Sidebar, viewTitle } from "./workspace/sidebar";
import { DashboardView } from "./workspace/dashboard-view";
import { LeadsView } from "./workspace/leads-view";
import { FollowupsView } from "./workspace/followups-view";
import { TemplatesView } from "./workspace/templates-view";
import { AnalyticsView } from "./workspace/analytics-view";
import { LeadDialog } from "./workspace/lead-dialog";
import { TemplateDialog } from "./workspace/template-dialog";
import { ImportDialog } from "./workspace/import-dialog";

export function CrmApp({ view }: { view: string }) {
  const { user, loading, configured } = useAuth();
  const [menu, setMenu] = useState(false),
    [dialog, setDialog] = useState<string | null>(null),
    [busy, setBusy] = useState(true),
    [error, setError] = useState(""),
    [toast, setToast] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]),
    [templates, setTemplates] = useState<Template[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [followups, setFollowups] = useState<FollowUp[]>([]),
    [activities, setActivities] = useState<Activity[]>([]);
  async function refresh() {
    if (!user) return;
    try {
      setBusy(true);
      setError("");
      const data = await Promise.all([
        listOwned<Lead>("leads", user.uid),
        listOwned<Template>("templates", user.uid),
        listOwned<Message>("messages", user.uid),
        listOwned<FollowUp>("followups", user.uid),
        listOwned<Activity>("activities", user.uid),
      ]);
      setLeads(data[0]);
      setTemplates(data[1]);
      setMessages(data[2]);
      setFollowups(data[3]);
      setActivities(data[4]);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Data belum bisa dimuat.",
      );
    } finally {
      setBusy(false);
    }
  }
  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(""), 5000);
  }
  useEffect(() => {
    if (!loading && !user) location.href = "/login";
    if (user) refresh();
  }, [user, loading]);
  if (loading || (busy && !user))
    return <main className="center-state">Menyiapkan ruang kerjaâ€¦</main>;
  if (!configured)
    return (
      <main className="center-state">
        <div>
          <h2>Firebase belum tersambung</h2>
          <p>
            Lengkapi file <code>.env.local</code>, lalu jalankan kembali
            aplikasi.
          </p>
        </div>
      </main>
    );
  if (!user) return null;
  const common = { onRefresh: refresh, notify };
  return (
    <div className="app-shell">
      <Sidebar view={view} open={menu} onClose={() => setMenu(false)} />
      <main className="workspace">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <p>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <h1>{viewTitle(view)}</h1>
          </div>
          <div className="top-actions">
            <div className="avatar">N</div>
          </div>
        </header>
        {error && <div className="banner error-box">{error}</div>}
        <section className="content">
          {view === "dashboard" && (
            <DashboardView
              leads={leads}
              followups={followups}
              activities={activities}
              messages={messages}
              onAdd={() => setDialog("lead")}
            />
          )}{" "}
          {view === "leads" && (
            <LeadsView
              ownerId={user.uid}
              leads={leads}
              templates={templates}
              messages={messages}
              onAdd={() => setDialog("lead")}
              onImport={() => setDialog("import")}
              {...common}
            />
          )}{" "}
          {view === "follow-up" && (
            <FollowupsView
              ownerId={user.uid}
              items={followups}
              leads={leads}
              {...common}
            />
          )}{" "}
          {view === "templates" && (
            <TemplatesView
              ownerId={user.uid}
              templates={templates}
              onAdd={() => setDialog("template")}
              {...common}
            />
          )}{" "}
          {view === "analytics" && <AnalyticsView leads={leads} />}{" "}
          {view === "settings" && <SettingsView email={user.email || "â€”"} />}
        </section>
      </main>
      {dialog === "lead" && (
        <LeadDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            notify("Calon klien baru sudah masuk ke daftar.");
            refresh();
          }}
        />
      )}
      {dialog === "template" && (
        <TemplateDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            notify("Pesan siap pakai sudah disimpan.");
            refresh();
          }}
        />
      )}
      {dialog === "import" && (
        <ImportDialog
          ownerId={user.uid}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null);
            refresh();
          }}
          notify={notify}
        />
      )}{" "}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function SettingsView({ email }: { email: string }) {
  return (
    <div className="dashboard-grid">
      <section className="panel">
        <div className="panel-title">
          <h3>Akun masuk</h3>
        </div>
        <dl className="settings-list">
          <div>
            <dt>Email</dt>
            <dd>{email}</dd>
          </div>
          <div>
            <dt>Akses</dt>
            <dd>1 akun marketing</dd>
          </div>
        </dl>
      </section>
      <section className="panel">
        <div className="panel-title">
          <h3>Cara pengiriman WhatsApp</h3>
        </div>
        <div className="connection ok">
          <b>Tanpa Meta API</b>
          <p>
            Tombol kirim membuka WhatsApp Web atau aplikasi WhatsApp dengan
            pesan yang sudah terisi. Pesan dikirim dari akun yang sedang aktif
            di perangkat, jadi pastikan perangkat login menggunakan WhatsApp
            Nexty.
          </p>
          <p>
            Sistem tidak dapat membaca status kirim atau balasan. Setelah
            menekan Send di WhatsApp, kembali ke sistem dan pilih{" "}
            <b>Sudah dikirim</b>.
          </p>
        </div>
      </section>
    </div>
  );
}
'@
Set-Content -LiteralPath (Get-ProjectPath "components/crm-app.tsx") -Value $crmAppContent -Encoding utf8

$businessTestContent = @'
import test from "node:test";
import assert from "node:assert/strict";
import {
  assertTransition,
  generateMessage,
  googleMapsUrl,
  instagramUrl,
  isValidWhatsApp,
  metrics,
  normalizePhone,
  validateLead,
  websiteUrl,
  whatsappDraftUrl,
} from "../lib/business";
import type { Lead, Template } from "../lib/types";

const lead = {
  id: "1",
  ownerId: "u",
  companyName: "Kopi Senja",
  normalizedCompanyName: "kopi senja",
  category: "Kafe",
  contactName: "Budi",
  phone: "081234567890",
  normalizedPhone: "6281234567890",
  email: "",
  instagram: "",
  website: "",
  googleMaps: "",
  potential: "HIGH",
  status: "NEW",
  contactHealth: "READY",
  notes: "",
  followUpAt: null,
  lastContactAt: null,
  lastReplyAt: null,
  attentionReason: null,
  createdAt: "",
  updatedAt: "",
} satisfies Lead;

test("nomor Indonesia dinormalisasi untuk WhatsApp", () => {
  assert.equal(normalizePhone("0812-3456-7890"), "6281234567890");
  assert.equal(isValidWhatsApp("081234567890"), true);
  assert.equal(isValidWhatsApp("123"), false);
});

test("data calon klien dan perpindahan perkembangan divalidasi", () => {
  assert.deepEqual(validateLead({ companyName: "" }), [
    "Nama perusahaan belum diisi.",
  ]);
  assert.doesNotThrow(() => assertTransition("NEW", "READY_TO_CONTACT"));
  assert.throws(() => assertTransition("NEW", "DEAL"));
});

test("pesan siap pakai mengisi data otomatis", () => {
  const template = {
    content: "Halo {{contact_name}} dari {{company_name}} kategori {{category}}",
  } as Template;
  assert.equal(
    generateMessage(template, lead),
    "Halo Budi dari Kopi Senja kategori Kafe",
  );
});

test("tautan WhatsApp berisi nomor dan pesan", () => {
  assert.equal(
    whatsappDraftUrl(lead.phone, "Halo Budi"),
    "https://wa.me/6281234567890?text=Halo%20Budi",
  );
});

test("hasil marketing aman saat data kosong", () => {
  assert.deepEqual(metrics([]), {
    total: 0,
    contacted: 0,
    replied: 0,
    deal: 0,
    responseRate: 0,
    conversionRate: 0,
  });
  assert.equal(metrics([{ ...lead, status: "DEAL" }]).conversionRate, 100);
});

test("tautan profil, lokasi, dan website dinormalisasi", () => {
  assert.equal(
    instagramUrl("sunnylaundry.id"),
    "https://www.instagram.com/sunnylaundry.id/",
  );
  assert.equal(
    googleMapsUrl("Jl. Kalingga Tengah, Surakarta"),
    "https://www.google.com/maps/search/?api=1&query=Jl.%20Kalingga%20Tengah%2C%20Surakarta",
  );
  assert.equal(
    googleMapsUrl("https://maps.google.com/example"),
    "https://maps.google.com/example",
  );
  assert.equal(websiteUrl("nextylabs.com"), "https://nextylabs.com");
  assert.equal(
    websiteUrl("https://nextylabs.com/services"),
    "https://nextylabs.com/services",
  );
});
'@
Set-Content -LiteralPath (Get-ProjectPath "tests/business.test.ts") -Value $businessTestContent -Encoding utf8

$cssPath = Get-ProjectPath "app/globals.css"
$cssCurrent = Get-Content -Raw -LiteralPath $cssPath
if (-not $cssCurrent.Contains("/* Phase 03: daily UX */")) {
    $cssAddition = @'
/* Phase 03: daily UX */
.drawer-actions{display:flex;justify-content:flex-end;margin:16px 0 2px}.drawer-actions .secondary{padding:8px 11px;font-size:12px}.contact-summary{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 18px}.contact-summary span{border:1px solid var(--line);border-radius:9px;background:#fff;padding:10px 12px;display:flex;flex-direction:column;gap:4px;font-size:11px;color:var(--muted);overflow-wrap:anywhere}.contact-summary b{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--ink)}.template-card-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.template-card-head>span{font-size:10px;color:var(--green);font-weight:800;text-transform:uppercase;letter-spacing:.1em}.template-edit{border:1px solid var(--line);border-radius:8px;background:#fff;padding:6px 8px;display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:var(--green)}.template-edit:hover{background:#f6f7f3}.business-links{grid-template-columns:repeat(2,minmax(0,1fr))}
@media(max-width:650px){.contact-summary,.business-links{grid-template-columns:1fr}}
'@
    $cssCurrent = $cssCurrent.TrimEnd() + [Environment]::NewLine + [Environment]::NewLine + $cssAddition + [Environment]::NewLine
    Set-Content -LiteralPath $cssPath -Value $cssCurrent -Encoding utf8
}

Write-Step "Menjalankan post-check"

$postChecks = @(
    @("lib/repository.ts", "export async function updateLead("),
    @("lib/repository.ts", "duplicate.docs.some"),
    @("lib/business.ts", "export function websiteUrl("),
    @("components/workspace/lead-dialog.tsx", "lead?: Lead;"),
    @("components/workspace/lead-dialog.tsx", "Website"),
    @("components/workspace/leads-view.tsx", "Edit data"),
    @("components/workspace/leads-view.tsx", "websiteUrl(lead.website)"),
    @("components/workspace/template-dialog.tsx", "template?: Template;"),
    @("components/workspace/templates-view.tsx", "setEditing(item)"),
    @("components/workspace/followups-view.tsx", 'url.searchParams.get("lead")'),
    @("components/crm-app.tsx", "ownerId={user.uid}"),
    @("tests/business.test.ts", 'websiteUrl("nextylabs.com")')
)

foreach ($check in $postChecks) {
    $relativePath = $check[0]
    $pattern = $check[1]
    $content = Get-Content -Raw -LiteralPath (Get-ProjectPath $relativePath)
    if (-not $content.Contains($pattern)) {
        throw "Post-check gagal pada ${relativePath}: '$pattern' tidak ditemukan. Backup: $backupRoot"
    }
}

$forbiddenTargets = @(
    "components/workspace/template-dialog.tsx",
    "components/workspace/templates-view.tsx",
    "components/workspace/leads-view.tsx"
)
$forbiddenPatterns = @(
    "@/lib/ai-template",
    "/api/ai/generate-template",
    "Gemini",
    "Buat dengan AI",
    "Sparkles"
)

foreach ($relativePath in $forbiddenTargets) {
    $content = Get-Content -Raw -LiteralPath (Get-ProjectPath $relativePath)
    foreach ($pattern in $forbiddenPatterns) {
        if ($content.Contains($pattern)) {
            throw "Post-check gagal: jejak AI '$pattern' muncul kembali di $relativePath. Backup: $backupRoot"
        }
    }
}

$cssAfter = Get-Content -Raw -LiteralPath $cssPath
if (-not $cssAfter.Contains("/* Phase 03: daily UX */")) {
    throw "Post-check gagal: CSS Phase 03 belum terpasang. Backup: $backupRoot"
}

Write-Host ""
Write-Host "Phase 03 selesai: daily UX sudah lebih praktis untuk satu marketing." -ForegroundColor Green
Write-Host "Backup : $backupRoot" -ForegroundColor DarkGray
Write-Host "Check  : npm run lint; npm test; npm run build" -ForegroundColor DarkGray
Write-Host "Next   : Phase 04 - warm orange UI redesign" -ForegroundColor DarkGray

