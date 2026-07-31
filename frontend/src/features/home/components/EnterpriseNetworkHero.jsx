import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiArrowRight,
  FiCloud,
  FiCpu,
  FiDatabase,
  FiLayers,
  FiServer,
  FiShield,
  FiSmartphone,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { useAppMotion } from "../../../providers/AppMotionProvider";
import MagneticButton from "../../../components/motion/MagneticButton";
import "./enterprise-network-hero.css";

const CHIP_ITEMS = [
  { label: "Enterprise Software", icon: FiLayers },
  { label: "AI Solutions", icon: FiCpu },
  { label: "Cloud Engineering", icon: FiCloud },
  { label: "Cyber Security", icon: FiShield },
];

const NODE_DEFINITIONS = [
  { label: "Web Development", icon: FiLayers },
  { label: "Cloud Infrastructure", icon: FiCloud },
  { label: "AI Automation", icon: FiCpu },
  { label: "DevOps & CI/CD", icon: FiServer },
  { label: "Security & Compliance", icon: FiShield },
  { label: "Database Systems", icon: FiDatabase },
  { label: "Mobile Engineering", icon: FiSmartphone },
];

const ORBIT_LAYOUTS = {
  desktop: [
    {
      key: "inner",
      radiusX: 172,
      radiusY: 118,
      tilt: -8,
      duration: 9,
      direction: 1,
      nodes: [{ index: 2, phase: 18 }],
    },
    {
      key: "inner-b",
      radiusX: 222,
      radiusY: 152,
      tilt: 10,
      duration: 12,
      direction: -1,
      nodes: [{ index: 6, phase: 72 }],
    },
    {
      key: "middle",
      radiusX: 274,
      radiusY: 188,
      tilt: -14,
      duration: 15,
      direction: 1,
      nodes: [{ index: 0, phase: 126 }],
    },
    {
      key: "middle-b",
      radiusX: 326,
      radiusY: 224,
      tilt: 16,
      duration: 19,
      direction: -1,
      nodes: [{ index: 3, phase: 180 }],
    },
    {
      key: "outer",
      radiusX: 378,
      radiusY: 258,
      tilt: -10,
      duration: 24,
      direction: 1,
      nodes: [{ index: 1, phase: 234 }],
    },
    {
      key: "outer-b",
      radiusX: 430,
      radiusY: 292,
      tilt: 8,
      duration: 30,
      direction: -1,
      nodes: [{ index: 4, phase: 288 }],
    },
    {
      key: "wide",
      radiusX: 482,
      radiusY: 324,
      tilt: -6,
      duration: 36,
      direction: 1,
      nodes: [{ index: 5, phase: 342 }],
    },
  ],
  tablet: [
    {
      key: "inner",
      radiusX: 148,
      radiusY: 104,
      tilt: -8,
      duration: 10,
      direction: 1,
      nodes: [{ index: 2, phase: 18 }],
    },
    {
      key: "inner-b",
      radiusX: 194,
      radiusY: 136,
      tilt: 10,
      duration: 13,
      direction: -1,
      nodes: [{ index: 6, phase: 72 }],
    },
    {
      key: "middle",
      radiusX: 240,
      radiusY: 166,
      tilt: -14,
      duration: 16,
      direction: 1,
      nodes: [{ index: 0, phase: 126 }],
    },
    {
      key: "middle-b",
      radiusX: 286,
      radiusY: 198,
      tilt: 16,
      duration: 20,
      direction: -1,
      nodes: [{ index: 3, phase: 180 }],
    },
    {
      key: "outer",
      radiusX: 332,
      radiusY: 228,
      tilt: -10,
      duration: 25,
      direction: 1,
      nodes: [{ index: 1, phase: 234 }],
    },
    {
      key: "outer-b",
      radiusX: 378,
      radiusY: 258,
      tilt: 8,
      duration: 31,
      direction: -1,
      nodes: [{ index: 4, phase: 288 }],
    },
    {
      key: "wide",
      radiusX: 420,
      radiusY: 286,
      tilt: -6,
      duration: 37,
      direction: 1,
      nodes: [{ index: 5, phase: 342 }],
    },
  ],
  mobile: [
    {
      key: "inner",
      radiusX: 132,
      radiusY: 92,
      tilt: -8,
      duration: 10,
      direction: 1,
      nodes: [{ index: 2, phase: 18 }],
    },
    {
      key: "inner-b",
      radiusX: 168,
      radiusY: 120,
      tilt: 10,
      duration: 13,
      direction: -1,
      nodes: [{ index: 6, phase: 72 }],
    },
    {
      key: "middle",
      radiusX: 206,
      radiusY: 148,
      tilt: -14,
      duration: 16,
      direction: 1,
      nodes: [{ index: 0, phase: 126 }],
    },
    {
      key: "middle-b",
      radiusX: 244,
      radiusY: 176,
      tilt: 16,
      duration: 20,
      direction: -1,
      nodes: [{ index: 3, phase: 180 }],
    },
    {
      key: "outer",
      radiusX: 282,
      radiusY: 202,
      tilt: -10,
      duration: 25,
      direction: 1,
      nodes: [{ index: 1, phase: 234 }],
    },
    {
      key: "outer-b",
      radiusX: 318,
      radiusY: 228,
      tilt: 8,
      duration: 31,
      direction: -1,
      nodes: [{ index: 4, phase: 288 }],
    },
    {
      key: "wide",
      radiusX: 352,
      radiusY: 254,
      tilt: -6,
      duration: 37,
      direction: 1,
      nodes: [{ index: 5, phase: 342 }],
    },
  ],
};

