function badgeClass(status) {
  if (status === "Open") return "badge open";
  if (status === "In Progress") return "badge progress";
  return "badge resolved";
}

export default function ComplaintList({ complaints, onSelect }) {
  if (complaints.length === 0) {
    return <p>No complaints match the current filters.</p>;
  }
  return (
    <ul className="list">
      {complaints.map((c) => (
        <li key={c.id}>
          <h3>
            <button type="button" onClick={() => onSelect(c.id)}>{c.title}</button>
          </h3>
          <p className="meta">
            {c.category} · {c.priority} priority · {c.location || "No location given"} · raised by {c.created_by_name}
          </p>
          <span className={badgeClass(c.status)}>{c.status}</span>
        </li>
      ))}
    </ul>
  );
}
