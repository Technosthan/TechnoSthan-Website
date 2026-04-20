import React, { createContext, useContext, useState, useEffect } from "react";

// Define theme configurations
export const themes = {
  "green-yellow": {
    name: "Green & Yellow",
    bg: "bg-green-50",
    bgGradient: "bg-gradient-to-br from-green-100 via-white to-yellow-100",
    darkBgGradient: "dark:from-green-900 dark:via-gray-900 dark:to-yellow-900",
    text: "text-green-900",
    textDark: "dark:text-yellow-300",
    primary: "bg-yellow-400 hover:bg-yellow-500",
    button: "bg-green-600 hover:bg-green-700 text-white",
    buttonSecondary: "bg-yellow-400 hover:bg-yellow-500 text-green-900",
    accent: "text-yellow-600",
    card: "bg-white",
    cardDark: "dark:bg-gray-800",
    cardOpacity: "bg-white/70 dark:bg-gray-800/70",
    navbar: "bg-green-300 dark:bg-gray-900/70",
    input: "border-gray-200 focus:ring-green-500",
    error: "border-red-400 focus:ring-red-300",
    navItem: "text-gray-600 hover:bg-white/60 hover:text-gray-900",
    navItemHover: "bg-white/60 text-gray-900",
    textSecondary: "text-black",
    border: "border-white/30",
    trendUp: "bg-green-100 text-green-700",
    trendDown: "bg-red-100 text-red-700",
    statCard1:
      "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
    statCard1Icon: "text-green-600",
    statCard1Text: "text-green-700",
    statCard2: "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200",
    statCard2Icon: "text-blue-600",
    statCard2Text: "text-blue-700",
    activityGood: "bg-green-100 text-green-700",
    activityMedium: "bg-yellow-100 text-yellow-700",
    activityPoor: "bg-red-100 text-red-700",
    link: "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
  },
  "blue-dark": {
    name: "Blue Dark",
    bg: "bg-blue-900",
    bgGradient: "bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700",
    darkBgGradient: "dark:from-blue-900 dark:via-blue-800 dark:to-blue-700",
    text: "text-blue-100",
    textDark: "dark:text-blue-100",
    primary: "bg-blue-600 hover:bg-blue-700",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
    buttonSecondary: "bg-blue-400 hover:bg-blue-500 text-blue-900",
    accent: "text-blue-300",
    card: "bg-blue-800",
    cardDark: "dark:bg-blue-800",
    cardOpacity: "bg-blue-800/70 dark:bg-blue-800/70",
    navbar: "bg-blue-800 dark:bg-blue-900/70",
    input: "border-blue-600 focus:ring-blue-400",
    error: "border-red-400 focus:ring-red-300",
    navItem: "text-blue-200 hover:bg-blue-700/50 hover:text-white",
    navItemHover: "bg-blue-700/50 text-white",
    textSecondary: "text-black",
    border: "border-blue-600/50",
    trendUp: "bg-blue-100 text-blue-700",
    trendDown: "bg-red-100 text-red-700",
    statCard1: "bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-200",
    statCard1Icon: "text-blue-600",
    statCard1Text: "text-blue-700",
    statCard2:
      "bg-gradient-to-br from-indigo-50 to-purple-100 border-indigo-200",
    statCard2Icon: "text-indigo-600",
    statCard2Text: "text-indigo-700",
    activityGood: "bg-blue-100 text-blue-700",
    activityMedium: "bg-cyan-100 text-cyan-700",
    activityPoor: "bg-red-100 text-red-700",
    link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
  },
  "purple-light": {
    name: "Purple Light",
    bg: "bg-purple-50",
    bgGradient: "bg-gradient-to-br from-purple-100 via-white to-purple-100",
    darkBgGradient: "dark:from-purple-900 dark:via-gray-900 dark:to-purple-900",
    text: "text-purple-900",
    textDark: "dark:text-purple-300",
    primary: "bg-purple-400 hover:bg-purple-500",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    buttonSecondary: "bg-purple-400 hover:bg-purple-500 text-purple-900",
    accent: "text-purple-600",
    card: "bg-white",
    cardDark: "dark:bg-gray-800",
    cardOpacity: "bg-white/70 dark:bg-gray-800/70",
    navbar: "bg-purple-300 dark:bg-gray-900/70",
    input: "border-gray-200 focus:ring-purple-500",
    error: "border-red-400 focus:ring-red-300",
    navItem: "text-gray-600 hover:bg-white/60 hover:text-gray-900",
    navItemHover: "bg-white/60 text-gray-900",
    textSecondary: "text-black",
    border: "border-white/30",
    trendUp: "bg-green-100 text-green-700",
    trendDown: "bg-red-100 text-red-700",
    statCard1: "bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200",
    statCard1Icon: "text-purple-600",
    statCard1Text: "text-purple-700",
    statCard2: "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200",
    statCard2Icon: "text-indigo-600",
    statCard2Text: "text-indigo-700",
    activityGood: "bg-green-100 text-green-700",
    activityMedium: "bg-yellow-100 text-yellow-700",
    activityPoor: "bg-red-100 text-red-700",
    link: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
  },
  "red-black": {
    name: "Red Black",
    bg: "bg-black",
    bgGradient: "bg-gradient-to-br from-red-900 via-black to-red-900",
    darkBgGradient: "dark:from-red-900 dark:via-black dark:to-red-900",
    text: "text-red-100",
    textDark: "dark:text-red-100",
    primary: "bg-red-600 hover:bg-red-700",
    button: "bg-red-500 hover:bg-red-600 text-white",
    buttonSecondary: "bg-red-400 hover:bg-red-500 text-red-900",
    accent: "text-red-300",
    card: "bg-gray-900",
    cardDark: "dark:bg-gray-900",
    cardOpacity: "bg-gray-900/70 dark:bg-gray-900/70",
    navbar: "bg-red-900 dark:bg-red-900/70",
    input: "border-red-600 focus:ring-red-400",
    error: "border-red-400 focus:ring-red-300",
    navItem: "text-red-200 hover:bg-red-800/50 hover:text-white",
    navItemHover: "bg-red-800/50 text-white",
    textSecondary: "text-black",
    border: "border-red-600/50",
    trendUp: "bg-red-100 text-red-700",
    trendDown: "bg-gray-100 text-gray-700",
    statCard1: "bg-gradient-to-br from-red-50 to-pink-100 border-red-200",
    statCard1Icon: "text-red-600",
    statCard1Text: "text-red-700",
    statCard2: "bg-gradient-to-br from-gray-50 to-red-100 border-gray-200",
    statCard2Icon: "text-gray-600",
    statCard2Text: "text-gray-700",
    activityGood: "bg-red-100 text-red-700",
    activityMedium: "bg-orange-100 text-orange-700",
    activityPoor: "bg-gray-100 text-gray-700",
    link: "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to "green-yellow"
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("selectedTheme");
    return savedTheme && themes[savedTheme] ? savedTheme : "green-yellow";
  });

  // Save theme to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("selectedTheme", currentTheme);
    // Apply theme to document root for global theme changes
    document.documentElement.className =
      currentTheme === "red-black" ? "dark" : "";
  }, [currentTheme]);

  const changeTheme = (themeKey) => {
    if (themes[themeKey]) {
      setCurrentTheme(themeKey);
    }
  };

  const theme = themes[currentTheme];

  return (
    <ThemeContext.Provider value={{ theme, currentTheme, changeTheme, themes }}>
      <div
        className={`min-h-screen transition-all duration-500 ${theme.bgGradient} ${theme.text}`}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};
