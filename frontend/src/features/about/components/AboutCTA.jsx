import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { FiArrowRight } from "react-icons/fi";
import "./AboutCTA.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const AboutCTA = () => {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 82%",
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
    <section className="about-cta" ref={scopeRef} data-motion-zone="cta">
      <div className="about-container">
        <div className="about-cta-shell">
          <div>
            <span className="section-badge" data-gsap="fade-up">
              <span className="badge-dot" />
              Ready when you are
            </span>
            <h2 data-gsap="text-reveal">Ready to accelerate your roadmap?</h2>
            <p data-gsap="fade-up">
              Connect with the team, review the right capabilities, and move
              confidently toward delivery.
            </p>
          </div>

          <div className="about-cta-actions" data-gsap="fade-up">
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate("/contact")}
            >
              Start a conversation <FiArrowRight />
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/login")}
            >
              Open Admin Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
