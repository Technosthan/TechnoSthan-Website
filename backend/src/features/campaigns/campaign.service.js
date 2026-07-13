import { prisma } from "../../config/db.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeEnum = (value, fallback) =>
  String(value || fallback || "")
    .trim()
    .toUpperCase();

const normalizePage = (value = "") => {
  const raw = String(value || "")
    .trim()
    .toLowerCase();
  if (!raw || /\ball\b/.test(raw)) return "ALL";
  if (raw === "/" || raw === "home") return "HOME";
  if (raw.includes("program")) return "PROGRAMS";
  if (raw.includes("contact")) return "CONTACT";
  return "ALL";
};

const validateRedirectUrl = (value) => {
  if (!value) return null;

  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

  // Check for unsafe protocols
  const unsafeProtocols = [
    "javascript:",
    "data:",
    "file:",
    "vbscript:",
    "about:",
  ];
  const lowerUrl = trimmed.toLowerCase();
  for (const unsafe of unsafeProtocols) {
    if (lowerUrl.startsWith(unsafe)) {
      const error = new Error(
        `Unsafe redirect URL protocol: "${unsafe}" is not allowed`,
      );
      error.statusCode = 400;
      throw error;
    }
  }

  // Accept internal routes (starting with /)
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Accept external URLs with http:// or https://
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed); // Validate URL format
      return trimmed;
    } catch (_e) {
      const error = new Error("Invalid external URL format");
      error.statusCode = 400;
      throw error;
    }
  }

  // If no protocol and doesn't start with /, treat as invalid
  const error = new Error(
    "Redirect URL must be an internal route (e.g., /contact) or external URL (e.g., https://example.com)",
  );
  error.statusCode = 400;
  throw error;
};

const isCampaignVisibleForPage = (campaign, page) => {
  const scope = normalizePage(campaign.displayPages);
  if (scope === "ALL") return true;
  return scope === normalizePage(page);
};

const prepareCampaignData = (body = {}) => {
  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);

  const title = String(body.title || "").trim();
  const mediaType = normalizeEnum(body.mediaType, "");
  const mediaUrl = normalizeMediaUrl(
    body.mediaUrl || body.media || "",
    mediaType === "VIDEO" ? "video" : "image",
  );

  if (!title) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  if (!mediaUrl) {
    const error = new Error("Media URL is required");
    error.statusCode = 400;
    throw error;
  }

  if (!["IMAGE", "VIDEO"].includes(mediaType)) {
    const error = new Error("Media type must be IMAGE or VIDEO");
    error.statusCode = 400;
    throw error;
  }

  if (startDate && endDate && endDate < startDate) {
    const error = new Error("End date cannot be before start date");
    error.statusCode = 400;
    throw error;
  }

  const buttonText = String(body.buttonText || "").trim() || null;
  const redirectUrl = validateRedirectUrl(body.redirectUrl);
  const buttonText2 = String(body.buttonText2 || "").trim() || null;
  const redirectUrl2 = validateRedirectUrl(body.redirectUrl2);

  return {
    title,
    mediaUrl,
    mediaType,
    ctaLink: String(body.ctaLink || "").trim() || null,
    buttonText,
    redirectUrl,
    buttonText2,
    redirectUrl2,
    startDate,
    endDate,
    isActive: body.isActive ?? true,
    displayPages: normalizeEnum(body.displayPages, "ALL"),
    frequency: normalizeEnum(body.frequency, "SESSION"),
    popupSize: normalizeEnum(body.popupSize, "MEDIUM"),
    priority: Number(body.priority || 0),
  };
};

const campaignOrder = [
  { priority: "desc" },
  { updatedAt: "desc" },
  { createdAt: "desc" },
];

export const getActiveCampaign = async () => {
  const candidates = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: campaignOrder,
  });

  return (
    candidates.find((campaign) => isCampaignVisibleForPage(campaign, "ALL")) ||
    null
  );
};

export const getActiveCampaignForPage = async (page = "") => {
  const candidates = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: campaignOrder,
  });

  const normalizedPage = normalizePage(page);
  return (
    candidates.find((campaign) =>
      isCampaignVisibleForPage(campaign, normalizedPage),
    ) || null
  );
};

export const getActiveCampaignsForPage = async (page = "") => {
  const candidates = await prisma.campaign.findMany({
    where: { isActive: true },
    orderBy: campaignOrder,
  });

  const normalizedPage = normalizePage(page);
  return candidates.filter((campaign) =>
    isCampaignVisibleForPage(campaign, normalizedPage),
  );
};

export const listCampaigns = async () => {
  return prisma.campaign.findMany({
    orderBy: campaignOrder,
  });
};

export const createCampaign = async (body) => {
  const data = prepareCampaignData(body);
  return prisma.campaign.create({ data });
};

export const updateCampaign = async (id, body) => {
  const data = prepareCampaignData(body);
  return prisma.campaign.update({ where: { id }, data });
};

export const activateCampaign = async (id) =>
  prisma.campaign.update({ where: { id }, data: { isActive: true } });

export const deactivateCampaign = async (id) =>
  prisma.campaign.update({ where: { id }, data: { isActive: false } });

export const deleteCampaign = async (id) =>
  prisma.campaign.delete({ where: { id } });

export { prepareCampaignData };
