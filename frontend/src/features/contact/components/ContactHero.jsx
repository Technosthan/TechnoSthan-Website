import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCpu,
  FiLayers,
  FiShield,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import "./ContactHero.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const ContactHero = () => {
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
          scopeRef.current.querySelectorAll("[data-contact-hero]"),
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
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
    <section className="contact-hero" ref={scopeRef} data-motion-zone="cta">
      <div className="contact-enterprise__shell contact-hero__grid">
        <div className="contact-hero__copy">
          <span className="section-badge" data-contact-hero>
            <span className="badge-dot" />
            Enterprise Inquiry
          </span>
          <h1 data-contact-hero>
            Let&apos;s Start Your
            <br />
            Enterprise Conversation
          </h1>
          <p data-contact-hero>
            Share your business challenge, timeline, and goals. We&apos;ll route
            it to the right team, ask the right questions, and shape the next
            step without the usual friction.
          </p>

          <div className="contact-hero__actions" data-contact-hero>
            <a href="#contact-form" className="btn-primary">
              Request a project
              <FiArrowRight size={16} />
            </a>
            <Link to="/services" className="btn-secondary">
              Explore services
            </Link>
          </div>

          <div className="contact-hero__signal" data-contact-hero aria-label="Contact signals">
            <span>Fast routing</span>
            <span>Secure intake</span>
            <span>Clear next step</span>
          </div>
        </div>

        <div className="contact-hero__visual" data-contact-hero aria-hidden="true">
          <div className="contact-hero__panel">
            <div className="contact-hero__architecture">
              <svg viewBox="0 0 620 440" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="contact-hero-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(45, 212, 200, 0.12)" />
                    <stop offset="56%" stopColor="rgba(74, 141, 255, 0.76)" />
                    <stop offset="100%" stopColor="rgba(239, 91, 42, 0.76)" />
                  </linearGradient>
                </defs>
                <path
                  d="M 46 308 C 108 260, 142 154, 220 178 S 352 276, 438 176 S 520 88, 580 114"
                  fill="none"
                  stroke="url(#contact-hero-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <path
                  d="M 84 102 C 156 164, 210 144, 274 120 S 438 84, 518 168"
                  fill="none"
                  stroke="rgba(74, 141, 255, 0.42)"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <circle cx="46" cy="308" r="16" fill="rgba(45, 212, 200, 0.9)" />
                <circle cx="220" cy="178" r="20" fill="rgba(255, 255, 255, 0.9)" />
                <circle cx="438" cy="176" r="22" fill="rgba(239, 91, 42, 0.92)" />
                <circle cx="580" cy="114" r="14" fill="rgba(74, 141, 255, 0.9)" />

                <g opacity="0.84">
                  <rect x="92" y="248" width="116" height="72" rx="18" fill="rgba(15, 23, 42, 0.92)" />
                  <rect x="264" y="108" width="132" height="86" rx="20" fill="rgba(15, 23, 42, 0.92)" />
                  <rect x="470" y="212" width="106" height="72" rx="18" fill="rgba(15, 23, 42, 0.92)" />
                </g>
              </svg>
            </div>

            <div className="contact-hero__architecture-grid">
              <div className="contact-hero__node">
                <FiLayers size={18} />
                <strong>Request intake</strong>
                <span>Forms and direct channels are routed into one response path.</span>
              </div>
              <div className="contact-hero__node">
                <FiCpu size={18} />
                <strong>Technical review</strong>
                <span>The brief is reviewed before the first serious conversation.</span>
              </div>
              <div className="contact-hero__node">
                <FiShield size={18} />
                <strong>Secure handling</strong>
                <span>Inputs follow the same enterprise-minded contact flow.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactHero;
