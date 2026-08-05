const GlobalService = require("../models/GlobalService");
const RolePermission = require("../models/RolePermission");
const UserPermissionOverride = require("../models/UserPermissionOverride");
const { normalizeRole, ROLES } = require("../constants/rbac");

/**
 * CENTRALIZED PERMISSION RESOLVER
 * Single source of truth for all permission checks
 *
 * Resolution order:
 * 1. Global Service (if disabled, ALWAYS blocked)
 * 2. User Override (specific user override)
 * 3. Role Permission (role default)
 *
 * Result: true (allowed) / false (denied)
 */

// Cache for better performance
const cache = {
  globalServices: new Map(),
  rolePermissions: new Map(),
  userOverrides: new Map(),
};

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get global service status
 * If globally disabled, permission is ALWAYS blocked
 */
const getGlobalService = async (serviceKey) => {
  const cacheKey = `gs_${serviceKey}`;

  if (cache.globalServices.has(cacheKey)) {
    const cached = cache.globalServices.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const service = await GlobalService.findOne({
      serviceKey: serviceKey.toLowerCase(),
    });

    const data = service ? service.toObject() : null;
    cache.globalServices.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Error fetching global service:", error);
    return null;
  }
};

/**
 * Get role permission
 * Fallback source if no user override
 */
const getRolePermission = async (role, permissionKey) => {
  const normalizedRole = normalizeRole(role);
  const cacheKey = `rp_${normalizedRole}_${permissionKey}`;

  if (cache.rolePermissions.has(cacheKey)) {
    const cached = cache.rolePermissions.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const permission = await RolePermission.findOne({
      role: normalizedRole,
      permissionKey: permissionKey.toLowerCase(),
    });

    const data = permission ? permission.toObject() : null;
    cache.rolePermissions.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Error fetching role permission:", error);
    return null;
  }
};

/**
 * Get user-specific override
 * Highest priority (overrides role default)
 */
const getUserOverride = async (userId, permissionKey) => {
  const cacheKey = `uo_${userId}_${permissionKey}`;

  if (cache.userOverrides.has(cacheKey)) {
    const cached = cache.userOverrides.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const override = await UserPermissionOverride.findOne({
      userId,
      permissionKey: permissionKey.toLowerCase(),
    });

    // Filter out expired overrides
    if (override && override.expiresAt && override.expiresAt < new Date()) {
      return null;
    }

    const data = override ? override.toObject() : null;
    cache.userOverrides.set(cacheKey, { data, timestamp: Date.now() });
    return data;
  } catch (error) {
    console.error("Error fetching user override:", error);
    return null;
  }
};

/**
 * MAIN RESOLVER: Check if user has permission
 *
 * Resolution steps:
 * 0. ADMIN ENFORCEMENT: If user is admin, always allow all permissions
 * 1. Check global service disabled → return false
 * 2. Check user override → if exists, use it
 * 3. Fall back to role permission → return true/false
 * 4. If no role permission found → return false (secure default)
 */
const hasPermission = async (user, permissionKey) => {
  if (!user || !permissionKey) {
    return false;
  }

  const userId = user._id || user.id;
  const userRole = normalizeRole(user.role);
  const normalizedPermissionKey = permissionKey.toLowerCase().trim();

  try {
    // Step 0: ADMIN ENFORCEMENT
    // Admin users always have all permissions enabled
    if (userRole === ROLES.ADMIN) {
      return {
        allowed: true,
        source: "admin_always_enabled",
        reason: "Admin users always have all permissions enabled.",
      };
    }

    // Step 1: Check global service
    // Try to infer service key from permission key
    const serviceKey = inferServiceKey(normalizedPermissionKey);
    if (serviceKey) {
      const globalService = await getGlobalService(serviceKey);
      if (globalService && !globalService.enabled) {
        // Global service is disabled - permission denied
        return {
          allowed: false,
          source: "global_service_disabled",
          reason: `The ${globalService.name} service is disabled for this workspace.`,
        };
      }
    }

    // Step 2: Check user override
    const userOverride = await getUserOverride(userId, normalizedPermissionKey);
    if (userOverride && userOverride.enabled !== null) {
      // User override exists - use it
      return {
        allowed: userOverride.enabled,
        source: "user_override",
        reason: userOverride.reason || "User-specific override applied",
      };
    }

    // Step 3: Fall back to role permission
    const rolePermission = await getRolePermission(
      userRole,
      normalizedPermissionKey,
    );
    if (rolePermission) {
      return {
        allowed: rolePermission.enabled,
        source: "role_permission",
        reason: `Based on ${userRole} role permissions`,
      };
    }

    // Step 4: No permission found - deny
    return {
      allowed: false,
      source: "not_found",
      reason: `Permission '${normalizedPermissionKey}' is not configured for ${userRole} role.`,
    };
  } catch (error) {
    console.error("Permission resolver error:", error);
    // Fail secure - deny on error
    return {
      allowed: false,
      source: "error",
      reason: "Permission check failed. Access denied for safety.",
    };
  }
};

