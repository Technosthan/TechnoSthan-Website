import React from "react";
import { Link } from "react-router-dom";
import "./TechnoSthanServices.css";

import agritechIcon from "../assets/agri.png";
import innovationIcon from "../assets/innovation.png";
import itIcon from "../assets/it.png";
import hospitalityIcon from "../assets/hospitality.png";

const services = [
  {
    title: "TECHNOSTHAN HOSPITALITY",
    path: "/services/technosthan-hospitality",
    desc: "Hospitality platforms, booking systems, and management tools built for hotels and resorts.",
    icon: hospitalityIcon,
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
  },
  {
    title: "TECHNOSTHAN INNOVATIONS HUB",
    path: "/services/technosthan-innovations-hub",
    desc: "Product innovation, custom app development, and digital transformation solutions.",
    icon: innovationIcon,
    img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
  },
  {
    title: "TECHNOSTHAN AGRITECH",
    path: "/services/technosthan-agritech",
    desc: "Agri-tech solutions, farm automation, and data-driven agriculture growth services.",
    icon: agritechIcon,
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
  },
  {
    title: "TECHNOSTHAN IT SERVICES",
    path: "/services/technosthan-it-services",
    desc: "IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
    icon: itIcon,
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
          
          <Link to={item.path} className="service-link" key={index}>
            <div className={`service-card service-${index}`}>

              <div
                className="card-bg"
                style={{ backgroundImage: `url(${item.img})` }}
              ></div>

              <div className="overlay"></div>

              <div className="content">

                {/* 🔥 Logo added */}
                <div className="icon">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="service-logo"
                  />
                </div>

                <h3>{item.title}</h3>
                <p>{item.desc}</p>

              </div>

            </div>
          </Link>

        ))}
      </div>
    </section>
  );
};

export default TechnoSthanServices;