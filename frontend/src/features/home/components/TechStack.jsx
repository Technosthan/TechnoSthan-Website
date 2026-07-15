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
          We leverage the most advanced and reliable technologies to build
          scalable, secure solutions
        </p>
      </div>

      <div className="tech-grid">
        {techs.map((tech) => (
          <article key={tech.name} className="tech-card">
            <div className="tech-icon">{tech.icon}</div>
            <h3>{tech.name}</h3>
            <span className="tech-category">{tech.category}</span>
            <p className="tech-description">{tech.description}</p>
          </article>
        ))}
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
