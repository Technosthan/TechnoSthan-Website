import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

const FloatingThemeSelector = () => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSelector = () => {
    setIsOpen(!isOpen);
  };

  // Listen for external open event (from navbar compact button)
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("openThemeSelector", handler);
    return () => window.removeEventListener("openThemeSelector", handler);
  }, []);

  const selectTheme = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  const themeOptions = Object.keys(themes);

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleSelector}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center transition-all duration-300 ${theme.button} ${theme.border}`}
      >
        <Palette size={24} className={theme.text} />
      </motion.button>

      {/* Theme Options Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />

            {/* Theme Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 100 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`fixed bottom-24 right-6 ${theme.card} ${theme.text} rounded-2xl shadow-2xl p-6 min-w-64 z-50 transition-colors duration-300`}
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Palette size={20} className={theme.accent} />
                <h3 className="font-semibold text-lg">Choose Theme</h3>
              </div>

              {/* Theme Options */}
              <div className="grid grid-cols-2 gap-4">
                {themeOptions.map((themeKey, index) => (
                  <motion.button
                    key={themeKey}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => selectTheme(themeKey)}
                    className={`relative p-4 rounded-xl font-medium text-sm transition-all duration-200 transform hover:scale-105 flex flex-col items-center gap-2 ${
                      themeKey === currentTheme
                        ? `${theme.primary} text-white shadow-lg ring-2 ring-offset-2 ring-current`
                        : `${theme.surface} ${theme.textSecondary} hover:opacity-80`
                    }`}
                  >
                    {/* Emoji Icon */}
                    <div className="text-2xl">
                      {themeKey === "green-yellow" && "🟢"}
                      {themeKey === "blue-dark" && "🔵"}
                      {themeKey === "purple-light" && "🟣"}
                      {themeKey === "red-black" && "🔴"}
                    </div>

                    {/* Theme Name */}
                    <span className="text-xs text-center">
                      {themes[themeKey].name}
                    </span>

                    {/* Active Indicator */}
                    {themeKey === currentTheme && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute -top-1 -right-1 w-4 h-4 ${theme.card} rounded-full flex items-center justify-center`}
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setIsOpen(false)}
                className={`w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-colors duration-300 ${theme.surface} ${theme.text} hover:opacity-80`}
              >
                Close
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingThemeSelector;
