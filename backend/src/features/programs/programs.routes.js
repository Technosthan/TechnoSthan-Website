import express from "express";
import {
  createProgramController,
  deleteProgramController,
  getHeroController,
  getProgramController,
  getHomeProgramsController,
  getSpecialisationProgramController,
  getSpecialisationProgramsController,
  getProgramsController,
  updateProgramController,
} from "./programs.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/hero", getHeroController);
router.get("/home", getHomeProgramsController);
router.get("/", getProgramsController);
router.get("/specialisation/:specialisationSlug", getSpecialisationProgramsController);
router.get("/:specialisationSlug/:programSlug", getSpecialisationProgramController);
router.get("/:slug", getProgramController);

router.post("/", authenticate, requireRole("ADMIN"), createProgramController);
router.put("/:id", authenticate, requireRole("ADMIN"), updateProgramController);
router.delete("/:id", authenticate, requireRole("ADMIN"), deleteProgramController);

export default router;
