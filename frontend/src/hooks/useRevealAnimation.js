import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../animations/gsapSetup";
import { sectionRevealDefaults } from "../animations/animationConfig";
import useReducedMotion from "./useReducedMotion";

const useRevealAnimation = (
  dependencies = [],
  options = {}
) => {
  const scope = useRef(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion) {
        return;
      }

      const context = gsap.context(() => {
        const targets = options.targets || "[data-gsap='fade-up']";

        gsap.fromTo(
          targets,
          {
            y: options.fromY ?? sectionRevealDefaults.y,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: options.duration ?? sectionRevealDefaults.duration,
            ease: options.ease ?? sectionRevealDefaults.ease,
            stagger: options.stagger ?? 0.08,
            scrollTrigger: options.scrollTrigger
              ? {
                  ...options.scrollTrigger,
                }
              : {
                  trigger: scope.current,
                  start: "top 80%",
                  once: true,
                },
          }
        );
      }, scope);

      return () => context.revert();
    },
    {
      scope,
      dependencies: [reducedMotion, ...dependencies],
    }
  );

  return scope;
};

export default useRevealAnimation;
