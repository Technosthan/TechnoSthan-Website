import { ICON_LIBRARY, FALLBACK_ICON } from "../constants";
import {
  ADMIN_ROUTE,
  DASHBOARD_ROUTE,
} from "../constants";

export const AUTH_TOKEN_KEY =
  "technosthan_auth_token";
export const AUTH_USER_KEY =
  "technosthan_auth_user";

export const noop = () => {};

export const getAuthToken = () =>
  localStorage.getItem(AUTH_TOKEN_KEY);

export const getAuthUser = () => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setAuthSession = ({
  token,
  user,
}) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify(user || null)
  );
};

export const setAuthToken = (token) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

export const decodeJwtPayload = (token) => {
  if (!token) {
    return null;
  }

  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(normalized);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const getIconComponent = (iconKey) => {
  return ICON_LIBRARY[iconKey] || FALLBACK_ICON;
};

export const getSafeImageUrl = (url) => {
  if (!url) {
    return "";
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  const base = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/+$/, "")
    : window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : window.location.origin;

  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const getLandingRouteForUser = (user) =>
  user?.role === "admin"
    ? ADMIN_ROUTE
    : DASHBOARD_ROUTE;

export const getAccountDisplayInitial = (name) =>
  String(name || "A")
    .trim()
    .charAt(0)
    .toUpperCase();

export const clampNumber = (
  value,
  min,
  max,
  fallback
) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, parsed));
};
