import "./ServicesHero.css";
import { useNavigate } from "react-router-dom";

const ServicesHero = () => {
  const navigate = useNavigate();
  return (
    <section className="services-hero">
      <div className="about-container">
        <span className="section-badge">Our Services</span>

        <h1>
          Transforming Ideas Into
          <br />
          Scalable Digital Products
        </h1>

        <p>
          We help startups, SMEs and enterprises build powerful software
          solutions, cloud infrastructure, AI automation systems and modern
          digital platforms.
        </p>

        <div className="services-hero-buttons">
          <button onClick={() => navigate("/contact")} className="btn-primary">
            Get Free Consultation
          </button>

          <button onClick={() => navigate("/products")} className="btn-secondary">
            View Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesHero;
