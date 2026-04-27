import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const readAuthState = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const token = localStorage.getItem("token");
      return token && user ? user : null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    const user = readAuthState();
    setCurrentUser(user);
    if (user && user.role === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    const onStorageChange = () => {
      const latestUser = readAuthState();
      setCurrentUser(latestUser);
      setIsAdmin(latestUser?.role === "admin");
    };

    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  //  active link helper
  const isActive = (path) => location.pathname === path;

  //  mobile menu close
  const handleClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setShowProfileMenu(false);
    setMenuOpen(false);
    navigate("/login");
  };

  const avatarLabel = (currentUser?.name || "U").trim().charAt(0).toUpperCase();

  return (
    <nav className="navbar">

      {/* LOGO (clickable) */}
      <Link to="/" className="logo">
        <img src={logo} alt="TechnoSthan Logo" />
      </Link>

      {/* MENU ICON */}
      <div
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* NAV LINKS */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>

        <Link to="/" onClick={handleClick} className={isActive("/") ? "active" : ""}>
          Home
        </Link>

        <Link to="/about" onClick={handleClick} className={isActive("/about") ? "active" : ""}>
          About
        </Link>

        <Link to="/services" onClick={handleClick}>
          Our Verticals
        </Link>

        <Link to="/contact" onClick={handleClick} className={isActive("/contact") ? "active" : ""}>
          Contact
        </Link>

         <Link to="/social" onClick={handleClick} className={isActive("/social") ? "active" : ""}>
           Social Post
        </Link> 
        
         {/* <Link to="/social" onClick={handleClick} className={isActive("/social-old") ? "active" : ""}>
           Social old
        </Link> */}
                {/* <Link to="/socialform2" onClick={handleClick} className={isActive("/socialform") ? "active" : ""}>
           SocialForm2 Post
        </Link> */}
        
{/* 
        <Link to="/explore" onClick={handleClick} className={isActive("/explore") ? "active" : ""}>
          🔍 Search
        </Link> */}

        {isAdmin && (
          <Link to="/admin" className="admin-link" onClick={handleClick}>
            ⚡ Admin
          </Link>
        )}

        {!currentUser && (
          <div className="mobile-auth">
            <Link to="/register" onClick={handleClick}>Signup</Link>
            <Link to="/login" onClick={handleClick}>Login</Link>
          </div>
        )}

        {currentUser && (
          <div className="mobile-auth logged-in">
            <span className="mobile-user-name">{currentUser.name}</span>
            <button type="button" className="mobile-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}

      </div>

      {/* DESKTOP BUTTON */}
      <div className="auth-buttons">
        {!currentUser ? (
          <>
            <Link to="/register" className="signup-btn">Signup</Link>
            <Link to="/login" className="login-btn">Login</Link>
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
                <button type="button" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>

    </nav>
  );
};

export default Navbar;