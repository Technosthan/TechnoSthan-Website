import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Hotel, Rocket, Leaf, Code, CheckCircle2 } from "lucide-react";
import "./AboutPage.css";
import bgImage from "../../assets/about-bg.jpg";

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
      title: "TECHNOSTHAN HOSPITALITY",
      icon: <Hotel />,
      desc: "Advanced hospitality platforms, booking systems, and management tools for hotels and resorts."
    },
    {
      title: "TECHNOSTHAN INNOVATIONS HUB",
      icon: <Rocket />,
      desc: "Product innovation, custom application development, and digital transformation solutions."
    },
    {
      title: "TECHNOSTHAN AGRITECH",
      icon: <Leaf />,
      desc: "Smart agri-tech solutions, farm automation, and data-driven agricultural growth services."
    },
    {
      title: "TECHNOSTHAN IT SERVICES",
      icon: <Code />,
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

      {/* HERO */}
      <section 
        className="about-hero"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      >
        <div className="overlay"></div>

        <div className="hero-wrapper">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="gradient-text">About TechnoSthan</h1>
            <p className="subtitle">
              Innovation Tomorrow. Building Digital Excellence.
            </p>
          </motion.div>

          {/* 🎬 PREMIUM VIDEO SECTION */}
          <motion.div 
            className="premium-video-container"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="video-frame">
              <video 
                className="premium-video"
                controls 
                width="100%"
                poster="/hero-video.jpg"
              >
                <source src="/hero-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="video-glow"></div>
            </div>
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

        <div className="bento-grid">
          {services.map((service, index) => (
            <motion.div 
              className={`service-card service-${index}`}
              key={index}
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="icon-box">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.desc}</p>
            </motion.div>
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