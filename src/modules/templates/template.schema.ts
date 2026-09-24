import { z } from "zod";
import { MESSAGE_TEMPLATE_CATEGORIES } from "./template.types";

export const customMessageTemplateSchema = z.object({
  title: z.string().trim().min(2, "Judul minimal 2 karakter.").max(80, "Judul maksimal 80 karakter."),
  category: z.enum(MESSAGE_TEMPLATE_CATEGORIES),
  usage: z.string().trim().max(160, "Keterangan penggunaan maksimal 160 karakter."),
  body: z.string().trim().min(5, "Isi pesan minimal 5 karakter.").max(3000, "Isi pesan maksimal 3000 karakter."),
});
