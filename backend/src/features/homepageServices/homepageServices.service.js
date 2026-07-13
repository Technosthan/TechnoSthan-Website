import mongoose from "mongoose";
import HomepageService, { SERVICE_LANGUAGES } from "./homepageServices.model.js";
import {
  invalidateHomepageServicesCache,
  loadPublicHomepageServicesSnapshot,
} from "./homepageServices.cache.js";
import { normalizeHttpUrl, isSafeHttpUrl } from "../../shared/utils/url.js";
import { normalizeStoredAsset, resolveStoredAssetUrl } from "../../shared/services/cloudinary.service.js";
import { translateHomepageServicePayload } from "./homepageServices.translation.service.js";

const LANGUAGE_SET = new Set(SERVICE_LANGUAGES);

const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

const normalizeLanguageCode = (value = "en") => {
  const normalized = String(value || "en").trim().toLowerCase();
  return LANGUAGE_SET.has(normalized) ? normalized : "en";
};

const emptyLocalizedText = () => ({
  en: "",
  hi: "",
  rj: "",
});

const emptyTranslationState = () => ({
  en: "missing",
  hi: "missing",
  rj: "missing",
});

const emptyTranslationErrors = () => ({
  en: "",
  hi: "",
  rj: "",
});

const buildLocalizedText = (input = {}, fallback = {}) => {
  const result = emptyLocalizedText();
  for (const language of SERVICE_LANGUAGES) {
    result[language] = String(
      input?.[language] ??
        input?.[language === "rj" ? "raj" : language] ??
        fallback?.[language] ??
        "",
    ).trim();
  }
  return result;
};

const completeStateFromText = (text = {}) => {
  const status = emptyTranslationState();
  for (const language of SERVICE_LANGUAGES) {
    status[language] = String(text?.[language] || "").trim()
      ? "complete"
      : "missing";
  }
  return status;
};

const normalizeAssetInput = (asset = "", fallbackUrl = "") => {
  const resolved = normalizeStoredAsset(asset, fallbackUrl);
  if (resolved && typeof resolved === "object") {
    return resolved;
  }
  return null;
};

const getImageUrl = (value = "") => resolveStoredAssetUrl(value);

const normalizeSafeRedirectUrl = (value = "") => normalizeHttpUrl(value);

const buildInnerService = (input = {}, index = 0, fallback = {}) => {
  const title = buildLocalizedText(input?.title || {}, fallback?.title || {});
  const description = buildLocalizedText(
    input?.description || {},
    fallback?.description || {},
  );
  const imageUrl = getImageUrl(input?.imageUrl || fallback?.imageUrl || "");

  return {
    title,
    description,
    sourceLanguage: normalizeLanguageCode(
      input?.sourceLanguage || fallback?.sourceLanguage || "en",
    ),
    icon: String(input?.icon || fallback?.icon || "").trim(),
    imageUrl,
    imageAsset: normalizeAssetInput(input?.imageAsset, imageUrl),
    redirectUrl: normalizeSafeRedirectUrl(
      input?.redirectUrl || fallback?.redirectUrl || "",
    ),
    openInNewTab:
      typeof input?.openInNewTab === "boolean"
        ? input.openInNewTab
        : Boolean(fallback?.openInNewTab),
    displayOrder: Number.isFinite(Number(input?.displayOrder))
      ? Number(input.displayOrder)
      : index + 1,
    isActive:
      typeof input?.isActive === "boolean"
        ? input.isActive
        : fallback?.isActive != null
          ? Boolean(fallback.isActive)
          : true,
    translationStatus:
      input?.translationStatus || fallback?.translationStatus || completeStateFromText(title),
    translationErrors:
      input?.translationErrors || fallback?.translationErrors || emptyTranslationErrors(),
  };
};

const ensureFourInnerServices = (innerServices = [], fallback = []) => {
  const normalized = [];

  for (let index = 0; index < 4; index += 1) {
    normalized.push(
      buildInnerService(
        innerServices[index] || {},
        index,
        fallback[index] || {},
      ),
    );
  }

  return normalized;
};

