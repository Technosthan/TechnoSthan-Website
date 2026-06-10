import "./ServiceGrid.css";

import { services } from "../data/sampleData";

const ServiceGrid = () => {
  return (
    <section className="service-grid-section">
      <div className="about-container">
        <h2>Solutions We Offer</h2>
        <div className="service-icon">{services[0].icon}</div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="glass-card service-card">
              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <button className="service-btn">Learn More →</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
