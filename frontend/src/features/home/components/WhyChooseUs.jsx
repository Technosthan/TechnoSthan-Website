import {
  FiAward,
  FiHeadphones,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./whychooseus.css";

const WhyChooseUs = () => {
  const navigate = useNavigate();

  const items = [
    {
      icon: FiUsers,
      title: "Senior Enterprise Team",
      desc: "Architects, engineers, and strategists focused on delivery quality, governance, and long-term support.",
    },
    {
      icon: FiTrendingUp,
      title: "Scalable Architecture",
      desc: "Cloud-native systems designed for growth, resilience, and high-volume workloads.",
    },
    {
      icon: FiZap,
      title: "Predictable Delivery",
      desc: "Structured, transparent execution with clear milestones and stakeholder visibility.",
    },
    {
      icon: FiHeadphones,
      title: "Enterprise Support",
      desc: "Responsive communication, managed support, and dependable post-launch assistance.",
    },
    {
      icon: FiTarget,
      title: "Business Outcomes",
      desc: "Technology decisions anchored to measurable business value and operational clarity.",
    },
    {
      icon: FiAward,
      title: "Proven Delivery",
      desc: "A track record of successful digital products, enterprise solutions, and client satisfaction.",
    },
  ];

  return (
    <section className="why-choose-us">
      <div className="section-header why-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Why Technosthan
        </span>
        <h2>Why Enterprises Choose Technosthan</h2>
        <p>
          We combine strategy, architecture, and delivery discipline to help
          organizations modernize with confidence.
        </p>
      </div>

      <div className="why-grid">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <article key={item.title} className="why-card">
              <div className="card-number">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="why-icon">
                <IconComponent size={40} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          );
        })}
      </div>

      <div className="why-cta">
        <h3>Ready to modernize your enterprise platform?</h3>
        <button
          className="btn-primary"
          onClick={() => navigate("/contact")}
        >
          Start the Conversation
        </button>
      </div>
    </section>
  );
};

export default WhyChooseUs;
