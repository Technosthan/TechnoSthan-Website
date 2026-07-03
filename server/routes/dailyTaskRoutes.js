const express = require("express");
const {
  getTodayTaskInstances,
  completeTaskInstance,
} = require("../controllers/dailyTaskController");
const { protect } = require("../middleware/authMiddleware");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

const router = express.Router();

router.use(protect);
router.use(requireWorkspaceFeature("assignmentsEnabled"));

router.get("/today", getTodayTaskInstances);
router.patch("/:id/complete", completeTaskInstance);

module.exports = router;
