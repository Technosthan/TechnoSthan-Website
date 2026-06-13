import { useEffect, useState } from "react";

import "./ServiceGrid.css";

import { getServices } from "../../../api/services.api";

import { useNavigate } from "react-router-dom";

const ServiceGrid = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();

        setServices(response.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="service-grid-section">
      <div className="about-container">
        <h2>Solutions We Offer</h2>

        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="glass-card service-card">
              <h3>{service.title}</h3>

              <p>{service.description}</p>

              <button
                onClick={() => navigate("/contact")}
                className="service-btn"
              >
                Learn More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
