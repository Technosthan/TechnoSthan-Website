const {
  buildDefaultWorkspaceSettings,
  getWorkspaceSettings,
  getPublicSettings,
  normalizeWorkspaceSettings,
  BOOLEAN_FEATURE_KEYS,
  FEATURE_DEFINITIONS,
  FEATURE_SCOPE_OPTIONS,
  FEATURE_FAMILIES,
  resolveWorkspaceFeatureAccess,
  updateWorkspaceSettings,
  FEATURE_ACCESS_MODES,
  normalizeUserOverrides,
} = require("../services/workspaceSettingsService");

exports.getWorkspaceSettings = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    return res.status(200).json({
      success: true,
      data: normalizeWorkspaceSettings(workspaceSettings.settings),
      meta: {
        updatedBy: workspaceSettings.updatedBy,
        updatedAt: workspaceSettings.updatedAt,
      },
    });
  } catch (err) {
    console.error("Get workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace settings",
    });
  }
};

exports.getWorkspaceSettingsHistory = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    return res.status(200).json({
      success: true,
      data: workspaceSettings.history || [],
    });
  } catch (err) {
    console.error("Get workspace settings history error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace settings history",
    });
  }
};

exports.updateWorkspaceSettings = async (req, res) => {
  try {
    const updates = req.body || {};

    // Validate structured feature objects for known keys
    for (const key of Object.keys(updates)) {
      const val = updates[key];
      if (key === "userOverrides") {
        if (!Array.isArray(val)) {
          return res.status(400).json({
            success: false,
            message: "Invalid 'userOverrides' payload",
          });
        }
        updates.userOverrides = normalizeUserOverrides(val);
        continue;
      }
      if (val && typeof val === "object") {
        // ensure enabled is boolean if present
        if (val.enabled !== undefined && typeof val.enabled !== "boolean") {
          return res
            .status(400)
            .json({ success: false, message: `Invalid 'enabled' for ${key}` });
        }
        if (
          val.accessScope !== undefined &&
          !FEATURE_ACCESS_MODES.includes(val.accessScope)
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid 'accessScope' for ${key}`,
            });
        }
        if (
          val.accessMode !== undefined &&
          !FEATURE_ACCESS_MODES.includes(val.accessMode)
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid 'accessMode' for ${key}`,
            });
        }
        if (
          val.allowedRoles !== undefined &&
          !Array.isArray(val.allowedRoles)
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid 'allowedRoles' for ${key}`,
            });
        }
        if (
          val.allowedUsers !== undefined &&
          !Array.isArray(val.allowedUsers)
        ) {
          return res
            .status(400)
            .json({
              success: false,
              message: `Invalid 'allowedUsers' for ${key}`,
            });
        }
        // sanitize arrays to strings
        if (Array.isArray(val.allowedRoles))
          updates[key].allowedRoles = val.allowedRoles.map(String);
        if (Array.isArray(val.allowedUsers))
          updates[key].allowedUsers = val.allowedUsers.map(String);
      }
      // if boolean or other scalar, it's ok (backwards-compatible)
    }
    const workspaceSettings = await updateWorkspaceSettings(updates, {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    });

    return res.status(200).json({
      success: true,
      message: "Workspace settings updated successfully",
      data: normalizeWorkspaceSettings(workspaceSettings.settings),
      meta: {
        updatedBy: workspaceSettings.updatedBy,
        updatedAt: workspaceSettings.updatedAt,
      },
    });
  } catch (err) {
    console.error("Update workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to update workspace settings",
    });
  }
};

exports.restoreWorkspaceSettingsDefaults = async (req, res) => {
  try {
    const workspaceSettings = await updateWorkspaceSettings(
      buildDefaultWorkspaceSettings(),
      {
        id: req.user?.id,
        name: req.user?.name,
        role: req.user?.role,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Workspace defaults restored successfully",
      data: normalizeWorkspaceSettings(workspaceSettings.settings),
      meta: {
        updatedBy: workspaceSettings.updatedBy,
        updatedAt: workspaceSettings.updatedAt,
      },
    });
  } catch (err) {
    console.error("Restore workspace settings defaults error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to restore workspace defaults",
    });
  }
};

exports.getPublicWorkspaceSettings = async (req, res) => {
  try {
    const settings = await getPublicSettings();
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (err) {
    console.error("Get public workspace settings error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load public workspace settings",
    });
  }
};

exports.getWorkspaceAccessOverview = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    const normalizedSettings = normalizeWorkspaceSettings(
      workspaceSettings.settings,
    );
    const access = BOOLEAN_FEATURE_KEYS.reduce((acc, key) => {
      const resolved = resolveWorkspaceFeatureAccess(
        key,
        normalizedSettings,
        req.user,
      );
      acc[key] = {
        ...resolved.feature,
        allowed: resolved.allowed,
        reason: resolved.reason,
      };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      data: {
        settings: normalizedSettings,
        access,
        user: req.user || null,
        definitions: FEATURE_DEFINITIONS,
        scopeOptions: FEATURE_SCOPE_OPTIONS,
        featureFamilies: FEATURE_FAMILIES,
      },
    });
  } catch (err) {
    console.error("Get workspace access overview error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to load workspace access",
    });
  }
};
