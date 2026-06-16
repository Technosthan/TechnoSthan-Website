const mongoose = require("mongoose");
const { ROLES } = require("../constants/rbac");

const VALID_ASSIGNMENT_STATUSES = [
  "pending",
  "in_progress",
  "submitted",
  "completed",
  "rejected",
];
const VALID_SUBMISSION_STATUSES = [
  "pending",
  "submitted",
  "approved",
  "rejected",
];
const VALID_PRIORITIES = ["low", "medium", "high", "urgent"];
const VALID_ROLE_TARGETS = [ROLES.HR, ROLES.USER, "BOTH"];
const VALID_ASSIGNMENT_TYPES = ["role", "user"];

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeAttachments = (attachments) => {
  if (!attachments) {
    return [];
  }

  if (!Array.isArray(attachments)) {
    return null;
  }

  const normalized = attachments
    .map((item) => {
      if (typeof item === "string") {
        const url = String(item).trim();
        return {
          name: "",
          url,
          secure_url: url,
          mimeType: "",
          size: 0,
          public_id: null,
          original_filename: null,
          resource_type: null,
          format: null,
          bytes: 0,
        };
      }

      if (!item || typeof item !== "object") {
        return null;
      }

      const url = String(item.secure_url || item.url || "").trim();
      return {
        name: String(item.name || "").trim(),
        url,
        secure_url: url || null,
        mimeType: String(item.mimeType || "").trim(),
        size: Number(item.size || item.bytes || 0),
        fileName: String(item.fileName || item.name || "").trim(),
        originalFileName: String(
          item.originalFileName || item.original_filename || item.name || "",
        ).trim(),
        fileType: String(
          item.fileType || item.mimeType || item.format || "",
        ).trim(),
        uploadedAt: item.uploadedAt ? new Date(item.uploadedAt) : undefined,
        public_id: String(item.public_id || "").trim() || null,
        original_filename:
          String(
            item.original_filename || item.originalFileName || "",
          ).trim() || null,
        resource_type: String(item.resource_type || "").trim() || null,
        format: String(item.format || "").trim() || null,
        bytes: Number(item.bytes || item.size || 0),
      };
    })
    .filter((item) => item && item.url);

  return normalized;
};

const parseDeadline = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeAssignmentTarget = (body = {}) => {
  const assignmentType =
    body.assignmentType === "user" || body.assignedUserId || body.assignedTo
      ? "user"
      : "role";
  const targetRole = body.targetRole || body.assignedToRole;
  const assignedUserId = body.assignedUserId || body.assignedTo;

  return {
    assignmentType,
    targetRole,
    assignedUserId: assignedUserId ? String(assignedUserId).trim() : "",
  };
};

const sendValidationError = (res, message) =>
  res.status(400).json({
    success: false,
    message,
  });

exports.validateCreateAssignment = (req, res, next) => {
  const { title, description, priority, deadline, status } = req.body;
  const attachments = normalizeAttachments(req.body.attachments);
  const { assignmentType, targetRole, assignedUserId } =
    normalizeAssignmentTarget(req.body);

  if (!title || !String(title).trim()) {
    return sendValidationError(res, "Title is required");
  }

  if (!description || !String(description).trim()) {
    return sendValidationError(res, "Description is required");
  }

  if (priority && !VALID_PRIORITIES.includes(priority)) {
    return sendValidationError(res, "Invalid priority value");
  }

  if (status && !VALID_ASSIGNMENT_STATUSES.includes(status)) {
    return sendValidationError(res, "Invalid status value");
  }

  if (!VALID_ASSIGNMENT_TYPES.includes(assignmentType)) {
    return sendValidationError(res, "Invalid assignment type");
  }

  if (
    assignmentType === "role" &&
    (!targetRole || !VALID_ROLE_TARGETS.includes(targetRole))
  ) {
    return sendValidationError(res, "Target role is required");
  }

  if (assignmentType === "user" && !assignedUserId) {
    return sendValidationError(res, "Assigned user is required");
  }

  if (assignmentType === "user" && !isValidObjectId(assignedUserId)) {
    return sendValidationError(res, "Assigned user must be a valid user id");
  }

  const parsedDeadline = parseDeadline(deadline);
  if (!parsedDeadline) {
    return sendValidationError(res, "A valid deadline is required");
  }

  if (attachments === null) {
    return sendValidationError(res, "Attachments must be a valid array");
  }

  req.body.attachments = attachments;
  req.body.assignmentType = assignmentType;
  req.body.targetRole = assignmentType === "role" ? targetRole : null;
  req.body.assignedUserId = assignmentType === "user" ? assignedUserId : null;
  req.body.deadline = parsedDeadline;
  next();
};

