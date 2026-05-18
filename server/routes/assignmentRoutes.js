const express = require("express");

const {
  getAssignableUsers,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignments,
  getAssignmentById,
  getMyAssignments,
  submitAssignment,
  updateAssignmentStatus,
  addAssignmentFeedback,
  getSubmissions,
  reviewSubmission,
  uploadAssignmentFile,
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
const {
  requireWorkspaceFeature,
} = require("../middleware/workspaceSettings");

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
router.get("/", hrOrAdmin, getAssignments);
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
router.get("/:id", getAssignmentById);

module.exports = router;
