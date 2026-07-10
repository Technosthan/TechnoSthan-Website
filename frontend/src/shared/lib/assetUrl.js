import { API_BASE_URL } from "./axiosInstance";

const isCloudinaryUrl = (value = "") =>
  /res\.cloudinary\.com/i.test(String(value || "")) &&
  /\/upload\//i.test(String(value || ""));

const asStringUrl = (value = "") => {
  if (!value) return "";

  if (typeof value === "object") {
    return (
      value.secureUrl ||
      value.url ||
      value.imageUrl ||
      value.fileUrl ||
      value.path ||
      ""
    );
  }

  return String(value || "").trim();
};

export const resolveAssetUrl = (value = "") => {
  const resolved = asStringUrl(value);
  if (!resolved) return "";

  if (/^https?:\/\//i.test(resolved)) {
    return resolved;
  }

  if (resolved.startsWith("/uploads/") && API_BASE_URL) {
    return `${API_BASE_URL}${resolved}`;
  }

  return resolved;
};

export const getOptimizedImageUrl = (value = "") => {
  const resolved = resolveAssetUrl(value);
  if (!resolved || !isCloudinaryUrl(resolved)) {
    return resolved;
  }

  if (resolved.includes("/upload/f_auto,q_auto/")) {
    return resolved;
  }

  return resolved.replace("/upload/", "/upload/f_auto,q_auto/");
};

