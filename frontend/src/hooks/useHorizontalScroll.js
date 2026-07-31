import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../animations/gsapSetup";
import useReducedMotion from "./useReducedMotion";

const useHorizontalScroll = (
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
        const target = options.target || "[data-gsap-horizontal]";
        const distance = options.distance || (() => {
          const element = scope.current?.querySelector(target);
          return element ? element.scrollWidth - element.clientWidth : 0;
        });

        gsap.to(target, {
          x: () => -Math.max(0, distance()),
          ease: "none",
          scrollTrigger: {
            trigger: options.trigger || scope.current,
            start: "top top",
            end: () =>
              `+=${Math.max(0, distance()) + (options.extraScroll || 0)}`,
            scrub: options.scrub ?? 1,
            pin: options.pin ?? false,
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

export default useHorizontalScroll;
