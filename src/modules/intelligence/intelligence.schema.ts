import { z } from "zod";
import { GAP_TAGS } from "./offer-matcher";
import {
  EVIDENCE_TYPES,
  FINDING_CATEGORIES,
  RESEARCH_CONFIDENCES,
} from "./types";

const evidenceIdSchema = z.string().trim().min(1).max(64);

export const researchRequestSchema = z.object({
  leadId: z.string().trim().min(1).max(128),
}).strict();

const aiSourceSchema = z.object({
  id: evidenceIdSchema,
  type: z.enum(EVIDENCE_TYPES),
  title: z.string().trim().min(1).max(200),
  url: z.string().url().max(2000),
  excerpt: z.string().trim().max(800),
  confidence: z.enum(RESEARCH_CONFIDENCES),
}).strict();

const aiAssetSchema = z.object({
  type: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(160),
  value: z.string().trim().max(500),
  status: z.enum(["verified", "observed"]),
  evidenceIds: z.array(evidenceIdSchema).min(1).max(10),
}).strict();

const aiFindingSchema = z.object({
  id: z.string().trim().min(1).max(64),
  category: z.enum(FINDING_CATEGORIES),
  statement: z.string().trim().min(1).max(1000),
  interpretation: z.string().trim().max(1000),
  evidenceIds: z.array(evidenceIdSchema).min(1).max(10),
  confidence: z.enum(RESEARCH_CONFIDENCES),
}).strict();

const aiGapSchema = z.object({
  id: z.string().trim().min(1).max(64),
  category: z.enum(FINDING_CATEGORIES),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().min(1).max(1000),
  impact: z.string().trim().min(1).max(1000),
  evidenceIds: z.array(evidenceIdSchema).min(1).max(10),
  confidence: z.enum(RESEARCH_CONFIDENCES),
  tags: z.array(z.enum(GAP_TAGS)).min(1).max(8),
}).strict();

export const aiResearchResultSchema = z.object({
  summary: z.string().trim().min(1).max(2000),
  assets: z.array(aiAssetSchema).max(20),
  findings: z.array(aiFindingSchema).max(20),
  gaps: z.array(aiGapSchema).max(12),
  scoringSignals: z.object({
    digitalGap: z.number().int().min(0).max(100),
    businessNeed: z.number().int().min(0).max(100),
    ticketPotential: z.number().int().min(0).max(100),
    contactability: z.number().int().min(0).max(100),
  }).strict(),
  outreach: z.object({
    targetRole: z.string().trim().min(1).max(120),
    angle: z.string().trim().min(1).max(1000),
    openingStrategy: z.string().trim().min(1).max(1000),
    avoid: z.array(z.string().trim().min(1).max(300)).max(8),
    draftMessage: z.string().trim().min(1).max(3000),
  }).strict(),
  sources: z.array(aiSourceSchema).min(1).max(15),
}).strict();

export type AiResearchResult = z.infer<typeof aiResearchResultSchema>;

export const AI_RESEARCH_JSON_SCHEMA = {
  type: "json_schema",
  name: "nextyleads_research",
  description:
    "Structured, evidence-backed business research for a NextyLeads marketing prospect.",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    required: [
      "summary",
      "assets",
      "findings",
      "gaps",
      "scoringSignals",
      "outreach",
      "sources",
    ],
    properties: {
      summary: { type: "string" },
      assets: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["type", "label", "value", "status", "evidenceIds"],
          properties: {
            type: { type: "string" },
            label: { type: "string" },
            value: { type: "string" },
            status: { type: "string", enum: ["verified", "observed"] },
            evidenceIds: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      },
      findings: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "category",
            "statement",
            "interpretation",
            "evidenceIds",
            "confidence",
          ],
          properties: {
            id: { type: "string" },
            category: { type: "string", enum: [...FINDING_CATEGORIES] },
            statement: { type: "string" },
            interpretation: { type: "string" },
            evidenceIds: {
              type: "array",
              items: { type: "string" },
            },
            confidence: { type: "string", enum: [...RESEARCH_CONFIDENCES] },
          },
        },
      },
      gaps: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "id",
            "category",
            "title",
            "description",
            "impact",
            "evidenceIds",
            "confidence",
            "tags",
          ],
          properties: {
            id: { type: "string" },
            category: { type: "string", enum: [...FINDING_CATEGORIES] },
            title: { type: "string" },
            description: { type: "string" },
            impact: { type: "string" },
            evidenceIds: {
              type: "array",
              items: { type: "string" },
            },
            confidence: { type: "string", enum: [...RESEARCH_CONFIDENCES] },
            tags: {
              type: "array",
              items: { type: "string", enum: [...GAP_TAGS] },
            },
          },
        },
      },
      scoringSignals: {
        type: "object",
        additionalProperties: false,
        required: [
          "digitalGap",
          "businessNeed",
          "ticketPotential",
          "contactability",
        ],
        properties: {
          digitalGap: { type: "integer", minimum: 0, maximum: 100 },
          businessNeed: { type: "integer", minimum: 0, maximum: 100 },
          ticketPotential: { type: "integer", minimum: 0, maximum: 100 },
          contactability: { type: "integer", minimum: 0, maximum: 100 },
        },
      },
      outreach: {
        type: "object",
        additionalProperties: false,
        required: [
          "targetRole",
          "angle",
          "openingStrategy",
          "avoid",
          "draftMessage",
        ],
        properties: {
          targetRole: { type: "string" },
          angle: { type: "string" },
          openingStrategy: { type: "string" },
          avoid: {
            type: "array",
            items: { type: "string" },
          },
          draftMessage: { type: "string" },
        },
      },
      sources: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["id", "type", "title", "url", "excerpt", "confidence"],
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: [...EVIDENCE_TYPES] },
            title: { type: "string" },
            url: { type: "string" },
            excerpt: { type: "string" },
            confidence: { type: "string", enum: [...RESEARCH_CONFIDENCES] },
          },
        },
      },
    },
  },
} as const;
