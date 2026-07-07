import { mkdirSync } from "fs";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/apiResponse.js";
import { env } from "../../config/env.js";

const buildPublicUrl = (req, filePath) => {
  const baseUrl = env.BACKEND_PUBLIC_URL
    ? env.BACKEND_PUBLIC_URL.replace(/\/$/, "")
    : `${req.protocol}://${req.get("host")}`;

  return `${baseUrl}${filePath}`;
};

export const uploadMediaController = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const type = String(req.params.type || req.body.type || "").toLowerCase();
  const folder = type === "videos" || type === "video" ? "videos" : "images";
  const relativeUrl = `/uploads/${folder}/${req.file.filename}`;
  const url = buildPublicUrl(req, relativeUrl);

  return sendSuccess(res, 201, {
    success: true,
    url,
    file: {
      url,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    },
  }, "File uploaded");
});

export const ensureUploadDir = (dirPath) => {
  mkdirSync(dirPath, { recursive: true });
  return dirPath;
};
