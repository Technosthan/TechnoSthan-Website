const WorkspaceSettings = require("../models/WorkspaceSettings");
const { ROLES, normalizeRole } = require("../constants/rbac");
const {
  DEFAULT_SESSION_TIMEOUT,
  formatSessionTimeoutSummary,
  normalizeSessionTimeoutSettings,
} = require("../utils/sessionTimeout");

const DEFAULT_SETTINGS = {
  assignmentsEnabled: true,
  assignmentReviewsEnabled: true,
  submissionEditingEnabled: true,
  assignmentFileAttachmentsEnabled: true,
  assignmentDeadlineExtensionsEnabled: true,
  assignmentMultiUserEnabled: true,

  hrCanCreateAssignments: true,
  hrCanEditOwnAssignments: true,
  hrCanDeleteAssignments: true,
  hrCanReviewSubmissions: true,
  hrCanAssignToUsersOnly: true,

  usersCanSubmitAssignments: true,
  usersCanUploadFiles: true,
  usersCanCustomizePlatforms: true,
  usersCanCreateSocialPosts: true,
  usersCanEditSubmissions: true,

  socialPostingEnabled: true,
  whatsappEnabled: true,
  linkedinEnabled: true,
  instagramEnabled: true,
  platformDispatchEnabled: true,
  scheduledPostsEnabled: false,

  platformGridEnabled: true,
  shareTrackingEnabled: true,
  copyTrackingEnabled: true,
  platformAnalyticsEnabled: true,
  userGridEditingEnabled: true,

  fileUploadsEnabled: true,
  avatarUploadsEnabled: true,
  multipleAttachmentsEnabled: true,
  maxUploadSizeMb: 5,
  allowedFileTypes: ["pdf", "doc", "docx", "jpeg", "png", "webp"],

  reviewSystemEnabled: true,
  reviewerRemarksEnabled: true,
  approvalWorkflowEnabled: true,
  revisionsEnabled: true,
  resubmissionEnabled: true,

  allowUserRegistration: true,
  allowHRCreation: true,
  allowUserSuspension: true,
  allowRoleEditing: true,
  allowAccountDeletion: true,

  analyticsEnabled: true,
  usageTrackingEnabled: true,
  activityLogsEnabled: true,
  shareLogsEnabled: true,
  dashboardMetricsEnabled: true,

  sessionTimeoutEnabled:
    DEFAULT_SESSION_TIMEOUT.sessionTimeoutEnabled,
  sessionTimeoutValue: DEFAULT_SESSION_TIMEOUT.sessionTimeoutValue,
  sessionTimeoutUnit: DEFAULT_SESSION_TIMEOUT.sessionTimeoutUnit,
};

const FEATURE_FAMILIES = Object.freeze({
  GLOBAL: "global",
  HR: "hr",
  USER: "user",
  ADMIN: "admin",
});

const FEATURE_SCOPE_OPTIONS = Object.freeze({
  [FEATURE_FAMILIES.GLOBAL]: [
    "everyone",
    "hr_only",
    "users_only",
    "hr_and_users",
    "specific_users",
  ],
  [FEATURE_FAMILIES.HR]: ["all_hr", "specific_hr_users"],
  [FEATURE_FAMILIES.USER]: ["all_users", "specific_users"],
  [FEATURE_FAMILIES.ADMIN]: ["all_admins", "specific_admin_users"],
});

const FEATURE_FAMILY_KEYS = Object.freeze({
  [FEATURE_FAMILIES.HR]: [
    "hrCanCreateAssignments",
    "hrCanEditOwnAssignments",
    "hrCanDeleteAssignments",
    "hrCanReviewSubmissions",
    "hrCanAssignToUsersOnly",
  ],
  [FEATURE_FAMILIES.USER]: [
    "usersCanSubmitAssignments",
    "usersCanUploadFiles",
    "usersCanCustomizePlatforms",
    "usersCanCreateSocialPosts",
    "usersCanEditSubmissions",
  ],
  [FEATURE_FAMILIES.ADMIN]: [
    "allowHRCreation",
    "allowUserSuspension",
    "allowRoleEditing",
    "allowAccountDeletion",
  ],
});

