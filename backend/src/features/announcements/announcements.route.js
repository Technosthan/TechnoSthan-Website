import express from "express";
import {
  getPublicAnnouncements,
  dismissAnnouncement,
  getUnreadCount,
} from "./announcements.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";

const router = express.Router();

// Public (or authenticated) announcements for users
router.get("/", authMiddleware, getPublicAnnouncements);
router.post("/:id/dismiss", authMiddleware, dismissAnnouncement);
router.get("/unread-count", authMiddleware, getUnreadCount);

export default router;
