import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./CompanyStory.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const CompanyStory = () => {
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
          scopeRef.current.querySelectorAll("[data-story-item]"),
          { y: 26, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
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
    <section className="company-story" ref={scopeRef} data-motion-zone="about">
      <div className="about-container">
        <div className="story-content">
          <div data-story-item>
            <span className="section-badge">Our Story</span>
            <h2>From delivery partner to enterprise technology partner</h2>
            <p>
              Technosthan partners with organizations that need dependable
              software delivery, modern cloud architecture, and a practical
              roadmap for digital transformation.
            </p>
            <p>
              We help teams replace fragmented systems with resilient
              platforms, aligned stakeholders, and measurable business
              outcomes.
            </p>
          </div>
          <div className="story-card" data-story-item>
            <h3>50+</h3>
            <p>Enterprise engagements delivered</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyStory;
