import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Code2,
  Cloud,
  TrendingUp,
  Briefcase,
  Rocket,
  ArrowRight
} from "lucide-react";

import "./ServicesPage.css";
const ServicesPage = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 120 }
    }
  };

  // 🔥 FINAL 4 SERVICES (ORGANIZATION STRUCTURE)
  const services = [
    {
      icon: <Code2 size={28} />,
      title: "Engineering & Development",
      desc: "Web, Mobile, API, and secure scalable systems.",
      path: "/engineering"
    },
    {
      icon: <Cloud size={28} />,
      title: "Cloud & DevOps",
      desc: "Cloud infrastructure, CI/CD, and deployment automation.",
      path: "/cloud"
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Digital Growth",
      desc: "SEO, marketing, and data-driven growth strategies.",
      path: "/digital-growth"
    },
    {
      icon: <Briefcase size={28} />,
      title: "IT Consulting",
      desc: "Technology strategy, architecture, and business solutions.",
      path: "/consulting"
    }
  ];

  return (
    <div className="growth-wrapper">

      {/* Background */}
      <div className="circle-bg one"></div>
      <div className="circle-bg two"></div>

      <div className="growth-container">

        {/* HEADER */}
        <motion.div 
          className="growth-header"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="growth-badge">
            <Rocket size={14} /> <span>Technology Solutions</span>
          </div>

          <h1 className="growth-title">
            Our Core Services
          </h1>

          <p className="growth-lead">
            We provide end-to-end technology solutions including development, 
            cloud infrastructure, digital growth, and IT consulting.
          </p>
        </motion.div>

        {/* SERVICES GRID */}
        <motion.div 
          className="strategy-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ y: -10 }}
            >
              <Link to={item.path} className="strategy-card">
                <div className="strategy-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="card-arrow">
                  <span>Explore</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* STATS */}
        <motion.div 
          className="stats-banner"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat"><strong>100+</strong> <span>Projects</span></div>
          <div className="stat"><strong>99%</strong> <span>Client Satisfaction</span></div>
          <div className="stat"><strong>24/7</strong> <span>Support</span></div>
        </motion.div>

        {/* CTA BUTTON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: "center", marginTop: "50px" }}
        >
          <Link to="/services" className="btn-premium btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            Explore Services <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
};

export default ServicesPage;