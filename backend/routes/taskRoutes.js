const express = require("express");
const {
  createTaskTemplate,
  getTaskTemplates,
  getTaskTemplate,
  updateTaskTemplate,
  toggleTaskTemplateActive,
  deleteTaskTemplate,
  getTaskInstances,
  completeTaskInstance,
  addTaskInstanceRemark,
  getTaskInstanceHistory,
  getTodayTaskInstances,
  getTaskAnalytics,
  ensureTodayTaskInstances,
} = require("../controllers/dailyTaskController");
const { protect, hrOrAdmin } = require("../middleware/authMiddleware");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

const router = express.Router();

router.use(protect);
router.use(requireWorkspaceFeature("assignmentsEnabled"));

// Template endpoints
router.get("/templates", hrOrAdmin, getTaskTemplates);
router.post("/templates", hrOrAdmin, createTaskTemplate);
router.get("/templates/:id", hrOrAdmin, getTaskTemplate);
router.patch("/templates/:id", hrOrAdmin, updateTaskTemplate);
router.patch(
  "/templates/:id/toggle-active",
  hrOrAdmin,
  toggleTaskTemplateActive,
);
router.delete("/templates/:id", hrOrAdmin, deleteTaskTemplate);

// Task instance endpoints
router.get("/instances", getTaskInstances);
router.get("/instances/today", getTodayTaskInstances);
router.get("/instances/history", getTaskInstanceHistory);
router.patch("/instances/:id/complete", completeTaskInstance);
router.patch("/instances/:id/remark", addTaskInstanceRemark);
router.post("/instances/ensure-today", hrOrAdmin, ensureTodayTaskInstances);

// Analytics
router.get("/analytics", hrOrAdmin, getTaskAnalytics);

module.exports = router;
