import { useEffect } from "react";
import { gsap } from "../animations/gsapSetup";

const useMagnetic = (scopeRef, selector = "[data-magnetic]") => {
  useEffect(() => {
    const scope = scopeRef.current;

    if (
      !scope ||
      typeof window === "undefined" ||
      !window.matchMedia?.("(pointer: fine)")?.matches
    ) {
      return undefined;
    }

    const targets = Array.from(scope.querySelectorAll(selector));
    if (targets.length === 0) {
      return undefined;
    }

    const quickSets = new Map();
    const centerCache = new Map();

    const cacheCenter = (target) => {
      const rect = target.getBoundingClientRect();
      centerCache.set(target, {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    };

    targets.forEach((target) => {
      cacheCenter(target);
      quickSets.set(target, {
        x: gsap.quickTo(target, "x", {
          duration: 0.22,
          ease: "power3.out",
        }),
        y: gsap.quickTo(target, "y", {
          duration: 0.22,
          ease: "power3.out",
        }),
        rotation: gsap.quickTo(target, "rotation", {
          duration: 0.26,
          ease: "power2.out",
        }),
      });
    });

    const handleMove = (event) => {
      const target = event.target?.closest?.(selector);
      if (!target || !scope.contains(target)) {
        return;
      }

      const center = centerCache.get(target) || cacheCenter(target) || centerCache.get(target);
      const dx = event.clientX - (center?.x || 0);
      const dy = event.clientY - (center?.y || 0);
      const quick = quickSets.get(target);

      if (!quick) {
        return;
      }

      quick.x(dx * 0.12);
      quick.y(dy * 0.12);
      quick.rotation(dx * 0.015);
    };

    const handleLeave = (event) => {
      const target = event.target?.closest?.(selector);
      const quick = target ? quickSets.get(target) : null;

      if (!quick) {
        return;
      }

      quick.x(0);
      quick.y(0);
      quick.rotation(0);
    };

    const handleEnter = (event) => {
      const target = event.target?.closest?.(selector);
      if (target && scope.contains(target)) {
        cacheCenter(target);
      }
    };

    scope.addEventListener("pointerenter", handleEnter, { passive: true });
    scope.addEventListener("pointermove", handleMove, { passive: true });
    scope.addEventListener("pointerleave", handleLeave, { passive: true });

    return () => {
      scope.removeEventListener("pointerenter", handleEnter);
      scope.removeEventListener("pointermove", handleMove);
      scope.removeEventListener("pointerleave", handleLeave);
      quickSets.forEach((quick) => {
        gsap.killTweensOf([
          quick.x,
          quick.y,
          quick.rotation,
        ]);
      });
      quickSets.clear();
      centerCache.clear();
    };
  }, [scopeRef, selector]);
};

export default useMagnetic;
