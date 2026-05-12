import express from "express";
import cors from "cors";
import { getPublicSettings } from "./settings.controller.js";

const router = express.Router();

// Allow CORS for public settings
const publicCorsOptions = {
  origin: true, // Allow any origin for public settings
  credentials: false, // No credentials needed for public data
  methods: ["GET"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

router.get("/public", cors(publicCorsOptions), getPublicSettings);

export default router;
