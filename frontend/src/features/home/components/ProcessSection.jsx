import "./process.css";
import "../styles/process-wheel-6d.css";
import { useMemo, useState } from "react";
import ProcessWheel6D from "./ProcessWheel6D";
import {
  FiCode,
  FiSmartphone,
  FiCpu,
  FiCloud,
  FiZap,
  FiDatabase,
  FiShield,
} from "react-icons/fi";

const SERVICE_STAGES = [
  {
    key: "service-web",
    number: "01",
    title: "Web Development",
    shortLabel: "Web Dev",
    description: "Enterprise-grade frontends and backend APIs that scale.",
    icon: FiCode,
  },
  {
    key: "service-mobile",
    number: "02",
    title: "Mobile Engineering",
    shortLabel: "Mobile",
    description: "Cross-platform mobile apps with native performance.",
    icon: FiSmartphone,
  },
  {
    key: "service-ai",
    number: "03",
    title: "AI Automation",
    shortLabel: "AI",
    description: "Smart automation, models, and ML-powered features.",
    icon: FiCpu,
  },
  {
    key: "service-cloud",
    number: "04",
    title: "Cloud Infrastructure",
    shortLabel: "Cloud",
    description: "Robust cloud architectures, cost-aware and resilient.",
    icon: FiCloud,
  },
  {
    key: "service-devops",
    number: "05",
    title: "DevOps & CI/CD",
    shortLabel: "DevOps",
    description: "Automated pipelines, delivery and environment reliability.",
    icon: FiZap,
  },
  {
    key: "service-db",
    number: "06",
    title: "Database Systems",
    shortLabel: "Database",
    description: "Highly available, performant data platforms.",
    icon: FiDatabase,
  },
  {
    key: "service-security",
    number: "07",
    title: "Security & Compliance",
    shortLabel: "Security",
    description: "Best-practice security, audits and compliance.",
    icon: FiShield,
  },
];

const ProcessSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const stages = useMemo(() => SERVICE_STAGES, []);

  const handleStageSelect = (index) => {
    setActiveIndex((index + stages.length) % stages.length);
  };

  const handleStageKeyDown = (event, index) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % stages.length);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + stages.length) % stages.length);
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(stages.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <section className="process">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Our Process
        </span>
        <h2>Enterprise Delivery Process</h2>
        <p>
          We follow a structured, transparent delivery framework that reduces
          risk, improves clarity, and keeps business stakeholders aligned.
        </p>
      </div>

      <div className="why-process-wrapper">
        <ProcessWheel6D
          stages={stages}
          activeIndex={activeIndex}
          onStageSelect={handleStageSelect}
          onStageKeyDown={handleStageKeyDown}
          reducedMotion={false}
        />
      </div>
    </section>
  );
};

export default ProcessSection;
