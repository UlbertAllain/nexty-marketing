"use client";

import Link from "next/link";
import { Check, Clock3 } from "lucide-react";
import type { Task } from "@/modules/leads/types";
import { completeTask } from "@/modules/tasks/repository";
import { dueLabel, formatDate } from "@/lib/utils/date";
import { toIndonesianMarketingCopy } from "@/modules/leads/copy";

export function TaskList({ tasks, compact = false }: { tasks: Task[]; compact?: boolean }) {
  if (!tasks.length) return <p className="muted small">Tidak ada tindak lanjut yang jatuh tempo.</p>;

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article className="task-row" key={task.id}>
          <div className="task-icon"><Clock3 size={16} /></div>
          <div className="task-body">
            <Link href={`/leads/${task.leadId}`} className="task-title">{task.business}</Link>
            <span>{toIndonesianMarketingCopy(task.title)}</span>
          </div>
          <div className="task-meta">
            <span className={dueLabel(task.dueAt) === "Terlambat" ? "due overdue" : "due"}>{dueLabel(task.dueAt)}</span>
            {!compact ? <small>{formatDate(task.dueAt)}</small> : null}
          </div>
          <button className="icon-button" title="Tandai selesai" onClick={() => completeTask(task.id)}>
            <Check size={16} />
          </button>
        </article>
      ))}
    </div>
  );
}
