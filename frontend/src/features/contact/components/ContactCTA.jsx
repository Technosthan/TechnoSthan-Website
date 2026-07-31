import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import "./ContactCTA.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import MagneticButton from "../../../components/motion/MagneticButton";

const ContactCTA = () => {
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
    <section className="contact-cta" ref={scopeRef} data-motion-zone="footer">
      <div className="contact-enterprise__shell contact-cta__shell">
        <div className="contact-cta__copy">
          <span className="section-badge">
            <span className="badge-dot" />
            Final step
          </span>
          <h2>Let&apos;s Build Something Great Together.</h2>
          <p>
            Start with a short message, and TechnoSthan will respond through the existing enterprise contact flow with the right next step.
          </p>

          <div className="contact-cta__actions">
            <MagneticButton to="/contact#contact-form" className="btn-primary">
              Schedule consultation
              <FiArrowRight aria-hidden="true" />
            </MagneticButton>
            <Link to="/services" className="btn-secondary">
              Explore services
            </Link>
          </div>
        </div>

        <div className="contact-cta__visual" aria-hidden="true">
          <div className="contact-cta__diagram">
            <svg viewBox="0 0 420 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="contact-cta-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(45, 212, 200, 0.22)" />
                  <stop offset="58%" stopColor="rgba(74, 141, 255, 0.84)" />
                  <stop offset="100%" stopColor="rgba(239, 91, 42, 0.96)" />
                </linearGradient>
              </defs>
              <path
                d="M 42 172 C 102 126, 150 74, 214 96 S 310 180, 372 84"
                fill="none"
                stroke="url(#contact-cta-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="42" cy="172" r="16" fill="rgba(45, 212, 200, 0.92)" />
              <circle cx="214" cy="96" r="24" fill="rgba(255, 255, 255, 0.9)" />
              <circle cx="372" cy="84" r="18" fill="rgba(239, 91, 42, 0.96)" />
              <rect x="92" y="58" width="94" height="52" rx="16" fill="rgba(15, 23, 42, 0.9)" />
              <rect x="258" y="132" width="114" height="58" rx="16" fill="rgba(15, 23, 42, 0.9)" />
            </svg>
          </div>
          <div className="contact-cta__legend">
            <span>Idea</span>
            <span>Conversation</span>
            <span>Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactCTA;
