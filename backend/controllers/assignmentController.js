const fs = require("fs");
const path = require("path");
const cloudinaryService = require("../services/cloudinaryService");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const AssignmentTransferHistory = require("../models/AssignmentTransferHistory");
const { ROLES, getRoleVariants, normalizeRole } = require("../constants/rbac");
const createStoredAttachment = ({
  name,
  fileName,
  originalFileName,
  fileType,
  mimeType,
  size,
  uploadedAt,
  public_id,
  secure_url,
  original_filename,
  resource_type,
  format,
  bytes,
  delivery_type,
}) => {
  const previewKind = getAttachmentPreviewKind({
    fileType,
    mimeType,
    resource_type,
    format,
  });

  return {
    name: String(name || fileName || "").trim(),
    fileName: String(fileName || name || "").trim(),
    originalFileName: String(
      originalFileName || original_filename || name || "",
    ).trim(),
    fileType: String(fileType || mimeType || format || "").trim(),
    url: String(secure_url || "").trim(),
    mimeType: String(mimeType || fileType || "").trim(),
    size: Number(bytes || size || 0),
    uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
    public_id: public_id || null,
    secure_url: String(secure_url || "").trim() || null,
    original_filename: original_filename || null,
    resource_type: resource_type || null,
    format: format || null,
    delivery_type: getAttachmentDeliveryType({ delivery_type, secure_url }),
    bytes: bytes || size || 0,
    previewable: previewKind !== "unsupported",
  };
};

const ASSIGNMENT_POPULATION = [
  { path: "assignedTo", select: "name email role isActive" },
  { path: "assignedUsers", select: "name email role isActive" },
  { path: "createdBy", select: "name email role isActive" },
  { path: "assignedBy", select: "name email role" },
  { path: "remarks.author", select: "name email role" },
];

const SUBMISSION_POPULATION = [
  {
    path: "assignmentId",
    select:
      "title deadline status assignedToRole assignedUsers assignedTo assignedBy",
  },
  { path: "userId", select: "name email role isActive" },
  { path: "reviewerId", select: "name email role" },
];

const STATUS_LIST = [
  "pending",
  "in_progress",
  "submitted",
  "completed",
  "rejected",
];
const PRIORITY_LIST = ["low", "medium", "high", "urgent"];
const ASSIGNMENT_TYPE_ROLE = "role";
const ASSIGNMENT_TYPE_USER = "user";
const REVIEW_STATUS_TO_ASSIGNMENT_STATUS = {
  approved: "completed",
  rejected: "rejected",
  pending: "submitted",
};
const FILE_SIZE_LIMIT = 50 * 1024 * 1024;
const PREVIEWABLE_IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "gif", "svg"];
const PREVIEWABLE_VIDEO_FORMATS = ["mp4", "mov", "webm"];
const PREVIEWABLE_AUDIO_FORMATS = ["mp3", "wav", "aac", "m4a"];

const normalizeMimeType = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
const normalizeFormat = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "");

const getAttachmentDeliveryType = (attachment = {}) => {
  const explicitType = String(
    attachment.delivery_type || attachment.type || "",
  ).trim();
  if (explicitType) {
    return explicitType;
  }

  const secureUrl = String(attachment.secure_url || "").trim();
  const match = secureUrl.match(/\/(?:image|video|raw)\/([^/]+)\//i);
  return match ? match[1] : "upload";
};

const getAttachmentPreviewKind = (attachment = {}) => {
  const mimeType = normalizeMimeType(
    attachment.mimeType || attachment.fileType,
  );
  const resourceType = normalizeFormat(attachment.resource_type);
  const format = normalizeFormat(attachment.format || attachment.fileType);

  if (
    mimeType.startsWith("image/") ||
    resourceType === "image" ||
    PREVIEWABLE_IMAGE_FORMATS.includes(format)
  ) {
    return "image";
  }

  if (mimeType === "application/pdf" || format === "pdf") {
    return "pdf";
  }

  if (
    mimeType.startsWith("video/") ||
    resourceType === "video" ||
    PREVIEWABLE_VIDEO_FORMATS.includes(format)
  ) {
    return "video";
  }

  if (
    mimeType.startsWith("audio/") ||
    resourceType === "audio" ||
    PREVIEWABLE_AUDIO_FORMATS.includes(format)
  ) {
    return "audio";
  }

  return "unsupported";
};

const isPreviewableAttachment = (attachment = {}) =>
  getAttachmentPreviewKind(attachment) !== "unsupported";
const buildPagination = (query) => {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(Number.parseInt(query.limit, 10) || 10, 1),
    50,
  );
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const buildSort = (query) => {
  const sortBy = [
    "createdAt",
    "updatedAt",
    "deadline",
    "priority",
    "status",
    "title",
  ].includes(query.sortBy)
    ? query.sortBy
    : "createdAt";
  const sortOrder = query.sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: sortOrder };
};

const buildSearchFilter = (search) => {
  if (!search) {
    return {};
  }

  const regex = new RegExp(String(search).trim(), "i");
  return {
    $or: [{ title: regex }, { description: regex }],
  };
};

const buildListFilter = (query) => {
  const filter = { ...buildSearchFilter(query.search) };

  if (query.status && STATUS_LIST.includes(query.status)) {
    filter.status = query.status;
  }

  if (query.priority && PRIORITY_LIST.includes(query.priority)) {
    filter.priority = query.priority;
  }

  if (query.assignedTo) {
    filter.$or = [
      ...(filter.$or || []),
      { assignedTo: query.assignedTo },
      { assignedUsers: query.assignedTo },
    ];
  }

  if (
    query.assignedToRole &&
    [ROLES.HR, ROLES.USER, "BOTH"].includes(query.assignedToRole)
  ) {
    filter.assignedToRole = query.assignedToRole;
  }

  if (query.deadlineState === "overdue") {
    filter.deadline = { $lt: new Date() };
    filter.status = { $nin: ["completed"] };
  }

  return filter;
};

const combineFilters = (...filters) => {
  const normalized = filters.filter(
    (filter) => filter && Object.keys(filter).length > 0,
  );
  if (normalized.length === 0) {
    return {};
  }
  if (normalized.length === 1) {
    return normalized[0];
  }
  return { $and: normalized };
};

const populateAssignment = (query) =>
  ASSIGNMENT_POPULATION.reduce(
    (currentQuery, populateConfig) => currentQuery.populate(populateConfig),
    query,
  );

const populateSubmission = (query) =>
  SUBMISSION_POPULATION.reduce(
    (currentQuery, populateConfig) => currentQuery.populate(populateConfig),
    query,
  );

const addRemark = (assignment, { message, author, authorName, role, kind }) => {
  if (!message || !String(message).trim()) {
    return;
  }

  assignment.remarks.push({
    message: String(message).trim(),
    author,
    authorName,
    role: normalizeRole(role),
    kind,
  });
};

const normalizeAssignmentScope = (assignment) => {
  const assignedUsers = (assignment.assignedUsers || []).map((user) =>
    user?._id ? user._id.toString() : user.toString(),
  );
  const assignedTo =
    assignment.assignedTo?._id?.toString?.() ||
    assignment.assignedTo?.toString?.() ||
    null;

  return {
    assignedUsers,
    assignedTo,
    assignedToRole: assignment.assignedToRole,
    assignmentType:
      assignedUsers.length > 0 || assignedTo
        ? ASSIGNMENT_TYPE_USER
        : ASSIGNMENT_TYPE_ROLE,
    targetRole: assignment.assignedToRole,
    assignedUserId: assignedTo || assignedUsers[0] || null,
    assignedBy:
      assignment.assignedBy?._id?.toString?.() ||
      assignment.assignedBy?.toString?.() ||
      null,
  };
};

