import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./PortfolioCTA.css";

const PortfolioCTA = () => {
  return (
    <section className="portfolio-cta" data-motion-zone="cta">
      <div className="about-container">
        <div className="portfolio-cta-shell">
          <div>
            <span className="section-badge" data-gsap="fade-up">
              <span className="badge-dot" />
              Next Step
            </span>
            <h2 data-gsap="text-reveal">Have an enterprise product in mind?</h2>
            <p data-gsap="fade-up">
              Let&apos;s align on scope, delivery model, and the outcomes that
              matter most to your business.
            </p>
          </div>

          <div className="portfolio-cta-actions" data-gsap="fade-up">
            <Link to="/contact" className="btn-primary">
              Request Proposal <FiArrowRight />
            </Link>
            <Link to="/services" className="btn-secondary">
              Explore Services
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioCTA;
