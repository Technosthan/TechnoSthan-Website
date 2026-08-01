import mongoose from "mongoose";
import HomepageCtaSection from "./homepageCtaSections.model.js";
import {
  invalidateHomepageCtaSectionsCache,
  loadPublicHomepageCtaSectionsSnapshot,
} from "./homepageCtaSections.cache.js";

const ICON_KEYS = new Set([
  "sprout",
  "leaf",
  "tractor",
  "bot",
  "chart",
  "monitor",
  "book",
  "flask",
  "users",
  "sparkles",
]);

const MAX_ACTIVE_SECTIONS = 20;
const MAX_FEATURES_PER_SECTION = 10;
const DEFAULT_BUTTON_LINK = "/";

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const normalizeText = (value = "") => String(value || "").trim();

const parseBoolean = (value, fallback = false) => {
  if (typeof value === "boolean") {
    return { ok: true, value };
  }
  if (value === "true") {
    return { ok: true, value: true };
  }
  if (value === "false") {
    return { ok: true, value: false };
  }
  if (value === "" || value == null) {
    return { ok: true, value: fallback };
  }

  return { ok: false, value: fallback };
};

const parseDisplayOrder = (value, fallback = 0) => {
  if (value === "" || value == null) {
    return { ok: true, value: Number.isFinite(Number(fallback)) ? Number(fallback) : 0 };
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return { ok: false, value: 0 };
  }

  return { ok: true, value: parsed };
};

const isSafeButtonLink = (value = "") => {
  const raw = normalizeText(value);
  if (!raw) return false;
  if (/^(javascript|data|vbscript|file):/i.test(raw)) return false;
  if (raw.startsWith("#") || raw.startsWith("/")) return true;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
};

const normalizeButtonLink = (value = "") => {
  const raw = normalizeText(value);
  if (!raw) return DEFAULT_BUTTON_LINK;
  if (raw.startsWith("#") || raw.startsWith("/")) return raw;

  try {
    const parsed = new URL(raw);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.href : "";
  } catch {
    return "";
  }
};

const normalizeIconKey = (value = "", fallback = "leaf") => {
  const normalized = normalizeText(value).toLowerCase();
  return ICON_KEYS.has(normalized) ? normalized : fallback;
};

const normalizeFeature = (feature = {}, index = 0, existing = null) => {
  const existingPlain = existing ? cloneValue(existing) : {};
  const title = normalizeText(feature.title ?? existingPlain.title);
  const description = normalizeText(feature.description ?? existingPlain.description);
  const iconKey = normalizeIconKey(feature.iconKey ?? existingPlain.iconKey, "leaf");
  const displayOrderResult = parseDisplayOrder(feature.displayOrder, existingPlain.displayOrder ?? index);

  return {
    _id: feature._id || feature.id || existingPlain._id || existingPlain.id,
    title,
    description,
    iconKey,
    displayOrder: displayOrderResult.ok ? displayOrderResult.value : 0,
    rawIconKey: normalizeText(feature.iconKey ?? existingPlain.iconKey),
    displayOrderValid: displayOrderResult.ok,
  };
};

