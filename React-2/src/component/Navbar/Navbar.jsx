import React, { useEffect, useState } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import {
  getDashboardPath,
  getStoredToken,
  getStoredUser,
  normalizeRole,
} from "../../utils/auth";
import { performCentralLogout } from "../../lib/sessionTimeout";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const readAuthState = () => {
    const user = getStoredUser();
    const token = getStoredToken();
    return token && user ? user : null;
  };

  useEffect(() => {
    const syncAuthState = () => {
      setCurrentUser(readAuthState());
    };

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("auth-change", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("auth-change", syncAuthState);
    };
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleClick = () => {
    setMenuOpen(false);
    setShowProfileMenu(false);
  };

  const handleLogout = async () => {
    await performCentralLogout({
      reason: "logout",
      message: "",
    });
    setCurrentUser(null);
    setShowProfileMenu(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const avatarLabel = (currentUser?.name || "U").trim().charAt(0).toUpperCase();
  const currentRole = normalizeRole(currentUser?.role);
  const dashboardPath = currentUser
    ? getDashboardPath(currentRole)
    : "/dashboard";

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <img src={logo} alt="TechnoSthan Logo" />
      </Link>

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        Menu
      </div>

      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link
          to="/"
          onClick={handleClick}
          className={isActive("/") ? "active" : ""}
        >
          Home
        </Link>

        <Link
          to="/about"
          onClick={handleClick}
          className={isActive("/about") ? "active" : ""}
        >
          About
        </Link>

        <Link
          to="/services"
          onClick={handleClick}
          className={isActive("/services") ? "active" : ""}
        >
          Our Verticals
        </Link>

        <Link
          to="/contact"
          onClick={handleClick}
          className={isActive("/contact") ? "active" : ""}
        >
          Contact
        </Link>

        {/* <Link
          to="/social"
          onClick={handleClick}
          className={isActive("/social") ? "active" : ""}
        >
          Social Post
        </Link> */}

        <Link
          to={dashboardPath}
          onClick={handleClick}
          className={
            isActive("/dashboard") ||
            isActive("/admin") ||
            isActive("/hr") ||
            location.pathname.startsWith("/admin/") ||
            location.pathname.startsWith("/hr/")
              ? "active"
              : ""
          }
        >
          Dashboard
        </Link>

        {!currentUser && (
          <div className="mobile-auth">
            <Link to="/register" onClick={handleClick}>
              Signup
            </Link>
            <Link to="/login" onClick={handleClick}>
              Login
            </Link>
          </div>
        )}

        {currentUser && (
          <div className="mobile-auth logged-in">
            <span className="mobile-user-name">{currentUser.name}</span>
            <button
              type="button"
              className="mobile-logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="auth-buttons">
        {!currentUser ? (
          <>
            <Link to="/register" className="signup-btn">
              Signup
            </Link>
            <Link to="/login" className="login-btn">
              Login
            </Link>
          </>
        ) : (
          <div className="profile-menu-wrap">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            >
              <span className="profile-avatar">{avatarLabel}</span>
              <span className="profile-name">{currentUser.name}</span>
            </button>

            {showProfileMenu && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-user">{currentUser.email}</div>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;