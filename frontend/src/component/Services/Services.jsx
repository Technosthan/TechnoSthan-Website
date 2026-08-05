import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const [activeVertical, setActiveVertical] = useState(0);

  const services = [
    {
      title: "TECHNOSTHAN HOSPITALITY",
      path: "/services/technosthan-hospitality",
      desc: "Hospitality platforms, booking systems, and management tools built for hotels and resorts.",
      icon: hospitalityIcon, // ✅ correct
      color: "#10b981",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
    },
    {
      title: "TECHNOSTHAN AGRITECH",
      path: "https://agritech.technosthan.com",
      external: true,
      desc: "Agri-tech solutions, farm automation, and data-driven agriculture growth services.",
      icon: agritechIcon,
      color: "#22c55e",
      img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449",
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      path: "https://it.technosthan.com/",
      external: true,
      desc: "IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
      icon: itIcon, // ✅ correct
      color: "#6366f1",
      img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    },
  ];

  const handleNavigation = (item) => {
    if (item.external) {
      window.location.assign(item.path);
      return;
    }

    navigate(item.path);
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveVertical((prev) => (prev + 1) % services.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Scroll-to-section when navigated with ?scroll=param
  const location = useLocation();
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search);
      const scrollTo = params.get("scroll");
      if (scrollTo) {
        // Delay slightly to allow route mount and layout
        setTimeout(() => {
          document
            .getElementById(scrollTo)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      }
    } catch (e) {
      // ignore
    }
  }, [location.search]);

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
          <h1>Our Business Verticals</h1>

          {/* Business Vertical Title (30% smaller) */}
          <div className="vertical-label">{services[activeVertical].title}</div>

          {/* Dynamic Description from Active Vertical */}
          <p className="vertical-description">
            {services[activeVertical].desc}
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

        {/* RIGHT VISUAL - AUTO SLIDING VERTICALS */}
        <div className="hero-right">
          <div className="vertical-slider">
            {/* Vertical Images - Auto Slide */}
            <motion.div
              className="slider-track"
              key={activeVertical}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="vertical-card"
                style={{
                  backgroundImage: `url(${services[activeVertical].img})`,
                }}
              >
                <div className="vertical-overlay"></div>

                <div className="vertical-content">
                  <img
                    src={services[activeVertical].icon}
                    alt={services[activeVertical].title}
                    className="vertical-icon"
                    loading="lazy"
                  />
                  <h3>{services[activeVertical].title}</h3>
                </div>
              </div>
            </motion.div>

            {/* Slide Indicators */}
            <div className="slide-indicators">
              {services.map((_, idx) => (
                <button
                  key={idx}
                  className={`indicator ${idx === activeVertical ? "active" : ""}`}
                  onClick={() => setActiveVertical(idx)}
                  aria-label={`Go to vertical ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔥 SERVICES GRID */}
      <motion.div className="services-grid" id="services-section">
        {services.map((item, index) => (
          <motion.div
            key={index}
            className="service-card"
            onClick={() => handleNavigation(item)}
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