/**
 * Infer service key from permission key
 * Maps permissions to their parent services
 */
const inferServiceKey = (permissionKey) => {
  const mappings = {
    submit_work: "assignments",
    upload_files: "file_attachments",
    create_assignments: "assignments",
    edit_assignments: "assignments",
    delete_assignments: "assignments",
    review_submissions: "reviews",
    add_feedback: "reviews",
    extend_deadlines: "deadline_extensions",
    manage_revisions: "revisions",
    view_analytics: "analytics",
    post_to_social: "social_posting",
    schedule_posts: "social_posting",
  };

  return mappings[permissionKey] || null;
};

/**
 * Get all permissions for a user (useful for frontend caching)
 */
const getAllUserPermissions = async (user) => {
  if (!user) return {};

  const userId = user._id || user.id;
  const userRole = normalizeRole(user.role);

  try {
    // Get all role permissions for this role
    const rolePerms = await RolePermission.find({
      role: userRole,
    });

    // Get all user overrides for this user
    const userOverrides = await UserPermissionOverride.find({
      userId,
    });

    const permissions = {};

    // Build permission map
    rolePerms.forEach((perm) => {
      permissions[perm.permissionKey] = {
        allowed: perm.enabled,
        source: "role_permission",
        category: perm.category,
      };
    });

    // ADMIN ENFORCEMENT: If user is admin, all permissions must be enabled
    if (userRole === ROLES.ADMIN) {
      const allPermissionKeys =
        RolePermission.schema.path("permissionKey").enumValues || [];
      const permissionDocs = rolePerms.reduce((acc, perm) => {
        acc[perm.permissionKey] = perm;
        return acc;
      }, {});

      allPermissionKeys.forEach((permissionKey) => {
        const perm = permissionDocs[permissionKey];
        permissions[permissionKey] = {
          allowed: true,
          source: "admin_always_enabled",
          category: perm?.category || "assignments",
          reason: "Admin users always have all permissions enabled.",
        };
      });

      // Return early for admin users - skip overrides and global service checks
      return permissions;
    }

    // Apply user overrides (non-admin users only)
    userOverrides.forEach((override) => {
      if (override.enabled !== null) {
        permissions[override.permissionKey] = {
          allowed: override.enabled,
          source: "user_override",
          reason: override.reason,
        };
      }
    });

    // Enforce global service state after overrides and role defaults.
    await Promise.all(
      Object.keys(permissions).map(async (permissionKey) => {
        const serviceKey = inferServiceKey(permissionKey);
        if (!serviceKey) {
          return;
        }

        const globalService = await getGlobalService(serviceKey);
        if (globalService && !globalService.enabled) {
          permissions[permissionKey] = {
            allowed: false,
            source: "global_service_disabled",
            reason: `${globalService.name} is disabled for this workspace.`,
            category: permissions[permissionKey].category,
          };
        }
      }),
    );

    return permissions;
  } catch (error) {
    console.error("Error fetching all permissions:", error);
    return {};
  }
};

/**
 * Clear permission cache
 * Call after making permission changes
 */
const clearCache = () => {
  cache.globalServices.clear();
  cache.rolePermissions.clear();
  cache.userOverrides.clear();
};

const DEFAULT_GLOBAL_SERVICES = [
  {
    serviceKey: "assignments",
    name: "Assignments",
    description: "Assignment creation, submission, and review workflows.",
    enabled: true,
    defaultEnabled: true,
    category: "assignments",
  },
  {
    serviceKey: "reviews",
    name: "Reviews",
    description: "Review and feedback workflows for assignment submissions.",
    enabled: true,
    defaultEnabled: true,
    category: "assignments",
  },
  {
    serviceKey: "file_attachments",
    name: "File Attachments",
    description: "Upload and attach files to assignments.",
    enabled: true,
    defaultEnabled: true,
    category: "assignments",
  },
  {
    serviceKey: "deadline_extensions",
    name: "Deadline Extensions",
    description: "Allow deadline extensions for assignments.",
    enabled: true,
    defaultEnabled: true,
    category: "assignments",
  },
  {
    serviceKey: "revisions",
    name: "Revisions",
    description: "Revision management for assignment submissions.",
    enabled: true,
    defaultEnabled: true,
    category: "assignments",
  },
  {
    serviceKey: "analytics",
    name: "Analytics",
    description: "Analytics dashboard and reporting access.",
    enabled: true,
    defaultEnabled: true,
    category: "analytics",
  },
  {
    serviceKey: "social_posting",
    name: "Social Posting",
    description: "Social media posting and scheduling features.",
    enabled: true,
    defaultEnabled: true,
    category: "social",
  },
];

