import { useRef } from "react";
import {
  FiAward,
  FiHeadphones,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
  FiArrowRight,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import "./whychooseus.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const WhyChooseUs = () => {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

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

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-why-item]"),
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [reducedMotion],
    }
  );

  return (
    <section className="why-choose-us" ref={scopeRef}>
      <div className="why-shell">
        <div className="why-intro">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Why Technosthan
          </span>
          <h2 data-gsap="text-reveal">A partner built for enterprise clarity</h2>
          <p data-gsap="fade-up">
            We combine strategy, architecture, and delivery discipline to help
            organizations modernize with confidence and measurable progress.
          </p>

          <div className="why-highlight" data-gsap="fade-up">
            <strong>What clients get</strong>
            <span>Sharper systems, steadier delivery, and a public presence that feels credible.</span>
          </div>

          <button
            type="button"
            className="why-cta-btn"
            onClick={() => navigate("/contact")}
          >
            Start the conversation
            <FiArrowRight size={16} />
          </button>
        </div>

        <div className="why-grid">
          {items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <article key={item.title} className="why-card" data-why-item>
                <div className="why-card-top">
                  <span className="why-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="why-icon">
                    <IconComponent size={22} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
