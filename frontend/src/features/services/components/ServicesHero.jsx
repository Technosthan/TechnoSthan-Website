import "./ServicesHero.css";
import { useNavigate } from "react-router-dom";

const ServicesHero = () => {
  const navigate = useNavigate();
  return (
    <section className="services-hero">
      <div className="about-container">
        <span className="section-badge">Enterprise Services</span>

        <h1>
          Transforming Operations Into
          <br />
          Scalable Enterprise Platforms
        </h1>

        <p>
          We help organizations modernize software, cloud infrastructure,
          AI, security, and digital operations with a delivery model built
          for enterprise confidence.
        </p>

        <div className="services-hero-buttons">
          <button onClick={() => navigate("/contact")} className="btn-primary">
            Book Enterprise Consultation
          </button>

          <button onClick={() => navigate("/products")} className="btn-secondary">
            Explore Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