const makeSeed = (index, offset = 0) => {
  const value = Math.sin(index * 71.17 + offset * 19.31) * 10000;
  return value - Math.floor(value);
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const polarPoint = (angle, radiusX, radiusY) => {
  const radians = (angle * Math.PI) / 180;
  return {
    x: 500 + Math.cos(radians) * radiusX,
    y: 500 + Math.sin(radians) * radiusY,
  };
};

const rotatePoint = (point, angle, centerX = 500, centerY = 500) => {
  if (!angle) {
    return point;
  }

  const radians = (angle * Math.PI) / 180;
  const deltaX = point.x - centerX;
  const deltaY = point.y - centerY;

  return {
    x: centerX + deltaX * Math.cos(radians) - deltaY * Math.sin(radians),
    y: centerY + deltaX * Math.sin(radians) + deltaY * Math.cos(radians),
  };
};

const buildOrbitLayout = (width = 1440) => {
  const key = width < 760 ? "mobile" : width < 1120 ? "tablet" : "desktop";

  const orbitGroups = ORBIT_LAYOUTS[key].map((group, orbitIndex) => ({
    ...group,
    orbitIndex,
    nodes: group.nodes.map((entry, nodeIndex) => {
      const node = NODE_DEFINITIONS[entry.index];
      const point = rotatePoint(
        polarPoint(entry.phase, group.radiusX, group.radiusY),
        group.tilt,
      );
      const depthBias = clamp(
        0.82 + Math.sin((entry.phase + group.tilt) * (Math.PI / 180)) * 0.12,
        0.74,
        1,
      );

      return {
        ...node,
        nodeIndex: entry.index,
        nodeOrder: nodeIndex,
        phase: entry.phase,
        point,
        depthBias,
      };
    }),
  }));

  const particleCount = key === "mobile" ? 82 : key === "tablet" ? 118 : 156;

  return {
    key,
    orbitGroups,
    particleCount,
  };
};

const createParticles = (layout) => {
  const orbits = layout.orbitGroups.length;

  return Array.from({ length: layout.particleCount }, (_, index) => {
    const orbitIndex = index % orbits;
    const orbit = layout.orbitGroups[orbitIndex];
    const seed = makeSeed(index, orbitIndex + 1);

    return {
      id: `${layout.key}-${index}`,
      orbitIndex,
      phase: seed * 360,
      speed: 0.4 + seed * 0.52,
      size: 0.6 + seed * 1.1,
      alpha: 0.16 + seed * 0.32,
      twinkle: 0.6 + makeSeed(index, 9) * 0.82,
      trail: 0.04 + makeSeed(index, 11) * 0.08,
      drift: (0.14 + makeSeed(index, 13) * 0.26) * (orbit?.direction || 1),
      direction: seed > 0.5 ? 1 : -1,
      color:
        seed > 0.48 ? "rgba(90, 191, 255, 0.95)" : "rgba(239, 91, 42, 0.95)",
      glow: 0.42 + makeSeed(index, 7) * 0.38,
    };
  });
};

const EnterpriseCoreVisual = ({ reducedMotion }) => {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef({});
  const frameRef = useRef(0);
  const particlesRef = useRef([]);
  const paletteRef = useRef({
    accent: "rgb(239, 91, 42)",
    accentMuted: "rgba(239, 91, 42, 0.18)",
  });
  const hoverOrbitRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [hoveredOrbitKey, setHoveredOrbitKey] = useState(null);
  const [isEarthHovered, setIsEarthHovered] = useState(false);

  const layout = useMemo(
    () => buildOrbitLayout(viewportWidth),
    [viewportWidth],
  );

  useEffect(() => {
    hoverOrbitRef.current = hoveredOrbitKey;
  }, [hoveredOrbitKey]);

  useEffect(() => {
    particlesRef.current = createParticles(layout);
  }, [layout]);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const syncCanvas = () => {
      const canvas = canvasRef.current;
      const rect = root.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.max(1, window.devicePixelRatio || 1);

      setViewportWidth(width);

      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return;
      }

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paletteRef.current = {
        accent:
          getComputedStyle(root).getPropertyValue("--accent-primary").trim() ||
          "rgb(239, 91, 42)",
        accentMuted:
          getComputedStyle(root).getPropertyValue("--accent-primary").trim() ||
          "rgba(239, 91, 42, 0.18)",
      };
    };

    syncCanvas();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncCanvas);
      observer.observe(root);

      return () => {
        observer.disconnect();
      };
    }

    window.addEventListener("resize", syncCanvas, { passive: true });

    return () => {
      window.removeEventListener("resize", syncCanvas);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = entry.isIntersecting;
        setIsVisible(nextVisible);
      },
      { threshold: 0.12 },
    );

    observer.observe(root);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      const nextVisible = !document.hidden;
      setIsTabVisible(nextVisible);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return undefined;
    }

    const isFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    if (!isFinePointer) {
      root.style.setProperty("--hero-pointer-x", "50%");
      root.style.setProperty("--hero-pointer-y", "50%");
      return undefined;
    }

    const handlePointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      root.style.setProperty("--hero-pointer-x", `${clamp(x, 0, 100)}%`);
      root.style.setProperty("--hero-pointer-y", `${clamp(y, 0, 100)}%`);
    };

    const handlePointerLeave = () => {
      root.style.setProperty("--hero-pointer-x", "50%");
      root.style.setProperty("--hero-pointer-y", "50%");
    };

    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
      handlePointerLeave();
    };
  }, []);

  const drawFrame = useCallback(
    (elapsedSeconds, staticMode = false) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const width = canvas?.clientWidth || 0;
      const height = canvas?.clientHeight || 0;

      if (!canvas || !context || !width || !height) {
        return;
      }

      context.clearRect(0, 0, width, height);

      const accent = paletteRef.current.accent || "rgb(239, 91, 42)";
      const accentMuted =
        paletteRef.current.accentMuted || "rgba(239, 91, 42, 0.18)";
      const hoveredKey = hoverOrbitRef.current;
      context.save();
      context.globalCompositeOperation = "source-over";
      context.lineCap = "round";
      context.lineJoin = "round";

      particlesRef.current.forEach((particle) => {
        const orbit = layout.orbitGroups[particle.orbitIndex];

        if (!orbit) {
          return;
        }

        const hoverFactor = hoveredKey
          ? hoveredKey === orbit.key
            ? 1.18
            : 0.88
          : 1;
        const earthBoost = isEarthHovered ? 1.12 : 1;
        const motion = staticMode
          ? 0
          : elapsedSeconds *
            (360 / orbit.duration) *
            orbit.direction *
            particle.speed *
            hoverFactor *
            earthBoost *
            particle.direction;
        const angle =
          particle.phase + motion + particle.drift * elapsedSeconds * 10;
        const radiusX =
          orbit.radiusX + Math.sin(elapsedSeconds * 1.2 + particle.phase) * 1.8;
        const radiusY =
          orbit.radiusY +
          Math.cos(elapsedSeconds * 1.05 + particle.phase) * 1.2;
        const point = rotatePoint(
          polarPoint(angle, radiusX, radiusY),
          orbit.tilt,
          500,
          500,
        );
        const x = (point.x / 1000) * width;
        const y = (point.y / 1000) * height;

        if (particle.prevX != null && particle.prevY != null) {
          context.strokeStyle = particle.color || accentMuted;
          context.globalAlpha =
            particle.trail * (hoveredKey === orbit.key ? 1.4 : 0.95);
          context.lineWidth = Math.max(0.75, particle.size * 0.55);
          context.beginPath();
          context.moveTo(particle.prevX, particle.prevY);
          context.lineTo(x, y);
          context.stroke();
        }

        context.globalAlpha =
          particle.alpha * (hoveredKey === orbit.key ? 1.5 : 1);
        context.fillStyle = particle.color || accent;
        context.shadowBlur = 8;
        context.shadowColor = particle.color || accent;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        particle.prevX = x;
        particle.prevY = y;
      });

      context.restore();

      layout.orbitGroups.forEach((group) => {
        const groupMotion = hoveredKey
          ? hoveredKey === group.key
            ? 0.38
            : 0.84
          : 1;

        group.nodes.forEach((node) => {
          const orbitKey = `${group.key}-${node.nodeIndex}`;
          const element = nodeRefs.current[orbitKey];

          if (!element) {
            return;
          }

          const angle = staticMode
            ? node.phase
            : node.phase +
              elapsedSeconds *
                (360 / group.duration) *
                group.direction *
                groupMotion;
          const point = rotatePoint(
            polarPoint(angle, group.radiusX, group.radiusY),
            group.tilt,
            500,
            500,
          );
          const x = (point.x / 1000) * width;
          const y = (point.y / 1000) * height;
          const hoverState = hoveredKey === group.key;
          const nodeOpacity = hoverState ? 1 : node.depthBias;

          element.style.setProperty("--node-x", `${x}px`);
          element.style.setProperty("--node-y", `${y}px`);
          element.style.setProperty("--node-scale", hoverState ? "1.08" : "1");
          element.style.setProperty("--node-opacity", `${nodeOpacity}`);
          element.classList.toggle("is-hovered", hoverState);
        });
      });
    },
    [layout, isEarthHovered],
  );

  useEffect(() => {
    const shouldAnimate = !reducedMotion && isVisible && isTabVisible;

    if (!shouldAnimate) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      drawFrame(0, true);
      return undefined;
    }

    let startedAt = 0;

    const tick = (timestamp) => {
      if (!startedAt) {
        startedAt = timestamp;
      }

      drawFrame((timestamp - startedAt) / 1000, false);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };
  }, [drawFrame, isTabVisible, isVisible, reducedMotion]);

  return (
    <div
      className={`enterprise-core-visual ${
        isVisible && isTabVisible ? "is-visible" : ""
      } ${reducedMotion ? "is-reduced" : ""} ${hoveredOrbitKey ? "is-hover-paused" : ""} ${
        isEarthHovered ? "is-earth-hovered" : ""
      } ${!isVisible || !isTabVisible ? "is-paused" : ""}`.trim()}
      ref={rootRef}
      aria-hidden="true"
    >
      <div className="enterprise-core-grid" />
      <div className="enterprise-core-glow" />
      <canvas
        className="enterprise-core-particles"
        ref={canvasRef}
        aria-hidden="true"
      />

      <div
        className="enterprise-core-earth"
        data-earth-stage="planet"
        aria-hidden="true"
        onPointerEnter={() => setIsEarthHovered(true)}
        onPointerLeave={() => setIsEarthHovered(false)}
      >
        <svg
          className="enterprise-core-earth-svg"
          viewBox="0 0 420 420"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <radialGradient id="earth-gradient" cx="42%" cy="34%" r="62%">
              <stop offset="0%" stopColor="rgba(77, 140, 255, 0.98)" />
              <stop offset="40%" stopColor="rgba(12, 43, 88, 0.98)" />
              <stop offset="72%" stopColor="rgba(7, 20, 43, 0.98)" />
              <stop offset="100%" stopColor="rgba(2, 9, 21, 1)" />
            </radialGradient>
            <linearGradient
              id="continent-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="rgba(45, 212, 200, 0.98)" />
              <stop offset="72%" stopColor="rgba(74, 141, 255, 0.88)" />
              <stop offset="100%" stopColor="rgba(239, 91, 42, 0.42)" />
            </linearGradient>
            <radialGradient id="earth-halo" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(45, 212, 200, 0.46)" />
              <stop offset="58%" stopColor="rgba(74, 141, 255, 0.22)" />
              <stop offset="100%" stopColor="rgba(74, 141, 255, 0)" />
            </radialGradient>
            <clipPath id="earth-clip">
              <circle cx="210" cy="210" r="164" />
            </clipPath>
          </defs>

          <circle
            className="enterprise-core-earth-halo"
            cx="210"
            cy="210"
            r="175"
            fill="url(#earth-halo)"
          />
          <circle
            className="enterprise-core-earth-base"
            cx="210"
            cy="210"
            r="164"
            fill="url(#earth-gradient)"
          />
          <ellipse
            className="enterprise-core-earth-shadow"
            cx="250"
            cy="268"
            rx="116"
            ry="54"
          />
          <path
            className="enterprise-core-earth-cloud enterprise-core-earth-cloud--one"
            d="M110 148 C126 122, 172 120, 188 136 C198 128, 220 128, 232 142 C248 138, 268 144, 276 160 C292 160, 304 174, 296 186 C286 198, 268 202, 252 196 C244 218, 218 226, 192 216 C176 238, 142 236, 126 218 C110 208, 100 188, 104 168 C100 160, 102 152, 110 148 Z"
          />
          <path
            className="enterprise-core-earth-cloud enterprise-core-earth-cloud--two"
            d="M232 112 C246 98, 272 100, 286 116 C300 110, 322 114, 330 130 C344 132, 354 144, 348 156 C342 168, 326 174, 312 170 C304 188, 286 194, 268 188 C258 208, 232 208, 216 194 C202 184, 196 166, 204 150 C194 140, 198 122, 214 116 C220 114, 226 112, 232 112 Z"
          />

          <g
            className="enterprise-core-earth-surface"
            clipPath="url(#earth-clip)"
          >
            <g className="enterprise-core-earth-grid">
              {[88, 126, 164, 210, 256, 294, 332].map((y) => (
                <path
                  key={`lat-${y}`}
                  d={`M 58 ${y} C 120 ${y - 18}, 300 ${y - 18}, 362 ${y}`}
                  className="enterprise-core-earth-line enterprise-core-earth-line--lat"
                />
              ))}
              {[88, 126, 164, 210, 256, 294, 332].map((x) => (
                <path
                  key={`long-${x}`}
                  d={`M ${x} 58 C ${x - 18} 124, ${x - 18} 296, ${x} 362`}
                  className="enterprise-core-earth-line enterprise-core-earth-line--long"
                />
              ))}
            </g>

            <g className="enterprise-core-earth-continents">
              <path
                d="M 108 176 C 126 144, 164 126, 188 134 C 208 140, 218 160, 210 178 C 202 194, 178 204, 152 198 C 132 194, 96 194, 108 176 Z"
                className="enterprise-core-earth-land enterprise-core-earth-land--one"
              />
              <path
                d="M 226 146 C 246 124, 286 124, 302 148 C 312 164, 304 186, 286 194 C 266 202, 242 194, 228 178 C 218 164, 214 156, 226 146 Z"
                className="enterprise-core-earth-land enterprise-core-earth-land--two"
              />
              <path
                d="M 172 246 C 190 224, 232 222, 248 242 C 258 256, 254 278, 232 288 C 210 298, 184 294, 166 276 C 156 266, 154 254, 172 246 Z"
                className="enterprise-core-earth-land enterprise-core-earth-land--three"
              />
              <path
                d="M 270 242 C 288 230, 314 232, 326 248 C 336 262, 334 282, 320 292 C 306 302, 284 300, 272 286 C 262 274, 260 252, 270 242 Z"
                className="enterprise-core-earth-land enterprise-core-earth-land--four"
              />
            </g>

            <g className="enterprise-core-earth-sweep">
              <path
                d="M 90 120 C 148 88, 262 84, 332 124"
                className="enterprise-core-earth-sweep-line"
              />
              <path
                d="M 86 246 C 144 220, 276 222, 332 256"
                className="enterprise-core-earth-sweep-line enterprise-core-earth-sweep-line--accent"
              />
            </g>
          </g>
        </svg>

        <div className="enterprise-core-center" aria-hidden="true">
          <div className="enterprise-core-center-inner">
            <span className="enterprise-core-kicker">Digital Earth</span>
            <strong>TECHNOSTHAN</strong>
            <p>Secure systems for AI, cloud, and growth.</p>
          </div>
        </div>
      </div>

      <div className="enterprise-core-orbits" aria-hidden="true">
        {layout.orbitGroups.map((group) => (
          <div
            key={group.key}
            className={`enterprise-core-orbit enterprise-core-orbit--${group.key} ${
              hoveredOrbitKey === group.key ? "is-hovered" : ""
            }`.trim()}
          >
            <svg
              className="enterprise-core-orbit-svg"
              viewBox="0 0 1000 1000"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="500"
                cy="500"
                rx={group.radiusX}
                ry={group.radiusY}
                transform={`rotate(${group.tilt} 500 500)`}
                className={`enterprise-core-orbit-track enterprise-core-orbit-track--${group.key}`}
              />
            </svg>

            {group.nodes.map((node) => {
              const Icon = node.icon;
              const orbitKey = `${group.key}-${node.nodeIndex}`;

              return (
                <div
                  key={orbitKey}
                  ref={(element) => {
                    nodeRefs.current[orbitKey] = element;
                  }}
                  className="enterprise-core-orbit-node"
                  onPointerEnter={() => setHoveredOrbitKey(group.key)}
                  onPointerLeave={() =>
                    setHoveredOrbitKey((current) =>
                      current === group.key ? null : current,
                    )
                  }
                  style={{
                    "--node-x": "0px",
                    "--node-y": "0px",
                    "--node-scale": "1",
                  }}
                >
                  <div className="enterprise-core-orbit-node-inner">
                    <div className="enterprise-core-orbit-node-card">
                      <span className="enterprise-core-orbit-node-icon">
                        <Icon size={18} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

const EnterpriseNetworkHero = ({ heroVisual, featuredService }) => {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { isAppReady } = useAppMotion();
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      const frame = window.requestAnimationFrame(() => setMotionReady(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => setMotionReady(true), 900);
    return () => window.clearTimeout(timeout);
  }, [isAppReady]);

  const leadText =
    heroVisual?.heroSubtitle ||
    "We build intelligent, secure, and scalable digital systems that accelerate growth, simplify operations, and prepare your business for the future.";

  useGSAP(
    () => {
      setupGsap();

      if (!rootRef.current || reducedMotion || !motionReady) {
        return undefined;
      }

      const context = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(
          "[data-hero-copy='eyebrow']",
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.45 },
        )
          .fromTo(
            "[data-hero-copy='heading']",
            { autoAlpha: 0, y: 22 },
            { autoAlpha: 1, y: 0, duration: 0.7 },
            "-=0.08",
          )
          .fromTo(
            "[data-hero-copy='lead']",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.5 },
            "-=0.12",
          )
          .fromTo(
            "[data-hero-copy='actions']",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.08 },
            "-=0.1",
          )
          .fromTo(
            "[data-hero-copy='chips']",
            { autoAlpha: 0, y: 14 },
            { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.05 },
            "-=0.08",
          );
      }, rootRef);

      return () => context.revert();
    },
    { scope: rootRef, dependencies: [motionReady, reducedMotion] },
  );

  return (
    <section
      className={`enterprise-hero ${motionReady ? "is-visible" : ""} ${
        reducedMotion ? "is-reduced" : ""
      }`.trim()}
      ref={rootRef}
    >
      <div className="enterprise-hero-shell">
        <div className="enterprise-hero-copy">
          {/* <span className="enterprise-hero-eyebrow" data-hero-copy="eyebrow">
            Enterprise Technology Studio
          </span> */}

          <h1 className="enterprise-hero-title" data-hero-copy="heading">
            <span className="enterprise-hero-line">Enterprise software</span>
            <span className="enterprise-hero-line">
              for <span className="enterprise-hero-accent">AI</span>, cloud,
            </span>
            <span className="enterprise-hero-line">
              and secure infrastructure
            </span>
            <span className="enterprise-hero-line">built to scale</span>
          </h1>

          <p className="enterprise-hero-lead" data-hero-copy="lead">
            {leadText}
          </p>

          <div className="enterprise-hero-actions" data-hero-copy="actions">
            <MagneticButton
              to="/contact"
              className="enterprise-hero-button enterprise-hero-button-primary"
              data-cursor="open"
            >
              Start a project
              <FiArrowRight />
            </MagneticButton>
            <MagneticButton
              to="/case-studies"
              className="enterprise-hero-button enterprise-hero-button-secondary"
              data-cursor="view"
            >
              Explore selected work
            </MagneticButton>
          </div>

          <div className="enterprise-hero-tags" data-hero-copy="chips">
            {CHIP_ITEMS.map((chip) => {
              const Icon = chip.icon;

              return (
                <span key={chip.label} className="enterprise-hero-tag">
                  <Icon size={14} />
                  <span>{chip.label}</span>
                </span>
              );
            })}
          </div>
        </div>

        <div className="enterprise-hero-visual-shell">
          <EnterpriseCoreVisual
            featuredService={featuredService}
            reducedMotion={reducedMotion}
          />
        </div>
      </div>

      <div
        className="enterprise-hero-floor"
        data-enterprise-stage="floor"
        aria-hidden="true"
      >
        <svg viewBox="0 0 1600 240" preserveAspectRatio="none">
          <defs>
            <linearGradient
              id="enterprise-floor-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(45, 212, 200, 0.02)" />
              <stop offset="50%" stopColor="rgba(45, 212, 200, 0.54)" />
              <stop offset="82%" stopColor="rgba(74, 141, 255, 0.38)" />
              <stop offset="100%" stopColor="rgba(239, 91, 42, 0.24)" />
            </linearGradient>
          </defs>

          <path
            className="enterprise-hero-floor-line enterprise-hero-floor-line--top"
            d="M 0 124 C 180 92, 290 168, 430 134 S 720 176, 920 130 S 1260 102, 1600 152"
          />
          <path
            className="enterprise-hero-floor-line enterprise-hero-floor-line--bottom"
            d="M 0 184 C 220 146, 360 214, 560 176 S 980 214, 1160 168 S 1400 144, 1600 180"
          />

          {[92, 214, 354, 612, 820, 1094, 1328, 1496].map((x, index) => (
            <g
              key={x}
              className="enterprise-hero-floor-node"
              style={{ "--node-delay": `${index * 0.9}s` }}
            >
              <circle cx={x} cy={index % 2 === 0 ? 124 : 178} r="4" />
              <circle cx={x} cy={index % 2 === 0 ? 124 : 178} r="12" />
            </g>
          ))}
        </svg>
      </div>
    </section>
  );
};

export default EnterpriseNetworkHero;
