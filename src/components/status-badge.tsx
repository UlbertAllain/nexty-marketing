import clsx from "clsx";

export const stageLabels: Record<string, string> = {
  New: "Baru",
  Qualified: "Siap dihubungi",
  Contacted: "Sudah dihubungi",
  Responded: "Sudah membalas",
  Interested: "Tertarik",
  Meeting: "Pertemuan",
  Proposal: "Proposal",
  Won: "Berhasil",
  Lost: "Tidak lanjut",
  "Follow Up Later": "Tindak lanjut nanti",
  "Not Qualified": "Tidak cocok",
};

export function getStageLabel(value: string) {
  return stageLabels[value] ?? value;
}

export function StatusBadge({ value }: { value: string }) {
  return <span className={clsx("badge", `badge-stage-${value.toLowerCase().replaceAll(" ", "-")}`)}>{getStageLabel(value)}</span>;
}

export function PriorityBadge({ value }: { value: string }) {
  return <span className={clsx("badge", `badge-priority-${value.toLowerCase()}`)}>Prioritas {value}</span>;
}
