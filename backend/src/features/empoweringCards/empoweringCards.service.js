import mongoose from "mongoose";
import EmpoweringCard from "./empoweringCards.model.js";
import { invalidateEmpoweringCardsCache } from "./empoweringCards.cache.js";
import {
  deleteCloudinaryAsset,
  getCloudinaryFolder,
  uploadBufferToCloudinary,
} from "../../shared/services/cloudinary.service.js";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const VIDEO_MIME_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024;

const FALLBACK_ICON = "tractor";

const slugifyValue = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const normalizeText = (value = "") => String(value || "").trim();

const parseBoolean = (value) => {
  if (typeof value === "boolean") {
    return { ok: true, value };
  }

  if (value === "true") {
    return { ok: true, value: true };
  }

  if (value === "false") {
    return { ok: true, value: false };
  }

  if (value == null || value === "") {
    return { ok: true, value: undefined };
  }

  return { ok: false };
};

const parseDisplayOrder = (value, fallback = 0) => {
  if (value == null || value === "") {
    return { ok: true, value: Number(fallback) || 0 };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false };
  }

  return { ok: true, value: parsed };
};

const isSafeButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return true;
  if (/^(javascript|data|vbscript):/i.test(raw)) return false;
  if (raw.startsWith("#") || raw.startsWith("/")) return true;
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const normalizeButtonLink = (value = "") => {
  const raw = String(value || "").trim();
  if (!raw) return "#";
  if (raw.startsWith("#") || raw.startsWith("/")) return raw;
  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
};

const getMediaTypeFromMime = (mimeType = "") => {
  const normalized = String(mimeType || "").toLowerCase();
  if (VIDEO_MIME_TYPES.has(normalized)) return "video";
  if (IMAGE_MIME_TYPES.has(normalized)) return "image";
  return "";
};

const getResourceTypeForMedia = (mediaType = "image") =>
  mediaType === "video" ? "video" : "image";

const getCloudinaryFolderForCard = (mediaType = "image", kind = "media") =>
  getCloudinaryFolder(
    "agritech",
    "empowering-cards",
    kind === "thumbnail"
      ? "thumbnails"
      : mediaType === "video"
        ? "videos"
        : "images",
  );

const buildAssetRecord = (asset = {}, fallbackResourceType = "image") => ({
  url: asset?.secureUrl || asset?.url || "",
  secureUrl: asset?.secureUrl || asset?.url || "",
  publicId: asset?.publicId || "",
  resourceType: asset?.resourceType || fallbackResourceType,
  format: asset?.format || "",
  originalName: asset?.originalName || "",
  mimeType: asset?.mimeType || "",
  size: asset?.size || 0,
  bytes: asset?.bytes || asset?.size || 0,
  width: asset?.width || null,
  height: asset?.height || null,
  version: asset?.version || null,
  folder: asset?.folder || "",
});

const normalizeCardPayload = (payload = {}, existing = null) => {
  const title = normalizeText(payload.title ?? existing?.title);
  const description = normalizeText(payload.description ?? existing?.description);
  const iconKey = slugifyValue(
    normalizeText(payload.iconKey ?? existing?.iconKey ?? FALLBACK_ICON),
  ) || FALLBACK_ICON;
  const buttonText = normalizeText(
    payload.buttonText ?? existing?.buttonText ?? "Learn More",
  ) || "Learn More";
  const buttonLinkRaw =
    payload.buttonLink != null ? String(payload.buttonLink) : existing?.buttonLink || "#";
  const buttonLink = normalizeButtonLink(buttonLinkRaw);
  const mediaTypeRaw = normalizeText(payload.mediaType ?? existing?.mediaType).toLowerCase();
  const mediaType = ["image", "video"].includes(mediaTypeRaw)
    ? mediaTypeRaw
    : existing?.mediaType || "image";

  const displayOrderResult = parseDisplayOrder(
    payload.displayOrder,
    existing?.displayOrder ?? 0,
  );
  const isActiveResult = parseBoolean(payload.isActive);
  const openInNewTabResult = parseBoolean(
    payload.openInNewTab ?? existing?.openInNewTab,
  );

  const errors = [];
  if (!title) errors.push("Title is required");
  if (!isSafeButtonLink(buttonLinkRaw)) {
    errors.push("Invalid button link");
  }
  if (!displayOrderResult.ok) errors.push("Display order must be a number");
  if (!isActiveResult.ok) errors.push("isActive must be a boolean");
  if (!openInNewTabResult.ok) errors.push("openInNewTab must be a boolean");

  return {
    errors,
    data: {
      title,
      description,
      iconKey,
      buttonText,
      buttonLink,
      mediaType,
      displayOrder: displayOrderResult.ok ? displayOrderResult.value : 0,
      isActive:
        isActiveResult.value === undefined
          ? existing?.isActive ?? true
          : isActiveResult.value,
      openInNewTab:
        openInNewTabResult.value === undefined
          ? existing?.openInNewTab ?? false
          : openInNewTabResult.value,
    },
  };
};

