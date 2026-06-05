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
  hasPermission,
} = require("../services/workspaceSettingsService");
const User = require("../models/User");

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
          return res.status(400).json({
            success: false,
            message: `Invalid 'accessScope' for ${key}`,
          });
        }
        if (
          val.accessMode !== undefined &&
          !FEATURE_ACCESS_MODES.includes(val.accessMode)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid 'accessMode' for ${key}`,
          });
        }
        if (
          val.allowedRoles !== undefined &&
          !Array.isArray(val.allowedRoles)
        ) {
          return res.status(400).json({
            success: false,
            message: `Invalid 'allowedRoles' for ${key}`,
          });
        }
        if (
          val.allowedUsers !== undefined &&
          !Array.isArray(val.allowedUsers)
        ) {
          return res.status(400).json({
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

exports.getRolePermissions = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const workspaceSettings = await getWorkspaceSettings();
    const normalizedSettings = normalizeWorkspaceSettings(
      workspaceSettings.settings,
    );

    const permissions = BOOLEAN_FEATURE_KEYS.map((key) => {
      const feature = normalizeWorkspaceSettings({})[key]
        ? normalizeWorkspaceSettings({})[key]
        : normalizedSettings[key];

      const entry = normalizedSettings[key] || {};
      const accessScope =
        entry.accessScope || feature?.accessScope || "everyone";
      const allowedRoles = Array.isArray(entry.allowedRoles)
        ? entry.allowedRoles
        : [];

      let roleAllowed = false;
      if (accessScope && accessScope.startsWith("all_")) {
        if (accessScope === "all_hr") roleAllowed = role === "HR";
        else if (accessScope === "all_users") roleAllowed = role === "USER";
        else if (accessScope === "all_admins") roleAllowed = role === "ADMIN";
      } else {
        roleAllowed = allowedRoles.includes(role);
      }

      return {
        key,
        enabled: Boolean(entry.enabled),
        accessScope,
        allowedRoles,
        roleAllowed,
      };
    });

    return res.status(200).json({ success: true, data: permissions });
  } catch (err) {
    console.error("Get role permissions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load role permissions" });
  }
};

exports.updateRolePermissions = async (req, res) => {
  try {
    const role = String(req.params.role || "").toUpperCase();
    const changes = req.body?.permissions || {};
    if (!role || typeof changes !== "object") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const workspaceSettings = await getWorkspaceSettings();
    const current = normalizeWorkspaceSettings(
      workspaceSettings.settings || {},
    );
    const updates = {};

    for (const [key, enabled] of Object.entries(changes)) {
      const existing = normalizeWorkspaceSettings({})[key]
        ? normalizeWorkspaceSettings({})[key]
        : current[key] || {};
      const allowedRoles = Array.isArray(existing.allowedRoles)
        ? [...existing.allowedRoles]
        : [];
      const normalizedRole = role;
      if (enabled) {
        if (!allowedRoles.includes(normalizedRole))
          allowedRoles.push(normalizedRole);
      } else {
        const idx = allowedRoles.indexOf(normalizedRole);
        if (idx !== -1) allowedRoles.splice(idx, 1);
      }
      updates[key] = { ...(current[key] || {}), allowedRoles };
    }

    const updated = await updateWorkspaceSettings(updates, {
      id: req.user?.id,
      name: req.user?.name,
      role: req.user?.role,
    });

    return res
      .status(200)
      .json({
        success: true,
        message: "Role permissions updated",
        data: normalizeWorkspaceSettings(updated.settings),
      });
  } catch (err) {
    console.error("Update role permissions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update role permissions" });
  }
};

exports.getUserPermissions = async (req, res) => {
  try {
    const userId = String(req.params.userId || "").trim();
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });

    const user = await User.findById(userId).lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const workspaceSettings = await getWorkspaceSettings();
    const normalizedSettings = normalizeWorkspaceSettings(
      workspaceSettings.settings || {},
    );

    const access = BOOLEAN_FEATURE_KEYS.reduce((acc, key) => {
      const resolved = resolveWorkspaceFeatureAccess(
        key,
        normalizedSettings,
        user,
      );
      acc[key] = {
        ...resolved.feature,
        allowed: resolved.allowed,
        reason: resolved.reason,
      };
      return acc;
    }, {});

    return res
      .status(200)
      .json({
        success: true,
        data: {
          user: { id: userId, name: user.name, role: user.role },
          access,
        },
      });
  } catch (err) {
    console.error("Get user permissions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to load user permissions" });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const userId = String(req.params.userId || "").trim();
    const changes = req.body?.overrides || {};
    if (!userId || typeof changes !== "object")
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });

    const workspaceSettings = await getWorkspaceSettings();
    const current = normalizeWorkspaceSettings(
      workspaceSettings.settings || {},
    );
    const userOverrides = normalizeUserOverrides(current.userOverrides || []);

    // find or create entry
    let entry = userOverrides.find((e) => String(e.userId) === userId);
    if (!entry) {
      entry = { userId, role: "", permissions: {} };
      userOverrides.push(entry);
    }

    Object.entries(changes).forEach(([key, enabled]) => {
      if (BOOLEAN_FEATURE_KEYS.includes(key) && typeof enabled === "boolean") {
        entry.permissions[key] = enabled;
      }
    });

    // persist
    const updated = await updateWorkspaceSettings(
      { userOverrides },
      { id: req.user?.id, name: req.user?.name, role: req.user?.role },
    );

    return res
      .status(200)
      .json({
        success: true,
        message: "User overrides updated",
        data: normalizeWorkspaceSettings(updated.settings),
      });
  } catch (err) {
    console.error("Update user permissions error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to update user permissions" });
  }
};

exports.getPermissionInsights = async (req, res) => {
  try {
    const workspaceSettings = await getWorkspaceSettings();
    const normalized = normalizeWorkspaceSettings(
      workspaceSettings.settings || {},
    );

    const totalGlobalEnabled = BOOLEAN_FEATURE_KEYS.filter((k) =>
      Boolean(normalized[k]?.enabled),
    ).length;
    const totalGlobalDisabled =
      BOOLEAN_FEATURE_KEYS.length - totalGlobalEnabled;
    const blockedServices = BOOLEAN_FEATURE_KEYS.filter(
      (k) => !Boolean(normalized[k]?.enabled),
    );

    const overrides = (normalized.userOverrides || []).reduce((acc, entry) => {
      Object.keys(entry.permissions || {}).forEach((p) => {
        acc[p] = (acc[p] || 0) + 1;
      });
      return acc;
    }, {});

    const topOverrides = Object.entries(overrides)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([k, v]) => ({ key: k, count: v }));

    return res
      .status(200)
      .json({
        success: true,
        data: {
          totalGlobalEnabled,
          totalGlobalDisabled,
          blockedServices,
          overridesCount: overrides,
          topOverrides,
        },
      });
  } catch (err) {
    console.error("Get permission insights error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to compute insights" });
  }
};
