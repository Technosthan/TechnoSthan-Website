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
      description: "Modern UI delivery",
    },
    {
      name: "Node.js",
      icon: FiServer,
      category: "Backend",
      description: "Scalable runtime",
    },
    {
      name: "PostgreSQL",
      icon: FiDatabase,
      category: "Database",
      description: "Reliable SQL storage",
    },
    {
      name: "AWS",
      icon: FiCloud,
      category: "Cloud",
      description: "Cloud infrastructure",
    },
    {
      name: "Docker",
      icon: FiTool,
      category: "DevOps",
      description: "Container workflows",
    },
    {
      name: "AI/ML",
      icon: FiCpu,
      category: "Advanced",
      description: "Automated intelligence",
    },
    {
      name: "TypeScript",
      icon: FiCode,
      category: "Frontend",
      description: "Type-safe delivery",
    },
    {
      name: "MongoDB",
      icon: FiDatabase,
      category: "Database",
      description: "Flexible data layer",
    },
    {
      name: "Kubernetes",
      icon: FiGlobe,
      category: "DevOps",
      description: "Scaling orchestration",
    },
    {
      name: "Redis",
      icon: FiZap,
      category: "Cache",
      description: "Fast response layer",
    },
    {
      name: "GraphQL",
      icon: FiTrendingUp,
      category: "API",
      description: "Composed data access",
    },
    {
      name: "Jenkins",
      icon: FiShield,
      category: "CI/CD",
      description: "Automated delivery",
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
        <h2>Cutting-Edge Technologies</h2>
        <p>
          We leverage trusted, modern technologies to build scalable and
          secure solutions that can grow with your business.
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
      </div>
    </section>
  );
};

export default TechStack;