const validateUploadFile = (file, mediaType, kind = "media") => {
  if (!file) return "";

  const mimeType = String(file.mimetype || "").toLowerCase();
  const size = Number(file.size || 0);
  const detectedType = getMediaTypeFromMime(mimeType);

  if (kind === "thumbnail") {
    if (!IMAGE_MIME_TYPES.has(mimeType)) {
      return "Unsupported thumbnail type. Please upload a JPG, PNG, WEBP, or GIF image.";
    }
    if (size > MAX_THUMBNAIL_SIZE) {
      return "The selected thumbnail exceeds the allowed size.";
    }
    return "";
  }

  if (!detectedType) {
    return "Unsupported media type.";
  }

  if (detectedType !== mediaType) {
    return mediaType === "video"
      ? "The selected video must be an MP4, WEBM, or MOV file."
      : "The selected image must be a JPG, JPEG, PNG, WEBP, or GIF file.";
  }

  if (mediaType === "video" && size > MAX_VIDEO_SIZE) {
    return "The selected video exceeds the allowed size.";
  }

  if (mediaType === "image" && size > MAX_IMAGE_SIZE) {
    return "The selected image exceeds the allowed size.";
  }

  return "";
};

const uploadCardAsset = async ({
  file,
  mediaType,
  kind = "media",
  title = "",
}) => {
  if (!file) return null;

  const resourceType =
    kind === "thumbnail" ? "image" : getResourceTypeForMedia(mediaType);
  const folder = getCloudinaryFolderForCard(mediaType, kind);

  const asset = await uploadBufferToCloudinary({
    buffer: file.buffer,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    folder,
    resourceType,
    tags: [slugifyValue(title || "empowering-card"), kind],
  });

  return buildAssetRecord(asset, resourceType);
};

const deleteAssetSafely = async (asset = null) => {
  if (!asset?.publicId) return;
  try {
    await deleteCloudinaryAsset(asset.publicId, asset.resourceType || "image");
  } catch (error) {
    console.warn("[empoweringCards] failed to delete asset:", error.message);
  }
};

const toAdminCard = (card = {}) => ({
  _id: card._id?.toString?.() || card.id || "",
  id: card._id?.toString?.() || card.id || "",
  title: card.title || "",
  description: card.description || "",
  mediaType: card.mediaType || "image",
  mediaUrl: card.mediaUrl || "",
  mediaPublicId: card.mediaPublicId || "",
  mediaResourceType: card.mediaResourceType || getResourceTypeForMedia(card.mediaType),
  thumbnailUrl: card.thumbnailUrl || "",
  thumbnailPublicId: card.thumbnailPublicId || "",
  thumbnailResourceType: card.thumbnailResourceType || "image",
  iconKey: card.iconKey || FALLBACK_ICON,
  buttonText: card.buttonText || "Learn More",
  buttonLink: card.buttonLink || "#",
  openInNewTab: Boolean(card.openInNewTab),
  displayOrder: Number(card.displayOrder || 0),
  isActive: Boolean(card.isActive),
  createdAt: card.createdAt,
  updatedAt: card.updatedAt,
});

const toPublicCard = (card = {}) => ({
  _id: card._id?.toString?.() || card.id || "",
  id: card._id?.toString?.() || card.id || "",
  title: card.title || "",
  description: card.description || "",
  mediaType: card.mediaType || "image",
  mediaUrl: card.mediaUrl || "",
  thumbnailUrl: card.thumbnailUrl || "",
  iconKey: card.iconKey || FALLBACK_ICON,
  buttonText: card.buttonText || "Learn More",
  buttonLink: card.buttonLink || "#",
  openInNewTab: Boolean(card.openInNewTab),
  displayOrder: Number(card.displayOrder || 0),
});