const canManageAssignment = (assignment, user) => {
  const userRole = normalizeRole(user.role);

  if (userRole === ROLES.ADMIN) {
    return true;
  }

  if (userRole !== ROLES.HR) {
    return false;
  }
  const assignedById =
    assignment.assignedBy?._id?.toString?.() ||
    assignment.assignedBy?.toString?.() ||
    "";
  return assignedById === String(user.id);
};

const canAccessAssignment = (assignment, user, options = {}) => {
  const { managerView = false } = options;
  const scope = normalizeAssignmentScope(assignment);
  const userRole = normalizeRole(user.role);

  if (userRole === ROLES.ADMIN) {
    return true;
  }

  if (managerView && userRole === ROLES.HR) {
    return canManageAssignment(assignment, user);
  }

  if (scope.assignedUsers.includes(user.id) || scope.assignedTo === user.id) {
    return true;
  }

  return false;
};

const getReviewerAssignmentIds = async (userId) => {
  if (!userId) {
    return [];
  }

  const assignmentIds = await Submission.distinct("assignmentId", {
    reviewerId: userId,
  });
  return assignmentIds.map((item) => item.toString());
};

const isReviewerForAssignment = async (assignmentId, userId) => {
  if (!assignmentId || !userId) {
    return false;
  }

  const reviewerMatch = await Submission.exists({
    assignmentId,
    reviewerId: userId,
  });
  return Boolean(reviewerMatch);
};

const ensureAssignmentAccess = async (
  assignment,
  user,
  { managerView = false } = {},
) => {
  if (!assignment || !user) {
    return false;
  }

  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (managerView && canManageAssignment(assignment, user)) {
    return true;
  }

  if (canAccessAssignment(assignment, user)) {
    return true;
  }

  return isReviewerForAssignment(assignment._id, user.id);
};

const buildAccessibleAssignmentFilter = async (
  user,
  { managerView = false } = {},
) => {
  const userRole = normalizeRole(user.role);

  if (userRole === ROLES.ADMIN) {
    return {};
  }

  const clauses = [{ assignedUsers: user.id }, { assignedTo: user.id }];
  const reviewerAssignmentIds = await getReviewerAssignmentIds(user.id);

  if (managerView && userRole === ROLES.HR) {
    clauses.push({ assignedBy: user.id });
  }

  if (reviewerAssignmentIds.length > 0) {
    clauses.push({ _id: { $in: reviewerAssignmentIds } });
  }

  return clauses.length > 0 ? { $or: clauses } : { _id: null };
};

const emitAssignmentEvent = (req, eventName, payload) => {
  const io = req.app.get("io");
  if (!io) {
    return;
  }

  io.to("admins").emit(eventName, payload);

  const assignment = payload.assignment || payload.data || payload;
  if (assignment) {
    const scope = normalizeAssignmentScope(assignment);
    const creatorId =
      assignment.createdBy?._id?.toString?.() ||
      assignment.createdBy?.toString?.() ||
      null;
    const assignedById =
      assignment.assignedBy?._id?.toString?.() ||
      assignment.assignedBy?.toString?.() ||
      null;

    if (creatorId) {
      io.to(`user:${creatorId}`).emit(eventName, payload);
    }
    if (assignedById) {
      io.to(`user:${assignedById}`).emit(eventName, payload);
    }

    scope.assignedUsers.forEach((userId) => {
      io.to(`user:${userId}`).emit(eventName, payload);
    });
    if (scope.assignedTo) {
      io.to(`user:${scope.assignedTo}`).emit(eventName, payload);
    }
  }
};

const isLocalUploadPath = (url) => {
  if (!url) return false;
  const normalized = String(url).trim();
  if (/^https?:\/\//i.test(normalized)) {
    return /(^https?:\/\/localhost(:\d+)?[\/\\]uploads[\/\\]|^https?:\/\/127\.0\.0\.1(:\d+)?[\/\\]uploads[\/\\])/i.test(
      normalized,
    );
  }
  return /(^[\/\\]?uploads[\/\\]|[\/\\]uploads[\/\\])/i.test(normalized);
};

