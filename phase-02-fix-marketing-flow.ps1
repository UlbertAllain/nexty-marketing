param(
    [string]$ProjectRoot = (Get-Location).Path
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Step([string]$Message) {
    Write-Host "[Phase 02] $Message" -ForegroundColor Cyan
}

function Get-ProjectPath([string]$RelativePath) {
    return Join-Path $ProjectRoot $RelativePath
}

$ProjectRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$repositoryPath = Get-ProjectPath "lib/repository.ts"
$typesPath = Get-ProjectPath "lib/types.ts"
$indexesPath = Get-ProjectPath "firestore.indexes.json"
$packagePath = Get-ProjectPath "package.json"

if (
    -not (Test-Path -LiteralPath $repositoryPath) -or
    -not (Test-Path -LiteralPath $typesPath) -or
    -not (Test-Path -LiteralPath $indexesPath) -or
    -not (Test-Path -LiteralPath $packagePath)
) {
    throw "Jalankan patch dari root project nexty-marketing."
}

$package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
if ($package.name -ne "nexty-labs-marketing-crm") {
    throw "package.json tidak dikenali. Patch dibatalkan."
}

$currentRepository = Get-Content -Raw -LiteralPath $repositoryPath
if ($currentRepository -notmatch 'recordWhatsAppOpened' -or $currentRepository -notmatch 'confirmWhatsAppSent') {
    throw "lib/repository.ts tidak sesuai versi yang diaudit. Patch dibatalkan agar aman."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Get-ProjectPath ".patch-backups/phase-02-$timestamp"
New-Item -ItemType Directory -Force -Path (Join-Path $backupRoot "lib") | Out-Null
Copy-Item -LiteralPath $repositoryPath -Destination (Join-Path $backupRoot "lib/repository.ts") -Force
Copy-Item -LiteralPath $typesPath -Destination (Join-Path $backupRoot "lib/types.ts") -Force
Copy-Item -LiteralPath $indexesPath -Destination (Join-Path $backupRoot "firestore.indexes.json") -Force

Write-Step "Backup repository, types, dan Firestore indexes dibuat"
Write-Step "Memperbaiki lifecycle draft WhatsApp dan follow-up"

$repository = @'
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


Set-Content -LiteralPath $repositoryPath -Value $repository -Encoding utf8

Write-Step "Menambahkan status CANCELLED untuk draft lama"
$typesContent = Get-Content -Raw -LiteralPath $typesPath
$typesContent = $typesContent.Replace(
    'status:"DRAFT"|"SENT"',
    'status:"DRAFT"|"SENT"|"CANCELLED"'
)
Set-Content -LiteralPath $typesPath -Value $typesContent -Encoding utf8

Write-Step "Memastikan index query draft WhatsApp tersedia"
$indexes = Get-Content -Raw -LiteralPath $indexesPath | ConvertFrom-Json
$hasMessageDraftIndex = $false
foreach ($index in $indexes.indexes) {
    if ($index.collectionGroup -ne "messages") { continue }
    $fieldPaths = @($index.fields | ForEach-Object { $_.fieldPath })
    if (
        $fieldPaths.Count -eq 3 -and
        $fieldPaths[0] -eq "ownerId" -and
        $fieldPaths[1] -eq "leadId" -and
        $fieldPaths[2] -eq "status"
    ) {
        $hasMessageDraftIndex = $true
        break
    }
}

if (-not $hasMessageDraftIndex) {
    $newIndex = [pscustomobject]@{
        collectionGroup = "messages"
        queryScope = "COLLECTION"
        fields = @(
            [pscustomobject]@{ fieldPath = "ownerId"; order = "ASCENDING" },
            [pscustomobject]@{ fieldPath = "leadId"; order = "ASCENDING" },
            [pscustomobject]@{ fieldPath = "status"; order = "ASCENDING" }
        )
    }
    $indexes.indexes += $newIndex
    $indexes | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $indexesPath -Encoding utf8
}

Write-Step "Menjalankan post-check"
$updated = Get-Content -Raw -LiteralPath $repositoryPath
$requiredPatterns = @(
    'existingDrafts.docs.slice(1)',
    'isAutomaticFollowUp',
    'earliestDate',
    'remainingDates',
    'status: "CANCELLED"'
)

foreach ($pattern in $requiredPatterns) {
    if (-not $updated.Contains($pattern)) {
        throw "Post-check gagal: perubahan '$pattern' tidak ditemukan. Backup: $backupRoot"
    }
}

if ($updated -match 'active\.docs\.forEach\(item=>batch\.update\(item\.ref,\{status:"CANCELLED"') {
    throw "Post-check gagal: pola lama yang membatalkan semua reminder masih ditemukan. Backup: $backupRoot"
}

$typesUpdated = Get-Content -Raw -LiteralPath $typesPath
if (-not $typesUpdated.Contains('status:"DRAFT"|"SENT"|"CANCELLED"')) {
    throw "Post-check gagal: status CANCELLED belum masuk ke Message type. Backup: $backupRoot"
}

Write-Host ""
Write-Host "Phase 02 selesai: flow WhatsApp dan reminder sudah dirapikan." -ForegroundColor Green
Write-Host "Backup : $backupRoot" -ForegroundColor DarkGray
Write-Host "Next   : npm run lint; npm test; npm run build" -ForegroundColor DarkGray
