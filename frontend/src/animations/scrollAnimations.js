import { gsap, ScrollTrigger } from "./gsapSetup";

let refreshFrame = null;

export const refreshScrollTriggers = () => {
  if (typeof window === "undefined") {
    return;
  }

  if (refreshFrame) {
    return;
  }

  refreshFrame = window.requestAnimationFrame(() => {
    refreshFrame = null;
    ScrollTrigger.refresh();
  });
};

export const killScrollTriggers = (scope) => {
  if (scope) {
    ScrollTrigger.getAll().forEach((trigger) => {
      if (scope.contains(trigger.trigger)) {
        trigger.kill();
      }
    });
    return;
  }

  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
};

export const setSectionMotionState = (element, active) => {
  if (!element) {
    return;
  }

  gsap.set(element, {
    autoAlpha: active ? 1 : 0,
  });
};
