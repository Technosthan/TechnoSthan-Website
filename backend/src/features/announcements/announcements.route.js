import express from "express";
import {
  getPublicAnnouncements,
  dismissAnnouncement,
  getUnreadCount,
} from "./announcements.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import authOptionalMiddleware from "../../shared/middleware/optionalAuthMiddleware.js";

const router = express.Router();

// Public or authenticated announcements for users
router.get("/", authOptionalMiddleware, getPublicAnnouncements);
router.post("/:id/dismiss", authMiddleware, dismissAnnouncement);
router.get("/unread-count", authOptionalMiddleware, getUnreadCount);

export default router;
