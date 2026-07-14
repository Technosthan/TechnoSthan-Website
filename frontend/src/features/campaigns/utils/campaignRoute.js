const isExternalRoute = (value = "") =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(String(value).trim()) || String(value).trim().startsWith("//");

export const normalizeCampaignDisplayRoute = (value, { required = false } = {}) => {
  const raw = String(value ?? "").trim();

  if (!raw) {
    if (required) {
      throw new Error("Display Route is required");
    }
    return "";
  }

  if (/\s/.test(raw)) {
    throw new Error("Display Route cannot contain spaces");
  }

  if (/[?#]/.test(raw)) {
    throw new Error("Display Route cannot contain query strings or hashes");
  }

  if (isExternalRoute(raw) || raw.includes("://")) {
    throw new Error("Display Route must be an internal route");
  }

  const prefixed = raw.startsWith("/") ? raw : `/${raw}`;
  if (/\/{2,}/.test(prefixed)) {
    throw new Error("Display Route cannot contain duplicate slashes");
  }
  const normalized = prefixed !== "/" ? prefixed.replace(/\/+$/, "") : prefixed;

  return normalized || "/";
};
