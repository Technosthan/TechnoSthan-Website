import React from "react";
import { motion } from "framer-motion";
import { Leaf, Sprout, Tractor, Droplets, BarChart3 } from "lucide-react";
import "./TechnoSthanAgritech.css";

const TechnoSthanAgritech = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  // UPDATED SERVICES (Agro Tech)
  const services = [
    {
      icon: <Leaf size={32} />,
      title: "Organic Farming",
      desc: "Promoting sustainable and chemical-free farming practices.",
    },
    {
      icon: <Sprout size={32} />,
      title: "Smart Farming",
      desc: "IoT-based solutions for efficient crop monitoring and yield improvement.",
    },
    {
      icon: <Tractor size={32} />,
      title: "Agri Business",
      desc: "Helping farmers and businesses grow through modern agriculture strategies.",
    },
    {
      icon: <Droplets size={32} />,
      title: "Irrigation Systems",
      desc: "Advanced irrigation solutions for better water management.",
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Crop Analytics",
      desc: "Data-driven insights to improve productivity and decision-making.",
    },
  ];

  return (
    <div className="branding-wrapper">

      {/* Background Blobs (Agro Feel) */}
      <div className="brand-blob one"></div>
      <div className="brand-blob two"></div>

      <div className="branding-container">

        {/* HEADER UPDATED */}
        <motion.div
          className="branding-header"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="brand-badge">
            🌾 <span>Agriculture Innovation</span>
          </div>

          <h1 className="brand-title">
            Agro TechnoSthan Solutions
          </h1>

          <p className="brand-lead">
            Agro TechnoSthan Solutions provides modern agriculture services 
            including smart farming, organic practices, and agri-business solutions. 
            We help farmers and businesses increase productivity through technology 
            and sustainable farming methods.
          </p>
        </motion.div>

        {/* Services */}
        <motion.div
          className="brand-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {services.map((item, index) => (
            <motion.div
              key={index}
              className="brand-card"
              variants={itemVariants}
              whileHover={{
                y: -10,
                backgroundColor: "rgba(34, 197, 94, 0.15)"
              }}
            >
              <div className="brand-icon-box">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="card-design-line"></div>
            </motion.div>
          ))}
        </motion.div>

        {/* SEO FOOTER */}
        <motion.p
          className="brand-footer-text"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Empowering agriculture with smart technology and sustainable innovation.
        </motion.p>

      </div>
    </div>
  );
};

export default TechnoSthanAgritech;