exports.validateUpdateAssignment = (req, res, next) => {
  const editableFields = [
    "title",
    "description",
    "assignmentType",
    "targetRole",
    "assignedUserId",
    "priority",
    "deadline",
    "status",
    "attachments",
    "submissionLink",
  ];
  const hasFieldToUpdate = editableFields.some(
    (field) => req.body[field] !== undefined,
  );

  if (!hasFieldToUpdate) {
    return sendValidationError(
      res,
      "No assignment fields were provided to update",
    );
  }

  if (
    req.body.priority !== undefined &&
    !VALID_PRIORITIES.includes(req.body.priority)
  ) {
    return sendValidationError(res, "Invalid priority value");
  }

  if (
    req.body.status !== undefined &&
    !VALID_ASSIGNMENT_STATUSES.includes(req.body.status)
  ) {
    return sendValidationError(res, "Invalid status value");
  }

  if (req.body.deadline !== undefined) {
    const parsedDeadline = parseDeadline(req.body.deadline);
    if (!parsedDeadline) {
      return sendValidationError(res, "A valid deadline is required");
    }
    req.body.deadline = parsedDeadline;
  }

  if (req.body.attachments !== undefined) {
    const attachments = normalizeAttachments(req.body.attachments);
    if (attachments === null) {
      return sendValidationError(res, "Attachments must be a valid array");
    }
    req.body.attachments = attachments;
  }

  if (
    req.body.assignmentType !== undefined ||
    req.body.targetRole !== undefined ||
    req.body.assignedUserId !== undefined ||
    req.body.assignedToRole !== undefined ||
    req.body.assignedTo !== undefined
  ) {
    const { assignmentType, targetRole, assignedUserId } =
      normalizeAssignmentTarget(req.body);

    if (!VALID_ASSIGNMENT_TYPES.includes(assignmentType)) {
      return sendValidationError(res, "Invalid assignment type");
    }

    if (
      assignmentType === "role" &&
      (!targetRole || !VALID_ROLE_TARGETS.includes(targetRole))
    ) {
      return sendValidationError(res, "Target role is required");
    }

    if (assignmentType === "user" && !assignedUserId) {
      return sendValidationError(res, "Assigned user is required");
    }

    if (assignmentType === "user" && !isValidObjectId(assignedUserId)) {
      return sendValidationError(res, "Assigned user must be a valid user id");
    }

    req.body.assignmentType = assignmentType;
    req.body.targetRole = assignmentType === "role" ? targetRole : null;
    req.body.assignedUserId = assignmentType === "user" ? assignedUserId : null;
  }

  next();
};

exports.validateAssignmentSubmission = (req, res, next) => {
  const { submissionLink, status, note } = req.body;
  const attachments = normalizeAttachments(req.body.attachments);

  if (status !== undefined && !["in_progress", "submitted"].includes(status)) {
    return sendValidationError(
      res,
      "Only progress or submitted statuses are allowed",
    );
  }

  if (!submissionLink && (!attachments || attachments.length === 0) && !note) {
    return sendValidationError(
      res,
      "Provide a submission link, uploaded file, attachments, or a submission note",
    );
  }

  if (attachments === null) {
    return sendValidationError(res, "Attachments must be a valid array");
  }

  req.body.attachments = attachments || [];
  next();
};

exports.validateAssignmentStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status || !VALID_ASSIGNMENT_STATUSES.includes(status)) {
    return sendValidationError(res, "A valid assignment status is required");
  }

  next();
};

exports.validateAssignmentFeedback = (req, res, next) => {
  const { message, status } = req.body;

  if (!message || !String(message).trim()) {
    return sendValidationError(res, "Feedback message is required");
  }

  if (status !== undefined && !VALID_ASSIGNMENT_STATUSES.includes(status)) {
    return sendValidationError(res, "Invalid assignment status value");
  }

  next();
};

exports.validateSubmissionReview = (req, res, next) => {
  const { status } = req.body;

  if (
    !status ||
    !VALID_SUBMISSION_STATUSES.includes(status) ||
    status === "submitted"
  ) {
    return sendValidationError(
      res,
      "Review status must be approved, rejected, or pending",
    );
  }

  next();
};
