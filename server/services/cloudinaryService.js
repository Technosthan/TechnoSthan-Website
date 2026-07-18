const cloudinary = require("cloudinary").v2;
const multer = require("multer");

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

let cloudinaryConfigLogged = false;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.warn(
    "Cloudinary environment variables not fully set. Cloud uploads will fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are provided.",
  );
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
  secure: true,
});

const validateCloudinaryConfig = () => {
  const isConfigured =
    Boolean(CLOUDINARY_CLOUD_NAME) &&
    Boolean(CLOUDINARY_API_KEY) &&
    Boolean(CLOUDINARY_API_SECRET);

  if (!cloudinaryConfigLogged) {
    console.log(
      isConfigured
        ? "[cloudinary] Configuration loaded successfully."
        : "[cloudinary] Missing required configuration.",
    );
    cloudinaryConfigLogged = true;
  }

  return isConfigured;
};

validateCloudinaryConfig();

const uploadFromDataUri = async (dataUri, options = {}) => {
  // options: { folder, resource_type }
  const uploadOptions = Object.assign(
    {
      resource_type: "auto",
      folder: "assignments",
      type: "upload",
    },
    options,
  );
  return cloudinary.uploader.upload(dataUri, uploadOptions);
};

const uploadBuffer = async ({
  buffer,
  originalName = "file",
  mimeType = "",
  size = 0,
  folder = "forms",
  resourceType = "auto",
  publicId,
  overwrite = false,
} = {}) => {
  const uploadResult = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        public_id: publicId,
        use_filename: !publicId,
        unique_filename: !publicId,
        overwrite,
        filename_override: originalName,
        tags: ["forms"],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve(result);
      },
    );

    stream.end(buffer);
  });

  return normalizeStoredAsset(
    {
      ...uploadResult,
      originalName,
      mimeType,
      size,
      bytes: size,
      folder,
    },
    uploadResult?.secure_url || uploadResult?.url || "",
  );
};

const uploadImage = (options = {}) =>
  uploadBuffer({
    ...options,
    resourceType: "image",
  });

const uploadPdf = (options = {}) =>
  uploadBuffer({
    ...options,
    resourceType: "raw",
  });

const uploadFile = (options = {}) =>
  uploadBuffer({
    ...options,
    resourceType: options.resourceType || "auto",
  });

const resolveCloudinaryFormat = (publicId, format) => {
  const trimmedFormat = String(format || "").trim();
  if (trimmedFormat) {
    return trimmedFormat.replace(/^\./, "");
  }

  const publicIdText = String(publicId || "").trim();
  const extensionMatch = publicIdText.match(/\.([a-z0-9]+)$/i);
  return extensionMatch ? extensionMatch[1].toLowerCase() : undefined;
};

const generateSignedUrl = ({
  publicId,
  resource_type = "auto",
  type = "upload",
  expiresInSeconds = 120,
  download = false,
  format,
  mimeType,
} = {}) => {
  if (!publicId) return null;

  const expiresAt =
    Math.floor(Date.now() / 1000) +
    Math.max(60, Math.min(300, expiresInSeconds || 120));

  const normalizedFormat = resolveCloudinaryFormat(publicId, format);
  const normalizedMimeType = String(mimeType || "").trim().toLowerCase();

  // Cloudinary stores PDFs under the image resource type for inline preview delivery.
  let requestedResourceType = resource_type || "auto";
  if (
    normalizedMimeType === "application/pdf" ||
    normalizedFormat === "pdf"
  ) {
    requestedResourceType = "image";
  }

  if (
    download &&
    cloudinary.utils &&
    typeof cloudinary.utils.private_download_url === "function"
  ) {
    try {
      return cloudinary.utils.private_download_url(publicId, normalizedFormat, {
        resource_type: requestedResourceType,
        type,
        expires_at: expiresAt,
        attachment: true,
      });
    } catch (err) {
      // fall through to signed delivery url
    }
  }

  // For authenticated/private delivery types, prefer private_download_url
  if (
    cloudinary.utils &&
    typeof cloudinary.utils.private_download_url === "function" &&
    (String(type || "").toLowerCase() === "authenticated" ||
      String(type || "").toLowerCase() === "private")
  ) {
    try {
      return cloudinary.utils.private_download_url(publicId, normalizedFormat, {
        resource_type: requestedResourceType,
        type,
        expires_at: expiresAt,
        attachment: download ? true : false,
      });
    } catch (err) {
      // fall through to signed delivery url
    }
  }

  try {
    // Log debug for PDF generation cases (helps diagnose preview issues)
    if (normalizedFormat === "pdf") {
      console.log("[CLOUDINARY] Generating signed URL for PDF", {
        publicId,
        resource_type: requestedResourceType,
        type,
        format: normalizedFormat,
      });
    }

    return cloudinary.url(publicId, {
      resource_type: requestedResourceType,
      type,
      sign_url: true,
      expires_at: expiresAt,
      secure: true,
      format: normalizedFormat,
      flags: download ? "attachment" : undefined,
    });
  } catch (err) {
    return null;
  }
};

