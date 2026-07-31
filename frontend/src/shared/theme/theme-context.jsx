/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "technosthan-theme-v3";
const LEGACY_STORAGE_KEY = "technosthan-theme-v2";
const DEFAULT_MODE = "dark";
const DEFAULT_ACCENT = "orange";
const DEFAULT_RESOLVED_MODE = "dark";

export const ACCENT_THEMES = [
  { key: "orange", label: "Orange" },
  { key: "blue", label: "Blue" },
  { key: "cyan", label: "Cyan" },
  { key: "purple", label: "Purple" },
  { key: "green", label: "Green" },
  { key: "red", label: "Red" },
  { key: "gold", label: "Gold" },
  { key: "mono", label: "Monochrome" },
];

export const ThemeContext = createContext(null);

const normalizeAccentTheme = (value) => {
  const next = String(value || "").toLowerCase();
  return ACCENT_THEMES.some((item) => item.key === next) ? next : DEFAULT_ACCENT;
};

const normalizeMode = (value) => {
  const next = String(value || "").toLowerCase();
  return next === "light" || next === "system" ? next : DEFAULT_MODE;
};

const getSystemMode = () => {
  if (typeof window === "undefined") {
    return DEFAULT_RESOLVED_MODE;
  }

  return window.matchMedia?.("(prefers-color-scheme: light)")?.matches
    ? "light"
    : "dark";
};

const resolveMode = (mode) =>
  normalizeMode(mode) === "system" ? getSystemMode() : normalizeMode(mode);

const safeParse = (raw) => {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getInitialPreferences = () => {
  if (typeof window === "undefined") {
    return {
      mode: DEFAULT_MODE,
      accentTheme: DEFAULT_ACCENT,
    };
  }

  const raw =
    window.localStorage.getItem(STORAGE_KEY) ||
    window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const parsed = safeParse(raw);

  if (parsed && typeof parsed === "object") {
    return {
      mode: normalizeMode(parsed.mode ?? parsed.modeSetting),
      accentTheme: normalizeAccentTheme(parsed.accentTheme ?? parsed.family),
    };
  }

  if (raw === "light" || raw === "dark") {
    return {
      mode: normalizeMode(raw),
      accentTheme: DEFAULT_ACCENT,
    };
  }

  return {
    mode: DEFAULT_MODE,
    accentTheme: DEFAULT_ACCENT,
  };
};

export const applyTheme = ({ mode, accentTheme }) => {
  if (typeof document === "undefined") {
    return;
  }

  const resolvedMode = resolveMode(mode);
  const normalizedAccent = normalizeAccentTheme(accentTheme);
  const root = document.documentElement;

  root.dataset.mode = resolvedMode;
  root.dataset.theme = resolvedMode;
  root.dataset.accent = normalizedAccent;
  root.dataset.themeFamily = normalizedAccent;
  root.style.colorScheme = resolvedMode;

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { mode: resolvedMode, accentTheme: normalizedAccent },
      })
    );
  }
};

export const ThemeProvider = ({ children }) => {
  const initial = getInitialPreferences();
  const [mode, setModeState] = useState(initial.mode);
  const [accentTheme, setAccentThemeState] = useState(initial.accentTheme);

  useEffect(() => {
    const preferences = { mode, accentTheme };
    applyTheme(preferences);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, [mode, accentTheme]);

  const resolvedMode = resolveMode(mode);

  const value = useMemo(
    () => ({
      mode,
      resolvedMode,
      accentTheme,
      setMode: (nextMode) => setModeState(normalizeMode(nextMode)),
      setAccentTheme: (nextAccent) =>
        setAccentThemeState(normalizeAccentTheme(nextAccent)),
      setPreferences: ({ mode: nextMode, accentTheme: nextAccent, family }) => {
        if (typeof nextMode !== "undefined") {
          setModeState(normalizeMode(nextMode));
        }

        if (typeof nextAccent !== "undefined" || family) {
          setAccentThemeState(normalizeAccentTheme(nextAccent ?? family));
        }
      },
      // Compatibility for existing components while the system is being migrated.
      theme: resolvedMode,
      isDark: resolvedMode === "dark",
      isLight: resolvedMode === "light",
      family: accentTheme,
      modeSetting: mode,
      setTheme: (nextMode) => setModeState(normalizeMode(nextMode)),
      toggleTheme: () =>
        setModeState((current) =>
          resolveMode(current) === "dark" ? "light" : "dark"
        ),
      setThemeMode: (nextMode) => setModeState(normalizeMode(nextMode)),
      setThemeFamily: (nextAccent) =>
        setAccentThemeState(normalizeAccentTheme(nextAccent)),
    }),
    [accentTheme, mode, resolvedMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export {
  DEFAULT_MODE,
  DEFAULT_ACCENT,
  LEGACY_STORAGE_KEY,
  STORAGE_KEY,
  getInitialPreferences,
  getInitialPreferences as getInitialTheme,
};
