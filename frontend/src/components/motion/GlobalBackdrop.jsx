import { useEffect, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";

import useReducedMotion from "../../lib/useReducedMotion";
import useTheme from "../../shared/theme/useTheme";

const ROUTE_SCENES = {
  "/": "hero",
  "/about": "about",
  "/services": "services",
  "/products": "products",
  "/portfolio": "products",
  "/contact": "cta",
};

const SCENE_PRESETS = {
  hero: { particles: 120, rings: 6, cubes: 12, waves: 2, bars: 0, arcs: 4, markers: 0, circles: 2 },
  about: { particles: 52, rings: 2, cubes: 4, waves: 4, bars: 8, arcs: 0, markers: 0, circles: 6 },
  services: { particles: 96, rings: 3, cubes: 6, waves: 1, bars: 6, arcs: 2, markers: 8, circles: 2 },
  products: { particles: 84, rings: 2, cubes: 16, waves: 1, bars: 4, arcs: 2, markers: 6, circles: 2 },
  statistics: { particles: 64, rings: 1, cubes: 0, waves: 1, bars: 14, arcs: 0, markers: 8, circles: 2 },
  process: { particles: 72, rings: 10, cubes: 0, waves: 0, bars: 0, arcs: 10, markers: 6, circles: 1 },
  why: { particles: 58, rings: 2, cubes: 0, waves: 2, bars: 14, arcs: 0, markers: 4, circles: 5 },
  stack: { particles: 74, rings: 8, cubes: 4, waves: 1, bars: 6, arcs: 4, markers: 12, circles: 2 },
  testimonials: { particles: 46, rings: 1, cubes: 0, waves: 4, bars: 4, arcs: 0, markers: 2, circles: 4 },
  cta: { particles: 68, rings: 3, cubes: 2, waves: 1, bars: 0, arcs: 6, markers: 4, circles: 4 },
  footer: { particles: 88, rings: 8, cubes: 6, waves: 1, bars: 0, arcs: 10, markers: 6, circles: 4 },
};

const SCENE_LABELS = [
  "hero",
  "about",
  "services",
  "products",
  "statistics",
  "process",
  "why",
  "stack",
  "testimonials",
  "cta",
  "footer",
];

const isFinePointer = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const lerp = (from, to, amount) => from + (to - from) * amount;

const parseColor = (value) => {
  if (!value) {
    return [45, 212, 200];
  }

  const hex = value.trim();
  if (hex.startsWith("#")) {
    const normalized = hex.slice(1);
    const expanded =
      normalized.length === 3
        ? normalized
            .split("")
            .map((part) => `${part}${part}`)
            .join("")
        : normalized;
    const int = Number.parseInt(expanded, 16);
    return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
  }

  const match = hex.match(/rgba?\(([^)]+)\)/);
  if (match) {
    return match[1]
      .split(",")
      .slice(0, 3)
      .map((part) => Number.parseFloat(part.trim()) || 0);
  }

  return [45, 212, 200];
};

const makeRng = (seed) => {
  let t = 0;
  for (let index = 0; index < seed.length; index += 1) {
    t = (t * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
};

const getSceneKey = (pathname) => {
  const exact = ROUTE_SCENES[pathname];
  if (exact) {
    return exact;
  }

  if (pathname.startsWith("/services")) return "services";
  if (
    pathname.startsWith("/products") ||
    pathname.startsWith("/portfolio") ||
    pathname.startsWith("/case-studies")
  ) return "products";
  if (pathname.startsWith("/about")) return "about";
  if (pathname.startsWith("/contact")) return "cta";
  return "hero";
};

const getActiveZone = () => {
  if (typeof document === "undefined") {
    return null;
  }

  const sections = Array.from(document.querySelectorAll("[data-motion-zone]")).filter(
    (node) => node instanceof HTMLElement
  );

  if (sections.length === 0) {
    return null;
  }

  const viewportHeight = window.innerHeight || 1;
  const viewportCenter = viewportHeight * 0.42;
  let best = null;
  let bestScore = Number.POSITIVE_INFINITY;

  sections.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.bottom <= 0 || rect.top >= viewportHeight * 1.2) {
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
      best = {
        key: element.getAttribute("data-motion-zone") || "hero",
        visibility: clamp(visibility, 0, 1),
      };
    }
  });

  return best;
};

