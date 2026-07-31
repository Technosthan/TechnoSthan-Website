import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../animations/gsapSetup";
import useReducedMotion from "../../hooks/useReducedMotion";

const DEFAULT_PAIRS = [
  ["Transforming Business", "Through Modern Technology"],
  ["Engineering Systems", "That Scale With You"],
  ["Building Digital Products", "For Real-World Impact"],
  ["Accelerating Growth", "Through Intelligent Software"],
];

const TextRotator = ({ pairs = DEFAULT_PAIRS, className = "", interval = 4200 }) => {
  const reducedMotion = useReducedMotion();
  const viewportRef = useRef(null);
  const currentGroupRef = useRef(null);
  const nextGroupRef = useRef(null);
  const timerRef = useRef(0);
  const visibleRef = useRef(true);
  const timerActiveRef = useRef(false);
  const transitioningRef = useRef(false);
  const activeIndexRef = useRef(0);
  const timelineRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const safePairs = useMemo(() => {
    const next = Array.isArray(pairs) ? pairs.filter(Boolean) : [];
    return next.length > 0 ? next : DEFAULT_PAIRS;
  }, [pairs]);

  const currentPair = safePairs[activeIndex % safePairs.length];
  const nextPair = safePairs[(activeIndex + 1) % safePairs.length];

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !viewportRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        gsap.set(currentGroupRef.current, {
          yPercent: 0,
          autoAlpha: 1,
        });
        gsap.set(nextGroupRef.current, {
          yPercent: 110,
          autoAlpha: 0,
          visibility: "hidden",
        });
      }, viewportRef);

      return () => context.revert();
    },
    { scope: viewportRef, dependencies: [reducedMotion, safePairs.length], revertOnUpdate: true }
  );

  useEffect(() => {
    if (reducedMotion || safePairs.length < 2) {
      return undefined;
    }

    const handleVisibility = () => {
      visibleRef.current = !document.hidden;

      if (document.hidden) {
        window.clearInterval(timerRef.current);
        timerRef.current = 0;
        timerActiveRef.current = false;
        return;
      }

      if (!timerActiveRef.current) {
        timerRef.current = window.setInterval(rotate, interval);
        timerActiveRef.current = true;
      }
    };

    const rotate = () => {
      if (
        !viewportRef.current ||
        !currentGroupRef.current ||
        !nextGroupRef.current ||
        !visibleRef.current ||
        transitioningRef.current
      ) {
        return;
      }

      const nextIndex = (activeIndexRef.current + 1) % safePairs.length;
      const incomingPair = safePairs[nextIndex];
      transitioningRef.current = true;

      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      nextGroupRef.current.querySelector("[data-rotator-line='a']").textContent =
        incomingPair[0] || "";
      nextGroupRef.current.querySelector("[data-rotator-line='b']").textContent =
        incomingPair[1] || "";

      gsap.set(nextGroupRef.current, {
        yPercent: 110,
        autoAlpha: 1,
        visibility: "visible",
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
          gsap.set(currentGroupRef.current, {
            yPercent: 0,
            autoAlpha: 1,
            visibility: "visible",
          });
          gsap.set(nextGroupRef.current, {
            yPercent: 110,
            autoAlpha: 0,
            visibility: "hidden",
          });
          transitioningRef.current = false;
        },
      });
      timelineRef.current = timeline;

      timeline.to(currentGroupRef.current, {
        yPercent: -110,
        autoAlpha: 0,
        duration: 0.78,
      }).to(
        nextGroupRef.current,
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 0.78,
        },
        "<"
      );
    };

    window.clearInterval(timerRef.current);
    timerActiveRef.current = true;
    document.addEventListener("visibilitychange", handleVisibility);
    timerRef.current = window.setInterval(rotate, interval);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.clearInterval(timerRef.current);
      timerRef.current = 0;
      timerActiveRef.current = false;
      if (timelineRef.current) {
        timelineRef.current.kill();
        timelineRef.current = null;
      }
    };
  }, [interval, reducedMotion, safePairs]);

  if (safePairs.length === 0) {
    return null;
  }

  return (
    <div
      className={`hero-title-viewport hero-title-viewport--rotator ${className}`.trim()}
      ref={viewportRef}
    >
      <div className="hero-title-slide">
        <div className="hero-title-group is-current" ref={currentGroupRef}>
          <span data-rotator-line="a">{currentPair[0]}</span>
          <span data-rotator-line="b">{currentPair[1]}</span>
        </div>
        <div className="hero-title-group is-next" ref={nextGroupRef} aria-hidden="true">
          <span data-rotator-line="a">{nextPair[0]}</span>
          <span data-rotator-line="b">{nextPair[1]}</span>
        </div>
      </div>
    </div>
  );
};

export default TextRotator;
