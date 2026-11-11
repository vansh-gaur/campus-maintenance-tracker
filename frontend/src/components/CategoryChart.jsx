// Horizontal bar chart built only from the /api/stats byCategory counts.
export default function CategoryChart({ byCategory = {} }) {
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="hint">No complaints yet, so there is nothing to break down.</p>;
  const max = Math.max(...entries.map(([, n]) => n));
  return (
    <div className="cat-chart" role="img" aria-label={`Complaints by category: ${entries.map(([k, v]) => `${k} ${v}`).join(", ")}`}>
      {entries.map(([name, count]) => (
        <div className="cat-row" key={name}>
          <span className="cat-name">{name}</span>
          <span className="cat-track"><span className="cat-bar" style={{ width: `${(count / max) * 100}%` }} /></span>
          <span className="cat-count">{count}</span>
        </div>
      ))}
    </div>
  );
}
