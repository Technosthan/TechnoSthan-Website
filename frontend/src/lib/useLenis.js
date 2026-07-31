import { useEffect, useRef } from "react";
import Lenis from "lenis";

import useReducedMotion from "./useReducedMotion";
import { gsap, setupGsap, syncLenisToScrollTrigger } from "./gsapSetup";

const isLowPerformanceDevice = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const pointerFine = window.matchMedia?.("(pointer: fine)")?.matches;
  const saveData = navigator.connection?.saveData;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;

  return !pointerFine || saveData || hardwareConcurrency < 4;
};

const useLenis = ({
  enabled = true,
  paused = false,
  duration = 1.1,
  smoothTouch = false,
  lerp = 0.08,
  wheelMultiplier = 1,
  touchMultiplier = 1.5,
} = {}) => {
  const lenisRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setupGsap();

    if (
      typeof window === "undefined" ||
      reducedMotion ||
      !enabled ||
      isLowPerformanceDevice()
    ) {
      return undefined;
    }

    const lenis = new Lenis({
      duration,
      smoothWheel: true,
      smoothTouch,
      touchMultiplier,
      wheelMultiplier,
      lerp,
    });

    lenisRef.current = lenis;

    const disconnectScrollTrigger = syncLenisToScrollTrigger(lenis);
    const raf = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    if (paused) {
      lenis.stop();
    }

    return () => {
      disconnectScrollTrigger();
      gsap.ticker.remove(raf);
      lenis.start();
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [
    duration,
    enabled,
    lerp,
    paused,
    reducedMotion,
    smoothTouch,
    touchMultiplier,
    wheelMultiplier,
  ]);

  useEffect(() => {
    if (!lenisRef.current || reducedMotion || !enabled) {
      return undefined;
    }

    if (paused) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
    }

    return undefined;
  }, [enabled, paused, reducedMotion]);

  return lenisRef;
};

export default useLenis;