const normalizeSectionPayload = (payload = {}, existing = null) => {
  const existingPlain = existing ? cloneValue(existing) : {};
  const heading = normalizeText(payload.heading ?? existingPlain.heading);
  const rawHeadingIconKey = normalizeText(payload.headingIconKey ?? payload.headingIcon);
  const headingIconKey = normalizeIconKey(
    rawHeadingIconKey || existingPlain.headingIconKey,
    "sprout",
  );
  const description = normalizeText(payload.description ?? existingPlain.description);
  const buttonText = normalizeText(payload.buttonText ?? existingPlain.buttonText) || "Explore AgriTech";
  const buttonLinkRaw =
    payload.buttonLink != null ? String(payload.buttonLink) : existingPlain.buttonLink || DEFAULT_BUTTON_LINK;
  const openInNewTab = parseBoolean(
    payload.openInNewTab,
    existingPlain.openInNewTab ?? false,
  );
  const panelTitle = normalizeText(payload.panelTitle ?? existingPlain.panelTitle);
  const panelSubtitle = normalizeText(payload.panelSubtitle ?? existingPlain.panelSubtitle);
  const rawPanelIconKey = normalizeText(payload.panelIconKey ?? existingPlain.panelIconKey);
  const panelIconKey = normalizeIconKey(
    rawPanelIconKey || existingPlain.panelIconKey,
    "tractor",
  );
  const displayOrderResult = parseDisplayOrder(payload.displayOrder, existingPlain.displayOrder ?? 0);
  const isActiveResult = parseBoolean(payload.isActive, existingPlain.isActive ?? true);
  const openInNewTabResult = parseBoolean(payload.openInNewTab, existingPlain.openInNewTab ?? false);

  const rawFeatures = Array.isArray(payload.features)
    ? payload.features
    : Array.isArray(existingPlain.features)
      ? existingPlain.features
      : [];

  const normalizedFeatures = rawFeatures
    .map((feature, index) => normalizeFeature(feature, index, existingPlain.features?.[index]));

  const errors = [];

  if (!heading) errors.push("Heading is required");
  if (heading.length > 120) errors.push("Heading must be 120 characters or less");
  if (!panelTitle) errors.push("Panel title is required");
  if (panelTitle.length > 100) errors.push("Panel title must be 100 characters or less");
  if (description.length > 600) errors.push("Description must be 600 characters or less");
  if (buttonText.length > 60) errors.push("Button text must be 60 characters or less");
  if (panelSubtitle.length > 250) errors.push("Panel subtitle must be 250 characters or less");
  if (normalizedFeatures.length === 0) errors.push("At least one feature is required");
  if (rawFeatures.length > MAX_FEATURES_PER_SECTION) {
    errors.push("A maximum of 10 features is allowed");
  }
  if (!isSafeButtonLink(buttonLinkRaw)) errors.push("Please enter a valid button link");
  if (rawHeadingIconKey && !ICON_KEYS.has(rawHeadingIconKey.toLowerCase())) {
    errors.push("Invalid heading icon");
  }
  if (rawPanelIconKey && !ICON_KEYS.has(rawPanelIconKey.toLowerCase())) {
    errors.push("Invalid panel icon");
  }
  if (!displayOrderResult.ok) errors.push("Display order must be a number");
  if (!isActiveResult.ok) errors.push("isActive must be a boolean");
  if (!openInNewTabResult.ok) errors.push("openInNewTab must be a boolean");

  normalizedFeatures.forEach((feature, index) => {
    if (!feature.title) {
      errors.push(`Feature ${index + 1} title is required`);
    }
    if (feature.title.length > 100) {
      errors.push(`Feature ${index + 1} title must be 100 characters or less`);
    }
    if (feature.description.length > 250) {
      errors.push(`Feature ${index + 1} description must be 250 characters or less`);
    }
    if (!feature.rawIconKey || !ICON_KEYS.has(feature.rawIconKey.toLowerCase())) {
      errors.push(`Feature ${index + 1} icon is invalid`);
    }
    if (!feature.displayOrderValid) {
      errors.push(`Feature ${index + 1} display order must be a number`);
    }
  });

  return {
    errors,
    data: {
      heading,
      headingIconKey,
      description,
      buttonText,
      buttonLink: normalizeButtonLink(buttonLinkRaw),
      openInNewTab: openInNewTabResult.value,
      panelTitle,
      panelSubtitle,
      panelIconKey,
      features: normalizedFeatures
        .map((feature, index) => ({
          _id: feature._id,
          title: feature.title,
          description: feature.description,
          iconKey: feature.iconKey,
          displayOrder: feature.displayOrder,
        }))
        .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
      displayOrder: displayOrderResult.value,
      isActive: isActiveResult.value,
    },
  };
};

const toAdminSection = (section = {}) => ({
  _id: section._id?.toString?.() || section.id || "",
  id: section._id?.toString?.() || section.id || "",
  heading: section.heading || "",
  headingIconKey: section.headingIconKey || "sprout",
  description: section.description || "",
  buttonText: section.buttonText || "Explore AgriTech",
  buttonLink: section.buttonLink || DEFAULT_BUTTON_LINK,
  openInNewTab: Boolean(section.openInNewTab),
  panelTitle: section.panelTitle || "",
  panelSubtitle: section.panelSubtitle || "",
  panelIconKey: section.panelIconKey || "tractor",
  displayOrder: Number(section.displayOrder || 0),
  isActive: Boolean(section.isActive),
  createdAt: section.createdAt,
  updatedAt: section.updatedAt,
  features: (Array.isArray(section.features) ? section.features : [])
    .slice()
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((feature) => ({
      _id: feature._id?.toString?.() || feature.id || "",
      id: feature._id?.toString?.() || feature.id || "",
      title: feature.title || "",
      description: feature.description || "",
      iconKey: feature.iconKey || "leaf",
      displayOrder: Number(feature.displayOrder || 0),
    })),
});

