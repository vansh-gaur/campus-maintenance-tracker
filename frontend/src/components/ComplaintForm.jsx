import { useState } from "react";
import { api } from "../api";

const CATEGORIES = ["Plumbing", "Electrical", "Wi-Fi", "Furniture", "Cleaning", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];

export default function ComplaintForm({ onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Plumbing",
    priority: "Medium",
    location: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const created = await api.createComplaint(form);
      setForm({ title: "", description: "", category: "Plumbing", priority: "Medium", location: "" });
      onCreated(created);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2>Raise a complaint</h2>
      {error && <div className="error">{error}</div>}
      <form onSubmit={submit}>
        <label>
          <span>Title</span>
          <input value={form.title} onChange={(e) => update("title", e.target.value)} required />
        </label>
        <label>
          <span>Description</span>
          <textarea rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} required />
        </label>
        <label>
          <span>Location (block, room, floor)</span>
          <input value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Block B, Room 214" />
        </label>
        <div className="grid">
          <label>
            <span>Category</span>
            <select value={form.category} onChange={(e) => update("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <button disabled={saving}>{saving ? "Submitting..." : "Submit complaint"}</button>
      </form>
    </section>
  );
}
