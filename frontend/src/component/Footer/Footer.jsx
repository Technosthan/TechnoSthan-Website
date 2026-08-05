import React from "react";
import { Link } from "react-router-dom";
import { siteBrand } from "../../bhoomi/data";

const footerGroups = {
  Company: [
    { label: "About Us", to: "/about" },
    { label: "Leadership", to: "/about" },
    { label: "Our Approach", to: "/what-we-do" },
    { label: "Careers", to: "/contact" },
    { label: "Contact", to: "/contact" },
  ],
  Capabilities: [
    { label: "Real Estate Development", to: "/real-estate-development" },
    { label: "EPC and Construction", to: "/services/infrareach-epc" },
    { label: "Smart Cities", to: "/services/infrareach-smart-cities" },
    { label: "Industrial Parks", to: "/services/infrareach-industrial-parks" },
    { label: "Renewable Energy", to: "/services/infrareach-renewable-energy" },
    { label: "Asset Management", to: "/services/infrareach-asset-management" },
  ],
  Projects: [
    { label: "Featured Projects", to: "/projects" },
    { label: "Current Projects", to: "/projects" },
    { label: "Completed Projects", to: "/projects?status=Completed" },
    { label: "Government Projects", to: "/government-and-institutional-projects" },
  ],
  Resources: [
    { label: "Government Tenders", to: "/government-and-institutional-projects" },
    { label: "Partnerships", to: "/partnerships" },
    { label: "News and Insights", to: "/news-and-insights" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms and Conditions", to: "/terms-and-conditions" },
  ],
};

const Footer = () => {
  return (
    <footer className="bhoomi-footer">
      <div className="site-container bhoomi-footer__grid">
        <div className="bhoomi-footer__brand">
          <div className="bhoomi-brand techno-brand">
            <span className="bhoomi-brand__mark techno-brand__mark">TI</span>
            <span className="bhoomi-brand__text techno-brand__text">
              <strong>{siteBrand.name}</strong>
              <small>{siteBrand.statement}</small>
            </span>
          </div>
          <p>{siteBrand.description}</p>
          <span className="bhoomi-footer__eyebrow">{siteBrand.businessVertical}</span>
          <div className="nav-drawer__footer" style={{ marginTop: 16 }}>
            <Link className="btn btn--primary" to="/contact">
              Start a Conversation
            </Link>
          </div>
        </div>

        {Object.entries(footerGroups).map(([group, items]) => (
          <div className="bhoomi-footer__column" key={group}>
            <h3>{group}</h3>
            {items.map((item) => (
              <Link key={item.label} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        ))}

        <address className="bhoomi-footer__contact">
          <h3>Contact</h3>
          <p>
            Email: <a href={`mailto:${siteBrand.contact.email}`}>{siteBrand.contact.email}</a>
          </p>
          <p>
            Phone: <a href={`tel:${siteBrand.contact.phone}`}>{siteBrand.contact.phone}</a>
          </p>
          <p>{siteBrand.contact.address}</p>
          <div className="bhoomi-footer__legal">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms and Conditions</Link>
            <Link to="/disclaimer">Disclaimer</Link>
          </div>
        </address>
      </div>

      <div className="site-container bhoomi-footer__bottom">
        <p>© 2026 {siteBrand.name}. All rights reserved.</p>
        <p>{siteBrand.businessVertical}</p>
      </div>
    </footer>
  );
};

export default Footer;
