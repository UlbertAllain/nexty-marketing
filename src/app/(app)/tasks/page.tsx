"use client";

import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/features/tasks/hooks";

export default function TasksPage() {
  const { overdue, dueToday, open } = useTasks();
  const future = open.filter((task) => !overdue.includes(task) && !dueToday.includes(task));

  return (
    <>
      <PageHeader eyebrow="Follow-up" title="Jangan ada lead yang hilang karena lupa" description="Task dibuat otomatis setelah chat pertama dan follow-up D+2 ditandai terkirim." />
      <div className="three-column-panels">
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow danger">Terlambat</p><h2>{overdue.length} task</h2></div></div><TaskList tasks={overdue} /></section>
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Hari ini</p><h2>{dueToday.length} task</h2></div></div><TaskList tasks={dueToday} /></section>
        <section className="panel"><div className="panel-heading"><div><p className="eyebrow">Berikutnya</p><h2>{future.length} task</h2></div></div><TaskList tasks={future.slice(0, 20)} /></section>
      </div>
    </>
  );
}
