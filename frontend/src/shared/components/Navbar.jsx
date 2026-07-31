import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiChevronDown,
  FiMenu,
  FiMoon,
  FiMonitor,
  FiShare2,
  FiSun,
  FiX,
  FiZap,
  FiUser,
} from "react-icons/fi";

import {
  ADMIN_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  REGISTER_ROUTE,
  PRODUCTS_ROUTE,
} from "../constants";
import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import useServices from "../../features/services/hooks/useServices";
import ThemeToggle from "./ThemeToggle";
import RadialActionMenu from "./RadialActionMenu";
import { getIconComponent } from "../utils";
import { getAccountDisplayInitial, getSafeImageUrl } from "../utils";
import { gsap, setupGsap } from "../../animations/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";
import { useAppMotion } from "../../providers/AppMotionProvider";
import MagneticButton from "../../components/motion/MagneticButton";
import useNavbarOrbitItems from "../hooks/useNavbarOrbitItems";
import {
  NAVBAR_ORBIT_ACTION_TYPES,
  NAVBAR_ORBIT_GROUPS,
  NAVBAR_ORBIT_PROFILE_DEFAULTS,
  NAVBAR_ORBIT_SOCIAL_SEEDS,
  NAVBAR_ORBIT_THEME_DEFAULTS,
} from "../constants/navbar-orbit";
import useTheme from "../theme/useTheme";
import "./navbar.css";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services", hasMegaMenu: true },
  { label: "Products", path: PRODUCTS_ROUTE },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const renderIcon = (iconKey, size = 18) => {
  const Icon = getIconComponent(iconKey);
  return <Icon size={size} />;
};

const THEME_SEQUENCE = ["dark", "light", "system"];

const PROFILE_ACTION_ROUTE_MAP = {
  login: LOGIN_ROUTE,
  register: REGISTER_ROUTE,
  dashboard: DASHBOARD_ROUTE,
  "admin-dashboard": ADMIN_ROUTE,
  profile: PROFILE_ROUTE,
};

