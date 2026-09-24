"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { RawSheetView, type RawSheet } from "@/components/raw-sheet-view";
import { useExcelSheets } from "@/modules/reference/reference.hooks";
import workbook from "@/data/seed/excel-workbook.json";

export default function DataVaultPage() {
  const { sheets } = useExcelSheets(workbook.sheets);
  const [sheetName, setSheetName] = useState(workbook.sheets[0]?.name ?? "");
  const sheet = sheets.find((item) => item.name === sheetName) ?? sheets[0];
  const data = useMemo<RawSheet>(() => ({
    sheet: sheet.name,
    range: sheet.range,
    rows: sheet.values.map((cells, index) => ({ row: index + 1, cells })).filter((row) => row.cells.some((cell) => cell !== null && cell !== "")),
  }), [sheet]);

  return (
    <>
      <PageHeader eyebrow="Data sumber" title="Salinan data Excel pemasaran" description="Halaman ini hanya untuk audit data. Tim pemasaran sehari-hari sebaiknya memakai menu Hari ini, Daftar calon klien, dan Tindak lanjut." />
      <section className="filter-bar data-vault-filter">
        <label className="field-inline"><span>Lembar</span><select value={sheet.name} onChange={(e) => setSheetName(e.target.value)}>{sheets.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}</select></label>
        <span className="result-count">Range {sheet.range} · {sheet.formulas.length} rumus</span>
      </section>
      <section className="panel reference-page-panel">
        <div className="panel-heading"><div><p className="eyebrow">{sheet.name}</p><h2>Data asli Excel</h2></div></div>
        <RawSheetView data={data} intro="Data di sini adalah snapshot sumber. Untuk pekerjaan sehari-hari, gunakan menu utama agar informasi lebih mudah dibaca." />
      </section>
    </>
  );
}
