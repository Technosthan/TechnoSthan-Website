import { FiCheck } from "react-icons/fi";
import "./PricingModels.css";

const pricingModels = [
  {
    title: "Fixed Price",
    description:
      "Best for projects with clearly defined requirements and timelines.",
    features: ["Defined Scope", "Fixed Budget", "Predictable Delivery"],
  },
  {
    title: "Dedicated Team",
    description:
      "Hire a dedicated development team for long-term projects.",
    features: ["Full-Time Resources", "Monthly Billing", "Scalable Team"],
  },
  {
    title: "Hourly Engagement",
    description:
      "Flexible model for consulting, maintenance and support.",
    features: ["Pay As You Go", "Flexible Scope", "Quick Start"],
  },
];

const PricingModels = () => {
  return (
    <section className="pricing-section" data-motion-zone="statistics">
      <div className="about-container">
        <div className="section-header pricing-header">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Engagement Models
          </span>
          <h2 data-gsap="text-reveal">Flexible engagement models with enterprise clarity</h2>
          <p data-gsap="fade-up" className="pricing-subtitle">
            Collaboration options tailored to enterprise initiatives, product
            builds, and long-term support.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingModels.map((model, index) => (
            <article
              key={model.title}
              className="glass-card pricing-card"
              data-gsap-stagger
              data-motion-focus="pricing"
            >
              <span className="pricing-index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{model.title}</h3>
              <p>{model.description}</p>
              <ul>
                {model.features.map((feature) => (
                  <li key={feature}>
                    <FiCheck /> {feature}
                  </li>
                ))}
              </ul>
              <button className="btn-primary" type="button" data-motion-focus="cta">
                Get Proposal
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingModels;
