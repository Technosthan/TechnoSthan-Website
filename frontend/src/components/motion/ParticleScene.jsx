import { useEffect, useMemo, useRef } from "react";
import useReducedMotion from "../../hooks/useReducedMotion";
import useTheme from "../../shared/theme/useTheme";

const lowPerformanceDevice = () => {
  if (typeof window === "undefined") {
    return true;
  }

  const finePointer = window.matchMedia?.("(pointer: fine)")?.matches;
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const saveData = navigator.connection?.saveData;

  return !finePointer || saveData || hardwareConcurrency < 4;
};

const parseColor = (value) => {
  if (!value) {
    return [239, 91, 42];
  }

  const hex = value.trim();
  if (hex.startsWith("#")) {
    const normalized = hex.slice(1);
    const chunk =
      normalized.length === 3
        ? normalized
            .split("")
            .map((part) => `${part}${part}`)
            .join("")
        : normalized;

    const int = Number.parseInt(chunk, 16);
    return [
      (int >> 16) & 255,
      (int >> 8) & 255,
      int & 255,
    ];
  }

  const match = hex.match(/rgba?\(([^)]+)\)/);
  if (match) {
    return match[1]
      .split(",")
      .slice(0, 3)
      .map((part) => Number.parseFloat(part.trim()) || 0);
  }

  return [239, 91, 42];
};

const buildPoints = (count, variant) => {
  const points = [];
  const spread = variant === "loader" ? 0.7 : variant === "contact" ? 0.56 : 0.82;

  for (let index = 0; index < count; index += 1) {
    const t = index / count;
    const angle = t * Math.PI * 2 * (variant === "grid" ? 3 : 1.4);
    const radius = spread * (0.35 + 0.65 * Math.sin(t * Math.PI));
    const depth = (Math.sin(t * Math.PI * 4) + Math.cos(t * Math.PI * 2)) * 0.18;

    let x = Math.cos(angle) * radius;
    let y = Math.sin(angle * (variant === "grid" ? 0.7 : 1)) * radius;
    let z = depth;

    if (variant === "grid") {
      const row = Math.floor(Math.sqrt(count));
      const col = count / row;
      x = ((index % col) / col - 0.5) * 1.3;
      y = (Math.floor(index / col) / row - 0.5) * 1.0;
      z = Math.sin(index * 0.27) * 0.18;
    } else if (variant === "helix") {
      x = Math.cos(t * Math.PI * 8) * 0.36;
      y = t * 1.2 - 0.6;
      z = Math.sin(t * Math.PI * 8) * 0.18;
    } else if (variant === "sphere") {
      const phi = Math.acos(2 * t - 1);
      const theta = Math.PI * (1 + Math.sqrt(5)) * index;
      x = Math.sin(phi) * Math.cos(theta) * 0.5;
      y = Math.sin(phi) * Math.sin(theta) * 0.5;
      z = Math.cos(phi) * 0.35;
    } else {
      x += Math.sin(t * Math.PI * 6) * 0.08;
      y += Math.cos(t * Math.PI * 4) * 0.08;
    }

    points.push({
      x,
      y,
      z,
      baseX: x,
      baseY: y,
      baseZ: z,
      size: 0.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.35 + Math.random() * 0.55,
    });
  }

  return points;
};

