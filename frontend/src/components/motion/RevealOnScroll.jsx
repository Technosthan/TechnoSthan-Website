import { useLayoutEffect, useRef } from "react";

import { gsap, setupGsap } from "../../lib/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";

const RevealOnScroll = ({
  as: Component = "div",
  children,
  className = "",
  fromY = 14,
  stagger = false,
  staggerAmount = 0.09,
  once = true,
  triggerOffset = "top 82%",
  ...rest
}) => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    setupGsap();

    if (!scope) {
      return undefined;
    }

    if (reducedMotion) {
      gsap.set(scope, { autoAlpha: 1, y: 0 });
      return undefined;
    }

    const targets = stagger
      ? Array.from(scope.children)
      : [scope];

    const context = gsap.context(() => {
      gsap.fromTo(
        targets,
        {
          autoAlpha: 0,
          y: fromY,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: stagger ? staggerAmount : 0,
          scrollTrigger: {
            trigger: scope,
            start: triggerOffset,
            once,
          },
        }
      );
    }, scope);

    return () => context.revert();
  }, [fromY, once, reducedMotion, stagger, staggerAmount, triggerOffset]);

  return (
    <Component ref={scopeRef} className={`reveal-on-scroll ${className}`.trim()} {...rest}>
      {children}
    </Component>
  );
};

export default RevealOnScroll;