const BOOLEAN_FEATURE_KEYS = Object.freeze(
  Object.keys(DEFAULT_SETTINGS).filter(
    (key) => typeof DEFAULT_SETTINGS[key] === "boolean",
  ),
);

const FEATURE_DEFINITIONS = Object.freeze(
  BOOLEAN_FEATURE_KEYS.reduce((acc, key) => {
    let family = FEATURE_FAMILIES.GLOBAL;
    if (FEATURE_FAMILY_KEYS[FEATURE_FAMILIES.HR].includes(key)) {
      family = FEATURE_FAMILIES.HR;
    } else if (FEATURE_FAMILY_KEYS[FEATURE_FAMILIES.USER].includes(key)) {
      family = FEATURE_FAMILIES.USER;
    } else if (FEATURE_FAMILY_KEYS[FEATURE_FAMILIES.ADMIN].includes(key)) {
      family = FEATURE_FAMILIES.ADMIN;
    }

    acc[key] = {
      key,
      family,
      defaultEnabled: Boolean(DEFAULT_SETTINGS[key]),
      allowedScopes: FEATURE_SCOPE_OPTIONS[family],
    };
    return acc;
  }, {}),
);

const FEATURE_ACCESS_MODES = Object.freeze([
  ...new Set(
    Object.values(FEATURE_SCOPE_OPTIONS)
      .flat()
      .concat(["roles", "roles_and_users"]),
  ),
]);

let cachedSettings = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10000;

const USER_OVERRIDE_ROLES = Object.freeze([ROLES.HR, ROLES.USER]);

const buildSafeChangeSummary = (current, updated) => {
  const changes = {};
  Object.keys(updated).forEach((key) => {
    const oldValue = current?.[key];
    const newValue = updated[key];
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { oldValue, newValue };
    }
  });
  return changes;
};

const dedupeStrings = (values = []) => [
  ...new Set(values.map((value) => String(value).trim()).filter(Boolean)),
];

const normalizeAllowedRoles = (roles = []) =>
  dedupeStrings(roles)
    .map((role) => normalizeRole(role))
    .filter(Boolean);

const normalizeAllowedUsers = (users = []) => dedupeStrings(users);

const getFeatureDefinition = (featureKey) =>
  FEATURE_DEFINITIONS[featureKey] || {
    key: featureKey,
    family: FEATURE_FAMILIES.GLOBAL,
    defaultEnabled: false,
    allowedScopes: FEATURE_SCOPE_OPTIONS[FEATURE_FAMILIES.GLOBAL],
  };

const getDefaultScopeForFamily = (family) => {
  if (family === FEATURE_FAMILIES.HR) return "all_hr";
  if (family === FEATURE_FAMILIES.USER) return "all_users";
  if (family === FEATURE_FAMILIES.ADMIN) return "all_admins";
  return "everyone";
};

const isSpecificScope = (scope) =>
  ["specific_users", "specific_hr_users", "specific_admin_users"].includes(
    scope,
  );

const mapLegacyScopeToFamily = (rawScope, family) => {
  if (!rawScope) return null;

  if (FEATURE_SCOPE_OPTIONS[family].includes(rawScope)) {
    return rawScope;
  }

  if (family === FEATURE_FAMILIES.HR) {
    if (rawScope === "hr_only") return "all_hr";
    if (rawScope === "specific_users") return "specific_hr_users";
    return null;
  }

  if (family === FEATURE_FAMILIES.USER) {
    if (rawScope === "users_only") return "all_users";
    if (rawScope === "specific_users") return "specific_users";
    return null;
  }

  if (family === FEATURE_FAMILIES.ADMIN) {
    if (rawScope === "specific_users") return "specific_admin_users";
    if (
      rawScope === "everyone" ||
      rawScope === "hr_only" ||
      rawScope === "users_only"
    )
      return "all_admins";
    return null;
  }

  return null;
};

