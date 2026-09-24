import clsx from "clsx";

const stageLabels: Record<string, string> = {
  New: "Baru",
  Qualified: "Siap dihubungi",
  Contacted: "Sudah dihubungi",
  Responded: "Sudah membalas",
  Interested: "Tertarik",
  Meeting: "Meeting",
  Proposal: "Proposal",
  Won: "Deal",
  Lost: "Tidak lanjut",
  "Follow Up Later": "Follow-up nanti",
  "Not Qualified": "Tidak cocok",
};

export function StatusBadge({ value }: { value: string }) {
  const label = stageLabels[value] ?? value;
  return <span className={clsx("badge", `badge-stage-${value.toLowerCase().replaceAll(" ", "-")}`)}>{label}</span>;
}

export function PriorityBadge({ value }: { value: string }) {
  return <span className={clsx("badge", `badge-priority-${value.toLowerCase()}`)}>Prioritas {value}</span>;
}
