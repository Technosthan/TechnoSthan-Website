import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCloud,
  FiDatabase,
  FiCompass,
  FiLayers,
  FiServer,
  FiShield,
  FiSmartphone,
  FiZap,
} from "react-icons/fi";

import useReducedMotion from "../../../hooks/useReducedMotion";
import { useAppMotion } from "../../../providers/AppMotionProvider";
import { PRODUCTS_ROUTE } from "../../../shared/constants";
import DigitalEarthOrbitNode from "./DigitalEarthOrbitNode";
import "./digital-earth-hero.css";

const SERVICE_PLANETS = [
  { label: "Web Development", icon: FiLayers, phase: 14 },
  { label: "Mobile Engineering", icon: FiSmartphone, phase: 58 },
  { label: "Cloud Infrastructure", icon: FiCloud, phase: 104 },
  { label: "Database Systems", icon: FiDatabase, phase: 150 },
  { label: "Security & Compliance", icon: FiShield, phase: 198 },
  { label: "AI Automation", icon: FiZap, phase: 246 },
  { label: "DevOps & CI/CD", icon: FiServer, phase: 294 },
  { label: "Solutions Architecture", icon: FiCompass, phase: 340 },
];

const ORBIT_LAYOUTS = {
  desktop: [
    { key: "inner", radiusX: 178, radiusY: 120, tilt: -14, duration: 12, direction: 1 },
    { key: "inner-mid", radiusX: 224, radiusY: 152, tilt: 11, duration: 15, direction: -1 },
    { key: "middle", radiusX: 274, radiusY: 186, tilt: -12, duration: 18, direction: 1 },
    { key: "middle-mid", radiusX: 326, radiusY: 220, tilt: 13, duration: 22, direction: -1 },
    { key: "outer", radiusX: 378, radiusY: 256, tilt: -9, duration: 27, direction: 1 },
    { key: "outer-mid", radiusX: 430, radiusY: 290, tilt: 10, duration: 33, direction: -1 },
    { key: "far", radiusX: 474, radiusY: 320, tilt: -7, duration: 39, direction: 1 },
    { key: "far-edge", radiusX: 492, radiusY: 336, tilt: 6, duration: 45, direction: -1 },
  ],
  tablet: [
    { key: "inner", radiusX: 150, radiusY: 102, tilt: -13, duration: 12, direction: 1 },
    { key: "inner-mid", radiusX: 190, radiusY: 130, tilt: 10, duration: 15, direction: -1 },
    { key: "middle", radiusX: 236, radiusY: 160, tilt: -11, duration: 18, direction: 1 },
    { key: "middle-mid", radiusX: 280, radiusY: 190, tilt: 12, duration: 22, direction: -1 },
    { key: "outer", radiusX: 326, radiusY: 220, tilt: -8, duration: 27, direction: 1 },
    { key: "outer-mid", radiusX: 370, radiusY: 250, tilt: 9, duration: 33, direction: -1 },
    { key: "far", radiusX: 414, radiusY: 280, tilt: -6, duration: 40, direction: 1 },
    { key: "far-edge", radiusX: 450, radiusY: 304, tilt: 6, duration: 46, direction: -1 },
  ],
  mobile: [
    { key: "inner", radiusX: 132, radiusY: 90, tilt: -12, duration: 13, direction: 1 },
    { key: "inner-mid", radiusX: 166, radiusY: 114, tilt: 10, duration: 16, direction: -1 },
    { key: "middle", radiusX: 204, radiusY: 140, tilt: -11, duration: 19, direction: 1 },
    { key: "middle-mid", radiusX: 242, radiusY: 166, tilt: 12, duration: 23, direction: -1 },
    { key: "outer", radiusX: 278, radiusY: 190, tilt: -8, duration: 28, direction: 1 },
    { key: "outer-mid", radiusX: 314, radiusY: 214, tilt: 8, duration: 34, direction: -1 },
    { key: "far", radiusX: 348, radiusY: 238, tilt: -6, duration: 41, direction: 1 },
    { key: "far-edge", radiusX: 382, radiusY: 260, tilt: 6, duration: 47, direction: -1 },
  ],
};

