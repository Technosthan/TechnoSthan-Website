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
const {
  createMemoryUpload,
  deleteAsset,
  uploadFormEmailAsset,
} = require("../shared/services/cloudinary.service.js");

const router = express.Router();

router.use(protect, admin);

const upload = createMemoryUpload({
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
});

const VALID_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const VALID_IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const getUploadAssetType = (req) =>
  String(req.body?.assetType || req.body?.fieldName || req.body?.field || "")
    .trim()
    .toLowerCase() === "banner"
    ? "banner"
    : "logo";

const resolveUploadedFile = (req) => {
  if (req.file) return req.file;

  const fileBuckets = Array.isArray(req.files)
    ? req.files
    : req.files && typeof req.files === "object"
      ? Object.values(req.files).flat()
      : [];

  return (
    fileBuckets.find((file) => file.fieldname === "file") ||
    fileBuckets.find((file) => file.fieldname === "image") ||
    null
  );
};

const getFileExtension = (filename = "") => {
  const match = String(filename || "")
    .trim()
    .toLowerCase()
    .match(/(\.[a-z0-9]+)$/);
  return match ? match[1] : "";
};

const buildInvalidFileError = (message) => {
  const error = new Error(message);
  error.code = "INVALID_FILE";
  error.statusCode = 400;
  return error;
};

const validateUploadFile = (file) => {
  if (!file) {
    return buildInvalidFileError("No file uploaded");
  }

  if (!VALID_IMAGE_MIME_TYPES.has(file.mimetype)) {
    return buildInvalidFileError(
      "Please upload a valid PNG, JPG, JPEG, or WEBP image.",
    );
  }

  const extension = getFileExtension(file.originalname);
  if (!VALID_IMAGE_EXTENSIONS.has(extension)) {
    return buildInvalidFileError(
      "Please upload a valid PNG, JPG, JPEG, or WEBP image.",
    );
  }

  return null;
};

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

router.post("/upload", (req, res) => {
  upload.fields([
    { name: "file", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, async (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          success: false,
          code: "INVALID_FILE",
          message:
            "Image size is too large. Please upload a file 5 MB or smaller.",
        });
      }

      if (error.code === "UNSUPPORTED_MIME_TYPE") {
        return res.status(400).json({
          success: false,
          code: "INVALID_FILE",
          message: "Please upload a valid PNG, JPG, JPEG, or WEBP image.",
        });
      }

      return res.status(400).json({
        success: false,
        code: "INVALID_FILE",
        message: error.message || "Failed to upload file",
      });
    }

    const file = resolveUploadedFile(req);
    const validationError = validateUploadFile(file);
    if (validationError) {
      return res.status(validationError.statusCode || 400).json({
        success: false,
        code: validationError.code || "INVALID_FILE",
        message: validationError.message,
      });
    }

    try {
      const assetType = getUploadAssetType(req);
      const asset = await uploadFormEmailAsset({
        buffer: file.buffer,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        assetType,
        resourceType: "image",
      });

      return res.status(200).json({
        success: true,
        data: {
          provider: asset.provider || "cloudinary",
          publicId: asset.publicId || asset.public_id || "",
          secureUrl: asset.secureUrl || asset.secure_url || asset.url || "",
          resourceType: asset.resourceType || asset.resource_type || "image",
          format: asset.format || "",
          width: asset.width ?? null,
          height: asset.height ?? null,
          bytes: asset.bytes ?? asset.size ?? 0,
          originalFilename:
            asset.originalFilename || asset.originalName || file.originalname,
          url: asset.url || asset.secureUrl || "",
          asset,
        },
      });
    } catch (uploadError) {
      const statusCode = uploadError?.statusCode || 502;
      const code = uploadError?.code || "CLOUDINARY_UPLOAD_FAILED";
      const message =
        code === "CLOUDINARY_NOT_CONFIGURED"
          ? "Media upload service is not configured."
          : uploadError?.message || "The image could not be uploaded.";

      return res.status(statusCode).json({
        success: false,
        code,
        message,
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
        code: "INVALID_FILE",
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
