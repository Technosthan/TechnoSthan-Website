import {
  createHomepageCtaSection,
  deleteHomepageCtaSection,
  getAdminHomepageCtaSections,
  getHomepageCtaSectionById,
  getPublicHomepageCtaSections,
  reorderHomepageCtaSections,
  updateHomepageCtaSection,
  updateHomepageCtaSectionStatus,
  validateHomepageCtaSectionPayload,
} from "./homepageCtaSections.service.js";
import { invalidateHomepageCtaSectionsCache } from "./homepageCtaSections.cache.js";

const respondError = (res, status, message, details = undefined) =>
  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });

export const getHomepageCtaSectionsPublic = async (req, res) => {
  try {
    const data = await getPublicHomepageCtaSections();
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[homepageCtaSections] public fetch error:", error);
    return respondError(res, 500, "Failed to fetch homepage CTA sections");
  }
};

export const listHomepageCtaSections = async (req, res) => {
  try {
    const data = await getAdminHomepageCtaSections();
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[homepageCtaSections] admin list error:", error);
    return respondError(res, 500, "Failed to fetch homepage CTA sections");
  }
};

export const getHomepageCtaSection = async (req, res) => {
  try {
    const section = await getHomepageCtaSectionById(req.params.sectionId);
    if (!section) {
      return respondError(res, 404, "Homepage CTA section not found");
    }
    return res.json({ success: true, data: section });
  } catch (error) {
    console.error("[homepageCtaSections] get error:", error);
    return respondError(res, 500, "Failed to fetch homepage CTA section");
  }
};

export const createHomepageCtaSectionController = async (req, res) => {
  try {
    const { errors } = validateHomepageCtaSectionPayload(req.body || {});
    if (errors.length) {
      return respondError(res, 400, errors[0], errors);
    }

    const data = await createHomepageCtaSection(req.body || {});
    return res.status(201).json({
      success: true,
      message: "Section created successfully.",
      data,
    });
  } catch (error) {
    console.error("[homepageCtaSections] create error:", error);
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Unable to save the section. Please try again.",
      error?.details,
    );
  }
};

export const updateHomepageCtaSectionController = async (req, res) => {
  try {
    const existing = await getHomepageCtaSectionById(req.params.sectionId);
    if (!existing) {
      return respondError(res, 404, "Homepage CTA section not found");
    }

    const { errors } = validateHomepageCtaSectionPayload(req.body || {}, {
      isUpdate: true,
      existing,
    });
    if (errors.length) {
      return respondError(res, 400, errors[0], errors);
    }

    const updated = await updateHomepageCtaSection(req.params.sectionId, req.body || {});
    if (!updated) {
      return respondError(res, 404, "Homepage CTA section not found");
    }

    return res.json({
      success: true,
      message: "Section updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[homepageCtaSections] update error:", error);
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Unable to save the section. Please try again.",
      error?.details,
    );
  }
};

export const deleteHomepageCtaSectionController = async (req, res) => {
  try {
    const deleted = await deleteHomepageCtaSection(req.params.sectionId);
    if (!deleted) {
      return respondError(res, 404, "Homepage CTA section not found");
    }

    return res.json({
      success: true,
      message: "Section deleted successfully.",
    });
  } catch (error) {
    console.error("[homepageCtaSections] delete error:", error);
    return respondError(res, 500, "Unable to delete the section. Please try again.");
  }
};

export const updateHomepageCtaSectionStatusController = async (req, res) => {
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

    const updated = await updateHomepageCtaSectionStatus(req.params.sectionId, isActive);
    if (!updated) {
      return respondError(res, 404, "Homepage CTA section not found");
    }

    return res.json({
      success: true,
      message: "Section status updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("[homepageCtaSections] status error:", error);
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Unable to update section status. Please try again.",
    );
  }
};

export const reorderHomepageCtaSectionsController = async (req, res) => {
  try {
    const items = Array.isArray(req.body?.items)
      ? req.body.items
      : Array.isArray(req.body)
        ? req.body
        : [];

    const data = await reorderHomepageCtaSections(items);
    return res.json({
      success: true,
      message: "Section order updated successfully.",
      data,
    });
  } catch (error) {
    console.error("[homepageCtaSections] reorder error:", error);
    return respondError(res, error?.statusCode || 500, "Unable to save the section order.");
  }
};

export const invalidateHomepageCtaSections = async (req, res, next) => {
  try {
    invalidateHomepageCtaSectionsCache();
    next();
  } catch (error) {
    next(error);
  }
};
