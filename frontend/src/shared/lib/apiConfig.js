const normalizeBaseUrl = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  return raw.replace(/\/+$/, "");
};

const getExplicitApiBaseUrl = () =>
  normalizeBaseUrl(
    import.meta.env.VITE_API_URL ||
      import.meta.env.VITE_API_BASE_URL_PROD ||
      import.meta.env.VITE_API_BASE_URL ||
      "",
  );

const isLocalDevelopmentHost = () => {
  if (typeof window === "undefined") return false;

  const hostname = String(window.location.hostname || "").toLowerCase();
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  );
};

export const resolveApiBaseUrl = ({
  allowSameOriginProxy = false,
} = {}) => {
  const explicitBaseUrl = getExplicitApiBaseUrl();
  if (explicitBaseUrl) {
    return explicitBaseUrl;
  }

  if (typeof window === "undefined") {
    return "";
  }

  if (import.meta.env.DEV || isLocalDevelopmentHost()) {
    return normalizeBaseUrl(window.location.origin);
  }

  if (allowSameOriginProxy) {
    return normalizeBaseUrl(window.location.origin);
  }

  return "";
};

export const hasConfiguredApiBaseUrl = () => Boolean(getExplicitApiBaseUrl());

export const isSameOriginApiProxyEnabled = () =>
  import.meta.env.VITE_ALLOW_SAME_ORIGIN_API === "true";
