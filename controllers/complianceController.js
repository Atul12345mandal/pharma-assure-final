const pool = require("../config/db");

// GET all compliance records
const getComplianceData = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM compliance;");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// ADD new compliance record
const addComplianceData = async (req, res) => {
  try {
    const { name, status } = req.body;
    const result = await pool.query(
      "INSERT INTO compliance (name, status) VALUES ($1, $2) RETURNING *;",
      [name, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { getComplianceData, addComplianceData };