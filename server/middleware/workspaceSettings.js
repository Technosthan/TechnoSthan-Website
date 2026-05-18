const {
  getWorkspaceSettings,
  resolveWorkspaceFeatureAccess,
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
  const access = resolveWorkspaceFeatureAccess(featureKey, settings, req.user);
  const { feature } = access;

  if (!access.allowed && access.reason === "disabled") {
    return res.status(403).json({
      success: false,
      message: `Workspace feature '${featureKey}' is currently disabled`,
    });
  }

  // Everyone is allowed when accessScope is 'everyone'
  if (access.allowed) return next();

  if (access.reason === "authentication_required") {
    return res.status(403).json({
      success: false,
      message: `Workspace feature '${featureKey}' requires additional permissions`,
    });
  }

  return res.status(403).json({
    success: false,
    message:
      String(feature.accessScope || "").startsWith("specific_")
        ? "You are not authorized for this workspace feature"
        : "Insufficient role for this workspace feature",
  });
};

const requireAnyWorkspaceFeatures = (featureKeys) => (req, res, next) => {
  const settings = req.workspaceSettings?.settings || {};
  for (const key of featureKeys) {
    const access = resolveWorkspaceFeatureAccess(key, settings, req.user);
    if (access.allowed) return next();
  }

  return res.status(403).json({
    success: false,
    message: `Required workspace feature(s) are currently disabled or unavailable for your account`,
  });
};

module.exports = {
  loadWorkspaceSettings,
  requireWorkspaceFeature,
  requireAnyWorkspaceFeatures,
};