const getLocalUploadPath = (url) => {
  if (!url) return null;
  let normalized = String(url).trim();
  if (/^https?:\/\//i.test(normalized)) {
    try {
      normalized = new URL(normalized).pathname;
    } catch (error) {
      normalized = normalized.replace(/^https?:\/\/[^"]+/i, "");
    }
  }
  const trimmed = normalized.replace(/^\/+/, "");
  return path.resolve(__dirname, "..", trimmed);
};

const processAttachments = async (attachments = []) => {
  let changed = false;
  const processed = await Promise.all(
    (attachments || []).map(async (item) => {
      const attachment =
        item && typeof item === "object" ? item : { url: String(item || "") };
      const inputUrl = String(
        attachment.secure_url || attachment.url || "",
      ).trim();

      if (isLocalUploadPath(inputUrl)) {
        const uploaded = await uploadLocalFileToCloudinary(inputUrl);
        if (uploaded) {
          changed = true;
          return uploaded;
        }
      }

      return createStoredAttachment(attachment);
    }),
  );

  return { attachments: processed, changed };
};

const uploadLocalFileToCloudinary = async (urlOrItem) => {
  try {
    const url =
      typeof urlOrItem === "string"
        ? urlOrItem
        : String(urlOrItem.url || urlOrItem.secure_url || "");
    if (!isLocalUploadPath(url)) return null;

    const localPath = getLocalUploadPath(url);
    if (!localPath || !fs.existsSync(localPath)) {
      console.warn("Local attachment file not found for migration:", localPath);
      return null;
    }

    const buffer = fs.readFileSync(localPath);
    const mimeType = require("mime-types").lookup(localPath) || undefined;
    const dataUri = `data:${mimeType || "application/octet-stream"};base64,${buffer.toString("base64")}`;

    const result = await cloudinaryService.uploadFromDataUri(dataUri, {
      folder: "assignments",
      resource_type: "auto",
    });

    if (!result || !result.public_id) {
      console.error(
        "Cloudinary upload returned invalid result for:",
        localPath,
        result,
      );
      return null;
    }

    return {
      name: path.basename(localPath),
      fileName: result.public_id,
      originalFileName: result.original_filename || path.basename(localPath),
      fileType: result.format || mimeType || "",
      mimeType: mimeType || "",
      url: result.secure_url || "",
      size: result.bytes || buffer.length,
      uploadedAt: new Date(),
      public_id: result.public_id,
      secure_url: result.secure_url || null,
      original_filename: result.original_filename || null,
      resource_type: result.resource_type || null,
      format: result.format || null,
      delivery_type: getAttachmentDeliveryType(result),
      bytes: result.bytes || buffer.length,
    };
  } catch (err) {
    console.error(
      "Error uploading local file to Cloudinary:",
      err && err.message ? err.message : err,
    );
    return null;
  }
};

const normalizeDocumentAttachments = async (doc, model) => {
  if (!doc || !Array.isArray(doc.attachments)) {
    return doc;
  }

  const result = await processAttachments(doc.attachments);
  if (!result.changed) {
    return doc;
  }

  if (doc._id && model) {
    await model.findByIdAndUpdate(doc._id, {
      attachments: result.attachments,
    });
  }

  return { ...doc, attachments: result.attachments };
};

const normalizeSubmissionDocument = async (submission) => {
  if (!submission || !Array.isArray(submission.attachments)) {
    return submission;
  }

  const result = await processAttachments(submission.attachments);
  if (!result.changed) {
    return submission;
  }

  const latestProcessed = result.attachments[0] || {};
  await Submission.findByIdAndUpdate(submission._id, {
    attachments: result.attachments,
    // never store or expose Cloudinary URLs
    fileUrl: "",
    fileName: latestProcessed.name || latestProcessed.fileName || "",
    mimeType: latestProcessed.mimeType || latestProcessed.fileType || "",
    size: latestProcessed.size || 0,
  });

  return {
    ...submission,
    attachments: result.attachments,
    fileUrl: "",
    fileName: latestProcessed.name || latestProcessed.fileName || "",
    mimeType: latestProcessed.mimeType || latestProcessed.fileType || "",
    size: latestProcessed.size || 0,
  };
};

const buildAttachmentResponse = (attachment, previewUrl, ttl) => {
  const previewKind = getAttachmentPreviewKind(attachment);
  const deliveryType = getAttachmentDeliveryType(attachment);
  return {
    url: previewUrl,
    previewUrl,
    expiresIn: ttl,
    mimeType: attachment?.mimeType || "",
    resource_type: attachment?.resource_type || "",
    format: attachment?.format || "",
    secure_url: attachment?.secure_url || null,
    delivery_type: deliveryType,
    public_id: attachment?.public_id || null,
    originalFileName:
      attachment?.originalFileName ||
      attachment?.original_filename ||
      attachment?.name ||
      "",
    previewType: previewKind,
    previewable: previewKind !== "unsupported",
  };
};

const logAttachmentPreviewDebug = (
  label,
  attachment,
  previewUrl,
  extra = {},
) => {
  console.log(label, {
    ...extra,
    attachment,
    public_id: attachment?.public_id || null,
    previewUrl,
    mimeType: attachment?.mimeType || null,
    resourceType: attachment?.resource_type || null,
    type: attachment?.type || null,
    delivery_type: getAttachmentDeliveryType(attachment),
    format: attachment?.format || null,
  });
};

const buildAnalytics = async (filter = {}) => {
  const now = new Date();
  const assignmentIds = await Assignment.find(filter, "_id").lean();
  const submissionMatch = assignmentIds.length
    ? { assignmentId: { $in: assignmentIds.map((item) => item._id) } }
    : { assignmentId: null };
  const [
    total,
    completed,
    overdue,
    submitted,
    statusBuckets,
    priorityBuckets,
    submissionBuckets,
  ] = await Promise.all([
    Assignment.countDocuments(filter),
    Assignment.countDocuments(combineFilters(filter, { status: "completed" })),
    Assignment.countDocuments(
      combineFilters(filter, {
        deadline: { $lt: now },
        status: { $nin: ["completed"] },
      }),
    ),
    Assignment.countDocuments(combineFilters(filter, { status: "submitted" })),
    Assignment.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Assignment.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Submission.aggregate([
      { $match: submissionMatch },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = STATUS_LIST.reduce((acc, status) => {
    acc[status] =
      statusBuckets.find((bucket) => bucket._id === status)?.count || 0;
    return acc;
  }, {});

  const priorityCounts = PRIORITY_LIST.reduce((acc, priority) => {
    acc[priority] =
      priorityBuckets.find((bucket) => bucket._id === priority)?.count || 0;
    return acc;
  }, {});

  const submissionCounts = [
    "submitted",
    "approved",
    "rejected",
    "pending",
  ].reduce((acc, status) => {
    acc[status] =
      submissionBuckets.find((bucket) => bucket._id === status)?.count || 0;
    return acc;
  }, {});

  return {
    total,
    completed,
    overdue,
    submitted,
    statusCounts,
    priorityCounts,
    submissions: submissionCounts,
  };
};

const sanitizeAssignmentPayload = async (payload, actor) => {
  const assignmentType =
    payload.assignmentType === ASSIGNMENT_TYPE_USER
      ? ASSIGNMENT_TYPE_USER
      : ASSIGNMENT_TYPE_ROLE;

  if (assignmentType === ASSIGNMENT_TYPE_ROLE) {
    const assignedToRole =
      payload.targetRole || payload.assignedToRole || ROLES.USER;

    if (actor.role === ROLES.HR && assignedToRole !== ROLES.USER) {
      return {
        error: "HR users can only assign work to employees.",
        status: 403,
      };
    }

    return {
      assignmentType,
      assignedUsers: [],
      assignedTo: null,
      assignedToRole,
      targetRole: assignedToRole,
      assignedUserId: null,
      resolvedUsers: [],
    };
  }

  const assignedUserId = String(
    payload.assignedUserId || payload.assignedTo || "",
  ).trim();
  const userFilter =
    actor.role === ROLES.HR
      ? {
          _id: assignedUserId,
          role: { $in: getRoleVariants(ROLES.USER) },
          isActive: true,
        }
      : { _id: assignedUserId, isActive: true };
  const resolvedUser = assignedUserId
    ? await User.findOne(userFilter, "name email role isActive").lean()
    : null;

  if (!resolvedUser) {
    return {
      error:
        "Assigned user is invalid, inactive, or outside your assignment scope",
    };
  }

  return {
    assignmentType,
    assignedUsers: [resolvedUser._id],
    assignedTo: resolvedUser._id,
    assignedToRole: normalizeRole(resolvedUser.role),
    targetRole: null,
    assignedUserId: resolvedUser._id.toString(),
    resolvedUsers: [resolvedUser],
  };
};

exports.getAssignableUsers = async (req, res) => {
  try {
    const userRole = normalizeRole(req.user.role);
    let filter = { isActive: true };

    if (userRole === ROLES.HR) {
      filter = {
        role: {
          $in: [...getRoleVariants(ROLES.HR), ...getRoleVariants(ROLES.USER)],
        },
        isActive: true,
      };
    } else if (userRole === ROLES.USER) {
      filter = {
        role: { $in: getRoleVariants(ROLES.USER) },
        isActive: true,
      };
    }

    const users = await User.find(filter, "name email role isActive")
      .sort({ role: 1, name: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get assignable users error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load assignable users right now",
    });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const scope = await sanitizeAssignmentPayload(req.body, req.user);
    if (scope.error) {
      return res
        .status(scope.status || 400)
        .json({ success: false, message: scope.error });
    }

    const assignment = await Assignment.create({
      title: req.body.title.trim(),
      description: req.body.description.trim(),
      assignedToRole: scope.assignedToRole,
      assignedUsers: scope.assignedUsers,
      assignedTo: scope.assignedTo,
      assignedBy: req.user.id,
      createdBy: req.user.id,
      creatorRole: req.user.role,
      priority: req.body.priority || "medium",
      deadline: req.body.deadline,
      status: req.body.status || "pending",
      submissionLink: String(req.body.submissionLink || "").trim(),
      attachments: (await processAttachments(req.body.attachments)).attachments,
      remarks: [
        {
          message:
            scope.assignmentType === ASSIGNMENT_TYPE_USER
              ? `Assignment created for ${scope.resolvedUsers.map((user) => user.name).join(", ")}`
              : `Assignment created for role ${scope.assignedToRole}`,
          author: req.user.id,
          authorName: req.user.email,
          role: req.user.role,
          kind: "system",
        },
      ],
    });

    const populatedAssignment = await populateAssignment(
      Assignment.findById(assignment._id),
    ).lean();
    emitAssignmentEvent(req, "assignment_created", populatedAssignment);
    // Activity log
    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ASSIGNMENT_CREATED",
          module: "Assignments",
          description: `Created assignment ${assignment.title}`,
          entityId: assignment._id?.toString(),
          entityType: "Assignment",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create assignment right now",
    });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate(
      "assignedBy",
      "role",
    );

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (!canManageAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this assignment",
      });
    }

    const scope = await sanitizeAssignmentPayload(
      {
        assignmentType:
          req.body.assignmentType !== undefined
            ? req.body.assignmentType
            : normalizeAssignmentScope(assignment).assignmentType,
        targetRole:
          req.body.targetRole !== undefined
            ? req.body.targetRole
            : normalizeAssignmentScope(assignment).targetRole,
        assignedUserId:
          req.body.assignedUserId !== undefined
            ? req.body.assignedUserId
            : normalizeAssignmentScope(assignment).assignedUserId,
      },
      req.user,
    );
    if (scope.error) {
      return res
        .status(scope.status || 400)
        .json({ success: false, message: scope.error });
    }

    const priorAttachments = (assignment.attachments || []).slice();

    const editableFields = [
      "title",
      "description",
      "priority",
      "deadline",
      "status",
      "submissionLink",
      "attachments",
    ];
    editableFields.forEach((field) => {
      if (req.body[field] !== undefined && field !== "attachments") {
        assignment[field] = req.body[field];
      }
    });

    if (req.body.attachments !== undefined) {
      assignment.attachments = (
        await processAttachments(req.body.attachments)
      ).attachments;

      // If attachments were provided, delete any removed Cloudinary assets
      try {
        const priorCloudIds = (priorAttachments || [])
          .map((a) => a.public_id)
          .filter(Boolean);
        const newCloudIds = (assignment.attachments || [])
          .map((a) => a.public_id)
          .filter(Boolean);
        const toDelete = (priorAttachments || []).filter(
          (a) => a.public_id && !newCloudIds.includes(a.public_id),
        );
        await Promise.all(
          toDelete.map((item) =>
            cloudinaryService
              .deleteAsset(item.public_id, item.resource_type || "auto")
              .catch((err) => {
                console.error(
                  "Failed to delete cloudinary asset:",
                  item.public_id,
                  err,
                );
              }),
          ),
        );
      } catch (err) {
        console.error("Error while deleting removed attachments:", err);
      }
    }

    assignment.assignedToRole = scope.assignedToRole;
    assignment.assignedUsers = scope.assignedUsers;
    assignment.assignedTo = scope.assignedTo;
    assignment.completedAt =
      assignment.status === "completed"
        ? assignment.completedAt || new Date()
        : null;

    addRemark(assignment, {
      message: req.body.remark || "Assignment updated",
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: "system",
    });

    await assignment.save();

    const populatedAssignment = await populateAssignment(
      Assignment.findById(assignment._id),
    ).lean();
    emitAssignmentEvent(req, "assignment_updated", populatedAssignment);

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ASSIGNMENT_UPDATED",
          module: "Assignments",
          description: `Updated assignment ${assignment.title}`,
          entityId: assignment._id?.toString(),
          entityType: "Assignment",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update assignment right now",
    });
  }
};

