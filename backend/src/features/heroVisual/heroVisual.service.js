import prisma from "../../core/database/prisma.js";
import {
  deleteStoredImage,
  saveUploadedImage,
} from "../../core/utils/media.js";
import {
  DEFAULT_HERO_HEADING_LINES,
  normalizeHeroFeaturePayload,
  normalizeHeroSettingPayload,
} from "./heroVisual.validation.js";

const normalizeHeadingLine = (line) =>
  String(line || "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const getSafeHeadingLines = (lines) => {
  const sanitized = Array.isArray(lines)
    ? lines.map(normalizeHeadingLine).filter(Boolean)
    : [];

  return sanitized.length > 0
    ? sanitized.slice(0, 3)
    : DEFAULT_HERO_HEADING_LINES;
};

const mapFeature = (feature) => ({
  id: feature.id,
  settingId: feature.settingId,
  title: feature.title,
  iconKey: feature.iconKey,
  iconImageUrl:
    feature.iconImageUrl ||
    feature.iconImage ||
    null,
  iconPosition: feature.iconPosition,
  displayOrder: feature.displayOrder,
  transitionDuration: feature.transitionDuration,
  isActive: feature.isActive,
  createdAt: feature.createdAt,
  updatedAt: feature.updatedAt,
});

const mapSetting = (
  setting,
  { includeInactiveFeatures = false } = {}
) => ({
  id: setting.id,
  mainImageUrl:
    setting.mainImageUrl ||
    setting.mainImage ||
    null,
  mainImageAlt: setting.mainImageAlt,
  heroHeadingLines: getSafeHeadingLines(setting.heroHeadingLines),
  autoTransitionInterval:
    setting.autoTransitionInterval,
  isActive: setting.isActive,
  createdAt: setting.createdAt,
  updatedAt: setting.updatedAt,
  features: (setting.features || [])
    .filter((feature) =>
      includeInactiveFeatures ? true : feature.isActive
    )
    .map(mapFeature),
});

