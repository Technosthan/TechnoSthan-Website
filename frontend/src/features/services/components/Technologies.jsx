import "./Technologies.css";

import { FaReact, FaNodeJs, FaAws, FaDocker } from "react-icons/fa";

import {
  SiExpress,
  SiPostgresql,
  SiPrisma,
  SiMongodb,
} from "react-icons/si";

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
    <section className="technologies-section">
      <div className="about-container">

        <h2>Technologies We Use</h2>

        <div className="tech-grid">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="glass-card tech-card"
            >
              <div className="tech-icon">
                {tech.icon}
              </div>

              <h3>{tech.name}</h3>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Technologies;