const buildServiceDocument = (input = {}, existing = null) => {
  const existingPlain = existing ? cloneValue(existing) : {};
  const sourceLanguage = normalizeLanguageCode(
    input.sourceLanguage || existingPlain.sourceLanguage || "en",
  );
  const name = buildLocalizedText(input.name || {}, existingPlain.name || {});
  const description = buildLocalizedText(
    input.description || {},
    existingPlain.description || {},
  );
  const imageUrl = getImageUrl(input.imageUrl || existingPlain.imageUrl || "");

  const innerServices = ensureFourInnerServices(
    Array.isArray(input.innerServices)
      ? input.innerServices
      : Array.isArray(existingPlain.innerServices)
        ? existingPlain.innerServices
        : [],
    Array.isArray(existingPlain.innerServices) ? existingPlain.innerServices : [],
  );

  return {
    serviceKey:
      String(
        input.serviceKey ||
          existingPlain.serviceKey ||
          slugify(name.en || name.hi || name.rj || input.slug || "homepage-service"),
      ).trim(),
    slug:
      String(
        input.slug ||
          existingPlain.slug ||
          slugify(name.en || name.hi || name.rj || input.serviceKey || "homepage-service"),
      ).trim(),
    name,
    description,
    sourceLanguage,
    icon: String(input.icon || existingPlain.icon || "").trim(),
    imageUrl,
    imageAsset: normalizeAssetInput(input.imageAsset, imageUrl),
    accentColor: String(input.accentColor || existingPlain.accentColor || "#0f766e").trim(),
    redirectUrl: normalizeSafeRedirectUrl(input.redirectUrl || existingPlain.redirectUrl || ""),
    openInNewTab:
      typeof input.openInNewTab === "boolean"
        ? input.openInNewTab
        : Boolean(existingPlain.openInNewTab),
    displayOrder: Number.isFinite(Number(input.displayOrder))
      ? Number(input.displayOrder)
      : Number(existingPlain.displayOrder || 0),
    status: input.status || existingPlain.status || "draft",
    isActive:
      typeof input.isActive === "boolean"
        ? input.isActive
        : existingPlain.isActive != null
          ? Boolean(existingPlain.isActive)
          : true,
    translationStatus:
      input.translationStatus ||
      existingPlain.translationStatus ||
      completeStateFromText(name),
    translationErrors:
      input.translationErrors ||
      existingPlain.translationErrors ||
      emptyTranslationErrors(),
    innerServices,
  };
};

const buildFieldTranslationState = (...valueMaps) => {
  const translationStatus = emptyTranslationState();
  const translationErrors = emptyTranslationErrors();

  for (const language of SERVICE_LANGUAGES) {
    const isComplete = valueMaps.every((valueMap) =>
      Boolean(String(valueMap?.[language] || "").trim()),
    );
    translationStatus[language] = isComplete ? "complete" : "missing";
    translationErrors[language] = "";
  }

  return { translationStatus, translationErrors };
};

const markCompleteness = (service) => {
  const completedInnerServices = (service.innerServices || []).filter((inner) =>
    SERVICE_LANGUAGES.every((language) => {
      const title = String(inner?.title?.[language] || "").trim();
      const description = String(inner?.description?.[language] || "").trim();
      return Boolean(title && description);
    }),
  ).length;

  const isFullyTranslated = SERVICE_LANGUAGES.every((language) =>
    Boolean(String(service?.name?.[language] || "").trim() && String(service?.description?.[language] || "").trim()),
  );

  return {
    ...service,
    completedInnerServices,
    translationStatus: {
      ...(service.translationStatus || emptyTranslationState()),
      en: isFullyTranslated ? "complete" : service.translationStatus?.en || "missing",
      hi: isFullyTranslated ? "complete" : service.translationStatus?.hi || "missing",
      rj: isFullyTranslated ? "complete" : service.translationStatus?.rj || "missing",
    },
  };
};

const buildPublicService = (service = {}) => ({
  _id: service._id?.toString?.() || service.id || "",
  id: service._id?.toString?.() || service.id || "",
  slug: service.slug || "",
  serviceKey: service.serviceKey || "",
  name: service.name || emptyLocalizedText(),
  description: service.description || emptyLocalizedText(),
  sourceLanguage: normalizeLanguageCode(service.sourceLanguage || "en"),
  icon: service.icon || "",
  imageUrl: getImageUrl(service.imageUrl || ""),
  accentColor: service.accentColor || "#0f766e",
  redirectUrl: service.redirectUrl || "",
  openInNewTab: Boolean(service.openInNewTab),
  displayOrder: Number(service.displayOrder || 0),
  status: service.status || "draft",
  isActive: Boolean(service.isActive),
  completedInnerServices: Number(service.completedInnerServices || 0),
  innerServices: (Array.isArray(service.innerServices) ? service.innerServices : [])
    .filter((inner) => inner?.isActive !== false)
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((inner) => ({
      _id: inner._id?.toString?.() || inner.id || "",
      id: inner._id?.toString?.() || inner.id || "",
      title: inner.title || emptyLocalizedText(),
      description: inner.description || emptyLocalizedText(),
      sourceLanguage: normalizeLanguageCode(inner.sourceLanguage || "en"),
      icon: inner.icon || "",
      imageUrl: getImageUrl(inner.imageUrl || ""),
      redirectUrl: inner.redirectUrl || "",
      openInNewTab: Boolean(inner.openInNewTab),
      displayOrder: Number(inner.displayOrder || 0),
      isActive: Boolean(inner.isActive),
    })),
});

