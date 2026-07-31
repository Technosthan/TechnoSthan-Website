import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const NETWORK_LINES = [
  "M 0 182 C 160 118, 240 248, 382 182 S 658 92, 820 168 S 1040 272, 1200 140",
  "M 54 598 C 196 542, 292 630, 420 578 S 676 474, 840 548 S 1042 660, 1200 592",
  "M 120 24 C 176 164, 154 300, 224 412 S 374 568, 336 728",
  "M 956 20 C 900 168, 934 318, 840 420 S 674 596, 728 748",
];

const NETWORK_NODES = [
  { x: 382, y: 182, r: 12, fill: "rgba(239, 91, 42, 0.96)" },
  { x: 820, y: 168, r: 10, fill: "rgba(74, 141, 255, 0.92)" },
  { x: 420, y: 578, r: 10, fill: "rgba(45, 212, 200, 0.9)" },
  { x: 840, y: 548, r: 11, fill: "rgba(239, 91, 42, 0.9)" },
  { x: 224, y: 412, r: 8, fill: "rgba(255, 255, 255, 0.8)" },
  { x: 728, y: 748, r: 9, fill: "rgba(74, 141, 255, 0.82)" },
];

const ServicesBlueprintBackground = () => {
  const rootRef = useRef(null);
  const pathRefs = useRef([]);
  const nodeRefs = useRef([]);
  const reducedMotion = useReducedMotion();

  const pathSetters = useMemo(
    () => NETWORK_LINES.map((_, index) => (node) => {
      pathRefs.current[index] = node;
    }),
    []
  );

  const nodeSetters = useMemo(
    () => NETWORK_NODES.map((_, index) => (node) => {
      nodeRefs.current[index] = node;
    }),
    []
  );

  useGSAP(
    () => {
      setupGsap();

      if (!rootRef.current || reducedMotion) {
        return undefined;
      }

      const context = gsap.context(() => {
        pathRefs.current
          .filter(Boolean)
          .forEach((path, index) => {
            const length = path.getTotalLength();
            gsap.set(path, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });

            gsap.to(path, {
              strokeDashoffset: 0,
              duration: 1.5 + index * 0.12,
              ease: "power2.out",
              scrollTrigger: {
                trigger: rootRef.current,
                start: "top 90%",
                once: true,
              },
            });
          });

        gsap.to(nodeRefs.current.filter(Boolean), {
          y: "-=10",
          duration: 4.4,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: 0.2,
        });
      }, rootRef);

      return () => context.revert();
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  useEffect(() => {
    const root = rootRef.current;
    if (
      !root ||
      typeof window === "undefined" ||
      reducedMotion ||
      !window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches
    ) {
      return undefined;
    }

    let frame = 0;

    const updatePointer = (event) => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        root.style.setProperty("--services-pointer-x", `${clamp(x, 0, 100)}%`);
        root.style.setProperty("--services-pointer-y", `${clamp(y, 0, 100)}%`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--services-pointer-x", "64%");
      root.style.setProperty("--services-pointer-y", "20%");
    };

    resetPointer();
    root.addEventListener("pointermove", updatePointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer, { passive: true });

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion]);

  return (
    <div className={`services-enterprise__background ${reducedMotion ? "is-reduced" : ""}`.trim()} ref={rootRef} aria-hidden="true">
      <div className="services-enterprise__background-grid" />
      <div className="services-enterprise__background-glow" />
      <div className="services-enterprise__background-spotlight" />
      <div className="services-enterprise__background-noise" />

      <svg className="services-enterprise__background-network" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="services-network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 200, 0.12)" />
            <stop offset="52%" stopColor="rgba(74, 141, 255, 0.64)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.42)" />
          </linearGradient>
          <radialGradient id="services-node-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="100%" stopColor="rgba(45, 212, 200, 0.12)" />
          </radialGradient>
        </defs>

        {NETWORK_LINES.map((path, index) => (
          <path
            key={path}
            ref={pathSetters[index]}
            className={`services-enterprise__background-line services-enterprise__background-line--${index + 1}`}
            d={path}
          />
        ))}

        {NETWORK_NODES.map((node, index) => (
          <g
            key={`${node.x}-${node.y}`}
            ref={nodeSetters[index]}
            className="services-enterprise__background-node"
          >
            <circle cx={node.x} cy={node.y} r={node.r * 1.8} fill="url(#services-node-gradient)" opacity="0.26" />
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.fill} />
          </g>
        ))}
      </svg>
    </div>
  );
};

export default ServicesBlueprintBackground;

