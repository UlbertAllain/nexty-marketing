import type { LeadTemplates } from "./types";

const replacements: Array<[RegExp, string]> = [
  [/Re-check latest public channels/gi, "Periksa kembali kanal publik terbaru"],
  [/mention one verified observation/gi, "sebutkan satu hal yang sudah terverifikasi"],
  [/never accuse based on reviews/gi, "jangan menyimpulkan hanya dari ulasan"],
  [/no price in first contact/gi, "jangan bahas harga di pesan pertama"],
  [/Already in qualified Targets\. Re-check public facts before outreach\./gi, "Sudah masuk daftar calon klien. Periksa kembali informasi publik terbaru sebelum menghubungi."],
  [/Verified \/ high-confidence/gi, "Terverifikasi / tingkat keyakinan tinggi"],
  [/Website verified — social account not found yet/gi, "Situs web terverifikasi — akun media sosial belum ditemukan"],
  [/Needs social verification/gi, "Perlu verifikasi media sosial"],
  [/Link-in-bio verified — social handle needs verification/gi, "Tautan profil terverifikasi — akun media sosial masih perlu diverifikasi"],
  [/Verified class-volume signal; system gap is hypothesis/gi, "Volume kelas terverifikasi; kebutuhan sistem masih perlu divalidasi"],
  [/Operational-fit hypothesis backed by business model/gi, "Kecocokan operasional masih berupa dugaan berdasarkan model bisnis"],
  [/Deep Target/gi, "Riset lengkap"],
  [/\bDeep\b/gi, "Riset lengkap"],
  [/Low\/Medium/gi, "Rendah/Sedang"],
  [/\bLow\b/gi, "Rendah"],
  [/\bMedium\b/gi, "Sedang"],
  [/\bHigh\b/gi, "Tinggi"],
  [/Qualified Target/gi, "Sudah jadi calon klien"],
  [/\bPromoted\b/gi, "Sudah dipindahkan"],
  [/Manual lead/gi, "Calon klien manual"],
  [/Public phone\/WA/gi, "Nomor telepon/WhatsApp publik"],
  [/customer journey/gi, "alur pelanggan"],
  [/digital presence/gi, "kehadiran digital"],
  [/package balance/gi, "sisa paket"],
  [/purchase history/gi, "riwayat pembelian"],
  [/live queue/gi, "antrean langsung"],
  [/project tracking/gi, "pemantauan proyek"],
  [/job status/gi, "status pekerjaan"],
  [/file approval/gi, "persetujuan berkas"],
  [/double entry/gi, "input ganda"],
  [/hard selling/gi, "jualan agresif"],
  [/first contact/gi, "pesan pertama"],
  [/first-contact/gi, "pesan pertama"],
  [/follow-up/gi, "tindak lanjut"],
  [/follow up/gi, "tindak lanjut"],
  [/\bbooking\b/gi, "pemesanan"],
  [/\bmembership\b/gi, "keanggotaan"],
  [/\bscheduling\b/gi, "penjadwalan"],
  [/\bschedule\b/gi, "jadwal"],
  [/\battendance\b/gi, "kehadiran"],
  [/\bwaitlist\b/gi, "daftar tunggu"],
  [/\bexpiry\b/gi, "masa berlaku"],
  [/\brenewal\b/gi, "perpanjangan"],
  [/\breminder\b/gi, "pengingat"],
  [/\bsession\b/gi, "sesi"],
  [/\bmember\b/gi, "anggota"],
  [/\bwebsite\b/gi, "situs web"],
  [/\breview\b/gi, "ulasan"],
  [/\bflow\b/gi, "alur"],
  [/\bopportunity\b/gi, "peluang"],
  [/\bmeeting\b/gi, "pertemuan"],
  [/\bcall\b/gi, "telepon"],
  [/\bsoftware\b/gi, "perangkat lunak"],
  [/\btools\b/gi, "alat"],
  [/\bdiscovery\b/gi, "penggalian kebutuhan"],
  [/\bprototype\b/gi, "purwarupa"],
  [/\bowned\b/gi, "milik sendiri"],
  [/\bworkflow\b/gi, "alur kerja"],
  [/\btracking\b/gi, "pemantauan"],
  [/\bappointment\b/gi, "janji temu"],
  [/\btrust\b/gi, "kepercayaan"],
  [/credibility issue/gi, "masalah kredibilitas"],
  [/customer complaint/gi, "keluhan pelanggan"],
  [/self-service/gi, "layanan mandiri"],
  [/third-party/gi, "pihak ketiga"],
  [/\bstaff\b/gi, "staf"],
  [/\bpositioning\b/gi, "citra"],
  [/starting range/gi, "kisaran awal"],
  [/\bscope\b/gi, "cakupan"],
  [/\bsource\b/gi, "sumber"],
  [/\bverified\b/gi, "terverifikasi"],
  [/\bverification\b/gi, "verifikasi"],
  [/\btarget\b/gi, "sasaran"],
  [/\boutreach\b/gi, "pendekatan"],
  [/\brisk\b/gi, "risiko"],
  [/\bstatus\b/gi, "status"],
  [/\bbusiness\b/gi, "bisnis"],
  [/\bcustomer\b/gi, "pelanggan"],
  [/\bproject\b/gi, "proyek"],
  [/\bpackage\b/gi, "paket"],
  [/\bsystem\b/gi, "sistem"],
];