const buildAdminService = (service = {}) => ({
  _id: service._id?.toString?.() || service.id || "",
  id: service._id?.toString?.() || service.id || "",
  slug: service.slug || "",
  serviceKey: service.serviceKey || "",
  name: service.name || emptyLocalizedText(),
  description: service.description || emptyLocalizedText(),
  sourceLanguage: normalizeLanguageCode(service.sourceLanguage || "en"),
  icon: service.icon || "",
  imageUrl: getImageUrl(service.imageUrl || ""),
  imageAsset: service.imageAsset || null,
  accentColor: service.accentColor || "#0f766e",
  redirectUrl: service.redirectUrl || "",
  openInNewTab: Boolean(service.openInNewTab),
  displayOrder: Number(service.displayOrder || 0),
  status: service.status || "draft",
  isActive: Boolean(service.isActive),
  completedInnerServices: Number(service.completedInnerServices || 0),
  translationStatus: service.translationStatus || emptyTranslationState(),
  translationErrors: service.translationErrors || emptyTranslationErrors(),
  innerServices: (Array.isArray(service.innerServices) ? service.innerServices : [])
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((inner) => ({
      _id: inner._id?.toString?.() || inner.id || "",
      id: inner._id?.toString?.() || inner.id || "",
      title: inner.title || emptyLocalizedText(),
      description: inner.description || emptyLocalizedText(),
      sourceLanguage: normalizeLanguageCode(inner.sourceLanguage || "en"),
      icon: inner.icon || "",
      imageUrl: getImageUrl(inner.imageUrl || ""),
      imageAsset: inner.imageAsset || null,
      redirectUrl: inner.redirectUrl || "",
      openInNewTab: Boolean(inner.openInNewTab),
      displayOrder: Number(inner.displayOrder || 0),
      isActive: Boolean(inner.isActive),
      translationStatus: inner.translationStatus || emptyTranslationState(),
      translationErrors: inner.translationErrors || emptyTranslationErrors(),
    })),
});

const validateInnerServicesForPublish = (innerServices = []) => {
  if (!Array.isArray(innerServices) || innerServices.length !== 4) {
    return "Exactly four inner services are required";
  }

  for (let index = 0; index < 4; index += 1) {
    const inner = innerServices[index] || {};
    const hasSourceTitle = Boolean(
      String(inner.title?.[inner.sourceLanguage || "en"] || "").trim(),
    );
    const hasAnyLanguageTitle = SERVICE_LANGUAGES.every((language) =>
      Boolean(String(inner.title?.[language] || "").trim()),
    );
    const hasAnyLanguageDescription = SERVICE_LANGUAGES.every((language) =>
      Boolean(String(inner.description?.[language] || "").trim()),
    );

    if (!hasSourceTitle || !hasAnyLanguageTitle || !hasAnyLanguageDescription) {
      return `Inner service ${index + 1} must have title and description in all languages before publishing`;
    }
  }

  return "";
};

const validateServiceForPublish = (service = {}) => {
  const mainNameReady = SERVICE_LANGUAGES.every((language) =>
    Boolean(String(service.name?.[language] || "").trim()),
  );
  const mainDescriptionReady = SERVICE_LANGUAGES.every((language) =>
    Boolean(String(service.description?.[language] || "").trim()),
  );

  if (!mainNameReady) {
    return "Main service name must be completed in English, Hindi, and Rajasthani before publishing";
  }

  if (!mainDescriptionReady) {
    return "Main service description must be completed in English, Hindi, and Rajasthani before publishing";
  }

  return validateInnerServicesForPublish(service.innerServices || []);
};

