import { motion } from "framer-motion";
import {
  FiLinkedin,
  FiTwitter,
  FiGithub,
  FiMail,
  FiPhone,
  FiMapPin,
  FiArrowRight,
} from "react-icons/fi";
import "./footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

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
      links: ["About Us", "Portfolio", "Blog", "Careers", "Contact"],
    },
    {
      title: "Resources",
      links: ["Documentation", "Guides", "API Docs", "Support", "Community"],
    },
  ];

  const socialLinks = [
    { icon: FiLinkedin, url: "https://www.linkedin.com/company/technosthan/", label: "LinkedIn" },
    { icon: FiTwitter, url: "https://twitter.com/technosthan", label: "Twitter" },
    { icon: FiGithub, url: "https://github.com/technosthan", label: "GitHub" },
    { icon: FiMail, url: "mailto:info@technosthan.com", label: "Email" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <footer className="footer">
      {/* Background Glow */}
      <div className="footer-glow"></div>

      {/* Main Footer Content */}
      <div className="footer-container">
        {/* Logo & Newsletter Section */}
        <motion.div
          className="footer-brand"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <div className="footer-logo">
            <span className="logo-icon">⚡</span>
            <h3>Technosthan</h3>
          </div>
          <p className="brand-description">
            Enterprise IT solutions for the modern business
          </p>

          {/* Newsletter Signup */}
          <div className="newsletter-form">
            <input
              type="email"
              placeholder="Enter your email"
              className="newsletter-input"
            />
            <motion.button
              className="newsletter-btn"
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiArrowRight size={18} />
            </motion.button>
          </div>
          <p className="newsletter-text">
            Subscribe to get latest updates and offers
          </p>
        </motion.div>

        {/* Footer Links Grid */}
        <motion.div
          className="footer-links-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {footerSections.map((section) => (
            <motion.div
              key={section.title}
              className="footer-section"
              variants={itemVariants}
            >
              <h4>{section.title}</h4>
              <ul>
                {section.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="footer-link">
                      <span className="link-dot"></span>
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="footer-contact"
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <h4>Get in Touch</h4>
          <div className="contact-item">
            <FiPhone size={18} />
            <a href="tel:+1234567890">+91 9477-288-288</a>
          </div>
          <div className="contact-item">
            <FiMail size={18} />
            <a href="mailto:info@technosthan.com">info@technosthan.com</a>
          </div>
          <div className="contact-item">
            <FiMapPin size={18} />
            <span>47/1 New Sanganer Road Sodala Jaipur Rajasthan</span>
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <motion.p
          className="copyright"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          © {currentYear} Technosthan IT Services. All rights reserved.
        </motion.p>

        {/* Social Links */}
        <motion.div
          className="social-links"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {socialLinks.map(({ icon: Icon, url, label }) => (
            <motion.a
              key={label}
              href={url}
              className="social-link"
              title={label}
              variants={itemVariants}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon size={20} />
            </motion.a>
          ))}
        </motion.div>

        {/* Legal Links */}
        <motion.div
          className="legal-links"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a href="#" className="legal-link">
            Privacy Policy
          </a>
          <span className="link-separator">•</span>
          <a href="#" className="legal-link">
            Terms of Service
          </a>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
