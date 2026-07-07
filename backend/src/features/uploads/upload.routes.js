import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../../../uploads");

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const PDF_MIME_TYPES = new Set(["application/pdf"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "svg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);
const PDF_EXTENSIONS = new Set(["pdf"]);

fs.mkdirSync(uploadDir, { recursive: true });

const getFileExtension = (filename = "") => String(filename).split(".").pop().toLowerCase();

const createStorage = () =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

const createUploadMiddleware = (mediaType = "AUTO") =>
  multer({
    storage: createStorage(),
    limits: {
      fileSize: mediaType === "IMAGE" ? 15 * 1024 * 1024 : 100 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
      const extension = getFileExtension(file.originalname);
      const isImage = IMAGE_MIME_TYPES.has(file.mimetype) || IMAGE_EXTENSIONS.has(extension);
      const isVideo = VIDEO_MIME_TYPES.has(file.mimetype) || VIDEO_EXTENSIONS.has(extension);
      const isPdf = PDF_MIME_TYPES.has(file.mimetype) || PDF_EXTENSIONS.has(extension);
      const allowed =
        mediaType === "VIDEO" ? isVideo : mediaType === "IMAGE" ? isImage : isImage || isVideo || isPdf;

      if (!allowed) {
        cb(new Error(`Only image, video, or PDF files are allowed`), false);
        return;
      }

      cb(null, true);
    },
  });

const getUploadMediaType = (file) => {
  if (VIDEO_MIME_TYPES.has(file.mimetype)) {
    return "VIDEO";
  }

  if (PDF_MIME_TYPES.has(file.mimetype) || getFileExtension(file.originalname) === "pdf") {
    return "DOCUMENT";
  }

  return "IMAGE";
};

const respondWithUpload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const relativePath = `/uploads/${req.file.filename}`;

  return sendSuccess(
    res,
    201,
    {
      success: true,
      url: relativePath,
      path: relativePath,
      mediaType: getUploadMediaType(req.file),
      file: {
        url: relativePath,
        path: relativePath,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    },
    "File uploaded",
  );
});

const router = express.Router();

router.post("/", createUploadMiddleware("AUTO").single("file"), respondWithUpload);
router.post("/images", createUploadMiddleware("IMAGE").single("file"), respondWithUpload);
router.post("/videos", createUploadMiddleware("VIDEO").single("file"), respondWithUpload);

export default router;
