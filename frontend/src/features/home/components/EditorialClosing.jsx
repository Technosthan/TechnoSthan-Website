import { useRef } from "react";
import { FiArrowRight, FiMail, FiMapPin, FiPhone } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import MagneticButton from "../../../components/motion/MagneticButton";
import useReducedMotion from "../../../hooks/useReducedMotion";

const contactRows = [
  {
    icon: FiPhone,
    label: "Phone",
    value: "+91 9477-288-288",
    href: "tel:+919477288288",
  },
  {
    icon: FiMail,
    label: "Email",
    value: "info@technosthan.com",
    href: "mailto:info@technosthan.com",
  },
  {
    icon: FiMapPin,
    label: "Location",
    value: "47/1 New Sanganer Road, Sodala, Jaipur, Rajasthan",
  },
];

const EditorialClosing = () => {
  const scopeRef = useRef(null);
  const lineRef = useRef(null);
  const pulseRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      setupGsap();

      if (!scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = scopeRef.current.querySelectorAll("[data-closing-reveal]");

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 84%",
              once: true,
            },
          }
        );

        if (!reducedMotion && lineRef.current) {
          const length = lineRef.current.getTotalLength();
          gsap.set(lineRef.current, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          gsap.to(lineRef.current, {
            strokeDashoffset: 0,
            duration: 1.15,
            ease: "power2.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 82%",
              once: true,
            },
          });
        }

        if (!reducedMotion && pulseRef.current) {
          gsap.fromTo(
            pulseRef.current,
            { attr: { cx: 92 }, opacity: 0.72 },
            {
              attr: { cx: 344 },
              opacity: 1,
              duration: 2.6,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            }
          );
        }
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion] }
  );

  return (
    <section
      className="editorial-closing"
      ref={scopeRef}
      data-motion-zone="footer"
      aria-labelledby="closing-cta-heading"
    >
      <div className="editorial-shell editorial-closing-shell">
        <div className="editorial-closing-copy" data-closing-reveal>
          <span className="editorial-closing-eyebrow">
            START A PROJECT
          </span>
          <h2 id="closing-cta-heading">
            A premium enterprise presence, from the first scroll to the final
            CTA.
          </h2>
          <p>
            Technosthan&apos;s public site should feel deliberate, warm, and
            unmistakably enterprise-grade. The public layer now speaks with
            typography, image flow, and motion instead of boxes and widgets.
          </p>

          <div className="editorial-closing-trustline" data-closing-reveal>
            <span>Software delivery</span>
            <span>Cloud execution</span>
            <span>Long-term support</span>
          </div>
        </div>

        <div className="editorial-closing-panel">
          <div className="editorial-closing-actions" data-closing-reveal>
            <MagneticButton
              to="/contact"
              className="editorial-closing-btn editorial-closing-btn--primary"
            >
              <span>Start a project</span>
              <FiArrowRight aria-hidden="true" />
            </MagneticButton>

            <MagneticButton
              to="/services"
              className="editorial-closing-btn editorial-closing-btn--secondary"
            >
              <span>Explore services</span>
              <FiArrowRight aria-hidden="true" />
            </MagneticButton>
          </div>

          <div
            className="editorial-closing-visual"
            aria-hidden="true"
            data-closing-reveal
          >
            <div className="editorial-closing-visual__frame">
              <svg
                className="editorial-closing-visual__svg"
                viewBox="0 0 420 230"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="closing-line-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="rgba(14, 165, 233, 0.2)" />
                    <stop offset="50%" stopColor="rgba(14, 165, 233, 0.8)" />
                    <stop offset="100%" stopColor="rgba(239, 91, 42, 0.96)" />
                  </linearGradient>
                </defs>
                <path
                  ref={lineRef}
                  d="M 52 182 C 112 126, 156 76, 214 100 S 308 184, 372 86"
                  fill="none"
                  stroke="url(#closing-line-gradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <g className="editorial-closing-visual__nodes">
                  <circle cx="52" cy="182" r="16" />
                  <circle cx="214" cy="100" r="24" />
                  <circle cx="372" cy="86" r="18" />
                </g>
                <circle
                  ref={pulseRef}
                  cx="92"
                  cy="168"
                  r="6"
                  fill="rgba(239, 91, 42, 0.98)"
                  filter="url(#closing-glow)"
                />
                <defs>
                  <filter
                    id="closing-glow"
                    x="-40%"
                    y="-40%"
                    width="180%"
                    height="180%"
                  >
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>

              <div className="editorial-closing-visual__labels">
                <span>Idea</span>
                <span>Build</span>
                <span>Launch</span>
              </div>
            </div>
          </div>

          <div className="editorial-closing-contact" data-closing-reveal>
            {contactRows.map((item) => {
              const Icon = item.icon;

              return (
                <div className="editorial-closing-contact__row" key={item.label}>
                  <div className="editorial-closing-contact__icon">
                    <Icon aria-hidden="true" />
                  </div>
                  <div className="editorial-closing-contact__content">
                    <span>{item.label}</span>
                    {item.href ? (
                      <a href={item.href}>{item.value}</a>
                    ) : (
                      <p>{item.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialClosing;
