const express = require("express");
const router = express.Router();
const { optionalAuth } = require("../middleware/authMiddleware");
const {
  getPublicWorkspaceSettings,
  getWorkspaceAccessOverview,
  getSessionTimeoutSettings,
} = require("../controllers/workspaceSettingsController");

router.get("/", getPublicWorkspaceSettings);
router.get("/session-timeout", getSessionTimeoutSettings);
router.get("/access", optionalAuth, getWorkspaceAccessOverview);

module.exports = router;
