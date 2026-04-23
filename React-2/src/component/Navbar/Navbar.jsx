import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { Link, useLocation } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "admin") {
      setIsAdmin(true);
    }
  }, []);

  //  active link helper
  const isActive = (path) => location.pathname === path;

  //  mobile menu close
  const handleClick = () => {
    setMenuOpen(false);
  };

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

        {/* MOBILE LOGIN */}
        {/* <div className="mobile-auth">
          <Link to="/login" onClick={handleClick}>Login</Link>
        </div> */}

      </div>

      {/* DESKTOP BUTTON */}
      <div className="auth-buttons">
        <Link to="/login" className="login-btn">Login</Link>
      </div>

    </nav>
  );
};

export default Navbar;