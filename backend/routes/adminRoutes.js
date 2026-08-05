const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getWorkspaceSettings,
  getWorkspaceSettingsHistory,
  restoreWorkspaceSettingsDefaults,
  updateWorkspaceSettings,
  getSessionTimeoutSettings,
  updateSessionTimeoutSettings,
  getRolePermissions,
  updateRolePermissions,
  getUserPermissions,
  updateUserPermissions,
  getPermissionInsights,
} = require("../controllers/workspaceSettingsController");
const {
  getUsers,
  sendTestEmail,
  getEmailSettings,
} = require("../controllers/adminController");
const { getActivityLogs } = require("../controllers/activityLogController");
const {
  getMenuDashboard,
  getMenuDashboardStats,
  createMenuDashboard,
  updateMenuDashboard,
  deleteMenuDashboard,
} = require("../controllers/menuDashboardController");

router.use(protect, admin);

router.get("/workspace-services", getWorkspaceSettings);
router.get("/workspace-services/history", getWorkspaceSettingsHistory);
router.post(
  "/workspace-services/restore-defaults",
  restoreWorkspaceSettingsDefaults,
);
router.patch("/workspace-services", updateWorkspaceSettings);
router.get("/settings/session-timeout", getSessionTimeoutSettings);
router.patch("/settings/session-timeout", updateSessionTimeoutSettings);
router.get("/workspace-services/roles/:role", getRolePermissions);
router.patch("/workspace-services/roles/:role", updateRolePermissions);
router.get("/workspace-services/users/:userId", getUserPermissions);
router.patch("/workspace-services/users/:userId", updateUserPermissions);
router.get("/workspace-services/insights", getPermissionInsights);
router.post("/test-email", sendTestEmail);
router.get("/settings/email", getEmailSettings);
router.get("/users", getUsers);
router.get("/activity-logs", getActivityLogs);
router.get("/menu-dashboards/:menuId/stats", getMenuDashboardStats);
router.get("/menu-dashboards/:menuId", getMenuDashboard);
router.post("/menu-dashboards", createMenuDashboard);
router.put("/menu-dashboards/:id", updateMenuDashboard);
router.delete("/menu-dashboards/:id", deleteMenuDashboard);

module.exports = router;
