const CLOUDINARY_PATTERN = /\/upload\/(?:v\d+\/)?(.+)$/i;

const resolveAssetCandidate = (asset) => {
  if (!asset) return "";
  if (typeof asset === "string") return asset;
  if (typeof asset === "object") {
    return (
      asset.secureUrl ||
      asset.secure_url ||
      asset.url ||
      asset.bannerUrl ||
      asset.bannerImageUrl ||
      asset.logoUrl ||
      asset.fileUrl ||
      asset.publicUrl ||
      asset.mediaUrl ||
      ""
    );
  }
  return "";
};

const optimizeCloudinaryUrl = (url) => {
  if (!url || !/cloudinary\.com/i.test(url)) {
    return url;
  }

  return url.replace(
    CLOUDINARY_PATTERN,
    "/upload/f_auto,q_auto,w_1600,c_limit/$1",
  );
};

const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value || "").trim());

const isCloudinaryUrl = (value = "") => /cloudinary\.com/i.test(String(value || ""));

const normalizeRelativeAssetUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (isAbsoluteUrl(raw)) return raw;
  if (raw.startsWith("/")) return raw;
  const baseUrl =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
    (typeof window !== "undefined" && window.__API_BASE_URL__) ||
    "";
  if (!baseUrl) return raw;
  return `${String(baseUrl).replace(/\/+$/, "")}/${raw.replace(/^\/+/, "")}`;
};

export const getMediaUrl = (asset) => {
  const resolved = resolveAssetCandidate(asset);
  if (!resolved) return "";
  if (isAbsoluteUrl(resolved)) {
    return resolved;
  }
  return normalizeRelativeAssetUrl(resolved);
};

export const getOptimizedImageUrl = (asset) => {
  const resolved = getMediaUrl(asset);
  return isCloudinaryUrl(resolved) ? optimizeCloudinaryUrl(resolved) : resolved;
};

export const resolveStoredAssetUrl = getMediaUrl;
