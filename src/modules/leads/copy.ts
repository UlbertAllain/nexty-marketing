import type { LeadTemplates } from "./types";

const replacements: Array<[RegExp, string]> = [
  [/\bOffers\b/gi, "Daftar penawaran"],
  [/\bTemplates\b/gi, "Contoh pesan"],
  [/Audit checklist/gi, "Daftar audit"],
  [/\bPricing\b/gi, "Harga"],
  [/Portfolio Proof/gi, "Bukti portofolio"],
  [/\bTimeline\b/gi, "Jadwal"],
  [/Payment terms/gi, "Ketentuan pembayaran"],
  [/Lost Analysis/gi, "Analisis calon klien yang tidak lanjut"],
  [/\bNone\b/gi, "Tidak ada"],
  [/\bNow\b/gi, "Sekarang"],
  [/\bWait\b/gi, "Tunggu"],
  [/\bArchive\b/gi, "Arsipkan"],
  [/\bClosed\b/gi, "Selesai"],
  [/\bNegotiation\b/gi, "Negosiasi"],
  [/\bDecision\b/gi, "Keputusan"],
  [/\bResponded\b/gi, "Sudah membalas"],
  [/\bContacted\b/gi, "Sudah dihubungi"],
  [/\bQualified\b/gi, "Siap dihubungi"],
  [/\bWon\b/gi, "Berhasil"],
  [/\bLost\b/gi, "Tidak lanjut"],
  [/Observation-first/gi, "Mulai dari pengamatan"],
  [/Asks price/gi, "Menanyakan harga"],
  [/Already has website/gi, "Sudah punya situs web"],
  [/Already has system/gi, "Sudah punya sistem"],
  [/\bInterested\b/gi, "Tertarik"],
  [/Meeting CTA/gi, "Ajak bertemu"],
  [/Proposal follow-up/gi, "Tindak lanjut proposal"],
  [/Price objection/gi, "Keberatan harga"],
  [/No budget/gi, "Belum ada anggaran"],
  [/Referral ask/gi, "Minta referensi"],
  [/Partner outreach/gi, "Hubungi mitra"],
  [/Warm network/gi, "Relasi dekat"],
  [/First outreach/gi, "Pesan pertama"],
  [/Permission earned/gi, "Sudah mendapat izin"],
  [/Same day/gi, "Hari yang sama"],
  [/Audit sent/gi, "Audit sudah dikirim"],
  [/Needs commercial anchor/gi, "Perlu gambaran biaya"],
  [/Wrong initial solution/gi, "Solusi awal kurang sesuai"],
  [/Potential integration gap/gi, "Ada kemungkinan kebutuhan integrasi"],
  [/No reply/gi, "Belum ada balasan"],
  [/Low signal/gi, "Minat masih rendah"],
  [/Agrees problem/gi, "Masalah dirasa relevan"],
  [/Pain validated/gi, "Masalah sudah tervalidasi"],
  [/Meeting booked/gi, "Pertemuan sudah dijadwalkan"],
  [/Disagrees/gi, "Tidak sependapat"],
  [/Bad hypothesis/gi, "Dugaan awal kurang tepat"],
  [/Qualified need/gi, "Kebutuhan sudah cukup jelas"],
  [/No urgency/gi, "Belum mendesak"],
  [/Valid but later/gi, "Relevan, tetapi belum sekarang"],
  [/Until date/gi, "Sampai tanggal yang disepakati"],
  [/Value\/scope mismatch/gi, "Nilai dan cakupan belum sesuai"],
  [/Trust objection/gi, "Keraguan soal kepercayaan"],
  [/Proof gap/gi, "Butuh bukti tambahan"],
  [/Timing objection/gi, "Keberatan soal waktu"],
  [/Schedule mismatch/gi, "Jadwal belum sesuai"],
  [/Commercial accepted/gi, "Penawaran diterima"],
  [/No deal/gi, "Tidak jadi kerja sama"],
  [/Current flow/gi, "Alur saat ini"],
  [/\bVolume\b/gi, "Jumlah aktivitas"],
  [/\bTools\b/gi, "Alat yang digunakan"],
  [/\bPeople\b/gi, "Orang yang terlibat"],
  [/\bPain\b/gi, "Masalah utama"],
  [/\bException\b/gi, "Kasus khusus"],
  [/Customer friction/gi, "Hambatan pelanggan"],
  [/Existing system/gi, "Sistem yang sudah ada"],
  [/\bPriority\b/gi, "Prioritas"],
  [/\bImpact\b/gi, "Dampak"],
  [/\bBudget\b/gi, "Anggaran"],
  [/\bAuthority\b/gi, "Pengambil keputusan"],
  [/\bTiming\b/gi, "Waktu"],
  [/Data\/security/gi, "Data dan keamanan"],
  [/End-to-end/gi, "Memahami proses dari awal sampai akhir"],
  [/ROI & scale/gi, "Menilai manfaat dan skala"],
  [/Integration risk/gi, "Risiko integrasi"],
  [/Role & adoption/gi, "Peran pengguna dan penerapan"],
  [/Problem severity/gi, "Tingkat dampak masalah"],
  [/Edge cases/gi, "Kasus yang tidak biasa"],
  [/UX opportunity/gi, "Peluang memperbaiki pengalaman pengguna"],
  [/Avoid rebuild/gi, "Hindari membangun ulang yang tidak perlu"],
  [/MVP focus/gi, "Fokus tahap awal"],
  [/Value framing/gi, "Menilai manfaat bisnis"],
  [/Qualification/gi, "Menilai kecocokan kebutuhan"],
  [/Decision mapping/gi, "Memahami proses keputusan"],
  [/Urgency/gi, "Tingkat urgensi"],
  [/Security scope/gi, "Cakupan keamanan"],
  [/Booking & Membership System/gi, "Sistem Pemesanan & Keanggotaan"],
  [/Membership & Renewal System/gi, "Sistem Keanggotaan & Perpanjangan"],
  [/Website Rescue \+ Appointment Funnel/gi, "Perbaikan Situs Web + Alur Janji Temu"],
  [/Website Trust Cleanup \+ Booking Ops/gi, "Perbaikan Kepercayaan Situs Web + Operasional Pemesanan"],
  [/Rental Booking Starter/gi, "Sistem Dasar Pemesanan Rental"],
  [/Barber Booking \+ Live Queue/gi, "Pemesanan Barbershop + Antrean Langsung"],
  [/Architecture Portfolio \+ Lead Qualification/gi, "Portofolio Arsitektur + Penyaringan Calon Klien"],
  [/Motor Rental Booking & Fleet System/gi, "Sistem Pemesanan & Armada Rental Motor"],
  [/Driving School Scheduling & Student CRM/gi, "Sistem Jadwal & CRM Siswa Kursus Mengemudi"],
  [/Print Order & Production Tracker/gi, "Sistem Pesanan & Pemantauan Produksi Percetakan"],
  [/Catering Quote & Event Order System/gi, "Sistem Penawaran & Pesanan Acara Katering"],
  [/Clinic Appointment Workflow Discovery/gi, "Penggalian Alur Janji Temu Klinik"],
  [/Laundry Ops Integration Discovery/gi, "Penggalian Integrasi Operasional Laundry"],
  [/Enrollment \/ Scheduling System Discovery/gi, "Penggalian Sistem Pendaftaran & Penjadwalan"],
  [/Lead → Survey → RAB → Project CRM/gi, "Calon Klien → Survei → RAB → CRM Proyek"],
  [/Promote to Targets \/ verify latest public channels before outreach\./gi, "Periksa kanal publik terbaru, lalu jadikan calon klien jika datanya sudah cukup."],
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
  [/verified before outreach/gi, "diverifikasi sebelum menghubungi"],
  [/D\+2/gi, "H+2"],
  [/D\+5/gi, "H+5"],
  [/\bbefore\b/gi, "sebelum"],
  [/\bafter\b/gi, "setelah"],
  [/\blatest\b/gi, "terbaru"],
  [/\bpublic\b/gi, "publik"],
  [/\bphone\b/gi, "telepon"],
  [/\bCalendar\b/gi, "Kalender"],
  [/\bapp\b/gi, "aplikasi"],
  [/Monthly upfront/gi, "Bulanan di muka"],
  [/Milestone-based/gi, "Berdasarkan tahapan"],
  [/Custom quotation/gi, "Penawaran khusus"],
  [/Starts ~/gi, "Mulai sekitar "],
  [/\bor\b/gi, "atau"],
  [/Solution\/Tech/gi, "Solusi/Teknis"],
  [/\bSales\/Tech\b/gi, "Penjualan/Teknis"],
  [/\bSales\b/gi, "Penjualan"],
  [/\bTech\b/gi, "Teknis"],
  [/\bFounder\b/gi, "Pendiri"],
  [/\bPM\b/g, "Manajer Proyek"],
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
  [/\bArchitecture\b/gi, "Arsitektur"],
  [/\bConstruction\b/gi, "Konstruksi"],
  [/\bFitness\b/gi, "Kebugaran"],
  [/\bRental\b/gi, "Penyewaan"],
  [/\bTransport\b/gi, "Transportasi"],
  [/\bDental Clinic\b/gi, "Klinik Gigi"],
  [/\bBeauty\b/gi, "Kecantikan"],
  [/\bEducation\b/gi, "Pendidikan"],
  [/\bDriving School\b/gi, "Kursus Mengemudi"],
  [/\bPrinting\b/gi, "Percetakan"],
  [/\bService\b/gi, "Layanan"],
  [/\bTraining\b/gi, "Pelatihan"],
  [/\bFurniture\b/gi, "Furnitur"],
  [/\bCatering\b/gi, "Katering"],
  [/\bEvent\b/gi, "Acara"],
  [/\bClinic\b/gi, "Klinik"],
  [/\bproject\b/gi, "proyek"],
  [/\bpackage\b/gi, "paket"],
  [/\bsystem\b/gi, "sistem"],
];

