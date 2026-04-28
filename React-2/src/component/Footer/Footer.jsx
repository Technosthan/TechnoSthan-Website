import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Logo + About */}
        <div className="footer-section">
          <h2>TechnoSthan</h2>
          <p>
            Innovation Tomorrow. Building Digital Excellence.
            We help businesses grow with modern web, cloud and digital solutions.
          </p>
        </div>

        {/* Company Links */}
        <div className="footer-section">
          <h3>Company</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
        </div>

        {/* Services */}
        <div className="footer-section">
          <h3>Verticals</h3>
          <Link to="/services/technosthan-hospitality">TechnoSthan Hospitality</Link>
          <Link to="/services/technosthan-innovations-hub">TechnoSthan Innovations Hub</Link>
          <Link to="/services/technosthan-agritech">TechnoSthan AgriTech</Link>
          <Link to="/services/technosthan-it-services">TechnoSthan IT Services</Link>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3>Contact</h3>
          <p>
            Email:{" "}
            <a href="mailto:info@technosthan.com">
              info@technosthan.com

            </a>
            </p>
          <p>
            Phone:{" "}
            <a href="tel:+919477288288">
             +91 9477-288-288
            </a>
            </p>
          <p>India</p>
        </div>

      </div>

      {/* Bottom */}
      <p className="copyright">
        © 2026 TechnoSthan. All rights reserved.
      </p>

    </footer>
  );
};

export default Footer;