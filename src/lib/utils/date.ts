import { format, isSameDay, isBefore, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

export function asDate(value?: Timestamp | Date | null) {
  if (!value) return null;
  return value instanceof Date ? value : value.toDate();
}

export function formatDate(value?: Timestamp | Date | null) {
  const date = asDate(value);
  if (!date) return "—";
  return format(date, "d MMM yyyy", { locale: id });
}

export function formatDateTime(value?: Timestamp | Date | null) {
  const date = asDate(value);
  if (!date) return "—";
  return format(date, "d MMM yyyy, HH:mm", { locale: id });
}

export function dueLabel(value?: Timestamp | null) {
  const date = asDate(value);
  if (!date) return "Tanpa tanggal";
  const today = startOfDay(new Date());
  if (isSameDay(date, today)) return "Hari ini";
  if (isBefore(date, today)) return "Terlambat";
  return format(date, "d MMM", { locale: id });
}
