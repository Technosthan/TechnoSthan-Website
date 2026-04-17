import React from "react";
import { motion } from "framer-motion";
import {
  Code2,
  Cloud,
  Palette,
  TrendingUp,
  Smartphone,
  ShieldCheck,
  Rocket
} from "lucide-react";
import "./TechnoSthanITServices.css";

const TechnoSthanITServices = () => {

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -2 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: { type: "spring", stiffness: 120 }
    }
  };

  // UPDATED SERVICES (IT SOLUTIONS)
  const strategies = [
    {
      icon: <Code2 size={28} />,
      title: "Web Development",
      desc: "Modern websites using React, MERN stack, and scalable architecture."
    },
    {
      icon: <Cloud size={28} />,
      title: "Cloud & DevOps",
      desc: "Secure cloud hosting, CI/CD pipelines, and infrastructure automation."
    },
    {
      icon: <Palette size={28} />,
      title: "Branding & UI/UX",
      desc: "Creative design, branding, and user-friendly interfaces."
    },
    {
      icon: <TrendingUp size={28} />,
      title: "Digital Growth",
      desc: "SEO, marketing, and analytics to scale your business online."
    },
    {
      icon: <Smartphone size={28} />,
      title: "Mobile App Development",
      desc: "Android & iOS apps with high performance and user experience."
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Security & Optimization",
      desc: "Performance optimization, security audits, and fast loading systems."
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
            TechnoSthan IT Solutions
          </h1>

          <p className="growth-lead">
            TechnoSthan IT Solutions provides complete digital services including 
            web development, cloud & DevOps, branding, and digital marketing. 
            We help businesses build scalable, secure, and high-performance 
            digital products with modern technologies.
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
          {strategies.map((item, index) => (
            <motion.div 
              key={index} 
              className="strategy-card"
              variants={cardVariants}
              whileHover={{ 
                y: -12, 
                backgroundColor: "rgba(99, 102, 241, 0.15)"
              }}
            >
              <div className="strategy-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="card-arrow">
                <TrendingUp size={16} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* STATS + TRUST SECTION */}
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

      </div>
    </div>
  );
};

export default TechnoSthanITServices;