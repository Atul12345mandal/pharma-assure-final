require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./config/db"); // make sure this file exports your PostgreSQL pool

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const complianceRoutes = require("./routes/complianceRoutes");

// Use routes with prefix /api/compliance
app.use("/api/compliance", complianceRoutes);

// Test server route
app.get("/", (req, res) => {
  res.send("PharmaComply360 Backend is Running 🚀");
});

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch(err => console.error("DB Connection Error ❌", err));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});