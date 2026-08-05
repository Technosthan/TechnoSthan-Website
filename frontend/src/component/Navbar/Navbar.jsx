import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  LogOut,
  Mail,
  Menu,
  Phone,
  Globe,
  Globe2,
  Share2,
  ShieldCheck,
  UserCircle2,
  X,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  getDashboardPath,
  getStoredToken,
  getStoredUser,
  normalizeRole,
} from "../../utils/auth";
import { performCentralLogout } from "../../lib/sessionTimeout";
import {
  servicesMenu,
  projectMenu,
  siteBrand,
  utilityLinks,
  utilityContacts,
  utilitySocialLinks,
} from "../../bhoomi/data";

import "./Navbar.css";

const iconMap = {
  linkedin: Share2,
  instagram: Globe2,
  facebook: Globe,
  mail: Mail,
  phone: Phone,
};

const menuIconMap = {
  building: ShieldCheck,
  construction: ArrowUpRight,
  city: ArrowUpRight,
  industry: ArrowUpRight,
  sun: ArrowUpRight,
  chart: ArrowUpRight,
  landmark: ShieldCheck,
  workflow: ArrowUpRight,
  factory: ArrowUpRight,
  check: ShieldCheck,
  sparkles: ArrowUpRight,
};

const activePathMatches = {
  "Home": ["/"],
  "About Us": ["/about"],
  "Services": [
    "/services",
    "/what-we-do",
    "/real-estate-development",
    "/infrastructure-development",
  ],
  "Projects": ["/projects"],
  "Tenders": ["/government-and-institutional-projects"],
  "News": ["/news-and-insights", "/insights/"],
  "Partners": ["/partnerships"],
  "Contact Us": ["/contact"],
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const navbarRef = useRef(null);
  const drawerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileAccordion, setMobileAccordion] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const user = getStoredUser();
  const token = getStoredToken();
  const isAuthenticated = Boolean(token && user);
  const role = normalizeRole(user?.role);
  const dashboardPath = getDashboardPath(role);
  const dashboardLabel = role === "ADMIN" ? "Admin Dashboard" : null;

  const profileLabel = useMemo(() => {
    if (!user) {
      return "Profile";
    }

    return user.name || user.fullName || user.email || "Profile";
  }, [user]);

  const closeAll = () => {
    setDesktopMenu(null);
    setProfileOpen(false);
    setMobileAccordion(null);
    setMobileOpen(false);
  };

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeAll();
  }, [location.pathname]);

  useEffect(() => {
    const onPointerDown = (event) => {
      const target = event.target;
      if (
        navbarRef.current &&
        !navbarRef.current.contains(target) &&
        drawerRef.current &&
        !drawerRef.current.contains(target)
      ) {
        closeAll();
      }
    };

    const onEscape = (event) => {
      if (event.key === "Escape") {
        closeAll();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("nav-drawer-open", mobileOpen);

    return () => {
      document.body.classList.remove("nav-drawer-open");
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) {
      return undefined;
    }

    const focusables = drawerRef.current.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    if (focusables.length > 0) {
      focusables[0].focus();
    }

    const handleTrap = (event) => {
      if (event.key !== "Tab") {
        return;
      }

      const elements = Array.from(
        drawerRef.current.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

      if (!elements.length) {
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    drawerRef.current.addEventListener("keydown", handleTrap);

    return () => {
      if (drawerRef.current) {
        drawerRef.current.removeEventListener("keydown", handleTrap);
      }
    };
  }, [mobileOpen]);

  const openDesktopMenu = (menu) => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDesktopMenu(menu);
  };

  const scheduleCloseDesktopMenu = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
    }

    closeTimerRef.current = window.setTimeout(() => {
      setDesktopMenu(null);
      closeTimerRef.current = null;
    }, 140);
  };

  const handleDrawerNavigate = () => {
    closeAll();
  };

  const handleLogout = async () => {
    closeAll();
    await performCentralLogout({
      reason: "logout",
      message: "Signed out successfully.",
    });
    navigate("/");
  };

  const renderNavLink = (label, to) => {
    const activePrefixes = activePathMatches[label] || [to];
    const isActive = activePrefixes.some((prefix) =>
      prefix === "/"
        ? location.pathname === "/"
        : location.pathname === prefix || location.pathname.startsWith(prefix),
    );

    return (
      <NavLink
        key={label}
        to={to}
        className={({ isActive: navActive }) =>
          `techno-nav-link ${navActive || isActive ? "is-active" : ""}`
        }
        onClick={handleDrawerNavigate}
      >
        <span>{label}</span>
      </NavLink>
    );
  };

  const renderDropdown = (label, items, menuKey) => {
    const isOpen = desktopMenu === menuKey;
    const isActive = (activePathMatches[label] || []).some((prefix) =>
      prefix === "/"
        ? location.pathname === "/"
        : location.pathname === prefix || location.pathname.startsWith(prefix),
    );

    return (
      <div
        className={`techno-dropdown ${isOpen ? "is-open" : ""}`}
        onMouseEnter={() => openDesktopMenu(menuKey)}
        onMouseLeave={scheduleCloseDesktopMenu}
        onFocusCapture={() => openDesktopMenu(menuKey)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            scheduleCloseDesktopMenu();
          }
        }}
      >
        <button
          type="button"
          className={`techno-nav-link techno-dropdown__trigger ${isOpen || isActive ? "is-active" : ""}`}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setDesktopMenu((current) => (current === menuKey ? null : menuKey))}
        >
          <span>{label}</span>
          <ChevronDown size={14} className="techno-dropdown__caret" />
        </button>

        <div className="techno-dropdown__panel" role="menu" aria-hidden={!isOpen}>
          <div className="techno-dropdown__grid">
            {items.map((item) => {
              const Icon = menuIconMap[item.icon] || ArrowUpRight;
              return (
                <Link
                  key={item.title}
                  to={item.to}
                  className="techno-dropdown__item"
                  role="menuitem"
                  onClick={handleDrawerNavigate}
                >
                  <span className="techno-dropdown__icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span className="techno-dropdown__copy">
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ArrowUpRight size={14} className="techno-dropdown__arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMobileAccordion = (label, items, menuKey) => {
    const isOpen = mobileAccordion === menuKey;

    return (
      <div className="techno-drawer__accordion">
        <button
          type="button"
          className="techno-drawer__accordion-trigger"
          aria-expanded={isOpen}
          onClick={() =>
            setMobileAccordion((current) => (current === menuKey ? null : menuKey))
          }
        >
          <span>{label}</span>
          <ChevronDown size={16} className="techno-drawer__caret" />
        </button>
        <div className={`techno-drawer__accordion-panel ${isOpen ? "is-open" : ""}`}>
          {items.map((item) => {
            const Icon = menuIconMap[item.icon] || ArrowUpRight;
            return (
              <Link
                key={item.title}
                to={item.to}
                className="techno-drawer__submenu-item"
                onClick={handleDrawerNavigate}
              >
                <span className="techno-drawer__submenu-icon">
                  <Icon size={14} />
                </span>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <header ref={navbarRef} className="techno-navbar">
      <div className="techno-navbar__utility">
        <div className="site-container techno-navbar__utility-inner">
          <div className="techno-navbar__utility-contact">
            {utilityContacts.map((item) => {
              const isEmail = item.href.startsWith("mailto:");
              const Icon = isEmail ? Mail : Phone;
              return (
                <a key={item.label} href={item.href} className="techno-navbar__utility-link">
                  <Icon size={13} />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="techno-navbar__utility-links">
            {utilityLinks.map((item) => (
              <Link key={item.label} to={item.to} className="techno-navbar__utility-link">
                <span>{item.label}</span>
                <ArrowUpRight size={12} />
              </Link>
            ))}
          </div>

          <div className="techno-navbar__utility-social">
            {utilitySocialLinks.map((item) => {
              const Icon = iconMap[item.icon] || ArrowUpRight;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="techno-navbar__social-link"
                  aria-label={item.label}
                >
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <div className={`techno-navbar__main ${isScrolled ? "is-scrolled" : ""}`}>
        <div className="site-container techno-navbar__main-inner">
          <Link to="/" className="techno-navbar__brand" onClick={handleDrawerNavigate}>
            <span className="techno-navbar__brand-mark">TI</span>
            <span className="techno-navbar__brand-copy">
              <strong>{siteBrand.name}</strong>
              <small>{siteBrand.statement}</small>
            </span>
          </Link>

          <nav className="techno-navbar__nav" aria-label="Primary navigation">
            {renderNavLink("Home", "/")}
            {renderNavLink("About Us", "/about")}
            {renderDropdown("Services", servicesMenu, "services")}
            {renderDropdown("Projects", projectMenu, "projects")}
            {renderNavLink("Tenders", "/government-and-institutional-projects")}
            {renderNavLink("News", "/news-and-insights")}
            {renderNavLink("Partners", "/partnerships")}
            {renderNavLink("Contact Us", "/contact")}
          </nav>

          <div className="techno-navbar__actions">
            {isAuthenticated ? (
              <div
                className={`techno-profile ${profileOpen ? "is-open" : ""}`}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  type="button"
                  className="techno-profile__button"
                  aria-haspopup="menu"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((current) => !current)}
                  onMouseEnter={() => setProfileOpen(true)}
                >
                  <span className="techno-profile__avatar" aria-hidden="true">
                    {String(profileLabel || "P")
                      .trim()
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <span className="techno-profile__copy">
                    <strong>{profileLabel}</strong>
                    <small>{role}</small>
                  </span>
                  <ChevronDown size={14} className="techno-profile__caret" />
                </button>

                <div className="techno-profile__menu" role="menu" aria-hidden={!profileOpen}>
                  {dashboardLabel ? (
                    <Link to={dashboardPath} className="techno-profile__menu-item" onClick={handleDrawerNavigate}>
                      <ShieldCheck size={14} />
                      <span>{dashboardLabel}</span>
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="techno-profile__menu-item techno-profile__menu-item--danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : null}

            <Link to="/contact" className="techno-navbar__cta">
              <span>Get In Touch</span>
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              className="techno-navbar__toggle"
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((current) => !current)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={drawerRef}
        className={`techno-drawer ${mobileOpen ? "is-open" : ""}`}
        aria-hidden={!mobileOpen}
      >
        <div className="techno-drawer__backdrop" onClick={() => setMobileOpen(false)} />
        <div className="techno-drawer__panel" role="dialog" aria-modal="true" aria-label="Site navigation">
          <div className="techno-drawer__header">
            <Link to="/" className="techno-navbar__brand" onClick={handleDrawerNavigate}>
              <span className="techno-navbar__brand-mark">TI</span>
              <span className="techno-navbar__brand-copy">
                <strong>{siteBrand.name}</strong>
                <small>{siteBrand.statement}</small>
              </span>
            </Link>
            <button
              type="button"
              className="techno-drawer__close"
              aria-label="Close navigation menu"
              onClick={() => setMobileOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div className="techno-drawer__content">
            <div className="techno-drawer__links">
              {renderNavLink("Home", "/")}
              {renderNavLink("About Us", "/about")}
              {renderMobileAccordion("Services", servicesMenu, "mobile-services")}
              {renderMobileAccordion("Projects", projectMenu, "mobile-projects")}
              {renderNavLink("Tenders", "/government-and-institutional-projects")}
              {renderNavLink("News", "/news-and-insights")}
              {renderNavLink("Partners", "/partnerships")}
              {renderNavLink("Contact Us", "/contact")}
            </div>

            <div className="techno-drawer__footer">
              <Link to="/projects" className="btn techno-btn techno-btn--gold" onClick={handleDrawerNavigate}>
                Explore Projects
                <ArrowUpRight size={16} />
              </Link>
              <Link to="/contact" className="btn techno-btn techno-btn--outline" onClick={handleDrawerNavigate}>
                Get In Touch
              </Link>

              {isAuthenticated ? (
                <div className="techno-drawer__account">
                  <div className="techno-drawer__account-meta">
                    <UserCircle2 size={18} />
                    <span>{profileLabel}</span>
                  </div>
                  {dashboardLabel ? (
                    <Link to={dashboardPath} className="techno-drawer__account-link" onClick={handleDrawerNavigate}>
                      {dashboardLabel}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="techno-drawer__logout"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
