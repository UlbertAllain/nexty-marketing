import test from "node:test";
import assert from "node:assert/strict";
import {
  assertTransition,
  generateMessage,
  googleMapsUrl,
  instagramUrl,
  isDueAt,
  isValidWhatsApp,
  LEAD_FIELD_LIMITS,
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

test("field calon klien memiliki batas panjang", () => {
  const errors = validateLead({
    companyName: "A".repeat(LEAD_FIELD_LIMITS.companyName + 1),
    notes: "N".repeat(LEAD_FIELD_LIMITS.notes + 1),
  });
  assert.equal(errors.includes("Nama perusahaan maksimal 120 karakter."), true);
  assert.equal(errors.includes("Catatan maksimal 2000 karakter."), true);
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

test("jatuh tempo memakai timestamp aktual, bukan tanggal UTC", () => {
  const now = new Date("2026-08-29T02:00:00.000Z");
  assert.equal(isDueAt("2026-08-29T01:59:59.000Z", now), true);
  assert.equal(isDueAt("2026-08-29T02:00:01.000Z", now), false);
  assert.equal(isDueAt("bukan-tanggal", now), false);
});
