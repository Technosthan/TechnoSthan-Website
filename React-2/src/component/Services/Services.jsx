import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { ArrowRight } from "lucide-react";
import "./Services.css";

/* ✅ Correct icons */
import agritechIcon from "../../assets/agri.png";
import innovationIcon from "../../assets/innovation.png";
import itIcon from "../../assets/it.png";
import hospitalityIcon from "../../assets/hospitality.png";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "TECHNOSTHAN HOSPITALITY",
      path: "/services/technosthan-hospitality",
      desc: "Hospitality platforms, booking systems, and management tools built for hotels and resorts.",
      icon: hospitalityIcon, // ✅ correct
      color: "#10b981",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
      title: "TECHNOSTHAN INNOVATIONS HUB",
      path: "/services/technosthan-innovations-hub",
      desc: "Product innovation, custom app development, and digital transformation solutions.",
      icon: innovationIcon, // ✅ correct
      color: "#f59e0b",
      img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
    },
    {
      title: "TECHNOSTHAN AGRITECH",
      path: "/services/technosthan-agritech",
      desc: "Agri-tech solutions, farm automation, and data-driven agriculture growth services.",
      icon: agritechIcon, // ✅ correct
      color: "#22c55e",
      img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      path: "/services/technosthan-it-services",
      desc: "IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
      icon: itIcon, // ✅ correct
      color: "#6366f1",
      img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
    }
  ];

  return (
    <section className="services-page">

      <Helmet>
        <title>Our Verticals - TechnoSthan</title>
      </Helmet>

      <div className="bg-glow"></div>

      {/* 🔥 HERO */}
      <motion.div
        className="services-header hero-pro"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="hero-left">
          <span className="badge">EXPERTISE</span>

          <h1>
            Our Business <br /> Verticals
          </h1>

          <p>
            Pushing boundaries with innovative digital solutions tailored for your success.
          </p>

          <div className="hero-buttons">
            <button
              className="btn primary"
              onClick={() => {
                const section = document.getElementById("services-section");
                section?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Explore
            </button>

            <button
              className="btn secondary"
              onClick={() => navigate("/contact")}
            >
              Contact
            </button>
          </div>
        </div>

        {/* RIGHT VISUAL */}
        <div className="hero-right">
          <div className="card-stack">
            <div className="card-layer"></div>
            <div className="card-layer"></div>
            <div className="card-layer main"></div>
          </div>
        </div>
      </motion.div>

      {/* 🔥 SERVICES GRID */}
      <motion.div className="services-grid" id="services-section">
        {services.map((item, index) => (
          <motion.div
            key={index}
            className="service-card"
            onClick={() => navigate(item.path)}
          >
            <div
              className="card-bg"
              style={{ backgroundImage: `url(${item.img})` }}
            ></div>

            <div className="overlay"></div>

            <div className="content">
              <div className="card-top">
                <div className="icon-box">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="service-logo"
                    loading="lazy"
                  />
                </div>

                <div className="arrow-icon">
                  <ArrowRight size={20} />
                </div>
              </div>

              <div className="card-body">
                <h2>{item.title}</h2>
                <p>{item.desc}</p>
              </div>

              <div
                className="card-footer"
                style={{ background: item.color }}
              ></div>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
};

export default Services;