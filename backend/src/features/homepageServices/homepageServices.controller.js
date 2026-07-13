import { createMemoryUpload, uploadBufferToCloudinary, getCloudinaryFolder } from "../../shared/services/cloudinary.service.js";
import {
  createHomepageService,
  deleteHomepageService,
  getHomepageServiceById,
  getHomepageServices,
  getPublicHomepageServices,
  reorderHomepageServices,
  translateHomepageService,
  updateHomepageService,
  updateHomepageServiceStatus,
  uploadHomepageServiceImage,
  validateHomepageServicePayload,
} from "./homepageServices.service.js";
import { invalidateHomepageServicesCache } from "./homepageServices.cache.js";

const imageUpload = createMemoryUpload({
  maxFileSize: 6 * 1024 * 1024,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
});

const respondError = (res, status, message, details = undefined) =>
  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
  });

export const getHomepageServicesPublic = async (req, res) => {
  try {
    const data = await getPublicHomepageServices();
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[homepageServices] public fetch error:", error);
    return respondError(res, 500, "Failed to fetch homepage services");
  }
};

export const listHomepageServices = async (req, res) => {
  try {
    const data = await getHomepageServices(req.query || {});
    return res.json({ success: true, data });
  } catch (error) {
    console.error("[homepageServices] admin list error:", error);
    return respondError(res, 500, "Failed to fetch homepage services");
  }
};

export const getHomepageService = async (req, res) => {
  try {
    const service = await getHomepageServiceById(req.params.serviceId);
    if (!service) {
      return respondError(res, 404, "Homepage service not found");
    }
    return res.json({ success: true, data: service });
  } catch (error) {
    console.error("[homepageServices] get service error:", error);
    return respondError(res, 500, "Failed to fetch homepage service");
  }
};

export const createService = async (req, res) => {
  try {
    const { errors, sourceLanguage } = validateHomepageServicePayload(req.body || {});
    if (errors.length) {
      return respondError(res, 400, errors[0], errors);
    }

    const data = await createHomepageService({
      ...req.body,
      sourceLanguage,
    });

    return res.status(201).json({
      success: true,
      message: "Homepage service created successfully",
      data,
    });
  } catch (error) {
    console.error("[homepageServices] create error:", error);
    if (String(error?.code) === "11000") {
      return respondError(res, 409, "Service key already exists");
    }
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Failed to create homepage service",
    );
  }
};

export const updateService = async (req, res) => {
  try {
    const { errors } = validateHomepageServicePayload(req.body || {}, { isUpdate: true });
    if (errors.length) {
      return respondError(res, 400, errors[0], errors);
    }

    const updated = await updateHomepageService(req.params.serviceId, req.body || {});
    if (!updated) {
      return respondError(res, 404, "Homepage service not found");
    }

    return res.json({
      success: true,
      message: "Homepage service updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[homepageServices] update error:", error);
    if (String(error?.code) === "11000") {
      return respondError(res, 409, "Service key already exists");
    }
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Failed to update homepage service",
    );
  }
};

export const deleteService = async (req, res) => {
  try {
    const deleted = await deleteHomepageService(req.params.serviceId);
    if (!deleted) {
      return respondError(res, 404, "Homepage service not found");
    }
    return res.json({
      success: true,
      message: "Homepage service deleted successfully",
    });
  } catch (error) {
    console.error("[homepageServices] delete error:", error);
    return respondError(res, 500, "Failed to delete homepage service");
  }
};

export const updateServiceStatus = async (req, res) => {
  try {
    const updated = await updateHomepageServiceStatus(req.params.serviceId, req.body || {});
    if (!updated) {
      return respondError(res, 404, "Homepage service not found");
    }
    return res.json({
      success: true,
      message: "Homepage service status updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("[homepageServices] status update error:", error);
    return respondError(
      res,
      error?.statusCode || 500,
      error?.message || "Failed to update homepage service status",
    );
  }
};

export const reorderServices = async (req, res) => {
  try {
    const serviceOrder = Array.isArray(req.body?.serviceOrder)
      ? req.body.serviceOrder
      : Array.isArray(req.body)
        ? req.body
        : [];

    const data = await reorderHomepageServices(serviceOrder);
    return res.json({
      success: true,
      message: "Homepage services reordered successfully",
      data,
    });
  } catch (error) {
    console.error("[homepageServices] reorder error:", error);
    return respondError(res, 500, "Failed to reorder homepage services");
  }
};

export const translateService = async (req, res) => {
  try {
    const payload = req.body || {};
    const translated = await translateHomepageService(payload);
    return res.json({
      success: true,
      message: "Translations generated successfully",
      data: translated,
    });
  } catch (error) {
    console.error("[homepageServices] translate error:", error);
    return respondError(
      res,
      503,
      error?.message || "Translation service unavailable",
    );
  }
};

export const uploadServiceImage = async (req, res) => {
  try {
    imageUpload.single("image")(req, res, async (error) => {
      if (error) {
        if (error.code === "LIMIT_FILE_SIZE") {
          return respondError(res, 413, "Maximum image size allowed is 6 MB");
        }
        return respondError(res, 400, error.message || "Failed to upload image");
      }

      if (!req.file) {
        return respondError(res, 400, "Please choose an image to upload");
      }

      try {
        const folder = getCloudinaryFolder("homepage-services");
        const asset = await uploadBufferToCloudinary({
          buffer: req.file.buffer,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          folder,
          resourceType: "image",
        });

        return res.status(201).json({
          success: true,
          message: "Image uploaded successfully",
          data: uploadHomepageServiceImage(asset),
        });
      } catch (uploadError) {
        console.error("[homepageServices] image upload error:", uploadError);
        return respondError(
          res,
          uploadError.statusCode || 500,
          uploadError.statusCode === 503
            ? "Upload service is not configured"
            : "Failed to upload image",
        );
      }
    });
  } catch (error) {
    console.error("[homepageServices] upload route error:", error);
    return respondError(res, 500, "Failed to upload image");
  }
};

export const invalidateHomepageServices = async (req, res, next) => {
  try {
    invalidateHomepageServicesCache();
    next();
  } catch (error) {
    next(error);
  }
};
