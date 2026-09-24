"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { useTasks } from "@/modules/tasks/hooks";

export default function TasksPage() {
  const { overdue, dueToday, open } = useTasks();
  const future = open.filter((task) => !overdue.includes(task) && !dueToday.includes(task));

  return (
    <>
      <PageHeader
        eyebrow="Tindak lanjut"
        title="Siapa yang harus dihubungi hari ini?"
        description="Mulai dari yang terlambat. Setelah itu selesaikan jadwal hari ini. Klik nama bisnis untuk membuka detail calon klien."
        actions={<Link href="/leads" className="button secondary">Buka daftar calon klien <ArrowRight size={15} /></Link>}
      />

      <section className="task-summary-strip">
        <div><strong>{overdue.length}</strong><span>Terlambat</span></div>
        <div><strong>{dueToday.length}</strong><span>Hari ini</span></div>
        <div><strong>{future.length}</strong><span>Berikutnya</span></div>
      </section>

      <div className="followup-grid">
        <section className="panel followup-panel urgent-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow danger">Prioritas pertama</p>
              <h2>Tindak lanjut terlambat</h2>
              <p className="panel-description">Selesaikan bagian ini sebelum menghubungi calon klien baru.</p>
            </div>
            <span className="count-pill danger-pill">{overdue.length}</span>
          </div>
          <TaskList tasks={overdue} />
        </section>

        <section className="panel followup-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Jadwal hari ini</p>
              <h2>Hubungi hari ini</h2>
              <p className="panel-description">Jangan lewatkan tindak lanjut yang sudah dijadwalkan.</p>
            </div>
            <span className="count-pill">{dueToday.length}</span>
          </div>
          <TaskList tasks={dueToday} />
        </section>
      </div>

      <section className="panel upcoming-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Tidak perlu dikerjakan sekarang</p>
            <h2>Jadwal berikutnya</h2>
            <p className="panel-description">Daftar ini hanya untuk melihat pekerjaan yang akan datang.</p>
          </div>
          <span className="count-pill neutral-pill">{future.length}</span>
        </div>
        <TaskList tasks={future.slice(0, 30)} />
      </section>
    </>
  );
}