const canTransferToRole = (transferrerRole, recipientRole) => {
  transferrerRole = normalizeRole(transferrerRole);
  recipientRole = normalizeRole(recipientRole);

  if (transferrerRole === ROLES.ADMIN) {
    // Admin can transfer to anyone
    return true;
  }

  if (transferrerRole === ROLES.HR) {
    // HR can transfer to HR or USER, not ADMIN
    return recipientRole === ROLES.HR || recipientRole === ROLES.USER;
  }

  if (transferrerRole === ROLES.USER) {
    // USER can only transfer to USER
    return recipientRole === ROLES.USER;
  }

  return false;
};

const canUserTransferAssignment = (assignment, transferrerUser) => {
  const transferrerRole = normalizeRole(transferrerUser.role);

  if (transferrerRole === ROLES.ADMIN) {
    // Admin can transfer any assignment
    return true;
  }

  if (transferrerRole === ROLES.HR || transferrerRole === ROLES.USER) {
    // HR and USER can only transfer assignments assigned to themselves
    const assignedTo =
      assignment.assignedTo?._id?.toString?.() ||
      assignment.assignedTo?.toString?.() ||
      null;
    return assignedTo === String(transferrerUser.id);
  }

  return false;
};

exports.transferAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("assignedBy", "role")
      .populate("assignedTo", "name email role");

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    // Check if user can transfer this assignment
    if (!canUserTransferAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to transfer this assignment",
      });
    }

    const currentAssigneeId =
      assignment.assignedTo?._id?.toString?.() ||
      assignment.assignedTo?.toString?.() ||
      null;

    if (currentAssigneeId && currentAssigneeId === req.body.assignedTo) {
      return res.status(400).json({
        success: false,
        message: "The selected user is already assigned to this task",
      });
    }

    // Get the new assignee and check transfer permissions
    const newAssignee = await User.findById(
      req.body.assignedTo,
      "name email role isActive",
    );

    if (!newAssignee || !newAssignee.isActive) {
      return res.status(404).json({
        success: false,
        message: "New assignee not found or is inactive",
      });
    }

    // Check if transfer to this role is allowed
    if (!canTransferToRole(req.user.role, newAssignee.role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot transfer assignments to ${normalizeRole(newAssignee.role)} users`,
      });
    }

    // Save old assignee info for history
    const oldAssignee = assignment.assignedTo
      ? {
          _id: assignment.assignedTo._id,
          name: assignment.assignedTo.name,
          email: assignment.assignedTo.email,
          role: assignment.assignedTo.role,
        }
      : null;

    assignment.assignedUsers = [newAssignee._id];
    assignment.assignedTo = newAssignee._id;
    assignment.assignedToRole = normalizeRole(newAssignee.role);
    assignment.assignedBy = newAssignee._id;

    addRemark(assignment, {
      message:
        `Transferred assignment to ${newAssignee.name}` +
        (req.body.note ? `: ${String(req.body.note).trim()}` : ""),
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: "system",
    });

    await assignment.save();

    // Create transfer history
    try {
      await AssignmentTransferHistory.create({
        assignmentId: assignment._id,
        oldAssigneeId: oldAssignee?._id || null,
        newAssigneeId: newAssignee._id,
        transferredBy: req.user.id,
        transferReason: String(req.body.note || "").trim(),
        assignmentTitle: assignment.title,
        oldAssigneeName: oldAssignee?.name || "Unassigned",
        newAssigneeName: newAssignee.name,
        transferredByName: req.user.email,
        transferredByRole: normalizeRole(req.user.role),
      });
    } catch (err) {
      console.error("Failed to create transfer history:", err);
    }

    const populatedAssignment = await populateAssignment(
      Assignment.findById(assignment._id),
    ).lean();

    // Emit socket events to both old and new assignees
    emitAssignmentEvent(req, "assignment_transferred", populatedAssignment);

    // Notify new assignee
    if (newAssignee._id) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${newAssignee._id}`).emit("assignment_transferred", {
          type: "transferred_to_you",
          assignment: populatedAssignment,
          message: `You received a transferred assignment: ${assignment.title}`,
          timestamp: new Date(),
        });
      }
    }

    // Notify old assignee
    if (oldAssignee?._id) {
      const io = req.app.get("io");
      if (io) {
        io.to(`user:${oldAssignee._id}`).emit("assignment_transferred", {
          type: "transferred_from_you",
          assignment: populatedAssignment,
          message: `Assignment transferred: ${assignment.title}`,
          timestamp: new Date(),
        });
      }
    }

    try {
      if (req && typeof req.logActivity === "function") {
        const transferredAt = new Date();
        req.logActivity({
          action: "ASSIGNMENT_TRANSFERRED",
          module: "Assignments",
          description: `Transferred assignment "${assignment.title}" from ${oldAssignee?.name || "unassigned"} to ${newAssignee.name}`,
          entityId: assignment._id?.toString(),
          entityType: "Assignment",
          metadata: {
            fromUser: oldAssignee?._id?.toString?.() || null,
            toUser: newAssignee._id?.toString?.() || null,
            transferredBy: req.user.id?.toString?.() || req.user.id,
            timestamp: transferredAt,
          },
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment transferred successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Transfer assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to transfer assignment right now",
    });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate("assignedBy", "role")
      .lean();

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (!canManageAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this assignment",
      });
    }

    // Delete Cloudinary assets for the assignment and its submissions
    try {
      const submissions = await Submission.find({
        assignmentId: req.params.id,
      }).lean();
      const assignmentAttachments = assignment.attachments || [];
      const submissionAttachments = submissions.flatMap(
        (s) => s.attachments || [],
      );
      const allToDelete = [
        ...assignmentAttachments,
        ...submissionAttachments,
      ].filter((a) => a && a.public_id);
      await Promise.all(
        allToDelete.map((item) =>
          cloudinaryService
            .deleteAsset(item.public_id, item.resource_type || "auto")
            .catch((err) => {
              console.error(
                "Failed to delete cloudinary asset during assignment delete:",
                item.public_id,
                err,
              );
            }),
        ),
      );
    } catch (err) {
      console.error(
        "Error while deleting cloudinary assets for assignment:",
        err,
      );
    }

    await Promise.all([
      Assignment.findByIdAndDelete(req.params.id),
      Submission.deleteMany({ assignmentId: req.params.id }),
    ]);
    emitAssignmentEvent(req, "assignment_deleted", assignment);

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ASSIGNMENT_DELETED",
          module: "Assignments",
          description: `Deleted assignment ${assignment.title}`,
          entityId: req.params.id,
          entityType: "Assignment",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment deleted successfully",
    });
  } catch (error) {
    console.error("Delete assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to delete assignment right now",
    });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const pagination = buildPagination(req.query);
    const accessibleFilter = await buildAccessibleAssignmentFilter(req.user, {
      managerView: true,
    });
    const filter = combineFilters(accessibleFilter, buildListFilter(req.query));
    const sort = buildSort(req.query);

    let [assignments, total, analytics] = await Promise.all([
      populateAssignment(
        Assignment.find(filter)
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Assignment.countDocuments(filter),
      buildAnalytics(filter),
    ]);

    assignments = await Promise.all(
      assignments.map(async (assignment) =>
        normalizeDocumentAttachments(assignment, Assignment),
      ),
    );

    return res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1,
      },
      analytics,
    });
  } catch (error) {
    console.error("Get assignments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load assignments right now",
    });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    let assignment = await populateAssignment(
      Assignment.findById(req.params.id),
    ).lean();

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (
      !(await ensureAssignmentAccess(assignment, req.user, {
        managerView: true,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this assignment",
      });
    }

    const assignmentProcess = await processAttachments(assignment.attachments);
    if (assignmentProcess.changed) {
      await Assignment.findByIdAndUpdate(assignment._id, {
        attachments: assignmentProcess.attachments,
      });
      assignment.attachments = assignmentProcess.attachments;
    }

    const submissions = await populateSubmission(
      Submission.find({ assignmentId: assignment._id }).sort({
        submittedAt: -1,
      }),
    ).lean();

    const visibleSubmissions =
      req.user.role === ROLES.ADMIN || canManageAssignment(assignment, req.user)
        ? submissions
        : submissions.filter((submission) => {
            const submissionUserId =
              submission.userId?._id?.toString?.() ||
              submission.userId?.toString?.() ||
              "";
            const reviewerUserId =
              submission.reviewerId?._id?.toString?.() ||
              submission.reviewerId?.toString?.() ||
              "";
            return (
              submissionUserId === String(req.user.id) ||
              reviewerUserId === String(req.user.id)
            );
          });

    const migratedSubmissions = await Promise.all(
      visibleSubmissions.map(async (submission) => {
        const submissionProcess = await processAttachments(
          submission.attachments,
        );
        if (!submissionProcess.changed) {
          return submission;
        }

        const latestProcessed = submissionProcess.attachments[0] || {};
        await Submission.findByIdAndUpdate(submission._id, {
          attachments: submissionProcess.attachments,
          // never store or expose Cloudinary URLs
          fileUrl: "",
          fileName: latestProcessed.name || latestProcessed.fileName || "",
          mimeType: latestProcessed.mimeType || latestProcessed.fileType || "",
          size: latestProcessed.size || 0,
        });

        return {
          ...submission,
          attachments: submissionProcess.attachments,
          fileUrl: "",
          fileName: latestProcessed.name || latestProcessed.fileName || "",
          mimeType: latestProcessed.mimeType || latestProcessed.fileType || "",
          size: latestProcessed.size || 0,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      data: {
        ...assignment,
        submissions: migratedSubmissions,
      },
    });
  } catch (error) {
    console.error("Get assignment by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the assignment right now",
    });
  }
};

