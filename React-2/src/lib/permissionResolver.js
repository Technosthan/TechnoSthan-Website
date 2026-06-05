/**
 * PERMISSION RESOLVER LIBRARY
 * Frontend utilities for permission management
 * Standardized permission keys and helper functions
 */

/**
 * Standard Permission Keys (snake_case)
 * These must match backend permission keys exactly
 */
export const PERMISSION_KEYS = {
  // Assignment Management
  CREATE_ASSIGNMENTS: "create_assignments",
  EDIT_ASSIGNMENTS: "edit_assignments",
  DELETE_ASSIGNMENTS: "delete_assignments",

  // Submissions & Work
  SUBMIT_WORK: "submit_work",
  UPLOAD_FILES: "upload_files",

  // Reviews & Feedback
  REVIEW_SUBMISSIONS: "review_submissions",
  ADD_FEEDBACK: "add_feedback",

  // Assignment Modifications
  EXTEND_DEADLINES: "extend_deadlines",
  MANAGE_REVISIONS: "manage_revisions",

  // Analytics & Reports
  VIEW_ANALYTICS: "view_analytics",

  // User & Workspace Management
  MANAGE_USERS: "manage_users",
  MANAGE_WORKSPACE: "manage_workspace",

  // Social & Content
  POST_TO_SOCIAL: "post_to_social",
  SCHEDULE_POSTS: "schedule_posts",
};

/**
 * Permission Categories
 * Used for grouping in admin UI
 */
export const PERMISSION_CATEGORIES = {
  ASSIGNMENTS: "assignments",
  SUBMISSIONS: "submissions",
  REVIEWS: "reviews",
  SOCIAL: "social",
  WORKSPACE: "workspace",
};

/**
 * Permission Descriptions
 * Human-readable descriptions for admin UI
 */
export const PERMISSION_DESCRIPTIONS = {
  [PERMISSION_KEYS.CREATE_ASSIGNMENTS]: "Create new assignments",
  [PERMISSION_KEYS.EDIT_ASSIGNMENTS]: "Edit existing assignments",
  [PERMISSION_KEYS.DELETE_ASSIGNMENTS]: "Delete assignments",
  [PERMISSION_KEYS.SUBMIT_WORK]: "Submit assignments",
  [PERMISSION_KEYS.UPLOAD_FILES]: "Upload files with assignments",
  [PERMISSION_KEYS.REVIEW_SUBMISSIONS]: "Review user submissions",
  [PERMISSION_KEYS.ADD_FEEDBACK]: "Add feedback to submissions",
  [PERMISSION_KEYS.EXTEND_DEADLINES]: "Extend assignment deadlines",
  [PERMISSION_KEYS.MANAGE_REVISIONS]: "Manage submission revisions",
  [PERMISSION_KEYS.VIEW_ANALYTICS]: "View analytics and reports",
  [PERMISSION_KEYS.MANAGE_USERS]: "Manage users and roles",
  [PERMISSION_KEYS.MANAGE_WORKSPACE]: "Manage workspace settings",
  [PERMISSION_KEYS.POST_TO_SOCIAL]: "Post to social media",
  [PERMISSION_KEYS.SCHEDULE_POSTS]: "Schedule social posts",
};

/**
 * Role-based permission templates
 * Default permissions for each role
 */
export const ROLE_PERMISSION_DEFAULTS = {
  HR: [
    PERMISSION_KEYS.CREATE_ASSIGNMENTS,
    PERMISSION_KEYS.EDIT_ASSIGNMENTS,
    PERMISSION_KEYS.DELETE_ASSIGNMENTS,
    PERMISSION_KEYS.SUBMIT_WORK,
    PERMISSION_KEYS.UPLOAD_FILES,
    PERMISSION_KEYS.REVIEW_SUBMISSIONS,
    PERMISSION_KEYS.ADD_FEEDBACK,
  ],
  USER: [PERMISSION_KEYS.SUBMIT_WORK, PERMISSION_KEYS.UPLOAD_FILES],
  ADMIN: Object.values(PERMISSION_KEYS), // Admin has all permissions
};

/**
 * Required permissions per action
 * Used for UI rendering decisions
 */
export const ACTION_REQUIREMENTS = {
  // Assignment interactions
  can_submit: PERMISSION_KEYS.SUBMIT_WORK,
  can_upload: PERMISSION_KEYS.UPLOAD_FILES,
  can_create_assignment: PERMISSION_KEYS.CREATE_ASSIGNMENTS,
  can_edit_assignment: PERMISSION_KEYS.EDIT_ASSIGNMENTS,
  can_delete_assignment: PERMISSION_KEYS.DELETE_ASSIGNMENTS,

  // Review actions
  can_review: PERMISSION_KEYS.REVIEW_SUBMISSIONS,
  can_add_feedback: PERMISSION_KEYS.ADD_FEEDBACK,
  can_extend_deadline: PERMISSION_KEYS.EXTEND_DEADLINES,
  can_manage_revisions: PERMISSION_KEYS.MANAGE_REVISIONS,

  // Analytics
  can_view_analytics: PERMISSION_KEYS.VIEW_ANALYTICS,

  // Workspace
  can_manage_workspace: PERMISSION_KEYS.MANAGE_WORKSPACE,
  can_post_social: PERMISSION_KEYS.POST_TO_SOCIAL,
};

/**
 * Permission source descriptions
 * Explains why a permission is allowed/blocked
 */
export const PERMISSION_SOURCE_LABELS = {
  global_service_disabled: "Global service is disabled",
  user_override: "User-specific override applied",
  role_permission: "Based on role permissions",
  not_found: "Permission not configured",
  error: "Permission check failed",
};

/**
 * Get all permissions for a role
 */
export const getDefaultRolePermissions = (role) => {
  return ROLE_PERMISSION_DEFAULTS[role] || [];
};

/**
 * Check if a permission is required for an action
 */
export const getRequiredPermission = (action) => {
  return ACTION_REQUIREMENTS[action] || null;
};

/**
 * Get permission display name
 */
export const getPermissionName = (permissionKey) => {
  // Convert snake_case to Title Case
  return permissionKey
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

/**
 * Get permission description
 */
export const getPermissionDescription = (permissionKey) => {
  return (
    PERMISSION_DESCRIPTIONS[permissionKey] || getPermissionName(permissionKey)
  );
};

/**
 * Format permission for display
 */
export const formatPermissionForDisplay = (permissionKey) => {
  return {
    key: permissionKey,
    name: getPermissionName(permissionKey),
    description: getPermissionDescription(permissionKey),
  };
};

/**
 * Group permissions by category
 */
export const groupPermissionsByCategory = (permissions) => {
  const grouped = {};

  Object.keys(permissions).forEach((key) => {
    const category = PERMISSION_CATEGORIES[key] || "other";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(key);
  });

  return grouped;
};

export default {
  PERMISSION_KEYS,
  PERMISSION_CATEGORIES,
  PERMISSION_DESCRIPTIONS,
  ROLE_PERMISSION_DEFAULTS,
  ACTION_REQUIREMENTS,
  PERMISSION_SOURCE_LABELS,
  getDefaultRolePermissions,
  getRequiredPermission,
  getPermissionName,
  getPermissionDescription,
  formatPermissionForDisplay,
  groupPermissionsByCategory,
};
