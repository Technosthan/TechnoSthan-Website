import { forwardRef, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { gsap } from "../../lib/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";

const canUsePointerMagnet = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

const MagneticButton = forwardRef(function MagneticButton(
  {
    as,
    children,
    className = "",
    href,
    to,
    magneticStrength = 0.18,
    magneticLift = 0.08,
    type = "button",
    ...rest
  },
  forwardedRef
) {
  const localRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = localRef.current;

    if (!element || reducedMotion || !canUsePointerMagnet()) {
      return undefined;
    }

    const setX = gsap.quickTo(element, "x", {
      duration: 0.24,
      ease: "power3.out",
    });
    const setY = gsap.quickTo(element, "y", {
      duration: 0.24,
      ease: "power3.out",
    });
    const setScale = gsap.quickTo(element, "scale", {
      duration: 0.2,
      ease: "power2.out",
    });

    const reset = () => {
      setX(0);
      setY(0);
      setScale(1);
    };

    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      const maxDistance = Math.max(rect.width, rect.height) * 0.5;
      const strength = Math.min(
        1,
        Math.sqrt((x * x) + (y * y)) / Math.max(1, maxDistance)
      );
      const pull = 1 - strength * 0.8;

      setX(x * magneticStrength);
      setY(y * magneticStrength);
      setScale(1 + magneticLift * pull);
    };

    element.addEventListener("pointermove", handleMove, { passive: true });
    element.addEventListener("pointerleave", reset, { passive: true });
    element.addEventListener("blur", reset);

    return () => {
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", reset);
      element.removeEventListener("blur", reset);
      reset();
    };
  }, [magneticLift, magneticStrength, reducedMotion]);

  const combinedClassName = `magnetic-button ${className}`.trim();
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

  const sharedProps = {
    ref: mergedRef,
    className: combinedClassName,
    "data-magnetic": true,
    ...rest,
  };

  if (as) {
    const Component = as;
    return <Component {...sharedProps}>{children}</Component>;
  }

  if (to) {
    return (
      <Link {...sharedProps} to={to}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a {...sharedProps} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button {...sharedProps} type={type}>
      {children}
    </button>
  );
});

export default MagneticButton;
