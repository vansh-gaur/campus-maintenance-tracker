const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

router.post("/register", (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }
  const chosenRole = role === "admin" ? "admin" : "student";

  try {
    const result = db
      .prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
      .run(name.trim(), email.trim().toLowerCase(), bcrypt.hashSync(password, 10), chosenRole);
    const user = db.prepare("SELECT id, name, email, role FROM users WHERE id = ?").get(result.lastInsertRowid);
    return res.status(201).json({ user: publicUser(user), token: signToken(user) });
  } catch (err) {
    if (String(err.message).includes("UNIQUE")) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    return res.status(500).json({ error: "Could not create account" });
  }
});

router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid email or password" });
  }
  return res.json({ user: publicUser(user), token: signToken(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
