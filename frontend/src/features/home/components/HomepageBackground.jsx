import { useEffect, useMemo, useRef } from "react";

import useReducedMotion from "../../../hooks/useReducedMotion";
import "./homepage-background.css";

const getParticleCount = () => {
  if (typeof window === "undefined") {
    return 28;
  }

  if (window.innerWidth < 480) {
    return 12;
  }

  if (window.innerWidth < 900) {
    return 18;
  }

  return 28;
};

const NETWORK_PATHS = [
  "M 80 0 C 140 180, 40 320, 160 520 S 210 900, 120 1180 S 60 1540, 180 1840 S 140 2200, 120 2400",
  "M 250 0 C 360 160, 210 340, 320 560 S 410 920, 300 1200 S 220 1600, 360 1960 S 390 2260, 320 2400",
  "M 450 0 C 530 140, 420 300, 540 520 S 640 940, 500 1220 S 420 1580, 560 1920 S 640 2260, 540 2400",
  "M 650 0 C 740 170, 620 360, 760 540 S 860 900, 700 1180 S 640 1580, 800 1940 S 860 2240, 780 2400",
  "M 860 0 C 930 180, 820 340, 940 560 S 1010 920, 900 1200 S 780 1560, 980 1940 S 920 2260, 900 2400",
  "M 180 2400 C 240 2140, 120 1960, 260 1700 S 320 1240, 210 980 S 250 640, 160 360 S 140 120, 220 0",
  "M 520 2400 C 600 2160, 470 1940, 640 1700 S 720 1260, 560 980 S 620 600, 520 320 S 580 120, 640 0",
  "M 820 2400 C 900 2140, 760 1960, 920 1680 S 1000 1240, 860 960 S 920 620, 820 360 S 880 120, 930 0",
];

const SCENE_CONFIG = {
  hero: { glow: 1, grid: 1, network: 1, particles: 1 },
  about: { glow: 0.62, grid: 1.08, network: 0.74, particles: 0.84 },
  services: { glow: 0.92, grid: 0.94, network: 1, particles: 1 },
  products: { glow: 0.84, grid: 0.92, network: 0.96, particles: 0.96 },
  statistics: { glow: 0.72, grid: 1.06, network: 0.8, particles: 0.9 },
  why: { glow: 0.64, grid: 1, network: 0.76, particles: 0.78 },
  testimonials: { glow: 0.5, grid: 0.88, network: 0.58, particles: 0.64 },
  cta: { glow: 0.98, grid: 0.96, network: 0.92, particles: 0.88 },
  footer: { glow: 1.08, grid: 0.84, network: 1.1, particles: 1 },
};

const SCENE_ORDER = Object.keys(SCENE_CONFIG);

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const makeSeed = (index, offset = 0) => {
  const value = Math.sin(index * 53.17 + offset * 11.31) * 10000;
  return value - Math.floor(value);
};

const getActiveScene = () => {
  if (typeof document === "undefined") {
    return "hero";
  }

  const sections = Array.from(document.querySelectorAll("[data-motion-zone]")).filter(
    (element) => element instanceof HTMLElement
  );

  if (sections.length === 0) {
    return "hero";
  }

  const viewportHeight = window.innerHeight || 1;
  const viewportCenter = viewportHeight * 0.42;
  let bestScene = "hero";
  let bestScore = Number.POSITIVE_INFINITY;

  sections.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= viewportHeight * 1.15) {
      return;
    }

    const intersection = Math.max(
      0,
      Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
    );
    const visibility = intersection / Math.max(1, Math.min(rect.height, viewportHeight));
    const center = rect.top + rect.height / 2;
    const distance = Math.abs(center - viewportCenter);
    const score = distance - visibility * 360;

    if (score < bestScore) {
      bestScore = score;
      bestScene = element.getAttribute("data-motion-zone") || "hero";
    }
  });

  return SCENE_ORDER.includes(bestScene) ? bestScene : "hero";
};

