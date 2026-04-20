import React from "react";
import { motion } from "framer-motion";
import { Rocket, Lightbulb, Users, Handshake, Building } from "lucide-react";
import "./TechnoSthanInnovationsHub.css";

const TechnoSthanInnovationsHub = () => {

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  // UPDATED SERVICES (Innovation Hub)
  const capabilities = [
    {
      icon: <Rocket size={28} />,
      title: "Startup Incubation",
      desc: "Supporting early-stage startups with resources and structured growth plans."
    },
    {
      icon: <Lightbulb size={28} />,
      title: "Business Strategy",
      desc: "Helping entrepreneurs build strong and scalable business models."
    },
    {
      icon: <Users size={28} />,
      title: "Mentorship Programs",
      desc: "Guidance from experienced professionals and industry experts."
    },
    {
      icon: <Handshake size={28} />,
      title: "Investor Connect",
      desc: "Connecting startups with potential investors and funding opportunities."
    },
    {
      icon: <Building size={28} />,
      title: "Co-working Space",
      desc: "Modern collaborative workspace designed for innovation and productivity."
    }
  ];

  return (
    <div className="devops-wrapper">
      <div className="grid-overlay"></div>

      <div className="devops-content">

        {/*HEADER UPDATED */}
        <motion.div 
          className="devops-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="badge">Startup Ecosystem</div>

          <h1 className="cyber-title">
            TechnoSthan Innovation Hub
          </h1>

          <p className="lead-text">
            TechnoSthan Innovation Hub empowers startups and entrepreneurs with 
            incubation, mentorship, and funding support. We help transform ideas 
            into successful, scalable businesses through innovation and collaboration.
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div 
          className="capability-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {capabilities.map((item, index) => (
            <motion.div 
              key={index} 
              className="capability-card"
              variants={itemVariants}
              whileHover={{ y: -10, borderColor: "#22c55e" }}
            >
              <div className="glow-effect"></div>
              <div className="icon-container">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* BOTTOM SEO BAR */}
        <motion.div 
          className="tech-bar"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>Startup Incubation</span> • 
          <span> Mentorship</span> • 
          <span> Funding Support</span> • 
          <span> Business Growth</span> • 
          <span> Innovation</span>
        </motion.div>

      </div>
    </div>
  );
};

export default TechnoSthanInnovationsHub;