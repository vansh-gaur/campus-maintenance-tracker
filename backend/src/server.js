const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaints");
const statsRoutes = require("./routes/stats");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/stats", statsRoutes);

app.use((req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
