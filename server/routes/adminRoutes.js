const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getWorkspaceSettings,
  getWorkspaceSettingsHistory,
  restoreWorkspaceSettingsDefaults,
  updateWorkspaceSettings,
} = require("../controllers/workspaceSettingsController");
const { getUsers } = require("../controllers/adminController");

router.use(protect, admin);

router.get("/workspace-services", getWorkspaceSettings);
router.get("/workspace-services/history", getWorkspaceSettingsHistory);
router.post("/workspace-services/restore-defaults", restoreWorkspaceSettingsDefaults);
router.patch("/workspace-services", updateWorkspaceSettings);
router.get("/users", getUsers);

module.exports = router;
