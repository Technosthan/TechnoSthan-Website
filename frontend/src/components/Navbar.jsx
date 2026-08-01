import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Globe,
  LogOut,
  Menu,
  Palette,
  Shield,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { getMyUnreadNotificationCount } from "../shared/lib/notificationsApi";
import { getOptimizedImageUrl } from "../shared/lib/assetUrl";
import { useTheme } from "../contexts/ThemeContext";
import { usePublicLayout } from "../contexts/PublicLayoutContext";

const navId = "primary-navigation";
const mobileMenuId = "mobile-navigation";

const parseStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isHomePath = (pathname) => pathname === "/" || pathname === "/landing";

const matchesRoute = (pathname, path) => {
  if (path === "/") {
    return isHomePath(pathname);
  }

  return pathname === path || pathname.startsWith(`${path}/`);
};

const ThemeToggleButton = ({ theme, onClick, className = "" }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Open theme selector"
    title="Theme"
    className={`inline-flex items-center justify-center rounded-xl border px-3 py-2 text-sm transition ${theme.navItem} ${theme.navItemHover} border-transparent hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 ${className}`}
  >
    <Palette size={16} />
  </button>
);

const LanguageSelector = ({
  currentLanguage = "en",
  changeLanguage,
  theme,
  onSelect,
}) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const wrapperRef = useRef(null);

  const mapLabel = (code) => ({ en: "EN", hi: "HI", rj: "RJ" })[code] || code;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (languageCode) => {
    changeLanguage(languageCode);
    setOpen(false);
    onSelect?.();
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={t("common.languageTitle")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="language-menu"
        title={t("common.languageTitle")}
        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${theme.navItem} ${theme.navItemHover} border-transparent hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5`}
      >
        <Globe size={16} className={theme.text} />
        <span className="hidden sm:inline">{mapLabel(currentLanguage)}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="language-menu"
            role="menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className={`absolute right-0 mt-2 w-44 rounded-2xl p-2 shadow-2xl ${theme.card} ${theme.text} border ${theme.border} z-50`}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelect("en")}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                currentLanguage === "en"
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {t("buttons.languageEnglish")}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelect("hi")}
              className={`mt-1 w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                currentLanguage === "hi"
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {t("buttons.languageHindi")}
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => handleSelect("rj")}
              className={`mt-1 w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                currentLanguage === "rj"
                  ? "bg-emerald-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {t("buttons.languageRajasthani")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const inPublicLayout = usePublicLayout();
  if (inPublicLayout) {
    return null;
  }

  const navigate = useNavigate();
  const location = useLocation();
  const { theme, appSettings, language: currentLanguage, changeLanguage } =
    useTheme();
  const { t } = useTranslation();
  const [user, setUser] = useState(() => parseStoredUser());
  const [unread, setUnread] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";

  const navItems = useMemo(
    () => [
      { label: t("navbar.home"), path: "/" },
      { label: t("navbar.about"), path: "/about" },
      { label: t("navbar.contact"), path: "/contact" },
      {
        label: t("navbar.wiki"),
        path: "/AgriTech Wiki",
        visible: appSettings.featureFlags?.contentVisibility !== false,
      },
      {
        label: t("navbar.aiChat"),
        path: "/chat",
        visible: appSettings.featureFlags?.aiChat !== false,
      },
    ],
    [appSettings.featureFlags?.aiChat, appSettings.featureFlags?.contentVisibility, t],
  );

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUnread(0);
    setUser(null);
    closeMobileMenu();
    navigate("/");
  };

  const handleHomeClick = () => {
    if (token && isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/");
    }
    closeMobileMenu();
  };

  const handleNavClick = () => {
    closeMobileMenu();
  };

  const openThemeSelector = () => {
    window.dispatchEvent(new Event("openThemeSelector"));
  };

  useEffect(() => {
    let mounted = true;

    const fetchCount = async () => {
      try {
        if (!token) {
          if (mounted) setUnread(0);
          return;
        }

        const res = await getMyUnreadNotificationCount();
        if (!mounted) return;
        setUnread(res.data?.data?.count || 0);
      } catch {
        // Keep the header usable even if notifications fail.
      }
    };

    fetchCount();

    const intervalId = window.setInterval(fetchCount, 30000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCount();
      }
    };

    const handleUserUpdated = (event) => {
      if (event?.detail) {
        setUser(event.detail);
      } else {
        setUser(parseStoredUser());
      }
    };

    window.addEventListener("focus", fetchCount);
    window.addEventListener("announcements:changed", fetchCount);
    document.addEventListener("visibilitychange", handleVisibilityChange);
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

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    const handlePointerDown = (event) => {
      if (!isMobileMenuOpen) return;
      if (
        mobileMenuRef.current?.contains(event.target) ||
        mobileMenuButtonRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMobileMenu();
    };

    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const handleResize = (event) => {
      if (event.matches) {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);
    mediaQuery.addEventListener("change", handleResize);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, [isMobileMenuOpen]);

  const navLinkClass = (path, base = "") => {
    const active = matchesRoute(location.pathname, path);
    return [
      "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70",
      theme.navItem,
      theme.navItemHover,
      active ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300" : "",
      base,
    ]
      .filter(Boolean)
      .join(" ");
  };

  const mobileNavLinkClass = (path) => {
    const active = matchesRoute(location.pathname, path);
    return [
      "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70",
      theme.navItem,
      theme.navItemHover,
      active ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300" : "",
    ]
      .filter(Boolean)
      .join(" ");
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35 }}
      className={`sticky top-0 z-[60] w-full border-b ${theme.navbar} backdrop-blur-xl`}
    >
      <div className="site-container flex h-[var(--navbar-height)] items-center justify-between gap-4">
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex min-w-0 items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
          aria-label={appSettings.appName || "TechnoSthan AgriTech home"}
        >
          <picture className="shrink-0">
            {!appSettings.logoUrl && (
              <>
                <source
                  srcSet="/optimized/hero-logo-64.avif 64w, /optimized/hero-logo-128.avif 128w"
                  sizes="48px"
                  type="image/avif"
                />
                <source
                  srcSet="/optimized/hero-logo-64.webp 64w, /optimized/hero-logo-128.webp 128w"
                  sizes="48px"
                  type="image/webp"
                />
                <source
                  srcSet="/optimized/hero-logo-64.jpg 64w, /optimized/hero-logo-128.jpg 128w"
                  sizes="48px"
                  type="image/jpeg"
                />
              </>
            )}
            <img
              src={getOptimizedImageUrl(
                appSettings.logoUrl || "/optimized/hero-logo-128.jpg",
              )}
              width="128"
              height="128"
              className="h-10 w-10 rounded-full border-2 border-emerald-500/30 object-cover shadow-lg md:h-11 md:w-11"
              alt={`${appSettings.appName || "TechnoSthan AgriTech"} logo`}
              loading="eager"
              decoding="async"
            />
          </picture>

          <div className="min-w-0">
            <p className={`truncate text-sm font-semibold md:text-base ${theme.text}`}>
              {appSettings.appName || "TECHNOSTHAN AGRITECH"}
            </p>
            <p className={`truncate text-xs ${theme.textSecondary}`}>
              Smart agriculture platform
            </p>
          </div>
        </Link>

        <nav
          id={navId}
          aria-label="Primary navigation"
          className="hidden min-w-0 items-center gap-1 lg:flex"
        >
          <button
            type="button"
            onClick={handleHomeClick}
            className={navLinkClass("/")}
            aria-current={isHomePath(location.pathname) ? "page" : undefined}
          >
            {t("navbar.home")}
          </button>
          {navItems.slice(1).map((item) => {
            if (item.visible === false) return null;
            const active = matchesRoute(location.pathname, item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={navLinkClass(item.path)}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <ThemeToggleButton theme={theme} onClick={openThemeSelector} />

          <LanguageSelector
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            theme={theme}
          />

          {token ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${theme.navItem} ${theme.navItemHover}`}
                >
                  <Shield size={16} />
                  {t("navbar.adminPanel")}
                </Link>
              )}

              <button
                type="button"
                title="Notifications"
                aria-label="Notifications"
                onClick={() => navigate("/dashboard")}
                className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <Bell size={18} className={theme.textSecondary} />
                {unread > 0 && (
                  <span className="absolute -right-1 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white">
                    {unread}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className={`max-w-44 truncate rounded-xl px-3 py-2 text-sm font-medium transition ${theme.navItem} ${theme.navItemHover}`}
                title={t("common.welcome", { name: user?.name || "user" })}
              >
                {t("common.welcome", { name: user?.name || "user" })}
              </button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition ${theme.logoutButton}`}
              >
                <LogOut size={16} />
                {t("common.logout")}
              </motion.button>
            </>
          ) : (
            <Link
              to="/login"
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-lg transition ${theme.buttonSecondary}`}
            >
              <Shield size={16} />
              {t("navbar.login")}
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggleButton theme={theme} onClick={openThemeSelector} />

          <LanguageSelector
            currentLanguage={currentLanguage}
            changeLanguage={changeLanguage}
            theme={theme}
            onSelect={closeMobileMenu}
          />

          {token && (
            <button
              type="button"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => navigate("/dashboard")}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Bell size={18} className={theme.textSecondary} />
              {unread > 0 && (
                <span className="absolute -right-1 top-0 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-semibold leading-none text-white">
                  {unread}
                </span>
              )}
            </button>
          )}

          <button
            ref={mobileMenuButtonRef}
            type="button"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 ${theme.navItem} ${theme.navItemHover} border-transparent hover:border-white/10 hover:bg-black/5 dark:hover:bg-white/5`}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id={mobileMenuId}
            ref={mobileMenuRef}
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
            className={`lg:hidden border-t ${theme.border} ${theme.card} shadow-2xl`}
          >
            <div className="site-container max-h-[calc(100vh-4.5rem)] overflow-y-auto py-4">
              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={handleHomeClick}
                  className={mobileNavLinkClass("/")}
                  aria-current={isHomePath(location.pathname) ? "page" : undefined}
                >
                  <span>{t("navbar.home")}</span>
                  <span className="text-xs opacity-60">01</span>
                </button>

                {navItems.slice(1).map((item, index) => {
                  if (item.visible === false) return null;
                  const active = matchesRoute(location.pathname, item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={mobileNavLinkClass(item.path)}
                      aria-current={active ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <span className="text-xs opacity-60">
                        {String(index + 2).padStart(2, "0")}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 rounded-3xl border border-white/10 bg-black/5 p-4 dark:bg-white/5">
                {token ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={handleNavClick}
                        className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ${theme.navItem} ${theme.navItemHover}`}
                      >
                        <Shield size={16} />
                        {t("navbar.adminPanel")}
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        navigate("/dashboard");
                        handleNavClick();
                      }}
                      className={`inline-flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${theme.navItem} ${theme.navItemHover}`}
                    >
                      <span>{t("common.welcome", { name: user?.name || "user" })}</span>
                      <Bell size={16} />
                    </button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      onClick={handleLogout}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg transition ${theme.logoutButton}`}
                    >
                      <LogOut size={16} />
                      {t("common.logout")}
                    </motion.button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg transition ${theme.buttonSecondary}`}
                  >
                    <Shield size={16} />
                    {t("navbar.login")}
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
