const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const CATEGORIES = ["Plumbing", "Electrical", "Wi-Fi", "Furniture", "Cleaning", "Other"];
const PRIORITIES = ["Low", "Medium", "High"];
const STATUSES = ["Open", "In Progress", "Resolved"];
// Only forward movement is allowed, so a resolved complaint cannot be reopened
// from the status control.
const NEXT_STATUS = { Open: "In Progress", "In Progress": "Resolved" };

router.get("/", requireAuth, (req, res) => {
  const { status, category, priority, search } = req.query;
  const conditions = [];
  const params = [];

  if (status && STATUSES.includes(status)) { conditions.push("c.status = ?"); params.push(status); }
  if (category && CATEGORIES.includes(category)) { conditions.push("c.category = ?"); params.push(category); }
  if (priority && PRIORITIES.includes(priority)) { conditions.push("c.priority = ?"); params.push(priority); }
  if (search) {
    conditions.push("(c.title LIKE ? OR c.description LIKE ? OR c.location LIKE ?)");
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const rows = db.prepare(`
    SELECT c.*, u.name AS created_by_name
    FROM complaints c JOIN users u ON u.id = c.created_by
    ${where}
    ORDER BY c.created_at DESC, c.id DESC
  `).all(...params);
  res.json(rows);
});

router.post("/", requireAuth, (req, res) => {
  const { title, description, category, priority, location } = req.body || {};
  if (!title || !description || !category || !priority) {
    return res.status(400).json({ error: "Title, description, category and priority are required" });
  }
  if (!CATEGORIES.includes(category) || !PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: "Invalid category or priority" });
  }
  const result = db.prepare(`
    INSERT INTO complaints (title, description, category, priority, location, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title.trim(), description.trim(), category, priority, (location || "").trim(), req.user.id);
  const row = db.prepare(`
    SELECT c.*, u.name AS created_by_name
    FROM complaints c JOIN users u ON u.id = c.created_by WHERE c.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(row);
});

router.get("/:id", requireAuth, (req, res) => {
  const complaint = db.prepare(`
    SELECT c.*, u.name AS created_by_name
    FROM complaints c JOIN users u ON u.id = c.created_by WHERE c.id = ?
  `).get(req.params.id);
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });
  const comments = db.prepare(`
    SELECT cm.*, u.name AS author_name
    FROM comments cm JOIN users u ON u.id = cm.user_id
    WHERE cm.complaint_id = ? ORDER BY cm.created_at ASC, cm.id ASC
  `).all(req.params.id);
  res.json({ ...complaint, comments });
});

router.patch("/:id/status", requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  const complaint = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });
  if (NEXT_STATUS[complaint.status] !== status) {
    return res.status(400).json({
      error: `Status can only move from ${complaint.status} to ${NEXT_STATUS[complaint.status] || "no further status"}`,
    });
  }
  db.prepare("UPDATE complaints SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, req.params.id);
  const updated = db.prepare("SELECT * FROM complaints WHERE id = ?").get(req.params.id);
  res.json(updated);
});

router.post("/:id/comments", requireAuth, (req, res) => {
  const { message } = req.body || {};
  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }
  const complaint = db.prepare("SELECT id FROM complaints WHERE id = ?").get(req.params.id);
  if (!complaint) return res.status(404).json({ error: "Complaint not found" });
  const result = db.prepare(
    "INSERT INTO comments (complaint_id, user_id, message) VALUES (?, ?, ?)"
  ).run(req.params.id, req.user.id, message.trim());
  const comment = db.prepare(`
    SELECT cm.*, u.name AS author_name FROM comments cm
    JOIN users u ON u.id = cm.user_id WHERE cm.id = ?
  `).get(result.lastInsertRowid);
  res.status(201).json(comment);
});

module.exports = router;
