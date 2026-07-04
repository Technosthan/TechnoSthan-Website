import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, Sparkles } from "lucide-react";

const ProgramCard = ({ program }) => {
  const Icon = program.icon;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className="card glass program-card"
    >
      <div className="program-top">
        <div className="program-icon-wrap">
          <Icon size={18} />
        </div>
        <span className="program-badge">{program.badge}</span>
      </div>
      <h3>{program.title}</h3>
      <p>{program.description}</p>
      <div className="program-meta">
        <span className="meta-pill">
          <Clock3 size={12} /> {program.duration}
        </span>
        <span className="meta-pill">
          <Sparkles size={12} /> {program.level}
        </span>
      </div>
      <div className="program-meta">
        {program.highlights.map((item) => (
          <span key={item} className="meta-pill">
            <BadgeCheck size={12} /> {item}
          </span>
        ))}
      </div>
      <a href="/contact" className="btn btn-secondary">
        Apply Now <ArrowRight size={16} />
      </a>
    </motion.article>
  );
};

export default ProgramCard;
