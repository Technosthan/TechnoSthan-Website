import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () =>
      window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Products", path: PRODUCTS_ROUTE },
    { label: "Contact", path: "/contact" },
  ];

  const accountItems = isAdmin
    ? [
        { label: "Admin Dashboard", to: ADMIN_ROUTE },
        { label: "My Profile", to: PROFILE_ROUTE },
      ]
    : [
        { label: "Dashboard", to: DASHBOARD_ROUTE },
        { label: "My Profile", to: PROFILE_ROUTE },
      ];

  return (
    <motion.nav
      className={`navbar ${isScrolled ? "scrolled" : ""}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="logo-icon">⚡</span>
            Technosthan
          </motion.div>
        </Link>

        <div className="nav-desktop">
          <div className="nav-links">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <Link to={item.path} className="nav-link">
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </div>

          {isAuthenticated ? (
            <AccountMenu
              user={user}
              items={accountItems}
              onLogout={() =>
                logoutAndRedirect(LOGIN_ROUTE)
              }
              triggerLabel="Open account menu"
              triggerClassName="navbar-profile-trigger"
              dropdownClassName="navbar-account-dropdown"
              compact
            />
          ) : (
            <motion.button
              type="button"
              className="btn-primary navbar-cta"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(LOGIN_ROUTE)}
            >
              Login
            </motion.button>
          )}
        </div>

        <div className="navbar-mobile-actions">
          {isAuthenticated ? (
            <AccountMenu
              user={user}
              items={accountItems}
              onLogout={() =>
                logoutAndRedirect(LOGIN_ROUTE)
              }
              triggerLabel="Open account menu"
              triggerClassName="navbar-profile-trigger"
              dropdownClassName="navbar-account-dropdown"
              compact
            />
          ) : null}

          <button
            type="button"
            className="mobile-menu-btn"
            aria-label={
              isMobileMenuOpen
                ? "Close mobile menu"
                : "Open mobile menu"
            }
            aria-expanded={isMobileMenuOpen}
            onClick={() =>
              setIsMobileMenuOpen(!isMobileMenuOpen)
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

      <motion.div
        className={`mobile-menu ${
          isMobileMenuOpen ? "open" : ""
        }`}
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? "auto" : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="mobile-nav-links">
          {navItems.map((item) => (
            <motion.div
              key={item.path}
              whileHover={{ x: 8 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Link
                to={item.path}
                className="mobile-nav-link"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            </motion.div>
          ))}

          {!isAuthenticated ? (
            <motion.button
              type="button"
              className="btn-primary mobile-cta"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setIsMobileMenuOpen(false);
                navigate(LOGIN_ROUTE);
              }}
            >
              Login
            </motion.button>
          ) : (
            <div className="mobile-account-links">
              {accountItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="mobile-nav-link"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <button
                type="button"
                className="btn-secondary mobile-cta mobile-logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logoutAndRedirect(LOGIN_ROUTE);
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
