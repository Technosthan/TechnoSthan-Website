import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./Team.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
const TeamPreview = () => {
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
          scopeRef.current.querySelectorAll("[data-team-card]"),
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
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
    <section className="team-preview" ref={scopeRef} data-motion-zone="about">
      <div className="about-container">
        <h2>Leadership And Delivery Capability</h2>
        <div className="team-grid">
          <div className="glass-card" data-team-card>
            <h3>Enterprise Strategy</h3>
            <p>Roadmaps, governance, and transformation planning</p>
          </div>
          <div className="glass-card" data-team-card>
            <h3>Software Engineering</h3>
            <p>Product delivery, platforms, and integrations</p>
          </div>
          <div className="glass-card" data-team-card>
            <h3>Cloud & Security</h3>
            <p>Infrastructure, resilience, and secure operations</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamPreview;
