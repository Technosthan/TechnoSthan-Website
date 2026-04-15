import express from "express";
import { create, getAll, latest, update, remove } from "./iot.controller.js";
import authMiddleware from "../../shared/middleware/authMiddleware.js";
import adminOnly from "../../shared/middleware/adminOnly.js";

const router = express.Router();

// Admin only
router.post("/data", authMiddleware, adminOnly, create);
router.get("/data", authMiddleware, adminOnly, getAll);
router.get("/latest", authMiddleware, adminOnly, latest);
router.put("/data/:id", authMiddleware, adminOnly, update);
router.delete("/data/:id", authMiddleware, adminOnly, remove);

export default router;