const deriveGlobalScopeFromRoles = (roles = []) => {
  const normalized = normalizeAllowedRoles(roles);
  const hasHR = normalized.includes(ROLES.HR);
  const hasUser = normalized.includes(ROLES.USER);

  if (hasHR && hasUser) return "hr_and_users";
  if (hasHR) return "hr_only";
  if (hasUser) return "users_only";
  return "everyone";
};

const deriveScopeFromArrays = (
  family,
  allowedRoles = [],
  allowedUsers = [],
) => {
  if (allowedUsers.length > 0) {
    if (family === FEATURE_FAMILIES.HR) return "specific_hr_users";
    if (family === FEATURE_FAMILIES.ADMIN) return "specific_admin_users";
    return "specific_users";
  }

  if (family === FEATURE_FAMILIES.HR) return "all_hr";
  if (family === FEATURE_FAMILIES.USER) return "all_users";
  if (family === FEATURE_FAMILIES.ADMIN) return "all_admins";
  return deriveGlobalScopeFromRoles(allowedRoles);
};

const deriveAllowedRolesForScope = (scope, family) => {
  if (family === FEATURE_FAMILIES.HR) return [ROLES.HR];
  if (family === FEATURE_FAMILIES.USER) return [ROLES.USER];
  if (family === FEATURE_FAMILIES.ADMIN) return [ROLES.ADMIN];

  if (scope === "hr_only") return [ROLES.HR];
  if (scope === "users_only") return [ROLES.USER];
  if (scope === "hr_and_users") return [ROLES.HR, ROLES.USER];
  return [];
};

const getDefaultFeatureEntry = (featureKey, enabled = false) => ({
  enabled: Boolean(enabled),
  accessScope: getDefaultScopeForFamily(
    getFeatureDefinition(featureKey).family,
  ),
  allowedRoles: [],
  allowedUsers: [],
});

const normalizeFeatureEntry = (
  featureKey,
  entry,
  { defaultEnabled = false, preserveDisabledArrays = false } = {},
) => {
  const definition = getFeatureDefinition(featureKey);
  const family = definition.family;

  if (typeof entry === "boolean") {
    return getDefaultFeatureEntry(featureKey, entry);
  }

  if (entry && typeof entry === "object") {
    const enabled =
      entry.enabled === undefined
        ? Boolean(defaultEnabled)
        : Boolean(entry.enabled);
    let allowedRoles = normalizeAllowedRoles(entry.allowedRoles || []);
    let allowedUsers = normalizeAllowedUsers(entry.allowedUsers || []);

    let accessScope = mapLegacyScopeToFamily(
      entry.accessScope || entry.accessMode,
      family,
    );

    if (!accessScope) {
      accessScope = deriveScopeFromArrays(family, allowedRoles, allowedUsers);
    }

    allowedRoles = deriveAllowedRolesForScope(accessScope, family);
    if (!isSpecificScope(accessScope)) {
      allowedUsers = preserveDisabledArrays ? allowedUsers : [];
    }

    return { enabled, accessScope, allowedRoles, allowedUsers };
  }

  return getDefaultFeatureEntry(featureKey, defaultEnabled);
};

const normalizeUserOverrideEntry = (entry = {}) => {
  const userId = String(entry.userId || "").trim();
  const rawRole = String(entry.role || "").trim();
  const role = rawRole ? normalizeRole(rawRole) : "";
  const permissions = Object.entries(entry.permissions || {}).reduce(
    (acc, [featureKey, value]) => {
      if (
        BOOLEAN_FEATURE_KEYS.includes(featureKey) &&
        typeof value === "boolean"
      ) {
        acc[featureKey] = value;
      }
      return acc;
    },
    {},
  );

  return {
    userId,
    role,
    permissions,
  };
};

