const {
  getWorkspaceSettings,
  resolveWorkspaceFeatureAccess,
} = require("../services/workspaceSettingsService");
const mongoose = require("mongoose");
const Assignment = require("../models/Assignment");
const { ROLES, normalizeRole } = require("../constants/rbac");

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

const canSubmitOwnedAssignment = async (req) => {
  if (
    req.method !== "PATCH" ||
    !req.params?.id ||
    !mongoose.Types.ObjectId.isValid(req.params.id)
  ) {
    return false;
  }

  const assignment = await Assignment.findById(
    req.params.id,
    "assignedTo",
  ).lean();
  if (!assignment) {
    return false;
  }

  const userRole = normalizeRole(req.user?.role);
  const isOwner =
    assignment.assignedTo?.toString() === req.user?.id?.toString();
  const isAdmin = userRole === ROLES.ADMIN;

  console.log(req.user.role);
  console.log(req.user.id);
  console.log(assignment.assignedTo);

  return isOwner || isAdmin;
};

const requireWorkspaceFeature = (featureKey) => async (req, res, next) => {
  const settings = req.workspaceSettings?.settings || {};
  const access = resolveWorkspaceFeatureAccess(featureKey, settings, req.user);
  const { feature } = access;
  const moduleKey = feature?.family || null;

  console.log("Role:", normalizeRole(req.user?.role));
  console.log("Feature:", featureKey);
  console.log("Module:", moduleKey);
  console.log("Permission:", access);
  console.log("featureKey:", featureKey);
  console.log("moduleKey:", moduleKey);
  console.log("workspace permission result:", access);

  if (
    featureKey === "usersCanSubmitAssignments" &&
    (await canSubmitOwnedAssignment(req))
  ) {
    return next();
  }

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
