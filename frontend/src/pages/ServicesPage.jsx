import React from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./ServicesPage.css";

import agritechIcon from "../assets/agri.png";
import innovationIcon from "../assets/innovation.png";
import itIcon from "../assets/it.png";
import hospitalityIcon from "../assets/hospitality.png";

const ServicesPage = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "TECHNOSTHAN HOSPITALITY",
      path: "/services/technosthan-hospitality",
      desc: "Advanced hospitality platforms, booking systems, and management tools for hotels and resorts.",
      icon: hospitalityIcon,
    },
    {
      title: "TECHNOSTHAN INNOVATIONS HUB",
      path: "https://ih.technosthan.com/",
      external: true,
      desc: "Product innovation, custom application development, and digital transformation solutions.",
      icon: innovationIcon,
    },
    {
      title: "TECHNOSTHAN AGRITECH",
      path: "https://agritech.technosthan.com",
      external: true,
      desc: "Smart agri-tech solutions, farm automation, and data-driven agricultural growth services.",
      icon: agritechIcon,
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      path: "https://it.technosthan.com/",
      external: true, 
      desc: "Comprehensive IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
      icon: itIcon,
    },
  ];

  const handleNavigation = (service) => {
    if (service.external) {
      window.location.href = service.path; // same tab/window
      return;
    }

    navigate(service.path);
  };

  return (
    <section className="services-page">
      <Helmet>
        <title>Our Business Services | TechnoSthan</title>
      </Helmet>

      <div className="services-container">
        <h1 className="section-title">
          Our Business Services
        </h1>

        <div className="services-grid">
          {services.map((service, index) => (
            <div
              key={index}
              className="service-card"
              onClick={() => handleNavigation(service)}
            >
              <img
                src={service.icon}
                alt={service.title}
                className="service-icon"
              />

              <h2>{service.title}</h2>

              <p>{service.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesPage;