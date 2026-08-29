import { ArrowRight, Plus } from "lucide-react";
import { metrics, statusLabel } from "@/lib/business";
import type { Activity, FollowUp, Lead, LeadStatus, Message } from "@/lib/types";
import { EmptyState } from "./dialog";

const pipelineStatuses: LeadStatus[] = [
  "NEW",
  "READY_TO_CONTACT",
  "CONTACTED",
  "WAITING_REPLY",
  "REPLIED",
  "DEAL",
];

export function DashboardView({
  leads,
  followups,
  activities,
  messages,
  onAdd,
}: {
  leads: Lead[];
  followups: FollowUp[];
  activities: Activity[];
  messages: Message[];
  onAdd: () => void;
}) {
  const summary = metrics(leads);
  const today = new Date().toISOString().slice(0, 10);
  const due = followups.filter(
    (item) => item.status === "ACTIVE" && item.date.slice(0, 10) <= today,
  );
  const opened = messages.filter((item) => item.status === "DRAFT");
  const newContacts = leads.filter((item) => item.status === "NEW");
  const pipelineCounts = pipelineStatuses.map((status) => ({
    status,
    count: leads.filter((lead) => lead.status === status).length,
  }));
  const maxPipeline = Math.max(1, ...pipelineCounts.map((item) => item.count));

  return (
    <>
      <section className="hero-row dashboard-hero">
        <div>
          <span className="eyebrow">KERJA HARI INI</span>
          <h2>
            {newContacts.length
              ? `${newContacts.length} calon klien masih menunggu langkah pertama.`
              : "Pipeline hari ini sudah terkendali."}
          </h2>
          <p>
            Mulai dari pekerjaan yang paling dekat dengan aksi. Sisanya biarkan
            sistem yang mengingatkan.
          </p>
        </div>
        <button className="primary" onClick={onAdd}>
          <Plus size={17} />
          Tambah calon klien
        </button>
      </section>

      <nav className="focus-strip" aria-label="Pekerjaan berikutnya">
        <a href="/leads">
          <span className="focus-index">01</span>
          <div>
            <b>{newContacts.length} belum dihubungi</b>
            <small>Mulai outreach dari daftar calon klien.</small>
          </div>
          <ArrowRight size={16} />
        </a>
        <a href="/leads">
          <span className="focus-index">02</span>
          <div>
            <b>{opened.length} WhatsApp belum dikonfirmasi</b>
            <small>Pastikan pesan yang sudah dibuka benar-benar dikirim.</small>
          </div>
          <ArrowRight size={16} />
        </a>
        <a href="/follow-up">
          <span className="focus-index">03</span>
          <div>
            <b>{due.length} follow-up jatuh tempo</b>
            <small>Selesaikan pengingat yang sudah waktunya.</small>
          </div>
          <ArrowRight size={16} />
        </a>
      </nav>

      <div className="stats">
        <Stat
          label="Belum dihubungi"
          value={newContacts.length}
          note="prioritas untuk langkah pertama"
          accent
        />
        <Stat
          label="Menunggu konfirmasi"
          value={opened.length}
          note="WhatsApp sudah dibuka"
        />
        <Stat
          label="Pengingat hari ini"
          value={due.length}
          note="perlu diselesaikan"
        />
        <Stat
          label="Berhasil jadi klien"
          value={summary.deal}
          note={`${summary.conversionRate}% dari seluruh data`}
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <Title title="Pergerakan pipeline" link="/leads" />
          <div className="pipeline">
            {pipelineCounts.map(({ status, count }) => (
              <div key={status}>
                <span>{statusLabel[status]}</span>
                <b>{count}</b>
                <i>
                  <span style={{ width: `${(count / maxPipeline) * 100}%` }} />
                </i>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <Title title="Aktivitas terbaru" />
          <div className="activity-list">
            {activities.slice(0, 7).map((activity) => (
              <div key={activity.id}>
                <span />
                <p>
                  <b>{activity.description}</b>
                  <small>
                    {new Date(activity.createdAt).toLocaleString("id-ID")}
                  </small>
                </p>
              </div>
            ))}
            {!activities.length && (
              <EmptyState>Aktivitas baru akan muncul di sini.</EmptyState>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: number;
  note: string;
  accent?: boolean;
}) {
  return (
    <article className={accent ? "stat accent" : "stat"}>
      <p>{label}</p>
      <b>{value}</b>
      <small>{note}</small>
    </article>
  );
}

export function Title({ title, link }: { title: string; link?: string }) {
  return (
    <div className="panel-title">
      <h3>{title}</h3>
      {link && (
        <a href={link}>
          Buka <ArrowRight size={13} />
        </a>
      )}
    </div>
  );
}
