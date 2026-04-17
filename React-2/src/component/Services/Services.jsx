import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  Building, Lightbulb, Sprout, Monitor,
  ArrowRight
} from "lucide-react";
import "./Services.css";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    {
      title: "TECHNOSTHAN HOSPITALITY",
      path: "/services/technosthan-hospitality",
      desc: "Hospitality platforms, booking systems, and management tools built for hotels and resorts.",
      icon: <Building size={32} />,
      color: "#10b981",
      img: "https://images.unsplash.com/photo-1566073771259-6a8506099945"
    },
    {
      title: "TECHNOSTHAN INNOVATIONS HUB",
      path: "/services/technosthan-innovations-hub",
      desc: "Product innovation, custom app development, and digital transformation solutions.",
      icon: <Lightbulb size={32} />,
      color: "#f59e0b",
      img: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0"
    },
    {
      title: "TECHNOSTHAN AGRITECH",
      path: "/services/technosthan-agritech",
      desc: "Agri-tech solutions, farm automation, and data-driven agriculture growth services.",
      icon: <Sprout size={32} />,
      color: "#22c55e",
      img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449"
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      path: "/services/technosthan-it-services",
      desc: "IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services.",
      icon: <Monitor size={32} />,
      color: "#6366f1",
      img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31"
    }
  ];

  return (
    <section className="services-page">

      <Helmet>
        <title>Our Verticals - TechnoSthan</title>
        <meta
          name="description"
          content="TechnoSthan Verticals: Hospitality, Innovations Hub, AgriTech & IT Services."
        />
      </Helmet>

      <div className="bg-glow"></div>

      <motion.div
        className="services-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <span className="badge">Expertise</span>
        <h1>Our Business Verticals</h1>
        <p>
          Pushing boundaries with innovative digital solutions tailored for your success.
        </p>
      </motion.div>

      <motion.div className="services-grid">
        {services.map((item, index) => (
          <motion.div
            key={index}
            className="service-card"
            onClick={() => navigate(item.path)}
          >

            {/* 🔥 IMAGE LAYER */}
            <div
              className="card-bg"
              style={{ backgroundImage: `url(${item.img})` }}
            ></div>

            {/* 🔥 OVERLAY */}
            <div className="overlay"></div>

            {/* 🔥 CONTENT */}
            <div className="content">
              <div className="card-top">
                <div
                  className="icon-box"
                  style={{
                    color: item.color,
                    backgroundColor: `${item.color}15`
                  }}
                >
                  {item.icon}
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