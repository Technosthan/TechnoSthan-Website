import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="site-container footer-container">
        <div className="footer-section footer-section--brand">
          <h2>TechnoSthan</h2>
          <p>
            Innovation Tomorrow. Building Digital Excellence. We help
            businesses grow with modern web, cloud and digital solutions.
          </p>
        </div>

        <div className="footer-section">
          <h3>Company</h3>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-and-conditions">Terms & Conditions</Link>
          <Link to="/data-deletion">Data Deletion</Link>
        </div>

        <div className="footer-section">
          <h3>Verticals</h3>
          <Link to="/services/technosthan-hospitality">
            TechnoSthan Hospitality
          </Link>
          <a href="https://ih.technosthan.com/" target="_blank" rel="noreferrer">
            TechnoSthan Innovations Hub
          </a>
          <a
            href="https://agritech.technosthan.com"
            target="_blank"
            rel="noreferrer"
          >
            TechnoSthan AgriTech
          </a>
          <a
            href="https://it.technosthan.com"
            target="_blank"
            rel="noreferrer"
          >
            TechnoSthan IT Services
          </a>
        </div>

        <address className="footer-section footer-section--contact">
          <h3>Contact</h3>
          <p>
            Email:{" "}
            <a href="mailto:info@technosthan.com">info@technosthan.com</a>
          </p>
          <p>
            Phone: <a href="tel:+919477288288">+91 9477-288-288</a>
          </p>
          <p>47/1 New Sanganer Road Sodala Jaipur Rajasthan</p>
        </address>
      </div>

      <div className="site-container footer-bottom">
        <p className="copyright">© 2026 TechnoSthan. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