const toPublicSection = (section = {}) => ({
  _id: section._id?.toString?.() || section.id || "",
  id: section._id?.toString?.() || section.id || "",
  heading: section.heading || "",
  headingIconKey: section.headingIconKey || "sprout",
  description: section.description || "",
  buttonText: section.buttonText || "Explore AgriTech",
  buttonLink: section.buttonLink || DEFAULT_BUTTON_LINK,
  openInNewTab: Boolean(section.openInNewTab),
  panelTitle: section.panelTitle || "",
  panelSubtitle: section.panelSubtitle || "",
  panelIconKey: section.panelIconKey || "tractor",
  displayOrder: Number(section.displayOrder || 0),
  features: (Array.isArray(section.features) ? section.features : [])
    .slice()
    .sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0))
    .map((feature) => ({
      _id: feature._id?.toString?.() || feature.id || "",
      id: feature._id?.toString?.() || feature.id || "",
      title: feature.title || "",
      description: feature.description || "",
      iconKey: feature.iconKey || "leaf",
      displayOrder: Number(feature.displayOrder || 0),
    })),
});

const countActiveSections = async (excludeId = null) => {
  const filter = { isActive: true };
  if (excludeId && mongoose.isValidObjectId(excludeId)) {
    filter._id = { $ne: excludeId };
  }
  return HomepageCtaSection.countDocuments(filter);
};

export const validateHomepageCtaSectionPayload = (
  payload = {},
  { isUpdate = false, existing = null } = {},
) => {
  const normalized = normalizeSectionPayload(payload, existing || (isUpdate ? payload : null));
  return {
    errors: normalized.errors,
    data: normalized.data,
  };
};

export const getAdminHomepageCtaSections = async () => {
  const sections = await HomepageCtaSection.find({})
    .sort({ displayOrder: 1, createdAt: 1 })
    .lean();

  return sections.map((section) => toAdminSection(section));
};

export const getHomepageCtaSectionById = async (sectionId) => {
  if (!mongoose.isValidObjectId(sectionId)) {
    return null;
  }

  const section = await HomepageCtaSection.findById(sectionId).lean();
  return section ? toAdminSection(section) : null;
};

export const getPublicHomepageCtaSections = async () => {
  const sections = await loadPublicHomepageCtaSectionsSnapshot();
  return sections.map((section) => toPublicSection(section));
};

export const createHomepageCtaSection = async (payload = {}) => {
  const normalized = normalizeSectionPayload(payload);

  if (normalized.errors.length) {
    const error = new Error(normalized.errors[0]);
    error.statusCode = 400;
    error.details = normalized.errors;
    throw error;
  }

  if (normalized.data.isActive) {
    const activeCount = await countActiveSections();
    if (activeCount >= MAX_ACTIVE_SECTIONS) {
      const error = new Error("Maximum active sections reached");
      error.statusCode = 400;
      throw error;
    }
  }

  const created = await HomepageCtaSection.create({
      ...normalized.data,
      features: normalized.data.features.map((feature, index) => ({
        ...feature,
        displayOrder: Number.isFinite(Number(feature.displayOrder)) ? Number(feature.displayOrder) : index,
      })),
  });

  invalidateHomepageCtaSectionsCache();
  return toAdminSection(created.toObject());
};

