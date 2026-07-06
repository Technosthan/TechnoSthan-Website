import express from "express";
import { verifyPaymentController } from "../enrollments/enrollments.controller.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.post("/verify", authenticate, requireRole("STUDENT", "ADMIN"), verifyPaymentController);

export default router;
