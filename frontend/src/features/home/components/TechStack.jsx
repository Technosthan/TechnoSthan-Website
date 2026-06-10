import { motion } from "framer-motion";
import {
  FiDatabase,
  FiServer,
  FiGitBranch,
  FiBox,
  FiCloud,
  FiCpu,
} from "react-icons/fi";
import "./techstack.css";

const TechStack = () => {
  const techs = [
    {
      name: "React",
      icon: "⚛️",
      category: "Frontend",
      description: "UI library",
    },
    {
      name: "Node.js",
      icon: "🟢",
      category: "Backend",
      description: "Runtime",
    },
    {
      name: "PostgreSQL",
      icon: "🐘",
      category: "Database",
      description: "SQL Database",
    },
    {
      name: "AWS",
      icon: "☁️",
      category: "Cloud",
      description: "Infrastructure",
    },
    {
      name: "Docker",
      icon: "🐳",
      category: "DevOps",
      description: "Containerization",
    },
    {
      name: "AI/ML",
      icon: "🤖",
      category: "Advanced",
      description: "Machine Learning",
    },
    {
      name: "TypeScript",
      icon: "📘",
      category: "Frontend",
      description: "Type Safety",
    },
    {
      name: "MongoDB",
      icon: "🍃",
      category: "Database",
      description: "NoSQL",
    },
    {
      name: "Kubernetes",
      icon: "☸️",
      category: "DevOps",
      description: "Orchestration",
    },
    {
      name: "Redis",
      icon: "🔴",
      category: "Cache",
      description: "Caching",
    },
    {
      name: "GraphQL",
      icon: "📊",
      category: "API",
      description: "Query Language",
    },
    {
      name: "Jenkins",
      icon: "🔧",
      category: "CI/CD",
      description: "Automation",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="tech-stack">
      {/* Background Glow */}
      <div className="tech-glow tech-glow-1"></div>
      <div className="tech-glow tech-glow-2"></div>

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
          Tech Stack
        </span>
        <h2>Cutting-Edge Technologies</h2>
        <p>
          We leverage the most advanced and reliable technologies to build
          scalable, secure solutions
        </p>
      </motion.div>

      {/* Tech Grid */}
      <motion.div
        className="tech-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {techs.map((tech, index) => (
          <motion.div
            key={tech.name}
            className="tech-card"
            variants={itemVariants}
            whileHover={{
              y: -8,
              scale: 1.05,
              transition: { duration: 0.3 },
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Card Background Glow */}
            <div className="card-bg-glow"></div>

            {/* Icon */}
            <div className="tech-icon">{tech.icon}</div>

            {/* Content */}
            <h3>{tech.name}</h3>
            <span className="tech-category">{tech.category}</span>
            <p className="tech-description">{tech.description}</p>

            {/* Shine Effect */}
            <div className="shine"></div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="tech-stats"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="stat">
          <h4>12+</h4>
          <p>Technologies</p>
        </div>
        <div className="stat">
          <h4>100%</h4>
          <p>Scalable</p>
        </div>
        <div className="stat">
          <h4>24/7</h4>
          <p>Support</p>
        </div>
      </motion.div>
    </section>
  );
};

export default TechStack;
