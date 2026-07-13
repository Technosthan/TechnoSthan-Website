import Settings from "../../features/admin/settings.model.js";

const CACHE_TTL_MS = Number(process.env.PUBLIC_SETTINGS_CACHE_TTL_MS || 30000);

const defaultPublicRoutes = [
  "/",
  "/landing",
  "/about",
  "/contact",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/verify-phone",
  "/login/telegram",
  "/login/whatsapp",
  "/AgriTech Wiki",
  "/chat",
  "/quiz/:contentId",
];

const languageCodeMap = {
  english: "en",
  hindi: "hi",
  rajasthani: "rj",
  en: "en",
  hi: "hi",
  rj: "rj",
};

const normalizeLanguageCode = (language) => {
  if (!language) return "en";
  return languageCodeMap[String(language).trim().toLowerCase()] || "en";
};

const cloneValue = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const buildDefaultPublicSettings = () => ({
  appName: "Technosthan AgriTech",
  language: "english",
  logoUrl: "",
  logoAsset: null,
  brandWebsiteUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
  youtubeUrl: "",
  whatsappUrl: "",
  footerText: "",
  featureFlags: {
    aiChat: true,
    quiz: true,
    contentVisibility: true,
  },
  dashboardSettings: {
    visibleCards: ["stats", "users", "content", "quiz", "activity"],
    cardOrder: ["stats", "users", "content", "quiz", "activity"],
  },
  publicAccessEnabled: true,
  publicWebsiteEnabled: true,
  hideLoginButton: true,
  publicRoutes: defaultPublicRoutes,
  websiteLanguage: "en",
});

const buildPublicSettingsSnapshot = (settings = {}) => {
  const defaults = buildDefaultPublicSettings();
  const publicAccessEnabledValue =
    settings.publicWebsiteEnabled != null
      ? settings.publicWebsiteEnabled
      : settings.publicAccessEnabled;

  return {
    ...defaults,
    ...settings,
    featureFlags: {
      ...defaults.featureFlags,
      ...(settings.featureFlags || {}),
    },
    dashboardSettings: {
      ...defaults.dashboardSettings,
      ...(settings.dashboardSettings || {}),
    },
    publicAccessEnabled:
      settings.publicAccessEnabled != null
        ? settings.publicAccessEnabled
        : defaults.publicAccessEnabled,
    publicWebsiteEnabled:
      settings.publicWebsiteEnabled != null
        ? settings.publicWebsiteEnabled
        : publicAccessEnabledValue != null
          ? publicAccessEnabledValue
          : defaults.publicWebsiteEnabled,
    hideLoginButton:
      settings.hideLoginButton != null
        ? settings.hideLoginButton
        : settings.publicWebsiteEnabled != null
          ? settings.publicWebsiteEnabled
          : settings.publicAccessEnabled != null
            ? settings.publicAccessEnabled
            : defaults.hideLoginButton,
    publicRoutes:
      settings.publicRoutes != null
        ? settings.publicRoutes
        : defaults.publicRoutes,
    websiteLanguage: normalizeLanguageCode(settings.language),
  };
};

const buildAccessControlSnapshot = (settings = {}) => {
  const publicSettings = buildPublicSettingsSnapshot(settings);
  return {
    publicAccessEnabled: publicSettings.publicAccessEnabled,
    publicWebsiteEnabled: publicSettings.publicWebsiteEnabled,
    hideLoginButton: publicSettings.hideLoginButton,
    publicRoutes: publicSettings.publicRoutes,
  };
};

let cachedPublicSettings = null;
let cachedAccessControl = null;
let cacheExpiresAt = 0;
let pendingLoadPromise = null;

export const invalidatePublicSettingsCache = () => {
  cachedPublicSettings = null;
  cachedAccessControl = null;
  cacheExpiresAt = 0;
  pendingLoadPromise = null;
};

const isFresh = () =>
  Boolean(cacheExpiresAt && Date.now() < cacheExpiresAt && cachedPublicSettings);

const storeSnapshot = (settings) => {
  cachedPublicSettings = cloneValue(buildPublicSettingsSnapshot(settings));
  cachedAccessControl = cloneValue(buildAccessControlSnapshot(settings));
  cacheExpiresAt = Date.now() + CACHE_TTL_MS;
  return cachedPublicSettings;
};

const loadSettingsDocument = async () => {
  let settings = await Settings.findOne().lean();

  if (!settings) {
    settings = await Settings.create({});
    settings = settings.toObject();
  }

  return settings;
};

export const loadPublicSettingsSnapshot = async () => {
  if (isFresh()) {
    return cloneValue(cachedPublicSettings);
  }

  if (!pendingLoadPromise) {
    pendingLoadPromise = loadSettingsDocument()
      .then((settings) => storeSnapshot(settings))
      .finally(() => {
        pendingLoadPromise = null;
      });
  }

  return cloneValue(await pendingLoadPromise);
};

export const loadPublicAccessControlSnapshot = async () => {
  if (isFresh() && cachedAccessControl) {
    return cloneValue(cachedAccessControl);
  }

  const settings = await loadPublicSettingsSnapshot();
  cachedAccessControl = cloneValue(buildAccessControlSnapshot(settings));
  return cloneValue(cachedAccessControl);
};

export const primePublicSettingsCache = (settings = {}) => {
  const snapshot = storeSnapshot(settings);
  return cloneValue(snapshot);
};

export const getDefaultPublicSettings = buildDefaultPublicSettings;
