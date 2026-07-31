import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../animations/gsapSetup";
import { staggerDefaults } from "../animations/animationConfig";
import useReducedMotion from "./useReducedMotion";

const useStaggerAnimation = (
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
        const targets = options.targets || "[data-gsap-stagger]";

        gsap.fromTo(
          targets,
          {
            y: options.fromY ?? 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: options.duration ?? staggerDefaults.duration,
            ease: options.ease ?? staggerDefaults.ease,
            stagger: options.stagger ?? staggerDefaults.stagger,
            scrollTrigger: options.scrollTrigger
              ? {
                  ...options.scrollTrigger,
                }
              : {
                  trigger: scope.current,
                  start: "top 78%",
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

export default useStaggerAnimation;
