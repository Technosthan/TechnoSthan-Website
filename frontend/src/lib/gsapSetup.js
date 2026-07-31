import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";

let isRegistered = false;

export const setupGsap = () => {
  if (typeof window === "undefined") {
    return { gsap, ScrollTrigger, Draggable };
  }

  if (!isRegistered) {
    gsap.registerPlugin(ScrollTrigger, Draggable);
    gsap.defaults({
      duration: 0.9,
      ease: "power3.out",
    });
    isRegistered = true;
  }

  return { gsap, ScrollTrigger, Draggable };
};

export const syncLenisToScrollTrigger = (lenis) => {
  if (!lenis) {
    return () => {};
  }

  const update = () => ScrollTrigger.update();
  lenis.on("scroll", update);

  return () => {
    lenis.off("scroll", update);
  };
};

export { gsap, ScrollTrigger, Draggable };
