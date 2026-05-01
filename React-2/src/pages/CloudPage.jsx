import React from "react";
import { motion } from "framer-motion";
import "./CloudPage.css";

// 🔥 DYNAMIC DATA
const cloudServicesData = [
  {
    id: "cloud",
    title: "Cloud Solutions",
    icon: "https://cdn-icons-png.flaticon.com/512/4144/4144748.png",
    description: "Scale your infrastructure seamlessly."
  },
  {
    id: "ai",
    title: "Artificial Intelligence",
    icon: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png",
    description: "AI-driven automation systems."
  },
  {
    id: "saas",
    title: "SaaS Platforms",
    icon: "https://cdn-icons-png.flaticon.com/512/2721/2721297.png",
    description: "Build and manage software services."
  },
  {
    id: "haas",
    title: "HaaS",
    icon: "https://cdn-icons-png.flaticon.com/512/1046/1046876.png",
    description: "Managed hardware solutions."
  },
  {
    id: "iaas",
    title: "IaaS",
    icon: "https://cdn-icons-png.flaticon.com/512/4149/4149671.png",
    description: "Scalable infrastructure power."
  },
  {
    id: "paas",
    title: "PaaS",
    icon: "https://cdn-icons-png.flaticon.com/512/906/906324.png",
    description: "Fast application development."
  }
];

const CloudPage = () => {
  return (
    <div className="services-container">

      {/* 🔥 HERO SECTION */}
      <section className="cloud-hero">
        <motion.div
          className="hero-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1>Cloud & Advanced Infrastructure</h1>

          <p>
            Empower your business with scalable cloud solutions, AI-powered systems, 
            and modern infrastructure designed for performance and growth.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">Get Started</button>
            <button className="secondary-btn">Explore Services</button>
          </div>
        </motion.div>
      </section>

      {/* HEADER */}
      <div className="services-header">
        <h2>Our Specialized Cloud Verticals</h2>
        <p>Explore our advanced infrastructure services.</p>
      </div>

      {/* SERVICES GRID */}
      <div className="services-grid">
        {cloudServicesData.map((service, index) => (
          <motion.div
            key={service.id}
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <div className="card-icon-frame">
              <img
                src={service.icon}
                alt={service.title}
                className="service-icon"
              />
            </div>

            <h3 className="card-title">{service.title}</h3>
            <p className="card-description">{service.description}</p>
          </motion.div>
        ))}
      </div>

    </div>
  );
};

export default CloudPage;