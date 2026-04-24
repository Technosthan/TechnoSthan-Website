import React, { createContext, useContext, useState, useEffect } from "react";

// Define theme configurations
export const themes = {
  "green-yellow": {
    name: "Green & Yellow",

    // 🌿 Background (natural + breathable)
    bg: "bg-white dark:bg-gray-950",
    bgGradient:
      "bg-gradient-to-br from-green-50 via-white to-yellow-50 dark:from-gray-950 dark:via-green-900/30 dark:to-yellow-900/20",

    // 🧾 Text (balanced for both modes)
    text: "text-gray-800 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",

    // 🎯 Primary (deep natural green)
    primary: "bg-green-600 hover:bg-green-700",
    button: "bg-green-600 hover:bg-green-700 text-white",
    buttonSecondary:
      "bg-yellow-400 hover:bg-yellow-500 text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-400",

    // 🌾 Accent (sunlight yellow)
    accent: "text-yellow-600 dark:text-yellow-400",

    // 📦 Card (soft + glass feel)
    card: "bg-white dark:bg-gray-900",
    cardOpacity:
      "bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-green-200/30 dark:border-green-800/30 shadow-md",

    // 🔝 Navbar (natural glass feel)
    navbar:
      "bg-white/80 text-gray-800 dark:bg-gray-900/80 dark:text-gray-100 backdrop-blur-md border-b border-green-200/40 dark:border-green-900/40",

    // 🧾 Input (clean readable)
    input:
      "bg-white text-black border border-gray-300 focus:ring-green-500 dark:bg-gray-800 dark:text-white dark:border-gray-600",

    error: "border-red-400 focus:ring-red-300",

    // 📌 Navigation (natural hover)
    navItem:
      "text-gray-700 dark:text-gray-300 hover:bg-green-100/60 dark:hover:bg-green-600/20 hover:text-green-800 dark:hover:text-white",

    navItemHover:
      "bg-green-100 dark:bg-green-600/30 text-green-900 dark:text-white",

    border: "border-gray-200 dark:border-gray-700",

    // 📊 Stats (natural gradients)
    statCard1:
      "bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-800/30 dark:to-emerald-700/30 border-green-300/30",
    statCard1Icon: "text-green-600 dark:text-green-400",
    statCard1Text: "text-green-700 dark:text-green-300",

    statCard2:
      "bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-yellow-700/30 dark:to-orange-600/30 border-yellow-300/30",
    statCard2Icon: "text-yellow-600 dark:text-yellow-400",
    statCard2Text: "text-yellow-700 dark:text-yellow-300",

    // 📈 Activity (natural tones)
    activityGood:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    activityMedium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    activityPoor:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

    // 🔗 Links (consistent green)
    link: "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
  },
  "blue-dark": {
    name: "Blue Dark",

    // 🌑 Background (balanced for both modes)
    bg: "bg-white dark:bg-gray-900",
    bgGradient:
      "bg-gradient-to-br from-white via-blue-50 to-white dark:from-gray-900 dark:via-blue-900/50 dark:to-gray-800",

    // 🧾 Text
    text: "text-gray-900 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",

    // 🔵 Primary
    primary: "bg-blue-600 hover:bg-blue-700",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
    buttonSecondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100",

    accent: "text-blue-600 dark:text-blue-400",

    // 📦 Card
    card: "bg-white dark:bg-gray-800",
    cardOpacity:
      "bg-white/80 dark:bg-gray-800/70 backdrop-blur-md border border-gray-200 dark:border-gray-700/40 shadow-md",

    // 🔝 Navbar (FIXED)
    navbar:
      "bg-white/80 text-gray-900 dark:bg-gray-900/80 dark:text-gray-100 backdrop-blur-md border-b border-gray-200 dark:border-gray-700/40",

    // 🧾 Input
    input:
      "bg-white text-black border border-gray-300 focus:ring-blue-400 dark:bg-gray-800 dark:text-white dark:border-gray-600",

    error: "border-red-400 focus:ring-red-300",

    // 📌 Navigation
    navItem:
      "text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-600/20 hover:text-blue-700 dark:hover:text-white",

    navItemHover:
      "bg-blue-100 dark:bg-blue-600/30 text-blue-800 dark:text-white",

    border: "border-gray-200 dark:border-gray-700/50",

    // 📊 Stats
    statCard1:
      "bg-gradient-to-br from-blue-100 to-cyan-200 dark:from-blue-800/30 dark:to-cyan-700/30 border-blue-300/30",
    statCard1Icon: "text-blue-600 dark:text-blue-400",
    statCard1Text: "text-blue-700 dark:text-blue-300",

    statCard2:
      "bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-purple-800/30 dark:to-indigo-700/30 border-purple-300/30",
    statCard2Icon: "text-purple-600 dark:text-purple-400",
    statCard2Text: "text-purple-700 dark:text-purple-300",

    // 📈 Activity
    activityGood:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    activityMedium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    activityPoor:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

    // 🔗 Links
    link: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
  },
  "purple-light": {
    name: "Purple Light",

    // 🌸 Background (balanced both modes)
    bg: "bg-white dark:bg-gray-950",
    bgGradient:
      "bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-950 dark:via-purple-900/30 dark:to-pink-900/20",

    // 🧾 Text
    text: "text-gray-900 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",

    // 🎯 Primary
    primary: "bg-purple-600 hover:bg-purple-700",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    buttonSecondary:
      "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-700 dark:hover:bg-purple-600 dark:text-white",

    // ✨ Accent
    accent: "text-purple-600 dark:text-purple-400",

    // 📦 Card
    card: "bg-white dark:bg-gray-900",
    cardOpacity:
      "bg-white/80 dark:bg-gray-900/70 backdrop-blur-md border border-purple-200/30 dark:border-purple-800/30 shadow-md",

    // 🔝 Navbar (FIXED)
    navbar:
      "bg-white/80 text-gray-900 dark:bg-gray-900/80 dark:text-gray-100 backdrop-blur-md border-b border-purple-200/40 dark:border-purple-900/40",

    // 🧾 Input
    input:
      "bg-white text-black border border-gray-300 focus:ring-purple-400 dark:bg-gray-800 dark:text-white dark:border-gray-600",

    error: "border-red-400 focus:ring-red-300",

    // 📌 Navigation
    navItem:
      "text-gray-700 dark:text-gray-300 hover:bg-purple-100/60 dark:hover:bg-purple-600/20 hover:text-purple-700 dark:hover:text-white",

    navItemHover:
      "bg-purple-100 dark:bg-purple-600/30 text-purple-800 dark:text-white",

    border: "border-gray-200 dark:border-gray-700",

    // 📊 Stats
    statCard1:
      "bg-gradient-to-br from-purple-100 to-pink-200 dark:from-purple-800/30 dark:to-pink-700/30 border-purple-300/30",
    statCard1Icon: "text-purple-600 dark:text-purple-400",
    statCard1Text: "text-purple-700 dark:text-purple-300",

    statCard2:
      "bg-gradient-to-br from-indigo-100 to-blue-200 dark:from-indigo-800/30 dark:to-blue-700/30 border-indigo-300/30",
    statCard2Icon: "text-indigo-600 dark:text-indigo-400",
    statCard2Text: "text-indigo-700 dark:text-indigo-300",

    // 📈 Activity
    activityGood:
      "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
    activityMedium:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400",
    activityPoor:
      "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",

    // 🔗 Links
    link: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
  },
  "red-black": {
    name: "Red Black",

    // 🖤 Background
    bg: "bg-white dark:bg-gray-950",
    bgGradient:
      "bg-gradient-to-br from-white via-red-100 to-white dark:from-gray-950 dark:via-red-900/40 dark:to-gray-900",

    // 🧾 Text
    text: "text-gray-900 dark:text-gray-100",
    textSecondary: "text-gray-600 dark:text-gray-400",

    // 🔴 Primary
    primary: "bg-red-600 hover:bg-red-700",
    button: "bg-red-500 hover:bg-red-600 text-white",
    buttonSecondary: "bg-red-100 hover:bg-red-200 text-red-800",

    accent: "text-red-500 dark:text-red-400",

    // 📦 Card
    card: "bg-white dark:bg-gray-900",
    cardOpacity:
      "bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border border-gray-200 dark:border-gray-700/40 shadow-lg",

    // 🔝 Navbar (FIXED)
    navbar:
      "bg-white/80 text-gray-900 dark:bg-gray-900/80 dark:text-gray-100 backdrop-blur-md border-b border-gray-200 dark:border-red-900/30",

    // 🧾 Input
    input: "bg-white text-black border border-gray-300 focus:ring-red-400",

    error: "border-red-400 focus:ring-red-300",

    // 📌 Navigation (FIXED)
    navItem:
      "text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-600/20 hover:text-red-600 dark:hover:text-white",

    navItemHover: "bg-red-100 dark:bg-red-600/30 text-red-600 dark:text-white",

    border: "border-gray-200 dark:border-gray-700/50",

    // 📊 Stats
    statCard1:
      "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-400/20",
    statCard1Icon: "text-red-400",
    statCard1Text: "text-red-500 dark:text-red-300",

    statCard2:
      "bg-gradient-to-br from-gray-100 to-red-100 border-gray-200 dark:from-gray-700/20 dark:to-red-500/10 dark:border-gray-600/30",
    statCard2Icon: "text-gray-600 dark:text-gray-300",
    statCard2Text: "text-gray-800 dark:text-gray-200",

    // 📈 Activity
    activityGood:
      "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    activityMedium:
      "bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
    activityPoor:
      "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400",

    // 🔗 Links
    link: "text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300",
  },
};

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  // Provide fallback theme if theme is not yet loaded
  const fallbackTheme = themes["green-yellow"];
  return {
    ...context,
    theme: context.theme || fallbackTheme,
  };
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
