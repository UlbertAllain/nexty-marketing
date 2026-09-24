import type { Timestamp } from "firebase/firestore";

export const MESSAGE_TEMPLATE_CATEGORIES = [
  "pesan-awal",
  "tindak-lanjut",
  "balasan",
  "penawaran",
  "lainnya",
] as const;

export type MessageTemplateCategory = typeof MESSAGE_TEMPLATE_CATEGORIES[number];

export const MESSAGE_TEMPLATE_CATEGORY_LABELS: Record<MessageTemplateCategory, string> = {
  "pesan-awal": "Pesan awal",
  "tindak-lanjut": "Tindak lanjut",
  "balasan": "Balasan",
  "penawaran": "Penawaran",
  "lainnya": "Lainnya",
};

export interface CustomMessageTemplate {
  id: string;
  title: string;
  category: MessageTemplateCategory;
  usage: string;
  body: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type CustomMessageTemplateInput = Omit<
  CustomMessageTemplate,
  "id" | "createdAt" | "updatedAt"
>;
