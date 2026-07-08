import { Link } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { Globe, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="footer-shell">
      <div className="container footer-grid">
        <div className="footer-card">
          <h3 className="gradient-text">TechnoSthan Innovation Hub</h3>
          <p>
            R&D, technical training, workshops, internships, and innovation
            support for students and founders.
          </p>
          <p className="footer-note">Learn. Innovate. Build. Transform.</p>
        </div>

        <div className="footer-card">
          <h4>Programs</h4>
          <ul className="footer-links">
            <li>Full Stack Development</li>
            <li>AI & Machine Learning</li>
            <li>Embedded Systems & IoT</li>
            <li>Robotics</li>
            <li>Cyber Security</li>
          </ul>
        </div>

        <div className="footer-card">
          <h4>Quick Links</h4>
          <ul className="footer-links">
            <li>
              <Link to={ROUTES.HOME}>Home</Link>
            </li>
            <li>
              <Link to={ROUTES.PROGRAMS}>Programs</Link>
            </li>
            <li>
              <Link to={ROUTES.RD_SERVICES}>R&D</Link>
            </li>
            <li>
              <Link to={ROUTES.STARTUP_SUPPORT}>Startup Support</Link>
            </li>
            <li>
              <Link to={ROUTES.CONTACT}>Contact</Link>
            </li>
          </ul>
        </div>

        <div className="footer-card">
          <h4>Contact</h4>
          <ul className="footer-links contact-list">
            <li>
              <Phone size={16} /> +91 94777-288-288
            </li>
            <li>
              <Mail size={16} /> info@technosthan.com
            </li>
            <li>
              <MapPin size={16} /> 47/1 New Sanganer Road, Sodala, Jaipur,
              Rajasthan
            </li>
            <li>
              <Globe size={16} />
              <a
                href="https://www.technosthan.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.technosthan.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 TechnoSthan Innovation Hub. All rights reserved.</span>
        <div className="footer-bottom-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
