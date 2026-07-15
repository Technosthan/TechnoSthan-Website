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
import ProcessWheel from "./ProcessWheel";

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

      <ProcessWheel />

      {/* (Process wheel replaces the previous timeline and stats) */}
    </section>
  );
};

export default ProcessSection;