const researchExactTranslations: Record<string, string> = {
  "Strong local rating/review count for an architecture/interior/contractor business.": "Rating lokal dan jumlah ulasan cukup kuat untuk bisnis arsitektur, interior, atau kontraktor.",
  "High-ticket project category benefits from project case studies, inquiry qualification and project pipeline; owned site did not surface in the reviewed search.": "Kategori proyek bernilai tinggi akan terbantu dengan studi kasus proyek, penyaringan calon klien, dan alur proyek yang lebih jelas. Situs web milik sendiri belum terlihat pada pencarian yang ditinjau.",
  "No verified customer complaint.": "Belum ditemukan keluhan pelanggan yang terverifikasi.",
  "Deep public research completed; internal workflow/stack still requires discovery.": "Riset publik sudah dilakukan cukup mendalam; alur kerja dan sistem internal masih perlu divalidasi langsung.",
  "Architecture Portfolio + Lead Qualification": "Portofolio Arsitektur + Penyaringan Calon Klien",
  "Project case studies, service/area pages, project budget/type qualifier, consultation flow, optional project CRM discovery.": "Studi kasus proyek, halaman layanan dan area, penyaring anggaran serta jenis proyek, alur konsultasi, dan opsi CRM proyek.",
  "Sell project storytelling and qualified inquiry, then discover internal project tracking.": "Mulai dari cara mereka menampilkan cerita proyek dan menyaring pertanyaan calon klien, lalu gali bagaimana proyek dipantau secara internal.",
  "Public phone/WhatsApp/website/Instagram as verified before outreach": "Nomor telepon, WhatsApp, situs web, atau Instagram publik yang sudah diverifikasi sebelum menghubungi.",
  "Re-check current website/IG → identify decision-maker → send personalized first contact": "Periksa ulang situs web dan Instagram terbaru → identifikasi pengambil keputusan → kirim pesan pertama yang dipersonalisasi.",
  "Do not present operational hypotheses as facts. Acknowledge strong existing systems where evidence shows them.": "Jangan menyampaikan dugaan operasional sebagai fakta. Akui sistem yang sudah berjalan dengan baik jika bukti menunjukkan hal tersebut.",
  "Verified class-volume signal; system gap is hypothesis": "Volume kelas terverifikasi; kebutuhan sistem masih berupa hipotesis yang perlu divalidasi.",
  "Operational-fit hypothesis backed by business model": "Kecocokan operasional masih berupa hipotesis berdasarkan model bisnis.",
  "Website weakness directly verified": "Kelemahan situs web terverifikasi langsung.",
  "Verified demand; digital gap inferred from public search": "Potensi kebutuhan terverifikasi; celah digital disimpulkan dari pencarian publik.",
  "Mixed evidence; validate existing booking stack": "Bukti masih beragam; sistem pemesanan yang sudah ada perlu divalidasi.",
  "Business-model fit; system gap hypothesis": "Model bisnis terlihat cocok; kebutuhan sistem masih berupa hipotesis.",
  "Verified booking-channel structure": "Struktur kanal pemesanan sudah terverifikasi.",
  "Verified channel/location structure": "Struktur kanal dan lokasi sudah terverifikasi.",
  "Verified public review; avoid overgeneralizing": "Ulasan publik sudah terverifikasi; hindari membuat generalisasi berlebihan.",
  "Verified business presence; operational gap hypothesis": "Keberadaan bisnis terverifikasi; celah operasional masih berupa hipotesis.",
  "Verified service structure; gap hypothesis": "Struktur layanan terverifikasi; celah kebutuhan masih berupa hipotesis.",
};

