import { useEffect, useState } from "react";
import { api } from "../api";

const NEXT_STATUS = { Open: "In Progress", "In Progress": "Resolved" };

export default function ComplaintDetail({ id, user, onBack }) {
  const [complaint, setComplaint] = useState(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.complaint(id).then(setComplaint).catch((err) => setError(err.message));
  }, [id]);

  async function changeStatus() {
    if (!complaint) return;
    try {
      const updated = await api.updateStatus(id, NEXT_STATUS[complaint.status]);
      setComplaint((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitComment(e) {
    e.preventDefault();
    try {
      const created = await api.addComment(id, comment);
      setComplaint((prev) => ({ ...prev, comments: [...(prev.comments || []), created] }));
      setComment("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (error && !complaint) return <div className="container"><div className="error">{error}</div></div>;
  if (!complaint) return <div className="container"><p>Loading complaint...</p></div>;

  const next = NEXT_STATUS[complaint.status];

  return (
    <div className="container">
      <button className="secondary" type="button" onClick={onBack}>Back to complaints</button>
      {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
      <section className="card" style={{ marginTop: 16 }}>
        <h2>{complaint.title}</h2>
        <p className="meta">
          {complaint.category} · {complaint.priority} priority · {complaint.location || "No location given"} · raised by {complaint.created_by_name}
        </p>
        <p><strong>Status:</strong> {complaint.status}</p>
        <p>{complaint.description}</p>
        {user.role === "admin" && next && (
          <button type="button" onClick={changeStatus}>Move to {next}</button>
        )}
      </section>

      <section className="card">
        <h3>Updates and comments</h3>
        {(complaint.comments || []).length === 0 && <p>No updates yet.</p>}
        {(complaint.comments || []).map((c) => (
          <div className="comment" key={c.id}>
            <small>{c.author_name} · {new Date(c.created_at).toLocaleString()}</small>
            <p>{c.message}</p>
          </div>
        ))}
        <form onSubmit={submitComment} style={{ marginTop: 16 }}>
          <label>
            <span>Add a comment</span>
            <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} required />
          </label>
          <button>Add comment</button>
        </form>
      </section>
    </div>
  );
}