const normalizeCreateOrUpdatePayload = (payload = {}, existing = null) => {
  const normalized = normalizeCardPayload(payload, existing);
  return normalized;
};

export const getPublicEmpoweringCards = async () => {
  const cards = await EmpoweringCard.find({ isActive: true })
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return cards.map((card) => toPublicCard(card));
};

export const getAdminEmpoweringCards = async () => {
  const cards = await EmpoweringCard.find({})
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return cards.map((card) => toAdminCard(card));
};

export const getEmpoweringCardById = async (cardId) => {
  if (!mongoose.isValidObjectId(cardId)) {
    return null;
  }

  const card = await EmpoweringCard.findById(cardId).lean();
  return card ? toAdminCard(card) : null;
};

export const createEmpoweringCard = async ({
  payload = {},
  mediaFile = null,
  thumbnailFile = null,
} = {}) => {
  const normalized = normalizeCreateOrUpdatePayload(payload);

  if (!normalized.data.title) {
    const error = new Error("Title is required");
    error.statusCode = 400;
    throw error;
  }

  const mediaType = normalized.data.mediaType;
  const mediaValidationError = validateUploadFile(mediaFile, mediaType, "media");
  if (mediaValidationError) {
    const error = new Error(mediaValidationError);
    error.statusCode = 400;
    throw error;
  }

  const thumbnailValidationError = validateUploadFile(
    thumbnailFile,
    "image",
    "thumbnail",
  );
  if (thumbnailValidationError) {
    const error = new Error(thumbnailValidationError);
    error.statusCode = 400;
    throw error;
  }

  if (!mediaFile && !String(payload.mediaUrl || "").trim()) {
    const error = new Error("A media file is required");
    error.statusCode = 400;
    throw error;
  }

  const uploadedAssets = [];

  try {
    const mediaAsset = mediaFile
      ? await uploadCardAsset({
          file: mediaFile,
          mediaType,
          kind: "media",
          title: normalized.data.title,
        })
      : null;

    if (mediaAsset) {
      uploadedAssets.push(mediaAsset);
    }

    const thumbnailAsset =
      mediaType === "video" && thumbnailFile
        ? await uploadCardAsset({
            file: thumbnailFile,
            mediaType: "image",
            kind: "thumbnail",
            title: normalized.data.title,
          })
        : null;

    if (thumbnailAsset) {
      uploadedAssets.push(thumbnailAsset);
    }

    const data = {
      title: normalized.data.title,
      description: normalized.data.description,
      mediaType,
      mediaUrl: mediaAsset?.secureUrl || normalizeText(payload.mediaUrl || ""),
      mediaPublicId: mediaAsset?.publicId || normalizeText(payload.mediaPublicId || ""),
      mediaResourceType:
        mediaAsset?.resourceType || getResourceTypeForMedia(mediaType),
      thumbnailUrl:
        mediaType === "video"
          ? thumbnailAsset?.secureUrl || normalizeText(payload.thumbnailUrl || "")
          : "",
      thumbnailPublicId:
        mediaType === "video"
          ? thumbnailAsset?.publicId || normalizeText(payload.thumbnailPublicId || "")
          : "",
      thumbnailResourceType: mediaType === "video" ? "image" : "image",
      iconKey: normalized.data.iconKey || FALLBACK_ICON,
      buttonText: normalized.data.buttonText,
      buttonLink: normalized.data.buttonLink,
      openInNewTab: normalized.data.openInNewTab,
      displayOrder: normalized.data.displayOrder,
      isActive: normalized.data.isActive,
    };

    if (!data.mediaUrl) {
      const error = new Error("A media file is required");
      error.statusCode = 400;
      throw error;
    }

    const created = await EmpoweringCard.create(data);
    return toAdminCard(created.toObject());
  } catch (error) {
    await Promise.all(uploadedAssets.map((asset) => deleteAssetSafely(asset)));
    throw error;
  } finally {
    invalidateEmpoweringCardsCache();
  }
};

