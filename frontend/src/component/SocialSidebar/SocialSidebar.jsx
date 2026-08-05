import React, { useState } from "react";
import "./SocialSidebar.css";
import { FaWhatsapp, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaShareAlt } from "react-icons/fa";

const SocialSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className={`social-container ${open ? "active" : ""}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >

      {/* Main Button */}
      <button
        type="button"
        className="main-icon"
        aria-label="Open quick share links"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <FaShareAlt />
      </button>

      {/* Social Icons */}
      <div className="social-icons">
        <a href="https://wa.me/9477288288" target="_blank">
          <FaWhatsapp />
        </a>

        <a href="https://www.linkedin.com/company/technosthan/" target="_blank">
          <FaLinkedin />
        </a>

        <a href="https://instagram.com/technosthan1" target="_blank">
          <FaInstagram />
        </a>

        <a href="mailto:info@technosthan.com">
          <FaEnvelope />
        </a>

        <a href="tel:+919477288288">
          <FaPhone />
        </a>
      </div>

    </div>
  );
};

export default SocialSidebar;
