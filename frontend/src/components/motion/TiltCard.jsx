import { forwardRef, useEffect, useRef } from "react";

import { gsap } from "../../lib/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";

const canUseHoverPointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

const TiltCard = forwardRef(function TiltCard(
  {
    as: Component = "article",
    children,
    className = "",
    maxTilt = 10,
    lift = 10,
    ...rest
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = localRef.current;

    if (!element || reducedMotion || !canUseHoverPointer()) {
      return undefined;
    }

    const rotateX = gsap.quickTo(element, "rotationX", {
      duration: 0.28,
      ease: "power3.out",
    });
    const rotateY = gsap.quickTo(element, "rotationY", {
      duration: 0.28,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(element, "y", {
      duration: 0.25,
      ease: "power3.out",
    });
    const scale = gsap.quickTo(element, "scale", {
      duration: 0.2,
      ease: "power2.out",
    });

    const reset = () => {
      rotateX(0);
      rotateY(0);
      moveY(0);
      scale(1);
      element.dataset.tiltState = "idle";
    };

    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      rotateY(x * maxTilt);
      rotateX(y * -maxTilt);
      moveY(-lift);
      scale(1.02);
      element.dataset.tiltState = "active";
    };

    element.addEventListener("pointermove", handleMove, { passive: true });
    element.addEventListener("pointerleave", reset, { passive: true });
    element.addEventListener("blur", reset);
    element.dataset.tiltState = "idle";

    return () => {
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", reset);
      element.removeEventListener("blur", reset);
      reset();
    };
  }, [lift, maxTilt, reducedMotion]);

  const mergedRef = (node) => {
    localRef.current = node;

    if (typeof forwardedRef === "function") {
      forwardedRef(node);
      return;
    }

    if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  return (
    <Component
      ref={mergedRef}
      className={`tilt-card ${className}`.trim()}
      data-tilt-card
      {...rest}
    >
      {children}
    </Component>
  );
});

export default TiltCard;
