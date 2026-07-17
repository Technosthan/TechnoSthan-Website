import { useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiArrowRight,
  FiChevronDown,
  FiMenu,
  FiX,
  FiZap,
} from "react-icons/fi";

import {
  ADMIN_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  PRODUCTS_ROUTE,
} from "../constants";

import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import useServices from "../../features/services/hooks/useServices";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "./ThemeToggle";
import { getIconComponent } from "../utils";
import "./navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] =
    useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] =
    useState(false);

  const navigate = useNavigate();
  const servicesTriggerRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const servicesMenuCloseTimerRef = useRef(null);

  const { isAuthenticated, user, isAdmin } = useAuth();
  const { logoutAndRedirect } = useLogout();
  const { menuGroups, featuredService } = useServices({
    navbarOnly: true,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
      setIsServicesMenuOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      setIsMobileServicesOpen(false);
    }
  }, [isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (servicesMenuCloseTimerRef.current) {
        window.clearTimeout(servicesMenuCloseTimerRef.current);
      }
    };
  }, []);

  const navItems = [
    {
      label: "Home",
      path: "/",
    },
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Services",
      path: "/services",
      hasMegaMenu: true,
    },
    {
      label: "Products",
      path: PRODUCTS_ROUTE,
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ];

  const accountItems = isAdmin
    ? [
        {
          label: "Admin Dashboard",
          to: ADMIN_ROUTE,
        },
        {
          label: "My Profile",
          to: PROFILE_ROUTE,
        },
      ]
    : [
        {
          label: "Dashboard",
          to: DASHBOARD_ROUTE,
        },
        {
          label: "My Profile",
          to: PROFILE_ROUTE,
        },
      ];

  const openServicesMenu = () => {
    if (servicesMenuCloseTimerRef.current) {
      window.clearTimeout(servicesMenuCloseTimerRef.current);
      servicesMenuCloseTimerRef.current = null;
    }

    setIsServicesMenuOpen(true);
  };

  const closeServicesMenu = (delay = 150) => {
    if (servicesMenuCloseTimerRef.current) {
      window.clearTimeout(servicesMenuCloseTimerRef.current);
    }

    servicesMenuCloseTimerRef.current = window.setTimeout(() => {
      setIsServicesMenuOpen(false);
      servicesMenuCloseTimerRef.current = null;
    }, delay);
  };

  const handleServicesBlur = (event) => {
    const nextTarget = event.relatedTarget;
    const isWithinServicesArea =
      servicesTriggerRef.current?.contains(nextTarget) ||
      servicesMenuRef.current?.contains(nextTarget);

    if (!isWithinServicesArea) {
      closeServicesMenu(150);
    }
  };

  const FeaturedIcon = useMemo(
    () => getIconComponent(featuredService?.iconKey),
    [featuredService?.iconKey]
  );

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleMobileServices = () => {
    setIsMobileServicesOpen((current) => !current);
  };

  const handleLogin = () => {
    closeMobileMenu();
    navigate(LOGIN_ROUTE);
  };

  const handleLogout = () => {
    closeMobileMenu();
    logoutAndRedirect(LOGIN_ROUTE);
  };

  return (
    <motion.header
      className={`navbar ${
        isScrolled ? "navbar-scrolled" : ""
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{
        duration: 0.45,
        ease: "easeOut",
      }}
    >
      <div className="navbar-container">
        <Link
          to="/"
          className="navbar-logo"
          aria-label="Technosthan home"
          onClick={closeMobileMenu}
        >
          <motion.div
            className="navbar-logo-content"
            initial={{
              opacity: 0,
              x: -14,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              delay: 0.1,
              duration: 0.35,
            }}
          >
            <span className="logo-icon" aria-hidden="true">
              <FiZap size={18} />
            </span>

            <span className="logo-text">Technosthan</span>
          </motion.div>
        </Link>

        <div className="nav-desktop">
          <nav className="nav-pill" aria-label="Main navigation">
            <div className="nav-links">
              {navItems.map((item, index) => {
                if (item.hasMegaMenu) {
                  return (
                    <motion.div
                      key={item.path}
                      ref={servicesTriggerRef}
                      className={`nav-link-wrapper nav-link-mega-wrapper ${
                        isServicesMenuOpen ? "is-open" : ""
                      }`}
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.12 + index * 0.05,
                        duration: 0.3,
                      }}
                      onMouseEnter={openServicesMenu}
                      onMouseLeave={() => closeServicesMenu(160)}
                      onFocusCapture={openServicesMenu}
                      onBlurCapture={handleServicesBlur}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `nav-link nav-link-with-caret ${
                            isActive ? "nav-link-active" : ""
                          }`
                        }
                        aria-haspopup="true"
                        aria-expanded={isServicesMenuOpen}
                        aria-controls="services-mega-menu"
                        onClick={() => {
                          closeServicesMenu(0);
                        }}
                        onMouseEnter={openServicesMenu}
                        onFocus={openServicesMenu}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") {
                            closeServicesMenu(0);
                          }
                        }}
                      >
                        <span>{item.label}</span>
                        <FiChevronDown
                          className={`nav-link-caret ${
                            isServicesMenuOpen ? "open" : ""
                          }`}
                        />
                      </NavLink>

                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={item.path}
                    className="nav-link-wrapper"
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: 0.12 + index * 0.05,
                      duration: 0.3,
                    }}
                  >
                    <NavLink
                      to={item.path}
                      end={item.path === "/"}
                      className={({ isActive }) =>
                        `nav-link ${
                          isActive ? "nav-link-active" : ""
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
          </nav>

        <div className="navbar-account-area">
          <ThemeToggle className="navbar-theme-toggle" />

            {isAuthenticated ? (
              <AccountMenu
                user={user}
                items={accountItems}
                onLogout={handleLogout}
                triggerLabel="Open account menu"
                triggerClassName="navbar-profile-trigger"
                dropdownClassName="navbar-account-dropdown"
                compact
              />
            ) : (
              <motion.button
                type="button"
                className="navbar-login-btn"
                initial={{
                  opacity: 0,
                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.32,
                  duration: 0.3,
                }}
                whileHover={{
                  scale: 1.04,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                onClick={handleLogin}
              >
                Login
              </motion.button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {isServicesMenuOpen && (
            <motion.div
              id="services-mega-menu"
              ref={servicesMenuRef}
              className="services-mega-menu"
              initial={{
                opacity: 0,
                y: 12,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 10,
                scale: 0.98,
              }}
              transition={{
                duration: 0.18,
                ease: "easeOut",
              }}
              onMouseEnter={openServicesMenu}
              onMouseLeave={() => closeServicesMenu(160)}
            >
              <div className="services-mega-menu-panel">
                <div className="services-mega-menu-grid">
                  <aside className="services-mega-menu-left">
                    <span className="services-mega-menu-kicker">
                      Our Services
                    </span>
                    <h3>
                      Build, scale, and secure your next product
                    </h3>
                    <p>
                      Explore the premium service stack powering our
                      client work across product, cloud, AI, and
                      security.
                    </p>
                    <div className="services-mega-actions">
                      <Link
                        to="/services"
                        className="services-mega-primary"
                        onClick={() => {
                          closeServicesMenu(0);
                        }}
                      >
                        View All Services
                        <FiArrowRight />
                      </Link>
                      <Link
                        to="/contact"
                        className="services-mega-secondary"
                        onClick={() => {
                          closeServicesMenu(0);
                        }}
                      >
                        Book Consultation
                      </Link>
                    </div>

                    <div className="services-mega-feature-card">
                      <span className="services-mega-feature-tag">
                        Featured
                      </span>
                      <div className="services-mega-feature-icon">
                        <FeaturedIcon size={18} />
                      </div>
                      <h4>{featuredService?.title}</h4>
                      <p>
                        {featuredService?.shortDescription}
                      </p>
                      <Link
                        to={featuredService?.route || "/services"}
                        className="services-mega-feature-link"
                        onClick={() => {
                          closeServicesMenu(0);
                        }}
                      >
                        Explore service
                      </Link>
                    </div>

                    <div className="services-mega-cta">
                      <p>Need a custom build?</p>
                      <span>
                        We can scope a solution around your product
                        goals and timeline.
                      </span>
                      <button
                        type="button"
                        className="services-mega-cta-button"
                        onClick={() => {
                          closeServicesMenu(0);
                          navigate("/contact");
                        }}
                      >
                        Start a consultation
                      </button>
                    </div>
                  </aside>

                  <div className="services-mega-menu-right">
                    {menuGroups.map((group) => (
                      <section
                        key={group.label}
                        className="services-mega-group"
                      >
                        <div className="services-mega-group-header">
                          <h4>{group.label}</h4>
                          <p>{group.description}</p>
                        </div>
                        <div className="services-mega-links">
                          {group.items.map((service) => {
                            const ServiceIcon = getIconComponent(
                              service.iconKey
                            );

                            return (
                              <Link
                                key={service.id}
                                to={service.route || "/services"}
                                className="services-mega-link"
                                onClick={() => {
                                  closeServicesMenu(0);
                                }}
                              >
                                <span className="services-mega-link-icon">
                                  <ServiceIcon size={14} />
                                </span>
                                <span className="services-mega-link-copy">
                                  <strong>{service.title}</strong>
                                  <small>
                                    {service.shortDescription}
                                  </small>
                                </span>
                                <FiArrowRight className="services-mega-link-arrow" />
                              </Link>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="navbar-mobile-actions">
          <ThemeToggle compact className="navbar-mobile-theme-toggle" />

          {isAuthenticated ? (
            <AccountMenu
              user={user}
              items={accountItems}
              onLogout={handleLogout}
              triggerLabel="Open account menu"
              triggerClassName="navbar-profile-trigger"
              dropdownClassName="navbar-account-dropdown"
              compact
            />
          ) : (
            <button
              type="button"
              className="mobile-login-btn"
              onClick={handleLogin}
            >
              Login
            </button>
          )}

          <button
            type="button"
            className={`mobile-menu-btn ${
              isMobileMenuOpen
                ? "mobile-menu-btn-active"
                : ""
            }`}
            aria-label={
              isMobileMenuOpen
                ? "Close mobile menu"
                : "Open mobile menu"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() =>
              setIsMobileMenuOpen((previous) => !previous)
            }
          >
            {isMobileMenuOpen ? (
              <FiX size={24} />
            ) : (
              <FiMenu size={24} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              type="button"
              className="mobile-menu-overlay"
              aria-label="Close mobile menu"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.2,
              }}
              onClick={closeMobileMenu}
            />

            <motion.div
              id="mobile-navigation"
              className="mobile-menu open"
              initial={{
                opacity: 0,
                y: -16,
                height: 0,
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: "auto",
              }}
              exit={{
                opacity: 0,
                y: -12,
                height: 0,
              }}
              transition={{
                duration: 0.28,
                ease: "easeOut",
              }}
            >
              <nav
                className="mobile-nav-links"
                aria-label="Mobile navigation"
              >
                {navItems.map((item, index) => (
                  item.hasMegaMenu ? (
                    <motion.div
                      key={item.path}
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                      className="mobile-services-accordion"
                    >
                      <button
                        type="button"
                        className={`mobile-nav-link mobile-services-toggle ${
                          isMobileServicesOpen
                            ? "mobile-nav-link-active"
                            : ""
                        }`}
                        onClick={toggleMobileServices}
                        aria-expanded={isMobileServicesOpen}
                        aria-controls="mobile-services-panel"
                      >
                        <span>{item.label}</span>
                        <FiChevronDown
                          className={`mobile-services-caret ${
                            isMobileServicesOpen ? "open" : ""
                          }`}
                        />
                      </button>

                      <AnimatePresence>
                        {isMobileServicesOpen && (
                          <motion.div
                            id="mobile-services-panel"
                            className="mobile-services-panel"
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              duration: 0.2,
                              ease: "easeOut",
                            }}
                          >
                            {menuGroups.map((group) => (
                              <div
                                key={group.label}
                                className="mobile-services-group"
                              >
                                <span className="mobile-services-group-title">
                                  {group.label}
                                </span>
                                <div className="mobile-services-links">
                                  {group.items.map((service) => (
                                    <Link
                                      key={service.id}
                                      to={
                                        service.route ||
                                        "/services"
                                      }
                                      className="mobile-services-link"
                                      onClick={closeMobileMenu}
                                    >
                                      <span>{service.title}</span>
                                      <FiArrowRight />
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={item.path}
                      initial={{
                        opacity: 0,
                        x: -12,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: index * 0.04,
                      }}
                    >
                      <NavLink
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `mobile-nav-link ${
                            isActive
                              ? "mobile-nav-link-active"
                              : ""
                          }`
                        }
                        onClick={closeMobileMenu}
                      >
                        {item.label}
                      </NavLink>
                    </motion.div>
                  )
                ))}

                {isAuthenticated && (
                  <div className="mobile-account-links">
                    <div className="mobile-menu-divider" />

                    {accountItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                          `mobile-nav-link ${
                            isActive
                              ? "mobile-nav-link-active"
                              : ""
                          }`
                        }
                        onClick={closeMobileMenu}
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
                  </div>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