const normalizeServiceInput = (payload = {}, existing = null) => {
  const normalized = buildServiceDocument(payload, existing);

  if (!normalized.serviceKey) {
    normalized.serviceKey = slugify(
      normalized.name.en || normalized.name.hi || normalized.name.rj || normalized.slug || "homepage-service",
    );
  }

  normalized.slug = slugify(normalized.slug || normalized.serviceKey || normalized.name.en || "homepage-service");
  normalized.redirectUrl = normalizeSafeRedirectUrl(normalized.redirectUrl || "");
  normalized.imageUrl = getImageUrl(normalized.imageUrl || "");
  normalized.imageAsset = normalizeAssetInput(payload.imageAsset, normalized.imageUrl);
  normalized.innerServices = ensureFourInnerServices(normalized.innerServices, existing?.innerServices || []);
  normalized.translationStatus = buildFieldTranslationState(
    normalized.name,
    normalized.description,
  ).translationStatus;
  normalized.translationErrors = buildFieldTranslationState(
    normalized.name,
    normalized.description,
  ).translationErrors;

  normalized.innerServices = normalized.innerServices.map((inner, index) => {
    const translated = buildFieldTranslationState(
      inner.title || {},
      inner.description || {},
    );
    return {
      ...inner,
      displayOrder: Number.isFinite(Number(inner.displayOrder))
        ? Number(inner.displayOrder)
        : index + 1,
      redirectUrl: normalizeSafeRedirectUrl(inner.redirectUrl || ""),
      imageUrl: getImageUrl(inner.imageUrl || ""),
      imageAsset: normalizeAssetInput(inner.imageAsset, inner.imageUrl || ""),
      translationStatus: translated.translationStatus,
      translationErrors: translated.translationErrors,
    };
  });

  return normalized;
};

const toMongooseUpdate = (payload = {}, existing = null) => {
  const normalized = normalizeServiceInput(payload, existing);
  return {
    serviceKey: normalized.serviceKey,
    slug: normalized.slug,
    name: normalized.name,
    description: normalized.description,
    sourceLanguage: normalized.sourceLanguage,
    icon: normalized.icon,
    imageUrl: normalized.imageUrl,
    imageAsset: normalized.imageAsset,
    accentColor: normalized.accentColor,
    redirectUrl: normalized.redirectUrl,
    openInNewTab: normalized.openInNewTab,
    displayOrder: normalized.displayOrder,
    status: normalized.status,
    isActive: normalized.isActive,
    translationStatus: normalized.translationStatus,
    translationErrors: normalized.translationErrors,
    innerServices: normalized.innerServices,
  };
};

export const getHomepageServices = async (query = {}) => {
  const filter = {};

  if (query.status && ["draft", "published"].includes(query.status)) {
    filter.status = query.status;
  }

  if (query.isActive === "true" || query.isActive === true) {
    filter.isActive = true;
  } else if (query.isActive === "false" || query.isActive === false) {
    filter.isActive = false;
  }

  const search = String(query.search || "").trim();
  if (search) {
    filter.$or = [
      { "name.en": { $regex: search, $options: "i" } },
      { "name.hi": { $regex: search, $options: "i" } },
      { "name.rj": { $regex: search, $options: "i" } },
      { "innerServices.title.en": { $regex: search, $options: "i" } },
      { "innerServices.title.hi": { $regex: search, $options: "i" } },
      { "innerServices.title.rj": { $regex: search, $options: "i" } },
    ];
  }

  const services = await HomepageService.find(filter)
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return services.map((service) => buildAdminService(markCompleteness(service)));
};

export const getPublicHomepageServices = async () => {
  const services = await loadPublicHomepageServicesSnapshot();
  return services.map((service) => buildPublicService(markCompleteness(service)));
};

export const getHomepageServiceById = async (serviceId) => {
  if (!mongoose.isValidObjectId(serviceId)) {
    return null;
  }

  const service = await HomepageService.findById(serviceId).lean();
  return service ? buildAdminService(markCompleteness(service)) : null;
};

export const createHomepageService = async (payload = {}) => {
  const data = toMongooseUpdate(payload);

  if (!data.serviceKey) {
    data.serviceKey = slugify(data.name.en || data.slug || `service-${Date.now()}`);
  }

  data.slug = slugify(data.slug || data.serviceKey);
  data.innerServices = ensureFourInnerServices(data.innerServices);

  if (data.status === "published") {
    const publishError = validateServiceForPublish(data);
    if (publishError) {
      const error = new Error(publishError);
      error.statusCode = 400;
      throw error;
    }
  }

  const created = await HomepageService.create(data);
  invalidateHomepageServicesCache();
  return buildAdminService(markCompleteness(created.toObject()));
};

