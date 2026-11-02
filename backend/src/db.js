const { DatabaseSync } = require("node:sqlite");
const bcrypt = require("bcryptjs");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "..", "maintenance.db"));

db.exec("PRAGMA foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('student', 'admin')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Open',
    location TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    complaint_id INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

function seed() {
  const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
  if (userCount > 0) return;

  const insertUser = db.prepare(
    "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)"
  );
  const adminId = insertUser.run(
    "Demo Admin",
    "admin@demo.local",
    bcrypt.hashSync("Admin123", 10),
    "admin"
  ).lastInsertRowid;
  const studentId = insertUser.run(
    "Demo Student",
    "student@demo.local",
    bcrypt.hashSync("Student123", 10),
    "student"
  ).lastInsertRowid;

  // A few example complaints so the dashboard is not empty on first login.
  // These are demo data, not real complaints.
  const insertComplaint = db.prepare(
    `INSERT INTO complaints
     (title, description, category, priority, status, location, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  insertComplaint.run(
    "Leaking tap in Block B washroom",
    "The tap in the ground floor washroom keeps running even when closed.",
    "Plumbing",
    "Medium",
    "Open",
    "Block B, Ground Floor",
    studentId
  );
  insertComplaint.run(
    "Wi-Fi drops in the library reading room",
    "Connection drops every few minutes in the evening. Wired ports work fine.",
    "Wi-Fi",
    "High",
    "In Progress",
    "Library, Reading Room 2",
    studentId
  );
  const resolvedId = insertComplaint.run(
    "Broken chair in Room 214",
    "One leg of the chair near the window is loose.",
    "Furniture",
    "Low",
    "Resolved",
    "Block A, Room 214",
    studentId
  ).lastInsertRowid;

  db.prepare(
    "INSERT INTO comments (complaint_id, user_id, message) VALUES (?, ?, ?)"
  ).run(resolvedId, adminId, "Chair replaced on the morning round.");
}

seed();

module.exports = db;