export type LeadResearchField =
  | "primaryDigitalAsset"
  | "hasNow"
  | "verifiedGap"
  | "publicFriction"
  | "evidenceStatus"
  | "recommendedOffer"
  | "solutionConcept"
  | "firstContactAngle"
  | "contactRoute"
  | "guardrail"
  | "nextAction";

const researchFieldFallbacks: Record<LeadResearchField, string> = {
  primaryDigitalAsset: "Aset digital publik sudah terdeteksi. Periksa kembali detail terbaru sebelum menghubungi.",
  hasNow: "Bisnis sudah memiliki aset atau proses yang berjalan; detailnya perlu dikonfirmasi saat percakapan.",
  verifiedGap: "Ada peluang perbaikan dari informasi publik, tetapi kebutuhan internal tetap perlu divalidasi.",
  publicFriction: "Belum ditemukan masalah publik yang cukup kuat untuk dijadikan dasar pendekatan.",
  evidenceStatus: "Riset publik sudah dilakukan; kondisi internal masih perlu divalidasi langsung.",
  recommendedOffer: "Penawaran akan disesuaikan setelah kebutuhan calon klien divalidasi.",
  solutionConcept: "Konsep solusi awal akan disesuaikan setelah kebutuhan dan proses internal dipahami.",
  firstContactAngle: "Mulai dari observasi publik yang relevan, lalu ajukan pertanyaan terbuka tentang proses yang berjalan.",
  contactRoute: "Gunakan kanal kontak publik yang sudah diverifikasi sebelum menghubungi.",
  guardrail: "Jangan menyimpulkan proses internal hanya dari informasi publik. Validasi langsung saat calon klien merespons.",
  nextAction: "Periksa informasi terbaru lalu tentukan langkah berikutnya sesuai kondisi calon klien.",
};

