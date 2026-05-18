const express = require("express");
const router = express.Router();
const {
  getPublicWorkspaceSettings,
} = require("../controllers/workspaceSettingsController");

router.get("/", getPublicWorkspaceSettings);

module.exports = router;
