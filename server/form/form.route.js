const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  getPublicFormBySlug,
  sendPublicFormVerification,
  verifyPublicFormVerification,
  submitPublicForm,
} = require("./form.controller.js");
const { createMemoryUpload } = require("../shared/services/cloudinary.service.js");

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

const verificationLimit = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/:slug", getPublicFormBySlug);
router.post("/:slug/verification/email/send", verificationLimit, sendPublicFormVerification);
router.post("/:slug/verification/email/verify", verificationLimit, verifyPublicFormVerification);
router.post("/:slug/verification/phone/send", verificationLimit, sendPublicFormVerification);
router.post("/:slug/verification/phone/verify", verificationLimit, verifyPublicFormVerification);
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

module.exports = router;
