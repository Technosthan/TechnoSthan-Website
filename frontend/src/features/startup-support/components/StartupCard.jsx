import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const StartupCard = ({ item }) => {
  const Icon = item.icon;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className="card glass program-card"
    >
      <div className="program-top">
        <div className="program-icon-wrap">
          <Icon size={18} />
        </div>
        <span className="program-badge">{item.stage}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="program-meta">
        {item.supports.map((support) => (
          <span key={support} className="meta-pill">
            {support}
          </span>
        ))}
      </div>
      <a href="/contact" className="btn btn-secondary">
        Book Support <ArrowRight size={16} />
      </a>
    </motion.article>
  );
};

export default StartupCard;
