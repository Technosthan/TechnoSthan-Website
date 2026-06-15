import { motion } from "framer-motion";
import {
  FiUsers,
  FiTrendingUp,
  FiZap,
  FiHeadphones,
  FiTarget,
  FiAward,
} from "react-icons/fi";
import "./whychooseus.css";
import { useNavigate } from "react-router-dom";

const WhyChooseUs = () => {
  const navigate = useNavigate();
  const items = [
    {
      icon: FiUsers,
      title: "Expert Team",
      desc: "Experienced developers, architects, and strategists with 10+ years in enterprise solutions",
    },
    {
      icon: FiTrendingUp,
      title: "Scalable Solutions",
      desc: "Built for future growth with cloud-native architecture and microservices",
    },
    {
      icon: FiZap,
      title: "Fast Delivery",
      desc: "Rapid development cycles using agile methodologies and proven frameworks",
    },
    {
      icon: FiHeadphones,
      title: "24/7 Support",
      desc: "Round-the-clock technical assistance and dedicated support team",
    },
    {
      icon: FiTarget,
      title: "Goal-Oriented",
      desc: "Aligned with your business objectives and measurable outcomes",
    },
    {
      icon: FiAward,
      title: "Proven Track Record",
      desc: "99% client satisfaction with 50+ successful projects delivered",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
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
    <section className="why-choose-us">
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
          Why Technosthan
        </span>
        <h2>Why Choose Technosthan</h2>
        <p>
          We combine innovation, expertise, and dedication to deliver
          exceptional results that drive your business forward
        </p>
      </motion.div>

      {/* Items Grid */}
      <motion.div
        className="why-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={index}
              className="why-card"
              variants={itemVariants}
              whileHover={{
                y: -8,
                transition: { duration: 0.3 },
              }}
            >
              {/* Card Background Glow */}
              <div className="why-card-glow"></div>

              {/* Number Badge */}
              <div className="card-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* Icon Container */}
              <motion.div
                className="why-icon"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <IconComponent size={40} />
              </motion.div>

              {/* Content */}
              <h3>{item.title}</h3>
              <p>{item.desc}</p>

              {/* Bottom Line */}
              <div className="card-bottom-line"></div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Bottom CTA */}
      <motion.div
        className="why-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h3>Ready to transform your business?</h3>
        <motion.button
          className="btn-primary"
          onClick={() => navigate("/contact")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Your Journey
        </motion.button>
      </motion.div>
    </section>
    
  );
};

export default WhyChooseUs;
