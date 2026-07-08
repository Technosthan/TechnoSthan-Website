import React from "react";
import { motion } from "framer-motion";
import BusinessVerticalsCarousel from "../BusinessVerticalsCarousel";
import DynamicPageSections from "../DynamicPageSections";
import { useLocation } from "react-router-dom";

import "./AboutPage.css";

const Homepage = () => {
  const location = useLocation();
  const fadeIn = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
  };

  return (
    <div className="about-container">
      {/* HERO */}
      <section className="about-hero">
        <video className="hero-video-bg" autoPlay loop muted playsInline>
          <source src="/hero-video.webm" type="video/webm" />
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>

        <div className="video-overlay"></div>

        <div className="hero-wrapper">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          ></motion.div>
        </div>
      </section>

      {/* WHO WE ARE */}
      <motion.section className="glass-section" {...fadeIn}>
        <h2>Who We Are</h2>
        <p>
          TechnoSthan is a diversified, technology-driven enterprise operating
          across multiple verticals including Hospitality, Agritech, Innovations
          Hub, and Information & Technology Services.
        </p>
      </motion.section>

      <DynamicPageSections route={location.pathname} position="whoWeAre" />

      {/* SERVICES */}
      <section className="services-grid-wrapper">
        <BusinessVerticalsCarousel />
      </section>

      {/* MISSION & VISION */}
      {/* <section className="split-section">
        <motion.div className="glass-card mission" {...fadeIn}>
          <h2>Our Mission</h2>
          <p>
            To empower businesses with innovative digital solutions that drive real growth.
          </p>
        </motion.div>

        <motion.div className="glass-card vision" {...fadeIn}>
          <h2>Our Vision</h2>
          <p>
            To become a global technology partner, shaping the future of digital innovation.
          </p>
        </motion.div>
      </section> */}

      {/* WHY US */}
      <DynamicPageSections route={location.pathname} position="custom" />
      <DynamicPageSections route={location.pathname} position="top" />
      <DynamicPageSections route={location.pathname} position="bottom" />

      <motion.section className="why-us-section" {...fadeIn}>
        {/* <h2>Why Choose Us</h2> */}

        {/* <div className="check-list">
          {[
            "Modern Technology",
            "Scalable Solutions",
            "Client-Centric Approach",
            "Fast Delivery"
          ].map((item, i) => (
            <motion.div 
              className="check-box" 
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
            >
              <div className="check-box-inner">
                <span className="check-text">{item}</span>
              </div>
            </motion.div>
          ))}
        </div> */}
      </motion.section>
    </div>
  );
};

export default Homepage;
