import { prisma } from "../../config/db.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";
import {
  getCampaignRouteMatchScore,
  isCampaignEligibleForDisplay,
  normalizeCampaignRoute,
  normalizeRequestPathname,
} from "./campaign.utils.js";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeEnum = (value, fallback) =>
  String(value || fallback || "")
    .trim()
    .toUpperCase();

const validateRedirectUrl = (value) => {
  if (!value) return null;

  const trimmed = String(value || "").trim();
  if (!trimmed) return null;

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

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      new URL(trimmed);
      return trimmed;
    } catch (_error) {
      const error = new Error("Invalid external URL format");
      error.statusCode = 400;
      throw error;
    }
  }

  const error = new Error(
    "Redirect URL must be an internal route (e.g., /contact) or external URL (e.g., https://example.com)",
  );
  error.statusCode = 400;
  throw error;
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
  const displayRoute = normalizeCampaignRoute(body.displayRoute, {
    required: true,
  });

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
    displayRoute,
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

const rethrowCampaignConflict = (error, displayRoute = "") => {
  if (error?.code === "P2002") {
    const conflictError = new Error(
      displayRoute
        ? `An active campaign already exists for ${displayRoute}`
        : "An active campaign already exists for this route",
    );
    conflictError.statusCode = 409;
    throw conflictError;
  }

  throw error;
};

const getActiveCampaignCandidates = async () => {
  const now = new Date();

  const candidates = await prisma.campaign.findMany({
    where: {
      isActive: true,
    },
    orderBy: campaignOrder,
  });

  return candidates.filter((campaign) => isCampaignEligibleForDisplay(campaign, now));
};

const selectBestCampaignMatch = (campaigns, pathname = "/") => {
  const normalizedPathname = normalizeRequestPathname(pathname);
  const scoredCampaigns = campaigns
    .map((campaign) => {
      const score = getCampaignRouteMatchScore(campaign.displayRoute, normalizedPathname);
      return { campaign, score };
    })
    .filter(({ score }) => score.matches);

  const routeScopedCampaigns = scoredCampaigns.filter(
    ({ score }) => score.routeType !== "legacy",
  );
  const candidates =
    routeScopedCampaigns.length > 0 ? routeScopedCampaigns : scoredCampaigns;

  return (
    candidates
      .sort((left, right) => {
        const routeRank = (score) => {
          if (score.routeType === "exact") return 3;
          if (score.routeType === "parameterized") return 2;
          return 1;
        };

        const leftScore = left.score;
        const rightScore = right.score;

        const routeDiff = routeRank(rightScore) - routeRank(leftScore);
        if (routeDiff !== 0) return routeDiff;

        const specificityDiff = rightScore.specificity - leftScore.specificity;
        if (specificityDiff !== 0) return specificityDiff;

        const priorityDiff = (right.campaign.priority || 0) - (left.campaign.priority || 0);
        if (priorityDiff !== 0) return priorityDiff;

        const updatedDiff =
          new Date(right.campaign.updatedAt).getTime() -
          new Date(left.campaign.updatedAt).getTime();
        if (updatedDiff !== 0) return updatedDiff;

        return new Date(right.campaign.createdAt).getTime() - new Date(left.campaign.createdAt).getTime();
      })[0]?.campaign || null
  );
};

export const getActiveCampaign = async (pathname = "/") => {
  const candidates = await getActiveCampaignCandidates();
  return selectBestCampaignMatch(candidates, pathname);
};

export const getActiveCampaignsForPage = async (pathname = "/") => {
  const campaign = await getActiveCampaign(pathname);
  return campaign ? [campaign] : [];
};

export const listCampaigns = async () => {
  return prisma.campaign.findMany({
    orderBy: campaignOrder,
  });
};

const deactivateConflictingCampaigns = async (transaction, displayRoute, campaignId = null) => {
  if (!displayRoute) {
    return;
  }

  await transaction.campaign.updateMany({
    where: {
      isActive: true,
      displayRoute,
      ...(campaignId ? { NOT: { id: campaignId } } : {}),
    },
    data: {
      isActive: false,
    },
  });
};

const saveCampaignRecord = async (body, campaignId = null) => {
  const data = prepareCampaignData(body);

  try {
    return await prisma.$transaction(async (transaction) => {
      if (data.isActive) {
        await deactivateConflictingCampaigns(transaction, data.displayRoute, campaignId);
      }

      if (campaignId) {
        return transaction.campaign.update({
          where: { id: campaignId },
          data,
        });
      }

      return transaction.campaign.create({ data });
    });
  } catch (error) {
    rethrowCampaignConflict(error, data.displayRoute);
  }
};

export const createCampaign = async (body) => saveCampaignRecord(body);

export const updateCampaign = async (id, body) => saveCampaignRecord(body, id);

export const activateCampaign = async (id) =>
  {
    try {
      return await prisma.$transaction(async (transaction) => {
        const campaign = await transaction.campaign.findUnique({
          where: { id },
        });

        if (!campaign) {
          const error = new Error("Campaign not found");
          error.statusCode = 404;
          throw error;
        }

        const displayRoute = campaign.displayRoute
          ? normalizeCampaignRoute(campaign.displayRoute, {
              required: true,
            })
          : null;

        await deactivateConflictingCampaigns(transaction, displayRoute, id);

        return transaction.campaign.update({
          where: { id },
          data: { isActive: true, displayRoute },
        });
      });
    } catch (error) {
      rethrowCampaignConflict(error);
    }
  };

export const deactivateCampaign = async (id) =>
  prisma.campaign.update({ where: { id }, data: { isActive: false } });

export const deleteCampaign = async (id) =>
  prisma.campaign.delete({ where: { id } });

export { prepareCampaignData, selectBestCampaignMatch };
