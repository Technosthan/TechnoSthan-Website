import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCompass,
  FiClipboard,
  FiPenTool,
  FiCode,
  FiCheckSquare,
  FiArrowUp,
  FiHeadphones,
} from "react-icons/fi";

import { gsap, ScrollTrigger, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import "./ProcessWheel.css";

export const PROCESS_STEPS = [
  {
    title: "Discover",
    description:
      "We align business goals, risks, and technical constraints before shaping the scope.",
    icon: FiCompass,
  },
  {
    title: "Plan",
    description:
      "We map delivery milestones, architecture decisions, and stakeholder communication.",
    icon: FiClipboard,
  },
  {
    title: "Design",
    description:
      "We translate requirements into clear, confident interfaces and system flows.",
    icon: FiPenTool,
  },
  {
    title: "Develop",
    description:
      "We build in disciplined iterations with engineering standards that scale.",
    icon: FiCode,
  },
  {
    title: "Test",
    description:
      "We validate quality, performance, accessibility, and reliability before launch.",
    icon: FiCheckSquare,
  },
  {
    title: "Launch",
    description:
      "We coordinate a calm release plan with monitoring and stakeholder sign-off.",
    icon: FiArrowUp,
  },
  {
    title: "Support",
    description:
      "We stay close after release with maintenance, enhancements, and response support.",
    icon: FiHeadphones,
  },
];

const getStepAngle = (index) => (360 / PROCESS_STEPS.length) * index - 90;

const ProcessWheel = () => {
  const shellRef = useRef(null);
  const ringRef = useRef(null);
  const nodeRefs = useRef([]);
  const wheelAnimationRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();

  const activeData = useMemo(() => PROCESS_STEPS[activeStep], [activeStep]);

  useEffect(() => {
    setupGsap();

    if (!shellRef.current) {
      return undefined;
    }

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(shellRef.current, { autoAlpha: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        shellRef.current,
        { autoAlpha: 0, y: 26 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: shellRef.current,
            start: "top 78%",
            once: true,
          },
        },
      );

      const orbitRadius = ringRef.current.offsetWidth * 0.4;

      const wheelTimeline = gsap.timeline({
        repeat: -1,
        defaults: {
          ease: "none",
        },
      });

      nodeRefs.current.forEach((node, index) => {
        if (!node) return;

        const startAngle = getStepAngle(index);
        const angleState = {
          angle: startAngle,
        };

        const updateNodePosition = () => {
          const radians = (angleState.angle * Math.PI) / 180;

          const x = Math.cos(radians) * orbitRadius;
          const y = Math.sin(radians) * orbitRadius;

          gsap.set(node, {
            x,
            y,
            rotation: 0,
            xPercent: -50,
            yPercent: -50,
            transformOrigin: "50% 50%",
          });
        };

        updateNodePosition();

        wheelTimeline.to(
          angleState,
          {
            angle: startAngle + 360,
            duration: 35,
            onUpdate: updateNodePosition,
          },
          0,
        );
      });

      wheelAnimationRef.current = wheelTimeline;

      ScrollTrigger.create({
        trigger: shellRef.current,
        start: "top 60%",
        end: "bottom 40%",
        onUpdate: (self) => {
          const nextStep = Math.min(
            PROCESS_STEPS.length - 1,
            Math.floor(self.progress * PROCESS_STEPS.length),
          );
          setActiveStep(nextStep);
        },
      });
    }, shellRef);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <div className="process-wheel-shell" ref={shellRef}>
      <div className="process-wheel-desktop">
        <div className="process-wheel-visual">
          <div
            className="process-wheel-ring"
            ref={ringRef}
            onMouseEnter={handleWheelMouseEnter}
            onMouseLeave={handleWheelMouseLeave}
          >
            <span className="process-wheel-ring-outline" />
            {PROCESS_STEPS.map((step, index) => {
              const Icon = step.icon;
              

              return (
                <button
                  key={step.title}
                  ref={(element) => {
                    nodeRefs.current[index] = element;
                  }}
                  type="button"
                  className={`process-wheel-node ${
                    index === activeStep ? "is-active" : ""
                  }`}
                  onClick={() => setActiveStep(index)}
                  data-cursor="view"
                  aria-label={`Select ${step.title} process step`}
                >
                  <span className="process-wheel-node-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="process-wheel-node-icon">
                    <Icon size={16} />
                  </span>
                  <strong>{step.title}</strong>
                </button>
              );
            })}
          </div>
        </div>

        <div className="process-wheel-center">
          <span className="process-wheel-kicker">0{activeStep + 1}</span>
          <h3>{activeData.title}</h3>
          <p>{activeData.description}</p>
          <div className="process-wheel-meta">
            <span>Premium delivery</span>
            <span>Scroll + click synced</span>
          </div>
        </div>
      </div>

      <div className="process-wheel-mobile">
        {PROCESS_STEPS.map((step, index) => {
          const Icon = step.icon;

          return (
            <article
              key={step.title}
              className={`process-timeline-item ${
                index === activeStep ? "is-active" : ""
              }`}
              onClick={() => setActiveStep(index)}
              data-cursor="view"
            >
              <div className="process-timeline-icon">
                <Icon size={16} />
              </div>
              <div className="process-timeline-copy">
                <div className="process-timeline-top">
                  <span>0{index + 1}</span>
                  <strong>{step.title}</strong>
                </div>
                <p>{step.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ProcessWheel;  