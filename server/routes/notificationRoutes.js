const express = require("express");
const {
  getNotifications,
  markNotificationRead,
  markDailyTaskNotificationsRead,
  getUnreadNotificationCount,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getNotifications);
router.get("/unread-count", getUnreadNotificationCount);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markDailyTaskNotificationsRead);
router.patch("/read-daily-task", markDailyTaskNotificationsRead);

module.exports = router;
