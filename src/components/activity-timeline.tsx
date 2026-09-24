import type { Activity } from "@/modules/leads/types";
import { formatDateTime } from "@/lib/utils/date";

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  if (!activities.length) return <p className="muted small">Belum ada aktivitas.</p>;
  return (
    <div className="timeline">
      {activities.map((activity) => (
        <div className="timeline-item" key={activity.id}>
          <span className="timeline-dot" />
          <div>
            <div className="timeline-head">
              <strong>{activity.type === "message_sent" ? "Chat terkirim" : activity.type === "stage_changed" ? "Status berubah" : "Aktivitas"}</strong>
              <time>{formatDateTime(activity.occurredAt)}</time>
            </div>
            {activity.templateKey ? <span className="tiny muted">{activity.templateKey.replaceAll("_", " ")}</span> : null}
            {activity.body ? <p className="timeline-body">{activity.body}</p> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
