import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const RDServiceCard = ({ service }) => {
  const Icon = service.icon;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className="card glass program-card"
    >
      <div className="program-top">
        <div className="program-icon-wrap">
          <Icon size={18} />
        </div>
        <span className="program-badge">Research</span>
      </div>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <div className="program-meta">
        {service.focusAreas.map((item) => (
          <span key={item} className="meta-pill">
            {item}
          </span>
        ))}
      </div>
      <a href="/contact" className="btn btn-secondary">
        Discuss Project <ArrowRight size={16} />
      </a>
    </motion.article>
  );
};

export default RDServiceCard;