const isProfileOrbitItemVisible = (
  item,
  { isAuthenticated, isAdmin }
) => {
  const visibility = String(item?.visibility || "public").toLowerCase();
  const systemActionKey = String(item?.systemActionKey || "").toLowerCase();

  if (systemActionKey === "login" || systemActionKey === "register") {
    return !isAuthenticated;
  }

  if (systemActionKey === "logout") {
    return isAuthenticated;
  }

  if (systemActionKey === "admin-dashboard") {
    return isAdmin;
  }

  if (systemActionKey === "dashboard" || systemActionKey === "profile") {
    return isAuthenticated;
  }

  if (visibility === "admin") {
    return isAdmin;
  }

  if (visibility === "user") {
    return isAuthenticated && !isAdmin;
  }

  if (visibility === "authenticated") {
    return isAuthenticated;
  }

  if (visibility === "guest") {
    return !isAuthenticated;
  }

  return true;
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileMenuMounted, setIsMobileMenuMounted] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isServicesMenuMounted, setIsServicesMenuMounted] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [activeServiceGroupKey, setActiveServiceGroupKey] = useState("");
  const [mobileServiceGroupKey, setMobileServiceGroupKey] = useState("");
  const [activeRadialMenu, setActiveRadialMenu] = useState(null);
  const reducedMotion = useReducedMotion();
  const { isAppReady } = useAppMotion();
  const { mode, resolvedMode, setMode } = useTheme();
  const location = useLocation();

  const navigate = useNavigate();
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const logoRef = useRef(null);
  const actionsRef = useRef(null);
  const servicesTriggerRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const servicesCloseTimerRef = useRef(null);
  const mobileCloseTimerRef = useRef(null);

  const { isAuthenticated, user, isAdmin } = useAuth();
  const { logoutAndRedirect } = useLogout();
  const { menuGroups, featuredService } = useServices({
    navbarOnly: true,
  });
  const { itemsByGroup, sourceKind } = useNavbarOrbitItems();
  const profileAvatarUrl =
    user?.profileImageUrl || user?.profileImage || "";
  const profileInitial = getAccountDisplayInitial(user?.name);

  const socialOrbitSource = useMemo(() => {
    const items = itemsByGroup[NAVBAR_ORBIT_GROUPS.SOCIAL] || [];
    return sourceKind === "fallback" ? NAVBAR_ORBIT_SOCIAL_SEEDS : items;
  }, [itemsByGroup, sourceKind]);

  const themeOrbitSource = useMemo(() => {
    const items = itemsByGroup[NAVBAR_ORBIT_GROUPS.THEME] || [];
    return sourceKind === "fallback" ? NAVBAR_ORBIT_THEME_DEFAULTS : items;
  }, [itemsByGroup, sourceKind]);

  const profileOrbitSource = useMemo(() => {
    const items = itemsByGroup[NAVBAR_ORBIT_GROUPS.PROFILE] || [];
    return sourceKind === "fallback" ? NAVBAR_ORBIT_PROFILE_DEFAULTS : items;
  }, [itemsByGroup, sourceKind]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setIsMobileMenuOpen(false);
        setIsMobileServicesOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setActiveRadialMenu(null);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    setupGsap();

    if (reducedMotion || !isAppReady) {
      return undefined;
    }

    const context = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(headerRef.current, {
        autoAlpha: 0,
        y: -20,
        duration: 0.7,
      })
        .from(
          logoRef.current,
          {
            autoAlpha: 0,
            x: -16,
            duration: 0.5,
          },
          "-=0.35"
        )
        .from(
          navRef.current?.querySelectorAll("[data-nav-item]"),
          {
            autoAlpha: 0,
            y: -10,
            duration: 0.45,
            stagger: 0.05,
          },
          "-=0.28"
        )
        .from(
          actionsRef.current?.querySelectorAll("[data-action-item]"),
          {
            autoAlpha: 0,
            y: -10,
            scale: 0.96,
            duration: 0.42,
            stagger: 0.05,
          },
          "-=0.32"
        );
    }, headerRef);

    return () => context.revert();
  }, [reducedMotion, isAppReady]);

  useEffect(() => {
    if (!isServicesMenuMounted || !servicesMenuRef.current) {
      return undefined;
    }

    setupGsap();

    if (reducedMotion) {
      gsap.set(servicesMenuRef.current, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
      });
      return undefined;
    }

    if (isServicesMenuOpen) {
      gsap.fromTo(
        servicesMenuRef.current,
        {
          autoAlpha: 0,
          y: 14,
          scale: 0.98,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.22,
          ease: "power3.out",
        }
      );
    }

    return undefined;
  }, [isServicesMenuMounted, isServicesMenuOpen, reducedMotion]);

  useEffect(() => {
    if (!isMobileMenuMounted || !mobileMenuRef.current) {
      return undefined;
    }

    setupGsap();

    if (reducedMotion) {
      gsap.set(mobileMenuRef.current, {
        autoAlpha: 1,
        y: 0,
      });
      return undefined;
    }

    if (isMobileMenuOpen) {
      gsap.fromTo(
        mobileMenuRef.current,
        {
          autoAlpha: 0,
          y: -14,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.24,
          ease: "power3.out",
        }
      );
    }

    return undefined;
  }, [isMobileMenuMounted, isMobileMenuOpen, reducedMotion]);

  useEffect(() => {
    return () => {
      if (servicesCloseTimerRef.current) {
        window.clearTimeout(servicesCloseTimerRef.current);
      }

      if (mobileCloseTimerRef.current) {
        window.clearTimeout(mobileCloseTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    setActiveRadialMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!isServicesMenuOpen && !isMobileMenuOpen) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      const target = event.target;
      const withinDesktopServices =
        servicesTriggerRef.current?.contains(target) ||
        servicesMenuRef.current?.contains(target);
      const withinMobileMenu = mobileMenuRef.current?.contains(target);

      if (isServicesMenuOpen && !withinDesktopServices) {
        closeDesktopServicesInstantly();
      }

      if (isMobileMenuOpen && !withinMobileMenu) {
        closeMobileMenuInstantly();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeDesktopServicesInstantly();
        closeMobileMenuInstantly();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen, isServicesMenuOpen]);

  const accountItems = isAdmin
    ? [
        { label: "Admin Dashboard", to: ADMIN_ROUTE },
        { label: "My Profile", to: PROFILE_ROUTE },
      ]
    : [
        { label: "Dashboard", to: DASHBOARD_ROUTE },
        { label: "My Profile", to: PROFILE_ROUTE },
      ];

  const clearMenuTimer = (ref) => {
    if (ref.current) {
      window.clearTimeout(ref.current);
      ref.current = null;
    }
  };

  const closeDesktopServicesInstantly = () => {
    setIsServicesMenuOpen(false);
    setIsServicesMenuMounted(false);
  };

  const closeMobileMenuInstantly = () => {
    setIsMobileServicesOpen(false);
    setIsMobileMenuOpen(false);
    setIsMobileMenuMounted(false);
  };

  const closeServicesMenu = (delay = 120) => {
    const nextDelay = typeof delay === "number" ? delay : 0;
    clearMenuTimer(servicesCloseTimerRef);

    servicesCloseTimerRef.current = window.setTimeout(() => {
      if (servicesMenuRef.current && !reducedMotion) {
        gsap.to(servicesMenuRef.current, {
          autoAlpha: 0,
          y: 12,
          scale: 0.98,
          duration: 0.16,
          ease: "power2.out",
          onComplete: () => {
            setIsServicesMenuOpen(false);
            setIsServicesMenuMounted(false);
          },
        });
        return;
      }

      setIsServicesMenuOpen(false);
      setIsServicesMenuMounted(false);
    }, nextDelay);
  };

  const openServicesMenu = () => {
    clearMenuTimer(servicesCloseTimerRef);
    setIsServicesMenuMounted(true);
    setIsServicesMenuOpen(true);
  };

  const handleServicesBlur = (event) => {
    const nextTarget = event.relatedTarget;
    const isWithinServicesArea =
      servicesTriggerRef.current?.contains(nextTarget) ||
      servicesMenuRef.current?.contains(nextTarget);

    if (!isWithinServicesArea) {
      closeServicesMenu(0);
    }
  };

  const closeMobileMenu = (delay = 0) => {
    const nextDelay = typeof delay === "number" ? delay : 0;
    clearMenuTimer(mobileCloseTimerRef);
    setIsMobileServicesOpen(false);

    mobileCloseTimerRef.current = window.setTimeout(() => {
      if (mobileMenuRef.current && !reducedMotion) {
        gsap.to(mobileMenuRef.current, {
          autoAlpha: 0,
          y: -12,
          duration: 0.18,
          ease: "power2.out",
          onComplete: () => {
            setIsMobileMenuOpen(false);
            setIsMobileMenuMounted(false);
          },
        });
        return;
      }

      setIsMobileMenuOpen(false);
      setIsMobileMenuMounted(false);
    }, nextDelay);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) {
      closeMobileMenu(0);
      return;
    }

    clearMenuTimer(mobileCloseTimerRef);
    setIsMobileMenuMounted(true);
    setIsMobileMenuOpen(true);
  };

  const toggleMobileServices = () => {
    setIsMobileServicesOpen((current) => !current);
  };

  const closeMobileServices = () => {
    setIsMobileServicesOpen(false);
  };

  const handleLogin = () => {
    setActiveRadialMenu(null);
    closeMobileMenu(0);
    navigate(LOGIN_ROUTE);
  };

  const handleLogout = () => {
    setActiveRadialMenu(null);
    closeMobileMenu(0);
    logoutAndRedirect(LOGIN_ROUTE);
  };

  const activeServiceGroup =
    menuGroups.find((group) => group.key === activeServiceGroupKey) ||
    menuGroups[0];

  const mobileOpenGroup =
    menuGroups.find((group) => group.key === mobileServiceGroupKey) ||
    menuGroups[0];

  const resolvedActiveServiceGroupKey =
    activeServiceGroup?.key || activeServiceGroupKey || "";
  const resolvedMobileServiceGroupKey =
    mobileOpenGroup?.key || mobileServiceGroupKey || "";

  const renderServiceLinks = (items, onClick) =>
    items.map((service) => (
      <Link
        key={service.id}
        to={service.route || "/services"}
        className="services-menu-link"
        onClick={onClick}
        data-cursor="view"
      >
        <span className="services-menu-link-icon">
          {renderIcon(service.iconKey, 14)}
        </span>
        <span className="services-menu-link-copy">
          <strong>{service.title}</strong>
          <small>{service.shortDescription}</small>
        </span>
        <FiArrowRight className="services-menu-link-arrow" />
      </Link>
    ));

  const handleLogoClick = () => {
    setActiveRadialMenu(null);
    closeMobileMenuInstantly();
  };

  const handlePublicNavClick = () => {
    setActiveRadialMenu(null);
    closeMobileMenuInstantly();
  };

  const handleThemeCycle = () => {
    const currentIndex = THEME_SEQUENCE.indexOf(mode);
    const nextMode = THEME_SEQUENCE[(currentIndex + 1) % THEME_SEQUENCE.length];
    setMode(nextMode);
  };

  const socialItems = useMemo(
    () =>
      socialOrbitSource
        .filter((item) => item?.isActive !== false)
        .sort(
          (a, b) =>
            (a.displayOrder || 0) - (b.displayOrder || 0) ||
            String(a.label || "").localeCompare(String(b.label || ""))
        )
        .map((item) => ({
          key: item.id || item.systemActionKey || item.label,
          label: item.label,
          ariaLabel: item.tooltip || item.label,
          title: item.tooltip || item.label,
          href: item.externalUrl || item.href,
          target: item.openInNewTab === false ? undefined : "_blank",
          rel:
            item.openInNewTab === false ? undefined : "noopener noreferrer",
          icon: getIconComponent(item.iconKey || "FiLink"),
          external: true,
          cursor: "open",
        })),
    [socialOrbitSource]
  );

  const themeItems = useMemo(
    () =>
      themeOrbitSource
        .filter((item) => item?.isActive !== false)
        .sort(
          (a, b) =>
            (a.displayOrder || 0) - (b.displayOrder || 0) ||
            String(a.label || "").localeCompare(String(b.label || ""))
        )
        .map((item) => {
          const themeMode = String(
            item.systemActionKey || item.label || ""
          ).toLowerCase();
          const themeLabel = item.label || "Theme mode";
          const Icon = getIconComponent(item.iconKey || "FiMonitor");

          return {
            key: item.id || themeMode || themeLabel,
            label: themeLabel,
            ariaLabel: item.tooltip || themeLabel,
            title: item.tooltip || themeLabel,
            icon: Icon,
            active: mode === themeMode,
            onClick: () => {
              if (themeMode) {
                setMode(themeMode);
              }
            },
            cursor: "open",
          };
        }),
    [mode, setMode, themeOrbitSource]
  );

  const profileItems = useMemo(() => {
    const visibleItems = profileOrbitSource
      .filter((item) => item?.isActive !== false)
      .filter((item) =>
        isProfileOrbitItemVisible(item, { isAuthenticated, isAdmin })
      )
      .sort(
        (a, b) =>
          (a.displayOrder || 0) - (b.displayOrder || 0) ||
          String(a.label || "").localeCompare(String(b.label || ""))
      );

    const fallbackItems = NAVBAR_ORBIT_PROFILE_DEFAULTS.filter((item) =>
      isProfileOrbitItemVisible(item, { isAuthenticated, isAdmin })
    ).sort(
      (a, b) =>
        (a.displayOrder || 0) - (b.displayOrder || 0) ||
        String(a.label || "").localeCompare(String(b.label || ""))
    );

    const sourceItems = visibleItems.length > 0 ? visibleItems : fallbackItems;

    return sourceItems.map((item) => {
      const actionKey = String(item.systemActionKey || "").toLowerCase();
      const Icon = getIconComponent(item.iconKey || "FiUser");

      if (actionKey === "logout") {
        return {
          key: item.id || actionKey || item.label,
          label: item.label,
          ariaLabel: item.tooltip || item.label,
          title: item.tooltip || item.label,
          icon: Icon,
          danger: true,
          onClick: handleLogout,
          cursor: "open",
        };
      }

      const to =
        item.actionType === NAVBAR_ORBIT_ACTION_TYPES.INTERNAL_ROUTE
          ? item.internalPath || PROFILE_ACTION_ROUTE_MAP[actionKey] || PROFILE_ROUTE
          : PROFILE_ACTION_ROUTE_MAP[actionKey] || PROFILE_ROUTE;

      if (item.actionType === NAVBAR_ORBIT_ACTION_TYPES.EXTERNAL_URL) {
        return {
          key: item.id || actionKey || item.label,
          label: item.label,
          ariaLabel: item.tooltip || item.label,
          title: item.tooltip || item.label,
          href: item.externalUrl || PROFILE_ROUTE,
          target: "_blank",
          rel: "noopener noreferrer",
          icon: Icon,
          cursor: "open",
        };
      }

      return {
        key: item.id || actionKey || item.label,
        label: item.label,
        ariaLabel: item.tooltip || item.label,
        title: item.tooltip || item.label,
        to,
        icon: Icon,
        cursor: "link",
      };
    });
  }, [handleLogout, isAdmin, isAuthenticated, profileOrbitSource]);

  const profileTriggerNode = isAuthenticated ? (
    <span className="nav-action-avatar" aria-hidden="true">
      {profileAvatarUrl ? (
        <img src={getSafeImageUrl(profileAvatarUrl)} alt="" />
      ) : (
        <span>{profileInitial}</span>
      )}
    </span>
  ) : (
    <FiUser size={18} />
  );

  const socialTriggerNode = <FiShare2 size={18} />;
  const themeTriggerNode =
    mode === "dark" ? <FiMoon size={18} /> : mode === "light" ? <FiSun size={18} /> : <FiMonitor size={18} />;

  return (
    <header
      ref={headerRef}
      className={`navbar ${isScrolled ? "navbar-scrolled" : ""}`}
    >
      <div className="navbar-shell">
        <div className="navbar-container">
          <Link
            to="/"
            className="navbar-logo"
            aria-label="Technosthan home"
            onClick={handleLogoClick}
            ref={logoRef}
            data-cursor="open"
          >
            <span className="navbar-logo-mark" aria-hidden="true">
              <FiZap size={18} />
            </span>
            <span className="navbar-logo-copy">
              <strong>Technosthan</strong>
              <span>Enterprise IT Services</span>
            </span>
          </Link>

          <nav className="navbar-nav" aria-label="Main navigation" ref={navRef}>
            <div className="navbar-links">
              {NAV_ITEMS.map((item) => {
                if (item.hasMegaMenu) {
                  return (
                    <div
                      key={item.path}
                      ref={servicesTriggerRef}
                      className={`navbar-link-wrap navbar-link-mega ${
                        isServicesMenuOpen ? "is-open" : ""
                      }`}
                      data-nav-item
                      onMouseEnter={openServicesMenu}
                      onMouseLeave={() => closeServicesMenu(150)}
                      onFocusCapture={openServicesMenu}
                      onBlurCapture={handleServicesBlur}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `navbar-link navbar-link-with-caret ${
                            isActive ? "is-active" : ""
                          }`
                        }
                        aria-haspopup="true"
                        aria-expanded={isServicesMenuOpen}
                        aria-controls="services-mega-menu"
                        onClick={closeDesktopServicesInstantly}
                        onMouseEnter={openServicesMenu}
                        onFocus={openServicesMenu}
                        data-cursor="open"
                      >
                        <span>{item.label}</span>
                        <FiChevronDown
                          className={`navbar-link-caret ${
                            isServicesMenuOpen ? "open" : ""
                          }`}
                        />
                      </NavLink>
                    </div>
                  );
                }

                return (
                  <div key={item.path} className="navbar-link-wrap" data-nav-item>
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `navbar-link ${isActive ? "is-active" : ""}`
                      }
                      data-cursor="link"
                    >
                      {item.label}
                    </NavLink>
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="navbar-actions" ref={actionsRef}>
            <RadialActionMenu
              menuKey="social"
              label="Social media"
              triggerLabel="Open TechnoSthan social media links"
              items={socialItems}
              activeMenu={activeRadialMenu}
              setActiveMenu={setActiveRadialMenu}
              triggerNode={socialTriggerNode}
              triggerActionMode="toggle"
              menuClassName="navbar-radial-action navbar-radial-action--social"
              buttonClassName="nav-action-button--social"
              itemClassName="nav-radial-item--social"
              radius={68}
              ariaControls="social-radial-menu"
            />

            <RadialActionMenu
              menuKey="theme"
              label="Theme modes"
              triggerLabel={`Cycle theme, current ${resolvedMode} mode`}
              items={themeItems}
              activeMenu={activeRadialMenu}
              setActiveMenu={setActiveRadialMenu}
              triggerNode={themeTriggerNode}
              onTriggerClick={handleThemeCycle}
              triggerActionMode="action"
              menuClassName="navbar-radial-action navbar-radial-action--theme"
              buttonClassName="nav-action-button--theme"
              itemClassName="nav-radial-item--theme"
              radius={66}
              ariaControls="theme-radial-menu"
            />

            <RadialActionMenu
              menuKey="profile"
              label="Account actions"
              triggerLabel={
                isAuthenticated
                  ? `Open account actions for ${user?.name || "your profile"}`
                  : "Open account actions"
              }
              items={profileItems}
              activeMenu={activeRadialMenu}
              setActiveMenu={setActiveRadialMenu}
              triggerNode={profileTriggerNode}
              triggerActionMode="toggle"
              menuClassName="navbar-radial-action navbar-radial-action--profile"
              buttonClassName="nav-action-button--profile"
              itemClassName="nav-radial-item--profile"
              radius={72}
              ariaControls="profile-radial-menu"
            />

            <button
              type="button"
              className={`navbar-mobile-toggle ${
                isMobileMenuOpen ? "is-open" : ""
              }`}
              aria-label={
                isMobileMenuOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              onClick={toggleMobileMenu}
              data-action-item
              data-cursor="open"
            >
              {isMobileMenuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {isServicesMenuMounted && (
        <div
          id="services-mega-menu"
          ref={servicesMenuRef}
          className={`services-mega-menu ${isServicesMenuOpen ? "is-open" : ""}`}
          role="dialog"
          aria-label="Services navigation"
          onMouseEnter={openServicesMenu}
          onMouseLeave={() => closeServicesMenu(140)}
        >
          <div className="services-mega-shell">
            <aside className="services-mega-intro">
              <span className="services-mega-kicker">Our Services</span>
              <h3>Premium delivery across product, cloud, security, and AI.</h3>
              <p>
                Explore the core enterprise capabilities powering Technosthan&apos;s
                delivery model.
              </p>

              <div className="services-mega-actions">
                <MagneticButton
                  to="/services"
                  className="services-mega-primary"
                  onClick={() => closeServicesMenu(0)}
                  data-cursor="open"
                >
                  View all services
                  <FiArrowRight />
                </MagneticButton>
                <MagneticButton
                  to="/contact"
                  className="services-mega-secondary"
                  onClick={() => closeServicesMenu(0)}
                  data-cursor="open"
                >
                  Book consultation
                </MagneticButton>
              </div>

              <div className="services-mega-feature">
                <span className="services-mega-feature-label">
                  Featured capability
                </span>
                <div className="services-mega-feature-icon">
                  {renderIcon(featuredService?.iconKey, 18)}
                </div>
                <h4>{featuredService?.title || "Web Development"}</h4>
                <p>
                  {featuredService?.shortDescription ||
                    "Enterprise web platforms built for scale and reliability."}
                </p>
                <MagneticButton
                  to={featuredService?.route || "/services"}
                  className="services-mega-feature-link"
                  onClick={() => closeServicesMenu(0)}
                  data-cursor="view"
                >
                  Explore service
                </MagneticButton>
              </div>
            </aside>

            <div className="services-mega-grid">
              <div className="services-mega-categories" role="tablist" aria-label="Service categories">
                {menuGroups.map((group) => (
                  <button
                    key={group.key}
                    type="button"
                    className={`services-mega-category ${
                      resolvedActiveServiceGroupKey === group.key ? "is-active" : ""
                    }`}
                    onMouseEnter={() => setActiveServiceGroupKey(group.key)}
                    onFocus={() => setActiveServiceGroupKey(group.key)}
                    onClick={() => setActiveServiceGroupKey(group.key)}
                    data-cursor="open"
                  >
                    <span>{group.label}</span>
                    <small>{group.description}</small>
                  </button>
                ))}
              </div>

              <div className="services-mega-panel" role="tabpanel" aria-label={activeServiceGroup?.label}>
                <span className="services-mega-panel-label">
                  {activeServiceGroup?.label}
                </span>
                <p>{activeServiceGroup?.description}</p>
                <div className="services-mega-items">
                  {renderServiceLinks(activeServiceGroup?.items || [], closeDesktopServicesInstantly)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuMounted && (
        <>
          <button
            type="button"
            className="mobile-menu-overlay"
            aria-label="Close mobile menu"
            onClick={handlePublicNavClick}
          />

          <div
            id="mobile-navigation"
            ref={mobileMenuRef}
            className={`mobile-menu ${
              isMobileMenuOpen ? "is-open" : ""
            }`}
          >
            <nav className="mobile-nav" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) =>
                item.hasMegaMenu ? (
                  <div key={item.path} className="mobile-services">
                    <button
                      type="button"
                      className="mobile-nav-link mobile-services-toggle"
                      onClick={toggleMobileServices}
                      aria-expanded={isMobileServicesOpen}
                      aria-controls="mobile-services-panel"
                      data-cursor="open"
                    >
                      <span>{item.label}</span>
                      <FiChevronDown
                        className={`mobile-services-caret ${
                          isMobileServicesOpen ? "open" : ""
                        }`}
                      />
                    </button>

                    <div
                      id="mobile-services-panel"
                      className={`mobile-services-panel ${
                        isMobileServicesOpen ? "is-open" : ""
                      }`}
                    >
                      {menuGroups.map((group) => {
                        const isOpen =
                          resolvedMobileServiceGroupKey === group.key;

                        return (
                          <section key={group.key} className="mobile-services-group">
                            <button
                              type="button"
                              className={`mobile-services-group-trigger ${
                                isOpen ? "is-open" : ""
                              }`}
                              onClick={() => setMobileServiceGroupKey(group.key)}
                              aria-expanded={isOpen}
                              data-cursor="open"
                            >
                              <span>{group.label}</span>
                              <FiChevronDown
                                className={`mobile-services-caret ${
                                  isOpen ? "open" : ""
                                }`}
                              />
                            </button>

                            {isOpen ? (
                              <div className="mobile-services-group-panel">
                                <p>{group.description}</p>
                                {renderServiceLinks(group.items, closeMobileMenuInstantly)}
                              </div>
                            ) : null}
                          </section>
                        );
                      })}
                      <button
                        type="button"
                        className="mobile-services-close"
                        onClick={closeMobileServices}
                      >
                        Close services
                      </button>
                    </div>
                  </div>
                ) : (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `mobile-nav-link ${isActive ? "is-active" : ""}`
                    }
                    onClick={handlePublicNavClick}
                    data-cursor="link"
                  >
                    {item.label}
                  </NavLink>
                )
              )}

              <div className="mobile-nav-actions">
                <ThemeToggle compact className="mobile-theme-toggle" />

                {isAuthenticated ? (
                  <>
                    {accountItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `mobile-nav-link ${isActive ? "is-active" : ""}`
                        }
                        onClick={handlePublicNavClick}
                      >
                        {item.label}
                      </NavLink>
                    ))}
                    <button
                      type="button"
                      className="mobile-logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <MagneticButton
                    type="button"
                    className="mobile-login-btn"
                    onClick={handleLogin}
                  >
                    Login
                  </MagneticButton>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Navbar;
