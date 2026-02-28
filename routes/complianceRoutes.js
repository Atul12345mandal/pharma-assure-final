// routes/complianceRoutes.js
const express = require("express");
const router = express.Router();
const { getComplianceData, addComplianceData } = require("../controllers/complianceController");

// Route to get all compliance data
router.get("/", getComplianceData);

// Route to add a new compliance record
router.post("/", addComplianceData);

module.exports = router;