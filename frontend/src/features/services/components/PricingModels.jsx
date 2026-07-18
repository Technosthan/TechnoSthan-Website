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
    <section className="pricing-section">
      <div className="about-container">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Engagement Models
          </span>
          <h2>Flexible engagement models</h2>
          <p className="pricing-subtitle">
            Collaboration options tailored to enterprise initiatives, product
            builds, and long-term support.
          </p>
        </div>

        <div className="pricing-grid">
          {pricingModels.map((model) => (
            <div key={model.title} className="glass-card pricing-card">
              <h3>{model.title}</h3>
              <p>{model.description}</p>
              <ul>
                {model.features.map((feature) => (
                  <li key={feature}>✓ {feature}</li>
                ))}
              </ul>
              <button className="btn-primary">Get Proposal</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingModels;
