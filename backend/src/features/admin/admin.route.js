import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
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
  // Auth Settings
  getAuthSettings,
  updateAuthSettings,
  testWhatsappConnection,
  testTelegramConnection,
  // AI Provider Management
  getAIProviders,
  addAIProvider,
  updateAIProvider,
  deleteAIProvider,
  updateAIMode,
  updateProviderPriority,
  // OTP Provider Controllers
  getEmailProviders,
  createEmailProvider,
  updateEmailProvider,
  deleteEmailProvider,
  setDefaultEmailProvider,
  testEmailProviderConnection,
  getPhoneProviders,
  createPhoneProvider,
  updatePhoneProvider,
  deletePhoneProvider,
  setDefaultPhoneProvider,
  testPhoneProviderConnection,
  // User Service Permission Controllers
  getUserServicePermissions,
  getUserServicePermissionByUserId,
  updateUserServicePermissions,
  bulkUpdateUserServicePermissions,
  generateAdminTelegramProfileLinkingCode,
  getAdminTelegramStatus,
  unlinkAdminTelegramProfile,
} from "./admin.controller.js";
import {
  createForm,
  getAdminForms,
  getAdminFormById,
  updateForm,
  deleteForm,
  getFormSubmissions,
  getFormResponseAnalysis,
  getFormSubmissionById,
  deleteFormSubmission,
  exportFormSubmissions,
} from "../form/form.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `form-banner-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

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

// Auth settings management
router.get("/auth-settings", getAuthSettings);
router.put("/auth-settings", updateAuthSettings);

// OTP Provider Routes
router.get("/otp-providers/email", getEmailProviders);
router.post("/otp-providers/email", createEmailProvider);
router.put("/otp-providers/email/:providerId", updateEmailProvider);
router.delete("/otp-providers/email/:providerId", deleteEmailProvider);
router.patch(
  "/otp-providers/email/:providerId/default",
  setDefaultEmailProvider,
);
router.post(
  "/otp-providers/email/:providerId/test",
  testEmailProviderConnection,
);

router.get("/otp-providers/phone", getPhoneProviders);
router.post("/otp-providers/phone", createPhoneProvider);
router.put("/otp-providers/phone/:providerId", updatePhoneProvider);
router.delete("/otp-providers/phone/:providerId", deletePhoneProvider);
router.patch(
  "/otp-providers/phone/:providerId/default",
  setDefaultPhoneProvider,
);
router.post(
  "/otp-providers/phone/:providerId/test",
  testPhoneProviderConnection,
);

// User Service Permission Routes
router.get("/user-service-permissions", getUserServicePermissions);
router.get(
  "/user-service-permissions/:userId",
  getUserServicePermissionByUserId,
);
router.put("/user-service-permissions/:userId", updateUserServicePermissions);
router.post("/user-service-permissions/bulk", bulkUpdateUserServicePermissions);

router.post("/test-whatsapp", testWhatsappConnection);
router.post("/test-telegram", testTelegramConnection);
// Admin self-service Telegram linking
router.post("/telegram/generate-code", generateAdminTelegramProfileLinkingCode);
router.get("/telegram/status", getAdminTelegramStatus);
router.post("/telegram/unlink", unlinkAdminTelegramProfile);
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

// Form management
router.get("/forms", getAdminForms);
router.post("/forms", createForm);
router.post("/forms/banner-image", (req, res, next) => {
  imageUpload.single("image")(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Maximum file size allowed is 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload image",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please choose an image to upload",
      });
    }

    const baseUrl =
      process.env.API_URL ||
      process.env.VITE_API_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `${req.protocol}://${req.get("host")}`;

    return res.status(201).json({
      success: true,
      data: {
        imageUrl: `${baseUrl}/uploads/${req.file.filename}`,
      },
    });
  });
});
router.get("/forms/:formId", getAdminFormById);
router.put("/forms/:formId", updateForm);
router.delete("/forms/:formId", deleteForm);
router.get("/forms/:formId/responses", getFormSubmissions);
router.get("/forms/:formId/responses/analysis", getFormResponseAnalysis);
router.get("/forms/:formId/responses/:responseId", getFormSubmissionById);
router.delete("/forms/:formId/responses/:responseId", deleteFormSubmission);
router.get("/forms/:formId/export", exportFormSubmissions);

export default router;
