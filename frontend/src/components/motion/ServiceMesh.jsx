import { useEffect, useMemo, useRef } from "react";

import { gsap } from "../../animations/gsapSetup";
import useReducedMotion from "../../lib/useReducedMotion";
import "./service-mesh.css";

const canUsePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

const VARIANT_MAP = {
  web: {
    label: "Wireframe Grid",
    svg: (
      <>
        <rect x="48" y="36" width="224" height="148" rx="22" className="service-mesh-frame" />
        <path d="M48 80H272M48 120H272M48 160H272M96 36V184M160 36V184M224 36V184" className="service-mesh-line" />
        <path d="M72 56L120 96L88 136L146 166L194 106L236 148" className="service-mesh-path" />
        <circle cx="72" cy="56" r="5" className="service-mesh-node" />
        <circle cx="120" cy="96" r="6" className="service-mesh-node" />
        <circle cx="88" cy="136" r="4.5" className="service-mesh-node" />
        <circle cx="146" cy="166" r="5" className="service-mesh-node" />
        <circle cx="194" cy="106" r="6" className="service-mesh-node" />
        <circle cx="236" cy="148" r="4.5" className="service-mesh-node" />
      </>
    ),
  },
  mobile: {
    label: "Touch Orbit",
    svg: (
      <>
        <rect x="108" y="28" width="104" height="164" rx="30" className="service-mesh-device" />
        <rect x="136" y="40" width="48" height="4" rx="2" className="service-mesh-detail" />
        <circle cx="160" cy="166" r="7" className="service-mesh-node" />
        <path d="M160 52C192 62 214 86 212 116C210 146 190 164 160 168C130 164 110 146 108 116C106 86 128 62 160 52Z" className="service-mesh-orbit" />
        <path d="M128 92C144 78 176 78 192 92M124 120C144 140 176 140 196 120" className="service-mesh-path" />
        <circle cx="128" cy="92" r="5" className="service-mesh-node" />
        <circle cx="192" cy="92" r="5" className="service-mesh-node" />
        <circle cx="124" cy="120" r="4.5" className="service-mesh-node" />
        <circle cx="196" cy="120" r="4.5" className="service-mesh-node" />
      </>
    ),
  },
  cloud: {
    label: "Distributed Cloud",
    svg: (
      <>
        <circle cx="160" cy="104" r="54" className="service-mesh-cloud" />
        <circle cx="92" cy="74" r="18" className="service-mesh-cloud-node" />
        <circle cx="228" cy="76" r="18" className="service-mesh-cloud-node" />
        <circle cx="104" cy="156" r="22" className="service-mesh-cloud-node" />
        <circle cx="220" cy="154" r="24" className="service-mesh-cloud-node" />
        <path d="M110 78L136 96M210 78L184 96M100 140L130 122M220 140L190 122M142 110H178" className="service-mesh-line" />
        <circle cx="160" cy="104" r="10" className="service-mesh-node" />
      </>
    ),
  },
  devops: {
    label: "Pipeline Loop",
    svg: (
      <>
        <path d="M70 112C98 64 128 52 160 52C192 52 222 64 250 112C222 160 192 172 160 172C128 172 98 160 70 112Z" className="service-mesh-loop" />
        <path d="M88 112H128M192 112H232M160 72V112M160 112V152" className="service-mesh-line" />
        <rect x="84" y="96" width="28" height="32" rx="8" className="service-mesh-stage" />
        <rect x="136" y="60" width="48" height="28" rx="10" className="service-mesh-stage" />
        <rect x="208" y="96" width="28" height="32" rx="8" className="service-mesh-stage" />
        <rect x="136" y="136" width="48" height="28" rx="10" className="service-mesh-stage" />
        <circle cx="98" cy="112" r="5" className="service-mesh-node" />
        <circle cx="160" cy="74" r="5" className="service-mesh-node" />
        <circle cx="222" cy="112" r="5" className="service-mesh-node" />
        <circle cx="160" cy="150" r="5" className="service-mesh-node" />
      </>
    ),
  },
  ai: {
    label: "Neural Mesh",
    svg: (
      <>
        <path d="M56 150L104 106L136 82L184 66L240 92" className="service-mesh-path" />
        <path d="M60 78L106 92L146 132L188 104L236 132" className="service-mesh-line" />
        <circle cx="86" cy="82" r="16" className="service-mesh-ai-core" />
        <circle cx="160" cy="104" r="22" className="service-mesh-ai-core" />
        <circle cx="220" cy="128" r="16" className="service-mesh-ai-core" />
        <circle cx="104" cy="106" r="5" className="service-mesh-node" />
        <circle cx="136" cy="82" r="5" className="service-mesh-node" />
        <circle cx="184" cy="66" r="5" className="service-mesh-node" />
        <circle cx="240" cy="92" r="5" className="service-mesh-node" />
        <circle cx="60" cy="78" r="5" className="service-mesh-node" />
        <circle cx="146" cy="132" r="5" className="service-mesh-node" />
        <circle cx="188" cy="104" r="5" className="service-mesh-node" />
        <circle cx="236" cy="132" r="5" className="service-mesh-node" />
      </>
    ),
  },
};

