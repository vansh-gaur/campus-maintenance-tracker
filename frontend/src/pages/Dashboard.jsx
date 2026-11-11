import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { daysOpen, downloadCsv, sortComplaints } from "../utils";
import ComplaintForm from "../components/ComplaintForm";
import ComplaintList from "../components/ComplaintList";
import StatCard from "../components/StatCard";
import CategoryChart from "../components/CategoryChart";
import TiltCard from "../components/TiltCard";

const CATEGORIES = ["", "Plumbing", "Electrical", "Wi-Fi", "Furniture", "Cleaning", "Other"];
const STATUSES = ["", "Open", "In Progress", "Resolved"];
const PRIORITIES = ["", "Low", "Medium", "High"];
const SORTS = [
  ["newest", "Newest first"],
  ["oldest", "Oldest first"],
  ["priority", "Highest priority"],
  ["longest", "Longest open"],
];

export default function Dashboard({ user, onSelect }) {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [filters, setFilters] = useState({ search: "", status: "", category: "", priority: "" });
  const [sort, setSort] = useState("newest");
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

  const sorted = useMemo(() => sortComplaints(complaints, sort), [complaints, sort]);
  const ageingCount = useMemo(
    () => complaints.filter((c) => c.status !== "Resolved" && daysOpen(c) >= 7).length,
    [complaints],
  );

  function toggleStatus(status) {
    setFilters((f) => ({ ...f, status: f.status === status ? "" : status }));
  }

  function handleCreated(created) {
    setComplaints((prev) => [created, ...prev]);
    api.stats().then(setStats).catch(() => {});
  }

  const openCount = stats?.byStatus["Open"] || 0;
  const inProgressCount = stats?.byStatus["In Progress"] || 0;
  const resolvedCount = stats?.resolved || 0;

  return (
    <div className="container">
      <div className="page-head rise">
        <h1>Maintenance desk</h1>
        <p>{complaints.length} complaint{complaints.length === 1 ? "" : "s"} in the current view · {ageingCount} open for more than a week</p>
      </div>
      {error && <div className="error">{error}</div>}

      <TiltCard as="section" className="card" delay={40}>
        <h2>Overview</h2>
        {stats ? (
          <>
            <div className="grid">
              <StatCard value={stats.total} label="Total complaints" />
              <StatCard value={openCount} label="Open" />
              <StatCard value={inProgressCount} label="In Progress" />
              <StatCard value={resolvedCount} label="Resolved" sub={stats.total ? `${Math.round((resolvedCount / stats.total) * 100)}% of all complaints` : ""} />
            </div>

            <div className="pipeline" role="group" aria-label="Filter by status">
              {[
                ["Open", openCount, "Raised, not started"],
                ["In Progress", inProgressCount, "Work under way"],
                ["Resolved", resolvedCount, "Fixed and closed"],
              ].map(([status, count, hint], i) => (
                <button
                  key={status}
                  type="button"
                  className="pipeline-step"
                  aria-pressed={filters.status === status}
                  title={`Show only ${status} complaints`}
                  onClick={() => toggleStatus(status)}
                >
                  <span>
                    <span className="step-label">{status}</span>
                    <span className="step-hint">{hint}</span>
                  </span>
                  <span className="step-count">{count}</span>
                  {i < 2 ? <span className="step-arrow" aria-hidden="true">→</span> : null}
                </button>
              ))}
            </div>
            <p className="pipeline-note">Select a stage to filter the list below. Select it again to clear.</p>

            <div className="two-col" style={{ marginTop: 20 }}>
              <div>
                <h3>By category</h3>
                <CategoryChart byCategory={stats.byCategory} />
              </div>
              <div>
                <h3>By priority</h3>
                <div className="kv">
                  {(["High", "Medium", "Low"]).map((p) => (
                    <div key={p}><span>{p} priority</span><b>{stats.byPriority?.[p] || 0}</b></div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : <p>Loading stats...</p>}
      </TiltCard>

      <ComplaintForm onCreated={handleCreated} />

      <section className="card rise" style={{ "--delay": "120ms" }}>
        <div className="list-head">
          <h2 style={{ borderBottom: 0, paddingBottom: 0, marginBottom: 0 }}>Complaints</h2>
          <span className="count">{sorted.length} shown</span>
        </div>
        <div className="filters" style={{ marginTop: 14 }}>
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
        <div className="toolbar">
          <label>
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORTS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <button className="secondary" type="button" onClick={() => downloadCsv(sorted)} disabled={sorted.length === 0}>
            Export filtered list (CSV)
          </button>
        </div>
        <ComplaintList complaints={sorted} onSelect={onSelect} />
      </section>
      <p className="footer-note">Signed in as {user.name} ({user.role}). Only admins can change a complaint's status.</p>
    </div>
  );
}
