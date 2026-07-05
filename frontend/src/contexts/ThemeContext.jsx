import React, { createContext, useContext, useEffect, useState } from "react";
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

/* =====================================================
   🎨 ADVANCED THEMES
===================================================== */
export const themes = {
  "green-yellow": {
    name: "Green Nature",

    /* Layout */
    layout:
      "min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-black",

    /* Main Colors */
    primary: "bg-green-600 hover:bg-green-700",
    secondary: "bg-yellow-400 hover:bg-yellow-500",
    accent: "text-yellow-500",

    /* Text */
    text: "text-gray-900 dark:text-white",
    textSecondary: "text-gray-600 dark:text-gray-400",

    /* Cards */
    card: "bg-white/90 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg",

    /* Navbar */
    navbar:
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700",

    /* Surface */
    surface: "bg-white dark:bg-gray-900",

    /* Buttons */
    button:
      "bg-green-600 hover:bg-green-700 text-white transition-all duration-300",

    buttonSecondary:
      "bg-yellow-400 hover:bg-yellow-500 text-black transition-all duration-300",

    /* Inputs */
    input:
      "w-full px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-all duration-300",

    /* Borders */
    border: "border-green-500",

    /* Links */
    link: "text-green-600 dark:text-green-400 hover:underline",

    /* Sidebar */
    sidebar:
      "bg-white/90 dark:bg-gray-900/90 border-r border-gray-200 dark:border-gray-700",

    /* Footer */
    footer:
      "bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700",

    /* Hero */
    heroGradient: "bg-gradient-to-r from-green-600 via-yellow-500 to-green-700",
  },

  "blue-dark": {
    name: "Blue Dark",

    layout:
      "min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-black",

    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-cyan-500 hover:bg-cyan-600",
    accent: "text-cyan-400",

    text: "text-white",
    textSecondary: "text-slate-300",

    card: "bg-slate-900/80 backdrop-blur border border-slate-700 shadow-xl",

    navbar: "bg-slate-950/80 backdrop-blur border-b border-slate-700",

    surface: "bg-slate-900",

    button:
      "bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300",

    buttonSecondary:
      "bg-cyan-500 hover:bg-cyan-600 text-black transition-all duration-300",

    input:
      "w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all duration-300",

    border: "border-blue-500",

    link: "text-blue-400 hover:underline",

    sidebar: "bg-slate-950/90 border-r border-slate-700",

    footer: "bg-slate-950/80 border-t border-slate-700",

    heroGradient: "bg-gradient-to-r from-blue-700 via-cyan-500 to-blue-800",
  },

  "purple-neon": {
    name: "Purple Neon",

    layout:
      "min-h-screen bg-gradient-to-br from-black via-purple-950 to-pink-950",

    primary: "bg-purple-600 hover:bg-purple-700",
    secondary: "bg-pink-500 hover:bg-pink-600",
    accent: "text-pink-400",

    text: "text-white",
    textSecondary: "text-purple-200",

    card: "bg-purple-950/40 backdrop-blur border border-purple-700 shadow-2xl",

    navbar: "bg-black/60 backdrop-blur border-b border-purple-700",

    surface: "bg-purple-950",

    button:
      "bg-purple-600 hover:bg-purple-700 text-white transition-all duration-300",

    buttonSecondary:
      "bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300",

    input:
      "w-full px-3 py-2 rounded-xl bg-purple-950 border border-purple-700 text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all duration-300",

    border: "border-pink-500",

    link: "text-pink-400 hover:underline",

    sidebar: "bg-black/70 border-r border-purple-700",

    footer: "bg-black/60 border-t border-purple-700",

    heroGradient: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700",
  },

  "red-black": {
    name: "Red Black",

    layout: "min-h-screen bg-gradient-to-br from-black via-red-950 to-gray-950",

    primary: "bg-red-600 hover:bg-red-700",
    secondary: "bg-gray-800 hover:bg-gray-700",
    accent: "text-red-400",

    text: "text-white",
    textSecondary: "text-gray-300",

    card: "bg-black/80 backdrop-blur border border-red-900 shadow-2xl",

    navbar: "bg-black/90 backdrop-blur border-b border-red-900",

    surface: "bg-black",

    button:
      "bg-red-600 hover:bg-red-700 text-white transition-all duration-300",

    buttonSecondary:
      "bg-gray-800 hover:bg-gray-700 text-white transition-all duration-300",

    input:
      "w-full px-3 py-2 rounded-xl bg-gray-900 border border-red-900 text-white focus:ring-2 focus:ring-red-500 outline-none transition-all duration-300",

    border: "border-red-700",

    link: "text-red-400 hover:underline",

    sidebar: "bg-black/90 border-r border-red-900",

    footer: "bg-black/90 border-t border-red-900",

    heroGradient: "bg-gradient-to-r from-red-700 via-red-500 to-black",
  },
};

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

/* =====================================================
   PROVIDER
===================================================== */
export const ThemeProvider = ({ children }) => {
  const { settings } = useSettings();
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || "green-yellow";
  });
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
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  /* =========================================
     CHANGE THEME
  ========================================= */
  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
    }
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
  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themes,
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