const resolveVariant = (variant, title = "") => {
  const normalized = String(variant || "").toLowerCase();

  if (VARIANT_MAP[normalized]) {
    return normalized;
  }

  const text = String(title || "").toLowerCase();
  if (text.includes("mobile")) return "mobile";
  if (text.includes("cloud")) return "cloud";
  if (text.includes("devops")) return "devops";
  if (text.includes("ai") || text.includes("automation")) return "ai";
  return "web";
};

const ServiceMesh = ({ variant, title, accent = "var(--accent-primary)" }) => {
  const reducedMotion = useReducedMotion();
  const meshRef = useRef(null);
  const frameRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0, active: 0 });
  const resolvedVariant = useMemo(() => resolveVariant(variant, title), [title, variant]);
  const mesh = VARIANT_MAP[resolvedVariant] || VARIANT_MAP.web;

  useEffect(() => {
    const element = meshRef.current;
    if (!element || reducedMotion || !canUsePointer()) {
      return undefined;
    }

    const moveX = gsap.quickTo(element, "x", {
      duration: 0.28,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(element, "y", {
      duration: 0.28,
      ease: "power3.out",
    });
    const tiltX = gsap.quickTo(element, "rotationX", {
      duration: 0.32,
      ease: "power3.out",
    });
    const tiltY = gsap.quickTo(element, "rotationY", {
      duration: 0.32,
      ease: "power3.out",
    });
    const shiftZ = gsap.quickTo(element, "z", {
      duration: 0.3,
      ease: "power3.out",
    });

    const reset = () => {
      moveX(0);
      moveY(0);
      tiltX(0);
      tiltY(0);
      shiftZ(0);
      pointerRef.current.active = 0;
      element.dataset.meshState = "idle";
    };

    const handleMove = (event) => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;

      pointerRef.current = { x, y, active: 1 };
      moveX(x * 18);
      moveY(y * 12);
      tiltX(y * -8);
      tiltY(x * 8);
      shiftZ(Math.min(12, Math.hypot(x, y) * 10));
      element.dataset.meshState = "active";
      element.style.setProperty("--mesh-pointer-x", `${50 + x * 22}%`);
      element.style.setProperty("--mesh-pointer-y", `${50 + y * 22}%`);
    };

    const handleLeave = () => {
      reset();
      element.style.setProperty("--mesh-pointer-x", "50%");
      element.style.setProperty("--mesh-pointer-y", "50%");
    };

    const animate = () => {
      const next = pointerRef.current.active * 0.9;
      pointerRef.current.active = next;
      element.style.setProperty("--mesh-focus", String(next));
      frameRef.current = window.requestAnimationFrame(animate);
    };

    element.addEventListener("pointermove", handleMove, { passive: true });
    element.addEventListener("pointerleave", handleLeave, { passive: true });
    element.addEventListener("focusout", handleLeave);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
      element.removeEventListener("pointermove", handleMove);
      element.removeEventListener("pointerleave", handleLeave);
      element.removeEventListener("focusout", handleLeave);
      reset();
    };
  }, [reducedMotion]);

  return (
    <div
      className={`service-mesh service-mesh--${resolvedVariant}`.trim()}
      ref={meshRef}
      data-motion-focus="service-mesh"
      style={{ "--mesh-accent": accent }}
      aria-hidden="true"
    >
      <div className="service-mesh-glow" />
      <svg viewBox="0 0 320 220" className="service-mesh-svg" role="presentation">
        <defs>
          <linearGradient id={`service-mesh-line-${resolvedVariant}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="var(--mesh-accent)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="var(--accent-secondary)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {mesh.svg}
      </svg>
      <span className="service-mesh-label">{mesh.label}</span>
    </div>
  );
};

export default ServiceMesh;
