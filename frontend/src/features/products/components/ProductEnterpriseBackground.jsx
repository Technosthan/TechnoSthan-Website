import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const PATHS = [
  "M 0 170 C 144 106, 238 246, 378 178 S 664 86, 824 170 S 1044 270, 1200 142",
  "M 72 594 C 192 540, 286 630, 418 574 S 678 474, 842 548 S 1044 664, 1200 594",
  "M 112 30 C 172 166, 150 292, 230 406 S 360 576, 314 748",
];

const NODES = [
  { x: 374, y: 178, r: 12, fill: "rgba(239, 91, 42, 0.96)" },
  { x: 824, y: 170, r: 10, fill: "rgba(74, 141, 255, 0.92)" },
  { x: 418, y: 574, r: 10, fill: "rgba(45, 212, 200, 0.92)" },
  { x: 230, y: 406, r: 8, fill: "rgba(255, 255, 255, 0.82)" },
  { x: 312, y: 300, r: 9, fill: "rgba(74, 141, 255, 0.8)" },
];

const ProductEnterpriseBackground = () => {
  const rootRef = useRef(null);
  const pathRefs = useRef([]);
  const nodeRefs = useRef([]);
  const reducedMotion = useReducedMotion();

  const pathSetters = useMemo(
    () => PATHS.map((_, index) => (node) => {
      pathRefs.current[index] = node;
    }),
    []
  );

  const nodeSetters = useMemo(
    () => NODES.map((_, index) => (node) => {
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
        pathRefs.current.filter(Boolean).forEach((path, index) => {
          const length = path.getTotalLength();
          gsap.set(path, {
            strokeDasharray: length,
            strokeDashoffset: length,
          });

          gsap.to(path, {
            strokeDashoffset: 0,
            duration: 1.4 + index * 0.12,
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
          duration: 4.6,
          repeat: -1,
          yoyo: true,
          stagger: 0.16,
          ease: "sine.inOut",
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
      if (frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        root.style.setProperty("--products-pointer-x", `${clamp(x, 0, 100)}%`);
        root.style.setProperty("--products-pointer-y", `${clamp(y, 0, 100)}%`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--products-pointer-x", "64%");
      root.style.setProperty("--products-pointer-y", "18%");
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
    <div className="products-enterprise__background" ref={rootRef} aria-hidden="true">
      <div className="products-enterprise__background-grid" />
      <div className="products-enterprise__background-glow" />
      <div className="products-enterprise__background-noise" />
      <svg className="products-enterprise__background-network" viewBox="0 0 1200 760" preserveAspectRatio="none">
        <defs>
          <linearGradient id="products-network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 200, 0.12)" />
            <stop offset="52%" stopColor="rgba(74, 141, 255, 0.7)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.36)" />
          </linearGradient>
          <radialGradient id="products-node-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="100%" stopColor="rgba(45, 212, 200, 0.08)" />
          </radialGradient>
        </defs>

        {PATHS.map((path, index) => (
          <path
            key={path}
            ref={pathSetters[index]}
            className={`products-enterprise__line products-enterprise__line--${index + 1}`}
            d={path}
          />
        ))}

        {NODES.map((node, index) => (
          <g key={`${node.x}-${node.y}`} ref={nodeSetters[index]}>
            <circle cx={node.x} cy={node.y} r={node.r * 1.8} fill="url(#products-node-gradient)" opacity="0.24" />
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.fill} />
          </g>
        ))}
      </svg>
      <div className="products-enterprise__spotlight" />
    </div>
  );
};

export default ProductEnterpriseBackground;