const normalizeUserOverrides = (overrides = []) => {
  if (!Array.isArray(overrides)) {
    return [];
  }

  const merged = new Map();
  overrides.forEach((entry) => {
    const normalized = normalizeUserOverrideEntry(entry);
    if (!normalized.userId) {
      return;
    }

    const existing = merged.get(normalized.userId) || {
      userId: normalized.userId,
      role: normalized.role,
      permissions: {},
    };

    merged.set(normalized.userId, {
      userId: normalized.userId,
      role: normalized.role || existing.role,
      permissions: {
        ...existing.permissions,
        ...normalized.permissions,
      },
    });
  });

  return [...merged.values()].filter(
    (entry) => Object.keys(entry.permissions).length > 0,
  );
};

const isWorkspaceFeatureKey = (key) => BOOLEAN_FEATURE_KEYS.includes(key);

const buildDefaultWorkspaceSettings = () =>
  Object.entries(DEFAULT_SETTINGS).reduce(
    (acc, [key, value]) => {
      acc[key] =
        typeof value === "boolean"
          ? normalizeFeatureEntry(key, value, { defaultEnabled: value })
          : value;
      return acc;
    },
    { userOverrides: [] },
  );

const normalizeWorkspaceSettings = (
  settings = {},
  { includeMissingDefaults = true } = {},
) => {
  const base = includeMissingDefaults
    ? { ...buildDefaultWorkspaceSettings() }
    : {};

  Object.entries(settings || {}).forEach(([key, value]) => {
    if (key === "userOverrides") {
      base.userOverrides = normalizeUserOverrides(value);
      return;
    }

    if (isWorkspaceFeatureKey(key)) {
      base[key] = normalizeFeatureEntry(key, value, {
        defaultEnabled: Boolean(DEFAULT_SETTINGS[key]),
      });
      return;
    }

    base[key] = value;
  });

  if (!Array.isArray(base.userOverrides)) {
    base.userOverrides = [];
  }

  return base;
};

const serializePublicWorkspaceSettings = (settings = {}) => {
  const normalized = normalizeWorkspaceSettings(settings);
  return {
    allowUserRegistration: normalized.allowUserRegistration,
    socialPostingEnabled: normalized.socialPostingEnabled,
    whatsappEnabled: normalized.whatsappEnabled,
    linkedinEnabled: normalized.linkedinEnabled,
    instagramEnabled: normalized.instagramEnabled,
    platformGridEnabled: normalized.platformGridEnabled,
    usersCanCustomizePlatforms: normalized.usersCanCustomizePlatforms,
    fileUploadsEnabled: normalized.fileUploadsEnabled,
    avatarUploadsEnabled: normalized.avatarUploadsEnabled,
    assignmentsEnabled: normalized.assignmentsEnabled,
    usersCanSubmitAssignments: normalized.usersCanSubmitAssignments,
    reviewSystemEnabled: normalized.reviewSystemEnabled,
    ...normalizeSessionTimeoutSettings(normalized),
  };
};

const getSessionTimeoutSettings = (settings = {}) =>
  normalizeSessionTimeoutSettings(settings);

const getUserOverrideDecision = (featureKey, settings = {}, user) => {
  const userId = String(user?.id || user?._id || user?.userId || "").trim();
  if (!userId) {
    return null;
  }

  const overrides = normalizeUserOverrides(settings.userOverrides || []);
  const match = overrides.find((entry) => entry.userId === userId);
  if (!match) {
    return null;
  }

  const value = match.permissions?.[featureKey];
  if (typeof value !== "boolean") {
    return null;
  }

  return {
    allowed: value,
    reason: value ? "user_override_enabled" : "user_override_disabled",
  };
};