export const updateEmpoweringCard = async (
  cardId,
  { payload = {}, mediaFile = null, thumbnailFile = null } = {},
) => {
  if (!mongoose.isValidObjectId(cardId)) {
    return null;
  }

  const existing = await EmpoweringCard.findById(cardId);
  if (!existing) {
    return null;
  }

  const existingPlain = existing.toObject();
  const normalized = normalizeCreateOrUpdatePayload(payload, existingPlain);
  const nextMediaType = normalized.data.mediaType || existingPlain.mediaType || "image";

  if (
    normalized.data.mediaType !== existingPlain.mediaType &&
    !mediaFile
  ) {
    const error = new Error("Changing the media type requires a new media upload");
    error.statusCode = 400;
    throw error;
  }

  const mediaValidationError = validateUploadFile(mediaFile, nextMediaType, "media");
  if (mediaValidationError) {
    const error = new Error(mediaValidationError);
    error.statusCode = 400;
    throw error;
  }

  const thumbnailValidationError = validateUploadFile(
    thumbnailFile,
    "image",
    "thumbnail",
  );
  if (thumbnailValidationError) {
    const error = new Error(thumbnailValidationError);
    error.statusCode = 400;
    throw error;
  }

  const uploadedAssets = [];

  try {
    const mediaAsset = mediaFile
      ? await uploadCardAsset({
          file: mediaFile,
          mediaType: nextMediaType,
          kind: "media",
          title: normalized.data.title || existingPlain.title,
        })
      : null;

    if (mediaAsset) {
      uploadedAssets.push(mediaAsset);
    }

    const thumbnailAsset =
      nextMediaType === "video" && thumbnailFile
        ? await uploadCardAsset({
            file: thumbnailFile,
            mediaType: "image",
            kind: "thumbnail",
            title: normalized.data.title || existingPlain.title,
          })
        : null;

    if (thumbnailAsset) {
      uploadedAssets.push(thumbnailAsset);
    }

    const updateData = {
      title: normalized.data.title || existingPlain.title,
      description: normalized.data.description,
      mediaType: nextMediaType,
      mediaUrl: mediaAsset?.secureUrl || existingPlain.mediaUrl,
      mediaPublicId: mediaAsset?.publicId || existingPlain.mediaPublicId || "",
      mediaResourceType:
        mediaAsset?.resourceType ||
        existingPlain.mediaResourceType ||
        getResourceTypeForMedia(nextMediaType),
      thumbnailUrl:
        nextMediaType === "video"
          ? thumbnailAsset?.secureUrl || existingPlain.thumbnailUrl || ""
          : "",
      thumbnailPublicId:
        nextMediaType === "video"
          ? thumbnailAsset?.publicId || existingPlain.thumbnailPublicId || ""
          : "",
      thumbnailResourceType: nextMediaType === "video" ? "image" : "image",
      iconKey: normalized.data.iconKey || FALLBACK_ICON,
      buttonText: normalized.data.buttonText,
      buttonLink: normalized.data.buttonLink,
      openInNewTab: normalized.data.openInNewTab,
      displayOrder: normalized.data.displayOrder,
      isActive: normalized.data.isActive,
    };

    const updated = await EmpoweringCard.findByIdAndUpdate(
      cardId,
      { $set: updateData },
      { runValidators: true, returnDocument: "after" },
    ).lean();

    if (!updated) {
      const error = new Error("Card not found");
      error.statusCode = 404;
      throw error;
    }

    if (mediaAsset?.publicId && existingPlain.mediaPublicId && existingPlain.mediaPublicId !== mediaAsset.publicId) {
      await deleteAssetSafely({
        publicId: existingPlain.mediaPublicId,
        resourceType: existingPlain.mediaResourceType || existingPlain.mediaType || "image",
      });
    }

    if (
      thumbnailAsset?.publicId &&
      existingPlain.thumbnailPublicId &&
      existingPlain.thumbnailPublicId !== thumbnailAsset.publicId
    ) {
      await deleteAssetSafely({
        publicId: existingPlain.thumbnailPublicId,
        resourceType: existingPlain.thumbnailResourceType || "image",
      });
    }

    return toAdminCard(updated);
  } catch (error) {
    await Promise.all(uploadedAssets.map((asset) => deleteAssetSafely(asset)));
    throw error;
  } finally {
    invalidateEmpoweringCardsCache();
  }
};

