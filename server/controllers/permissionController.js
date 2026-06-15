const GlobalService = require("../models/GlobalService");
const RolePermission = require("../models/RolePermission");
const UserPermissionOverride = require("../models/UserPermissionOverride");
const User = require("../models/User");
const { ROLES } = require("../constants/rbac");
const {
  hasPermission,
  clearCache,
  getAllUserPermissions,
} = require("../services/permissionService");

/**
 * GLOBAL SERVICES ENDPOINTS
 */

// Get all global services
const getGlobalServices = async (req, res) => {
  try {
    const services = await GlobalService.find().lean();
    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch global services",
      error: error.message,
    });
  }
};

// Update global service
const updateGlobalService = async (req, res) => {
  try {
    const { serviceKey, enabled, reason } = req.body;

    if (!serviceKey || enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: "serviceKey and enabled are required",
      });
    }

    const service = await GlobalService.findOneAndUpdate(
      { serviceKey: serviceKey.toLowerCase() },
      {
        enabled,
        updatedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        $push: {
          history: {
            changedAt: new Date(),
            changedBy: {
              id: req.user._id,
              name: req.user.name,
              email: req.user.email,
            },
            previousValue: undefined,
            newValue: enabled,
          },
        },
      },
      { new: true },
    );

    clearCache();

    res.json({
      success: true,
      message: `Global service '${serviceKey}' updated`,
      data: service,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update global service",
      error: error.message,
    });
  }
};

/**
 * ROLE PERMISSIONS ENDPOINTS
 */

// Get role permissions
const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.query;

    let query = {};
    if (role) {
      query.role = role.toUpperCase();
    }

    const permissions = await RolePermission.find(query).lean();

    // Group by category
    const grouped = {};
    permissions.forEach((perm) => {
      if (!grouped[perm.category]) {
        grouped[perm.category] = [];
      }
      grouped[perm.category].push(perm);
    });

    res.json({
      success: true,
      data: permissions,
      grouped,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch role permissions",
      error: error.message,
    });
  }
};

// Update role permission
const updateRolePermission = async (req, res) => {
  try {
    const { role, permissionKey, enabled } = req.body;

    if (!role || !permissionKey || enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: "role, permissionKey, and enabled are required",
      });
    }

    const permission = await RolePermission.findOneAndUpdate(
      { role: role.toUpperCase(), permissionKey: permissionKey.toLowerCase() },
      {
        enabled,
        updatedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        $push: {
          history: {
            changedAt: new Date(),
            changedBy: {
              id: req.user._id,
              name: req.user.name,
              email: req.user.email,
            },
            previousValue: undefined,
            newValue: enabled,
          },
        },
      },
      { new: true },
    );

    clearCache();

    res.json({
      success: true,
      message: `Permission updated for ${role} role`,
      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update role permission",
      error: error.message,
    });
  }
};

/**
 * USER OVERRIDE ENDPOINTS
 */

// Get user permission overrides
const getUserOverrides = async (req, res) => {
  try {
    const { userId, role } = req.query;

    let query = {};
    if (userId) {
      query.userId = userId;
    }
    if (role) {
      query.userRole = role.toUpperCase();
    }

    let overrides = await UserPermissionOverride.find(query).lean();

    // ADMIN ENFORCEMENT: If fetching overrides for an admin user,
    // ensure all permissions are shown as enabled
    if (userId) {
      const targetUser = await User.findById(userId).lean();
      if (targetUser && targetUser.role === ROLES.ADMIN) {
        // For admin users, all overrides should show enabled: true
        overrides = overrides.map((override) => ({
          ...override,
          enabled: true,
          source: "admin_always_enabled",
        }));
      }
    }

    res.json({
      success: true,
      data: overrides,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user overrides",
      error: error.message,
    });
  }
};

// Set user permission override
const setUserOverride = async (req, res) => {
  try {
    const { userId, permissionKey, enabled, reason, expiresAt } = req.body;

    if (!userId || !permissionKey || enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: "userId, permissionKey, and enabled are required",
      });
    }

    // Get user for context
    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ADMIN ENFORCEMENT: Prevent modifying permissions for admin users
    if (targetUser.role === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message:
          "Cannot modify permissions for admin users. Admin users always have all permissions enabled.",
      });
    }

    const override = await UserPermissionOverride.findOneAndUpdate(
      { userId, permissionKey: permissionKey.toLowerCase() },
      {
        userId,
        userEmail: targetUser.email,
        userName: targetUser.name,
        userRole: targetUser.role,
        permissionKey: permissionKey.toLowerCase(),
        enabled,
        reason: reason || "",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        updatedBy: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
      },
      { upsert: true, new: true },
    );

    clearCache();

    res.json({
      success: true,
      message: `Permission override set for ${targetUser.name}`,
      data: override,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to set user override",
      error: error.message,
    });
  }
};

// Remove user permission override
const removeUserOverride = async (req, res) => {
  try {
    const { userId, permissionKey } = req.body;

    if (!userId || !permissionKey) {
      return res.status(400).json({
        success: false,
        message: "userId and permissionKey are required",
      });
    }

    // Get user for context
    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ADMIN ENFORCEMENT: Prevent removing overrides for admin users
    if (targetUser.role === ROLES.ADMIN) {
      return res.status(403).json({
        success: false,
        message:
          "Cannot remove permissions for admin users. Admin users always have all permissions enabled.",
      });
    }

    await UserPermissionOverride.findOneAndDelete({
      userId,
      permissionKey: permissionKey.toLowerCase(),
    });

    clearCache();

    res.json({
      success: true,
      message: "User override removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove user override",
      error: error.message,
    });
  }
};

/**
 * CHECK PERMISSION ENDPOINT (for frontend)
 */

// Check if user has permission
const checkPermission = async (req, res) => {
  try {
    const { permissionKey } = req.query;

    if (!permissionKey) {
      return res.status(400).json({
        success: false,
        message: "permissionKey is required",
      });
    }

    const result = await hasPermission(req.user, permissionKey);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to check permission",
      error: error.message,
    });
  }
};

// Get all user permissions
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.query;

    let user;
    if (userId) {
      user = await User.findById(userId).lean();
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
    } else {
      user = req.user;
    }

    const permissions = await getAllUserPermissions(user);

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user permissions",
      error: error.message,
    });
  }
};

module.exports = {
  // Global Services
  getGlobalServices,
  updateGlobalService,

  // Role Permissions
  getRolePermissions,
  updateRolePermission,

  // User Overrides
  getUserOverrides,
  setUserOverride,
  removeUserOverride,

  // Permission checks
  checkPermission,
  getUserPermissions,
};
