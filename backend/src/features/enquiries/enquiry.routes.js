import express from "express";
import {
  createEnquiryController,
  getEnquiriesController,
  updateEnquiryStatusController,
  deleteEnquiryController,
} from "./enquiry.controller.js";
import validate from "../../shared/middleware/validate.middleware.js";
import { enquiryValidationSchema } from "./enquiry.validation.js";

const router = express.Router();

router.post("/", validate(enquiryValidationSchema), createEnquiryController);
router.get("/", getEnquiriesController);
router.patch("/:id/status", updateEnquiryStatusController);
router.delete("/:id", deleteEnquiryController);

export default router;
