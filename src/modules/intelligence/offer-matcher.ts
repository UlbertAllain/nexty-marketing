import type { BusinessGap, RecommendedOffer } from "./types";

export const GAP_TAGS = [
  "no-website",
  "outdated-website",
  "credibility",
  "weak-digital-presence",
  "weak-cta",
  "campaign",
  "lead-capture",
  "conversion",
  "manual-catalog",
  "product-discovery",
  "catalog",
  "whatsapp-selling",
  "manual-quotation",
  "manual-inquiry",
  "sales-process",
  "manual-booking",
  "booking",
  "scheduling",
  "manual-sales",
  "inventory",
  "retail-operations",
  "pos",
  "manual-follow-up",
  "lead-management",
  "crm",
  "fragmented-operations",
  "manual-operations",
  "erp",
  "multi-department",
  "custom-workflow",
  "manual-process",
  "automation",
  "internal-system",
] as const;

export type GapTag = typeof GAP_TAGS[number];

export interface NextyLabsService {
  id: string;
  name: string;
  description: string;
  gapTags: GapTag[];
}

export const NEXTYLABS_SERVICE_CATALOG: NextyLabsService[] = [
  {
    id: "company-profile-website",
    name: "Company Profile Website",
    description:
      "Website profesional untuk memperkuat kredibilitas dan menjelaskan layanan bisnis.",
    gapTags: ["no-website", "outdated-website", "credibility", "weak-digital-presence"],
  },
  {
    id: "landing-page",
    name: "Landing Page",
    description:
      "Halaman konversi terfokus untuk campaign, produk, atau layanan tertentu.",
    gapTags: ["weak-cta", "campaign", "lead-capture", "conversion"],
  },
  {
    id: "digital-catalog",
    name: "Digital Catalog",
    description:
      "Katalog produk atau layanan yang terstruktur dan mudah dibagikan.",
    gapTags: ["manual-catalog", "product-discovery", "catalog", "whatsapp-selling"],
  },
  {
    id: "quotation-system",
    name: "Quotation / Inquiry System",
    description:
      "Alur inquiry dan permintaan penawaran yang lebih terstruktur.",
    gapTags: ["manual-quotation", "manual-inquiry", "lead-capture", "sales-process"],
  },
  {
    id: "booking-system",
    name: "Booking System",
    description:
      "Sistem pemesanan jadwal atau layanan secara online.",
    gapTags: ["manual-booking", "booking", "scheduling"],
  },
  {
    id: "pos-system",
    name: "POS System",
    description:
      "Sistem transaksi, produk, stok, dan laporan penjualan untuk operasional retail.",
    gapTags: ["manual-sales", "inventory", "retail-operations", "pos"],
  },
  {
    id: "crm-system",
    name: "CRM / Lead Management",
    description:
      "Sistem untuk mengelola calon pelanggan, aktivitas sales, dan tindak lanjut.",
    gapTags: ["manual-follow-up", "lead-management", "crm", "sales-process"],
  },
  {
    id: "erp-system",
    name: "ERP / Business Management",
    description:
      "Sistem terintegrasi untuk proses bisnis yang memiliki banyak fungsi operasional.",
    gapTags: ["fragmented-operations", "manual-operations", "erp", "multi-department"],
  },
  {
    id: "custom-web-app",
    name: "Custom Web Application",
    description:
      "Aplikasi web khusus untuk proses bisnis yang tidak cocok dengan solusi generik.",
    gapTags: ["custom-workflow", "manual-process", "automation", "internal-system"],
  },
];

function normalizeTags(tags: string[]): Set<string> {
  return new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean));
}

export function matchOffersToGaps(
  gaps: BusinessGap[],
  limit = 3,
): RecommendedOffer[] {
  const gapTags = new Map(
    gaps.map((gap) => [gap.id, normalizeTags([...gap.tags, gap.category])]),
  );

  return NEXTYLABS_SERVICE_CATALOG
    .map((service) => {
      const serviceTags = normalizeTags(service.gapTags);
      const matchedGapIds = gaps
        .filter((gap) => {
          const tags = gapTags.get(gap.id) ?? new Set<string>();
          return [...serviceTags].some((tag) => tags.has(tag));
        })
        .map((gap) => gap.id);

      const matchedTagCount = gaps.reduce((count, gap) => {
        const tags = gapTags.get(gap.id) ?? new Set<string>();
        return count + [...serviceTags].filter((tag) => tags.has(tag)).length;
      }, 0);

      const fitScore = Math.min(
        100,
        matchedGapIds.length * 25 + matchedTagCount * 10,
      );

      return {
        serviceId: service.id,
        serviceName: service.name,
        reason:
          matchedGapIds.length > 0
            ? `Cocok dengan ${matchedGapIds.length} gap yang terdeteksi.`
            : "Belum ada gap yang cukup kuat untuk layanan ini.",
        matchedGapIds,
        fitScore,
      } satisfies RecommendedOffer;
    })
    .filter((offer) => offer.matchedGapIds.length > 0)
    .sort((a, b) => b.fitScore - a.fitScore)
    .slice(0, Math.max(0, limit));
}