const buildScene = (sceneKey, density) => {
  const preset = SCENE_PRESETS[sceneKey] || SCENE_PRESETS.hero;
  const rng = makeRng(`${sceneKey}-${density}`);
  const particleTotal = Math.max(28, Math.floor(preset.particles * density));
  const ringTotal = Math.max(1, Math.floor(preset.rings * density));
  const cubeTotal = Math.max(0, Math.floor(preset.cubes * density));
  const waveTotal = Math.max(0, Math.floor(preset.waves * density));
  const barTotal = Math.max(0, Math.floor(preset.bars * density));
  const arcTotal = Math.max(0, Math.floor(preset.arcs * density));
  const markerTotal = Math.max(0, Math.floor(preset.markers * density));
  const circleTotal = Math.max(0, Math.floor(preset.circles * density));

  const particles = Array.from({ length: particleTotal }, (_, index) => {
    const layer = index % 3;
    return {
      x: rng() * 2 - 1,
      y: rng() * 2 - 1,
      z: rng() * 2 - 1,
      size: 0.6 + rng() * 1.6,
      phase: rng() * Math.PI * 2,
      speed: 0.18 + rng() * 0.55,
      layer,
    };
  });

  const rings = Array.from({ length: ringTotal }, (_, index) => ({
    radius: 0.12 + index * (0.05 + rng() * 0.03),
    tilt: rng() * Math.PI * 2,
    phase: rng() * Math.PI * 2,
    speed: 0.0025 + rng() * 0.008,
  }));

  const cubes = Array.from({ length: cubeTotal }, (_, index) => ({
    x: rng() * 2 - 1,
    y: rng() * 2 - 1,
    z: rng() * 2 - 1,
    size: 0.028 + rng() * 0.028,
    speed: 0.002 + rng() * 0.005,
    phase: rng() * Math.PI * 2,
    wobble: 0.35 + rng() * 0.25,
    index,
  }));

  const waves = Array.from({ length: waveTotal }, (_, index) => ({
    amplitude: 0.06 + rng() * 0.18,
    frequency: 1.5 + rng() * 3.2,
    speed: 0.0014 + rng() * 0.0035,
    phase: rng() * Math.PI * 2,
    offset: -0.46 + index * (0.92 / Math.max(1, waveTotal - 1 || 1)),
  }));

  const bars = Array.from({ length: barTotal }, (_, index) => ({
    x: rng() * 2 - 1,
    height: 0.06 + rng() * 0.24,
    width: 0.01 + rng() * 0.02,
    speed: 0.002 + rng() * 0.004,
    phase: rng() * Math.PI * 2,
    index,
  }));

  const arcs = Array.from({ length: arcTotal }, (_, index) => ({
    radius: 0.18 + index * (0.045 + rng() * 0.02),
    start: rng() * Math.PI * 2,
    sweep: 0.85 + rng() * 1.3,
    tilt: rng() * Math.PI * 2,
    speed: 0.003 + rng() * 0.006,
    index,
  }));

  const markers = Array.from({ length: markerTotal }, (_, index) => ({
    x: rng() * 2 - 1,
    y: rng() * 2 - 1,
    size: 0.8 + rng() * 1.3,
    phase: rng() * Math.PI * 2,
    speed: 0.004 + rng() * 0.008,
    index,
  }));

  const circles = Array.from({ length: circleTotal }, (_, index) => ({
    radius: 0.15 + index * (0.07 + rng() * 0.03),
    phase: rng() * Math.PI * 2,
    speed: 0.001 + rng() * 0.003,
    alpha: 0.04 + rng() * 0.05,
  }));

  return {
    particles,
    rings,
    cubes,
    waves,
    bars,
    arcs,
    markers,
    circles,
  };
};

