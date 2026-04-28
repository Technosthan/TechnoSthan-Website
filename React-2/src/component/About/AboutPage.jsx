import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import "./AboutPage.css";
import bgImage from "../../assets/about-bg.jpg";
import agritechIcon from "../../assets/techno-agre.png";
import hospitalityIcon from "../../assets/techno-hosp.img.png";
import innovationIcon from "../../assets/techno-innfra.png";
import itServicesIcon from "../../assets/software.png";

const AboutPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const services = [
    {
      title: "TECHNOSTHAN AGRITECH",
      path: "/services/technosthan-agritech",
      icon: agritechIcon,
      theme: 2,
      desc: "Smart agri-tech solutions, farm automation, and data-driven agricultural growth services."
    },
    {
      title: "TECHNOSTHAN HOSPITALITY",
      path: "/services/technosthan-hospitality",
      icon: hospitalityIcon,
      theme: 0,
      desc: "Advanced hospitality platforms, booking systems, and management tools for hotels and resorts."
    },
    {
      title: "TECHNOSTHAN INNOVATIONS HUB",
      path: "/services/technosthan-innovations-hub",
      icon: innovationIcon,
      theme: 1,
      desc: "Product innovation, custom application development, and digital transformation solutions."
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      path: "/services/technosthan-it-services",
      icon: itServicesIcon,
      theme: 3,
      desc: "Comprehensive IT support, cloud engineering, cybersecurity, and enterprise-grade infrastructure services."
    },
  ];

  // Auto-slide carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % services.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <div className="about-container">

      {/* HERO - VIDEO BACKGROUND */}
      <section className="about-hero">
        {/* 🎬 FULL WIDTH VIDEO BACKGROUND */}
        <video 
          className="hero-video-bg"
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-video.jpg"
        >
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        {/* Dark overlay for text readability */}
        <div className="video-overlay"></div>

        {/* Hero Content Overlay */}
        <div className="hero-wrapper">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            {/* <h1 className="gradient-text">About TechnoSthan</h1>
            <p className="subtitle">
              Innovation Tomorrow. Building Digital Excellence.
            </p> */}
          </motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <motion.section className="glass-section" {...fadeIn}>
        <h2>Who We Are</h2>
        <p>
          TechnoSthan is a diversified, technology-driven enterprise operating across multiple verticals including Hospitality,
          Agritech, Innovations Hub, and Information & Technology Services.
          We create impactful solutions ranging from digital platforms and smart farming systems to advanced cloud infrastructure,
          enabling businesses to innovate, grow, and thrive in a rapidly evolving world.
        </p>
      </motion.section>

      {/* SERVICES */}
      <section className="services-grid-wrapper">
        <motion.h2 {...fadeIn}>Our Business Verticals</motion.h2>
        <br />
        <br />

        <div className="bento-grid">
          {services.map((service, index) => (
            <motion.a 
              className={`service-card service-${service.theme}`}
              key={index}
              href={service.path}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{ display: "block", color: "inherit", textDecoration: "none" }}
            >
              <div className="icon-box">
                <img src={service.icon} alt={service.title} className="service-icon-img" loading="lazy" />
              </div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.a>
          ))}
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="split-section">
        <motion.div className="glass-card mission" {...fadeIn}>
          <h2>Our Mission</h2>
          <p>
            To empower businesses with innovative digital solutions that drive real growth and long-term success.
          </p>
        </motion.div>

        <motion.div className="glass-card vision" {...fadeIn}>
          <h2>Our Vision</h2>
          <p>
            To become a global technology partner, shaping the future of digital innovation and excellence.
          </p>
        </motion.div>
      </section>

      {/* WHY CHOOSE US */}
      <motion.section className="why-us-section" {...fadeIn}>
        <h2>Why Choose Us</h2>

        <div className="check-list">
          {[
            "Modern Technology",
            "Scalable Solutions",
            "Client-Centric Approach",
            "Fast Delivery"
          ].map((item, i) => (
            <motion.div 
              className="check-item" 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: i * 0.2 }}
            >
              <CheckCircle2 className="check-icon" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.section>

    </div>
  );
};

export default AboutPage;