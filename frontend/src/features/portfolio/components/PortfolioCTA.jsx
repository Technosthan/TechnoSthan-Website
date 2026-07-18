import { Link } from "react-router-dom";
import "./PortfolioCTA.css";

const PortfolioCTA = () => {
  return (
    <section className="portfolio-cta">
      <div className="about-container">
        <h2>Have an enterprise product in mind?</h2>
        <p>
          Let&apos;s align on scope, delivery model, and the outcomes that
          matter most to your business.
        </p>
        <div className="portfolio-cta-actions">
          <Link to="/contact" className="btn-primary">
            Request Proposal
          </Link>
          <Link to="/services" className="btn-secondary">
            Explore Services
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortfolioCTA;
