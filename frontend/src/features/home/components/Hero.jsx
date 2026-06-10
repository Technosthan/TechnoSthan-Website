import { motion } from "framer-motion";
import herobanner from "../../../assets/images/hero/hero.png";
import "./hero.css";

const Hero = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const stats = [
    { number: "50+", label: "Projects Delivered" },
    { number: "20+", label: "Happy Clients" },
    { number: "99%", label: "Client Satisfaction" },
  ];

  return (
    <section className="hero">
      {/* Background Glow Effects */}
      <div className="glow-orb glow-orb-1"></div>
      <div className="glow-orb glow-orb-2"></div>
      <div className="glow-line"></div>

      <div className="hero-container">
        {/* Left Column */}
        <motion.div
          className="hero-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Badge */}
          <motion.div className="hero-badge" variants={itemVariants}>
            <span className="badge-dot"></span>
            Trusted Technology Partner
          </motion.div>

          {/* Main Heading */}
          <motion.h1 className="hero-title" variants={itemVariants}>
            Transforming Businesses
            <br />
            Through Modern Technology
          </motion.h1>

          {/* Description */}
          <motion.p className="hero-description" variants={itemVariants}>
            Technosthan delivers enterprise-grade web applications, cloud
            infrastructure, AI automation, cybersecurity solutions, and digital
            transformation services for modern businesses.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div className="hero-buttons" variants={itemVariants}>
            <motion.button
              className="btn-primary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Book Free Consultation
            </motion.button>
            <motion.button
              className="btn-secondary"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View Services
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div className="hero-stats" variants={itemVariants}>
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-item"
                whileHover={{ scale: 1.05 }}
              >
                <motion.div
                  className="stat-number"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.div>
                <span className="stat-label">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - Image */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, x: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="hero-image-wrapper">
            {/* Image Glow Background */}
            <div className="image-glow"></div>

            {/* Animated Floating Cards */}
            <motion.div
              className="floating-card floating-card-1"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <div className="card-content">
                <span className="card-icon">🚀</span>
                <p>Enterprise</p>
              </div>
            </motion.div>

            <motion.div
              className="floating-card floating-card-2"
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
            >
              <div className="card-content">
                <span className="card-icon">⚡</span>
                <p>Fast & Secure</p>
              </div>
            </motion.div>

            <motion.div
              className="floating-card floating-card-3"
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <div className="card-content">
                <span className="card-icon">💡</span>
                <p>Innovative</p>
              </div>
            </motion.div>

            {/* Main Hero Image */}
            <motion.img
              src={herobanner}
              alt="Technosthan IT Services"
              className="hero-image"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="scroll-indicator"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span></span>
      </motion.div>
    </section>
  );
};

export default Hero;
