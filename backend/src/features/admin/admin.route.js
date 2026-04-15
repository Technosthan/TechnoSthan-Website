import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "./admin.controller.js";

import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// Stats and analytics
router.get("/stats", getAdminStats);

// User management
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.delete("/users/:userId", deleteUser);

export default router;
