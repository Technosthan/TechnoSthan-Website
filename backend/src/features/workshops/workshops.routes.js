import express from "express";
import {
  createWorkshopController,
  deleteWorkshopController,
  getWorkshopsController,
  updateWorkshopController,
} from "./workshops.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getWorkshopsController);
router.post("/", authenticate, requireRole("ADMIN"), createWorkshopController);
router.put("/:id", authenticate, requireRole("ADMIN"), updateWorkshopController);
router.delete("/:id", authenticate, requireRole("ADMIN"), deleteWorkshopController);

export default router;
