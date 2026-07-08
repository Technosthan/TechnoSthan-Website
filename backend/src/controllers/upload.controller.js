import multer from "multer";
import { Readable } from "stream";
import { getCloudinary } from "../config/cloudinary.js";
import { asyncHandler } from "../shared/utils/asyncHandler.js";
import { sendSuccess } from "../shared/utils/apiResponse.js";

const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/svg+xml"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "webp", "svg"]);
const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "mov"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    const extension = String(file.originalname || "").split(".").pop().toLowerCase();
    const isImage = IMAGE_MIME_TYPES.has(file.mimetype) || IMAGE_EXTENSIONS.has(extension);
    const isVideo = VIDEO_MIME_TYPES.has(file.mimetype) || VIDEO_EXTENSIONS.has(extension);

    if (!isImage && !isVideo) {
      cb(new Error("Only image and video files are allowed"), false);
      return;
    }

    cb(null, true);
  },
});

const uploadStream = (cloudinary, buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(result);
    });

    Readable.from([buffer]).pipe(stream);
  });

const detectMediaType = (file, bodyType = "") => {
  if (String(bodyType || "").toUpperCase() === "VIDEO") {
    return "VIDEO";
  }

  if (String(file?.mimetype || "").startsWith("video/")) {
    return "VIDEO";
  }

  return "IMAGE";
};

export const createUploadMiddleware = () => upload;

export const uploadMediaController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "File is required" });
  }

  const cloudinary = await getCloudinary();
  if (!cloudinary) {
    return res.status(500).json({
      message:
        "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, or CLOUDINARY_URL.",
    });
  }

  const mediaType = detectMediaType(req.file, req.body.mediaType || req.body.type || "");
  const folder = `technosthan/innovationhub/${mediaType === "VIDEO" ? "videos" : "images"}`;
  const resourceType = mediaType === "VIDEO" ? "video" : "image";
  const result = await uploadStream(cloudinary, req.file.buffer, {
    folder,
    resource_type: resourceType,
    use_filename: true,
    unique_filename: true,
    overwrite: false,
  });

  return sendSuccess(
    res,
    201,
    {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      mediaType,
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        mediaType,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    },
    "File uploaded",
  );
});
