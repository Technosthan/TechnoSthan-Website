import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./CompanyStats.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const stats = [
  { number: "50+", label: "Enterprise Projects" },
  { number: "20+", label: "Business Clients" },
  { number: "5+", label: "Years of Delivery" },
  { number: "99%", label: "Client Satisfaction" },
];

const CompanyStats = () => {
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
          scopeRef.current.querySelectorAll("[data-stats-card]"),
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
    <section className="stats-section" ref={scopeRef} data-motion-zone="statistics">
      <div className="about-container">

        <h2>Impact That Builds Confidence</h2>

        <div className="stats-grid">
          {stats.map((item) => (
            <div key={item.label} className="glass-card" data-stats-card>
              <h3>{item.number}</h3>
              <p>{item.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CompanyStats;
