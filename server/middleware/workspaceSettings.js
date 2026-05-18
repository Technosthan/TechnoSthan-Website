const {
  getWorkspaceSettings,
} = require("../services/workspaceSettingsService");

const loadWorkspaceSettings = async (req, res, next) => {
  try {
    req.workspaceSettings = await getWorkspaceSettings();
    return next();
  } catch (error) {
    console.error("Workspace settings load error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace settings",
    });
  }
};

const requireWorkspaceFeature = (featureKey) => (req, res, next) => {
  const settings = req.workspaceSettings?.settings || {};
  if (!settings[featureKey]) {
    return res.status(403).json({
      success: false,
      message: `Workspace feature '${featureKey}' is currently disabled`,
    });
  }

  return next();
};

const requireAnyWorkspaceFeatures = (featureKeys) => (req, res, next) => {
  const settings = req.workspaceSettings?.settings || {};
  const enabled = featureKeys.some((key) => settings[key]);
  if (!enabled) {
    return res.status(403).json({
      success: false,
      message: `Required workspace feature(s) are currently disabled`,
    });
  }
  return next();
};

module.exports = {
  loadWorkspaceSettings,
  requireWorkspaceFeature,
  requireAnyWorkspaceFeatures,
};
