const cloudinary = require("cloudinary").v2;

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

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

module.exports = {
  uploadFromDataUri,
  deleteAsset,
  generateSignedUrl,
  cloudinaryClient: cloudinary,
};
