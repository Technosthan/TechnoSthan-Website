const User = require("../models/User");
const { ROLES, getRoleVariants, normalizeRole } = require("../constants/rbac");
const {
  resolveWorkspaceFeatureAccess,
} = require("../services/workspaceSettingsService");

const buildSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  isActive: user.isActive,
  avatar: user.avatar || null,
  createdAt: user.createdAt,
});

const buildPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 20, 1),
    200,
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

// GET ALL USERS (Admin Only) with search, filter, pagination
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, isActive } = req.query;

    const filter = {};

    const normalizedRole = role ? normalizeRole(role) : "";
    if (normalizedRole && Object.values(ROLES).includes(normalizedRole)) {
      filter.role = { $in: getRoleVariants(normalizedRole) };
    }

    if (typeof isActive !== "undefined") {
      if (isActive === "true" || isActive === "false") {
        filter.isActive = isActive === "true";
      }
    }

    if (search && String(search).trim()) {
      const q = String(search).trim();
      const regex = new RegExp(q, "i");
      filter.$or = [{ name: regex }, { email: regex }];
    }

    const pagination = buildPagination(req.query);

    const [users, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: users.map(buildSafeUser),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1,
      },
    });
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch users",
    });
  }
};

// UPDATE USER ROLE (Admin Only)
exports.updateUserRole = async (req, res) => {
  try {
    const access = resolveWorkspaceFeatureAccess(
      "allowRoleEditing",
      req.workspaceSettings?.settings,
      req.user,
      { allowAdminBypass: false },
    );
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: "Role editing is currently unavailable for your account",
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    const normalizedRole = normalizeRole(role);

    if (!Object.values(ROLES).includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: "Invalid role" });
    }

    // Prevent self-demotion
    if (userId === req.user.id && normalizedRole !== ROLES.ADMIN) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own admin role",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role: normalizedRole },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Emit socket event to admins
    try {
      const io = req.app.get("io");
      if (io) io.to("admins").emit("user_updated", buildSafeUser(user));
    } catch (e) {
      console.error("Socket emit error (user role update):", e.message);
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ROLE_CHANGED",
          module: "Users",
          description: `Role changed for ${user.email} -> ${normalizedRole}`,
          entityId: user._id?.toString(),
          entityType: "User",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: `User role updated to ${normalizedRole}`,
      data: buildSafeUser(user),
    });
  } catch (err) {
    console.error("Update user role error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE USER STATUS (suspend/reactivate)
exports.updateUserStatus = async (req, res) => {
  try {
    const access = resolveWorkspaceFeatureAccess(
      "allowUserSuspension",
      req.workspaceSettings?.settings,
      req.user,
      { allowAdminBypass: false },
    );
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: "User suspension is currently unavailable for your account",
      });
    }

    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res
        .status(400)
        .json({ success: false, message: "isActive must be boolean" });
    }

    // Prevent self-deactivation
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot change your own active status",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    try {
      const io = req.app.get("io");
      if (io) io.to("admins").emit("user_updated", buildSafeUser(user));
    } catch (e) {
      console.error("Socket emit error (user status update):", e.message);
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: isActive ? "USER_REACTIVATED" : "USER_SUSPENDED",
          module: "Users",
          description: `${isActive ? "Reactivated" : "Suspended"} user ${user.email}`,
          entityId: user._id?.toString(),
          entityType: "User",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "reactivated" : "suspended"}`,
      data: buildSafeUser(user),
    });
  } catch (err) {
    console.error("Update user status error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE USER (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    const access = resolveWorkspaceFeatureAccess(
      "allowAccountDeletion",
      req.workspaceSettings?.settings,
      req.user,
      { allowAdminBypass: false },
    );
    if (!access.allowed) {
      return res.status(403).json({
        success: false,
        message: "Account deletion is currently unavailable for your account",
      });
    }

    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    try {
      const io = req.app.get("io");
      if (io) io.to("admins").emit("user_deleted", { id: userId });
    } catch (e) {
      console.error("Socket emit error (user delete):", e.message);
    }

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "USER_DELETED",
          module: "Users",
          description: `User deleted: ${user.email}`,
          entityId: userId,
          entityType: "User",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// GET analytics for users (counts by role + total)
exports.getUserAnalytics = async (req, res) => {
  try {
    const [total, admins, hrs, users] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: { $in: getRoleVariants(ROLES.ADMIN) } }),
      User.countDocuments({ role: { $in: getRoleVariants(ROLES.HR) } }),
      User.countDocuments({ role: { $in: getRoleVariants(ROLES.USER) } }),
    ]);

    return res.status(200).json({
      success: true,
      data: { total, admins, hrs, users },
    });
  } catch (err) {
    console.error("Get user analytics error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to fetch user analytics" });
  }
};