const resolveWorkspaceFeatureAccess = (
  featureKey,
  settings = {},
  user,
  { allowAdminBypass = true } = {},
) => {
  const normalizedSettings = normalizeWorkspaceSettings(settings);
  const definition = getFeatureDefinition(featureKey);
  const family = definition.family;
  const feature = normalizeFeatureEntry(
    featureKey,
    normalizedSettings?.[featureKey],
    {
      defaultEnabled: definition.defaultEnabled,
    },
  );

  const override = getUserOverrideDecision(
    featureKey,
    normalizedSettings,
    user,
  );
  if (override) {
    return { feature, allowed: override.allowed, reason: override.reason };
  }

  if (!feature.enabled) {
    return { feature, allowed: false, reason: "disabled" };
  }

  const normalizedRole = normalizeRole(user?.role);
  const normalizedUserId = String(
    user?.id || user?._id || user?.userId || "",
  ).trim();
  const userAllowed =
    normalizedUserId.length > 0 &&
    feature.allowedUsers.includes(normalizedUserId);

  if (
    allowAdminBypass &&
    normalizedRole === ROLES.ADMIN &&
    family !== FEATURE_FAMILIES.ADMIN
  ) {
    return { feature, allowed: true, reason: "admin_role" };
  }

  if (
    family === FEATURE_FAMILIES.GLOBAL &&
    feature.accessScope === "everyone"
  ) {
    return { feature, allowed: true, reason: "everyone" };
  }

  if (!user) {
    return { feature, allowed: false, reason: "authentication_required" };
  }

  if (family === FEATURE_FAMILIES.HR) {
    const allowed =
      feature.accessScope === "all_hr"
        ? normalizedRole === ROLES.HR
        : normalizedRole === ROLES.HR && userAllowed;
    return {
      feature,
      allowed,
      reason: allowed ? "hr_allowed" : "hr_not_allowed",
    };
  }

  if (family === FEATURE_FAMILIES.USER) {
    const allowed =
      feature.accessScope === "all_users"
        ? normalizedRole === ROLES.USER
        : normalizedRole === ROLES.USER && userAllowed;
    return {
      feature,
      allowed,
      reason: allowed ? "user_allowed" : "user_not_allowed",
    };
  }

  if (family === FEATURE_FAMILIES.ADMIN) {
    if (normalizedRole !== ROLES.ADMIN) {
      return { feature, allowed: false, reason: "admin_only" };
    }

    const allowed = feature.accessScope === "all_admins" ? true : userAllowed;
    return {
      feature,
      allowed,
      reason: allowed ? "admin_allowed" : "admin_not_allowed",
    };
  }

  if (feature.accessScope === "specific_users") {
    return {
      feature,
      allowed: userAllowed,
      reason: userAllowed ? "specific_user" : "user_not_allowed",
    };
  }

  const roleAllowed =
    (feature.accessScope === "hr_only" && normalizedRole === ROLES.HR) ||
    (feature.accessScope === "users_only" && normalizedRole === ROLES.USER) ||
    (feature.accessScope === "hr_and_users" &&
      [ROLES.HR, ROLES.USER].includes(normalizedRole));

  return {
    feature,
    allowed: roleAllowed,
    reason: roleAllowed ? "role_allowed" : "role_not_allowed",
  };
};

const isWorkspaceFeatureEnabled = (featureKey, settings = {}) =>
  normalizeFeatureEntry(featureKey, settings?.[featureKey], {
    defaultEnabled: Boolean(DEFAULT_SETTINGS[featureKey]),
  }).enabled;

const createDefaultSettings = async () => {
  const existing = await WorkspaceSettings.findOne({
    workspaceId: "default",
  }).lean();
  if (existing) {
    return existing;
  }

  const created = await WorkspaceSettings.create({
    workspaceId: "default",
    settings: buildDefaultWorkspaceSettings(),
    history: [],
  });

  cachedSettings = created;
  cacheTimestamp = Date.now();
  return created;
};

