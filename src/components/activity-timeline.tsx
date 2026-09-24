import type { Activity } from "@/modules/leads/types";
import { formatDateTime } from "@/lib/utils/date";
import { getStageLabel } from "./status-badge";

const templateLabels: Record<string, string> = {
  FIRST_OUTREACH: "Pesan pertama",
  INTERESTED_REPLY: "Balasan saat tertarik",
  FOLLOW_UP_D2: "Tindak lanjut H+2",
  FOLLOW_UP_D5: "Tindak lanjut terakhir",
  MEETING_CTA: "Ajakan bertemu",
};

function activityBody(activity: Activity) {
  if (!activity.body) return "";
  if (activity.type !== "stage_changed") return activity.body;
  const [from, to] = activity.body.split(" → ");
  return to ? `${getStageLabel(from)} → ${getStageLabel(to)}` : activity.body;
}

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="muted small">Belum ada aktivitas.</p>;
  return (
    <div className="timeline">
      {activities.map((activity) => (
        <div className="timeline-item" key={activity.id}>
          <span className="timeline-dot" />
          <div>
            <div className="timeline-head">
              <strong>{activity.type === "message_sent" ? "Pesan terkirim" : activity.type === "stage_changed" ? "Status berubah" : "Aktivitas"}</strong>
              <time>{formatDateTime(activity.occurredAt)}</time>
            </div>
            {activity.templateKey ? <span className="tiny muted">{templateLabels[activity.templateKey] ?? activity.templateKey}</span> : null}
            {activity.body ? <p className="timeline-body">{activityBody(activity)}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
