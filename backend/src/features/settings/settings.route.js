import express from "express";
import cors from "cors";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";
import {
  getPublicSettings,
  getAccessControlSettings,
  updateAccessControlSettings,
} from "./settings.controller.js";

const router = express.Router();

// Allow CORS for public settings
const publicCorsOptions = {
  origin: true, // Allow any origin for public settings
  credentials: false, // No credentials needed for public data
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma"],
};

router.get("/public", cors(publicCorsOptions), getPublicSettings);
router.get(
  "/access-control",
  authMiddleware,
  adminOnly,
  getAccessControlSettings,
);
router.put(
  "/access-control",
  authMiddleware,
  adminOnly,
  updateAccessControlSettings,
);
router.get(
  "/public-access",
  authMiddleware,
  adminOnly,
  getAccessControlSettings,
);
router.put(
  "/public-access",
  authMiddleware,
  adminOnly,
  updateAccessControlSettings,
);

export default router;
