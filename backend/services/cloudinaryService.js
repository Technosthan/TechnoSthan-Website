const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const cloudinary = require("cloudinary").v2;
const multer = require("multer");

let cloudinaryConfigLogged = false;

const trimEnv = (value = "") => String(value || "").trim().replace(/^['"]|['"]$/g, "");

const parseCloudinaryUrl = (value = "") => {
  const raw = trimEnv(value);
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "cloudinary:") {
      return null;
    }

    const cloudName = trimEnv(parsed.hostname);
    const apiKey = trimEnv(parsed.username);
    const apiSecret = trimEnv(parsed.password);

    if (!cloudName || !apiKey || !apiSecret) {
      return null;
    }

    return {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    };
  } catch {
    return null;
  }
};

const resolveCloudinaryConfig = () => {
  const explicit = {
    cloud_name: trimEnv(process.env.CLOUDINARY_CLOUD_NAME),
    api_key: trimEnv(process.env.CLOUDINARY_API_KEY),
    api_secret: trimEnv(process.env.CLOUDINARY_API_SECRET),
    secure: true,
  };

  if (explicit.cloud_name && explicit.api_key && explicit.api_secret) {
    return {
      config: explicit,
      missing: [],
      source: "explicit",
    };
  }

  const fromUrl = parseCloudinaryUrl(process.env.CLOUDINARY_URL);
  if (fromUrl) {
    return {
      config: fromUrl,
      missing: [],
      source: "url",
    };
  }

  const missing = [];
  if (!explicit.cloud_name) missing.push("CLOUDINARY_CLOUD_NAME");
  if (!explicit.api_key) missing.push("CLOUDINARY_API_KEY");
  if (!explicit.api_secret) missing.push("CLOUDINARY_API_SECRET");

  return {
    config: null,
    missing,
    source: "missing",
  };
};

const cloudinarySettings = resolveCloudinaryConfig();

if (cloudinarySettings.config) {
  cloudinary.config(cloudinarySettings.config);
} else if (!cloudinaryConfigLogged) {
  console.warn(
    "[cloudinary] Missing required configuration: " +
      cloudinarySettings.missing.join(", "),
  );
  cloudinaryConfigLogged = true;
}

const validateCloudinaryConfig = () => {
  const isConfigured = Boolean(cloudinarySettings.config);

  if (!cloudinaryConfigLogged) {
    console.log(
      isConfigured
        ? "[cloudinary] Configuration loaded successfully."
        : `[cloudinary] Missing required configuration: ${cloudinarySettings.missing.join(", ")}`,
    );
    cloudinaryConfigLogged = true;
  }

  return isConfigured;
};

validateCloudinaryConfig();

const createCloudinaryConfigError = () => {
  const error = new Error("Media upload service is not configured.");
  error.code = "CLOUDINARY_NOT_CONFIGURED";
  error.statusCode = 503;
  return error;
};

const assertCloudinaryConfigured = () => {
  if (!validateCloudinaryConfig()) {
    throw createCloudinaryConfigError();
  }
};

const uploadFromDataUri = async (dataUri, options = {}) => {
  assertCloudinaryConfigured();
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
  assertCloudinaryConfigured();
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
      originalFilename: originalName,
      mimeType,
      size,
      bytes: size,
      folder,
      provider: "cloudinary",
    },
    uploadResult?.secure_url || uploadResult?.url || "",
  );
};

const uploadImageBuffer = (options = {}) =>
  uploadBuffer({
    ...options,
    resourceType: "image",
  });

const uploadImage = uploadImageBuffer;

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
  assertCloudinaryConfigured();
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
      provider: "cloudinary",
      url: asset,
      secureUrl: asset,
      secure_url: asset,
      publicId: "",
      public_id: "",
      resourceType: "auto",
      resource_type: "auto",
      format: "",
      originalName: "",
      originalFilename: "",
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
    provider: source.provider || "cloudinary",
    url,
    secureUrl: source.secureUrl || url,
    secure_url: source.secureUrl || url,
    publicId: source.publicId || source.public_id || "",
    public_id: source.publicId || source.public_id || "",
    resourceType: source.resourceType || source.resource_type || "auto",
    resource_type: source.resourceType || source.resource_type || "auto",
    format: source.format || "",
    originalName: source.originalName || source.original_filename || "",
    originalFilename:
      source.originalFilename || source.originalName || source.original_filename || "",
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

const uploadFormEmailAsset = async ({
  buffer,
  originalName = "file",
  mimeType = "",
  size = 0,
  assetType = "logo",
  publicId,
  overwrite = false,
} = {}) => {
  const normalizedAssetTypeRaw = String(assetType || "").toLowerCase();
  const normalizedAssetType =
    normalizedAssetTypeRaw === "banner" ? "banner" : normalizedAssetTypeRaw === "header-background" ? "header-background" : "logo";
  const folder = getCloudinaryFolder(
    "technosthan",
    "form-builder",
    "email-assets",
    `${normalizedAssetType}s`,
  );

  return uploadImageBuffer({
    buffer,
    originalName,
    mimeType,
    size,
    folder,
    publicId,
    overwrite,
  });
};

const replaceAsset = async ({
  oldPublicId,
  oldResourceType = "image",
  ...uploadOptions
} = {}) => {
  const uploaded = await uploadFormEmailAsset(uploadOptions);
  if (oldPublicId && uploaded?.publicId && oldPublicId !== uploaded.publicId) {
    await deleteAsset(oldPublicId, oldResourceType).catch(() => null);
  }
  return uploaded;
};

module.exports = {
  uploadFromDataUri,
  uploadBuffer,
  uploadImageBuffer,
  uploadImage,
  uploadPdf,
  uploadFile,
  deleteAsset,
  replaceAsset,
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
  uploadFormEmailAsset,
  deleteCloudinaryAsset: deleteAsset,
};