exports.getMyAssignments = async (req, res) => {
  try {
    const pagination = buildPagination(req.query);
    const sort = buildSort(req.query);
    const accessibleFilter = await buildAccessibleAssignmentFilter(req.user);
    const filter = combineFilters(accessibleFilter, buildListFilter(req.query));

    let [assignments, total, analytics] = await Promise.all([
      populateAssignment(
        Assignment.find(filter)
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Assignment.countDocuments(filter),
      buildAnalytics(filter),
    ]);

    assignments = await Promise.all(
      assignments.map(async (assignment) =>
        normalizeDocumentAttachments(assignment, Assignment),
      ),
    );

    return res.status(200).json({
      success: true,
      data: assignments,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1,
      },
      analytics,
    });
  } catch (error) {
    console.error("Get my assignments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load your assignments right now",
    });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    console.log(req.user.role);
    console.log(req.user.id);
    console.log(assignment.assignedTo);

    const isOwner =
      assignment.assignedTo?.toString() === req.user.id?.toString();
    const isAdmin = normalizeRole(req.user.role) === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const revision =
      (await Submission.countDocuments({
        assignmentId: assignment._id,
        userId: req.user.id,
      })) + 1;

    const processedResult = await processAttachments(req.body.attachments);
    const processedAttachments = processedResult.attachments;
    const latestProcessed = processedAttachments[0];

    const submission = await Submission.create({
      assignmentId: assignment._id,
      userId: req.user.id,
      submissionLink: String(req.body.submissionLink || "").trim(),
      attachments: processedAttachments,
      // never store or expose Cloudinary URLs
      fileUrl: "",
      fileName: latestProcessed?.name || latestProcessed?.fileName || "",
      mimeType: latestProcessed?.mimeType || latestProcessed?.fileType || "",
      size: latestProcessed?.size || 0,
      content: String(req.body.content || "").trim(),
      note: String(req.body.note || "").trim(),
      status: "submitted",
      revision,
      comments: req.body.note
        ? [
            {
              message: String(req.body.note).trim(),
              authorId: req.user.id,
              authorRole: req.user.role,
            },
          ]
        : [],
    });

    assignment.submissionLink =
      submission.submissionLink || assignment.submissionLink;
    assignment.attachments = submission.attachments.length
      ? submission.attachments.map(createStoredAttachment)
      : assignment.attachments;
    assignment.status = req.body.status || "submitted";
    assignment.lastSubmittedAt = submission.submittedAt;
    assignment.completedAt = null;

    addRemark(assignment, {
      message: req.body.note || `Submission revision ${revision} received`,
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: "submission",
    });

    await assignment.save();

    const [populatedAssignment, populatedSubmission] = await Promise.all([
      populateAssignment(Assignment.findById(assignment._id)).lean(),
      populateSubmission(Submission.findById(submission._id)).lean(),
    ]);

    emitAssignmentEvent(req, "assignment_updated", populatedAssignment);
    emitAssignmentEvent(req, "submission_created", {
      assignment: populatedAssignment,
      submission: populatedSubmission,
    });

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ASSIGNMENT_SUBMITTED",
          module: "Assignments",
          description: `Submission ${submission._id} created for assignment ${assignment._id}`,
          entityId: submission._id?.toString(),
          entityType: "Submission",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      data: {
        assignment: populatedAssignment,
        submission: populatedSubmission,
      },
    });
  } catch (error) {
    console.error("Submit assignment error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to submit assignment right now",
    });
  }
};

