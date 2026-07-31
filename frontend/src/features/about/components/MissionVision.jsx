import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./MissionVision.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const MissionVision = () => {
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
          scopeRef.current.querySelectorAll("[data-mission-card]"),
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
    <section className="mission-section" ref={scopeRef} data-motion-zone="about">
      <div className="about-container">
        <div className="mission-grid">
          <div className="glass-card" data-mission-card>
            <h3>Mission</h3>
            <p>
              Build secure, scalable technology solutions that improve how
              businesses operate, sell, and serve customers.
            </p>
          </div>
          <div className="glass-card" data-mission-card>
            <h3>Vision</h3>
            <p>
              Become the enterprise technology partner businesses trust for
              digital transformation, engineering excellence, and support.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;
