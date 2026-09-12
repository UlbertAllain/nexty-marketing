export function StatCard({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return (
    <article className="stat-card">
      <p className="stat-label">{label}</p>
      <div className="stat-value">{value}</div>
      {note ? <p className="stat-note">{note}</p> : null}
    </article>
  );
}
