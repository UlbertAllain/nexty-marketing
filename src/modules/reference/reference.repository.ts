"use client";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export function subscribeReferenceData<T>(
  key: string,
  callback: (value: T | null) => void,
): Unsubscribe {
  return onSnapshot(doc(db, "referenceData", key), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.data().payload as T) : null);
  });
}

export interface ExcelSheetSnapshot {
  name: string;
  range: string;
  values: unknown[][];
  formulas: unknown[];
}

export function subscribeExcelSheets(
  callback: (items: ExcelSheetSnapshot[]) => void,
): Unsubscribe {
  const sheetQuery = query(collection(db, "excelSheets"), orderBy("name", "asc"));

  return onSnapshot(sheetQuery, (snapshot) => {
    callback(snapshot.docs.map((item) => {
      const data = item.data();
      return {
        name: String(data.name ?? ""),
        range: String(data.sourceRange ?? ""),
        values: Array.isArray(data.rows) ? data.rows : [],
        formulas: Array.isArray(data.formulas) ? data.formulas : [],
      };
    }));
  });
}
