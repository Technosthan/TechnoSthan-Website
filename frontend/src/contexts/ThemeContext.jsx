import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import i18n from "../i18n/i18n.js";
import { useSettings } from "./SettingsContext.jsx";

const LANGUAGE_CODE_MAP = {
  en: "en",
  hi: "hi",
  rj: "rj",
  english: "en",
  hindi: "hi",
  rajasthani: "rj",
};

const normalizeLanguageCode = (lang) => {
  if (!lang) return null;
  return LANGUAGE_CODE_MAP[String(lang).trim().toLowerCase()] || null;
};

const readStoredThemeKey = () => {
  try {
    if (typeof window === "undefined") {
      return FALLBACK_THEME_KEY;
    }

    const storedTheme = window.localStorage.getItem("theme");
    return themes[storedTheme] ? storedTheme : FALLBACK_THEME_KEY;
  } catch {
    return FALLBACK_THEME_KEY;
  }
};

const baseThemeShape = {
  layout: "",
  bg: "",
  bgGradient: "",
  darkBgGradient: "",
  primary: "",
  secondary: "",
  accent: "",
  text: "",
  textSecondary: "",
  card: "",
  cardOpacity: "",
  navbar: "",
  navItem: "",
  navItemHover: "",
  surface: "",
  button: "",
  buttonSecondary: "",
  logoutButton: "",
  input: "",
  border: "",
  link: "",
  sidebar: "",
  footer: "",
  heroGradient: "",
};

const defineTheme = (theme) => ({
  ...baseThemeShape,
  ...theme,
  bg: theme.bg || theme.layout,
  bgGradient: theme.bgGradient || theme.layout,
  darkBgGradient: theme.darkBgGradient || theme.layout,
  cardOpacity: theme.cardOpacity || theme.card,
  navItem: theme.navItem || theme.text,
  navItemHover: theme.navItemHover || theme.text,
  logoutButton: theme.logoutButton || theme.button,
  surface: theme.surface || theme.card,
});

const createThemePalette = ({
  name,
  layout,
  bg,
  bgGradient,
  darkBgGradient,
  primary,
  secondary,
  accent,
  text,
  textSecondary,
  card,
  cardOpacity,
  navbar,
  navItem,
  navItemHover,
  surface,
  button,
  buttonSecondary,
  logoutButton,
  input,
  border,
  link,
  sidebar,
  footer,
  heroGradient,
}) =>
  defineTheme({
    name,
    layout,
    bg,
    bgGradient,
    darkBgGradient,
    primary,
    secondary,
    accent,
    text,
    textSecondary,
    card,
    cardOpacity,
    navbar,
    navItem,
    navItemHover,
    surface,
    button,
    buttonSecondary,
    logoutButton,
    input,
    border,
    link,
    sidebar,
    footer,
    heroGradient,
  });

