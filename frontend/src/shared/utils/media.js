const DRIVE_ID_PATTERNS = [
  /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]{10,})/i,
  /https?:\/\/docs\.google\.com\/(?:file|presentation|spreadsheets|document)\/d\/([a-zA-Z0-9_-]{10,})/i,
  /\/d\/([a-zA-Z0-9_-]{10,})/i,
  /[?&]id=([a-zA-Z0-9_-]{10,})/i,
  /\/file\/d\/([a-zA-Z0-9_-]{10,})/i,
];

const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");
const ensureApiBase = (value) => {
  const trimmed = trimTrailingSlash(value);
  if (!trimmed) return "";
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const resolveRuntimeApiBase = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const { hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "/api";
  }

  if (hostname === "ih.technosthan.com") {
    return "https://technosthan-website-2.onrender.com/api";
  }

  return "";
};

const configuredApiBase = ensureApiBase(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "");
const configuredBackendBase = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_PUBLIC_URL || import.meta.env.VITE_API_BASE_URL || "",
);
const API_BASE = configuredApiBase || resolveRuntimeApiBase();
const BACKEND_PUBLIC_BASE =
  configuredBackendBase || trimTrailingSlash(API_BASE).replace(/\/api\/?$/, "");

export const extractGoogleFileId = (url = "") => {
  for (const pattern of DRIVE_ID_PATTERNS) {
    const match = String(url).match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

export const normalizeMediaUrl = (url, type = "image") => {
  return getMediaUrl(url, type);
};

export const normalizeStoredMediaUrl = (url, type = "image") => {
  const value = String(url || "").trim();
  if (!value) {
    return "";
  }

  const fileId = extractGoogleFileId(value);
  if (fileId) {
    if (type === "video") {
      return `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  if (value.startsWith("/uploads/")) {
    return value;
  }

  if (value.startsWith("uploads/")) {
    return `/${value}`;
  }

  if (value.startsWith("http")) {
    return value;
  }

  return value;
};

export const getMediaUrl = (url, type = "image") => {
  const value = normalizeStoredMediaUrl(url, type);
  if (!value) {
    return "";
  }

  if (value.startsWith("http")) {
    return value;
  }

  const base =
    BACKEND_PUBLIC_BASE ||
    (typeof window !== "undefined" ? trimTrailingSlash(window.location.origin) : "") ||
    trimTrailingSlash(API_BASE).replace(/\/api\/?$/, "");

  if (value.startsWith("/uploads/") && base) {
    return `${base.replace(/\/$/, "")}${value}`;
  }

  return base ? `${base.replace(/\/$/, "")}/${value.replace(/^\/?/, "")}` : value;
};

export const isDriveUrl = (value = "") =>
  /drive\.google\.com/i.test(String(value || ""));

export const isHttpUrl = (value = "") => /^https?:\/\//i.test(String(value || ""));

export const isRelativeUploadPath = (value = "") =>
  String(value || "").startsWith("/uploads/") || String(value || "").startsWith("uploads/");

export const isValidMediaUrl = (value = "") => {
  const trimmed = String(value || "").trim();
  if (!trimmed) {
    return false;
  }

  if (isDriveUrl(trimmed) || isHttpUrl(trimmed) || isRelativeUploadPath(trimmed)) {
    return true;
  }

  return false;
};

export const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value);
  } catch (_error) {
    return value;
  }
};