const researchPhraseReplacements: Array<[RegExp, string]> = [
  [/strong local rating/gi, "rating lokal yang kuat"],
  [/review count/gi, "jumlah ulasan"],
  [/high-ticket project/gi, "proyek bernilai tinggi"],
  [/project case studies/gi, "studi kasus proyek"],
  [/case studies/gi, "studi kasus"],
  [/inquiry qualification/gi, "penyaringan calon klien"],
  [/qualified inquiry/gi, "pertanyaan calon klien yang sudah tersaring"],
  [/project pipeline/gi, "alur proyek"],
  [/project tracking/gi, "pemantauan proyek"],
  [/owned site/gi, "situs web milik sendiri"],
  [/owned website/gi, "situs web milik sendiri"],
  [/reviewed search/gi, "pencarian yang ditinjau"],
  [/public research completed/gi, "riset publik sudah selesai"],
  [/deep public research completed/gi, "riset publik sudah dilakukan cukup mendalam"],
  [/internal workflow/gi, "alur kerja internal"],
  [/internal project/gi, "proyek internal"],
  [/internal process/gi, "proses internal"],
  [/still requires discovery/gi, "masih perlu divalidasi langsung"],
  [/requires discovery/gi, "perlu divalidasi langsung"],
  [/service\/area pages/gi, "halaman layanan dan area"],
  [/project budget\/type qualifier/gi, "penyaring anggaran dan jenis proyek"],
  [/consultation flow/gi, "alur konsultasi"],
  [/optional project CRM discovery/gi, "opsi CRM proyek"],
  [/project storytelling/gi, "cara menampilkan cerita proyek"],
  [/decision-maker/gi, "pengambil keputusan"],
  [/personalized first contact/gi, "pesan pertama yang dipersonalisasi"],
  [/operational hypotheses/gi, "dugaan operasional"],
  [/as facts/gi, "sebagai fakta"],
  [/strong existing systems/gi, "sistem yang sudah berjalan dengan baik"],
  [/where evidence shows them/gi, "jika bukti menunjukkan hal tersebut"],
  [/customer complaint/gi, "keluhan pelanggan"],
  [/customer complaints/gi, "keluhan pelanggan"],
  [/no verified/gi, "belum ditemukan yang terverifikasi"],
  [/system gap is hypothesis/gi, "kebutuhan sistem masih berupa hipotesis"],
  [/gap hypothesis/gi, "celah kebutuhan masih berupa hipotesis"],
  [/business model/gi, "model bisnis"],
  [/booking channel/gi, "kanal pemesanan"],
  [/booking stack/gi, "sistem pemesanan"],
  [/public search/gi, "pencarian publik"],
  [/public review/gi, "ulasan publik"],
  [/digital gap/gi, "celah digital"],
  [/operational gap/gi, "celah operasional"],
  [/service structure/gi, "struktur layanan"],
  [/business presence/gi, "keberadaan bisnis"],
  [/channel structure/gi, "struktur kanal"],
  [/location structure/gi, "struktur lokasi"],
  [/public presence/gi, "kehadiran publik"],
  [/re-check/gi, "periksa ulang"],
  [/current website/gi, "situs web terbaru"],
  [/current/gi, "saat ini"],
  [/identify/gi, "identifikasi"],
  [/send/gi, "kirim"],
  [/first contact/gi, "pesan pertama"],
  [/before outreach/gi, "sebelum menghubungi"],
  [/outreach/gi, "pendekatan"],
  [/public phone/gi, "nomor telepon publik"],
  [/website/gi, "situs web"],
  [/workflow/gi, "alur kerja"],
  [/research/gi, "riset"],
  [/evidence/gi, "bukti"],
  [/verified/gi, "terverifikasi"],
  [/hypothesis/gi, "hipotesis"],
  [/inquiry/gi, "pertanyaan calon klien"],
  [/project/gi, "proyek"],
  [/tracking/gi, "pemantauan"],
  [/review/gi, "ulasan"],
  [/strong/gi, "kuat"],
  [/local/gi, "lokal"],
  [/business/gi, "bisnis"],
  [/internal/gi, "internal"],
  [/public/gi, "publik"],
  [/system/gi, "sistem"],
];

