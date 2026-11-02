const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const total = db.prepare("SELECT COUNT(*) AS n FROM complaints").get().n;
  const byStatus = db.prepare("SELECT status, COUNT(*) AS n FROM complaints GROUP BY status").all();
  const byCategory = db.prepare("SELECT category, COUNT(*) AS n FROM complaints GROUP BY category ORDER BY n DESC").all();
  const byPriority = db.prepare("SELECT priority, COUNT(*) AS n FROM complaints GROUP BY priority").all();
  const resolved = byStatus.find((r) => r.status === "Resolved")?.n || 0;

  res.json({
    total,
    resolved,
    open: total - resolved,
    byStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.n])),
    byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r.n])),
    byPriority: Object.fromEntries(byPriority.map((r) => [r.priority, r.n])),
  });
});

module.exports = router;
