export const FEATURE_FAMILIES = Object.freeze({
  GLOBAL: "global",
  HR: "hr",
  USER: "user",
  ADMIN: "admin",
});

export const SCOPE_OPTIONS_BY_FAMILY = Object.freeze({
  [FEATURE_FAMILIES.GLOBAL]: [
    { value: "everyone", label: "Everyone" },
    { value: "hr_only", label: "HR Only" },
    { value: "users_only", label: "Users Only" },
    { value: "hr_and_users", label: "HR + Users" },
    { value: "specific_users", label: "Specific Users" },
  ],
  [FEATURE_FAMILIES.HR]: [
    { value: "all_hr", label: "All HR" },
    { value: "specific_hr_users", label: "Specific HR Users" },
  ],
  [FEATURE_FAMILIES.USER]: [
    { value: "all_users", label: "All Users" },
    { value: "specific_users", label: "Specific Users" },
  ],
  [FEATURE_FAMILIES.ADMIN]: [
    { value: "all_admins", label: "All Admins" },
    { value: "specific_admin_users", label: "Specific Admin Users" },
  ],
});

const FEATURE_GROUPS = [
  {
    id: "assignments",
    title: "Assignment System",
    description:
      "Controls assignment creation, reviews, submissions, and file behavior.",
    items: [
      {
        key: "assignmentsEnabled",
        label: "Assignments",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "assignmentReviewsEnabled",
        label: "Reviews",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "assignmentFileAttachmentsEnabled",
        label: "File Attachments",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "assignmentDeadlineExtensionsEnabled",
        label: "Deadline Extensions",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "revisionsEnabled",
        label: "Revisions",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
    ],
  },
  {
    id: "hr",
    title: "HR Controls",
    description: "Permissions and actions available to HR users.",
    items: [
      {
        key: "hrCanCreateAssignments",
        label: "Create Assignments",
        family: FEATURE_FAMILIES.HR,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "hrCanEditOwnAssignments",
        label: "Edit Own Assignments",
        family: FEATURE_FAMILIES.HR,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "hrCanDeleteAssignments",
        label: "Delete Assignments",
        family: FEATURE_FAMILIES.HR,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "hrCanReviewSubmissions",
        label: "Review Submissions",
        family: FEATURE_FAMILIES.HR,
        defaultEnabled: true,
        overrideEligible: true,
      },
    ],
  },
  {
    id: "users",
    title: "User Controls",
    description: "What regular users can do in the workspace.",
    items: [
      {
        key: "usersCanSubmitAssignments",
        label: "Submit Work",
        family: FEATURE_FAMILIES.USER,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "usersCanUploadFiles",
        label: "Upload Files",
        family: FEATURE_FAMILIES.USER,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "usersCanCreateSocialPosts",
        label: "Create Social Posts",
        family: FEATURE_FAMILIES.USER,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "usersCanCustomizePlatforms",
        label: "Workspace Customization",
        family: FEATURE_FAMILIES.USER,
        defaultEnabled: true,
        overrideEligible: true,
      },
    ],
  },
  {
    id: "social",
    title: "Social Platforms",
    description: "Enable or disable social posting and dispatch channels.",
    items: [
      {
        key: "socialPostingEnabled",
        label: "Social Posting",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "whatsappEnabled",
        label: "WhatsApp",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "linkedinEnabled",
        label: "LinkedIn",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "instagramEnabled",
        label: "Instagram",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "platformDispatchEnabled",
        label: "Platform Dispatch",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
    ],
  },
  {
    id: "platforms",
    title: "Platform & Analytics",
    description: "Controls platform grid, tracking, analytics, and editing.",
    items: [
      {
        key: "platformGridEnabled",
        label: "Platform Grid",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "shareTrackingEnabled",
        label: "Share Tracking",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "usageTrackingEnabled",
        label: "Usage Tracking",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
      {
        key: "analyticsEnabled",
        label: "Analytics",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: true,
      },
    ],
  },
  {
    id: "security",
    title: "Security & Management",
    description: "Workspace-level account and role controls.",
    items: [
      {
        key: "allowUserRegistration",
        label: "User Registration",
        family: FEATURE_FAMILIES.GLOBAL,
        defaultEnabled: true,
        overrideEligible: false,
      },
      {
        key: "allowHRCreation",
        label: "HR Creation",
        family: FEATURE_FAMILIES.ADMIN,
        defaultEnabled: true,
        overrideEligible: false,
      },
      {
        key: "allowRoleEditing",
        label: "Role Editing",
        family: FEATURE_FAMILIES.ADMIN,
        defaultEnabled: true,
        overrideEligible: false,
      },
      {
        key: "allowUserSuspension",
        label: "User Suspension",
        family: FEATURE_FAMILIES.ADMIN,
        defaultEnabled: true,
        overrideEligible: false,
      },
      {
        key: "allowAccountDeletion",
        label: "Account Deletion",
        family: FEATURE_FAMILIES.ADMIN,
        defaultEnabled: true,
        overrideEligible: false,
      },
    ],
  },
];

const FEATURE_ITEMS = FEATURE_GROUPS.flatMap((group) => group.items);

export const FEATURE_METADATA = Object.freeze(
  FEATURE_ITEMS.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {}),
);

export const WORKSPACE_FEATURE_KEYS = FEATURE_ITEMS.map((item) => item.key);

export const getScopeOptionsForFamily = (family) =>
  SCOPE_OPTIONS_BY_FAMILY[family] || SCOPE_OPTIONS_BY_FAMILY[FEATURE_FAMILIES.GLOBAL];

export const createDefaultFeatureState = (featureKey, enabled = false) => ({
  enabled: Boolean(enabled),
  accessScope:
    getScopeOptionsForFamily(FEATURE_METADATA[featureKey]?.family)?.[0]?.value ||
    "everyone",
  allowedRoles: [],
  allowedUsers: [],
});

export const normalizeFeatureState = (
  featureKey,
  value,
  fallbackEnabled = false,
) => {
  if (typeof value === "boolean") {
    return createDefaultFeatureState(featureKey, value);
  }

  const family = FEATURE_METADATA[featureKey]?.family || FEATURE_FAMILIES.GLOBAL;
  const scopeOptions = getScopeOptionsForFamily(family);
  const defaultScope = scopeOptions[0]?.value || "everyone";

  if (value && typeof value === "object") {
    const enabled =
      value.enabled === undefined ? Boolean(fallbackEnabled) : Boolean(value.enabled);
    const rawScope = value.accessScope || value.accessMode;
    const accessScope = scopeOptions.some((option) => option.value === rawScope)
      ? rawScope
      : defaultScope;

    return {
      enabled,
      accessScope,
      allowedRoles: Array.isArray(value.allowedRoles) ? value.allowedRoles : [],
      allowedUsers: Array.isArray(value.allowedUsers)
        ? [...new Set(value.allowedUsers.map((id) => String(id).trim()).filter(Boolean))]
        : [],
    };
  }

  return createDefaultFeatureState(featureKey, fallbackEnabled);
};

export const normalizeUserOverrides = (userOverrides = []) => {
  if (!Array.isArray(userOverrides)) {
    return [];
  }

  return userOverrides
    .map((entry) => ({
      userId: String(entry.userId || "").trim(),
      role: String(entry.role || "").trim().toUpperCase(),
      permissions: Object.entries(entry.permissions || {}).reduce(
        (acc, [featureKey, value]) => {
          if (WORKSPACE_FEATURE_KEYS.includes(featureKey) && typeof value === "boolean") {
            acc[featureKey] = value;
          }
          return acc;
        },
        {},
      ),
    }))
    .filter((entry) => entry.userId && Object.keys(entry.permissions).length > 0);
};

export const FEATURE_GROUP_CONFIG = FEATURE_GROUPS;

export const getOverrideEligibleFeaturesForRole = (role) => {
  const normalizedRole = String(role || "").trim().toUpperCase();

  return FEATURE_ITEMS.filter((item) => {
    if (!item.overrideEligible) {
      return false;
    }

    if (normalizedRole === "HR") {
      return [FEATURE_FAMILIES.GLOBAL, FEATURE_FAMILIES.HR].includes(item.family);
    }

    if (normalizedRole === "USER") {
      return [FEATURE_FAMILIES.GLOBAL, FEATURE_FAMILIES.USER].includes(item.family);
    }

    return false;
  });
};
