import express from "express";
import {
  getPublicFormBySlug,
  sendPublicFormVerificationOtp,
  submitPublicForm,
  verifyPublicFormVerificationOtp,
} from "./form.controller.js";
import { createMemoryUpload } from "../../shared/services/cloudinary.service.js";
import { otpRateLimit } from "../../shared/middleware/rateLimitMiddleware.js";

const router = express.Router();

const upload = createMemoryUpload({
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
});

router.get("/:slug", getPublicFormBySlug);
router.post("/:slug/verification/:kind/send", otpRateLimit, sendPublicFormVerificationOtp);
router.post("/:slug/verification/:kind/verify", otpRateLimit, verifyPublicFormVerificationOtp);
router.post("/:slug/submit", (req, res, next) => {
  upload.any()(req, res, (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Maximum file size allowed is 5 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload file",
      });
    }

    return submitPublicForm(req, res, next);
  });
});

export default router;
