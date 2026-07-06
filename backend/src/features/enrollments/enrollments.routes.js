import express from "express";
import {
  createEnrollmentController,
  getMyPaymentsController,
  getMyProgramsController,
  getMyProfileController,
} from "./enrollments.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.get("/my-programs", authenticate, requireRole("STUDENT", "ADMIN"), getMyProgramsController);
router.get("/payments", authenticate, requireRole("STUDENT", "ADMIN"), getMyPaymentsController);
router.get("/profile", authenticate, requireRole("STUDENT", "ADMIN"), getMyProfileController);
router.post("/:programId", authenticate, requireRole("STUDENT", "ADMIN"), createEnrollmentController);

export default router;
