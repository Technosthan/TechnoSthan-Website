import crypto from "crypto";
import multer from "multer";

const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  apiKey: process.env.CLOUDINARY_API_KEY || "",
  apiSecret: process.env.CLOUDINARY_API_SECRET || "",
};

let configValidated = false;

const normalizeText = (value = "") =>
  String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const cleanSegments = (segments = []) =>
  segments
    .flatMap((segment) =>
      String(segment || "")
        .split("/")
        .map((part) => part.trim()),
    )
    .map((part) => normalizeText(part))
    .filter(Boolean);

export const isCloudinaryConfigured = () =>
  Boolean(
    cloudinaryConfig.cloudName &&
      cloudinaryConfig.apiKey &&
      cloudinaryConfig.apiSecret,
  );

export const validateCloudinaryConfig = ({ logOnly = true } = {}) => {
  if (configValidated) {
    return isCloudinaryConfigured();
  }

  configValidated = true;

  const missing = [];
  if (!cloudinaryConfig.cloudName) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!cloudinaryConfig.apiKey) missing.push("CLOUDINARY_API_KEY");
  if (!cloudinaryConfig.apiSecret) missing.push("CLOUDINARY_API_SECRET");

  if (missing.length) {
    console.error(
      `[cloudinary] Missing required environment variables: ${missing.join(", ")}`,
    );
    if (!logOnly) {
      throw new Error("Cloudinary is not configured");
    }
    return false;
  }

  console.log("[cloudinary] Cloudinary configuration loaded");
  return true;
};

const getCloudinarySignature = (params = {}) => {
  const filtered = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value.join(",") : value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${filtered}${cloudinaryConfig.apiSecret}`)
    .digest("hex");
};

const createCloudinaryEndpoint = (resourceType = "image") =>
  `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`;

const createDeleteEndpoint = (resourceType = "image") =>
  `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/destroy`;

export const getCloudinaryResourceType = (file = {}) => {
  const mimeType = String(file.mimetype || file.mimeType || "").toLowerCase();
  if (mimeType.startsWith("video/")) return "video";
  if (mimeType.startsWith("image/")) return "image";
  return "raw";
};

export const getCloudinaryFolder = (...segments) =>
  cleanSegments(segments).length > 0 &&
  cleanSegments(segments)[0]?.toLowerCase() === "technosthan"
    ? cleanSegments(segments).join("/")
    : ["technosthan", ...cleanSegments(segments)].filter(Boolean).join("/");

export const getCloudinaryPublicId = (originalName = "", suffix = "") => {
  const name = String(originalName || "upload")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  const randomSuffix = suffix || `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  return `${name || "upload"}-${randomSuffix}`;
};

export const createMemoryUpload = ({
  maxFileSize = 5 * 1024 * 1024,
  allowedMimeTypes = [],
} = {}) => {
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: maxFileSize,
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.length || allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }

      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    },
  });

  return upload;
};

const toBlob = (buffer, mimeType = "application/octet-stream") =>
  new Blob([buffer], { type: mimeType });

const normalizeUploadResponse = (
  result = {},
  {
    originalName = "",
    mimeType = "",
    size = 0,
    folder = "",
  } = {},
) => ({
  url: result.secure_url || result.url || "",
  secureUrl: result.secure_url || result.url || "",
  publicId: result.public_id || "",
  resourceType: result.resource_type || "",
  format: result.format || "",
  originalName,
  mimeType,
  size: size || result.bytes || 0,
  bytes: result.bytes || size || 0,
  width: result.width || null,
  height: result.height || null,
  version: result.version || null,
  folder,
});

export const normalizeStoredAsset = (asset, fallbackUrl = "") => {
  if (!asset || typeof asset !== "object") {
    return fallbackUrl || String(asset || "");
  }

  return {
    url: asset.url || asset.secureUrl || fallbackUrl || "",
    secureUrl: asset.secureUrl || asset.url || fallbackUrl || "",
    publicId: asset.publicId || asset.public_id || "",
    resourceType: asset.resourceType || asset.resource_type || "",
    format: asset.format || "",
    originalName: asset.originalName || asset.original_filename || "",
    mimeType: asset.mimeType || asset.mimetype || "",
    size: asset.size || asset.bytes || 0,
    bytes: asset.bytes || asset.size || 0,
    width: asset.width || null,
    height: asset.height || null,
    version: asset.version || null,
    folder: asset.folder || "",
  };
};

