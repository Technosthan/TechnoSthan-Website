const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
  updateInsightStatus,
} = require("../controllers/insightController");

const router = express.Router();

router.get("/", getInsights);
router.get("/:slug", getInsightBySlug);

router.post("/admin", protect, admin, createInsight);
router.put("/admin/:id", protect, admin, updateInsight);
router.delete("/admin/:id", protect, admin, deleteInsight);
router.patch("/admin/:id/status", protect, admin, updateInsightStatus);

module.exports = router;

