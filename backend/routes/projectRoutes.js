const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  getProjects,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", getProjects);
router.get("/:slug", getProjectBySlug);

router.post("/admin", protect, admin, createProject);
router.put("/admin/:id", protect, admin, updateProject);
router.delete("/admin/:id", protect, admin, deleteProject);
router.patch("/admin/:id/status", protect, admin, updateProjectStatus);

module.exports = router;

