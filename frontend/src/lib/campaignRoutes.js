const ROUTE_PARAM_PATTERN = /^:[A-Za-z_][A-Za-z0-9_]*$/;
const ROUTE_SEGMENT_PATTERN = /^[A-Za-z0-9._~-]+$/;

const stripQueryAndHash = (value) => String(value || "").split(/[?#]/)[0];

export const normalizeCampaignRouteInput = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    throw new Error("Display Route is required.");
  }

  let route = stripQueryAndHash(String(value).trim());

  if (!route) {
    throw new Error("Display Route is required.");
  }

  if (route.includes("://")) {
    throw new Error("Display Route must be a website path, not a full URL.");
  }

  if (/\s/.test(route)) {
    throw new Error("Display Route cannot contain spaces.");
  }

  if (!route.startsWith("/")) {
    route = `/${route}`;
  }

  if (route.length > 1 && route.endsWith("/")) {
    route = route.replace(/\/+$/, "");
  }

  if (route.includes("//")) {
    throw new Error("Display Route cannot contain duplicate slashes.");
  }

  const segments = route.split("/").slice(1);
  for (const segment of segments) {
    if (!segment) {
      throw new Error("Display Route cannot contain duplicate slashes.");
    }

    if (segment.startsWith(":")) {
      if (!ROUTE_PARAM_PATTERN.test(segment)) {
        throw new Error(
          "Display Route parameters must use the form /path/:paramName.",
        );
      }
      continue;
    }

    if (!ROUTE_SEGMENT_PATTERN.test(segment)) {
      throw new Error(
        "Display Route can only contain URL-safe path characters.",
      );
    }
  }

  return route || "/";
};

export const formatCampaignRoute = (value) => {
  if (value === undefined || value === null || String(value).trim() === "") {
    return "/";
  }

  let route = stripQueryAndHash(String(value).trim());
  if (!route) {
    return "/";
  }

  if (!route.startsWith("/")) {
    route = `/${route}`;
  }

  if (route.length > 1 && route.endsWith("/")) {
    route = route.replace(/\/+$/, "");
  }

  return route || "/";
};
