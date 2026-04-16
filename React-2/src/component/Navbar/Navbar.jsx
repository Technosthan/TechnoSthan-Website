import React, { useState } from "react";
import "./Navbar.css";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">

      {/* LOGO */}
      <div className="logo">
        <img src={logo} alt="TechnoSthan Logo" />
      </div>

      {/* MENU ICON (mobile only) */}
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* NAV LINKS */}
      <div className={`nav-links ${menuOpen ? "active" : ""}`}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/services">Our Verticals</Link>
        <Link to="/contact">Contact</Link>

      
      </div>

      {/* DESKTOP BUTTONS */}
      <div className="auth-buttons">
        <Link to="/login" className="login-btn">Login</Link>
        {/* <Link to="/register" className="signup-btn">Sign up</Link> */}
      </div>

    </nav>
  );
};

export default Navbar;