/* =====================================================
   ADVANCED THEMES
===================================================== */
export const themes = {
  "green-yellow": createThemePalette({
    name: "Green Nature",
    layout:
      "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.10),_transparent_28%),linear-gradient(180deg,_#f9faf5_0%,_#ffffff_58%,_#f3f7ef_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0b1220_55%,_#050814_100%)]",
    bg: "bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.10),_transparent_28%),linear-gradient(180deg,_#f9faf5_0%,_#ffffff_58%,_#f3f7ef_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0b1220_55%,_#050814_100%)]",
    bgGradient:
      "bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.10),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.10),_transparent_28%),linear-gradient(180deg,_#f9faf5_0%,_#ffffff_58%,_#f3f7ef_100%)]",
    darkBgGradient:
      "dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(250,204,21,0.10),_transparent_30%),linear-gradient(180deg,_#020617_0%,_#0b1220_55%,_#050814_100%)]",
    primary: "bg-emerald-600 hover:bg-emerald-700",
    secondary: "bg-amber-400 hover:bg-amber-500",
    accent: "text-amber-600 dark:text-amber-400",
    text: "text-slate-950 dark:text-white",
    textSecondary: "text-slate-600 dark:text-slate-300",
    card:
      "bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-white/10 shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.35)]",
    cardOpacity:
      "bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200/70 dark:border-white/10 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.30)]",
    navbar:
      "bg-white/78 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10",
    navItem: "text-slate-700 dark:text-slate-200",
    navItemHover: "hover:text-emerald-700 dark:hover:text-emerald-300",
    surface: "bg-white dark:bg-slate-950",
    button:
      "bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-300",
    buttonSecondary:
      "bg-amber-400 hover:bg-amber-500 text-slate-950 transition-all duration-300",
    logoutButton:
      "bg-rose-600 hover:bg-rose-700 text-white transition-all duration-300",
    input:
      "w-full min-h-12 px-4 py-3 rounded-2xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-950 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300",
    border: "border-emerald-500",
    link: "text-emerald-700 dark:text-emerald-300 hover:underline",
    sidebar:
      "bg-white/90 dark:bg-slate-950/90 border-r border-slate-200/80 dark:border-white/10",
    footer:
      "bg-slate-950 text-white border-t border-white/10",
    heroGradient:
      "bg-gradient-to-r from-emerald-600 via-lime-500 to-amber-400",
  }),

  "blue-dark": createThemePalette({
    name: "Blue Dark",
    layout:
      "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#061426_50%,_#020617_100%)]",
    bg: "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#061426_50%,_#020617_100%)]",
    bgGradient:
      "bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#061426_50%,_#020617_100%)]",
    darkBgGradient:
      "dark:bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.10),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#061426_50%,_#020617_100%)]",
    primary: "bg-sky-600 hover:bg-sky-700",
    secondary: "bg-cyan-500 hover:bg-cyan-600",
    accent: "text-cyan-400",
    text: "text-white",
    textSecondary: "text-slate-300",
    card:
      "bg-slate-950/78 backdrop-blur-xl border border-white/10 shadow-[0_24px_70px_rgba(2,6,23,0.55)]",
    cardOpacity:
      "bg-slate-950/72 backdrop-blur-xl border border-white/10 shadow-[0_24px_70px_rgba(2,6,23,0.45)]",
    navbar: "bg-slate-950/82 backdrop-blur-xl border-b border-white/10",
    navItem: "text-slate-200",
    navItemHover: "hover:text-cyan-300",
    surface: "bg-slate-950",
    button:
      "bg-sky-600 hover:bg-sky-700 text-white transition-all duration-300",
    buttonSecondary:
      "bg-cyan-500 hover:bg-cyan-600 text-slate-950 transition-all duration-300",
    logoutButton:
      "bg-rose-600 hover:bg-rose-700 text-white transition-all duration-300",
    input:
      "w-full min-h-12 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 transition-all duration-300",
    border: "border-cyan-400",
    link: "text-cyan-400 hover:underline",
    sidebar: "bg-slate-950/90 border-r border-white/10",
    footer: "bg-slate-950 text-white border-t border-white/10",
    heroGradient:
      "bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-700",
  }),

  "purple-neon": createThemePalette({
    name: "Purple Neon",
    layout:
      "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#130a2a_52%,_#050816_100%)]",
    bg: "bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#130a2a_52%,_#050816_100%)]",
    bgGradient:
      "bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#130a2a_52%,_#050816_100%)]",
    darkBgGradient:
      "dark:bg-[radial-gradient(circle_at_top_left,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#130a2a_52%,_#050816_100%)]",
    primary: "bg-violet-600 hover:bg-violet-700",
    secondary: "bg-fuchsia-500 hover:bg-fuchsia-600",
    accent: "text-fuchsia-400",
    text: "text-white",
    textSecondary: "text-violet-100/80",
    card:
      "bg-violet-950/45 backdrop-blur-xl border border-violet-500/20 shadow-[0_24px_70px_rgba(88,28,135,0.45)]",
    cardOpacity:
      "bg-violet-950/38 backdrop-blur-xl border border-violet-500/18 shadow-[0_24px_70px_rgba(88,28,135,0.35)]",
    navbar: "bg-black/72 backdrop-blur-xl border-b border-violet-500/20",
    navItem: "text-violet-100",
    navItemHover: "hover:text-fuchsia-300",
    surface: "bg-violet-950",
    button:
      "bg-violet-600 hover:bg-violet-700 text-white transition-all duration-300",
    buttonSecondary:
      "bg-fuchsia-500 hover:bg-fuchsia-600 text-white transition-all duration-300",
    logoutButton:
      "bg-rose-600 hover:bg-rose-700 text-white transition-all duration-300",
    input:
      "w-full min-h-12 px-4 py-3 rounded-2xl bg-violet-950 border border-violet-500/35 text-white placeholder:text-violet-100/50 focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-fuchsia-400 transition-all duration-300",
    border: "border-fuchsia-400",
    link: "text-fuchsia-300 hover:underline",
    sidebar: "bg-black/80 border-r border-violet-500/20",
    footer: "bg-black/78 text-white border-t border-violet-500/20",
    heroGradient:
      "bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-600",
  }),

  "red-black": createThemePalette({
    name: "Red Black",
    layout:
      "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.10),_transparent_26%),linear-gradient(180deg,_#050505_0%,_#140607_52%,_#050505_100%)]",
    bg: "bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.10),_transparent_26%),linear-gradient(180deg,_#050505_0%,_#140607_52%,_#050505_100%)]",
    bgGradient:
      "bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.10),_transparent_26%),linear-gradient(180deg,_#050505_0%,_#140607_52%,_#050505_100%)]",
    darkBgGradient:
      "dark:bg-[radial-gradient(circle_at_top_left,_rgba(248,113,113,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(239,68,68,0.10),_transparent_26%),linear-gradient(180deg,_#050505_0%,_#140607_52%,_#050505_100%)]",
    primary: "bg-red-600 hover:bg-red-700",
    secondary: "bg-slate-800 hover:bg-slate-700",
    accent: "text-red-400",
    text: "text-white",
    textSecondary: "text-slate-300",
    card:
      "bg-black/82 backdrop-blur-xl border border-red-900/40 shadow-[0_24px_70px_rgba(127,29,29,0.40)]",
    cardOpacity:
      "bg-black/72 backdrop-blur-xl border border-red-900/30 shadow-[0_24px_70px_rgba(127,29,29,0.32)]",
    navbar: "bg-black/90 backdrop-blur-xl border-b border-red-900/40",
    navItem: "text-slate-100",
    navItemHover: "hover:text-red-300",
    surface: "bg-black",
    button:
      "bg-red-600 hover:bg-red-700 text-white transition-all duration-300",
    buttonSecondary:
      "bg-slate-800 hover:bg-slate-700 text-white transition-all duration-300",
    logoutButton:
      "bg-rose-600 hover:bg-rose-700 text-white transition-all duration-300",
    input:
      "w-full min-h-12 px-4 py-3 rounded-2xl bg-slate-950 border border-red-900/60 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-300",
    border: "border-red-500",
    link: "text-red-300 hover:underline",
    sidebar: "bg-black/90 border-r border-red-900/40",
    footer: "bg-black/90 text-white border-t border-red-900/40",
    heroGradient:
      "bg-gradient-to-r from-red-700 via-red-500 to-black",
  }),
};

