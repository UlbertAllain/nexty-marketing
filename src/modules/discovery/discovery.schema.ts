import { z } from "zod";
import {
  DISCOVERY_AREAS,
  DISCOVERY_CATEGORIES,
} from "./discovery.constants";
import { GAP_TAGS } from "@/modules/intelligence/offer-matcher";

export const discoveryRequestSchema = z.object({
  area: z.enum(DISCOVERY_AREAS),
  category: z.enum(DISCOVERY_CATEGORIES),
  maxCandidates: z.number().int().min(5).max(15),
}).strict();

const discoveryCandidateSchema = z.object({
  business: z.string().trim().min(2).max(180),
  region: z.string().trim().min(1).max(120),
  niche: z.string().trim().min(1).max(120),
  address: z.string().trim().max(400),
  phone: z.string().trim().max(80),
  website: z.string().trim().max(1000),
  instagram: z.string().trim().max(1000),
  offerSummary: z.string().trim().min(1).max(800),
  publicAssets: z.string().trim().min(1).max(800),
  potentialGap: z.string().trim().min(1).max(800),
  publicFriction: z.string().trim().min(1).max(800),
  whyPotential: z.string().trim().min(1).max(800),
  gapTags: z.array(z.enum(GAP_TAGS)).max(8),
  rating: z.number().min(0).max(5),
  reviews: z.number().int().min(0),
  evidenceIds: z.array(z.string().trim().min(1).max(64)).min(1).max(8),
  signals: z.object({
    businessRelevance: z.number().int().min(0).max(100),
    digitalOpportunity: z.number().int().min(0).max(100),
    contactability: z.number().int().min(0).max(100),
    evidenceStrength: z.number().int().min(0).max(100),
  }).strict(),
}).strict();

export const discoveryAiResultSchema = z.object({
  candidates: z.array(discoveryCandidateSchema).max(15),
}).strict();

export const DISCOVERY_JSON_SCHEMA = {
  type: "json_schema",
  name: "nextyleads_target_discovery",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: ["candidates"],
    properties: {
      candidates: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "business","region","niche","address","phone","website","instagram",
            "offerSummary","publicAssets","potentialGap","publicFriction","whyPotential",
            "gapTags","rating","reviews","evidenceIds","signals"
          ],
          properties: {
            business: { type: "string" },
            region: { type: "string" },
            niche: { type: "string" },
            address: { type: "string" },
            phone: { type: "string" },
            website: { type: "string" },
            instagram: { type: "string" },
            offerSummary: { type: "string" },
            publicAssets: { type: "string" },
            potentialGap: { type: "string" },
            publicFriction: { type: "string" },
            whyPotential: { type: "string" },
            gapTags: { type: "array", items: { type: "string", enum: [...GAP_TAGS] } },
            rating: { type: "number", minimum: 0, maximum: 5 },
            reviews: { type: "integer", minimum: 0 },
            evidenceIds: { type: "array", items: { type: "string" } },
            signals: {
              type: "object",
              additionalProperties: false,
              required: ["businessRelevance","digitalOpportunity","contactability","evidenceStrength"],
              properties: {
                businessRelevance: { type: "integer", minimum: 0, maximum: 100 },
                digitalOpportunity: { type: "integer", minimum: 0, maximum: 100 },
                contactability: { type: "integer", minimum: 0, maximum: 100 },
                evidenceStrength: { type: "integer", minimum: 0, maximum: 100 },
              },
            },
          },
        },
      },
    },
  },
} as const;
