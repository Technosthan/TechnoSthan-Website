import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { gsap, ScrollTrigger, setupGsap } from "../../animations/gsapSetup";

const RouteTransitionShell = ({ children }) => {
  const shellRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setupGsap();

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    const node = shellRef.current;

    const context = gsap.context(() => {
      gsap.fromTo(
        shellRef.current,
        {
          autoAlpha: 0,
          y: 16,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        }
      );
    }, shellRef);

    return () => {
      context.revert();

      if (node) {
        ScrollTrigger.getAll().forEach((trigger) => {
          if (node.contains(trigger.trigger)) {
            trigger.kill();
          }
        });
      }
    };
  }, [location.pathname]);

  return <div ref={shellRef} className="route-transition-shell">{children}</div>;
};

export default RouteTransitionShell;
