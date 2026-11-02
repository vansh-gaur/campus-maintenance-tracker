const jwt = require("jsonwebtoken");
const db = require("../db");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Login required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db
      .prepare("SELECT id, name, email, role FROM users WHERE id = ?")
      .get(payload.id);
    if (!user) return res.status(401).json({ error: "User not found" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

module.exports = { signToken, requireAuth, requireAdmin };