const ParticleScene = ({
  variant = "hero",
  className = "",
  active = true,
  density = 1,
}) => {
  const canvasRef = useRef(null);
  const sceneRef = useRef({
    frame: 0,
    width: 0,
    height: 0,
    left: 0,
    top: 0,
    pointerX: 0,
    pointerY: 0,
    pointerStrength: 0,
    scroll: 0,
    points: [],
    basePalette: [239, 91, 42],
    accentPalette: [239, 91, 42],
  });
  const reducedMotion = useReducedMotion();
  const { resolvedMode, accentTheme } = useTheme();

  const particleCount = useMemo(() => {
    const base = variant === "loader" ? 48 : variant === "contact" ? 56 : 72;
    const mobileMultiplier =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches
        ? 0.3
        : 1;
    const perfMultiplier = reducedMotion || lowPerformanceDevice() ? 0.24 : 1;

    return Math.max(36, Math.floor(base * mobileMultiplier * perfMultiplier * density));
  }, [density, reducedMotion, variant]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) {
      return undefined;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return undefined;
    }

    const rootStyle = getComputedStyle(document.documentElement);
    const themeColor =
      rootStyle.getPropertyValue("--particle-primary").trim() ||
      rootStyle.getPropertyValue("--theme-primary").trim() ||
      rootStyle.getPropertyValue("--accent-primary").trim();
    const accentColor =
      rootStyle.getPropertyValue("--particle-secondary").trim() ||
      rootStyle.getPropertyValue("--accent-primary").trim();
    sceneRef.current.basePalette = parseColor(themeColor);
    sceneRef.current.accentPalette = parseColor(accentColor);
    sceneRef.current.points = buildPoints(particleCount, variant);
    sceneRef.current.pointerStrength = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      sceneRef.current.width = rect.width;
      sceneRef.current.height = rect.height;
      sceneRef.current.left = rect.left;
      sceneRef.current.top = rect.top;
      canvas.width = Math.max(1, Math.round(rect.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(rect.height * pixelRatio));
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const updatePointer = (event) => {
      const { left, top, width, height } = sceneRef.current;
      if (!width || !height) {
        return;
      }

      const x = (event.clientX - left) / width - 0.5;
      const y = (event.clientY - top) / height - 0.5;
      sceneRef.current.pointerX = x;
      sceneRef.current.pointerY = y;
      sceneRef.current.pointerStrength = 1;
    };

    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      sceneRef.current.scroll = window.scrollY / maxScroll;
    };

    const onThemeChange = () => {
      const nextColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--particle-primary")
        .trim() ||
        getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-primary")
        .trim();
      const nextAccent = getComputedStyle(document.documentElement)
        .getPropertyValue("--particle-secondary")
        .trim() ||
        getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-primary")
        .trim();
      sceneRef.current.basePalette = parseColor(nextColor);
      sceneRef.current.accentPalette = parseColor(nextAccent);
    };

    resize();
    onScroll();
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });
    window.addEventListener("focus", onThemeChange);

    let lastTime = 0;
    let frameId = 0;
    let isRunning = true;
    let isVisible = true;
    let visibilityTimer = 0;

    const stopLoop = () => {
      if (!isRunning) {
        return;
      }

      isRunning = false;
      if (frameId) {
        window.cancelAnimationFrame(frameId);
        frameId = 0;
      }
    };

    const startLoop = () => {
      if (isRunning || !isVisible || document.hidden) {
        return;
      }

      isRunning = true;
      frameId = window.requestAnimationFrame(render);
    };

    const syncLoop = () => {
      window.clearTimeout(visibilityTimer);
      visibilityTimer = window.setTimeout(() => {
        if (isVisible && !document.hidden) {
          startLoop();
        } else {
          stopLoop();
        }
      }, 60);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = Boolean(entry?.isIntersecting);
        syncLoop();
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);

    const onVisibilityChange = () => {
      syncLoop();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    const render = (time) => {
      if (!isVisible || document.hidden) {
        stopLoop();
        return;
      }

      const state = sceneRef.current;
      const { width, height, points, basePalette, accentPalette } = state;
      if (!width || !height) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      const delta = Math.min(32, time - lastTime || 16);
      lastTime = time;
      const baseRotation = state.scroll * Math.PI * 0.65 + time * 0.00004;

      context.clearRect(0, 0, width, height);
      context.save();
      context.globalCompositeOperation = "source-over";
      context.translate(width / 2, height / 2);

      const ambientScale = resolvedMode === "light" ? 0.9 : 1.0;
      const primary = basePalette;
      const accent = accentPalette;
      const pointerX = state.pointerX;
      const pointerY = state.pointerY;
      const pointerFalloff = reducedMotion ? 0 : state.pointerStrength;
      const radiusBoost = variant === "contact" ? 1.16 : 1;
      const projectedPoints = [];

      points.forEach((point) => {
        const wobble = Math.sin(time * 0.0007 * point.speed + point.phase) * 0.04;
        const scrollWarp = state.scroll * (variant === "loader" ? 0.28 : 0.18);
        const focus = Math.max(
          0,
          1 - (Math.abs(point.baseX - pointerX * 0.9) + Math.abs(point.baseY - pointerY * 0.9))
        );
        const pull = pointerFalloff * focus * 0.2;
        const scale = (1 + point.baseZ * 0.6 + scrollWarp) * ambientScale * radiusBoost;
        const x = (point.baseX + pointerX * 0.14 * focus + wobble) * width * 0.44 * scale;
        const y = (point.baseY + pointerY * 0.12 * focus - wobble) * height * 0.36 * scale;
        const z = point.baseZ + Math.sin(time * 0.0006 + point.phase) * 0.08 + scrollWarp;

        const alpha = Math.min(0.9, 0.18 + Math.abs(z) * 0.45 + focus * 0.45);
        const size = (1.2 + point.size * 1.25 + pull * 8) * (1 + Math.abs(z) * 0.5);

        projectedPoints.push({
          x,
          y,
          size,
          alpha,
          focus,
          z,
        });
      });

      const lineThreshold = Math.min(width, height) * 0.11;
      context.lineWidth = 0.7;
      projectedPoints.forEach((point, index) => {
        for (let offset = 1; offset <= 1; offset += 1) {
          const other = projectedPoints[index + offset];
          if (!other) {
            continue;
          }

          const dx = other.x - point.x;
          const dy = other.y - point.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > lineThreshold) {
            continue;
          }

          const lineAlpha = (1 - distance / lineThreshold) * 0.18;
          context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${lineAlpha})`;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      });

      projectedPoints.forEach((point, index) => {
        context.save();
        context.translate(point.x, point.y);
        context.rotate(baseRotation + index * 0.02);

        context.fillStyle = `rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, ${point.alpha})`;
        context.shadowColor = `rgba(${primary[0]}, ${primary[1]}, ${primary[2]}, ${point.alpha})`;
        context.shadowBlur = 1 + point.focus * 2;

        context.beginPath();
        context.arc(0, 0, point.size, 0, Math.PI * 2);
        context.fill();

        if (index % 9 === 0) {
          context.strokeStyle = `rgba(${accent[0]}, ${accent[1]}, ${accent[2]}, ${point.alpha * 0.48})`;
          context.lineWidth = 0.8;
          context.beginPath();
          context.arc(0, 0, point.size * 2.2, 0, Math.PI * 2);
          context.stroke();
        }

        context.restore();
      });

      context.restore();
      state.pointerStrength *= Math.max(0.86, 1 - delta * 0.002);
      frameId = window.requestAnimationFrame(render);
    };

    frameId = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(visibilityTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", updatePointer);
      window.removeEventListener("focus", onThemeChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
    };
  }, [active, accentTheme, particleCount, reducedMotion, resolvedMode, variant]);

  if (!active) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className={`particle-scene ${className}`.trim()}
      aria-hidden="true"
      data-particle-scene
    />
  );
};

export default ParticleScene;
