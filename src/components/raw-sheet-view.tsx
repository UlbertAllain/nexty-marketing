export type RawRow = { row: number; cells: Array<string | number | boolean | null> };
export type RawSheet = { sheet: string; range: string; rows: RawRow[] };

type Block = { title: string; rows: RawRow[] };

function nonEmpty(cells: RawRow["cells"]) {
  return cells.filter((cell) => cell !== null && cell !== "");
}

function makeBlocks(data: RawSheet): Block[] {
  const source = data.rows.filter((row) => row.row > 3);
  const blocks: Block[] = [];
  let current: Block | null = null;
  let previousRow = 0;

  for (const row of source) {
    const visible = nonEmpty(row.cells);
    if (!visible.length) continue;
    const first = String(visible[0]);
    const isHeading = visible.length === 1 && (/^[A-Z]\./.test(first) || first.length > 12);
    const hasGap = previousRow && row.row - previousRow > 1;

    if (isHeading) {
      if (current?.rows.length) blocks.push(current);
      current = { title: first.replace(/^[A-Z]\.\s*/, ""), rows: [] };
      previousRow = row.row;
      continue;
    }
    if (!current || (hasGap && current.rows.length)) {
      if (current?.rows.length) blocks.push(current);
      current = { title: `Bagian ${blocks.length + 1}`, rows: [] };
    }
    current.rows.push(row);
    previousRow = row.row;
  }
  if (current?.rows.length) blocks.push(current);
  return blocks;
}

function excelDate(value: number) {
  const epoch = Date.UTC(1899, 11, 30);
  return new Date(epoch + value * 86400000).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
}

function displayValue(value: RawRow["cells"][number], header?: RawRow["cells"][number]) {
  if (value === null || value === "") return "—";
  if (typeof value === "number") {
    const label = String(header ?? "").toLowerCase();
    if ((label.includes("date") || label.includes("tanggal")) && value > 30000 && value < 60000) return excelDate(value);
    if ((label.includes("%") || label.includes("rate") || label.includes("share")) && value >= 0 && value <= 1) return `${(value * 100).toFixed(1)}%`;
    return Number.isInteger(value) ? value.toLocaleString("id-ID") : value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  return String(value);
}

export function RawSheetView({ data, intro }: { data: RawSheet; intro?: string }) {
  const blocks = makeBlocks(data);
  return (
    <div className="reference-stack">
      {intro ? <p className="muted small reference-intro">{intro}</p> : null}
      {blocks.map((block, index) => {
        const header = block.rows[0];
        const body = block.rows.slice(1);
        const columnCount = Math.max(...block.rows.map((row) => row.cells.length));
        return (
          <details key={`${block.title}-${index}`} className="reference-section" open={index === 0}>
            <summary><span>{block.title}</span><small>{Math.max(body.length, 0)} item</small></summary>
            {block.rows.length === 1 ? (
              <div className="reference-single">{nonEmpty(header.cells).map((value) => displayValue(value)).join(" · ")}</div>
            ) : (
              <div className="reference-table-shell">
                <table className="reference-table">
                  <thead><tr>{Array.from({ length: columnCount }).map((_, i) => <th key={i}>{displayValue(header.cells[i])}</th>)}</tr></thead>
                  <tbody>{body.map((row) => <tr key={row.row}>{Array.from({ length: columnCount }).map((_, i) => <td key={i}>{displayValue(row.cells[i], header.cells[i])}</td>)}</tr>)}</tbody>
                </table>
              </div>
            )}
          </details>
        );
      })}
    </div>
  );
}
