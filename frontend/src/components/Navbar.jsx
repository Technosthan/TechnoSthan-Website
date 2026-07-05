import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Shield, Bell, Menu, X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { getUnreadCount } from "../shared/lib/announcementsApi";

const LanguageSelector = ({
  currentLanguage = "en",
  changeLanguage,
  theme,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const mapLabel = (c) => ({ en: "EN", hi: "HI", rj: "RJ" })[c] || c;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`p-2 rounded-lg ${theme.navItem} transition-colors flex items-center gap-2`}
        title={t("common.languageTitle")}
      >
        <Globe size={16} className={theme.text} />
        <span className="text-sm hidden sm:inline">
          {mapLabel(currentLanguage)}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-40 rounded-xl p-2 shadow-xl ${theme.card} border ${theme.border}`}
          >
            <div className="flex flex-col">
              <button
                onClick={() => {
                  changeLanguage("en");
                  setOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md ${currentLanguage === "en" ? "bg-cyan-600 text-white" : "hover:bg-white/5"}`}
              >
                {t("buttons.languageEnglish")}
              </button>
              <button
                onClick={() => {
                  changeLanguage("hi");
                  setOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md ${currentLanguage === "hi" ? "bg-cyan-600 text-white" : "hover:bg-white/5"}`}
              >
                {t("buttons.languageHindi")}
              </button>
              <button
                onClick={() => {
                  changeLanguage("rj");
                  setOpen(false);
                }}
                className={`text-left px-3 py-2 rounded-md ${currentLanguage === "rj" ? "bg-cyan-600 text-white" : "hover:bg-white/5"}`}
              >
                {t("buttons.languageRajasthani")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const { theme, appSettings, language: currentLanguage, changeLanguage } =
    useTheme();
  const { t } = useTranslation();
  const { settings, loading } = useSettings();
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null"),
  );
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";
  const [unread, setUnread] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isPublicAccessEnabled =
    settings?.publicAccessEnabled === true &&
    settings?.publicWebsiteEnabled === true;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    setIsMobileMenuOpen(false);
  };

  const handleHomeClick = () => {
    if (token && isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    const fetchCount = async () => {
      try {
        if (!token) return;
        const res = await getUnreadCount();
        if (!mounted) return;
        setUnread(res.data?.data?.count || 0);
      } catch (err) {
        // ignore
      }
    };

    fetchCount();

    const intervalId = window.setInterval(fetchCount, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    };

    window.addEventListener("focus", fetchCount);
    window.addEventListener("announcements:changed", fetchCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const handleUserUpdated = (event) => {
      if (event?.detail) {
        setUser(event.detail);
      } else {
        setUser(JSON.parse(localStorage.getItem("user") || "null"));
      }
    };

    window.addEventListener("userUpdated", handleUserUpdated);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", fetchCount);
      window.removeEventListener("announcements:changed", fetchCount);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("userUpdated", handleUserUpdated);
    };
  }, [token]);

  if (loading) {
    return (
      <nav
        className={`sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 backdrop-blur-md ${theme.navbar} shadow-sm`}
      >
        <div className="h-12 w-44 rounded-xl bg-white/10 animate-pulse" />
        <div className="hidden md:flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" />
          <div className="h-10 w-24 rounded-xl bg-white/10 animate-pulse" />
        </div>
      </nav>
    );
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex justify-between items-center px-6 md:px-12 py-4
      backdrop-blur-md ${theme.navbar} shadow-sm sticky top-0 z-50`}
    >
      {/* Logo and Brand */}
      <Link to="/" className="flex items-center gap-3" onClick={handleNavClick}>
        <img
          src={appSettings.logoUrl || "/hero.png"}
          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 ${theme.border} shadow`}
          alt={`${appSettings.appName || "TECHNOSTHAN AGRITECH"} Logo`}
        />
        <h1 className={`font-bold text-base md:text-lg ${theme.text}`}>
          {appSettings.appName || "TECHNOSTHAN AGRITECH"}
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-6">
        <button
          onClick={handleHomeClick}
          className={`${theme.navItem} transition cursor-pointer`}
        >
          {t("navbar.home")}
        </button>
        <Link to="/about" className={`${theme.navItem} transition`}>
          {t("navbar.about")}
        </Link>
        <Link to="/contact" className={`${theme.navItem} transition`}>
          {t("navbar.contact")}
        </Link>
        {appSettings.featureFlags?.contentVisibility !== false && (
          <Link to="/AgriTech Wiki" className={`${theme.navItem} transition`}>
            {t("navbar.wiki")}
          </Link>
        )}
        {appSettings.featureFlags?.aiChat !== false && (
          <Link to="/chat" className={`${theme.navItem} transition`}>
            {t("navbar.aiChat")}
          </Link>
        )}
      </div>

      {/* Desktop User Section */}
      <div className="hidden md:flex items-center gap-4">
        {/* Theme Button */}
        <div className="relative"></div>

        {/* Language Selector */}
        <div className="relative">
          <LanguageSelector
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            theme={theme}
          />
        </div>
        {loading ? (
          <span className="inline-flex h-8 w-24 animate-pulse rounded-full bg-white/10" />
        ) : token ? (
          <>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`${theme.navItem} transition flex items-center gap-1`}
              >
                <Shield size={16} />
                {t("navbar.adminPanel")}
              </Link>
            )}
            <button
              title="Announcements"
              onClick={() => navigate("/dashboard")}
              className="relative mr-3 cursor-pointer"
            >
              <Bell size={18} className={`${theme.textSecondary}`} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5">
                  {unread}
                </span>
              )}
            </button>
            <span
              onClick={() => navigate("/dashboard")}
              className={`${theme.textSecondary} cursor-pointer text-sm`}
            >
              {t("common.welcome", { name: user.name })}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className={`${theme.logoutButton} px-4 py-2 cursor-pointer rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 text-sm`}
            >
              <LogOut size={16} />
              {t("common.logout")}
            </motion.button>
          </>
        ) : (
          isPublicAccessEnabled ? (
            <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wider px-3 py-2">
              {t("common.publicAccessEnabled")}
            </span>
          ) : (
            <Link
              to="/login"
              className={`${theme.buttonSecondary} hover:scale-105 transition transform px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-sm`}
            >
              <Shield size={16} />
              {t("navbar.login")}
            </Link>
          )
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-3">
        {/* Mobile User Info */}
        {token && (
          <div className="flex items-center gap-2">
            <button
              title="Announcements"
              onClick={() => navigate("/dashboard")}
              className="relative cursor-pointer"
            >
              <Bell size={18} className={`${theme.textSecondary}`} />
              {unread > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                  {unread}
                </span>
              )}
            </button>
            <span
              onClick={() => navigate("/dashboard")}
              className={`${theme.textSecondary} cursor-pointer text-sm truncate max-w-20`}
            >
              {user.name}
            </span>
          </div>
        )}

        {/* Hamburger Menu */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`p-2 rounded-lg ${theme.navItem} transition-colors`}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`absolute top-full left-0 right-0 ${theme.card} backdrop-blur-md border-t ${theme.border} shadow-lg md:hidden`}
          >
            <div className="flex flex-col py-4 px-6 space-y-3">
              {/* Navigation Links */}
              <button
                onClick={handleHomeClick}
                className={`text-left ${theme.navItem} transition cursor-pointer py-2`}
              >
                {t("navbar.home")}
              </button>
              <Link
                to="/about"
                className={`${theme.navItem} transition py-2`}
                onClick={handleNavClick}
              >
                {t("navbar.about")}
              </Link>
              <Link
                to="/contact"
                className={`${theme.navItem} transition py-2`}
                onClick={handleNavClick}
              >
                {t("navbar.contact")}
              </Link>
              {appSettings.featureFlags?.contentVisibility !== false && (
                <Link
                  to="/AgriTech Wiki"
                  className={`${theme.navItem} transition py-2`}
                  onClick={handleNavClick}
                >
                  {t("navbar.wiki")}
                </Link>
              )}
              {appSettings.featureFlags?.aiChat !== false && (
                <Link
                  to="/chat"
                  className={`${theme.navItem} transition py-2`}
                  onClick={handleNavClick}
                >
                  {t("navbar.aiChat")}
                </Link>
              )}

              {/* Admin Panel Link */}
              {token && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`${theme.navItem} transition flex items-center gap-2 py-2`}
                  onClick={handleNavClick}
                >
                  <Shield size={16} />
                  {t("navbar.adminPanel")}
                </Link>
              )}

              {/* Mobile Logout/Login */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                {loading ? (
                  <span className="inline-flex h-11 w-full animate-pulse rounded-xl bg-white/10" />
                ) : token ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className={`${theme.logoutButton} w-full px-4 py-3 cursor-pointer rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all duration-300`}
                  >
                    <LogOut size={18} />
                    {t("common.logout")}
                  </motion.button>
                ) : (
                  isPublicAccessEnabled ? (
                    <span className="inline-flex w-full items-center justify-center rounded-xl bg-green-100 text-green-800 text-xs font-semibold uppercase tracking-wider px-3 py-3">
                      {t("common.publicAccessEnabled")}
                    </span>
                  ) : (
                    <Link
                      to="/login"
                      className={`${theme.buttonSecondary} w-full hover:scale-105 transition transform px-4 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2`}
                      onClick={handleNavClick}
                    >
                      <Shield size={16} />
                      {t("navbar.login")}
                    </Link>
                  )
                )}
              </div>
              {/* Mobile Language Selector */}
              <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm mb-2 text-slate-400">
                  {t("common.languageTitle")}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      changeLanguage("en");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl ${currentLanguage === "en" ? "bg-cyan-600 text-white" : "bg-white/5"}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("hi");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl ${currentLanguage === "hi" ? "bg-cyan-600 text-white" : "bg-white/5"}`}
                  >
                    HI
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage("rj");
                      setIsMobileMenuOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl ${currentLanguage === "rj" ? "bg-cyan-600 text-white" : "bg-white/5"}`}
                  >
                    RJ
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