const HomepageBackground = () => {
  const rootRef = useRef(null);
  const reducedMotion = useReducedMotion();

  const particles = useMemo(
    () =>
      Array.from(
        { length: reducedMotion ? 12 : getParticleCount() },
        (_, index) => ({
        id: index,
        x: `${8 + makeSeed(index, 1) * 84}%`,
        y: `${6 + makeSeed(index, 2) * 88}%`,
        size: 1.2 + makeSeed(index, 3) * 2.4,
        opacity: 0.18 + makeSeed(index, 4) * 0.34,
        duration: 16 + makeSeed(index, 5) * 22,
        delay: -makeSeed(index, 6) * 24,
      })
      ),
    [reducedMotion]
  );

  const nodes = useMemo(
    () =>
      NETWORK_PATHS.map((_, index) => ({
        id: index,
        x: `${12 + makeSeed(index, 7) * 76}%`,
        y: `${12 + makeSeed(index, 8) * 76}%`,
        size: 2 + makeSeed(index, 9) * 2.6,
        delay: index * 0.65,
      })),
    []
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    const setScene = () => {
      const scene = getActiveScene();
      root.dataset.scene = scene;
      root.style.setProperty("--home-scene-strength", `${SCENE_CONFIG[scene]?.glow ?? 1}`);
    };

    const updateScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      const progress = clamp(window.scrollY / maxScroll, 0, 1);
      root.style.setProperty("--home-scroll", progress.toFixed(4));
      root.style.setProperty("--home-scroll-shift", `${(progress - 0.5) * -90}px`);
    };

    const updatePointer = (event) => {
      const finePointer =
        window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

      if (!finePointer || reducedMotion) {
        return;
      }

      const x = clamp(event.clientX / Math.max(1, window.innerWidth), 0, 1);
      const y = clamp(event.clientY / Math.max(1, window.innerHeight), 0, 1);
      root.style.setProperty("--home-pointer-x", `${x * 100}%`);
      root.style.setProperty("--home-pointer-y", `${y * 100}%`);
    };

    const resetPointer = () => {
      root.style.setProperty("--home-pointer-x", "50%");
      root.style.setProperty("--home-pointer-y", "34%");
    };

    let raf = 0;
    const schedule = () => {
      if (raf) {
        return;
      }

      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScene();
        updateScroll();
      });
    };

    setScene();
    updateScroll();
    resetPointer();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", schedule);

    return () => {
      if (raf) {
        window.cancelAnimationFrame(raf);
      }

      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`homepage-background ${reducedMotion ? "is-reduced" : ""}`.trim()}
      aria-hidden="true"
    >
      <div className="homepage-background__base" />
      <div className="homepage-background__grid" />
      <div className="homepage-background__glow" />
      <div className="homepage-background__transition homepage-background__transition--top" />
      <div className="homepage-background__transition homepage-background__transition--bottom" />

      <svg
        className="homepage-background__network"
        viewBox="0 0 1000 2400"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="homepage-network-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 200, 0.06)" />
            <stop offset="52%" stopColor="rgba(74, 141, 255, 0.44)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.22)" />
          </linearGradient>

          <radialGradient id="homepage-node-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="100%" stopColor="rgba(45, 212, 200, 0.08)" />
          </radialGradient>
        </defs>

        {NETWORK_PATHS.map((path, index) => (
          <g key={path} className={`homepage-background__network-group homepage-background__network-group--${index % 3}`}>
            <path
              className="homepage-background__network-line"
              d={path}
              style={{ "--line-delay": `${index * 0.55}s` }}
            />
          </g>
        ))}

        {nodes.map((node) => (
          <g
            key={node.id}
            className="homepage-background__network-node"
            style={{ "--node-delay": `${node.delay}s` }}
          >
            <circle cx={node.x} cy={node.y} r={node.size * 2.6} />
            <circle cx={node.x} cy={node.y} r={node.size * 0.85} />
          </g>
        ))}

        <g className="homepage-background__terrain">
          <path
            d="M 0 2030 C 120 1980, 220 2100, 340 2050 S 560 1940, 720 2000 S 860 2140, 1000 2060"
          />
          <path
            d="M 0 2140 C 140 2080, 280 2200, 430 2140 S 660 2040, 820 2120 S 920 2260, 1000 2190"
          />
          <path
            d="M 0 2260 C 160 2200, 300 2320, 460 2260 S 700 2180, 860 2250 S 940 2360, 1000 2320"
          />
        </g>
      </svg>

      <div className="homepage-background__particles">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className="homepage-background__particle"
            style={{
              "--particle-x": particle.x,
              "--particle-y": particle.y,
              "--particle-size": `${particle.size}px`,
              "--particle-opacity": particle.opacity,
              "--particle-duration": `${particle.duration}s`,
              "--particle-delay": `${particle.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default HomepageBackground;
