import express from "express";
import {
  getAdminStats,
  getMonitoringStats,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  updateUserStatus,
  getSettings,
  updateSettings,
  getAIConfig,
  updateAIConfig,
  updateUserPermissions,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  globalSearch,
  // AI Provider Management
  getAIProviders,
  addAIProvider,
  updateAIProvider,
  deleteAIProvider,
  updateAIMode,
  updateProviderPriority,
} from "./admin.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

console.log("Admin routes registered");

// Stats and analytics
router.get("/stats", getAdminStats);
router.get("/monitoring", getMonitoringStats);

// User management
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", updateUserStatus);
router.put("/users/:userId/permissions", updateUserPermissions);
router.delete("/users/:userId", deleteUser);

// Settings management
router.get("/settings", getSettings);
router.post("/settings", updateSettings);
// AI config endpoints (provider-independent)
router.get("/ai-config", getAIConfig);
router.put("/ai-config", updateAIConfig);

// AI Provider Management
router.get("/ai-providers", getAIProviders);
router.post("/ai-providers", addAIProvider);
router.put("/ai-providers/:providerId", updateAIProvider);
router.delete("/ai-providers/:providerId", deleteAIProvider);
router.put("/ai-mode", updateAIMode);
router.put("/ai-providers/:providerId/priority", updateProviderPriority);

// Announcement management
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:announcementId", updateAnnouncement);
router.delete("/announcements/:announcementId", deleteAnnouncement);

// Global search
router.get("/search", globalSearch);

export default router;
