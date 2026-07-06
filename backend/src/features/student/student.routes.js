import express from "express";
import {
  getMyPaymentsController,
  getMyProgramsController,
  getMyProfileController,
} from "../enrollments/enrollments.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate, requireRole("STUDENT", "ADMIN"));
router.get("/my-programs", getMyProgramsController);
router.get("/payments", getMyPaymentsController);
router.get("/profile", getMyProfileController);

export default router;
