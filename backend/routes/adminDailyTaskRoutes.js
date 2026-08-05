const express = require("express");
const {
  createTaskTemplate,
  getTaskTemplates,
  getTaskTemplate,
  updateTaskTemplate,
  toggleTaskTemplateActive,
  deleteTaskTemplate,
  getDailyTaskReport,
} = require("../controllers/dailyTaskController");
const { protect, admin } = require("../middleware/authMiddleware");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

const router = express.Router();

router.use(protect, admin);
router.use(requireWorkspaceFeature("assignmentsEnabled"));

router.get("/daily-task-templates", getTaskTemplates);
router.post("/daily-task-templates", createTaskTemplate);
router.get("/daily-task-templates/:id", getTaskTemplate);
router.put("/daily-task-templates/:id", updateTaskTemplate);
router.patch("/daily-task-templates/:id", updateTaskTemplate);
router.delete("/daily-task-templates/:id", deleteTaskTemplate);
router.patch(
  "/daily-task-templates/:id/toggle-active",
  toggleTaskTemplateActive,
);
router.get("/daily-task-report", getDailyTaskReport);

module.exports = router;