export const updateEmpoweringCardStatus = async (cardId, isActive) => {
  if (!mongoose.isValidObjectId(cardId)) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    const error = new Error("isActive must be a boolean");
    error.statusCode = 400;
    throw error;
  }

  const updated = await EmpoweringCard.findByIdAndUpdate(
    cardId,
    { $set: { isActive } },
    { runValidators: true, returnDocument: "after" },
  ).lean();

  if (updated) {
    invalidateEmpoweringCardsCache();
  }

  return updated ? toAdminCard(updated) : null;
};

export const reorderEmpoweringCards = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("A non-empty items array is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedItems = items.map((item, index) => {
    const id = String(item?.id || item?._id || "").trim();
    const orderResult = parseDisplayOrder(item?.displayOrder, index);
    return {
      id,
      displayOrder: orderResult.ok ? orderResult.value : index,
      valid: mongoose.isValidObjectId(id) && orderResult.ok,
    };
  });

  if (normalizedItems.some((item) => !item.valid)) {
    const error = new Error("Invalid card order payload");
    error.statusCode = 400;
    throw error;
  }

  const bulkOps = normalizedItems.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: item.displayOrder } },
    },
  }));

  await EmpoweringCard.bulkWrite(bulkOps);
  invalidateEmpoweringCardsCache();

  return getAdminEmpoweringCards();
};

export const deleteEmpoweringCard = async (cardId) => {
  if (!mongoose.isValidObjectId(cardId)) {
    return null;
  }

  const existing = await EmpoweringCard.findById(cardId).lean();
  if (!existing) {
    return null;
  }

  await EmpoweringCard.deleteOne({ _id: cardId });

  await Promise.all([
    deleteAssetSafely({
      publicId: existing.mediaPublicId,
      resourceType: existing.mediaResourceType || existing.mediaType || "image",
    }),
    deleteAssetSafely({
      publicId: existing.thumbnailPublicId,
      resourceType: existing.thumbnailResourceType || "image",
    }),
  ]);

  invalidateEmpoweringCardsCache();
  return toAdminCard(existing);
};

export const uploadEmpoweringCardMediaPreview = async ({
  file,
  mediaType,
  kind = "media",
  title = "",
} = {}) => {
  if (!file) {
    const error = new Error("No file provided");
    error.statusCode = 400;
    throw error;
  }

  return uploadCardAsset({
    file,
    mediaType,
    kind,
    title,
  });
};

export const validateEmpoweringCardPayload = (payload = {}, { isUpdate = false } = {}) => {
  const normalized = normalizeCardPayload(payload, isUpdate ? payload : null);
  return {
    errors: normalized.errors,
    data: normalized.data,
  };
};

export const seedEmpoweringCards = async (cards = []) => {
  const results = [];

  for (const card of cards) {
    const existing = await EmpoweringCard.findOne({
      mediaUrl: card.mediaUrl,
    }).lean();

    if (existing) {
      results.push({
        mediaUrl: card.mediaUrl,
        status: "exists",
      });
      continue;
    }

    const created = await EmpoweringCard.create({
      title: card.title,
      description: card.description || "",
      mediaType: card.mediaType || "image",
      mediaUrl: card.mediaUrl,
      mediaPublicId: card.mediaPublicId || "",
      mediaResourceType:
        card.mediaResourceType || getResourceTypeForMedia(card.mediaType),
      thumbnailUrl: card.thumbnailUrl || "",
      thumbnailPublicId: card.thumbnailPublicId || "",
      thumbnailResourceType: card.thumbnailResourceType || "image",
      iconKey: card.iconKey || FALLBACK_ICON,
      buttonText: card.buttonText || "Learn More",
      buttonLink: normalizeButtonLink(card.buttonLink || "#"),
      openInNewTab: Boolean(card.openInNewTab),
      displayOrder: Number.isFinite(Number(card.displayOrder))
        ? Number(card.displayOrder)
        : results.length,
      isActive: card.isActive !== false,
    });

    results.push({
      mediaUrl: card.mediaUrl,
      status: "created",
      id: created._id?.toString?.() || "",
    });
  }

  invalidateEmpoweringCardsCache();
  return results;
};

export const getEmpoweringCardsCollectionCount = async () =>
  EmpoweringCard.countDocuments({});

export const normalizeEmpoweringCardMediaType = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "image" || normalized === "video") {
    return normalized;
  }
  return "";
};
