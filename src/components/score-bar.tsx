export function ScoreBar({ value }: { value: number }) {
  return (
    <div className="score-inline" aria-label={`Opportunity score ${value}`}>
      <strong>{value}</strong>
      <span className="score-track"><span style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></span>
    </div>
  );
}