export const updateHomepageService = async (serviceId, payload = {}) => {
  const existing = await HomepageService.findById(serviceId);
  if (!existing) {
    return null;
  }

  const data = toMongooseUpdate(payload, existing.toObject());

  if (data.status === "published") {
    const publishError = validateServiceForPublish(data);
    if (publishError) {
      const error = new Error(publishError);
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await HomepageService.findByIdAndUpdate(
    serviceId,
    { $set: data },
    { new: true, runValidators: true },
  ).lean();

  invalidateHomepageServicesCache();
  return updated ? buildAdminService(markCompleteness(updated)) : null;
};

export const deleteHomepageService = async (serviceId) => {
  const deleted = await HomepageService.findByIdAndDelete(serviceId).lean();
  if (deleted) {
    invalidateHomepageServicesCache();
  }
  return deleted;
};

export const updateHomepageServiceStatus = async (serviceId, payload = {}) => {
  const existing = await HomepageService.findById(serviceId);
  if (!existing) return null;

  const update = {};
  if (typeof payload.status === "string" && ["draft", "published"].includes(payload.status)) {
    update.status = payload.status;
  }
  if (typeof payload.isActive === "boolean") {
    update.isActive = payload.isActive;
  }

  if (Object.keys(update).length === 0) {
    return buildAdminService(markCompleteness(existing.toObject()));
  }

  if (update.status === "published") {
    const preview = {
      ...existing.toObject(),
      ...update,
    };
    const publishError = validateServiceForPublish(preview);
    if (publishError) {
      const error = new Error(publishError);
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await HomepageService.findByIdAndUpdate(
    serviceId,
    { $set: update },
    { new: true, runValidators: true },
  ).lean();

  invalidateHomepageServicesCache();
  return updated ? buildAdminService(markCompleteness(updated)) : null;
};

export const reorderHomepageServices = async (serviceOrder = []) => {
  if (!Array.isArray(serviceOrder) || serviceOrder.length === 0) {
    return [];
  }

  const updateOps = [];
  serviceOrder.forEach((item, index) => {
    const serviceId = String(item?.id || item?._id || "").trim();
    if (!mongoose.isValidObjectId(serviceId)) {
      return;
    }

    updateOps.push({
      updateOne: {
        filter: { _id: serviceId },
        update: { $set: { displayOrder: Number(item.displayOrder ?? index + 1) } },
      },
    });
  });

  if (updateOps.length > 0) {
    await HomepageService.bulkWrite(updateOps);
    invalidateHomepageServicesCache();
  }

  return getHomepageServices();
};

export const translateHomepageService = async (payload = {}) => {
  const sourceLanguage = normalizeLanguageCode(payload.sourceLanguage || "en");
  const service = {
    name: buildLocalizedText(payload.name || {}),
    description: buildLocalizedText(payload.description || {}),
    innerServices: ensureFourInnerServices(payload.innerServices || []),
  };

  const translated = await translateHomepageServicePayload({
    sourceLanguage,
    service,
    languages: SERVICE_LANGUAGES,
  });

  const normalized = normalizeServiceInput({
    ...payload,
    name: translated.name || payload.name || emptyLocalizedText(),
    description: translated.description || payload.description || emptyLocalizedText(),
    innerServices: Array.isArray(payload.innerServices)
      ? payload.innerServices.map((inner, index) => ({
          ...inner,
          title: translated.innerServices?.[index]?.title || inner.title || emptyLocalizedText(),
          description:
            translated.innerServices?.[index]?.description ||
            inner.description ||
            emptyLocalizedText(),
        }))
      : [],
  }, payload.existing || null);

  return {
    name: normalized.name,
    description: normalized.description,
    innerServices: normalized.innerServices.map((inner, index) => ({
      ...inner,
      title: inner.title,
      description: inner.description,
      translationStatus: buildFieldTranslationState(inner.title, inner.description).translationStatus,
      translationErrors: emptyTranslationErrors(),
      displayOrder: Number.isFinite(Number(inner.displayOrder))
        ? Number(inner.displayOrder)
        : index + 1,
    })),
    translationStatus: buildFieldTranslationState(
      normalized.name,
      normalized.description,
    ).translationStatus,
    translationErrors: emptyTranslationErrors(),
  };
};

export const uploadHomepageServiceImage = (asset = {}) => ({
  url: getImageUrl(asset?.secureUrl || asset?.url || ""),
  secureUrl: getImageUrl(asset?.secureUrl || asset?.url || ""),
  publicId: asset?.publicId || asset?.public_id || "",
  resourceType: asset?.resourceType || asset?.resource_type || "image",
  format: asset?.format || "",
  originalName: asset?.originalName || asset?.original_filename || "",
  mimeType: asset?.mimeType || asset?.mimetype || "",
  size: asset?.size || asset?.bytes || 0,
  bytes: asset?.bytes || asset?.size || 0,
  width: asset?.width || null,
  height: asset?.height || null,
  version: asset?.version || null,
  folder: asset?.folder || "",
});

export const seedHomepageServicePayloads = () => [
  {
    serviceKey: "agritech",
    slug: "agritech",
    name: {
      en: "AgriTech",
      hi: "AgriTech",
      rj: "AgriTech",
    },
    description: {
      en: "Smart farming ecosystem",
      hi: "स्मार्ट खेती इकोसिस्टम",
      rj: "स्मार्ट खेती इकोसिस्टम",
    },
    sourceLanguage: "en",
    icon: "Leaf",
    imageUrl: "",
    accentColor: "#16a34a",
    redirectUrl: "",
    openInNewTab: false,
    displayOrder: 1,
    status: "published",
    isActive: true,
    innerServices: [
      {
        title: {
          en: "Wiki",
          hi: "विकी",
          rj: "विकी",
        },
        description: {
          en: "Browse agricultural learning materials",
          hi: "कृषि सीखने की सामग्री देखें",
          rj: "कृषि सीखण सामग्री देखो",
        },
        sourceLanguage: "en",
        icon: "BookOpen",
        redirectUrl: "",
        openInNewTab: false,
        displayOrder: 1,
        isActive: true,
      },
      {
        title: {
          en: "Quiz",
          hi: "क्विज़",
          rj: "क्विज़",
        },
        description: {
          en: "Test your farming knowledge",
          hi: "अपनी खेती की जानकारी जांचें",
          rj: "अपणी खेती री जाणकारी परखो",
        },
        sourceLanguage: "en",
        icon: "ClipboardList",
        redirectUrl: "",
        openInNewTab: false,
        displayOrder: 2,
        isActive: true,
      },
      {
        title: {
          en: "AI Chatbot",
          hi: "AI चैटबॉट",
          rj: "AI चैटबॉट",
        },
        description: {
          en: "Get quick guidance from the assistant",
          hi: "सहायक से तुरंत मार्गदर्शन पाएँ",
          rj: "सहायक सूं झटपट सलाह लो",
        },
        sourceLanguage: "en",
        icon: "Bot",
        redirectUrl: "",
        openInNewTab: false,
        displayOrder: 3,
        isActive: true,
      },
      {
        title: {
          en: "Progress",
          hi: "प्रगति",
          rj: "प्रगति",
        },
        description: {
          en: "Track learning and farming progress",
          hi: "सीखने और खेती की प्रगति देखें",
          rj: "सीखण अणे खेती री प्रगति देखो",
        },
        sourceLanguage: "en",
        icon: "BarChart3",
        redirectUrl: "",
        openInNewTab: false,
        displayOrder: 4,
        isActive: true,
      },
    ],
  },
  {
    serviceKey: "innovation-hub",
    slug: "innovation-hub",
    name: {
      en: "Innovation Hub",
      hi: "Innovation Hub",
      rj: "Innovation Hub",
    },
    description: {
      en: "Build experiments, ideas and prototypes",
      hi: "प्रयोग, विचार और प्रोटोटाइप बनाएं",
      rj: "प्रयोग, विचार अणे प्रोटोटाइप बनावो",
    },
    sourceLanguage: "en",
    icon: "Sparkles",
    imageUrl: "",
    accentColor: "#2563eb",
    redirectUrl: "",
    openInNewTab: false,
    displayOrder: 2,
    status: "published",
    isActive: true,
    innerServices: Array.from({ length: 4 }, (_, index) => ({
      title: [
        {
          en: "Ideation Lab",
          hi: "विचार प्रयोगशाला",
          rj: "विचार प्रयोगशाला",
        },
        {
          en: "Prototype Studio",
          hi: "प्रोटोटाइप स्टूडियो",
          rj: "प्रोटोटाइप स्टूडियो",
        },
        {
          en: "Research Sprint",
          hi: "रिसर्च स्प्रिंट",
          rj: "रिसर्च स्प्रिंट",
        },
        {
          en: "Launch Support",
          hi: "लॉन्च सहायता",
          rj: "लॉन्च सहायता",
        },
      ][index],
      description: [
        {
          en: "Explore new ideas and early-stage concepts.",
          hi: "नए विचारों और शुरुआती अवधारणाओं को विकसित करें।",
          rj: "नवां विचार अणे शुरुआती अवधारणावां नी खोज करो।",
        },
        {
          en: "Turn concepts into testable prototypes.",
          hi: "अवधारणाओं को परखने योग्य प्रोटोटाइप में बदलें।",
          rj: "अवधारणावां ने परखण योग्य प्रोटोटाइप में बदलो।",
        },
        {
          en: "Run focused research for product decisions.",
          hi: "उत्पाद निर्णयों के लिए केंद्रित शोध करें।",
          rj: "उत्पाद फैसला खातर केंद्रित शोध करो।",
        },
        {
          en: "Prepare ideas for smooth delivery.",
          hi: "विचारों को सुचारु लॉन्च के लिए तैयार करें।",
          rj: "विचारां ने सुगम लॉन्च खातर तैयार करो।",
        },
      ][index],
      sourceLanguage: "en",
      icon: [
        "Sparkles",
        "Layers3",
        "BookOpen",
        "BarChart3",
      ][index],
      redirectUrl: "",
      openInNewTab: false,
      displayOrder: index + 1,
      isActive: true,
    })),
  },
  {
    serviceKey: "it-development",
    slug: "it-development",
    name: {
      en: "IT Development",
      hi: "आईटी विकास",
      rj: "आईटी विकास",
    },
    description: {
      en: "Modern websites, portals and systems",
      hi: "आधुनिक वेबसाइट, पोर्टल और सिस्टम",
      rj: "आधुनिक वेबसाइट, पोर्टल अणे सिस्टम",
    },
    sourceLanguage: "en",
    icon: "Code2",
    imageUrl: "",
    accentColor: "#0ea5e9",
    redirectUrl: "",
    openInNewTab: false,
    displayOrder: 3,
    status: "published",
    isActive: true,
    innerServices: Array.from({ length: 4 }, (_, index) => ({
      title: [
        {
          en: "Website Development",
          hi: "वेबसाइट विकास",
          rj: "वेबसाइट विकास",
        },
        {
          en: "Mobile Apps",
          hi: "मोबाइल ऐप्स",
          rj: "मोबाइल ऐप्स",
        },
        {
          en: "System Integration",
          hi: "सिस्टम एकीकरण",
          rj: "सिस्टम एकीकरण",
        },
        {
          en: "Maintenance & Support",
          hi: "रखरखाव और सहायता",
          rj: "रखरखाव अणे सहायता",
        },
      ][index],
      description: [
        {
          en: "Modern responsive websites for your brand.",
          hi: "आपके ब्रांड के लिए आधुनिक और responsive वेबसाइटें।",
          rj: "थारे ब्रांड खातर आधुनिक अणे responsive वेबसाइट।",
        },
        {
          en: "Cross-platform mobile experiences.",
          hi: "क्रॉस-प्लेटफॉर्म मोबाइल अनुभव।",
          rj: "क्रॉस-प्लेटफॉर्म मोबाइल अनुभव।",
        },
        {
          en: "Connect tools, apps and workflows together.",
          hi: "टूल्स, ऐप्स और वर्कफ़्लो को एक साथ जोड़ें।",
          rj: "टूल्स, ऐप्स अणे वर्कफ़्लो ने एक सार जोड़ो।",
        },
        {
          en: "Keep systems stable and updated.",
          hi: "सिस्टम को स्थिर और अपडेट रखें।",
          rj: "सिस्टम ने स्थिर अणे अपडेट राखो।",
        },
      ][index],
      sourceLanguage: "en",
      icon: [
        "Code2",
        "Bot",
        "Layers3",
        "Sparkles",
      ][index],
      redirectUrl: "",
      openInNewTab: false,
      displayOrder: index + 1,
      isActive: true,
    })),
  },
  {
    serviceKey: "hospitality",
    slug: "hospitality",
    name: {
      en: "Hospitality",
      hi: "अतिथि सत्कार",
      rj: "अतिथि सत्कार",
    },
    description: {
      en: "Guest care, stays and service experiences",
      hi: "अतिथि सेवा, ठहराव और अनुभव",
      rj: "मेहमान सेवा, ठहराव अणे अनुभव",
    },
    sourceLanguage: "en",
    icon: "Hotel",
    imageUrl: "",
    accentColor: "#8b5cf6",
    redirectUrl: "",
    openInNewTab: false,
    displayOrder: 4,
    status: "published",
    isActive: true,
    innerServices: Array.from({ length: 4 }, (_, index) => ({
      title: [
        {
          en: "Guest Services",
          hi: "अतिथि सेवाएं",
          rj: "अतिथि सेवावां",
        },
        {
          en: "Property Planning",
          hi: "प्रॉपर्टी योजना",
          rj: "प्रॉपर्टी योजना",
        },
        {
          en: "Team Training",
          hi: "टीम प्रशिक्षण",
          rj: "टीम प्रशिक्षण",
        },
        {
          en: "Operations Support",
          hi: "संचालन सहायता",
          rj: "संचालन सहायता",
        },
      ][index],
      description: [
        {
          en: "Friendly guest-facing experiences.",
          hi: "मित्रवत अतिथि अनुभव।",
          rj: "मित्रवत मेहमान अनुभव।",
        },
        {
          en: "Plan spaces and guest flows efficiently.",
          hi: "स्थान और अतिथि प्रवाह को कुशलता से योजना बनाएं।",
          rj: "जगह अणे मेहमान प्रवाह ने कुशलता सूं योजना बनाओ।",
        },
        {
          en: "Prepare staff for consistent service.",
          hi: "स्टाफ को सुसंगत सेवा के लिए तैयार करें।",
          rj: "स्टाफ ने एकरस सेवा खातर तैयार करो।",
        },
        {
          en: "Keep daily operations running smoothly.",
          hi: "दैनिक संचालन सुचारु रखें।",
          rj: "रोजमर्रा रा संचालन सुगम राखो।",
        },
      ][index],
      sourceLanguage: "en",
      icon: [
        "Hotel",
        "Building2",
        "ClipboardList",
        "BarChart3",
      ][index],
      redirectUrl: "",
      openInNewTab: false,
      displayOrder: index + 1,
      isActive: true,
    })),
  },
];

export const normalizeSeedService = (payload = {}) => normalizeServiceInput(payload);

export const runHomepageServicesSeed = async () => {
  const seeds = seedHomepageServicePayloads();
  const results = [];

  for (const seed of seeds) {
    const exists = await HomepageService.findOne({ serviceKey: seed.serviceKey }).lean();
    if (exists) {
      results.push({ serviceKey: seed.serviceKey, status: "exists" });
      continue;
    }

    const created = await HomepageService.create(normalizeSeedService(seed));
    results.push({ serviceKey: seed.serviceKey, status: "created", id: created._id?.toString?.() || "" });
  }

  invalidateHomepageServicesCache();
  return results;
};

export const validateHomepageServicePayload = (payload = {}, { isUpdate = false } = {}) => {
  const errors = [];
  const name = payload?.name || {};
  const description = payload?.description || {};
  const sourceLanguage = normalizeLanguageCode(payload?.sourceLanguage || "en");

  if (!isUpdate || payload.name) {
    if (!SERVICE_LANGUAGES.some((language) => String(name?.[language] || "").trim())) {
      errors.push("Service name is required");
    }
  }

  if (!isUpdate || payload.description) {
    if (!SERVICE_LANGUAGES.some((language) => String(description?.[language] || "").trim())) {
      errors.push("Service description is required");
    }
  }

  if (payload.redirectUrl && !isSafeHttpUrl(payload.redirectUrl)) {
    errors.push("Invalid redirect URL");
  }

  const innerServices = Array.isArray(payload.innerServices) ? payload.innerServices : [];
  if (innerServices.length > 4) {
    errors.push("A service can contain exactly four inner services");
  }

  innerServices.forEach((inner, index) => {
    const title = inner?.title || {};
    if (!SERVICE_LANGUAGES.some((language) => String(title?.[language] || "").trim())) {
      errors.push(`Inner service ${index + 1} requires a title`);
    }
    if (inner.redirectUrl && !isSafeHttpUrl(inner.redirectUrl)) {
      errors.push(`Inner service ${index + 1} has an invalid redirect URL`);
    }
  });

  return { errors, sourceLanguage };
};

export const mergeTranslatedService = (base = {}, translated = {}) => {
  const merged = cloneValue(base);
  if (translated?.name) {
    merged.name = {
      ...(merged.name || emptyLocalizedText()),
      ...translated.name,
    };
  }
  if (translated?.description) {
    merged.description = {
      ...(merged.description || emptyLocalizedText()),
      ...translated.description,
    };
  }
  if (Array.isArray(translated?.innerServices)) {
    merged.innerServices = (merged.innerServices || []).map((inner, index) => ({
      ...inner,
      title: {
        ...(inner.title || emptyLocalizedText()),
        ...(translated.innerServices[index]?.title || {}),
      },
      description: {
        ...(inner.description || emptyLocalizedText()),
        ...(translated.innerServices[index]?.description || {}),
      },
    }));
  }

  return merged;
};

export const getLocalizedServiceText = (value = {}, language = "en") => {
  const normalizedLanguage = normalizeLanguageCode(language);
  return (
    String(value?.[normalizedLanguage] || "").trim() ||
    String(value?.en || "").trim() ||
    String(value?.hi || "").trim() ||
    String(value?.rj || "").trim() ||
    ""
  );
};

export const completeServiceDocument = markCompleteness;
