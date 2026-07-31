import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiServer,
  FiShield,
  FiTrendingUp,
  FiTool,
  FiZap,
} from "react-icons/fi";
import "./techstack.css";
import useReducedMotion from "../../../hooks/useReducedMotion";

const TechStack = () => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  const techs = useMemo(
    () => [
      {
        name: "React",
        icon: FiLayers,
        category: "Frontend",
        description: "Modern enterprise interface delivery",
      },
      {
        name: "Node.js",
        icon: FiServer,
        category: "Backend",
        description: "Scalable backend runtime",
      },
      {
        name: "PostgreSQL",
        icon: FiDatabase,
        category: "Database",
        description: "Reliable enterprise-grade SQL storage",
      },
      {
        name: "AWS",
        icon: FiCloud,
        category: "Cloud",
        description: "Cloud infrastructure and operations",
      },
      {
        name: "Docker",
        icon: FiTool,
        category: "DevOps",
        description: "Containerized delivery workflows",
      },
      {
        name: "AI/ML",
        icon: FiCpu,
        category: "Advanced",
        description: "Applied automation and intelligence",
      },
      {
        name: "TypeScript",
        icon: FiCode,
        category: "Frontend",
        description: "Type-safe application delivery",
      },
      {
        name: "MongoDB",
        icon: FiDatabase,
        category: "Database",
        description: "Flexible data layer and analytics",
      },
      {
        name: "Kubernetes",
        icon: FiGlobe,
        category: "DevOps",
        description: "Scaling orchestration and policy",
      },
      {
        name: "Redis",
        icon: FiZap,
        category: "Cache",
        description: "Fast response and caching layer",
      },
      {
        name: "GraphQL",
        icon: FiTrendingUp,
        category: "API",
        description: "Composed enterprise API access",
      },
      {
        name: "Jenkins",
        icon: FiShield,
        category: "CI/CD",
        description: "Automated delivery pipelines",
      },
    ],
    []
  );

  useEffect(() => {
    if (!scopeRef.current || reducedMotion) {
      setIsVisible(!reducedMotion);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(scopeRef.current);

    return () => observer.disconnect();
  }, [reducedMotion]);

  const marqueeItems = [...techs, ...techs];

  return (
    <section className="tech-stack" ref={scopeRef}>
      <div className="section-header tech-header">
        <span className="section-badge" data-gsap="fade-up">
          <span className="badge-dot" />
          Technology Stack
        </span>
        <h2 data-gsap="text-reveal">A technology ecosystem built to scale cleanly</h2>
        <p data-gsap="fade-up">
          We mix proven enterprise platforms with flexible delivery patterns so
          the stack stays maintainable as the business grows.
        </p>
      </div>

      <div className={`tech-marquee ${isVisible ? "is-running" : ""}`} aria-hidden="true">
        <div className="tech-marquee-track">
          {marqueeItems.map((tech, index) => {
            const Icon = tech.icon;

            return (
              <div key={`${tech.name}-${index}`} className="tech-pill">
                <span className="tech-pill-icon">
                  <Icon size={18} />
                </span>
                <span className="tech-pill-copy">
                  <strong>{tech.name}</strong>
                  <small>{tech.category}</small>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tech-grid">
        {techs.map((tech) => {
          const Icon = tech.icon;

          return (
            <article key={tech.name} className="tech-card">
              <div className="tech-card-head">
                <div className="tech-icon">
                  <Icon size={20} />
                </div>
                <span className="tech-category">{tech.category}</span>
              </div>
              <h3>{tech.name}</h3>
              <p className="tech-description">{tech.description}</p>
            </article>
          );
        })}
      </div>

      <div className="tech-stats">
        <div className="stat">
          <h4>12+</h4>
          <p>Core technologies</p>
        </div>
        <div className="stat">
          <h4>100%</h4>
          <p>Enterprise ready</p>
        </div>
        <div className="stat">
          <h4>24/7</h4>
          <p>Support posture</p>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
