import React, { createContext, useContext, useState, useEffect } from "react";

// Define theme configurations
export const themes = {
  "green-yellow": {
  name: "Green & Yellow",

  // 🌿 Background (soft + breathable)
  bg: "bg-gray-50",
  bgGradient: "bg-gradient-to-br from-green-50 via-white to-yellow-50",

  // 🌙 Dark mode (not too saturated)
  darkBgGradient: "dark:from-gray-900 dark:via-green-900/40 dark:to-yellow-900/30",

  text: "text-gray-800",
  textSecondary: "text-gray-500",
  textDark: "dark:text-gray-200",

  // 🎯 Primary & Buttons
  primary: "bg-green-600 hover:bg-green-700",
  button: "bg-green-600 hover:bg-green-700 text-white",
  buttonSecondary: "bg-yellow-400 hover:bg-yellow-500 text-gray-900",

  // ✨ Accent (use yellow only here)
  accent: "text-yellow-600",

  // 📦 Card (IMPORTANT FIX)
  card: "bg-white",
  cardOpacity: "bg-white/70 backdrop-blur-md border border-green-200/30 shadow-md",

  // 🔝 Navbar (softer, not too green)
  navbar: "bg-white/80 backdrop-blur-md border-b border-green-200/30 dark:bg-gray-900/80",

  // 🧾 Input (clean readability)
  input: "bg-white text-black border border-gray-300 focus:ring-green-500",

  error: "border-red-400 focus:ring-red-300",

  // 📌 Navigation
  navItem: "text-gray-600 hover:bg-green-100/50 hover:text-green-800",
  navItemHover: "bg-green-100/60 text-green-900",

  border: "border-gray-200",

  // 📊 Stats (use variation, not only green)
  statCard1: "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200",
  statCard1Icon: "text-green-600",
  statCard1Text: "text-green-700",

  statCard2: "bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-200",
  statCard2Icon: "text-yellow-600",
  statCard2Text: "text-yellow-700",

  // 📈 Activity indicators
  activityGood: "bg-green-100 text-green-700",
  activityMedium: "bg-yellow-100 text-yellow-700",
  activityPoor: "bg-red-100 text-red-700",

  // 🔗 Links
  link: "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300",
},
  "blue-dark": {
  name: "Blue Dark",

  // 🌑 Background (keep dark but not too saturated)
  bg: "bg-gray-900",
  bgGradient: "bg-gradient-to-br from-gray-900 via-blue-900/60 to-gray-800",

  text: "text-gray-100",
  textSecondary: "text-gray-400",

  // 🔵 Primary (use blue ONLY here)
  primary: "bg-blue-600 hover:bg-blue-700",
  button: "bg-blue-500 hover:bg-blue-600 text-white",

  // 🧊 Secondary button (lighter contrast)
  buttonSecondary: "bg-gray-200 hover:bg-gray-300 text-gray-900",

  accent: "text-blue-400",

  // 📦 Card (IMPORTANT CHANGE)
  card: "bg-gray-800",
  cardOpacity: "bg-gray-800/70 backdrop-blur-md border border-gray-700/40",

  // 🔝 Navbar
  navbar: "bg-gray-900/80 backdrop-blur-md border-b border-gray-700/40",

  // 🧾 Input (clean & readable)
  input: "bg-white text-black border border-gray-300 focus:ring-blue-400",

  error: "border-red-400 focus:ring-red-300",

  // 📌 Navigation items
  navItem: "text-gray-300 hover:bg-blue-600/20 hover:text-white",
  navItemHover: "bg-blue-600/30 text-white",

  border: "border-gray-700/50",

  // 📊 Stats (add variety, not only blue)
  statCard1: "bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-400/20",
  statCard1Icon: "text-blue-400",
  statCard1Text: "text-blue-300",

  statCard2: "bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border-purple-400/20",
  statCard2Icon: "text-purple-400",
  statCard2Text: "text-purple-300",

  // 📈 Activity
  activityGood: "bg-green-500/10 text-green-400",
  activityMedium: "bg-yellow-500/10 text-yellow-400",
  activityPoor: "bg-red-500/10 text-red-400",

  // 🔗 Links
  link: "text-blue-400 hover:text-blue-300",
},
  "purple-light": {
  name: "Purple Light",

  // 🌸 Background (soft, not overly purple)
  bg: "bg-gray-50",
  bgGradient: "bg-gradient-to-br from-purple-50 via-white to-pink-50",

  // 🌙 Dark mode (balanced, not saturated)
  darkBgGradient: "dark:from-gray-900 dark:via-purple-900/40 dark:to-pink-900/30",

  text: "text-gray-800",
  textSecondary: "text-gray-500",
  textDark: "dark:text-gray-200",

  // 🎯 Primary (purple used smartly)
  primary: "bg-purple-500 hover:bg-purple-600",
  button: "bg-purple-600 hover:bg-purple-700 text-white",
  buttonSecondary: "bg-purple-100 hover:bg-purple-200 text-purple-800",

  // ✨ Accent
  accent: "text-purple-500",

  // 📦 Card (IMPORTANT FIX)
  card: "bg-white",
  cardOpacity: "bg-white/70 backdrop-blur-md border border-purple-200/30 shadow-md",

  // 🔝 Navbar (soft glass effect)
  navbar: "bg-white/80 backdrop-blur-md border-b border-purple-200/30 dark:bg-gray-900/80",

  // 🧾 Input (clean readability)
  input: "bg-white text-black border border-gray-300 focus:ring-purple-400",

  error: "border-red-400 focus:ring-red-300",

  // 📌 Navigation
  navItem: "text-gray-600 hover:bg-purple-100/50 hover:text-purple-800",
  navItemHover: "bg-purple-100/60 text-purple-900",

  border: "border-gray-200",

  // 📊 Stats (variation, not only purple)
  statCard1: "bg-gradient-to-br from-purple-50 to-pink-100 border-purple-200",
  statCard1Icon: "text-purple-600",
  statCard1Text: "text-purple-700",

  statCard2: "bg-gradient-to-br from-indigo-50 to-blue-100 border-indigo-200",
  statCard2Icon: "text-indigo-600",
  statCard2Text: "text-indigo-700",

  // 📈 Activity
  activityGood: "bg-green-100 text-green-700",
  activityMedium: "bg-yellow-100 text-yellow-700",
  activityPoor: "bg-red-100 text-red-700",

  // 🔗 Links
  link: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
},
 "red-black": {
  name: "Red Black",

  // 🖤 Background (less harsh)
  bg: "bg-gray-950",
  bgGradient: "bg-gradient-to-br from-gray-950 via-red-900/40 to-gray-900",

  darkBgGradient: "dark:from-gray-950 dark:via-red-900/40 dark:to-gray-900",

  // 🧾 Text
  text: "text-gray-100",
  textSecondary: "text-gray-400",
  textDark: "dark:text-gray-200",

  // 🔴 Primary (use red smartly)
  primary: "bg-red-600 hover:bg-red-700",
  button: "bg-red-500 hover:bg-red-600 text-white",
  buttonSecondary: "bg-red-100 hover:bg-red-200 text-red-800",

  accent: "text-red-400",

  // 📦 Card (IMPORTANT FIX)
  card: "bg-gray-900",
  cardOpacity: "bg-gray-900/70 backdrop-blur-md border border-gray-700/40 shadow-lg",

  // 🔝 Navbar (glass effect)
  navbar: "bg-gray-900/80 backdrop-blur-md border-b border-red-900/30",

  // 🧾 Input (readability fix)
  input: "bg-white text-black border border-gray-300 focus:ring-red-400",

  error: "border-red-400 focus:ring-red-300",

  // 📌 Navigation
  navItem: "text-gray-300 hover:bg-red-600/20 hover:text-white",
  navItemHover: "bg-red-600/30 text-white",

  border: "border-gray-700/50",

  // 📊 Stats (variation)
  statCard1: "bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-400/20",
  statCard1Icon: "text-red-400",
  statCard1Text: "text-red-300",

  statCard2: "bg-gradient-to-br from-gray-700/20 to-red-500/10 border-gray-600/30",
  statCard2Icon: "text-gray-300",
  statCard2Text: "text-gray-200",

  // 📈 Activity
  activityGood: "bg-green-500/10 text-green-400",
  activityMedium: "bg-yellow-500/10 text-yellow-400",
  activityPoor: "bg-red-500/10 text-red-400",

  // 🔗 Links (FIXED: green → red)
  link: "text-red-400 hover:text-red-300",
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
