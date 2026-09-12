import clsx from "clsx";

export function StatusBadge({ value }: { value: string }) {
  return <span className={clsx("badge", `badge-stage-${value.toLowerCase().replaceAll(" ", "-")}`)}>{value}</span>;
}

export function PriorityBadge({ value }: { value: string }) {
  return <span className={clsx("badge", `badge-priority-${value.toLowerCase()}`)}>Priority {value}</span>;
}
