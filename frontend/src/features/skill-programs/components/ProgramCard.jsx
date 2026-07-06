import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  GraduationCap,
  IndianRupee,
  Sparkles,
  Users,
} from "lucide-react";
import { ROUTES } from "../../../shared/constants/routes";

const formatPrice = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
};

const ProgramCard = ({ program }) => {
  const slug = program.slug || program.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const fee = formatPrice(program.discountFees || program.fees);
  const originalFee = program.discountFees ? formatPrice(program.fees) : null;

  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      className="card glass program-card"
    >
      <div className="program-thumb-wrap">
        {program.thumbnailUrl || program.heroImageUrl ? (
          <img
            src={program.thumbnailUrl || program.heroImageUrl}
            alt={program.title}
            className="program-thumb"
          />
        ) : (
          <div className="program-thumb program-thumb-placeholder">
            <GraduationCap size={28} />
          </div>
        )}
      </div>
      <div className="program-top">
        <span className="program-badge">{program.category || program.level}</span>
        {program.isFeatured ? <span className="meta-pill">Featured</span> : null}
      </div>
      <h3>{program.title}</h3>
      <p>{program.shortDescription || program.description}</p>
      <div className="program-meta">
        <span className="meta-pill">
          <Clock3 size={12} /> {program.duration}
        </span>
        <span className="meta-pill">
          <Sparkles size={12} /> {program.level}
        </span>
        <span className="meta-pill">
          <IndianRupee size={12} /> {fee || "Contact for fees"}
        </span>
      </div>
      <div className="program-meta">
        <span className="meta-pill">
          <Users size={12} /> {program.projectsCount || 0} Projects
        </span>
        <span className="meta-pill">
          <BadgeCheck size={12} /> {program.certificateIncluded ? "Certificate" : "No certificate"}
        </span>
        {originalFee ? (
          <span className="meta-pill muted-price">{originalFee}</span>
        ) : null}
      </div>
      <div className="program-meta">
        <span className="meta-pill">{program.mode}</span>
        <span className="meta-pill">
          {program.internshipSupport ? "Internship support" : "No internship support"}
        </span>
      </div>
      <Link to={`${ROUTES.PROGRAM_DETAIL_BASE}/${slug}`} className="btn btn-secondary">
        Enroll Now <ArrowRight size={16} />
      </Link>
    </motion.article>
  );
};

export default ProgramCard;
