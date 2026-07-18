import {
  FiCloud,
  FiCode,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiServer,
  FiShield,
  FiSmartphone,
  FiTrendingUp,
  FiTool,
  FiZap,
} from "react-icons/fi";
import "./techstack.css";

const TechStack = () => {
  const techs = [
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
  ];

  return (
    <section className="tech-stack">
      <div className="tech-glow tech-glow-1" />
      <div className="tech-glow tech-glow-2" />

      <div className="section-header tech-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Tech Stack
        </span>
        <h2>Technology Stack Built for Enterprise Scale</h2>
        <p>
          We use proven enterprise technologies to build secure, scalable,
          maintainable systems that can support long-term business growth.
        </p>
      </div>

      <div className="tech-grid">
        {techs.map((tech) => {
          const Icon = tech.icon;

          return (
            <article key={tech.name} className="tech-card">
              <div className="tech-icon">
                <Icon size={22} />
              </div>
              <h3>{tech.name}</h3>
              <span className="tech-category">{tech.category}</span>
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
