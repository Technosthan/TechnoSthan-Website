import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const NODES = [
  { x: 88, y: 184, r: 10, fill: "rgba(45, 212, 200, 0.9)" },
  { x: 262, y: 112, r: 12, fill: "rgba(239, 91, 42, 0.95)" },
  { x: 498, y: 184, r: 9, fill: "rgba(74, 141, 255, 0.9)" },
  { x: 702, y: 100, r: 11, fill: "rgba(45, 212, 200, 0.88)" },
  { x: 918, y: 194, r: 10, fill: "rgba(239, 91, 42, 0.9)" },
  { x: 1120, y: 136, r: 8, fill: "rgba(255, 255, 255, 0.82)" },
];

const LINES = [
  "M 0 158 C 118 88, 198 240, 314 156 S 522 54, 642 150 S 896 262, 1042 126 S 1136 60, 1200 94",
  "M 24 604 C 180 522, 258 670, 420 584 S 656 454, 818 540 S 1024 678, 1200 592",
  "M 204 0 C 160 116, 176 224, 230 330 S 314 540, 250 748",
];

const ContactEnterpriseBackground = () => {
  const rootRef = useRef(null);
  const lineRefs = useRef([]);
  const nodeRefs = useRef([]);
  const reducedMotion = useReducedMotion();

  const lineSetters = useMemo(
    () => LINES.map((_, index) => (node) => {
      lineRefs.current[index] = node;
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

      if (!rootRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        if (!reducedMotion) {
          lineRefs.current.filter(Boolean).forEach((line, index) => {
            const length = line.getTotalLength();
            gsap.set(line, {
              strokeDasharray: length,
              strokeDashoffset: length,
            });

            gsap.to(line, {
              strokeDashoffset: 0,
              duration: 1.4 + index * 0.1,
              ease: "power2.out",
              scrollTrigger: {
                trigger: rootRef.current,
                start: "top 88%",
                once: true,
              },
            });
          });

          gsap.to(nodeRefs.current.filter(Boolean), {
            y: "-=10",
            duration: 4.6,
            repeat: -1,
            yoyo: true,
            stagger: 0.15,
            ease: "sine.inOut",
          });
        }
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
        root.style.setProperty("--contact-pointer-x", `${clamp(x, 0, 100)}%`);
        root.style.setProperty("--contact-pointer-y", `${clamp(y, 0, 100)}%`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--contact-pointer-x", "64%");
      root.style.setProperty("--contact-pointer-y", "18%");
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
    <div className="contact-enterprise__background" ref={rootRef} aria-hidden="true">
      <div className="contact-enterprise__background-grid" />
      <div className="contact-enterprise__background-glow" />
      <div className="contact-enterprise__background-noise" />
      <svg className="contact-enterprise__background-network" viewBox="0 0 1200 760" preserveAspectRatio="none">
        <defs>
          <linearGradient id="contact-network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 200, 0.12)" />
            <stop offset="56%" stopColor="rgba(74, 141, 255, 0.68)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.36)" />
          </linearGradient>
          <radialGradient id="contact-node-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="100%" stopColor="rgba(45, 212, 200, 0.08)" />
          </radialGradient>
        </defs>

        {LINES.map((line, index) => (
          <path
            key={line}
            ref={lineSetters[index]}
            className={`contact-enterprise__line contact-enterprise__line--${index + 1}`}
            d={line}
          />
        ))}

        {NODES.map((node, index) => (
          <g key={`${node.x}-${node.y}`} ref={nodeSetters[index]}>
            <circle cx={node.x} cy={node.y} r={node.r * 1.8} fill="url(#contact-node-gradient)" opacity="0.24" />
            <circle cx={node.x} cy={node.y} r={node.r} fill={node.fill} />
          </g>
        ))}
      </svg>
      <div className="contact-enterprise__spotlight" />
    </div>
  );
};

export default ContactEnterpriseBackground;

