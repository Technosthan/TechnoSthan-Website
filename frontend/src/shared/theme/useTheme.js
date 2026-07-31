import { useContext, useEffect, useState } from "react";
import {
  ACCENT_THEMES,
  DEFAULT_ACCENT,
  DEFAULT_MODE,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  ThemeContext,
  applyTheme,
} from "./theme-context";

const normalizeAccent = (value) => {
  const next = String(value || "").toLowerCase();
  return ACCENT_THEMES.some((item) => item.key === next) ? next : DEFAULT_ACCENT;
};

const normalizeMode = (value) => {
  const next = String(value || "").toLowerCase();
  return next === "light" || next === "system" ? next : DEFAULT_MODE;
};

const readFallbackPreferences = () => {
  if (typeof window === "undefined") {
    return { mode: DEFAULT_MODE, accentTheme: DEFAULT_ACCENT };
  }

  const raw =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) {
    return { mode: DEFAULT_MODE, accentTheme: DEFAULT_ACCENT };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      mode: normalizeMode(parsed.mode ?? parsed.modeSetting),
      accentTheme: normalizeAccent(parsed.accentTheme ?? parsed.family),
    };
  } catch {
    return {
      mode: raw === "light" ? "light" : DEFAULT_MODE,
      accentTheme: DEFAULT_ACCENT,
    };
  }
};

const resolveFallbackMode = (mode) => {
  if (mode === "system") {
    if (typeof window === "undefined") {
      return DEFAULT_MODE;
    }

    return window.matchMedia?.("(prefers-color-scheme: light)")?.matches
      ? "light"
      : "dark";
  }

  return normalizeMode(mode);
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  const [fallbackPreferences, setFallbackPreferences] = useState(
    readFallbackPreferences
  );

  useEffect(() => {
    if (context) {
      return undefined;
    }

    applyTheme(fallbackPreferences);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackPreferences));
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
  }, [context, fallbackPreferences]);

  if (context) {
    return context;
  }

  const resolvedFallbackMode = resolveFallbackMode(fallbackPreferences.mode);

  const setMode = (nextMode) =>
    setFallbackPreferences((current) => ({
      ...current,
      mode: normalizeMode(nextMode),
    }));

  const setAccentTheme = (nextAccent) =>
    setFallbackPreferences((current) => ({
      ...current,
      accentTheme: normalizeAccent(nextAccent),
    }));

  return {
    mode: fallbackPreferences.mode,
    resolvedMode: resolvedFallbackMode,
    accentTheme: fallbackPreferences.accentTheme,
    setMode,
    setAccentTheme,
    setPreferences: ({ mode, accentTheme }) =>
      setFallbackPreferences((current) => ({
        mode: normalizeMode(mode ?? current.mode),
        accentTheme: normalizeAccent(accentTheme ?? current.accentTheme),
      })),
    // compatibility
    theme:
      resolvedFallbackMode,
    modeSetting: fallbackPreferences.mode,
    family: fallbackPreferences.accentTheme,
    isDark: resolvedFallbackMode === "dark",
    isLight: resolvedFallbackMode === "light",
    setTheme: setMode,
    toggleTheme: () =>
      setFallbackPreferences((current) => ({
        ...current,
        mode:
          current.mode === "dark" ||
          (current.mode === "system" &&
            !(window.matchMedia?.("(prefers-color-scheme: light)")?.matches))
            ? "light"
            : "dark",
      })),
    setThemeMode: setMode,
    setThemeFamily: setAccentTheme,
  };
};

export default useTheme;
