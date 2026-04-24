import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  updateUserStatus,
  getSettings,
  updateSettings,
  updateUserPermissions,
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  globalSearch,
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

// User management
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.put("/users/:userId/status", updateUserStatus);
router.put("/users/:userId/permissions", updateUserPermissions);
router.delete("/users/:userId", deleteUser);

// Settings management
router.get("/settings", getSettings);
router.post("/settings", updateSettings);

// Temporary test without middleware
router.get("/settings", getSettings);
router.post("/settings", updateSettings);

// Announcement management
router.get("/announcements", getAnnouncements);
router.post("/announcements", createAnnouncement);
router.put("/announcements/:announcementId", updateAnnouncement);
router.delete("/announcements/:announcementId", deleteAnnouncement);

// Global search
router.get("/search", globalSearch);

export default router;
