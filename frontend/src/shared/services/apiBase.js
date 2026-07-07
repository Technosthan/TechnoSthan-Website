const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

const resolveRuntimeApiBase = () => {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }

  if (hostname === "ih.technosthan.com") {
    return "https://technosthan-website-2.onrender.com/api";
  }

  return "";
};

const configuredApiBase = trimTrailingSlash(import.meta.env.VITE_API_URL || "");

export const API_BASE = configuredApiBase || resolveRuntimeApiBase() || "http://localhost:5000/api";

export const buildApiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
