const allowedPositions = new Set([
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]);

export const DEFAULT_HERO_HEADING_LINES = [
  "Transforming Businesses",
  "Through Modern",
  "Technology",
];

const MAX_HEADING_LINES = 3;
const MAX_HEADING_LINE_LENGTH = 45;

const parseBoolean = (value, fallback = true) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return ["true", "1", "yes", "on"].includes(
    String(value).toLowerCase()
  );
};

const normalizeHeadingLine = (line) =>
  String(line || "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const parseHeroHeadingLines = (value) => {
  if (Array.isArray(value)) {
    return value.map(normalizeHeadingLine);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map(normalizeHeadingLine);
  }

  return [];
};

const hasUnsafeHeadingContent = (line) =>
  /<\s*\/?\s*[a-z][^>]*>/i.test(line) || /<\/?script/i.test(line);

export const validateHeroSettingPayload = (
  req,
  res,
  next
) => {
  const {
    mainImageAlt,
    autoTransitionInterval,
    heroHeading,
  } = req.body || {};

  if (!mainImageAlt) {
    return res.status(400).json({
      success: false,
      message: "Main image alt text is required",
    });
  }

  const interval = Number.parseInt(
    autoTransitionInterval,
    10
  );

  if (
    Number.isNaN(interval) ||
    interval < 1000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Auto transition interval must be at least 1000 milliseconds",
    });
  }

  const headingLines = parseHeroHeadingLines(heroHeading).filter(Boolean);

  if (headingLines.length > MAX_HEADING_LINES) {
    return res.status(400).json({
      success: false,
      message: "Hero heading can contain at most 3 lines",
    });
  }

  const hasInvalidHeadingLine = headingLines.some((line) => {
    if (line.length > MAX_HEADING_LINE_LENGTH) {
      return true;
    }

    return hasUnsafeHeadingContent(line);
  });

  if (hasInvalidHeadingLine) {
    return res.status(400).json({
      success: false,
      message:
        "Hero heading lines must be plain text and no longer than 45 characters each",
    });
  }

  next();
};

export const validateHeroFeaturePayload = (
  req,
  res,
  next
) => {
  const {
    title,
    iconPosition,
    transitionDuration,
  } = req.body || {};

  if (!title || !iconPosition) {
    return res.status(400).json({
      success: false,
      message: "Feature title and icon position are required",
    });
  }

  if (!allowedPositions.has(iconPosition)) {
    return res.status(400).json({
      success: false,
      message: "Invalid icon position",
    });
  }

  const duration = Number.parseInt(
    transitionDuration,
    10
  );

  if (Number.isNaN(duration) || duration < 1000) {
    return res.status(400).json({
      success: false,
      message:
        "Transition duration must be at least 1000 milliseconds",
    });
  }

  next();
};

export const validateHeroFeatureStatus = (
  req,
  res,
  next
) => {
  if (req.body?.isActive === undefined) {
    return res.status(400).json({
      success: false,
      message: "isActive is required",
    });
  }

  next();
};

export const normalizeHeroSettingPayload = (
  body,
  existing = {}
) => ({
  mainImageAlt:
    body.mainImageAlt?.trim() ||
    existing.mainImageAlt,
  heroHeadingLines: (() => {
    const lines = parseHeroHeadingLines(body.heroHeading).filter(Boolean);

    if (lines.length > 0) {
      return lines.slice(0, MAX_HEADING_LINES);
    }

    if (Array.isArray(existing.heroHeadingLines) && existing.heroHeadingLines.length > 0) {
      return existing.heroHeadingLines
        .map(normalizeHeadingLine)
        .filter(Boolean)
        .slice(0, MAX_HEADING_LINES);
    }

    return DEFAULT_HERO_HEADING_LINES;
  })(),
  autoTransitionInterval: Number.parseInt(
    body.autoTransitionInterval,
    10
  ),
  isActive: parseBoolean(
    body.isActive,
    existing.isActive ?? true
  ),
});

export const normalizeHeroFeaturePayload = (
  body,
  existing = {}
) => ({
  title: body.title?.trim() || existing.title,
  iconKey:
    body.iconKey?.trim() || existing.iconKey || null,
  iconPosition:
    body.iconPosition?.trim() ||
    existing.iconPosition,
  displayOrder:
    body.displayOrder === undefined
      ? existing.displayOrder ?? 0
      : Number.parseInt(body.displayOrder, 10),
  transitionDuration:
    body.transitionDuration === undefined
      ? existing.transitionDuration ?? 4000
      : Number.parseInt(body.transitionDuration, 10),
  isActive: parseBoolean(
    body.isActive,
    existing.isActive ?? true
  ),
});
