import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18n from "../i18n/i18n.js";
import { getPublicSettings } from "../shared/lib/settingsApi";
import { resolveAssetUrl } from "../shared/lib/assetUrl";

const SETTINGS_CACHE_KEY = "agritech.publicSettingsCache.v1";
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000;

const LANGUAGE_CODE_MAP = {
  en: "en",
  hi: "hi",
  rj: "rj",
  english: "en",
  hindi: "hi",
  rajasthani: "rj",
};

const normalizeLanguageCode = (language) => {
  if (!language) return null;
  return LANGUAGE_CODE_MAP[String(language).trim().toLowerCase()] || null;
};

const normalizeSettings = (input = {}, fallback = {}) => {
  const merged = {
    ...fallback,
    ...input,
  };

  const websiteLanguage =
    normalizeLanguageCode(input.websiteLanguage) ||
    normalizeLanguageCode(input.language) ||
    normalizeLanguageCode(fallback.websiteLanguage) ||
    normalizeLanguageCode(fallback.language) ||
    "en";

  return {
    appName: merged.appName || "Technosthan AgriTech",
    logoUrl: resolveAssetUrl(merged.logoAsset || merged.logoUrl || ""),
    logoAsset: merged.logoAsset || null,
    language: input.language || fallback.language || "english",
    websiteLanguage,
    aiSettings: {
      ...(fallback.aiSettings || {}),
      ...(input.aiSettings || {}),
    },
    featureFlags: {
      ...(fallback.featureFlags || {}),
      ...(input.featureFlags || {}),
    },
    dashboardSettings: {
      ...(fallback.dashboardSettings || {}),
      ...(input.dashboardSettings || {}),
    },
    publicAccessEnabled:
      typeof input.publicAccessEnabled === "boolean"
        ? input.publicAccessEnabled
        : typeof fallback.publicAccessEnabled === "boolean"
          ? fallback.publicAccessEnabled
          : true,
    publicWebsiteEnabled:
      typeof input.publicWebsiteEnabled === "boolean"
        ? input.publicWebsiteEnabled
        : typeof fallback.publicWebsiteEnabled === "boolean"
          ? fallback.publicWebsiteEnabled
          : true,
    hideLoginButton:
      typeof input.hideLoginButton === "boolean"
        ? input.hideLoginButton
        : typeof fallback.hideLoginButton === "boolean"
          ? fallback.hideLoginButton
          : true,
    publicRoutes: Array.isArray(input.publicRoutes)
      ? input.publicRoutes
      : Array.isArray(fallback.publicRoutes)
        ? fallback.publicRoutes
        : [
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
          ],
  };
};

const defaultSettings = normalizeSettings({});

const isBrowser = typeof window !== "undefined";

const readCachedSettings = () => {
  if (!isBrowser) return null;

  try {
    const raw = window.localStorage.getItem(SETTINGS_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const cachedAt = Number(parsed?.cachedAt || 0);
    if (!cachedAt || Date.now() - cachedAt > SETTINGS_CACHE_TTL_MS) {
      return null;
    }

    return normalizeSettings(parsed?.settings || {}, defaultSettings);
  } catch {
    return null;
  }
};

const writeCachedSettings = (settings) => {
  if (!isBrowser) return;

  try {
    window.localStorage.setItem(
      SETTINGS_CACHE_KEY,
      JSON.stringify({
        cachedAt: Date.now(),
        settings,
      }),
    );
  } catch {
    // Ignore storage failures.
  }
};

const SettingsContext = createContext({
  settings: defaultSettings,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: () => {},
});

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
};

const applyLanguageFromSettings = (settings, source) => {
  const nextLanguage = settings?.websiteLanguage || "en";

  if (import.meta.env.DEV) {
    console.log("[Settings] language applied", {
      source,
      nextLanguage,
    });
  }

  return i18n.changeLanguage(nextLanguage);
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    return readCachedSettings() || defaultSettings;
  });
  const [loading] = useState(false);
  const hasHydratedRef = React.useRef(Boolean(readCachedSettings()));

  const commitSettings = useCallback((nextSettings, source) => {
    const normalized = normalizeSettings(nextSettings, defaultSettings);
    setSettings(normalized);
    writeCachedSettings(normalized);

    if (hasHydratedRef.current) {
      void applyLanguageFromSettings(normalized, source);
    }

    if (import.meta.env.DEV) {
      console.log("[Settings] settings loaded", {
        source,
        apiUrl:
          import.meta.env.VITE_API_URL ||
          import.meta.env.VITE_API_BASE_URL_PROD ||
          import.meta.env.VITE_API_BASE_URL ||
          window.location.origin,
        language: normalized.websiteLanguage,
        appName: normalized.appName,
      });
    }

    return normalized;
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        import.meta.env.VITE_API_BASE_URL_PROD ||
        import.meta.env.VITE_API_BASE_URL ||
        window.location.origin;

      if (import.meta.env.DEV) {
        console.log("[Settings] API URL", apiUrl);
      }

      const response = await getPublicSettings();
      const nextSettings = response.data?.data || {};

      hasHydratedRef.current = true;
      commitSettings(nextSettings, "refresh");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("[Settings] failed to refresh settings", error);
      }

      hasHydratedRef.current = true;
      commitSettings(defaultSettings, "fallback");
    }
  }, [commitSettings]);

  useEffect(() => {
    if (!hasHydratedRef.current) {
      const cachedSettings = readCachedSettings();
      if (cachedSettings) {
        hasHydratedRef.current = true;
        commitSettings(cachedSettings, "storage");
      }
    }

    void refreshSettings();
  }, [commitSettings, refreshSettings]);

  const updateSettings = useCallback(
    (nextSettings) => {
      const resolved =
        typeof nextSettings === "function"
          ? nextSettings(settings)
          : nextSettings;

      hasHydratedRef.current = true;
      commitSettings(resolved || settings, "optimistic-update");
    },
    [commitSettings, settings],
  );

  const value = useMemo(
    () => ({
      settings,
      loading,
      refreshSettings,
      updateSettings,
    }),
    [loading, refreshSettings, settings, updateSettings],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export { defaultSettings, normalizeLanguageCode, normalizeSettings };
