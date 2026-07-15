import { useState } from "react";
import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiGithub,
  FiLinkedin,
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { subscribe } from "../../api/subscribers.api";
import { PRODUCTS_ROUTE } from "../constants";
import "./footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const footerSections = [
    {
      title: "Services",
      links: [
        "Web Development",
        "Mobile Apps",
        "Cloud Solutions",
        "AI Solutions",
        "Cyber Security",
      ],
    },
    {
      title: "Company",
      links: ["About Us", "Products", "Blog", "Careers", "Contact"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "API Docs", "Support", "Community"],
    },
  ];

  const socialLinks = [
    {
      icon: FiLinkedin,
      url: "https://www.linkedin.com/company/technosthan/",
      label: "LinkedIn",
    },
    {
      icon: FiTwitter,
      url: "https://twitter.com/technosthan",
      label: "Twitter",
    },
    {
      icon: FiGithub,
      url: "https://github.com/technosthan",
      label: "GitHub",
    },
    {
      icon: FiMail,
      url: "mailto:info@technosthan.com",
      label: "Email",
    },
  ];

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await subscribe({ email });
      toast.success(
        "Thank you for subscribing to Technosthan updates."
      );
      setEmail("");
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      if (
        status === 409 ||
        (msg && msg.toLowerCase().includes("already"))
      ) {
        toast.error("This email is already subscribed.");
      } else {
        toast.error("Failed to subscribe. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-glow" />
      <div className="footer-container">
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="footer-logo">
            <span className="logo-icon">⚡</span>
            <h3>Technosthan</h3>
          </div>
          <p className="brand-description">
            Enterprise IT solutions for the modern business
          </p>

          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <button
              className="newsletter-btn"
              onClick={handleSubscribe}
              disabled={loading}
              type="button"
            >
              {loading ? "Subscribing..." : <FiArrowRight size={18} />}
            </button>
          </div>
          <p className="newsletter-text">
            Subscribe to get latest updates and offers
          </p>
        </motion.div>

        <motion.div
          className="footer-links-grid"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {footerSections.map((section) => (
            <div key={section.title} className="footer-section">
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === "Products" ? PRODUCTS_ROUTE : "#"
                      }
                      className="footer-link"
                    >
                      <span className="link-dot" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="footer-contact"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h4>Get in Touch</h4>
          <div className="contact-item">
            <FiPhone size={18} />
            <a href="tel:+919477288288">+91 9477-288-288</a>
          </div>
          <div className="contact-item">
            <FiMail size={18} />
            <a href="mailto:info@technosthan.com">
              info@technosthan.com
            </a>
          </div>
          <div className="contact-item">
            <FiMapPin size={18} />
            <span>
              47/1 New Sanganer Road Sodala Jaipur Rajasthan
            </span>
          </div>
        </motion.div>
      </div>

      <div className="footer-divider" />

      <div className="footer-bottom">
        <motion.p
          className="copyright"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © {currentYear} Technosthan IT Services. All rights reserved.
        </motion.p>

        <motion.div
          className="social-links"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {socialLinks.map(({ icon: Icon, url, label }) => (
            <a
              key={label}
              href={url}
              className="social-link"
              title={label}
            >
              <Icon size={20} />
            </a>
          ))}
        </motion.div>

        <div className="legal-links">
          <a href="#" className="legal-link">
            Privacy Policy
          </a>
          <span className="link-separator">•</span>
          <a href="#" className="legal-link">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
