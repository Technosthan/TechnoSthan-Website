import { createMemoryUpload } from "../../shared/services/cloudinary.service.js";
import {
  createEmpoweringCard,
  deleteEmpoweringCard,
  getAdminEmpoweringCards,
  getEmpoweringCardById,
  getPublicEmpoweringCards,
  reorderEmpoweringCards,
  updateEmpoweringCard,
  updateEmpoweringCardStatus,
  uploadEmpoweringCardMediaPreview,
  validateEmpoweringCardPayload,
} from "./empoweringCards.service.js";

const mediaUpload = createMemoryUpload({
  maxFileSize: 50 * 1024 * 1024,
  allowedMimeTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ],
});

const uploadFields = mediaUpload.fields([
  { name: "media", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

const respondError = (res, status, message) =>
  res.status(status).json({
    success: false,
    message,
  });

const getSingleFile = (files = {}, fieldName = "") =>
  Array.isArray(files?.[fieldName]) && files[fieldName].length > 0
    ? files[fieldName][0]
    : null;

const handleMultipart = (req, res, handler) => {
  uploadFields(req, res, async (error) => {
    if (error) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return respondError(res, 413, "The selected file exceeds the allowed size.");
      }

      return respondError(
        res,
        400,
        error.message || "Media upload failed. Please try again.",
      );
    }

    try {
      await handler();
    } catch (handlerError) {
      return respondError(
        res,
        handlerError.statusCode || 500,
        handlerError.message || "Something went wrong. Please try again.",
      );
    }
  });
};

export const getPublicEmpoweringCardsController = async (req, res) => {
  try {
    const data = await getPublicEmpoweringCards();
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[empoweringCards] public fetch error:", error.message);
    return respondError(res, 500, "Failed to fetch homepage cards");
  }
};

export const listEmpoweringCards = async (req, res) => {
  try {
    const data = await getAdminEmpoweringCards();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[empoweringCards] admin list error:", error.message);
    return respondError(res, 500, "Failed to fetch homepage cards");
  }
};

export const getEmpoweringCard = async (req, res) => {
  try {
    const card = await getEmpoweringCardById(req.params.cardId);
    if (!card) {
      return respondError(res, 404, "Card not found");
    }
    return res.json({ success: true, data: card });
  } catch (error) {
    console.error("[empoweringCards] get error:", error.message);
    return respondError(res, 500, "Failed to fetch card");
  }
};

export const createCard = (req, res) =>
  handleMultipart(req, res, async () => {
    const payload = req.body || {};
    const { errors } = validateEmpoweringCardPayload(payload);
    if (errors.length) {
      return respondError(res, 400, errors[0]);
    }

    const mediaFile = getSingleFile(req.files, "media");
    const thumbnailFile = getSingleFile(req.files, "thumbnail");

    const data = await createEmpoweringCard({
      payload,
      mediaFile,
      thumbnailFile,
    });

    return res.status(201).json({
      success: true,
      message: "Card created successfully.",
      data,
    });
  });

export const updateCard = (req, res) =>
  handleMultipart(req, res, async () => {
    const payload = req.body || {};
    const { errors } = validateEmpoweringCardPayload(payload, { isUpdate: true });
    if (errors.length) {
      return respondError(res, 400, errors[0]);
    }

    const mediaFile = getSingleFile(req.files, "media");
    const thumbnailFile = getSingleFile(req.files, "thumbnail");

    const data = await updateEmpoweringCard(req.params.cardId, {
      payload,
      mediaFile,
      thumbnailFile,
    });

    if (!data) {
      return respondError(res, 404, "Card not found");
    }

    return res.json({
      success: true,
      message: "Card updated successfully.",
      data,
    });
  });

export const deleteCard = async (req, res) => {
  try {
    const deleted = await deleteEmpoweringCard(req.params.cardId);
    if (!deleted) {
      return respondError(res, 404, "Card not found");
    }
    return res.json({
      success: true,
      message: "Card deleted successfully.",
    });
  } catch (error) {
    console.error("[empoweringCards] delete error:", error.message);
    return respondError(res, error.statusCode || 500, "Failed to delete card");
  }
};

export const updateCardStatus = async (req, res) => {
  try {
    const isActive =
      req.body?.isActive === true ||
      req.body?.isActive === "true" ||
      req.body?.isActive === false ||
      req.body?.isActive === "false"
        ? req.body.isActive === true || req.body.isActive === "true"
        : undefined;

    if (typeof isActive !== "boolean") {
      return respondError(res, 400, "isActive must be a boolean");
    }

    const updated = await updateEmpoweringCardStatus(req.params.cardId, isActive);
    if (!updated) {
      return respondError(res, 404, "Card not found");
    }
    return res.json({
      success: true,
      message: isActive ? "Card enabled successfully." : "Card disabled successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[empoweringCards] status error:", error.message);
    return respondError(res, error.statusCode || 500, "Failed to update card status");
  }
};

export const reorderCards = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items)
      ? req.body.items
      : Array.isArray(req.body)
        ? req.body
        : [];
    const data = await reorderEmpoweringCards(items);
    return res.json({
      success: true,
      message: "Card order updated successfully.",
      data,
    });
  } catch (error) {
    console.error("[empoweringCards] reorder error:", error.message);
    return respondError(res, error.statusCode || 500, "Failed to reorder cards");
  }
};

export const previewUpload = (req, res) =>
  handleMultipart(req, res, async () => {
    const mediaFile = getSingleFile(req.files, "media");
    const thumbnailFile = getSingleFile(req.files, "thumbnail");
    const mediaType = String(req.body?.mediaType || "").trim().toLowerCase();
    const kind = String(req.body?.kind || "media").trim().toLowerCase();
    const title = String(req.body?.title || "").trim();

    const file = kind === "thumbnail" ? thumbnailFile || mediaFile : mediaFile;

    const asset = await uploadEmpoweringCardMediaPreview({
      file,
      mediaType: mediaType || (file?.mimetype?.startsWith("video/") ? "video" : "image"),
      kind,
      title,
    });

    return res.status(201).json({
      success: true,
      message: "Media uploaded successfully.",
      data: asset,
    });
  });
