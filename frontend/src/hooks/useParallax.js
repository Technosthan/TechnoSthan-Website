import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../animations/gsapSetup";
import useReducedMotion from "./useReducedMotion";

const useParallax = (
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
        const target = options.target || "[data-gsap-parallax]";

        gsap.to(target, {
          yPercent: options.yPercent ?? 8,
          ease: "none",
          scrollTrigger: {
            trigger: options.trigger || scope.current,
            start: options.start || "top bottom",
            end: options.end || "bottom top",
            scrub: options.scrub ?? 0.8,
          },
        });
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

export default useParallax;
