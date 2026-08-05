import React from "react";
import { motion } from "framer-motion";
import { Building2, CalendarCheck, Users } from "lucide-react";
import "./TechnoSthanHospitality.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const TechnoSthanHospitality = () => {

  // UPDATED SERVICES (Hospitality Based)
  const techFeatures = [
    {
      icon: <Building2 size={32} />,
      title: "Hotels",
      desc: "Luxury and premium hotel solutions with world-class amenities and services for unforgettable guest experiences.",
    },
    {
      icon: <Users size={32} />,
      title: "Rooms",
      desc: "Fully furnished and elegantly designed rooms with modern facilities, comfort, and premium quality standards.",
    },
    {
      icon: <CalendarCheck size={32} />,
      title: "Service Apartments",
      desc: "Spacious service apartments perfect for long-term stays with full kitchen, laundry, and housekeeping services.",
    },
  ];

  return (
    <section className="web-dev-section">
      <motion.div
        className="background-overlay"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />

      <div className="web-dev-container">

        {/* UPDATED HEADER */}
        <motion.div
          className="header-content"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="sub-title">Our Services</span>

          <h1 className="gradient-text">
            TechnoSthan Hospitality
          </h1>

          <p className="description">
            Premium hospitality services delivering exceptional guest experiences. 
            We offer luxury hotels, fully furnished rooms, and service apartments 
            with world-class amenities and personalized service.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="tech-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {techFeatures.map((tech, index) => (
            <motion.div
              key={index}
              className="tech-card"
              variants={cardVariants}
              whileHover={{
                scale: 1.05,
                boxShadow: "0px 10px 30px rgba(99, 102, 241, 0.4)",
              }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="icon-wrapper">{tech.icon}</div>
              <h3>{tech.title}</h3>
              <p>{tech.desc}</p>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
};

export default TechnoSthanHospitality;