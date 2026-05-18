const fs = require("fs");
const path = require("path");
const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");
const User = require("../models/User");
const { ROLES, getRoleVariants, normalizeRole } = require("../constants/rbac");

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
const FILE_SIZE_LIMIT = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const uploadsDir = path.resolve(__dirname, "..", "uploads", "assignments");

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

const getAssignmentCreatorRole = (assignment) =>
  normalizeRole(
    assignment.creatorRole ||
      assignment.assignedBy?.role ||
      assignment.assignedToRole ||
      ROLES.USER,
  );

const canManageAssignment = (assignment, user) => {
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (user.role !== ROLES.HR) {
    return false;
  }

  return getAssignmentCreatorRole(assignment) === ROLES.HR;
};

const canAccessAssignment = (assignment, user, options = {}) => {
  const { managerView = false } = options;
  const scope = normalizeAssignmentScope(assignment);

  if (user.role === ROLES.ADMIN) {
    return true;
  }

  if (managerView && user.role === ROLES.HR) {
    return canManageAssignment(assignment, user);
  }

  if (scope.assignedUsers.includes(user.id) || scope.assignedTo === user.id) {
    return true;
  }

  if (scope.assignedToRole === "BOTH") {
    return user.role === ROLES.HR || user.role === ROLES.USER;
  }

  return scope.assignedToRole === user.role;
};

const buildAccessibleAssignmentFilter = (
  user,
  { managerView = false } = {},
) => {
  if (user.role === ROLES.ADMIN) {
    return {};
  }

  if (managerView && user.role === ROLES.HR) {
    return {
      $or: [
        { creatorRole: ROLES.HR },
        { assignedUsers: user.id },
        { assignedTo: user.id },
        { assignedToRole: ROLES.HR },
        { assignedToRole: "BOTH" },
      ],
    };
  }

  const roleTargets =
    user.role === ROLES.HR ? [ROLES.HR, "BOTH"] : [ROLES.USER, "BOTH"];
  return {
    $or: [
      { assignedUsers: user.id },
      { assignedTo: user.id },
      { assignedToRole: { $in: roleTargets } },
    ],
  };
};

const emitAssignmentEvent = (req, eventName, payload) => {
  const io = req.app.get("io");
  if (!io) {
    return;
  }

  io.to("admins").emit(eventName, payload);
  io.to("hrs").emit(eventName, payload);

  const assignment = payload.assignment || payload.data || payload;
  if (assignment) {
    const scope = normalizeAssignmentScope(assignment);
    scope.assignedUsers.forEach((userId) => {
      io.to(`user:${userId}`).emit(eventName, payload);
    });
    if (scope.assignedTo) {
      io.to(`user:${scope.assignedTo}`).emit(eventName, payload);
    }
  }
};

const ensureUploadDirectory = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
};

const createStoredAttachment = ({ name, url, mimeType, size }) => ({
  name: String(name || "").trim(),
  url: String(url || "").trim(),
  mimeType: String(mimeType || "").trim(),
  size: Number(size || 0),
});

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
    const filter =
      req.user.role === ROLES.HR
        ? { role: { $in: getRoleVariants(ROLES.USER) }, isActive: true }
        : { isActive: true };

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
      attachments: req.body.attachments || [],
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
      if (req.body[field] !== undefined) {
        assignment[field] = req.body[field];
      }
    });

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

    await Promise.all([
      Assignment.findByIdAndDelete(req.params.id),
      Submission.deleteMany({ assignmentId: req.params.id }),
    ]);
    emitAssignmentEvent(req, "assignment_deleted", assignment);

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
    const filter = combineFilters(
      buildAccessibleAssignmentFilter(req.user, { managerView: true }),
      buildListFilter(req.query),
    );
    const sort = buildSort(req.query);

    const [assignments, total, analytics] = await Promise.all([
      populateAssignment(
        Assignment.find(filter)
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Assignment.countDocuments(filter),
      buildAnalytics(filter),
    ]);

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
    const assignment = await populateAssignment(
      Assignment.findById(req.params.id),
    ).lean();

    if (!assignment) {
      return res
        .status(404)
        .json({ success: false, message: "Assignment not found" });
    }

    if (!canAccessAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this assignment",
      });
    }

    const submissions = await populateSubmission(
      Submission.find({ assignmentId: assignment._id }).sort({
        submittedAt: -1,
      }),
    ).lean();

    return res.status(200).json({
      success: true,
      data: {
        ...assignment,
        submissions,
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
    const filter = combineFilters(
      buildAccessibleAssignmentFilter(req.user),
      buildListFilter(req.query),
    );

    const [assignments, total, analytics] = await Promise.all([
      populateAssignment(
        Assignment.find(filter)
          .sort(sort)
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Assignment.countDocuments(filter),
      buildAnalytics(filter),
    ]);

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

    if (!canAccessAssignment(assignment, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only submit your own assignments",
      });
    }

    const revision =
      (await Submission.countDocuments({
        assignmentId: assignment._id,
        userId: req.user.id,
      })) + 1;

    const latestAttachment = req.body.attachments?.[0];
    const submission = await Submission.create({
      assignmentId: assignment._id,
      userId: req.user.id,
      submissionLink: String(req.body.submissionLink || "").trim(),
      attachments: req.body.attachments || [],
      fileUrl: latestAttachment?.url || "",
      fileName: latestAttachment?.name || "",
      mimeType: latestAttachment?.mimeType || "",
      size: latestAttachment?.size || 0,
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

    const assignmentScope = buildAccessibleAssignmentFilter(req.user, {
      managerView: true,
    });
    const assignmentIds = await Assignment.find(assignmentScope, "_id").lean();
    match.assignmentId = { $in: assignmentIds.map((item) => item._id) };

    const [submissions, total] = await Promise.all([
      populateSubmission(
        Submission.find(match)
          .sort({ submittedAt: -1 })
          .skip(pagination.skip)
          .limit(pagination.limit),
      ).lean(),
      Submission.countDocuments(match),
    ]);

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

exports.uploadAssignmentFile = async (req, res) => {
  try {
    const match = String(req.body?.file || "").match(/^data:(.+);base64,(.+)$/);
    const fileName = String(req.body?.fileName || "").trim();
    const mimeType = String(req.body?.mimeType || "").trim() || match?.[1];

    if (!match || !fileName) {
      return res.status(400).json({
        success: false,
        message: "A valid file payload is required",
      });
    }

    if (!ALLOWED_FILE_TYPES.includes(mimeType)) {
      return res.status(400).json({
        success: false,
        message: "Only PDF, DOC, DOCX, and image files are allowed",
      });
    }

    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > FILE_SIZE_LIMIT) {
      return res.status(400).json({
        success: false,
        message: "File size must be 5MB or less",
      });
    }

    ensureUploadDirectory();
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
    const diskPath = path.join(uploadsDir, uniqueName);
    fs.writeFileSync(diskPath, buffer);

    const attachment = {
      name: fileName,
      url: `/uploads/assignments/${uniqueName}`,
      mimeType,
      size: buffer.length,
    };

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    console.error("Upload assignment file error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to upload the file right now",
    });
  }
};
