import { prisma } from "../../config/db.js";
import { normalizeMediaUrl } from "../../shared/utils/media.js";

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const normalizeEnum = (value, fallback) =>
  String(value || fallback || "").trim().toUpperCase();

const prepareCampaignData = (body = {}) => {
  const startDate = parseDate(body.startDate);
  const endDate = parseDate(body.endDate);

  const title = String(body.title || "").trim();
  const mediaType = normalizeEnum(body.mediaType, "IMAGE");
  const mediaUrl = normalizeMediaUrl(body.mediaUrl || body.media || "", mediaType === "VIDEO" ? "video" : "image");

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

  return {
    title,
    mediaUrl,
    mediaType,
    ctaLink: String(body.ctaLink || "").trim() || null,
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
  const now = new Date();
  return prisma.campaign.findFirst({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startDate: null }, { startDate: { lte: now } }] },
        { OR: [{ endDate: null }, { endDate: { gte: now } }] },
      ],
    },
    orderBy: campaignOrder,
  });
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

export const deleteCampaign = async (id) => prisma.campaign.delete({ where: { id } });

export { prepareCampaignData };
