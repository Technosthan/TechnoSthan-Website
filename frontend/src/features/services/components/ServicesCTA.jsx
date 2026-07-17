import { useNavigate } from "react-router-dom";
import "./ServicesCTA.css";

const ServicesCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="services-cta">
      <div className="services-cta-box">
        <div className="services-cta-copy">
          <span className="section-badge">
            <span className="badge-dot" />
            Consultation
          </span>
          <h2>Ready to build your next product?</h2>
          <p>
            Let&apos;s discuss your goals, scope the right approach, and create
            a clear plan for delivery.
          </p>
        </div>

        <div className="services-cta-buttons">
          <button
            className="btn-primary"
            onClick={() => navigate("/contact")}
            type="button"
          >
            Book Consultation
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/contact")}
            type="button"
          >
            Discuss Project
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/contact")}
            type="button"
          >
            Get Quote
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesCTA;