const FALLBACK_THEME_KEY = "green-yellow";
const FALLBACK_THEME = themes[FALLBACK_THEME_KEY];

/* =====================================================
   CONTEXT
===================================================== */
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};

export const getThemeByKey = (themeKey) => {
  if (themes[themeKey]) {
    return themes[themeKey];
  }

  return FALLBACK_THEME;
};

/* =====================================================
   PROVIDER
===================================================== */
export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();
  const [currentTheme, setCurrentTheme] = useState(() => readStoredThemeKey());
  const [language, setLanguage] = useState(() =>
    normalizeLanguageCode(i18n.language) || "en",
  );

  useEffect(() => {
    document.title = settings.appName || "Technosthan AgriTech";
  }, [settings.appName]);

  useEffect(() => {
    const handleLanguageChanged = (nextLanguage) => {
      const normalized = normalizeLanguageCode(nextLanguage) || "en";
      setLanguage(normalized);
    };

    i18n.on("languageChanged", handleLanguageChanged);
    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  /* =========================================
     SAVE THEME
  ========================================= */
  useEffect(() => {
    try {
      localStorage.setItem("theme", currentTheme);
    } catch {
      // Ignore storage failures and keep rendering.
    }
  }, [currentTheme]);

  /* =========================================
     CHANGE THEME
  ========================================= */
  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
      return;
    }

    setCurrentTheme(FALLBACK_THEME_KEY);
  };

  const changeLanguage = (langCode) => {
    const normalized = normalizeLanguageCode(langCode);
    if (!normalized) return;

    setLanguage(normalized);
    try {
      localStorage.setItem("language", normalized);
    } catch (e) {}

    i18n
      .changeLanguage(normalized)
      .then(() => {
        if (import.meta.env.DEV) {
          console.log("[i18n] user selected language", normalized);
        }
      })
      .catch((error) => {
        console.error("[i18n] failed to apply user selected language", error);
      });
  };

  /* =========================================
     ACTIVE THEME
  ========================================= */
  const theme = useMemo(() => getThemeByKey(currentTheme), [currentTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes,
        themeKey: themes[currentTheme] ? currentTheme : FALLBACK_THEME_KEY,
        currentTheme,
        changeTheme,
        language,
        changeLanguage,
        appSettings: settings,
      }}
    >
      <div
        className={`${theme.layout} ${theme.text} transition-all duration-500`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
