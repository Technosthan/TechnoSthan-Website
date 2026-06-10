import { motion } from "framer-motion";
import {
  FiSearch,
  FiClipboard,
  FiPenTool,
  FiCode,
  FiCheckSquare,
  FiArrowUp,
} from "react-icons/fi";
import "./process.css";

const ProcessSection = () => {
  const processSteps = [
    {
      step: "01",
      title: "Discovery",
      desc: "We understand your business goals, challenges, and requirements through detailed consultation",
      icon: FiSearch,
      duration: "1-2 weeks",
    },
    {
      step: "02",
      title: "Planning",
      desc: "Strategic roadmap creation with timelines, resources, and technical architecture planning",
      icon: FiClipboard,
      duration: "1 week",
    },
    {
      step: "03",
      title: "Design",
      desc: "UI/UX design with prototypes and user testing to ensure optimal user experience",
      icon: FiPenTool,
      duration: "2-3 weeks",
    },
    {
      step: "04",
      title: "Development",
      desc: "Agile development using cutting-edge technologies and best practices",
      icon: FiCode,
      duration: "4-8 weeks",
    },
    {
      step: "05",
      title: "Testing",
      desc: "Comprehensive QA testing including unit, integration, and performance testing",
      icon: FiCheckSquare,
      duration: "1-2 weeks",
    },
    {
      step: "06",
      title: "Deployment",
      desc: "Seamless deployment to production with monitoring and ongoing support",
      icon: FiArrowUp,
      duration: "Ongoing",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
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
    <section className="process">
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
          Our Process
        </span>
        <h2>Our Proven Process</h2>
        <p>
          We follow a structured, transparent process to ensure quality and
          timely delivery
        </p>
      </motion.div>

      {/* Process Timeline */}
      <motion.div
        className="process-timeline"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {processSteps.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <motion.div
              key={index}
              className="process-step"
              variants={itemVariants}
              whileHover={{ y: -8 }}
            >
              {/* Timeline Connector */}
              {index < processSteps.length - 1 && (
                <div className="timeline-connector">
                  <motion.div
                    className="connector-progress"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{
                      delay: 0.2 + index * 0.1,
                      duration: 0.8,
                    }}
                    viewport={{ once: true }}
                  />
                </div>
              )}

              {/* Step Card */}
              <div className="step-card">
                {/* Step Number Circle */}
                <motion.div
                  className="step-number"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.step}
                </motion.div>

                {/* Icon */}
                <motion.div
                  className="step-icon"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <IconComponent size={32} />
                </motion.div>

                {/* Content */}
                <h3>{item.title}</h3>
                <p>{item.desc}</p>

                {/* Duration Badge */}
                <motion.div
                  className="duration-badge"
                  whileHover={{ scale: 1.05 }}
                >
                  ⏱ {item.duration}
                </motion.div>

                {/* Bottom Accent Line */}
                <div className="card-accent-line"></div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Process Stats */}
      <motion.div
        className="process-stats"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="stat-box">
          <h4>6 Phases</h4>
          <p>Comprehensive approach</p>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <h4>Agile</h4>
          <p>Flexible & adaptive</p>
        </div>
        <div className="stat-divider"></div>
        <div className="stat-box">
          <h4>Transparent</h4>
          <p>Full visibility</p>
        </div>
      </motion.div>
    </section>
  );
};

export default ProcessSection;
