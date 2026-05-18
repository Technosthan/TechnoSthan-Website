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
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

const router = express.Router();

router.use(protect);
router.use(requireWorkspaceFeature("assignmentsEnabled"));

router.get("/my", getMyAssignments);
router.post("/upload", uploadAssignmentFile);
router.get("/assignees/list", hrOrAdmin, getAssignableUsers);
router.get("/submissions/all", hrOrAdmin, getSubmissions);
router.patch(
  "/submissions/:submissionId/review",
  hrOrAdmin,
  validateSubmissionReview,
  reviewSubmission,
);
router.get("/", hrOrAdmin, getAssignments);
router.post("/", hrOrAdmin, validateCreateAssignment, createAssignment);
router.patch("/:id/submit", validateAssignmentSubmission, submitAssignment);
router.patch("/:id/status", validateAssignmentStatus, updateAssignmentStatus);
router.post(
  "/:id/feedback",
  hrOrAdmin,
  validateAssignmentFeedback,
  addAssignmentFeedback,
);
router.put("/:id", hrOrAdmin, validateUpdateAssignment, updateAssignment);
router.delete("/:id", hrOrAdmin, deleteAssignment);
router.get("/:id", getAssignmentById);

module.exports = router;
