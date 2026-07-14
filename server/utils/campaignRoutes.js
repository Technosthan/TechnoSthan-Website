const ROUTE_PARAM_PATTERN = /^:[A-Za-z_][A-Za-z0-9_]*$/;
const ROUTE_SEGMENT_PATTERN = /^[A-Za-z0-9._~-]+$/;

const createRouteError = (message) => {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
};

const stripQueryAndHash = (value) => String(value || "").split(/[?#]/)[0];

const normalizeCampaignRoute = (value, { allowEmpty = false } = {}) => {
  if (value === undefined || value === null || value === "") {
    if (allowEmpty) {
      return null;
    }

    return "/";
  }

  let route = stripQueryAndHash(String(value).trim());

  if (!route) {
    if (allowEmpty) {
      return null;
    }

    return "/";
  }

  if (route.includes("://")) {
    throw createRouteError("Display Route must be a website path, not a full URL");
  }

  if (/\s/.test(route)) {
    throw createRouteError("Display Route cannot contain spaces");
  }

  if (!route.startsWith("/")) {
    route = `/${route}`;
  }

  if (route.length > 1 && route.endsWith("/")) {
    route = route.replace(/\/+$/, "");
  }

  if (route === "/") {
    return "/";
  }

  if (!route.startsWith("/")) {
    throw createRouteError("Display Route must start with '/'");
  }

  if (route.includes("//")) {
    throw createRouteError("Display Route cannot contain duplicate slashes");
  }

  const segments = route.split("/").slice(1);
  for (const segment of segments) {
    if (!segment) {
      throw createRouteError("Display Route cannot contain duplicate slashes");
    }

    if (segment.startsWith(":")) {
      if (!ROUTE_PARAM_PATTERN.test(segment)) {
        throw createRouteError(
          "Display Route parameters must use the form /path/:paramName",
        );
      }

      continue;
    }

    if (!ROUTE_SEGMENT_PATTERN.test(segment)) {
      throw createRouteError(
        "Display Route can only contain URL-safe path characters",
      );
    }
  }

  return route || "/";
};

const normalizePathname = (value) => {
  let pathname = stripQueryAndHash(value).trim();

  if (!pathname) {
    return "/";
  }

  if (!pathname.startsWith("/")) {
    pathname = `/${pathname}`;
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.replace(/\/+$/, "");
  }

  return pathname || "/";
};

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRouteMatcher = (pattern) => {
  const normalizedPattern = normalizeCampaignRoute(pattern);

  if (normalizedPattern === "/") {
    return {
      pattern: normalizedPattern,
      regex: /^\/$/,
      isExact: true,
      literalCount: 0,
      paramCount: 0,
      segmentCount: 0,
    };
  }

  const segments = normalizedPattern.split("/").slice(1);
  const regexSource = segments
    .map((segment) =>
      segment.startsWith(":") ? "[^/]+" : escapeRegex(segment),
    )
    .join("/");

  return {
    pattern: normalizedPattern,
    regex: new RegExp(`^/${regexSource}$`),
    isExact: segments.every((segment) => !segment.startsWith(":")),
    literalCount: segments.filter((segment) => !segment.startsWith(":")).length,
    paramCount: segments.filter((segment) => segment.startsWith(":")).length,
    segmentCount: segments.length,
  };
};

const scoreRouteMatch = (campaign, pathname) => {
  const pattern = normalizeCampaignRoute(campaign.displayRoute || "/");
  const matcher = buildRouteMatcher(pattern);
  const normalizedPathname = normalizePathname(pathname);

  if (!matcher.regex.test(normalizedPathname)) {
    return null;
  }

  return {
    pattern,
    normalizedPathname,
    isExact: matcher.isExact && pattern === normalizedPathname,
    exactMatch: pattern === normalizedPathname,
    literalCount: matcher.literalCount,
    paramCount: matcher.paramCount,
    segmentCount: matcher.segmentCount,
    createdAt: campaign.createdAt ? new Date(campaign.createdAt).getTime() : 0,
    updatedAt: campaign.updatedAt ? new Date(campaign.updatedAt).getTime() : 0,
  };
};

const compareCampaignMatches = (left, right) => {
  if (left.exactMatch !== right.exactMatch) {
    return left.exactMatch ? -1 : 1;
  }

  if (left.literalCount !== right.literalCount) {
    return right.literalCount - left.literalCount;
  }

  if (left.paramCount !== right.paramCount) {
    return left.paramCount - right.paramCount;
  }

  if (left.segmentCount !== right.segmentCount) {
    return right.segmentCount - left.segmentCount;
  }

  if (left.updatedAt !== right.updatedAt) {
    return right.updatedAt - left.updatedAt;
  }

  return right.createdAt - left.createdAt;
};

const isCampaignInActiveWindow = (campaign, now = new Date()) => {
  const nowMs = now.getTime();
  const startAt = campaign.startAt ? new Date(campaign.startAt).getTime() : null;
  const expiresAt = campaign.expiresAt
    ? new Date(campaign.expiresAt).getTime()
    : null;

  const startOk = startAt === null || !Number.isFinite(startAt) || startAt <= nowMs;
  const expiryOk =
    expiresAt === null || !Number.isFinite(expiresAt) || expiresAt > nowMs;

  return Boolean(campaign.isActive) && startOk && expiryOk;
};

const findBestMatchingCampaign = (campaigns = [], pathname, now = new Date()) => {
  const validCampaigns = campaigns.filter((campaign) => {
    if (!isCampaignInActiveWindow(campaign, now)) {
      return false;
    }

    return Boolean(scoreRouteMatch(campaign, pathname));
  });

  if (!validCampaigns.length) {
    return null;
  }

  const scored = validCampaigns
    .map((campaign) => ({
      campaign,
      match: scoreRouteMatch(campaign, pathname),
    }))
    .filter((entry) => entry.match)
    .sort((left, right) => compareCampaignMatches(left.match, right.match));

  return scored[0]?.campaign || null;
};

module.exports = {
  buildRouteMatcher,
  compareCampaignMatches,
  findBestMatchingCampaign,
  isCampaignInActiveWindow,
  normalizeCampaignRoute,
  normalizePathname,
  scoreRouteMatch,
  stripQueryAndHash,
};
