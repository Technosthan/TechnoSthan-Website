import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import "./AboutHero.css";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const AboutHero = () => {
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
          scopeRef.current.querySelectorAll("[data-about-hero]"),
          { y: 22, opacity: 0 },
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
    <section className="about-hero" ref={scopeRef} data-motion-zone="about">
      <div className="about-container">
        <span className="section-badge" data-about-hero>
          About Technosthan
        </span>
        <h1 data-about-hero>
          Building Enterprise Technology
          <br />
          That Teams Can Trust
        </h1>
        <p data-about-hero>
          Technosthan partners with businesses to design and deliver
          enterprise software, cloud platforms, and AI-enabled digital
          transformation programs with a clear focus on outcomes.
        </p>
      </div>
    </section>
  );
};

export default AboutHero;
