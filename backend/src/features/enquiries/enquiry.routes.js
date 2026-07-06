import express from "express";
import {
  createEnquiryController,
  getEnquiriesController,
  updateEnquiryStatusController,
  deleteEnquiryController,
} from "./enquiry.controller.js";
import validate from "../../shared/middleware/validate.middleware.js";
import { enquiryValidationSchema } from "./enquiry.validation.js";
import { authenticate, requireRole } from "../../shared/middleware/auth.middleware.js";

const router = express.Router();

router.post("/", validate(enquiryValidationSchema), createEnquiryController);
router.get("/", authenticate, requireRole("ADMIN"), getEnquiriesController);
router.patch("/:id/status", authenticate, requireRole("ADMIN"), updateEnquiryStatusController);
router.delete("/:id", authenticate, requireRole("ADMIN"), deleteEnquiryController);

export default router;
