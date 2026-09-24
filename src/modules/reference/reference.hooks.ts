"use client";

import { useEffect, useState } from "react";
import {
  subscribeExcelSheets,
  subscribeReferenceData,
  type ExcelSheetSnapshot,
} from "./reference.repository";

export function useReferenceData<T>(key: string, fallback: T) {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeReferenceData<T>(key, (value) => {
    if (value !== null) setData(value);
    setLoading(false);
  }), [key]);

  return { data, loading };
}

export function useExcelSheets(fallback: ExcelSheetSnapshot[]) {
  const [sheets, setSheets] = useState<ExcelSheetSnapshot[]>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => subscribeExcelSheets((items) => {
    if (items.length) setSheets(items);
    setLoading(false);
  }), []);

  return { sheets, loading };
}
