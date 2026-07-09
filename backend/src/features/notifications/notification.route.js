import express from "express";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import {
  getMyNotifications,
  getMyNotificationCount,
  markMyNotificationRead,
} from "./notification.controller.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", getMyNotifications);
router.get("/unread-count", getMyNotificationCount);
router.patch("/:notificationId/read", markMyNotificationRead);

export default router;