const getSingletonSetting = async () => {
  return prisma.heroVisualSetting.findFirst({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      features: {
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });
};

export const getPublicHeroVisual = async () => {
  const setting = await prisma.heroVisualSetting.findFirst({
    where: {
      isActive: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      features: {
        where: {
          isActive: true,
        },
        orderBy: [
          {
            displayOrder: "asc",
          },
          {
            createdAt: "asc",
          },
        ],
      },
    },
  });

  return setting ? mapSetting(setting) : null;
};

export const getAdminHeroVisual = async () => {
  const setting = await getSingletonSetting();
  return setting
    ? mapSetting(setting, {
        includeInactiveFeatures: true,
      })
    : null;
};

export const upsertHeroVisualSetting = async (
  data,
  file
) => {
  const existing = await getSingletonSetting();
  const uploadedImage = file
    ? await saveUploadedImage(file, "hero")
    : null;

  if (existing && uploadedImage) {
    await deleteStoredImage({
      assetId: existing.mainImageAssetId,
      storage: existing.mainImageStorage,
    });
  }

  const payload = normalizeHeroSettingPayload(
    data,
    existing || {}
  );

  if (!Number.isNaN(payload.autoTransitionInterval)) {
    payload.autoTransitionInterval = Math.max(
      1000,
      payload.autoTransitionInterval
    );
  }

  const setting = existing
    ? await prisma.heroVisualSetting.update({
        where: { id: existing.id },
        data: {
          mainImage:
            uploadedImage?.url ||
            existing.mainImage,
          mainImageUrl:
            uploadedImage?.url ||
            existing.mainImageUrl ||
            existing.mainImage,
          mainImageAssetId:
            uploadedImage?.assetId ||
            existing.mainImageAssetId,
          mainImageStorage:
            uploadedImage?.storage ||
            existing.mainImageStorage,
          mainImageAlt: payload.mainImageAlt,
          heroHeadingLines: payload.heroHeadingLines,
          autoTransitionInterval:
            payload.autoTransitionInterval ||
            existing.autoTransitionInterval,
          isActive: payload.isActive,
        },
        include: {
          features: true,
        },
      })
    : await prisma.heroVisualSetting.create({
        data: {
          mainImage: uploadedImage?.url || null,
          mainImageUrl: uploadedImage?.url || null,
          mainImageAssetId: uploadedImage?.assetId || null,
          mainImageStorage: uploadedImage?.storage || null,
          mainImageAlt: payload.mainImageAlt,
          heroHeadingLines: payload.heroHeadingLines,
          autoTransitionInterval:
            payload.autoTransitionInterval || 4000,
          isActive: payload.isActive,
        },
        include: {
          features: true,
        },
      });

  return mapSetting(setting);
};

export const listHeroFeatures = async () => {
  const features = await prisma.heroVisualFeature.findMany({
    orderBy: [
      {
        displayOrder: "asc",
      },
      {
        createdAt: "asc",
      },
    ],
  });

  return features.map(mapFeature);
};

export const createHeroFeature = async (
  data,
  file
) => {
  const setting = await getSingletonSetting();

  if (!setting) {
    const error = new Error(
      "Create the hero visual setting before adding features"
    );
    error.statusCode = 400;
    throw error;
  }

  const uploadedImage = file
    ? await saveUploadedImage(file, "hero-features")
    : null;

  const payload = normalizeHeroFeaturePayload(data);

  const feature = await prisma.heroVisualFeature.create({
    data: {
      settingId: setting.id,
      title: payload.title,
      iconKey: payload.iconKey,
      iconImage: uploadedImage?.url || null,
      iconImageUrl: uploadedImage?.url || null,
      iconImageAssetId: uploadedImage?.assetId || null,
      iconImageStorage: uploadedImage?.storage || null,
      iconPosition: payload.iconPosition,
      displayOrder: payload.displayOrder || 0,
      transitionDuration:
        Math.max(1000, payload.transitionDuration || 4000),
      isActive: payload.isActive,
    },
  });

  return mapFeature(feature);
};

export const updateHeroFeature = async (
  id,
  data,
  file
) => {
  const existing = await prisma.heroVisualFeature.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Feature not found");
    error.statusCode = 404;
    throw error;
  }

  const uploadedImage = file
    ? await saveUploadedImage(file, "hero-features")
    : null;

  if (uploadedImage) {
    await deleteStoredImage({
      assetId: existing.iconImageAssetId,
      storage: existing.iconImageStorage,
    });
  }

  const payload = normalizeHeroFeaturePayload(
    data,
    existing
  );

  const feature = await prisma.heroVisualFeature.update({
    where: {
      id,
    },
    data: {
      title: payload.title,
      iconKey: payload.iconKey,
      iconImage:
        uploadedImage?.url || existing.iconImage,
      iconImageUrl:
        uploadedImage?.url ||
        existing.iconImageUrl ||
        existing.iconImage,
      iconImageAssetId:
        uploadedImage?.assetId || existing.iconImageAssetId,
      iconImageStorage:
        uploadedImage?.storage || existing.iconImageStorage,
      iconPosition: payload.iconPosition,
      displayOrder: payload.displayOrder,
      transitionDuration: Math.max(
        1000,
        payload.transitionDuration
      ),
      isActive: payload.isActive,
    },
  });

  return mapFeature(feature);
};

export const updateHeroFeatureStatus = async (
  id,
  isActive
) => {
  const feature = await prisma.heroVisualFeature.update({
    where: {
      id,
    },
    data: {
      isActive:
        ["true", "1", true].includes(isActive) ||
        String(isActive).toLowerCase() === "true",
    },
  });

  return mapFeature(feature);
};

export const deleteHeroFeature = async (
  id
) => {
  const existing = await prisma.heroVisualFeature.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    const error = new Error("Feature not found");
    error.statusCode = 404;
    throw error;
  }

  await deleteStoredImage({
    assetId: existing.iconImageAssetId,
    storage: existing.iconImageStorage,
  });

  await prisma.heroVisualFeature.delete({
    where: {
      id,
    },
  });

  return { id };
};
