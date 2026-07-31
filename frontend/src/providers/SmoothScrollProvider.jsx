import { useEffect, useMemo } from "react";

import useReducedMotion from "../lib/useReducedMotion";
import useLenis from "../lib/useLenis";
import { setupGsap } from "../lib/gsapSetup";
import { refreshScrollTriggers } from "../animations/scrollAnimations";
import { useAppMotion } from "./AppMotionProvider";

const isLowPerformanceDevice = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const pointerFine = window.matchMedia?.("(pointer: fine)")?.matches;
  const saveData = navigator.connection?.saveData;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  return !pointerFine || saveData || hardwareConcurrency < 4;
};

const SmoothScrollProvider = ({ children }) => {
  const reducedMotion = useReducedMotion();
  const { isLoading } = useAppMotion();
  const allowSmoothScroll = useMemo(
    () => !reducedMotion && !isLowPerformanceDevice(),
    [reducedMotion]
  );

  useLenis({
    enabled: allowSmoothScroll,
    paused: isLoading,
  });

  useEffect(() => {
    setupGsap();
    document.body.style.overflow = isLoading ? "hidden" : "";

    if (!allowSmoothScroll || isLoading) {
      return () => {
        document.body.style.overflow = "";
      };
    }

    const frame = window.requestAnimationFrame(() => {
      refreshScrollTriggers();
    });

    return () => {
      window.cancelAnimationFrame(frame);
      document.body.style.overflow = "";
    };
  }, [allowSmoothScroll, isLoading]);

  return children;
};

export default SmoothScrollProvider;
