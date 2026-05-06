import React, { createContext, useContext, useEffect, useState } from "react";
import { getPublicSettings } from "../shared/lib/settingsApi";

/* =========================
   🎨 THEMES
========================= */
export const themes = {
  "green-yellow": {
    name: "Green & Yellow",
    primary: "bg-green-600 hover:bg-green-700",
    accent: "text-yellow-500",
    button: "bg-green-600 hover:bg-green-700 text-white",
    buttonSecondary:
      "bg-yellow-400 hover:bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-400",
    card: "bg-white dark:bg-gray-900",
    cardOpacity: "bg-white/90 dark:bg-gray-900/90",
    surface: "bg-gray-100 dark:bg-gray-800",
    navbar:
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700",
    link: "text-green-600 dark:text-green-400 hover:underline",
    navItem:
      "text-gray-700 dark:text-gray-300 hover:text-yellow-500 dark:hover:text-yellow-400",
    navItemHover: "bg-gray-100 dark:bg-gray-800",
    border: "border-green-500",
    logoutButton:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    error: "border-red-200 bg-red-50 text-red-700",
    gradient: "green-500-yellow-500",
  },

  "blue-dark": {
    name: "Blue Dark",
    primary: "bg-blue-600 hover:bg-blue-700",
    accent: "text-blue-500",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white",
    card: "bg-white dark:bg-gray-900",
    cardOpacity: "bg-white/90 dark:bg-gray-900/90",
    surface: "bg-gray-100 dark:bg-gray-800",
    navbar:
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700",
    link: "text-blue-600 dark:text-blue-400 hover:underline",
    navItem:
      "text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400",
    navItemHover: "bg-gray-100 dark:bg-gray-800",
    border: "border-blue-500",
    logoutButton:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    error: "border-red-200 bg-red-50 text-red-700",
    gradient: "blue-500-cyan-500",
  },

  "purple-light": {
    name: "Purple Light",
    primary: "bg-purple-600 hover:bg-purple-700",
    accent: "text-purple-500",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    buttonSecondary:
      "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-700 dark:text-white",
    card: "bg-white dark:bg-gray-900",
    cardOpacity: "bg-white/90 dark:bg-gray-900/90",
    surface: "bg-gray-100 dark:bg-gray-800",
    navbar:
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700",
    link: "text-purple-600 dark:text-purple-400 hover:underline",
    navItem:
      "text-gray-700 dark:text-gray-300 hover:text-purple-500 dark:hover:text-purple-400",
    navItemHover: "bg-gray-100 dark:bg-gray-800",
    border: "border-purple-500",
    logoutButton:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    error: "border-red-200 bg-red-50 text-red-700",
    gradient: "purple-500-pink-500",
  },

  "red-black": {
    name: "Red Black",
    primary: "bg-red-600 hover:bg-red-700",
    accent: "text-red-500",
    button: "bg-red-600 hover:bg-red-700 text-white",
    buttonSecondary:
      "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-700 dark:text-white",
    card: "bg-white dark:bg-gray-900",
    cardOpacity: "bg-white/90 dark:bg-gray-900/90",
    surface: "bg-gray-100 dark:bg-gray-800",
    navbar:
      "bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700",
    link: "text-red-500 dark:text-red-400 hover:underline",
    navItem:
      "text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400",
    navItemHover: "bg-gray-100 dark:bg-gray-800",
    border: "border-red-500",
    logoutButton:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white",
    error: "border-red-200 bg-red-50 text-red-700",
    gradient: "red-500-pink-500",
  },
};

/* =========================
   CONTEXT
========================= */
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

/* =========================
   PROVIDER
========================= */
export const ThemeProvider = ({ children }) => {
  // 🎨 Theme (color)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem("theme") || "green-yellow";
  });

  // 🌗 Mode (DEFAULT LIGHT)
  const [mode, setMode] = useState(() => {
    return localStorage.getItem("mode") || "light";
  });

  const [appSettings, setAppSettings] = useState({
    appName: "Technosthan AgriTech",
    logoUrl: "/hero.png",
    featureFlags: {
      aiChat: true,
      quiz: true,
      contentVisibility: true,
    },
    dashboardSettings: {
      visibleCards: ["stats", "users", "content", "quiz", "activity"],
      cardOrder: ["stats", "users", "content", "quiz", "activity"],
    },
  });

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const response = await getPublicSettings();
        const settings = response.data?.data || {};

        if (!mounted) return;

        setAppSettings({
          appName: settings.appName || "Technosthan AgriTech",
          logoUrl: settings.logoUrl || "/hero.png",
          featureFlags: {
            aiChat: true,
            quiz: true,
            contentVisibility: true,
            ...(settings.featureFlags || {}),
          },
          dashboardSettings: {
            visibleCards: ["stats", "users", "content", "quiz", "activity"],
            cardOrder: ["stats", "users", "content", "quiz", "activity"],
            ...(settings.dashboardSettings || {}),
          },
        });

        if (settings.theme === "dark") {
          setMode("dark");
        } else if (settings.theme === "default") {
          setMode("light");
        }

        document.title = settings.appName || "Technosthan AgriTech";
      } catch (error) {
        // keep local defaults if settings cannot be loaded
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  /* Save theme */
  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
  }, [currentTheme]);

  /* Apply mode (LIGHT by default) */
  useEffect(() => {
    localStorage.setItem("mode", mode);

    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [mode]);

  /* =========================
     GLOBAL STYLES
  ========================= */
  const globalStyles = {
    bg: "bg-white dark:bg-gray-950",
    bgGradient:
      "bg-gradient-to-br from-green-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800",
    text: "text-gray-900 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",
    border: "border border-gray-300 dark:border-gray-700",
    icon: "text-gray-400",
    iconSecondary: "text-gray-500",
    iconError: "text-red-500",
    iconHover: "hover:text-green-600",

    // ✅ FIXED INPUT (main issue solved)
    input: `
      w-full px-3 py-2 rounded-lg
      bg-white text-gray-900 placeholder-gray-500
      border border-gray-300
      focus:outline-none focus:ring-2 focus:ring-green-500

      dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
      dark:border-gray-600 dark:focus:ring-green-400

      transition-colors duration-300
    `,
  };

  const theme = {
    ...themes[currentTheme],
    ...globalStyles,
  };

  /* FUNCTIONS */
  const changeTheme = (themeKey) => {
    if (themes[themeKey]) setCurrentTheme(themeKey);
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        currentTheme,
        changeTheme,
        themes,
        mode,
        toggleMode,
        appSettings,
      }}
    >
      <div
        className={`min-h-screen transition-colors duration-300 ${theme.bg} ${theme.text}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
