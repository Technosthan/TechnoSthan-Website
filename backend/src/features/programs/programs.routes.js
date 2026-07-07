import express from "express";
import {
  createProgramController,
  deleteProgramController,
  getHeroController,
  getProgramController,
  getProgramsController,
  updateProgramController,
} from "./programs.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/hero", getHeroController);
router.get("/", getProgramsController);
router.get("/:identifier", getProgramController);

router.post("/", authenticate, requireRole("ADMIN"), createProgramController);
router.put("/:id", authenticate, requireRole("ADMIN"), updateProgramController);
router.delete("/:id", authenticate, requireRole("ADMIN"), deleteProgramController);

export default router;
