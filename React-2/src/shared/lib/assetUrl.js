const CLOUDINARY_PATTERN = /\/upload\/(?:v\d+\/)?(.+)$/i;

const resolveAssetCandidate = (asset) => {
  if (!asset) return "";
  if (typeof asset === "string") return asset;
  if (typeof asset === "object") {
    return (
      asset.secureUrl ||
      asset.secure_url ||
      asset.url ||
      asset.fileUrl ||
      asset.publicUrl ||
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

export const getOptimizedImageUrl = (asset) => {
  const resolved = resolveAssetCandidate(asset);
  return optimizeCloudinaryUrl(resolved);
};

export const resolveStoredAssetUrl = getOptimizedImageUrl;
