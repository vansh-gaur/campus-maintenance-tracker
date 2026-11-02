import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";

const CATEGORIES = ["", "Plumbing", "Electrical", "Wi-Fi", "Furniture", "Cleaning", "Other"];
const STATUSES = ["", "Open", "In Progress", "Resolved"];
const PRIORITIES = ["", "Low", "Medium", "High"];

export default function Dashboard({ user, onSelect }) {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", category: "", priority: "" });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.search) params.set("search", filters.search);
      const [statsData, list] = await Promise.all([
        api.stats(),
        api.complaints(params.toString() ? `?${params}` : ""),
      ]);
      setStats(statsData);
      setComplaints(list);
    } catch (err) {
      setError(err.message);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}

      <section className="card">
        <h2>Overview</h2>
        {stats ? (
          <>
            <div className="grid">
              <div className="stat"><b>{stats.total}</b><span>Total complaints</span></div>
              <div className="stat"><b>{stats.byStatus["Open"] || 0}</b><span>Open</span></div>
              <div className="stat"><b>{stats.byStatus["In Progress"] || 0}</b><span>In Progress</span></div>
              <div className="stat"><b>{stats.resolved}</b><span>Resolved</span></div>
            </div>
            <p className="meta">
              By category: {Object.entries(stats.byCategory).map(([k, v]) => `${k} (${v})`).join(" · ") || "None yet"}
            </p>
          </>
        ) : <p>Loading stats...</p>}
      </section>

      <ComplaintForm onCreated={(created) => setComplaints((prev) => [created, ...prev])} />

      <section className="card">
        <h2>Complaints</h2>
        <div className="filters">
          <label>
            <span>Search</span>
            <input value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} placeholder="Search title or location" />
          </label>
          <label>
            <span>Status</span>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              {STATUSES.map((s) => <option key={s} value={s}>{s || "All statuses"}</option>)}
            </select>
          </label>
          <label>
            <span>Category</span>
            <select value={filters.category} onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All categories"}</option>)}
            </select>
          </label>
          <label>
            <span>Priority</span>
            <select value={filters.priority} onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p || "All priorities"}</option>)}
            </select>
          </label>
        </div>
        <ComplaintList complaints={complaints} onSelect={onSelect} />
      </section>
      <p className="hint">Signed in as {user.name} ({user.role}). Only admins can change a complaint's status.</p>
    </div>
  );
}
