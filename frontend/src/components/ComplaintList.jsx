import TiltCard from "./TiltCard";
import { ageLabel, formatDate, isAgeing } from "../utils";

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
      {complaints.map((c, i) => (
        <TiltCard as="li" key={c.id} className={isAgeing(c) ? "ageing" : ""} delay={Math.min(i, 8) * 45}>
          <h3>
            <button type="button" onClick={() => onSelect(c.id)}>{c.title}</button>
          </h3>
          <p className="meta">
            {c.category} · {c.location || "No location given"} · raised by {c.created_by_name} · {formatDate(c.created_at)}
          </p>
          <div className="row-line">
            <span className={badgeClass(c.status)}>{c.status}</span>
            <span className={`priority-tag${c.priority === "High" ? " high" : ""}`}>{c.priority} priority</span>
            <span className={`age${isAgeing(c) ? " ageing" : ""}${c.status === "Resolved" ? " resolved-age" : ""}`}>{ageLabel(c)}</span>
          </div>
        </TiltCard>
      ))}
    </ul>
  );
}