const makeSeed = (index, offset = 0) => {
  const value = Math.sin(index * 91.17 + offset * 17.31) * 10000;
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

const resolveLabelPosition = (point, centerX = 500, centerY = 500) => {
  const deltaX = point.x - centerX;
  const deltaY = point.y - centerY;

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    return deltaX < 0 ? "left" : "right";
  }

  return deltaY < 0 ? "bottom" : "top";
};

const buildOrbitLayout = (width = 1440, height = 860) => {
  const key = width < 760 ? "mobile" : width < 1120 ? "tablet" : "desktop";
  const orbitConfigs = ORBIT_LAYOUTS[key];
  const baseSize = Math.min(width, height);
  const layoutScale =
    key === "desktop"
      ? baseSize >= 820
        ? 1.08
        : 1.05
      : key === "tablet"
        ? 1.04
        : 1.01;
  const orbitCenterX = 500;
  const orbitCenterY = 500;

  const orbitGroups = orbitConfigs.map((orbit, orbitIndex) => {
    const service = SERVICE_PLANETS[orbitIndex % SERVICE_PLANETS.length];
    const radiusX = Math.round(orbit.radiusX * layoutScale);
    const radiusY = Math.round(orbit.radiusY * layoutScale);
    const initialPoint = rotatePoint(
      polarPoint(service.phase, radiusX, radiusY),
      orbit.tilt,
      orbitCenterX,
      orbitCenterY,
    );

    return {
      ...orbit,
      radiusX,
      radiusY,
      orbitIndex,
      service,
      labelPosition: resolveLabelPosition(initialPoint, orbitCenterX, orbitCenterY),
      node: {
        ...service,
        orbitKey: orbit.key,
        phase: service.phase,
        nodeIndex: orbitIndex,
      },
    };
  });

  const particleCount = key === "mobile" ? 126 : key === "tablet" ? 196 : 294;

  return {
    key,
    orbitGroups,
    particleCount,
  };
};

