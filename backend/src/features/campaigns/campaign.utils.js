const ROUTE_PATTERN = /^\/.*$/;

export const normalizeCampaignRoute = (value, { required = false } = {}) => {
  const raw = String(value ?? "").trim();

  if (!raw) {
    if (required) {
      const error = new Error("Display Route is required");
      error.statusCode = 400;
      throw error;
    }

    return null;
  }

  if (/\s/.test(raw)) {
    const error = new Error("Display Route cannot contain spaces");
    error.statusCode = 400;
    throw error;
  }

  if (/[?#]/.test(raw)) {
    const error = new Error("Display Route cannot contain query strings or hashes");
    error.statusCode = 400;
    throw error;
  }

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) || raw.startsWith("//") || raw.includes("://")) {
    const error = new Error("Display Route must be an internal route");
    error.statusCode = 400;
    throw error;
  }

  const prefixed = raw.startsWith("/") ? raw : `/${raw}`;

  if (/\/{2,}/.test(prefixed)) {
    const error = new Error("Display Route cannot contain duplicate slashes");
    error.statusCode = 400;
    throw error;
  }

  const normalized = prefixed !== "/" ? prefixed.replace(/\/+$/, "") : prefixed;

  if (!ROUTE_PATTERN.test(normalized)) {
    const error = new Error("Display Route must start with a leading slash");
    error.statusCode = 400;
    throw error;
  }

  return normalized || "/";
};

export const normalizeRequestPathname = (value = "/") => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return "/";
  }

  const cleaned = raw.split(/[?#]/)[0] || "/";
  const prefixed = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
  const normalized = prefixed !== "/" ? prefixed.replace(/\/+$/, "") : prefixed;
  return normalized || "/";
};

const splitRouteSegments = (value = "/") =>
  normalizeRequestPathname(value)
    .split("/")
    .filter(Boolean);

const isParameterizedSegment = (segment = "") => segment.startsWith(":");

export const getCampaignRouteMatchScore = (campaignRoute, pathname) => {
  if (!campaignRoute) {
    return {
      matches: true,
      routeType: "legacy",
      specificity: 0,
      exact: false,
    };
  }

  const normalizedRoute = normalizeCampaignRoute(campaignRoute);
  const normalizedPath = normalizeRequestPathname(pathname);

  if (normalizedRoute === normalizedPath) {
    return {
      matches: true,
      routeType: "exact",
      specificity: normalizedRoute === "/" ? 1 : splitRouteSegments(normalizedRoute).length,
      exact: true,
    };
  }

  const routeSegments = splitRouteSegments(normalizedRoute);
  const pathSegments = splitRouteSegments(normalizedPath);

  if (routeSegments.length !== pathSegments.length) {
    return {
      matches: false,
      routeType: null,
      specificity: 0,
      exact: false,
    };
  }

  let literalCount = 0;

  for (let index = 0; index < routeSegments.length; index += 1) {
    const routeSegment = routeSegments[index];
    const pathSegment = pathSegments[index];

    if (isParameterizedSegment(routeSegment)) {
      if (!pathSegment) {
        return {
          matches: false,
          routeType: null,
          specificity: 0,
          exact: false,
        };
      }
      continue;
    }

    if (routeSegment !== pathSegment) {
      return {
        matches: false,
        routeType: null,
        specificity: 0,
        exact: false,
      };
    }

    literalCount += 1;
  }

  return {
    matches: true,
    routeType: "parameterized",
    specificity: literalCount,
    exact: false,
  };
};

export const isMatchingCampaignRoute = (campaignRoute, pathname) =>
  getCampaignRouteMatchScore(campaignRoute, pathname).matches;

export const isCampaignEligibleForDisplay = (campaign, now = new Date()) => {
  if (!campaign?.isActive) {
    return false;
  }

  const referenceTime = now instanceof Date ? now : new Date(now);
  const startDate = campaign.startDate ? new Date(campaign.startDate) : null;
  const endDate = campaign.endDate ? new Date(campaign.endDate) : null;

  if (startDate && startDate > referenceTime) {
    return false;
  }

  if (endDate && endDate < referenceTime) {
    return false;
  }

  return true;
};
