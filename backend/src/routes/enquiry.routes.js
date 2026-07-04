import express from "express";
import {
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} from "../controllers/enquiry.controller.js";

const router = express.Router();

router.post("/", createEnquiry);
router.get("/", getEnquiries);
router.patch("/:id/status", updateEnquiryStatus);
router.delete("/:id", deleteEnquiry);

export default router;
