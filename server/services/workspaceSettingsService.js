const WorkspaceSettings = require("../models/WorkspaceSettings");

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
};

let cachedSettings = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 10000;

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

const createDefaultSettings = async () => {
  const existing = await WorkspaceSettings.findOne({
    workspaceId: "default",
  }).lean();
  if (existing) {
    return existing;
  }

  const created = await WorkspaceSettings.create({
    workspaceId: "default",
    settings: DEFAULT_SETTINGS,
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
  const publicSettings = {
    allowUserRegistration: doc.settings.allowUserRegistration,
    socialPostingEnabled: doc.settings.socialPostingEnabled,
    whatsappEnabled: doc.settings.whatsappEnabled,
    linkedinEnabled: doc.settings.linkedinEnabled,
    instagramEnabled: doc.settings.instagramEnabled,
    platformGridEnabled: doc.settings.platformGridEnabled,
    usersCanCustomizePlatforms: doc.settings.usersCanCustomizePlatforms,
    fileUploadsEnabled: doc.settings.fileUploadsEnabled,
    avatarUploadsEnabled: doc.settings.avatarUploadsEnabled,
    assignmentsEnabled: doc.settings.assignmentsEnabled,
    usersCanSubmitAssignments: doc.settings.usersCanSubmitAssignments,
    reviewSystemEnabled: doc.settings.reviewSystemEnabled,
  };
  return publicSettings;
};

const updateWorkspaceSettings = async (updates, changedBy) => {
  const settingsDoc = await getWorkspaceSettings({ bypassCache: true });
  const current = settingsDoc.settings || {};
  const merged = { ...current, ...updates };
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
  DEFAULT_SETTINGS,
  getWorkspaceSettings,
  getPublicSettings,
  updateWorkspaceSettings,
  refreshWorkspaceSettings,
};