export const updateHomepageCtaSection = async (sectionId, payload = {}) => {
  if (!mongoose.isValidObjectId(sectionId)) {
    return null;
  }

  const existing = await HomepageCtaSection.findById(sectionId);
  if (!existing) return null;

  const normalized = normalizeSectionPayload(payload, existing.toObject());
  if (normalized.errors.length) {
    const error = new Error(normalized.errors[0]);
    error.statusCode = 400;
    error.details = normalized.errors;
    throw error;
  }

  if (normalized.data.isActive && !existing.isActive) {
    const activeCount = await countActiveSections(sectionId);
    if (activeCount >= MAX_ACTIVE_SECTIONS) {
      const error = new Error("Maximum active sections reached");
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await HomepageCtaSection.findByIdAndUpdate(
    sectionId,
    {
      $set: {
        ...normalized.data,
        features: normalized.data.features.map((feature, index) => ({
          ...feature,
          displayOrder: Number.isFinite(Number(feature.displayOrder)) ? Number(feature.displayOrder) : index,
        })),
      },
    },
    { new: true, runValidators: true },
  ).lean();

  invalidateHomepageCtaSectionsCache();
  return updated ? toAdminSection(updated) : null;
};

export const deleteHomepageCtaSection = async (sectionId) => {
  if (!mongoose.isValidObjectId(sectionId)) {
    return null;
  }

  const deleted = await HomepageCtaSection.findByIdAndDelete(sectionId).lean();
  if (deleted) {
    invalidateHomepageCtaSectionsCache();
  }

  return deleted ? toAdminSection(deleted) : null;
};

export const updateHomepageCtaSectionStatus = async (sectionId, isActive) => {
  if (!mongoose.isValidObjectId(sectionId)) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    const error = new Error("isActive must be a boolean");
    error.statusCode = 400;
    throw error;
  }

  const existing = await HomepageCtaSection.findById(sectionId);
  if (!existing) return null;

  if (isActive && !existing.isActive) {
    const activeCount = await countActiveSections(sectionId);
    if (activeCount >= MAX_ACTIVE_SECTIONS) {
      const error = new Error("Maximum active sections reached");
      error.statusCode = 400;
      throw error;
    }
  }

  const updated = await HomepageCtaSection.findByIdAndUpdate(
    sectionId,
    { $set: { isActive } },
    { new: true, runValidators: true },
  ).lean();

  if (updated) {
    invalidateHomepageCtaSectionsCache();
  }

  return updated ? toAdminSection(updated) : null;
};

export const reorderHomepageCtaSections = async (items = []) => {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("A non-empty items array is required");
    error.statusCode = 400;
    throw error;
  }

  const normalizedItems = items.map((item, index) => {
    const id = String(item?.id || item?._id || "").trim();
    const displayOrder = parseDisplayOrder(item?.displayOrder, index);
    return {
      id,
      displayOrder,
      valid: mongoose.isValidObjectId(id) && Number.isFinite(displayOrder),
    };
  });

  if (normalizedItems.some((item) => !item.valid)) {
    const error = new Error("Invalid section order payload");
    error.statusCode = 400;
    throw error;
  }

  await HomepageCtaSection.bulkWrite(
    normalizedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { displayOrder: item.displayOrder } },
      },
    })),
  );

  invalidateHomepageCtaSectionsCache();
  return getAdminHomepageCtaSections();
};

export const seedHomepageCtaSections = async (sections = []) => {
  const results = [];

  for (const section of sections) {
    const existing = await HomepageCtaSection.findOne({
      heading: section.heading,
      panelTitle: section.panelTitle,
    }).lean();

    if (existing) {
      results.push({
        heading: section.heading,
        status: "exists",
      });
      continue;
    }

    const normalized = normalizeSectionPayload(section);
    if (normalized.errors.length) {
      const error = new Error(normalized.errors[0]);
      error.statusCode = 400;
      throw error;
    }

    const created = await HomepageCtaSection.create({
      ...normalized.data,
      displayOrder: Number.isFinite(Number(normalized.data.displayOrder))
        ? Number(normalized.data.displayOrder)
        : results.length,
    });

    results.push({
      heading: section.heading,
      status: "created",
      id: created._id?.toString?.() || "",
    });
  }

  invalidateHomepageCtaSectionsCache();
  return results;
};

export const runHomepageCtaSectionsSeed = async () =>
  seedHomepageCtaSections([
    {
      heading: "Smart Farming Starts Here",
      headingIconKey: "sprout",
      description:
        "Learn AgriTech, explore AI tools, monitor farming progress, and improve agricultural productivity with TECHNOSTHAN AGRITECH.",
      buttonText: "Explore AgriTech",
      buttonLink: "/AgriTech Wiki",
      openInNewTab: false,
      panelTitle: "AI Agriculture",
      panelSubtitle: "Smart & sustainable farming",
      panelIconKey: "tractor",
      displayOrder: 0,
      isActive: true,
      features: [
        {
          title: "Smart Crop Monitoring",
          description: "",
          iconKey: "leaf",
          displayOrder: 0,
        },
        {
          title: "AI Farming Solutions",
          description: "",
          iconKey: "bot",
          displayOrder: 1,
        },
        {
          title: "Sustainable Agriculture",
          description: "",
          iconKey: "chart",
          displayOrder: 2,
        },
      ],
    },
  ]);
