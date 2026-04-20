import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const LandingPage = () => {
  const { theme, currentTheme, changeTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const selectTheme = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };

  const themeOptions = Object.keys(themes);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-6">
            Welcome to <span className={theme.accent}>AgriTech</span>
          </h1>
          <p className="text-xl mb-8 opacity-80">
            Revolutionizing agriculture with cutting-edge technology and
            innovative solutions.
          </p>
        </motion.div>

        {/* Theme Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mb-12"
        >
          <button
            onClick={toggleDropdown}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 ${theme.button} shadow-lg`}
          >
            Customize Theme
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 bg-white rounded-xl shadow-2xl p-4 min-w-64 z-10 theme-dropdown"
              >
                <div className="grid grid-cols-2 gap-3">
                  {themeOptions.map((themeKey, index) => (
                    <motion.button
                      key={themeKey}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      onClick={() => selectTheme(themeKey)}
                      className={`px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200 transform hover:scale-105 theme-button ${
                        themeKey === currentTheme
                          ? `${theme.primary} text-white shadow-md`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {themes[themeKey].name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid md:grid-cols-3 gap-8"
        >
          <div
            className={`p-6 rounded-xl ${theme.bg === "bg-black" ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <h3 className="text-xl font-semibold mb-3">Smart Farming</h3>
            <p className="opacity-80">
              AI-powered insights for optimal crop management and yield
              prediction.
            </p>
          </div>
          <div
            className={`p-6 rounded-xl ${theme.bg === "bg-black" ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <h3 className="text-xl font-semibold mb-3">IoT Integration</h3>
            <p className="opacity-80">
              Real-time monitoring of soil conditions, weather, and equipment
              status.
            </p>
          </div>
          <div
            className={`p-6 rounded-xl ${theme.bg === "bg-black" ? "bg-gray-800" : "bg-white"} shadow-lg`}
          >
            <h3 className="text-xl font-semibold mb-3">Data Analytics</h3>
            <p className="opacity-80">
              Comprehensive analytics to make data-driven farming decisions.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
