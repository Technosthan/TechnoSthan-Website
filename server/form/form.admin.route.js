const express = require("express");
const { protect, admin } = require("../middleware/authMiddleware");
const {
  createForm,
  getAdminForms,
  getAdminFormById,
  getAdminFormExport,
  updateForm,
  deleteForm,
  getFormSubmissions,
  getFormResponseAnalysis,
  getFormSubmissionById,
  deleteFormSubmission,
  exportFormSubmissions,
  revealFormResponseSecret,
  importFormFile,
} = require("./form.controller.js");
const { createMemoryUpload, deleteAsset, uploadBufferToCloudinary } = require("../shared/services/cloudinary.service.js");

const router = express.Router();

router.use(protect, admin);

const upload = createMemoryUpload({
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
});

const importUpload = createMemoryUpload({
  maxFileSize: 10 * 1024 * 1024,
  allowedMimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/json",
  ],
});

router.post("/upload", (req, res, next) => {
  upload.single("image")(req, res, async (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message:
            "Image size is too large. Please upload a file 5 MB or smaller.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload file",
      });
    }

    const file = req.file;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    try {
      const asset = await uploadBufferToCloudinary({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        folder: req.body?.folder || "forms/uploads",
        resourceType: "image",
      });

      return res.status(201).json({
        success: true,
        data: {
          url: asset.secureUrl || asset.url,
          asset,
        },
      });
    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: uploadError.message || "Failed to upload file",
      });
    }
  });
});

router.delete("/upload", async (req, res) => {
  try {
    const { publicId, resourceType = "image" } = req.body || {};
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: "publicId is required",
      });
    }

    await deleteAsset(publicId, resourceType);
    return res.json({
      success: true,
      message: "Asset deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete asset",
    });
  }
});

router.get("/", getAdminForms);
router.post("/", createForm);
router.post("/import-file", (req, res) => {
  importUpload.single("file")(req, res, async (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          message: "Maximum file size allowed is 10 MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to upload file",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    return importFormFile(req, res);
  });
});
router.get("/:formId", getAdminFormById);
router.put("/:formId", updateForm);
router.delete("/:formId", deleteForm);
router.get("/:formId/responses", getFormSubmissions);
router.get("/:formId/responses/analysis", getFormResponseAnalysis);
router.get("/:formId/responses/:responseId", getFormSubmissionById);
router.delete("/:formId/responses/:responseId", deleteFormSubmission);
router.post("/:formId/responses/:responseId/reveal-secret", revealFormResponseSecret);
router.get("/:formId/export-json", getAdminFormExport);
router.get("/:formId/export", exportFormSubmissions);

module.exports = router;
