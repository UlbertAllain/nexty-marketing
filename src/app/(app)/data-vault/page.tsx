"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import workbook from "@/data/seed/excel-workbook.json";

export default function DataVaultPage() {
  const [sheetName, setSheetName] = useState(workbook.sheets[0]?.name ?? "");
  const sheet = workbook.sheets.find((item) => item.name === sheetName) ?? workbook.sheets[0];
  const data = useMemo<RawSheet>(() => ({
    sheet: sheet.name,
    range: sheet.range,
    rows: sheet.values.map((cells, index) => ({ row: index + 1, cells })).filter((row) => row.cells.some((cell) => cell !== null && cell !== "")),
  }), [sheet]);

  return (
    <>
      <PageHeader eyebrow="Data Vault" title="Snapshot lengkap Excel" description="Halaman audit. Tidak dipakai untuk kerja harian. Tujuannya memastikan setiap sheet dan setiap data Excel tetap bisa dilihat di sistem setelah dinormalisasi ke workflow." />
      <section className="filter-bar data-vault-filter">
        <label className="field-inline"><span>Sheet</span><select value={sheet.name} onChange={(e) => setSheetName(e.target.value)}>{workbook.sheets.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
        <span className="result-count">Range {sheet.range} · {sheet.formulas.length} formula</span>
      </section>
      <section className="panel reference-page-panel">
        <div className="panel-heading"><div><p className="eyebrow">{sheet.name}</p><h2>Data asli workbook</h2></div></div>
        <RawSheetView data={data} intro="Ini adalah layer traceability. Untuk pekerjaan sehari-hari, gunakan menu Leads / Follow-up / Research / Templates / Growth / Reports." />
      </section>
    </>
  );
}