exports.updateAssignmentStatus = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const nextStatus = req.body.status;
    const isAssignee = canAccessAssignment(assignment, req.user);
    const isManager = canManageAssignment(assignment, req.user);

    if (isManager) {
      assignment.status = nextStatus;
      assignment.completedAt = nextStatus === "completed" ? new Date() : null;
      assignment.lastReviewedAt = new Date();
    } else if (
      isAssignee &&
      ["pending", "in_progress", "submitted"].includes(nextStatus)
    ) {
      assignment.status = nextStatus;
      assignment.completedAt = null;
    } else {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to set this status",
      });
    }

    addRemark(assignment, {
      message: req.body.remark || `Status updated to ${nextStatus}`,
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: isManager ? "feedback" : "system",
    });

    await assignment.save();

    const populatedAssignment = await populateAssignment(
      Assignment.findById(assignment._id),
    ).lean();
    emitAssignmentEvent(
      req,
      nextStatus === "completed"
        ? "assignment_completed"
        : "assignment_updated",
      populatedAssignment,
    );

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "ASSIGNMENT_STATUS_UPDATED",
          module: "Assignments",
          description: `Assignment ${assignment._id} status set to ${nextStatus}`,
          entityId: assignment._id?.toString(),
          entityType: "Assignment",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Assignment status updated successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Update assignment status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update assignment status right now",
    });
  }
};

exports.addAssignmentFeedback = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (!canManageAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this assignment",
      });
    }

    addRemark(assignment, {
      message: req.body.message,
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: "feedback",
    });

    if (req.body.status) {
      assignment.status = req.body.status;
      assignment.completedAt =
        req.body.status === "completed" ? new Date() : null;
      assignment.lastReviewedAt = new Date();
    }

    await assignment.save();

    const populatedAssignment = await populateAssignment(
      Assignment.findById(assignment._id),
    ).lean();
    emitAssignmentEvent(
      req,
      req.body.status === "completed"
        ? "assignment_completed"
        : "assignment_updated",
      populatedAssignment,
    );

    return res.status(200).json({
      success: true,
      message: "Feedback added successfully",
      data: populatedAssignment,
    });
  } catch (error) {
    console.error("Add assignment feedback error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to add feedback right now",
    });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const pagination = buildPagination(req.query);
    const match = {};

    if (req.query.status) {
      match.status = req.query.status;
    }

    const assignmentScope = await buildAccessibleAssignmentFilter(req.user, {
      managerView: true,
    });
    const assignmentIds = await Assignment.find(assignmentScope, "_id").lean();
    match.assignmentId = { $in: assignmentIds.map((item) => item._id) };

    let [submissions, total] = await Promise.all([
      populateSubmission(
        Submission.find(match)
          .sort({ submittedAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Submission.countDocuments(match),
    ]);

    submissions = await Promise.all(
      submissions.map(async (submission) =>
        normalizeSubmissionDocument(submission),
      ),
    );

    return res.status(200).json({
      success: true,
      data: submissions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1,
      },
    });
  } catch (error) {
    console.error("Get submissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load submissions right now",
    });
  }
};

exports.reviewSubmission = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId);

    if (!submission) {
      return res
        .status(404)
        .json({ success: false, message: "Submission not found" });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment || !canManageAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to review this submission",
      });
    }

    submission.status = req.body.status;
    submission.feedback = String(req.body.feedback || "").trim();
    submission.reviewerId = req.user.id;
    submission.reviewerRole = req.user.role;
    submission.reviewedAt = new Date();

    if (submission.feedback) {
      submission.comments.push({
        message: submission.feedback,
        authorId: req.user.id,
        authorRole: req.user.role,
      });
    }

    assignment.status =
      REVIEW_STATUS_TO_ASSIGNMENT_STATUS[submission.status] ||
      assignment.status;
    assignment.completedAt =
      submission.status === "approved" ? new Date() : null;
    assignment.lastReviewedAt = new Date();

    addRemark(assignment, {
      message:
        submission.feedback ||
        `Submission revision ${submission.revision} ${submission.status}`,
      author: req.user.id,
      authorName: req.user.email,
      role: req.user.role,
      kind: "feedback",
    });

    await Promise.all([submission.save(), assignment.save()]);

    const [populatedAssignment, populatedSubmission] = await Promise.all([
      populateAssignment(Assignment.findById(assignment._id)).lean(),
      populateSubmission(Submission.findById(submission._id)).lean(),
    ]);

    emitAssignmentEvent(req, "assignment_updated", populatedAssignment);
    emitAssignmentEvent(req, "submission_reviewed", {
      assignment: populatedAssignment,
      submission: populatedSubmission,
    });

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "SUBMISSION_REVIEWED",
          module: "Assignments",
          description: `Submission ${submission._id} reviewed: ${submission.status}`,
          entityId: submission._id?.toString(),
          entityType: "Submission",
        });
      }
    } catch (err) {
      console.error("Activity log failed:", err);
    }

    return res.status(200).json({
      success: true,
      message: "Submission reviewed successfully",
      data: {
        assignment: populatedAssignment,
        submission: populatedSubmission,
      },
    });
  } catch (error) {
    console.error("Review submission error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to review the submission right now",
    });
  }
};

