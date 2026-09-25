import type { Lead } from "@/modules/leads/types";
import type { ResearchEvidence } from "./types";
import {
  GAP_TAGS,
  NEXTYLABS_SERVICE_CATALOG,
} from "./offer-matcher";

const SYSTEM_INSTRUCTIONS = `
You are the reasoning engine inside NextyLeads, an internal marketing system for NextyLabs.

You receive prospect data plus public-web evidence already retrieved by the application. Analyze only that evidence. Do not browse, invent sources, or claim access to private information.

Rules:
1. Treat the supplied evidence as the only factual research context.
2. Never invent facts, URLs, products, employees, budgets, internal tools, operational problems, or decision makers.
3. Distinguish direct observation from interpretation.
4. If a feature or system is not evidenced, say "tidak ditemukan pada sumber publik yang diperiksa"; never claim it definitively does not exist.
5. Every asset, finding, and gap must reference at least one evidence ID from PUBLIC EVIDENCE.
6. Never reference an evidence ID that is not supplied.
7. Describe observable friction respectfully and avoid overstating business problems.
8. Recommendations must be relevant to the supplied NextyLabs service catalog.
9. Outreach must be concise, natural Indonesian, observation-first, non-deceptive, and not sound like generic AI sales copy.
10. Do not calculate the final opportunity score. The application calculates service fit, evidence quality, and final weighted score.
11. If evidence is weak, return fewer findings and lower research-signal scores rather than guessing.
`.trim();

function compactLead(lead: Lead) {
  return {
    id: lead.id,
    business: lead.business,
    niche: lead.niche,
    area: lead.area,
    phoneAvailable: Boolean(lead.phone),
    website: lead.website || lead.social?.websiteUrl || "",
    instagram: lead.instagram || lead.social?.instagramUrl || "",
    primarySocial: lead.primarySocial || "",
    currentDigitalAsset: lead.primaryDigitalAsset || "",
    existingResearch: {
      hasNow: lead.hasNow || "",
      verifiedGap: lead.verifiedGap || "",
      publicFriction: lead.publicFriction || "",
      recommendedOffer: lead.recommendedOffer || "",
    },
  };
}

export function buildProspectSearchQuery(lead: Lead): string {
  const knownWebsite = lead.website || lead.social?.websiteUrl || "";
  const knownInstagram = lead.instagram || lead.social?.instagramUrl || "";

  return [
    `"${lead.business}"`,
    lead.area,
    lead.niche,
    knownWebsite,
    knownInstagram,
    "website instagram layanan produk kontak bisnis",
  ]
    .filter(Boolean)
    .join(" ")
    .slice(0, 390);
}

export function buildResearchPrompt(
  lead: Lead,
  evidence: ResearchEvidence[],
): {
  instructions: string;
  input: string;
} {
  const services = NEXTYLABS_SERVICE_CATALOG.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    gapTags: service.gapTags,
  }));

  const evidenceContext = evidence.map((source) => ({
    id: source.id,
    type: source.type,
    title: source.title,
    url: source.url,
    excerpt: source.excerpt || "",
    confidence: source.confidence,
  }));

  return {
    instructions: SYSTEM_INSTRUCTIONS,
    input: `
Analyze this prospect deeply enough to support a real sales decision.

Current date: ${new Date().toISOString().slice(0, 10)}

PROSPECT
${JSON.stringify(compactLead(lead), null, 2)}

PUBLIC EVIDENCE
${JSON.stringify(evidenceContext, null, 2)}

NEXTYLABS SERVICE CATALOG
${JSON.stringify(services, null, 2)}

ALLOWED GAP TAGS
${GAP_TAGS.join(", ")}

Research objectives:
- Identify what is visibly already in place.
- Identify evidence-backed gaps or friction that NextyLabs could realistically help with.
- Avoid recommending replacement when the current solution appears adequate.
- Produce 0-12 meaningful gaps; fewer strong gaps are better than many weak ones.
- Reference PUBLIC EVIDENCE IDs on every asset, finding, and gap.
- Score only these research signals from 0-100:
  digitalGap: severity of observable digital/process gap.
  businessNeed: likely business relevance of fixing the observed gap.
  ticketPotential: apparent project scope/value based only on public business context.
  contactability: how clear and accessible legitimate business contact routes are.
- Do not score serviceFit or evidenceQuality; the application calculates them.
- Draft one natural Indonesian first-contact message based on the strongest supported observation.
`.trim(),
  };
}