const remainingEnglishResearchMarkers =
  /\b(an|the|for|with|from|where|shows|show|still|requires|required|completed|benefits|surface|surfaced|reviewed|sell|then|discover|present|acknowledge|existing|stack|facts|count|rating|complaint|inferred|mixed|fit|backed|signal|channel|service|demand|digital|operational|booking|member|membership|renewal|attendance|waitlist|availability|quote|pickup|delivery|order|payment|vendor|client|portfolio|corporate|branch|production|manual|online|official|listing|aftercare|warranty)\b/i;

export function toIndonesianResearchField(
  field: LeadResearchField,
  value?: string | null,
) {
  if (!value) return researchFieldFallbacks[field];

  const exact = researchExactTranslations[value.trim()];
  if (exact) return exact;

  const phraseLocalized = researchPhraseReplacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );

  const localized = toIndonesianMarketingCopy(phraseLocalized)
    .replace(/\s+/g, " ")
    .trim();

  return remainingEnglishResearchMarkers.test(localized)
    ? researchFieldFallbacks[field]
    : localized || researchFieldFallbacks[field];
}

export function toIndonesianMarketingCopy(value?: string | null) {
  if (!value) return "";

  return replacements.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    value,
  );
}

export function buildIndonesianLeadTemplates(
  business: string,
  publicObservation?: string | null,
): LeadTemplates {
  const observation = publicObservation ? toIndonesianResearchField("primaryDigitalAsset", publicObservation).replace(/[.]+$/, "") : "";
  const observationSentence = observation
    ? ` Dari informasi publik yang saya lihat, ${observation}.`
    : "";

  return {
    FIRST_OUTREACH: `Halo Kak, saya dari NextyLabs. Saya sempat melihat ${business}.${observationSentence} Ada beberapa hal yang menurut saya menarik untuk dirapikan dari sisi digital atau operasional. Kalau berkenan, saya bisa kirim 2–3 catatan singkat dulu lewat pesan ini. Santai saja, belum perlu bahas paket atau harga.`,
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


const englishSentenceMarkers =
  /\b(validate|checked|overlap|focus|approval|acknowledge|proceed|outside|existing|tracking|audit|generic|mature|integration|gaps|current|appears|remains|coordinated|discover|inquiry|quotation|after-sales|storytelling|qualified|workflow|availability|delivery|pickup)\b/i;

export function toNaturalIndonesianResearchText(
  value?: string | null,
  fallback = "Perlu ditinjau lebih lanjut dan divalidasi sebelum menghubungi calon klien.",
) {
  const localized = toIndonesianMarketingCopy(value);
  if (!localized) return fallback;
  return englishSentenceMarkers.test(localized) ? fallback : localized;
}
