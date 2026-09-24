import type { Lead } from "@/modules/leads/types";
import {
  GAP_TAGS,
  NEXTYLABS_SERVICE_CATALOG,
} from "./offer-matcher";

const SYSTEM_INSTRUCTIONS = `
You are the research engine inside NextyLeads, an internal marketing system for NextyLabs.

Your job is to research a prospect using public web sources and return factual, evidence-backed business intelligence.

Rules:
1. Search the public web before making claims.
2. Prefer official websites, official social profiles, Google/public business listings, reputable directories, and reputable news sources.
3. Never invent facts, URLs, products, employees, budgets, internal tools, operational problems, or decision makers.
4. Distinguish observation from interpretation.
5. If a feature or system cannot be found publicly, say "tidak ditemukan pada sumber publik yang diperiksa"; never claim it definitively does not exist.
6. Every asset, finding, and gap must reference at least one source ID returned in sources.
7. Only use source URLs you actually inspected during this research.
8. Do not criticize the prospect disrespectfully. Describe observable friction and possible opportunity.
9. Recommendations must be relevant to the supplied NextyLabs service catalog.
10. Outreach must be concise, natural Indonesian, observation-first, non-deceptive, and not sound like generic AI sales copy.
11. Do not claim NextyLabs has audited private systems or has information it cannot publicly know.
12. Do not calculate the final opportunity score. The application calculates service fit, evidence quality, and final weighted score.
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
      source1: lead.source1 || "",
      source2: lead.source2 || "",
    },
  };
}

export function buildResearchPrompt(lead: Lead): {
  instructions: string;
  input: string;
} {
  const services = NEXTYLABS_SERVICE_CATALOG.map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    gapTags: service.gapTags,
  }));

  return {
    instructions: SYSTEM_INSTRUCTIONS,
    input: `
Research this prospect deeply enough to support a real sales decision.

Current date: ${new Date().toISOString().slice(0, 10)}

PROSPECT
${JSON.stringify(compactLead(lead), null, 2)}

NEXTYLABS SERVICE CATALOG
${JSON.stringify(services, null, 2)}

ALLOWED GAP TAGS
${GAP_TAGS.join(", ")}

Research objectives:
- Verify the prospect's public digital presence and relevant business information.
- Identify what is visibly already in place.
- Identify evidence-backed gaps or friction that NextyLabs could realistically help with.
- Avoid recommending a replacement when the existing solution already appears adequate.
- Produce 0-12 meaningful gaps; fewer strong gaps are better than many weak ones.
- Score only these research signals from 0-100:
  digitalGap: severity of observable digital/process gap.
  businessNeed: likely business relevance of fixing the observed gap.
  ticketPotential: apparent project scope/value based only on public business context.
  contactability: how clear and accessible legitimate business contact routes are.
- Do not score serviceFit or evidenceQuality; the application calculates them.
- Draft one natural first-contact message based on the strongest verified observation.
`.trim(),
  };
}
