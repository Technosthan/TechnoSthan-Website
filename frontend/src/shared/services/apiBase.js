const trimTrailingSlash = (value) => String(value || "").replace(/\/$/, "");

const resolveProductionApiBase = () => {
  if (typeof window === "undefined") {
    return "/api";
  }

  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "/api";
  }

  if (hostname.endsWith("technosthan.com")) {
    return "https://uber-backend-gxxt.onrender.com/api";
  }

  return "/api";
};

const configuredApiBase =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.VITE_BACKEND_PUBLIC_URL
    ? `${trimTrailingSlash(import.meta.env.VITE_BACKEND_PUBLIC_URL)}/api`
    : "");

export const API_BASE = trimTrailingSlash(configuredApiBase || resolveProductionApiBase());

export const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};
