// Small helpers shared by the dashboard and detail pages.
// All values come from the API; nothing here invents data.

export function parseCreatedAt(value) {
  if (!value) return null;
  // SQLite stores created_at as "YYYY-MM-DD HH:MM:SS" in UTC.
  const text = String(value).includes("T") ? String(value) : `${value}Z`.replace(" ", "T");
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function daysOpen(complaint, now = new Date()) {
  const raised = parseCreatedAt(complaint.created_at);
  if (!raised) return 0;
  return Math.max(0, Math.floor((now.getTime() - raised.getTime()) / 86400000));
}

export function formatDate(value) {
  const date = parseCreatedAt(value);
  return date ? date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
}

export function ageLabel(complaint) {
  const days = daysOpen(complaint);
  if (complaint.status === "Resolved") return days === 0 ? "Resolved today" : `Resolved after ${days} ${days === 1 ? "day" : "days"}`;
  if (days === 0) return "Opened today";
  return `Open ${days} ${days === 1 ? "day" : "days"}`;
}

// A complaint counts as ageing when it is still open after a week.
export function isAgeing(complaint) {
  return complaint.status !== "Resolved" && daysOpen(complaint) >= 7;
}

const PRIORITY_RANK = { High: 3, Medium: 2, Low: 1 };

export function sortComplaints(list, sort) {
  const items = [...list];
  if (sort === "oldest") {
    return items.sort((a, b) => (parseCreatedAt(a.created_at) || 0) - (parseCreatedAt(b.created_at) || 0));
  }
  if (sort === "priority") {
    return items.sort(
      (a, b) => (PRIORITY_RANK[b.priority] || 0) - (PRIORITY_RANK[a.priority] || 0)
        || (parseCreatedAt(b.created_at) || 0) - (parseCreatedAt(a.created_at) || 0),
    );
  }
  if (sort === "longest") {
    return items.sort(
      (a, b) => daysOpen(b) - daysOpen(a)
        || (parseCreatedAt(a.created_at) || 0) - (parseCreatedAt(b.created_at) || 0),
    );
  }
  // "newest" — matches the order the API already returns.
  return items.sort((a, b) => (parseCreatedAt(b.created_at) || 0) - (parseCreatedAt(a.created_at) || 0));
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export function complaintsToCsv(list) {
  const header = ["ID", "Title", "Category", "Priority", "Status", "Location", "Raised by", "Raised on", "Days open"];
  const rows = list.map((c) => [
    c.id, c.title, c.category, c.priority, c.status,
    c.location || "", c.created_by_name || "", formatDate(c.created_at), daysOpen(c),
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(list, filename = "campus-complaints.csv") {
  const blob = new Blob([complaintsToCsv(list)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