export function toIndonesianMarketingCopy(value?: string | null) {
  if (!value) return "";

  return replacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );
}

export function buildIndonesianLeadTemplates(business: string): LeadTemplates {
  return {
    FIRST_OUTREACH: `Halo Kak, saya dari NextyLabs. Saya sempat melihat ${business} dan ada beberapa hal yang menurut saya menarik untuk dirapikan dari sisi digital atau operasional. Kalau berkenan, saya bisa kirim 2–3 catatan singkat dulu lewat pesan ini. Santai saja, belum perlu bahas paket atau harga.`,
    INTERESTED_REPLY: "Siap Kak. Saya kirim ringkasan singkat dulu berisi hal yang kami lihat, peluang perbaikan, dan gambaran solusi. Kalau terasa relevan, baru kita ngobrol sekitar 15–20 menit supaya kami bisa memahami proses yang sekarang.",
    FOLLOW_UP_D2: `Halo Kak, izin menindaklanjuti pesan saya sebelumnya tentang ${business}. Kalau berkenan, saya bisa kirim 2–3 catatan singkat langsung di sini supaya Kakak bisa lihat dulu tanpa harus menjadwalkan pertemuan.`,
    FOLLOW_UP_D5: "Halo Kak, saya izin menindaklanjuti sekali lagi supaya tidak mengganggu. Kalau belum menjadi prioritas sekarang, tidak apa-apa. Kalau nanti ingin membahas situs web atau sistem operasional, kami siap mulai dari pengecekan singkat dulu. Terima kasih, Kak.",
    MEETING_CTA: "Kalau poinnya terasa relevan, boleh kita telepon atau bertemu sekitar 15–20 menit? Saya ingin memahami proses yang sekarang, volume aktivitas, siapa yang mengelola, dan bagian yang paling banyak memakan waktu. Setelah itu baru kami bisa menilai apakah memang perlu sistem baru atau cukup perbaikan proses.",
  };
}

export const DEFAULT_PERSONALIZATION_CHECKLIST =
  "Sebelum kirim, cek lagi situs web dan media sosial terbaru. Sebut satu hal yang benar-benar terlihat, jangan menebak proses internal, dan jangan bahas harga di pesan pertama.";

export const DEFAULT_RESEARCH_GUARDRAIL =
  "Jangan menyimpulkan proses internal hanya dari informasi publik. Gunakan hasil riset sebagai bahan pembuka, lalu validasi saat mereka merespons.";

export function getResearchLevelLabel(value?: string | null) {
  return toIndonesianMarketingCopy(value) || "Belum ditentukan";
}

export function getAuthorityRiskLabel(value?: string | null) {
  return toIndonesianMarketingCopy(value) || "Belum dinilai";
}

export function getVerificationLabel(value?: string | null) {
  return toIndonesianMarketingCopy(value) || "Belum diverifikasi";
}