const GlobalBackdrop = () => {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const reducedMotion = useReducedMotion();
  const { resolvedMode, accentTheme } = useTheme();
  const location = useLocation();
  const stateRef = useRef({
    width: 0,
    height: 0,
    dpr: 1,
    scroll: 0,
    pointerX: 0,
    pointerY: 0,
    pointerTX: 0,
    pointerTY: 0,
    hoverX: 0.5,
    hoverY: 0.5,
    hoverStrength: 0,
    hoverType: "",
    activeSceneKey: "hero",
    activeSceneStrength: 1,
    pointerFine: false,
    palette: {
      primary: [45, 212, 200],
      secondary: [96, 165, 250],
      neutral: [255, 255, 255],
      page: [16, 16, 16],
    },
    scene: buildScene("hero", 1),
    sceneStamp: "",
    sceneSeed: 1,
  });

  const routeScene = useMemo(() => getSceneKey(location.pathname), [location.pathname]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const state = stateRef.current;
    const finePointer = isFinePointer();
    state.pointerFine = finePointer;

    const readPalette = () => {
      const style = getComputedStyle(document.documentElement);
      state.palette = {
        primary: parseColor(
          style.getPropertyValue("--accent-primary").trim() ||
            style.getPropertyValue("--theme-primary").trim()
        ),
        secondary: parseColor(
          style.getPropertyValue("--accent-secondary").trim() ||
            style.getPropertyValue("--theme-secondary").trim()
        ),
        neutral: parseColor(
          style.getPropertyValue("--text-primary").trim() ||
            style.getPropertyValue("--text-secondary").trim()
        ),
        page: parseColor(
          style.getPropertyValue("--page-bg").trim() ||
            style.getPropertyValue("--bg-primary").trim()
        ),
      };
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, reducedMotion ? 1 : 2);
      state.width = rect.width;
      state.height = rect.height;
      state.dpr = dpr;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updateScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      state.scroll = window.scrollY / maxScroll;
    };

    const applyScene = (sceneKey) => {
      const nextSeed = `${sceneKey}-${resolvedMode}-${accentTheme}`;
      const nextStamp = `${nextSeed}-${Math.round(state.scroll * 10)}`;

      if (state.sceneStamp === nextStamp) {
        return;
      }

      state.sceneStamp = nextStamp;
      state.activeSceneKey = sceneKey;
      state.scene = buildScene(sceneKey, finePointer ? 1 : 0.72);
      state.sceneSeed += 1;
    };

    const syncActiveScene = () => {
      const activeZone = getActiveZone();
      const sceneKey = activeZone?.key || routeScene;
      state.activeSceneStrength = activeZone?.visibility ?? 0.72;
      applyScene(sceneKey);
    };

    const onPointerMove = (event) => {
      if (!state.pointerFine) {
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const nextPointerX = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1);
      const nextPointerY = clamp((event.clientY - rect.top) / Math.max(1, rect.height), 0, 1);
      state.pointerTX = nextPointerX * 2 - 1;
      state.pointerTY = nextPointerY * 2 - 1;

      const focusTarget = event.target?.closest?.("[data-motion-focus], [data-motion-zone]");
      if (focusTarget) {
        const focusRect = focusTarget.getBoundingClientRect();
        state.hoverX = clamp(
          (focusRect.left + focusRect.width / 2 - rect.left) / Math.max(1, rect.width),
          0,
          1
        );
        state.hoverY = clamp(
          (focusRect.top + focusRect.height / 2 - rect.top) / Math.max(1, rect.height),
          0,
          1
        );
        state.hoverStrength = focusTarget.hasAttribute("data-motion-focus") ? 1 : 0.54;
        state.hoverType =
          focusTarget.getAttribute("data-motion-focus") ||
          focusTarget.getAttribute("data-motion-zone") ||
          "";
      } else {
        state.hoverStrength *= 0.88;
      }
    };

    const onPointerLeave = () => {
      state.hoverStrength = 0;
      state.hoverType = "";
      state.hoverX = 0.5;
      state.hoverY = 0.5;
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        state.hoverStrength = 0;
      }
    };

    readPalette();
    resize();
    updateScroll();
    syncActiveScene();

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("scroll", syncActiveScene, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("themechange", readPalette);
    window.addEventListener("themechange", syncActiveScene);
    document.addEventListener("visibilitychange", onVisibilityChange);

    let lastSync = 0;
    let visible = !document.hidden;

    const render = (time) => {
      frameRef.current = 0;

      if (!visible || document.hidden) {
        return;
      }

      if (time - lastSync > 120) {
        syncActiveScene();
        lastSync = time;
      }

      const {
        width,
        height,
        palette,
        scene,
        activeSceneKey,
        activeSceneStrength,
      } = state;

      if (!width || !height) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      const darkMode = resolvedMode === "dark";
      const accent = palette.primary;
      const secondary = palette.secondary;
      const neutral = palette.neutral;
      const page = palette.page;
      const centerX = width * (0.5 + state.pointerX * 0.045);
      const centerY = height * (0.46 + state.pointerY * 0.04);
      const hoverX = width * state.hoverX;
      const hoverY = height * state.hoverY;
      const hoverBoost = state.hoverStrength * (state.pointerFine ? 1 : 0.3);
      const sceneEnergy = clamp(activeSceneStrength * (darkMode ? 1 : 0.85), 0.25, 1);
      const routeFactor = SCENE_LABELS.indexOf(activeSceneKey) + 1;
      const rotation = time * (darkMode ? 0.00005 : 0.000035) + state.scroll * Math.PI * 0.95;

      state.pointerX = lerp(state.pointerX, state.pointerTX, reducedMotion ? 0.08 : 0.045);
      state.pointerY = lerp(state.pointerY, state.pointerTY, reducedMotion ? 0.08 : 0.045);
      state.hoverStrength = lerp(state.hoverStrength, 0, 0.012);

      context.clearRect(0, 0, width, height);

      const bg = context.createRadialGradient(
        width * 0.18,
        height * 0.12,
        0,
        width * 0.5,
        height * 0.42,
        Math.max(width, height) * 0.92
      );
      bg.addColorStop(0, `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${darkMode ? 0.16 : 0.08})`);
      bg.addColorStop(
        0.42,
        `rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${darkMode ? 0.08 : 0.04})`
      );
      bg.addColorStop(
        1,
        `rgba(${page[0]}, ${page[1]}, ${page[2]}, ${darkMode ? 0.92 : 0.78})`
      );
      context.fillStyle = bg;
      context.fillRect(0, 0, width, height);

      const drawLine = (x1, y1, x2, y2, color, alpha, widthValue = 1) => {
        context.strokeStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        context.lineWidth = widthValue;
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      };

      const drawNode = (x, y, radius, color, alpha) => {
        context.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      };

      const attract = (x, y, intensity = 1) => {
        const dx = x - hoverX;
        const dy = y - hoverY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const pull = clamp(1 - dist * 1.8, 0, 1) * hoverBoost * intensity;
        return {
          x: x + dx * -0.08 * pull,
          y: y + dy * -0.08 * pull,
          pull,
        };
      };

      const drawWaveLayer = (offset, amplitude, frequency, alpha, speed, scale = 1) => {
        context.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const ratio = x / Math.max(1, width);
          const wave =
            Math.sin(ratio * Math.PI * frequency + time * speed + offset) * amplitude;
          const y =
            height * 0.5 +
            wave * height * scale +
            Math.sin(time * 0.0004 + offset) * height * 0.02;
          if (x === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${alpha})`;
        context.lineWidth = 1;
        context.stroke();
      };

      const drawSafetyVignette = (opacity = 0.28) => {
        const safety = context.createRadialGradient(
          width * 0.52,
          height * 0.44,
          Math.min(width, height) * 0.1,
          width * 0.5,
          height * 0.45,
          Math.max(width, height) * 0.95
        );
        safety.addColorStop(0, `rgba(${page[0]}, ${page[1]}, ${page[2]}, ${opacity})`);
        safety.addColorStop(0.64, `rgba(${page[0]}, ${page[1]}, ${page[2]}, ${opacity * 0.35})`);
        safety.addColorStop(1, "rgba(0, 0, 0, 0)");
        context.fillStyle = safety;
        context.fillRect(0, 0, width, height);
      };

      const sceneDrawers = {
        hero() {
          const particlePoints = scene.particles.map((point, index) => {
            const depth = 1.1 / (1.8 - point.z * 0.6);
            const baseOrbit = rotation + index * 0.017;
            const orbitRadius = 0.22 + Math.abs(point.z) * 0.22 + (index % 7) * 0.004;
            const orbitX =
              Math.cos(baseOrbit + point.phase) * orbitRadius + point.x * 0.14;
            const orbitY =
              Math.sin(baseOrbit * 0.94 + point.phase * 0.7) * orbitRadius * 0.9 + point.y * 0.12;
            const focus = attract(
              clamp(0.5 + orbitX * 0.42, 0, 1),
              clamp(0.5 + orbitY * 0.34, 0, 1),
              1
            );
            const x = centerX + orbitX * width * 0.46 * depth + (focus.x - 0.5) * width * 0.12;
            const y = centerY + orbitY * height * 0.36 * depth + (focus.y - 0.5) * height * 0.1;
            return { x, y, point, depth, focus: focus.pull };
          });

          const maxLine = Math.min(width, height) * 0.22;
          for (let i = 0; i < particlePoints.length; i += 1) {
            const a = particlePoints[i];
            for (let j = i + 1; j < Math.min(i + 5, particlePoints.length); j += 1) {
              const b = particlePoints[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist > maxLine) continue;
              const alpha = (1 - dist / maxLine) * 0.18 * sceneEnergy;
              context.strokeStyle = `rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${alpha})`;
              context.beginPath();
              context.moveTo(a.x, a.y);
              context.quadraticCurveTo(
                (a.x + b.x) / 2 + state.pointerX * 36,
                (a.y + b.y) / 2 + state.pointerY * 26,
                b.x,
                b.y
              );
              context.stroke();
            }
          }

          scene.rings.forEach((ring, index) => {
            const x = centerX + Math.cos(rotation * ring.speed * 18 + ring.phase) * width * (0.12 + index * 0.018);
            const y = centerY + Math.sin(rotation * ring.speed * 12 + ring.tilt) * height * (0.06 + index * 0.01);
            const radius = Math.min(width, height) * ring.radius * (0.7 + sceneEnergy * 0.2);
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.06 + index * 0.015})`;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(x, y, radius, rotation * 0.18 + index * 0.12, rotation * 0.18 + Math.PI * 1.45);
            context.stroke();
          });

          scene.cubes.forEach((cube, index) => {
            const twirl = rotation * cube.speed * 70 + cube.phase;
            const cx = centerX + Math.cos(twirl + cube.x * 4) * width * 0.26;
            const cy = centerY + Math.sin(twirl * 0.9 + cube.y * 4) * height * 0.18;
            const size = Math.min(width, height) * cube.size * (0.85 + Math.sin(twirl) * 0.12);
            const alpha = 0.1 + (index % 4) * 0.03;
            context.save();
            context.translate(cx, cy);
            context.rotate(twirl * 0.24 + state.pointerX * 0.05);
            context.strokeStyle = `rgba(${neutral[0]}, ${neutral[1]}, ${neutral[2]}, ${alpha})`;
            context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${alpha * 0.28})`;
            context.lineWidth = 1;
            context.strokeRect(-size, -size, size * 2, size * 2);
            context.fillRect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.2);
            context.restore();
          });

          particlePoints.forEach((particle, index) => {
            const size = clamp(particle.point.size * (1 + particle.focus * 0.9), 0.8, 4.2);
            const alpha = clamp(0.18 + particle.depth * 0.22 + particle.focus * 0.4, 0.12, 0.72);
            drawNode(
              particle.x,
              particle.y,
              size,
              index % 3 === 0 ? accent : secondary,
              alpha * sceneEnergy
            );
          });
        },
        about() {
          drawWaveLayer(0.15, 0.05, 3.2, 0.08, 0.0018, 0.65);
          drawWaveLayer(2.4, 0.04, 2.2, 0.06, 0.0012, 0.52);

          scene.circles.forEach((circle, index) => {
            const radius = Math.min(width, height) * circle.radius * 1.1;
            const pulse = 0.5 + Math.sin(rotation * 0.7 + circle.phase) * 0.2;
            const gradient = context.createRadialGradient(
              width * (0.28 + index * 0.11),
              height * (0.28 + index * 0.07),
              0,
              width * 0.5,
              height * 0.45,
              radius
            );
            gradient.addColorStop(
              0,
              `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.08 + pulse * 0.05})`
            );
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            context.fillStyle = gradient;
            context.beginPath();
            context.arc(
              width * (0.22 + index * 0.11) + Math.sin(rotation + index) * 28,
              height * (0.22 + index * 0.08) + Math.cos(rotation * 0.9 + index) * 22,
              radius,
              0,
              Math.PI * 2
            );
            context.fill();
          });

          scene.bars.forEach((bar, index) => {
            const x = width * ((index + 1) / (scene.bars.length + 1));
            const heightValue = Math.min(height * 0.45, height * bar.height * (1.4 + Math.sin(rotation + bar.phase) * 0.2));
            context.fillStyle = `rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${0.05 + index * 0.003})`;
            context.fillRect(x - bar.width * width * 0.5, centerY - heightValue * 0.5, Math.max(1, bar.width * width), heightValue);
          });

          scene.particles.slice(0, 24).forEach((particle, index) => {
            const x = width * (0.16 + (index % 6) * 0.13) + Math.sin(rotation * particle.speed + particle.phase) * 18;
            const y = height * (0.2 + Math.floor(index / 6) * 0.16) + Math.cos(rotation * 0.8 + particle.phase) * 14;
            drawNode(x, y, 1.4 + (index % 3) * 0.3, index % 2 === 0 ? accent : secondary, 0.22);
          });

          drawSafetyVignette(0.34);
        },
        services() {
          const cols = 7;
          const rows = 4;
          for (let col = 0; col <= cols; col += 1) {
            const x = (width / cols) * col;
            drawLine(x, height * 0.08, x, height * 0.92, secondary, 0.04 + col * 0.003, 1);
          }
          for (let row = 0; row <= rows; row += 1) {
            const y = (height / rows) * row;
            drawLine(width * 0.06, y, width * 0.94, y, secondary, 0.04 + row * 0.005, 1);
          }

          scene.particles.forEach((particle, index) => {
            const phase = rotation * particle.speed + particle.phase;
            const x = width * (0.1 + ((index * 37) % 80) / 100) + Math.sin(phase) * 16;
            const y = height * (0.12 + ((index * 19) % 68) / 100) + Math.cos(phase * 1.1) * 12;
            const focus = attract(x / width, y / height, 1.2);
            const dx = (focus.x - 0.5) * width * 0.16;
            const dy = (focus.y - 0.5) * height * 0.14;
            drawNode(
              x + dx,
              y + dy,
              1.2 + (index % 4) * 0.35,
              index % 2 === 0 ? accent : secondary,
              0.18 + focus.pull * 0.42
            );
          });

          scene.markers.forEach((marker, index) => {
            const x = width * (0.2 + ((index * 13) % 60) / 100);
            const y = height * (0.18 + ((index * 17) % 52) / 100);
            context.save();
            context.translate(x, y);
            context.rotate(rotation * 0.4 + marker.phase);
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.08 + index * 0.004})`;
            context.lineWidth = 1;
            context.strokeRect(-8, -8, 16, 16);
            context.restore();
          });
        },
        products() {
          const gridX = 8;
          const gridY = 5;
          for (let i = 0; i <= gridX; i += 1) {
            const x = (width / gridX) * i;
            drawLine(x, height * 0.1, x + Math.sin(rotation * 0.4 + i) * 18, height * 0.92, secondary, 0.045, 1);
          }
          for (let i = 0; i <= gridY; i += 1) {
            const y = (height / gridY) * i;
            drawLine(width * 0.08, y, width * 0.92, y + Math.cos(rotation * 0.35 + i) * 10, secondary, 0.04, 1);
          }

          scene.cubes.forEach((cube, index) => {
            const twirl = rotation * cube.speed * 64 + cube.phase;
            const x = width * (0.2 + ((index * 11) % 60) / 100) + Math.sin(twirl) * 28;
            const y = height * (0.18 + ((index * 7) % 48) / 100) + Math.cos(twirl * 0.8) * 22;
            const size = 10 + cube.size * 220;
            const scale = 0.95 + Math.sin(twirl) * 0.1;
            context.save();
            context.translate(x, y);
            context.rotate(twirl * 0.24);
            context.scale(scale, scale);
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.08 + index * 0.004})`;
            context.lineWidth = 1;
            context.strokeRect(-size * 0.5, -size * 0.5, size, size);
            context.strokeRect(-size * 0.34, -size * 0.34, size * 0.68, size * 0.68);
            context.restore();
          });

          scene.markers.forEach((marker, index) => {
            const x = width * (0.18 + ((index * 17) % 62) / 100);
            const y = height * (0.15 + ((index * 9) % 50) / 100);
            const focus = attract(x / width, y / height, 1.3);
            drawNode(x + (focus.x - 0.5) * width * 0.12, y + (focus.y - 0.5) * height * 0.1, 1.8, accent, 0.18 + focus.pull * 0.32);
          });
        },
        statistics() {
          const lines = 10;
          for (let i = 0; i < lines; i += 1) {
            const x = width * (0.1 + (i / Math.max(1, lines - 1)) * 0.8);
            drawLine(x, height * 0.22, x, height * 0.8, secondary, 0.05, 1);
          }

          scene.bars.forEach((bar, index) => {
            const x = width * (0.1 + index * (0.8 / Math.max(1, scene.bars.length - 1 || 1)));
            const heightValue = height * (bar.height + 0.08 + Math.sin(rotation * 1.2 + bar.phase) * 0.02);
            const active = clamp(1 - Math.abs(x - hoverX) / (width * 0.18), 0, 1) * hoverBoost;
            context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.08 + active * 0.16})`;
            context.fillRect(x - 4, centerY - heightValue * 0.5, 8, heightValue);
            drawNode(x, centerY - heightValue * 0.52, 1.2 + active * 1.4, accent, 0.35 + active * 0.4);
          });

          scene.particles.slice(0, 28).forEach((particle, index) => {
            const x = width * (0.12 + (index % 7) * 0.11) + Math.sin(rotation * particle.speed + particle.phase) * 18;
            const y = height * (0.22 + Math.floor(index / 7) * 0.14) + Math.cos(rotation * 0.9 + particle.phase) * 9;
            drawLine(x - 10, y, x + 10, y, secondary, 0.08, 1);
          });
        },
        process() {
          const ringRadiusBase = Math.min(width, height) * 0.08;
          scene.rings.forEach((ring, index) => {
            const radius = ringRadiusBase + index * Math.min(width, height) * 0.035;
            const x = centerX + Math.cos(rotation * ring.speed * 16 + ring.phase) * width * 0.06;
            const y = centerY + Math.sin(rotation * ring.speed * 12 + ring.tilt) * height * 0.04;
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.08 + index * 0.012})`;
            context.lineWidth = 1.15;
            context.beginPath();
            context.arc(x, y, radius, rotation * 0.18 + index * 0.1, rotation * 0.18 + Math.PI * 1.55);
            context.stroke();
          });

          scene.arcs.forEach((arc, index) => {
            const radius = Math.min(width, height) * arc.radius * 1.35;
            const x = centerX + Math.cos(arc.tilt + rotation * arc.speed * 10) * width * 0.08;
            const y = centerY + Math.sin(arc.tilt + rotation * arc.speed * 8) * height * 0.05;
            context.strokeStyle = `rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${0.06 + index * 0.01})`;
            context.lineWidth = 1;
            context.beginPath();
            context.arc(
              x,
              y,
              radius,
              arc.start + rotation * arc.speed,
              arc.start + arc.sweep + rotation * arc.speed
            );
            context.stroke();
          });

          scene.particles.forEach((particle, index) => {
            const angle = rotation * 0.8 + particle.phase + index * 0.12;
            const orbitX = centerX + Math.cos(angle) * width * (0.06 + (index % 4) * 0.012);
            const orbitY = centerY + Math.sin(angle) * height * (0.04 + (index % 5) * 0.01);
            drawNode(orbitX, orbitY, 1.5 + (index % 4) * 0.2, index % 2 === 0 ? accent : secondary, 0.22 + index * 0.002);
          });
        },
        why() {
          for (let i = 0; i < 14; i += 1) {
            const x = width * (0.08 + i * 0.065);
            const travel = Math.sin(rotation * 0.6 + i * 0.7) * height * 0.08;
            drawLine(x, height * 0.12 + travel, x, height * 0.92 - travel, secondary, 0.05 + i * 0.002, 1);
          }

          scene.bars.forEach((bar, index) => {
            const x = width * (0.12 + (index / Math.max(1, scene.bars.length - 1 || 1)) * 0.76);
            const active = clamp(1 - Math.abs(x - hoverX) / (width * 0.22), 0, 1);
            const h = height * (bar.height + 0.08 + Math.sin(rotation + bar.phase) * 0.02);
            context.fillStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.06 + active * 0.12})`;
            context.fillRect(x - 2, height * 0.5 - h * 0.5, 4, h);
          });

          scene.particles.slice(0, 36).forEach((particle, index) => {
            const x = width * (0.18 + (index % 6) * 0.12);
            const y = height * (0.18 + Math.floor(index / 6) * 0.12) + Math.sin(rotation * particle.speed + particle.phase) * 14;
            drawNode(x, y, 1.3, index % 2 === 0 ? accent : secondary, 0.18);
          });
        },
        stack() {
          for (let i = 0; i < 6; i += 1) {
            const y = height * (0.18 + i * 0.11);
            drawLine(width * 0.08, y, width * 0.92, y + Math.sin(rotation * 0.4 + i) * 10, secondary, 0.05, 1);
          }

          scene.rings.forEach((ring, index) => {
            const x = width * (0.55 + Math.sin(rotation * ring.speed * 20 + ring.phase) * 0.14);
            const y = height * (0.42 + Math.cos(rotation * ring.speed * 12 + ring.tilt) * 0.12);
            const radius = Math.min(width, height) * (0.16 + index * 0.022);
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.06 + index * 0.01})`;
            context.beginPath();
            context.arc(x, y, radius, rotation * 0.2 + index * 0.08, rotation * 0.2 + Math.PI * 1.6);
            context.stroke();
          });

          scene.markers.forEach((marker, index) => {
            const x = width * (0.16 + ((index * 19) % 66) / 100) + Math.sin(rotation * marker.speed + marker.phase) * 14;
            const y = height * (0.15 + ((index * 11) % 58) / 100) + Math.cos(rotation * marker.speed + marker.phase) * 10;
            drawNode(x, y, 1.5 + (index % 3) * 0.25, index % 2 === 0 ? accent : secondary, 0.2);
          });
        },
        testimonials() {
          drawWaveLayer(0.5, 0.03, 2.3, 0.06, 0.0015, 0.55);
          drawWaveLayer(2.8, 0.025, 1.7, 0.05, 0.001, 0.5);

          const quoteSize = Math.min(width, height) * 0.08;
          context.save();
          context.globalAlpha = 0.14;
          context.fillStyle = `rgb(${accent[0]}, ${accent[1]}, ${accent[2]})`;
          context.font = `${quoteSize}px Georgia, serif`;
          context.fillText("“", width * 0.12, height * 0.24);
          context.fillText("”", width * 0.82, height * 0.74);
          context.restore();

          scene.circles.forEach((circle, index) => {
            const radius = Math.min(width, height) * circle.radius * 1.2;
            const x = width * (0.25 + index * 0.14);
            const y = height * (0.24 + index * 0.09);
            const glow = context.createRadialGradient(x, y, 0, x, y, radius);
            glow.addColorStop(0, `rgba(${secondary[0]}, ${secondary[1]}, ${secondary[2]}, ${circle.alpha})`);
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            context.fillStyle = glow;
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
          });

          scene.particles.forEach((particle, index) => {
            const x = width * (0.16 + (index % 7) * 0.12) + Math.sin(rotation * particle.speed + particle.phase) * 10;
            const y = height * (0.2 + Math.floor(index / 7) * 0.13) + Math.cos(rotation * 0.8 + particle.phase) * 8;
            drawNode(x, y, 1.2 + (index % 2) * 0.15, index % 2 === 0 ? accent : secondary, 0.14);
          });
        },
        cta() {
          const targetX = hoverBoost > 0.05 ? hoverX : 0.72;
          const targetY = hoverBoost > 0.05 ? hoverY : 0.74;

          scene.arcs.forEach((arc, index) => {
            const radius = Math.min(width, height) * (0.15 + index * 0.028);
            const x = lerp(width * 0.5, width * targetX, 0.22) + Math.sin(rotation * arc.speed * 8 + arc.tilt) * 18;
            const y = lerp(height * 0.58, height * targetY, 0.18) + Math.cos(rotation * arc.speed * 7 + arc.tilt) * 14;
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.07 + index * 0.01})`;
            context.beginPath();
            context.arc(x, y, radius, arc.start, arc.start + arc.sweep);
            context.stroke();
          });

          scene.particles.forEach((particle, index) => {
            const factor = index / Math.max(1, scene.particles.length - 1);
            const x = lerp(width * 0.2, width * targetX, factor);
            const y = lerp(height * 0.22, height * targetY, factor);
            const dx = (x - width * targetX) * -0.18 * hoverBoost;
            const dy = (y - height * targetY) * -0.18 * hoverBoost;
            drawNode(
              x + dx + Math.sin(rotation * particle.speed + particle.phase) * 4,
              y + dy + Math.cos(rotation * particle.speed + particle.phase) * 4,
              1.2 + (index % 3) * 0.2,
              index % 2 === 0 ? accent : secondary,
              0.18 + hoverBoost * 0.25
            );
          });

          drawLine(width * 0.2, height * 0.72, width * 0.58, height * 0.64, accent, 0.12 + hoverBoost * 0.14, 1.25);
        },
        footer() {
          const baseY = height * 0.74;
          scene.arcs.forEach((arc, index) => {
            const radius = Math.min(width, height) * (0.2 + index * 0.035);
            const x = width * 0.5 + Math.sin(rotation * arc.speed * 8 + arc.tilt) * width * 0.12;
            const y = baseY + Math.cos(rotation * arc.speed * 7 + arc.tilt) * height * 0.05;
            context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${0.06 + index * 0.008})`;
            context.beginPath();
            context.arc(x, y, radius, Math.PI * 1.05, Math.PI * 1.95);
            context.stroke();
          });

          scene.particles.forEach((particle, index) => {
            const anchor = index % 2 === 0 ? 0.18 : 0.82;
            const x = width * anchor + Math.sin(rotation * particle.speed + particle.phase) * 18;
            const y = baseY + Math.cos(rotation * particle.speed + particle.phase) * 16;
            drawNode(x, y, 1.2 + (index % 4) * 0.2, index % 2 === 0 ? accent : secondary, 0.16);
          });

          drawLine(width * 0.18, baseY - 56, width * 0.82, baseY - 34, secondary, 0.08, 1);
          drawSafetyVignette(0.24);
        },
      };

      const drawScene = sceneDrawers[activeSceneKey] || sceneDrawers.hero;
      drawScene();

      if (!reducedMotion) {
        frameRef.current = window.requestAnimationFrame(render);
      }
    };

    const startLoop = () => {
      if (frameRef.current || reducedMotion) {
        return;
      }

      visible = true;
      frameRef.current = window.requestAnimationFrame(render);
    };

    const stopLoop = () => {
      visible = false;
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = 0;
      }
    };

    const onThemeChange = () => {
      readPalette();
      syncActiveScene();
    };

    const onVisibility = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        readPalette();
        resize();
        updateScroll();
        syncActiveScene();
        startLoop();
      }
    };

    window.addEventListener("focus", onThemeChange);
    document.addEventListener("visibilitychange", onVisibility);

    if (reducedMotion) {
      syncActiveScene();
      render(performance.now());
    } else {
      startLoop();
    }

    return () => {
      stopLoop();
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("scroll", syncActiveScene);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("themechange", readPalette);
      window.removeEventListener("themechange", syncActiveScene);
      window.removeEventListener("focus", onThemeChange);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [accentTheme, reducedMotion, resolvedMode, routeScene]);

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return <canvas ref={canvasRef} className="global-motion-backdrop" aria-hidden="true" />;
};

export default GlobalBackdrop;