const createParticles = (layout) => {
  const orbitCount = layout.orbitGroups.length || 1;

  return Array.from({ length: layout.particleCount }, (_, index) => {
    const orbitIndex = index % orbitCount;
    const orbit = layout.orbitGroups[orbitIndex];
    const seed = makeSeed(index, orbitIndex + 1);

    return {
      id: `${layout.key}-${index}`,
      orbitIndex,
      phase: seed * 360,
      speed: 0.48 + seed * 0.78,
      size: 0.55 + seed * 1.15,
      alpha: 0.1 + seed * 0.24,
      trail: 0.04 + makeSeed(index, 7) * 0.1,
      drift: (0.12 + makeSeed(index, 13) * 0.2) * (orbit?.direction || 1),
      color:
        seed > 0.74
          ? "rgba(90, 191, 255, 0.94)"
          : seed > 0.34
            ? "rgba(255, 159, 75, 0.94)"
            : "rgba(239, 91, 42, 0.94)",
    };
  });
};

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const DigitalEarthHero = ({ heroVisual, featuredService }) => {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const visualRef = useRef(null);
  const canvasRef = useRef(null);
  const nodeRefs = useRef([]);
  const frameRef = useRef(0);
  const orbitGroupsRef = useRef([]);
  const particlesRef = useRef([]);
  const dimensionsRef = useRef({ width: 0, height: 0 });
  const hoveredOrbitKeyRef = useRef(null);
  const supportsHoverRef = useRef(false);
  const isInsideOrbitAreaRef = useRef(false);
  const isServiceNodeHoveredRef = useRef(false);
  const manualPauseRef = useRef(false);
  const previousTimestampRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const [hoveredOrbitKey, setHoveredOrbitKey] = useState(null);
  const [isEarthHovered, setIsEarthHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const reducedMotion = useReducedMotion();
  const { isAppReady } = useAppMotion();
  const [motionReady, setMotionReady] = useState(false);
  const [visualSize, setVisualSize] = useState(
    typeof window === "undefined"
      ? { width: 1440, height: 860 }
      : { width: window.innerWidth, height: window.innerHeight },
  );

  const leadText = normalizeText(
    heroVisual?.heroSubtitle,
    "Every technology, every service, and every capability revolves around TECHNOSTHAN as one connected enterprise ecosystem.",
  );

  const featuredPlanetIndex = useMemo(() => {
    const target = featuredService?.title ? normalizeText(featuredService.title).toLowerCase() : "";

    if (!target) {
      return -1;
    }

    return SERVICE_PLANETS.findIndex(
      (planet) => normalizeText(planet.label).toLowerCase() === target,
    );
  }, [featuredService]);

  useEffect(() => {
    if (isAppReady) {
      const frame = window.requestAnimationFrame(() => setMotionReady(true));
      return () => window.cancelAnimationFrame(frame);
    }

    const timeout = window.setTimeout(() => setMotionReady(true), 900);
    return () => window.clearTimeout(timeout);
  }, [isAppReady]);

  const orbitSystem = useMemo(
    () => buildOrbitLayout(visualSize.width, visualSize.height),
    [visualSize],
  );

  useEffect(() => {
    orbitGroupsRef.current = orbitSystem.orbitGroups;
    particlesRef.current = createParticles(orbitSystem);
  }, [orbitSystem]);

  useEffect(() => {
    hoveredOrbitKeyRef.current = hoveredOrbitKey;
  }, [hoveredOrbitKey]);

  useEffect(() => {
    manualPauseRef.current = reducedMotion || !isVisible || !isTabVisible;

    if (
      !manualPauseRef.current &&
      !isServiceNodeHoveredRef.current &&
      !isInsideOrbitAreaRef.current
    ) {
      previousTimestampRef.current = 0;
    }
  }, [isTabVisible, isVisible, reducedMotion]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      supportsHoverRef.current = false;
      return undefined;
    }

    supportsHoverRef.current = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;

    return undefined;
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const syncSize = () => {
      const visual = visualRef.current;
      if (!visual) {
        return;
      }

      const rect = visual.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));

      dimensionsRef.current = { width, height };

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      setVisualSize({ width, height });
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    syncSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(syncSize);
      observer.observe(root);

      return () => observer.disconnect();
    }

    window.addEventListener("resize", syncSize, { passive: true });
    return () => window.removeEventListener("resize", syncSize);
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
      root.style.setProperty("--pointer-x", "50%");
      root.style.setProperty("--pointer-y", "38%");
      return undefined;
    }

    const handlePointerMove = (event) => {
      const bounds = root.getBoundingClientRect();
      const x = ((event.clientX - bounds.left) / bounds.width) * 100;
      const y = ((event.clientY - bounds.top) / bounds.height) * 100;

      root.style.setProperty("--pointer-x", `${clamp(x, 0, 100)}%`);
      root.style.setProperty("--pointer-y", `${clamp(y, 0, 100)}%`);
    };

    const handlePointerLeave = () => {
      root.style.setProperty("--pointer-x", "50%");
      root.style.setProperty("--pointer-y", "38%");
    };

    root.addEventListener("pointermove", handlePointerMove, { passive: true });
    root.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      root.removeEventListener("pointermove", handlePointerMove);
      root.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    handleVisibilityChange();

    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );

    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const shouldPause = useCallback(
    () =>
      manualPauseRef.current ||
      isInsideOrbitAreaRef.current ||
      isServiceNodeHoveredRef.current ||
      reducedMotion ||
      !isVisible ||
      !isTabVisible,
    [isTabVisible, isVisible, reducedMotion],
  );

  const getActualOrbitBounds = useCallback(() => {
    const visual = visualRef.current;
    const outerOrbit = orbitGroupsRef.current[orbitGroupsRef.current.length - 1];

    if (!visual || !outerOrbit) {
      return null;
    }

    const rect = visual.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return null;
    }

    return {
      radiusX: (outerOrbit.radiusX / 1000) * rect.width,
      radiusY: (outerOrbit.radiusY / 1000) * rect.height,
      centerX: rect.width / 2,
      centerY: rect.height / 2,
    };
  }, []);

  const updateWheelRadiusHover = useCallback(
    (event) => {
      if (event.pointerType === "touch") {
        return;
      }

      const visual = visualRef.current;
      if (!visual) {
        return;
      }

      const rect = visual.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const bounds = getActualOrbitBounds();
      if (!bounds) {
        return;
      }

      const deltaX = pointerX - bounds.centerX;
      const deltaY = pointerY - bounds.centerY;
      const normalizedDistance = Math.sqrt(
        (deltaX * deltaX) / (bounds.radiusX * bounds.radiusX) +
          (deltaY * deltaY) / (bounds.radiusY * bounds.radiusY),
      );
      const insideRadius = normalizedDistance <= 1;

      isInsideOrbitAreaRef.current = insideRadius;

      if (!insideRadius && !isServiceNodeHoveredRef.current && !manualPauseRef.current) {
        previousTimestampRef.current = 0;
      }
    },
    [getActualOrbitBounds],
  );

  const handleWheelPause = useCallback((event) => {
    if (!supportsHoverRef.current || event.pointerType === "touch") {
      return;
    }

    isServiceNodeHoveredRef.current = true;
  }, []);

  const handleWheelRadiusLeave = useCallback((event) => {
    if (event.pointerType === "touch") {
      return;
    }

    isInsideOrbitAreaRef.current = false;

    if (!isServiceNodeHoveredRef.current && !manualPauseRef.current) {
      previousTimestampRef.current = 0;
    }
  }, []);

  const handleWheelResume = useCallback((event) => {
    if (!supportsHoverRef.current || event.pointerType === "touch") {
      return;
    }

    isServiceNodeHoveredRef.current = false;

    if (!isInsideOrbitAreaRef.current && !manualPauseRef.current) {
      previousTimestampRef.current = 0;
    }
  }, []);

  const drawFrame = useCallback(
    (elapsedSeconds, staticMode = false) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const { width, height } = dimensionsRef.current;

      if (!canvas || !context || !width || !height) {
        return;
      }

      const orbitGroups = orbitGroupsRef.current;
      const hoveredKey = hoveredOrbitKeyRef.current;
      const earthBoost = isEarthHovered ? 1.22 : 1;

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "source-over";
      context.lineCap = "round";
      context.lineJoin = "round";

      particlesRef.current.forEach((particle) => {
        const orbit = orbitGroups[particle.orbitIndex];
        if (!orbit) {
          return;
        }

        const isOrbitHovered = hoveredKey === orbit.key;
        const motion = staticMode
          ? 0
          : elapsedSeconds *
            (360 / orbit.duration) *
            orbit.direction *
            particle.speed *
            earthBoost;
        const angle = particle.phase + motion + particle.drift * elapsedSeconds * 12;
        const wobbleX = Math.sin(elapsedSeconds * 1.18 + particle.phase) * 2.4;
        const wobbleY = Math.cos(elapsedSeconds * 0.94 + particle.phase) * 1.7;
        const point = rotatePoint(
          polarPoint(angle, orbit.radiusX + wobbleX, orbit.radiusY + wobbleY),
          orbit.tilt,
        );
        const x = (point.x / 1000) * width;
        const y = (point.y / 1000) * height;

        if (particle.prevX != null && particle.prevY != null) {
          context.strokeStyle = particle.color;
          context.globalAlpha = particle.trail * (isOrbitHovered ? 1.45 : 1);
          context.lineWidth = Math.max(0.7, particle.size * 0.52);
          context.beginPath();
          context.moveTo(particle.prevX, particle.prevY);
          context.lineTo(x, y);
          context.stroke();
        }

        context.fillStyle = particle.color;
        context.globalAlpha = particle.alpha * (isOrbitHovered ? 1.5 : 1);
        context.shadowBlur = isOrbitHovered ? 12 : 8;
        context.shadowColor = particle.color;
        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fill();
        context.shadowBlur = 0;

        particle.prevX = x;
        particle.prevY = y;
      });

      context.restore();

      orbitGroups.forEach((orbit) => {
        const node = orbit.node;
        const element = nodeRefs.current[orbit.orbitIndex];

        if (!element) {
          return;
        }

        const isOrbitHovered = hoveredKey === orbit.key;
        const angle = staticMode
          ? node.phase
          : node.phase + elapsedSeconds * (360 / orbit.duration) * orbit.direction;
        const point = rotatePoint(
          polarPoint(angle, orbit.radiusX, orbit.radiusY),
          orbit.tilt,
          500,
          500,
        );

        const x = ((point.x - 500) / 1000) * width;
        const y = ((point.y - 500) / 1000) * height;
        element.style.setProperty("--planet-x", `${x}px`);
        element.style.setProperty("--planet-y", `${y}px`);
        element.dataset.labelPosition = resolveLabelPosition(point);
        element.classList.toggle("is-hovered", isOrbitHovered);
      });
    },
  [isEarthHovered],
);

  useEffect(() => {
    if (reducedMotion || !isVisible || !isTabVisible) {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }

      previousTimestampRef.current = 0;
      drawFrame(0, true);
      return undefined;
    }

    const tick = (timestamp) => {
      if (!previousTimestampRef.current) {
        previousTimestampRef.current = timestamp;
      }

      if (shouldPause()) {
        previousTimestampRef.current = 0;
        drawFrame(elapsedSecondsRef.current, false);
        frameRef.current = requestAnimationFrame(tick);
        return;
      }

      const deltaSeconds = (timestamp - previousTimestampRef.current) / 1000;
      if (deltaSeconds > 0) {
        elapsedSecondsRef.current += deltaSeconds;
      }

      previousTimestampRef.current = timestamp;
      drawFrame(elapsedSecondsRef.current, false);
      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
      previousTimestampRef.current = 0;
    };
  }, [drawFrame, isTabVisible, isVisible, reducedMotion, shouldPause]);

  

  return (
    <section
      className={`digital-earth-hero ${motionReady ? "is-ready" : ""} ${
        isVisible && isTabVisible ? "is-visible" : ""
      } ${reducedMotion ? "is-reduced" : ""
      }`.trim()}
      ref={rootRef}
    >
      <div className="digital-earth-shell">
        <div className="digital-earth-copy">
          <span className="digital-earth-eyebrow">TECHNOSTHAN DIGITAL EARTH</span>
          <h1 className="digital-earth-title">
            <span>TECHNOSTHAN is</span>
            <span className="digital-earth-title-accent">the Digital Earth.</span>
            <span>Every service orbits one connected center.</span>
          </h1>
          <p className="digital-earth-lead">{leadText}</p>
          <div className="digital-earth-actions">
            <button
              className="digital-earth-button digital-earth-button--primary"
              type="button"
              onClick={() => navigate("/contact")}
              data-cursor="open"
            >
              <span>Book Enterprise Consultation</span>
              <FiArrowRight size={18} />
            </button>
            <button
              className="digital-earth-button digital-earth-button--secondary"
              type="button"
              onClick={() => navigate(PRODUCTS_ROUTE)}
              data-cursor="view"
            >
              Explore Products
            </button>
          </div>
          <div className="digital-earth-trustline">
            <span>Cloud</span>
            <span>AI</span>
            <span>Security</span>
            <span>Delivery</span>
          </div>
        </div>

        <div
          className="digital-earth-visual"
          ref={visualRef}
          onPointerEnter={updateWheelRadiusHover}
          onPointerMove={updateWheelRadiusHover}
          onPointerLeave={handleWheelRadiusLeave}
        >
          <div className="digital-earth-grid" aria-hidden="true" />
          <div className="digital-earth-glow" aria-hidden="true" />
          <canvas className="digital-earth-particles" ref={canvasRef} aria-hidden="true" />

          <div
            className={`digital-earth-core ${isEarthHovered ? "is-hovered" : ""}`}
            aria-hidden="true"
            onPointerEnter={() => setIsEarthHovered(true)}
            onPointerLeave={() => setIsEarthHovered(false)}
          >
            <svg
              className="digital-earth-core__svg"
              viewBox="0 0 440 440"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <radialGradient id="digital-earth-gradient" cx="40%" cy="32%" r="66%">
                  <stop offset="0%" stopColor="rgba(77, 140, 255, 0.98)" />
                  <stop offset="43%" stopColor="rgba(12, 43, 88, 0.98)" />
                  <stop offset="72%" stopColor="rgba(7, 20, 43, 0.98)" />
                  <stop offset="100%" stopColor="rgba(2, 9, 21, 1)" />
                </radialGradient>
                <linearGradient id="digital-earth-continent" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(45, 212, 200, 0.94)" />
                  <stop offset="70%" stopColor="rgba(74, 141, 255, 0.9)" />
                  <stop offset="100%" stopColor="rgba(239, 91, 42, 0.4)" />
                </linearGradient>
                <radialGradient id="digital-earth-atmosphere" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(45, 212, 200, 0.38)" />
                  <stop offset="58%" stopColor="rgba(74, 141, 255, 0.18)" />
                  <stop offset="100%" stopColor="rgba(74, 141, 255, 0)" />
                </radialGradient>
                <clipPath id="digital-earth-clip">
                  <circle cx="220" cy="220" r="166" />
                </clipPath>
              </defs>

              <circle className="digital-earth-core__halo" cx="220" cy="220" r="182" fill="url(#digital-earth-atmosphere)" />
              <circle className="digital-earth-core__base" cx="220" cy="220" r="166" fill="url(#digital-earth-gradient)" />
              <ellipse className="digital-earth-core__shadow" cx="262" cy="282" rx="118" ry="58" />

              <g className="digital-earth-core__surface" clipPath="url(#digital-earth-clip)">
                <g className="digital-earth-core__grid">
                  {[92, 132, 172, 220, 268, 308, 348].map((y) => (
                    <path
                      key={`lat-${y}`}
                      d={`M 56 ${y} C 120 ${y - 18}, 300 ${y - 18}, 384 ${y}`}
                      className="digital-earth-core__line digital-earth-core__line--lat"
                    />
                  ))}
                  {[92, 132, 172, 220, 268, 308, 348].map((x) => (
                    <path
                      key={`long-${x}`}
                      d={`M ${x} 56 C ${x - 20} 124, ${x - 20} 296, ${x} 384`}
                      className="digital-earth-core__line digital-earth-core__line--long"
                    />
                  ))}
                </g>

                {/* <g className="digital-earth-core__continents">
                  <path
                    d="M 110 180 C 128 146, 168 128, 192 136 C 210 142, 220 162, 212 180 C 204 198, 178 206, 152 200 C 132 196, 96 196, 110 180 Z"
                    className="digital-earth-core__land digital-earth-core__land--one"
                  />
                  <path
                    d="M 232 148 C 248 126, 288 124, 306 148 C 316 164, 308 186, 290 194 C 270 202, 244 194, 230 178 C 220 166, 216 156, 232 148 Z"
                    className="digital-earth-core__land digital-earth-core__land--two"
                  />
                  <path
                    d="M 170 248 C 190 226, 232 224, 248 244 C 260 258, 254 280, 232 290 C 210 300, 184 296, 166 278 C 156 268, 154 256, 170 248 Z"
                    className="digital-earth-core__land digital-earth-core__land--three"
                  />
                  <path
                    d="M 272 244 C 292 232, 316 234, 328 250 C 338 264, 336 284, 320 294 C 306 304, 284 302, 272 288 C 262 276, 260 254, 272 244 Z"
                    className="digital-earth-core__land digital-earth-core__land--four"
                  />
                </g> */}

                <g className="digital-earth-core__sweep">
                  <path
                    d="M 88 122 C 148 88, 262 84, 332 124"
                    className="digital-earth-core__sweep-line"
                  />
                  <path
                    d="M 84 250 C 144 220, 276 224, 332 256"
                    className="digital-earth-core__sweep-line digital-earth-core__sweep-line--accent"
                  />
                </g>
              </g>
            </svg>

            <div className="digital-earth__rajasthan-brand" aria-hidden="true">
              <img
                src="/images/hero/rajasthan-technosthan.svg"
                alt="TechnoSthan Rajasthan"
                className="digital-earth__rajasthan-brand-image"
                draggable="false"
              />
            </div>
          </div>

          <div className="digital-earth-orbits">
            {orbitSystem.orbitGroups.map((orbit) => {
              return (
                <DigitalEarthOrbitNode
                  key={orbit.key}
                  orbit={orbit}
                  isHovered={hoveredOrbitKey === orbit.key}
                  isFeatured={featuredPlanetIndex === orbit.orbitIndex}
                  labelPosition={orbit.labelPosition}
                  ref={(element) => {
                    nodeRefs.current[orbit.orbitIndex] = element;
                  }}
                  onPointerEnter={(event) => {
                    handleWheelPause(event);
                    setHoveredOrbitKey(orbit.key);
                  }}
                  onPointerLeave={(event) => {
                    handleWheelResume(event);
                    setHoveredOrbitKey((current) => (current === orbit.key ? null : current));
                  }}
                  onFocus={(event) => {
                    handleWheelPause(event);
                    setHoveredOrbitKey(orbit.key);
                  }}
                  onBlur={(event) => {
                    handleWheelResume(event);
                    setHoveredOrbitKey((current) => (current === orbit.key ? null : current));
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DigitalEarthHero;
