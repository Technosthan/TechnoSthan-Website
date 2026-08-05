const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser,
  getUserAnalytics,
} = require("./userController");
const { protect, admin } = require("./authMiddleware");

// GET all users - Admin only
router.get("/", protect, admin, getAllUsers);

// UPDATE user role - Admin only
router.patch("/:userId/role", protect, admin, updateUserRole);
// UPDATE user status (suspend/reactivate) - Admin only
router.patch("/:userId/status", protect, admin, updateUserStatus);

// DELETE user - Admin only
router.delete("/:userId", protect, admin, deleteUser);

// Analytics
router.get("/analytics", protect, admin, getUserAnalytics);

module.exports = router;
