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
      title: "Expert Team",
      desc: "Experienced developers, architects, and strategists with 10+ years in enterprise solutions",
    },
    {
      icon: FiTrendingUp,
      title: "Scalable Solutions",
      desc: "Built for future growth with cloud-native architecture and microservices",
    },
    {
      icon: FiZap,
      title: "Fast Delivery",
      desc: "Rapid development cycles using agile methodologies and proven frameworks",
    },
    {
      icon: FiHeadphones,
      title: "24/7 Support",
      desc: "Round-the-clock technical assistance and dedicated support team",
    },
    {
      icon: FiTarget,
      title: "Goal-Oriented",
      desc: "Aligned with your business objectives and measurable outcomes",
    },
    {
      icon: FiAward,
      title: "Proven Track Record",
      desc: "99% client satisfaction with 50+ successful projects delivered",
    },
  ];

  return (
    <section className="why-choose-us">
      <div className="section-header why-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Why Technosthan
        </span>
        <h2>Why Choose Technosthan</h2>
        <p>
          We combine innovation, expertise, and dedication to deliver
          exceptional results that drive your business forward
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
        <h3>Ready to transform your business?</h3>
        <button
          className="btn-primary"
          onClick={() => navigate("/contact")}
        >
          Start Your Journey
        </button>
      </div>
    </section>
  );
};

export default WhyChooseUs;