const deleteAsset = async (publicId, resourceType = "auto") => {
  if (!publicId) return { result: "not_found" };
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};

const createMemoryUpload = ({
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
        return cb(null, true);
      }
      const error = new Error(`Unsupported file type: ${file.mimetype}`);
      error.code = "UNSUPPORTED_MIME_TYPE";
      return cb(error);
    },
  });

  return upload;
};

const getCloudinaryFolder = (...segments) =>
  segments
    .flat()
    .filter(Boolean)
    .map((segment) => String(segment).trim().replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/");

const getCloudinaryResourceType = (file = {}) => {
  const mimeType = String(file.mimetype || file.mimeType || "").toLowerCase();
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw";
};

const normalizeStoredAsset = (asset, fallbackUrl = "") => {
  if (!asset && !fallbackUrl) return null;
  if (typeof asset === "string") {
    return {
      url: asset,
      secureUrl: asset,
      publicId: "",
      resourceType: "auto",
      format: "",
      originalName: "",
      mimeType: "",
      size: 0,
      bytes: 0,
      width: null,
      height: null,
      version: null,
      folder: "",
    };
  }

  const source = asset || {};
  const url = source.secureUrl || source.url || fallbackUrl || "";
  return {
    url,
    secureUrl: source.secureUrl || url,
    publicId: source.publicId || source.public_id || "",
    resourceType: source.resourceType || source.resource_type || "auto",
    format: source.format || "",
    originalName: source.originalName || source.original_filename || "",
    mimeType: source.mimeType || source.mimetype || "",
    size: source.size || 0,
    bytes: source.bytes || source.size || 0,
    width: source.width || null,
    height: source.height || null,
    version: source.version || null,
    folder: source.folder || "",
  };
};

const resolveStoredAssetUrl = (assetOrUrl = "") => {
  const candidate =
    typeof assetOrUrl === "object"
      ? assetOrUrl.secureUrl || assetOrUrl.url || assetOrUrl.fileUrl || ""
      : assetOrUrl;
  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }
  if (candidate.startsWith("/uploads/")) {
    return candidate;
  }
  return candidate;
};

const getPublicAssetUrl = (assetOrUrl = "", options = {}) => {
  const normalized = normalizeStoredAsset(assetOrUrl);
  if (!normalized) return "";
  if (normalized.secureUrl && /^https?:\/\//i.test(normalized.secureUrl)) {
    return normalized.secureUrl;
  }

  if (!normalized.publicId) {
    return resolveStoredAssetUrl(normalized.url || normalized.secureUrl || "");
  }

  return cloudinary.url(normalized.publicId, {
    secure: true,
    type: options.type || "upload",
    resource_type: normalized.resourceType || options.resourceType || "image",
    format: normalized.format || options.format,
  });
};

const uploadBufferToCloudinary = async ({
  buffer,
  originalName = "file",
  mimeType = "",
  size = 0,
  folder = "forms",
  resourceType = "auto",
}) => {
  return uploadBuffer({
    buffer,
    originalName,
    mimeType,
    size,
    folder,
    resourceType,
  });
};

module.exports = {
  uploadFromDataUri,
  uploadBuffer,
  uploadImage,
  uploadPdf,
  uploadFile,
  deleteAsset,
  generateSignedUrl,
  cloudinaryClient: cloudinary,
  createMemoryUpload,
  getCloudinaryFolder,
  getCloudinaryResourceType,
  validateCloudinaryConfig,
  normalizeStoredAsset,
  normalizeCloudinaryAsset: normalizeStoredAsset,
  resolveStoredAssetUrl,
  getPublicAssetUrl,
  uploadBufferToCloudinary,
  deleteCloudinaryAsset: deleteAsset,
};