const getWorkspaceSettings = async ({ bypassCache = false } = {}) => {
  if (
    !bypassCache &&
    cachedSettings &&
    Date.now() - cacheTimestamp < CACHE_TTL_MS
  ) {
    return cachedSettings;
  }

  let settingsDoc = await WorkspaceSettings.findOne({ workspaceId: "default" });
  if (!settingsDoc) {
    settingsDoc = await createDefaultSettings();
  }

  cachedSettings = settingsDoc;
  cacheTimestamp = Date.now();
  return settingsDoc;
};

const refreshWorkspaceSettings = async () => {
  cachedSettings = null;
  return getWorkspaceSettings({ bypassCache: true });
};

const getPublicSettings = async () => {
  const doc = await getWorkspaceSettings();
  return serializePublicWorkspaceSettings(doc.settings);
};

/**
 * Resolve permission for a given user and feature key and return a canonical
 * shape used by APIs and UI: { allowed, reason, source, feature }
 * - source: 'global' | 'user_override' | 'role'
 */
const hasPermission = async (user, featureKey) => {
  const doc = await getWorkspaceSettings();
  const settings = normalizeWorkspaceSettings(doc.settings || {});

  // use existing resolver which already considers user overrides and roles
  const resolved = resolveWorkspaceFeatureAccess(featureKey, settings, user, {
    allowAdminBypass: true,
  });

  const source =
    resolved.reason && resolved.reason.startsWith("user_override")
      ? "user_override"
      : resolved.feature && resolved.feature.enabled === false
        ? "global"
        : "role";

  return {
    allowed: Boolean(resolved.allowed),
    reason:
      resolved.reason || (resolved.allowed ? "role_allowed" : "role_denied"),
    source,
    feature: resolved.feature,
  };
};

const updateWorkspaceSettings = async (updates, changedBy) => {
  const settingsDoc = await getWorkspaceSettings({ bypassCache: true });
  const current = normalizeWorkspaceSettings(settingsDoc.settings || {});
  const normalizedUpdates = normalizeWorkspaceSettings(updates || {}, {
    includeMissingDefaults: false,
  });
  const merged = { ...current, ...normalizedUpdates };
  const changes = buildSafeChangeSummary(current, merged);

  if (Object.keys(changes).length === 0) {
    return settingsDoc;
  }

  settingsDoc.settings = merged;
  settingsDoc.updatedBy = {
    id: changedBy?.id || null,
    name: changedBy?.name || null,
    role: changedBy?.role || null,
  };
  settingsDoc.history.unshift({
    changedAt: new Date(),
    changedBy: {
      id: changedBy?.id || null,
      name: changedBy?.name || null,
      role: changedBy?.role || null,
    },
    changes,
  });
  settingsDoc.history = settingsDoc.history.slice(0, 50);

  await settingsDoc.save();
  cachedSettings = settingsDoc;
  cacheTimestamp = Date.now();

  return settingsDoc;
};

module.exports = {
  BOOLEAN_FEATURE_KEYS,
  DEFAULT_SETTINGS,
  FEATURE_ACCESS_MODES,
  FEATURE_DEFINITIONS,
  FEATURE_FAMILIES,
  FEATURE_SCOPE_OPTIONS,
  USER_OVERRIDE_ROLES,
  buildDefaultWorkspaceSettings,
  getFeatureDefinition,
  getPublicSettings,
  getWorkspaceSettings,
  isWorkspaceFeatureEnabled,
  normalizeFeatureEntry,
  normalizeUserOverrides,
  normalizeWorkspaceSettings,
  refreshWorkspaceSettings,
  resolveWorkspaceFeatureAccess,
  serializePublicWorkspaceSettings,
  getSessionTimeoutSettings,
  updateWorkspaceSettings,
  hasPermission,
};
