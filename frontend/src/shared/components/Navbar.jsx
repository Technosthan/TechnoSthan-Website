import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";

import {
  ADMIN_ROUTE,
  DASHBOARD_ROUTE,
  LOGIN_ROUTE,
  PROFILE_ROUTE,
  PRODUCTS_ROUTE,
} from "../constants";

import useAuth from "../hooks/useAuth";
import useLogout from "../hooks/useLogout";
import AccountMenu from "./AccountMenu";
import ThemeToggle from "./ThemeToggle";
import "./navbar.css";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  const navigate = useNavigate();

  const { isAuthenticated, user, isAdmin } = useAuth();
  const { logoutAndRedirect } = useLogout();

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

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
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
              ⚡
            </span>

            <span className="logo-text">Technosthan</span>
          </motion.div>
        </Link>

        <div className="nav-desktop">
          <nav
            className="nav-pill"
            aria-label="Main navigation"
          >
            <div className="nav-links">
              {navItems.map((item, index) => (
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
              ))}
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
