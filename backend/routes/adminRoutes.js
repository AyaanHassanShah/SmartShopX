const express = require("express");
const router = express.Router();

const { getStats } = require("../controllers/adminController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

// Dashboard stats
router.get("/stats", protect, admin, getStats);

module.exports = router;