exports.getAssignmentAttachments = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (
      !(await ensureAssignmentAccess(assignment, req.user, {
        managerView: true,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const result = await processAttachments(assignment.attachments);
    if (result.changed) {
      await Assignment.findByIdAndUpdate(assignment._id, {
        attachments: result.attachments,
      });
    }

    return res.status(200).json({
      success: true,
      data: result.attachments,
    });
  } catch (error) {
    console.error("Get assignment attachments error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load attachments right now",
    });
  }
};

exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).lean();
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (
      !(await ensureAssignmentAccess(assignment, req.user, {
        managerView: true,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    const submissions = await populateSubmission(
      Submission.find({ assignmentId: assignment._id }).sort({
        submittedAt: -1,
      }),
    ).lean();

    const filteredSubmissions =
      req.user.role === ROLES.ADMIN || canManageAssignment(assignment, req.user)
        ? submissions
        : submissions.filter((submission) => {
            const isOwner =
              String(submission.userId?._id || submission.userId) ===
              String(req.user.id);
            const isReviewer =
              String(submission.reviewerId?._id || submission.reviewerId) ===
              String(req.user.id);
            return isOwner || isReviewer;
          });

    const normalizedSubmissions = await Promise.all(
      filteredSubmissions.map((submission) =>
        normalizeSubmissionDocument(submission),
      ),
    );

    return res.status(200).json({
      success: true,
      data: normalizedSubmissions,
    });
  } catch (error) {
    console.error("Get assignment submissions error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load submissions right now",
    });
  }
};

// Generate a temporary signed preview URL for an assignment attachment
exports.previewAssignmentAttachment = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    let publicId = req.params?.publicId || req.query?.publicId || "";
    publicId = decodeURIComponent(String(publicId || ""));
    const ttl = Math.min(
      300,
      Math.max(60, Number.parseInt(req.query.ttl || "120", 10)),
    );

    console.log("Preview assignment attachment request:", {
      user: req.user?.id,
      role: req.user?.role,
      assignmentId,
      publicId,
    });

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const attachment = (assignment.attachments || []).find(
      (a) => String(a.public_id || "") === String(publicId || ""),
    );
    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });
    }

    if (
      !(await ensureAssignmentAccess(assignment, req.user, {
        managerView: true,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    console.log("Preview assignment attachment object:", attachment);
    console.log("Attachment mimeType:", attachment?.mimeType);
    console.log("Attachment resource_type:", attachment?.resource_type);

    const previewKind = getAttachmentPreviewKind(attachment);
    const deliveryType = getAttachmentDeliveryType(attachment);

    // Resolve Cloudinary resource metadata to determine actual type/resource_type/format
    let cloudResource = null;
    try {
      cloudResource = await cloudinaryService.cloudinaryClient.api.resource(
        attachment.public_id,
        { resource_type: "auto" },
      );
    } catch (err) {
      console.warn(
        "Unable to fetch cloud resource metadata for assignment preview:",
        err?.message || err,
      );
    }

    const resolvedResourceType =
      (cloudResource && cloudResource.resource_type) ||
      attachment.resource_type ||
      "auto";
    const resolvedType =
      (cloudResource && cloudResource.type) ||
      attachment.type ||
      deliveryType ||
      "upload";
    const resolvedFormat =
      (cloudResource && cloudResource.format) || attachment.format || undefined;

    console.log("Preview File:", attachment.public_id);
    console.log("Resource Type:", resolvedResourceType);
    console.log("Delivery Type:", resolvedType);

    // Always generate a signed preview URL using resolved metadata
    const previewUrl = cloudinaryService.generateSignedUrl({
      publicId: attachment.public_id,
      resource_type: resolvedResourceType,
      type: resolvedType,
      expiresInSeconds: ttl,
      download: req.query.download === "1",
      format: resolvedFormat,
      mimeType: attachment?.mimeType,
    });

    console.log("Generated Preview URL:", previewUrl);
    if (
      attachment?.mimeType === "application/pdf" ||
      String(resolvedFormat || "").toLowerCase() === "pdf"
    ) {
      console.log("PDF Preview URL:", previewUrl);
    }

    logAttachmentPreviewDebug(
      "Assignment preview URL generated",
      attachment,
      previewUrl,
      {
        assignmentId,
        previewKind,
        type: resolvedType,
        delivery_type: resolvedResourceType,
        cloudResource,
      },
    );

    if (!previewUrl) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to generate preview URL" });
    }

    return res.status(200).json({
      success: true,
      data: buildAttachmentResponse(attachment, previewUrl, ttl),
    });
  } catch (err) {
    console.error("Preview assignment attachment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to generate preview URL" });
  }
};

exports.getAssignmentTransferHistory = async (req, res) => {
  try {
    const { id: assignmentId } = req.params;
    const pagination = buildPagination(req.query);

    // Check if user has access to this assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (
      !(await ensureAssignmentAccess(assignment, req.user, {
        managerView: true,
      }))
    ) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this assignment",
      });
    }

    const [history, total] = await Promise.all([
      AssignmentTransferHistory.find({ assignmentId })
        .populate("oldAssigneeId", "name email")
        .populate("newAssigneeId", "name email")
        .populate("transferredBy", "name email")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      AssignmentTransferHistory.countDocuments({ assignmentId }),
    ]);

    return res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit) || 1,
      },
    });
  } catch (error) {
    console.error("Get transfer history error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load transfer history right now",
    });
  }
};

exports.previewAssignmentByQuery = async (req, res) => {
  req.params.publicId = req.query.publicId || req.params.publicId;
  return exports.previewAssignmentAttachment(req, res);
};

// Generate a temporary signed preview URL for a submission attachment
exports.previewSubmissionAttachment = async (req, res) => {
  try {
    const { id: assignmentId, submissionId } = req.params;
    let publicId = req.params?.publicId || req.query?.publicId || "";
    publicId = decodeURIComponent(String(publicId || ""));
    const ttl = Math.min(
      300,
      Math.max(60, Number.parseInt(req.query.ttl || "120", 10)),
    );

    const submission = await Submission.findById(submissionId).lean();
    if (
      !submission ||
      String(submission.assignmentId) !== String(assignmentId)
    ) {
      return res.status(404).json({
        success: false,
        message: "Submission not found for this assignment",
      });
    }

    const assignment = await Assignment.findById(assignmentId).lean();
    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    const attachment = (submission.attachments || []).find(
      (a) => String(a.public_id || "") === String(publicId || ""),
    );
    if (!attachment) {
      return res
        .status(404)
        .json({ success: false, message: "Attachment not found" });
    }

    const isUploader = String(submission.userId || "") === String(req.user.id);
    const isReviewer =
      String(submission.reviewerId || "") === String(req.user.id);
    const hasAssignmentAccess = await ensureAssignmentAccess(
      assignment,
      req.user,
      {
        managerView: true,
      },
    );

    if (!hasAssignmentAccess && !isUploader && !isReviewer) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    console.log("Preview submission attachment request:", {
      user: req.user?.id,
      role: req.user?.role,
      assignmentId,
      submissionId,
      publicId,
    });
    console.log("Preview submission attachment object:", attachment);
    console.log("Attachment mimeType:", attachment?.mimeType);
    console.log("Attachment resource_type:", attachment?.resource_type);

    const deliveryType = getAttachmentDeliveryType(attachment);

    // Resolve Cloudinary resource metadata to determine actual type/resource_type/format
    let cloudResource = null;
    try {
      cloudResource = await cloudinaryService.cloudinaryClient.api.resource(
        attachment.public_id,
        { resource_type: "auto" },
      );
    } catch (err) {
      console.warn(
        "Unable to fetch cloud resource metadata for submission preview:",
        err?.message || err,
      );
    }

    const resolvedResourceType =
      (cloudResource && cloudResource.resource_type) ||
      attachment.resource_type ||
      "auto";
    const resolvedType =
      (cloudResource && cloudResource.type) ||
      attachment.type ||
      deliveryType ||
      "upload";
    const resolvedFormat =
      (cloudResource && cloudResource.format) || attachment.format || undefined;

    console.log("Preview File:", attachment.public_id);
    console.log("Resource Type:", resolvedResourceType);
    console.log("Delivery Type:", resolvedType);

    // Always generate a signed preview URL using resolved metadata
    const previewUrl = cloudinaryService.generateSignedUrl({
      publicId: attachment.public_id,
      resource_type: resolvedResourceType,
      type: resolvedType,
      expiresInSeconds: ttl,
      download: req.query.download === "1",
      format: resolvedFormat,
      mimeType: attachment?.mimeType,
    });

    console.log("Generated Preview URL:", previewUrl);
    if (
      attachment?.mimeType === "application/pdf" ||
      String(resolvedFormat || "").toLowerCase() === "pdf"
    ) {
      console.log("PDF Preview URL:", previewUrl);
    }

    logAttachmentPreviewDebug(
      "Submission preview URL generated",
      attachment,
      previewUrl,
      {
        assignmentId,
        submissionId,
        type: resolvedType,
        delivery_type: resolvedResourceType,
        cloudResource,
      },
    );

    if (!previewUrl) {
      return res
        .status(500)
        .json({ success: false, message: "Unable to generate preview URL" });
    }

    return res.status(200).json({
      success: true,
      data: buildAttachmentResponse(attachment, previewUrl, ttl),
    });
  } catch (err) {
    console.error("Preview submission attachment error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Unable to generate preview URL" });
  }
};

