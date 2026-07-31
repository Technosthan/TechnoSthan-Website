import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./ServicesCTA.css";

const ServicesCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="services-cta" data-motion-zone="cta">
      <div className="services-cta-shell">
        <div className="services-cta-copy">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Consultation
          </span>
          <h2 data-gsap="text-reveal">Ready to plan your next enterprise move?</h2>
          <p data-gsap="fade-up">
            Let&apos;s map the scope, shape the right team, and define a delivery
            path that feels realistic from day one.
          </p>
        </div>

        <div className="services-cta-panel" data-gsap="fade-up">
          <div className="services-cta-chip">Strategy</div>
          <div className="services-cta-chip">Build</div>
          <div className="services-cta-chip">Support</div>

          <div className="services-cta-actions">
            <button
              className="btn-primary"
              onClick={() => navigate("/contact")}
              type="button"
              data-motion-focus="cta"
            >
              Book consultation
              <FiArrowRight size={16} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate("/contact")}
              type="button"
              data-motion-focus="cta"
            >
              Discuss project
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesCTA;