export const resolveStoredAssetUrl = (value = "") => {
  if (!value) return "";

  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "object") {
    return (
      value.secureUrl ||
      value.url ||
      value.fileUrl ||
      value.path ||
      ""
    ).trim?.() || "";
  }

  return String(value || "").trim();
};

export const extractCloudinaryPublicIdFromUrl = (url = "") => {
  const value = String(url || "").trim();
  if (!value || !/res\.cloudinary\.com/i.test(value) || !/\/upload\//i.test(value)) {
    return "";
  }

  const uploadPath = value.split("/upload/")[1] || "";
  const pathOnly = uploadPath.split("?")[0].split("#")[0];
  const parts = pathOnly.split("/").filter(Boolean);
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
  const publicIdParts =
    versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts;

  return publicIdParts.join("/").replace(/\.[^.]+$/, "");
};

export const uploadBufferToCloudinary = async ({
  buffer,
  originalName = "upload",
  mimeType = "application/octet-stream",
  size = 0,
  folder = "technosthan/general",
  publicId,
  resourceType,
  tags = [],
} = {}) => {
  if (!validateCloudinaryConfig()) {
    const error = new Error("Cloudinary is not configured");
    error.statusCode = 503;
    throw error;
  }

  if (!buffer || !buffer.length) {
    const error = new Error("No file buffer provided");
    error.statusCode = 400;
    throw error;
  }

  const resolvedResourceType = resourceType || getCloudinaryResourceType({ mimetype: mimeType });
  const endpoint = createCloudinaryEndpoint(resolvedResourceType);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const normalizedFolder = getCloudinaryFolder(folder);
  const normalizedPublicId = publicId || getCloudinaryPublicId(originalName);

  const params = {
    timestamp,
    folder: normalizedFolder,
    public_id: normalizedPublicId,
    overwrite: "false",
    unique_filename: "true",
    use_filename: "true",
  };

  if (tags.length) {
    params.tags = tags.join(",");
  }

  const signature = getCloudinarySignature(params);
  const formData = new FormData();
  formData.append("file", toBlob(buffer, mimeType), originalName);
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  formData.append("api_key", cloudinaryConfig.apiKey);
  formData.append("signature", signature);

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      payload?.error?.message || "Failed to upload file to Cloudinary",
    );
    error.statusCode = response.status >= 400 ? response.status : 500;
    error.details = payload;
    throw error;
  }

  return normalizeUploadResponse(payload, {
    originalName,
    mimeType,
    size,
    folder: normalizedFolder,
  });
};

export const deleteCloudinaryAsset = async (publicId, resourceType = "image") => {
  if (!publicId) return null;

  if (!validateCloudinaryConfig()) {
    const error = new Error("Cloudinary is not configured");
    error.statusCode = 503;
    throw error;
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const params = {
    public_id: publicId,
    timestamp,
    invalidate: "true",
  };
  const signature = getCloudinarySignature(params);
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  formData.append("api_key", cloudinaryConfig.apiKey);
  formData.append("signature", signature);

  const response = await fetch(createDeleteEndpoint(resourceType), {
    method: "POST",
    body: formData,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      payload?.error?.message || "Failed to delete Cloudinary asset",
    );
    error.statusCode = response.status >= 400 ? response.status : 500;
    error.details = payload;
    throw error;
  }

  return payload;
};

export const replaceCloudinaryAsset = async ({
  existingAsset = null,
  uploadOptions = {},
} = {}) => {
  const nextAsset = await uploadBufferToCloudinary(uploadOptions);

  if (existingAsset?.publicId) {
    try {
      await deleteCloudinaryAsset(
        existingAsset.publicId,
        existingAsset.resourceType || uploadOptions.resourceType || "image",
      );
    } catch (error) {
      console.warn("[cloudinary] Failed to delete replaced asset:", error.message);
    }
  }

  return nextAsset;
};

export const getCloudinaryPreviewUrl = (asset = "") => {
  const value = resolveStoredAssetUrl(asset);
  if (!value) return "";

  if (!/res\.cloudinary\.com/i.test(value) || !/\/upload\//i.test(value)) {
    return value;
  }

  if (/\/upload\/f_auto,q_auto\//i.test(value)) {
    return value;
  }

  return value.replace("/upload/", "/upload/f_auto,q_auto/");
};
