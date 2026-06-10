import { motion } from "framer-motion";
import {
  FiArrowRight,
  FiCode,
  FiSmartphone,
  FiCloud,
  FiCpu,
  FiShield,
  FiLayers,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";
import "./services.css";

const ServicesPreview = () => {
  const services = [
    {
      icon: FiCode,
      title: "Web Development",
      desc: "Custom business websites and scalable web applications built with modern technologies",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: FiSmartphone,
      title: "Mobile Apps",
      desc: "Native and cross-platform Android & iOS applications with seamless performance",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: FiCloud,
      title: "Cloud Solutions",
      desc: "AWS & scalable infrastructure for enterprise-grade applications",
      gradient: "from-green-500 to-teal-500",
    },
    {
      icon: FiCpu,
      title: "AI Solutions",
      desc: "Automation & intelligent systems powered by machine learning",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: FiShield,
      title: "Cyber Security",
      desc: "Enterprise-grade protection and vulnerability assessment",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      icon: FiLayers,
      title: "UI/UX Design",
      desc: "Modern user experiences with premium design principles",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: FiTrendingUp,
      title: "Data Analytics",
      desc: "Insights & reporting solutions for data-driven decisions",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: FiCheckCircle,
      title: "DSC Services",
      desc: "Digital strategy, consulting, and management solutions",
      gradient: "from-pink-500 to-purple-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="services-preview">
      {/* Section Header */}
      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-badge">
          <span className="badge-dot"></span>
          Our Services
        </span>
        <h2>Enterprise Solutions for Every Challenge</h2>
        <p>
          Comprehensive IT services tailored to transform your business and
          drive growth
        </p>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        className="services-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {services.map((service, index) => {
          const IconComponent = service.icon;
          return (
            <motion.div
              key={service.title}
              className="service-card"
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
            >
              {/* Icon Background Glow */}
              <div className="icon-glow"></div>

              {/* Icon Container */}
              <motion.div
                className="icon-container"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <IconComponent size={32} />
              </motion.div>

              {/* Content */}
              <h3>{service.title}</h3>
              <p>{service.desc}</p>

              {/* Hover Arrow */}
              <motion.div
                className="card-arrow"
                initial={{ x: 0 }}
                whileHover={{ x: 8 }}
              >
                <FiArrowRight size={20} />
              </motion.div>

              {/* Card Border Glow */}
              <div className="card-glow"></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="services-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3>Ready to get started?</h3>
        <p>Let's discuss how our services can transform your business</p>
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Schedule Consultation
        </motion.button>
      </motion.div>
    </section>
  );
};

export default ServicesPreview;
