import React from "react";
import "./TechnoSthanServices.css";

const services = [
  {
    title: "TECHNOSTHAN HOSPITALITY",
    desc: "Hospitality platforms, booking systems, and management tools built for hotels and resorts.",
    icon: "🏨",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
  },
  {
    title: "TECHNOSTHAN INNOVATIONS HUB",
    desc: "Product innovation, custom app development, and digital transformation solutions.",
    icon: "💡",
    img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
  },
  {
    title: "TECHNOSTHAN AGRITECH",
    desc: "Agri-tech solutions, farm automation, and data-driven agriculture growth services.",
    icon: "🌱",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
  },
  {
    title: "TECHNOSTHAN IT SERVICES",
    desc: "IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
    icon: "🖥️",
    img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
  }
];

const TechnoSthanServices = () => {
  return (
    <section className="services-section">
      <h1>Our <span>Verticals</span></h1>

      <p className="subtitle">
        TechnoSthan delivers focused vertical expertise across Hospitality,
        Innovation, AgriTech and IT services.
      </p>

      <div className="services-grid">
        {services.map((item, index) => (
          <div className={`service-card service-${index}`} key={index}>
            
            <div
              className="card-bg"
              style={{ backgroundImage: `url(${item.img})` }}
            ></div>

            <div className="overlay"></div>

            <div className="content">
              <div className="icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
};

export default TechnoSthanServices;