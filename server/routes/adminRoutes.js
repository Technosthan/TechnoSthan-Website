const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getWorkspaceSettings,
  getWorkspaceSettingsHistory,
  updateWorkspaceSettings,
} = require("../controllers/workspaceSettingsController");

router.use(protect, admin);

router.get("/workspace-services", getWorkspaceSettings);
router.get("/workspace-services/history", getWorkspaceSettingsHistory);
router.patch("/workspace-services", updateWorkspaceSettings);

module.exports = router;
