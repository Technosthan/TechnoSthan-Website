import "./Technologies.css";

import { FaReact, FaNodeJs, FaAws, FaDocker } from "react-icons/fa";
import { SiExpress, SiPostgresql, SiPrisma, SiMongodb } from "react-icons/si";

const technologies = [
  { name: "React", icon: <FaReact /> },
  { name: "Node.js", icon: <FaNodeJs /> },
  { name: "Express", icon: <SiExpress /> },
  { name: "PostgreSQL", icon: <SiPostgresql /> },
  { name: "AWS", icon: <FaAws /> },
  { name: "Docker", icon: <FaDocker /> },
  { name: "Prisma", icon: <SiPrisma /> },
  { name: "MongoDB", icon: <SiMongodb /> },
];

const Technologies = () => {
  return (
    <section className="technologies-section" data-motion-zone="stack">
      <div className="about-container">
        <div className="section-header technology-header">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Technologies
          </span>
          <h2 data-gsap="text-reveal">Technology choices that stay practical at scale</h2>
          <p data-gsap="fade-up">
            We lean on mature stacks that keep delivery predictable, secure,
            and maintainable for long-term enterprise use.
          </p>
        </div>

        <div className="tech-grid">
          {technologies.map((tech, index) => (
            <article
              key={tech.name}
              className="glass-card tech-card"
              data-gsap-stagger
              data-motion-focus="tech"
            >
              <div className="tech-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="tech-icon">{tech.icon}</div>
              <h3>{tech.name}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Technologies;
