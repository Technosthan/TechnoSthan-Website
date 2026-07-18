import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import { getServices } from "../../../api/services.api";
import { getIconComponent } from "../../../shared/utils";
import "./ServiceGrid.css";

const ServiceGrid = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setServices(response.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="service-grid-section">
      <div className="about-container">
        <div className="section-header service-grid-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Service Portfolio
          </span>
          <h2>Enterprise Services and Capability Areas</h2>
          <p>
            Our service catalog is structured to support enterprise software,
            cloud, security, AI, and long-term digital transformation
            engagements.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="glass-card service-card">
              <span className="service-pill">{service.category}</span>
              <div className="service-icon">
                {(() => {
                  const Icon = getIconComponent(service.iconKey);
                  return <Icon />;
                })()}
              </div>
              <h3>{service.title}</h3>
              <p>{service.shortDescription || service.description}</p>
              <button
                onClick={() => navigate("/contact")}
                className="service-btn"
                type="button"
              >
                Discuss this service <FiArrowRight size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
