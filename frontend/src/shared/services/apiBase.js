const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

const ensureApiBase = (value) => {
  const trimmed = trimTrailingSlash(value);
  if (!trimmed) return "";
  return /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
};

const configuredBackendOrigin = trimTrailingSlash(
  import.meta.env.VITE_BACKEND_PUBLIC_URL || import.meta.env.VITE_API_BASE_URL || "",
);

const resolveRuntimeApiBase = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "/api";
  }

  if (hostname === "ih.technosthan.com") {
    return "https://technosthan-website-2.onrender.com/api";
  }

  return "";
};

const configuredApiBase = ensureApiBase(import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "");

export const API_BASE =
  configuredApiBase ||
  (configuredBackendOrigin ? `${configuredBackendOrigin}/api` : "") ||
  resolveRuntimeApiBase() ||
  "http://localhost:5000/api";

export const buildApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
