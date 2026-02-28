require("dotenv").config();
const pool = require('./config/db');
const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const complianceRoutes = require("./routes/complianceRoutes");

// Use routes
app.use("/api/compliance", complianceRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("PharmaComply360 Backend is Running 🚀");
});

// Server Port
const PORT = process.env.PORT || 5000;
pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch(err => console.error("DB Connection Error ❌", err));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});