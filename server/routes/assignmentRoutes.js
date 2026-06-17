const express = require("express");

const {
  getAssignableUsers,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignments,
  getAssignmentById,
  getAssignmentAttachments,
  getAssignmentSubmissions,
  getMyAssignments,
  submitAssignment,
  updateAssignmentStatus,
  addAssignmentFeedback,
  getSubmissions,
  reviewSubmission,
  uploadAssignmentFile,
  previewAssignmentAttachment,
  previewAssignmentByQuery,
  previewSubmissionAttachment,
  previewUploadedAttachment,
} = require("../controllers/assignmentController");
const { protect, hrOrAdmin } = require("../middleware/authMiddleware");
const {
  validateCreateAssignment,
  validateUpdateAssignment,
  validateAssignmentSubmission,
  validateAssignmentStatus,
  validateAssignmentFeedback,
  validateSubmissionReview,
} = require("../middleware/assignmentValidation");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

const router = express.Router();

router.use(protect);
router.use(requireWorkspaceFeature("assignmentsEnabled"));

router.get("/my", getMyAssignments);
router.post(
  "/upload",
  requireWorkspaceFeature("fileUploadsEnabled"),
  requireWorkspaceFeature("usersCanUploadFiles"),
  uploadAssignmentFile,
);
router.get("/assignees/list", hrOrAdmin, getAssignableUsers);
router.get(
  "/submissions/all",
  hrOrAdmin,
  requireWorkspaceFeature("assignmentReviewsEnabled"),
  requireWorkspaceFeature("hrCanReviewSubmissions"),
  getSubmissions,
);
router.patch(
  "/submissions/:submissionId/review",
  hrOrAdmin,
  requireWorkspaceFeature("assignmentReviewsEnabled"),
  requireWorkspaceFeature("hrCanReviewSubmissions"),
  validateSubmissionReview,
  reviewSubmission,
);
router.get("/", getAssignments);
router.post(
  "/",
  hrOrAdmin,
  requireWorkspaceFeature("hrCanCreateAssignments"),
  validateCreateAssignment,
  createAssignment,
);
router.patch(
  "/:id/submit",
  requireWorkspaceFeature("usersCanSubmitAssignments"),
  validateAssignmentSubmission,
  submitAssignment,
);
router.patch("/:id/status", validateAssignmentStatus, updateAssignmentStatus);
router.post(
  "/:id/feedback",
  hrOrAdmin,
  requireWorkspaceFeature("assignmentReviewsEnabled"),
  requireWorkspaceFeature("hrCanReviewSubmissions"),
  validateAssignmentFeedback,
  addAssignmentFeedback,
);
router.put(
  "/:id",
  hrOrAdmin,
  requireWorkspaceFeature("hrCanEditOwnAssignments"),
  validateUpdateAssignment,
  updateAssignment,
);
router.delete(
  "/:id",
  hrOrAdmin,
  requireWorkspaceFeature("hrCanDeleteAssignments"),
  deleteAssignment,
);
router.get("/:id/submissions", getAssignmentSubmissions);
router.get("/:id/attachments", getAssignmentAttachments);
router.get("/:id/preview", previewAssignmentByQuery);
router.get("/:id", getAssignmentById);

// Preview endpoints for attachments (generate temporary signed URLs)
// Support both path parameter and query parameter preview formats.
// For newly uploaded files (not yet in database)
router.get("/preview-upload/:publicId", previewUploadedAttachment);

// For assignment attachments
router.get("/:id/attachments/preview", previewAssignmentAttachment);
router.get("/:id/attachments/:publicId/preview", previewAssignmentAttachment);

// For submission attachments
router.get(
  "/:id/submissions/:submissionId/attachments/preview",
  previewSubmissionAttachment,
);
router.get(
  "/:id/submissions/:submissionId/attachments/:publicId/preview",
  previewSubmissionAttachment,
);

module.exports = router;
