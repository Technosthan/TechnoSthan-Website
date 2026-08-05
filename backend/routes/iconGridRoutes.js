const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  // Platform management
  getAllPlatforms,
  getPlatformById,
  addPlatform,
  updatePlatform,
  togglePlatformVisibility,
  deletePlatform,

  // User icon selection
  getUserIconSelection,
  updateUserIconSelection,
  toggleIconSelection,

  // Analytics
  logIconAction,
  getIconAnalytics,
} = require("../controllers/iconGridController");
const { requireWorkspaceFeature } = require("../middleware/workspaceSettings");

router.use(protect);
router.use(requireWorkspaceFeature("platformGridEnabled"));

// ============ PLATFORM MANAGEMENT (HR ONLY) ============

// Get all platforms
router.get("/platforms", getAllPlatforms);

// Get single platform
router.get("/platforms/:platformId", getPlatformById);

// Add new platform (HR only)
router.post("/platforms", addPlatform);

// Update platform (HR only)
router.put("/platforms/:platformId", updatePlatform);

// Toggle platform visibility/active status (HR only)
router.patch("/platforms/:platformId/toggle", togglePlatformVisibility);

// Delete platform (HR only)
router.delete("/platforms/:platformId", deletePlatform);

// ============ USER ICON SELECTION ============

// Get user's icon selection preferences
router.get("/user/selection", getUserIconSelection);

// Update user's icon selection preferences
router.post("/user/selection", updateUserIconSelection);

// Toggle specific icon selection
router.patch("/user/selection/:platformId", toggleIconSelection);

// ============ ANALYTICS & TRACKING ============

// Log copy/share action
router.post("/analytics/log", logIconAction);

// Get icon usage analytics
router.get("/analytics/usage", getIconAnalytics);

module.exports = router;