exports.uploadAssignmentFile = async (req, res) => {
  try {
    // ===== PERMISSION CHECK: Role-based authorization for file uploads =====
    // ADMIN: Always allowed
    // HR: Allowed (can upload for their assignments and submissions)
    // USER: Allowed (can upload for their own assignments and submissions)
    console.log("[UPLOAD] User initiating file upload:", {
      userId: req.user?.id,
      role: req.user?.role,
      email: req.user?.email,
    });

    const isAdmin = req.user?.role === ROLES.ADMIN;
    const isHR = req.user?.role === ROLES.HR;
    const isUser = req.user?.role === ROLES.USER;

    if (!isAdmin && !isHR && !isUser) {
      console.log("[UPLOAD] DENIED: Invalid role", {
        userId: req.user?.id,
        role: req.user?.role,
      });
      return res.status(403).json({
        success: false,
        message: "You do not have permission to upload files. Invalid role.",
      });
    }

    console.log("[UPLOAD] Permission check passed for role:", req.user?.role);
    // ===== END PERMISSION CHECK =====

    const match = String(req.body?.file || "").match(/^data:(.+);base64,(.+)$/);
    const fileName = String(req.body?.fileName || "").trim();
    const mimeType = String(req.body?.mimeType || "").trim() || match?.[1];

    if (!match || !fileName) {
      console.log("[UPLOAD] FAILED: Invalid file payload");
      return res.status(400).json({
        success: false,
        message: "A valid file payload is required",
      });
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > FILE_SIZE_LIMIT) {
      console.log("[UPLOAD] FAILED: File too large", {
        size: buffer.length,
        limit: FILE_SIZE_LIMIT,
      });
      return res.status(400).json({
        success: false,
        message: "File size must be 5MB or less",
      });
    }

    // Upload directly to Cloudinary instead of saving locally
    const dataUri = match[0];
    let uploadResult;
    try {
      console.log("[UPLOAD] Starting Cloudinary upload for file:", {
        fileName,
        mimeType,
        size: buffer.length,
      });
      uploadResult = await cloudinaryService.uploadFromDataUri(dataUri, {
        folder: "assignments",
        resource_type: "auto",
        type: "upload",
      });
      console.log("[UPLOAD] Cloudinary upload succeeded:", {
        public_id: uploadResult.public_id,
        size: uploadResult.bytes,
      });
    } catch (err) {
      console.error("[UPLOAD] Cloudinary upload failed:", {
        error: err.message,
        userId: req.user?.id,
        role: req.user?.role,
      });
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: err.message || String(err),
      });
    }

    console.log(
      "[UPLOAD] Cloudinary upload succeeded for assignment file:",
      uploadResult.public_id,
    );
    console.log("[UPLOAD] Cloudinary response metadata:", {
      public_id: uploadResult.public_id,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      secure_url: uploadResult.secure_url ? "present" : "missing",
    });

    const now = new Date();
    const attachment = createStoredAttachment({
      name: fileName,
      fileName: uploadResult.public_id,
      originalFileName: uploadResult.original_filename || fileName,
      fileType: uploadResult.format || mimeType,
      mimeType: mimeType,
      size: uploadResult.bytes || buffer.length,
      uploadedAt: now,
      public_id: uploadResult.public_id,
      secure_url: uploadResult.secure_url,
      original_filename: uploadResult.original_filename,
      resource_type: uploadResult.resource_type,
      format: uploadResult.format,
      delivery_type:
        uploadResult.type || getAttachmentDeliveryType(uploadResult),
      bytes: uploadResult.bytes,
    });
    console.log("[UPLOAD] Attachment metadata created:", {
      public_id: attachment.public_id,
      mimeType: attachment.mimeType,
      size: attachment.size,
    });

    try {
      if (req && typeof req.logActivity === "function") {
        req.logActivity({
          action: "FILE_UPLOADED",
          module: "Assignments",
          description: `Uploaded file ${fileName}`,
          entityId: uploadResult?.public_id || null,
          entityType: "Attachment",
        });
      }
    } catch (err) {
      console.error("[UPLOAD] Activity log failed:", err);
    }

    console.log("[UPLOAD] SUCCESS: File uploaded and returning to user:", {
      userId: req.user?.id,
      fileName,
      public_id: attachment.public_id,
    });
    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    console.error("[UPLOAD] Unexpected error during upload:", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      role: req.user?.role,
    });
    return res.status(500).json({
      success: false,
      message: "Unable to upload the file right now",
    });
  }
};

// Generate a signed preview URL for a newly uploaded file (during submission form)
exports.previewUploadedAttachment = async (req, res) => {
  try {
    let publicId = req.params?.publicId || req.query?.publicId || "";
    publicId = decodeURIComponent(String(publicId || ""));
    const ttl = Math.min(
      300,
      Math.max(60, Number.parseInt(req.query.ttl || "120", 10)),
    );

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }
    console.log("Generating preview for uploaded attachment:", { publicId });

    // Prefer explicit secure_url query param if caller provided it
    const rawSecureUrl = String(
      req.query.secure_url || req.query.secureUrl || "",
    ).trim();
    let resolvedSecureUrl = rawSecureUrl
      ? decodeURIComponent(rawSecureUrl)
      : null;

    let cloudResource = null;
    // Try to fetch Cloudinary resource metadata to determine resource_type/type/format
    try {
      cloudResource = await cloudinaryService.cloudinaryClient.api.resource(
        publicId,
        {
          resource_type: "auto",
        },
      );
    } catch (err) {
      console.warn(
        "Unable to resolve Cloudinary resource for preview-upload:",
        err?.message || err,
      );
    }

    // Determine resource/type/format for signing
    const resourceType =
      (cloudResource && cloudResource.resource_type) || "auto";
    const deliveryType = (cloudResource && cloudResource.type) || "upload";
    const format =
      (cloudResource && cloudResource.format) ||
      String(req.query.format || "").trim() ||
      undefined;
    const mimeType = String(req.query.mimeType || "").trim() || undefined;

    console.log("Preview File:", publicId);
    console.log("Resource Type:", resourceType);

    // Always generate a signed preview URL rather than returning raw secure_url
    const previewUrl = cloudinaryService.generateSignedUrl({
      publicId,
      resource_type: resourceType || "auto",
      type: deliveryType,
      expiresInSeconds: ttl,
      download: req.query.download === "1",
      format,
      mimeType,
    });

    console.log("Uploaded attachment cloud resource:", cloudResource);
    console.log("Generated Preview URL:", previewUrl);
    if (String(format || "").toLowerCase() === "pdf") {
      console.log("PDF Preview URL:", previewUrl);
    }

    if (!previewUrl) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate preview URL",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        previewUrl,
        url: previewUrl,
        expiresIn: ttl,
        previewable: true,
      },
    });
  } catch (err) {
    console.error("Preview uploaded attachment error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to generate preview URL",
    });
  }
};