const initializeDefaultGlobalServices = async () => {
  for (const service of DEFAULT_GLOBAL_SERVICES) {
    await GlobalService.updateOne({ serviceKey: service.serviceKey }, service, {
      upsert: true,
    });
  }
};

/**
 * Initialize default permissions (runs on startup)
 * Sets up HR, USER, and ADMIN default permissions
 */
const initializeDefaultPermissions = async () => {
  try {
    const hrPermissions = [
      {
        role: "HR",
        permissionKey: "create_assignments",
        name: "Create Assignments",
        description: "Create new assignments for users",
        enabled: true,
        category: "assignments",
      },
      {
        role: "HR",
        permissionKey: "edit_assignments",
        name: "Edit Assignments",
        description: "Edit existing assignments",
        enabled: true,
        category: "assignments",
      },
      {
        role: "HR",
        permissionKey: "delete_assignments",
        name: "Delete Assignments",
        description: "Delete assignments",
        enabled: true,
        category: "assignments",
      },
      {
        role: "HR",
        permissionKey: "submit_work",
        name: "Submit Work",
        description: "Submit assignments",
        enabled: true,
        category: "submissions",
      },
      {
        role: "HR",
        permissionKey: "upload_files",
        name: "Upload Files",
        description: "Upload files with assignments",
        enabled: true,
        category: "submissions",
      },
      {
        role: "HR",
        permissionKey: "review_submissions",
        name: "Review Submissions",
        description: "Review user submissions",
        enabled: true,
        category: "reviews",
      },
      {
        role: "HR",
        permissionKey: "add_feedback",
        name: "Add Feedback",
        description: "Add feedback to submissions",
        enabled: true,
        category: "reviews",
      },
    ];

    const userPermissions = [
      {
        role: "USER",
        permissionKey: "submit_work",
        name: "Submit Work",
        description: "Submit assignments",
        enabled: true,
        category: "submissions",
      },
      {
        role: "USER",
        permissionKey: "upload_files",
        name: "Upload Files",
        description: "Upload files with assignments",
        enabled: true,
        category: "submissions",
      },
    ];

    // Upsert HR permissions
    for (const perm of hrPermissions) {
      await RolePermission.updateOne(
        { role: perm.role, permissionKey: perm.permissionKey },
        perm,
        { upsert: true },
      );
    }

    // Upsert USER permissions
    for (const perm of userPermissions) {
      await RolePermission.updateOne(
        { role: perm.role, permissionKey: perm.permissionKey },
        perm,
        { upsert: true },
      );
    }
    // ADMIN has all permissions by default
    const adminPermissions = [
      ...hrPermissions,
      ...userPermissions,
      {
        role: "ADMIN",
        permissionKey: "view_analytics",
        name: "View Analytics",
        description: "View workspace analytics and reports",
        enabled: true,
        category: "analytics",
      },
      {
        role: "ADMIN",
        permissionKey: "manage_users",
        name: "Manage Users",
        description: "Create and manage user accounts and roles",
        enabled: true,
        category: "workspace",
      },
      {
        role: "ADMIN",
        permissionKey: "manage_workspace",
        name: "Manage Workspace",
        description: "Configure workspace settings and permissions",
        enabled: true,
        category: "workspace",
      },
      {
        role: "ADMIN",
        permissionKey: "post_to_social",
        name: "Post to Social",
        description: "Post to social channels",
        enabled: true,
        category: "social",
      },
      {
        role: "ADMIN",
        permissionKey: "schedule_posts",
        name: "Schedule Posts",
        description: "Schedule social posts",
        enabled: true,
        category: "social",
      },
    ];

    for (const perm of adminPermissions) {
      await RolePermission.updateOne(
        { role: perm.role, permissionKey: perm.permissionKey },
        perm,
        { upsert: true },
      );
    }

    await initializeDefaultGlobalServices();
    console.log("✅ Default permissions initialized");
  } catch (error) {
    console.error("Error initializing default permissions:", error);
  }
};

module.exports = {
  hasPermission,
  getGlobalService,
  getRolePermission,
  getUserOverride,
  getAllUserPermissions,
  clearCache,
  initializeDefaultPermissions,
};
