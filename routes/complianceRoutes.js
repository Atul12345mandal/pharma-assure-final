const express = require("express");
const router = express.Router();
const { getComplianceData, addComplianceData } = require("../controllers/complianceController");
const { protect } = require("../middleware/authMiddleware"); // <- import

// Protect routes so only logged-in users can access
router.get("/", protect, getComplianceData);
router.post("/", protect, addComplianceData);

module.exports = router;