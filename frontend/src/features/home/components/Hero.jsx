import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiGlobe,
  FiLayers,
  FiShield,
  FiZap,
} from "react-icons/fi";

import { getHeroVisual } from "../../../api/hero-visual.api";
import { DEFAULT_ICON_KEY, PRODUCTS_ROUTE } from "../../../shared/constants";
import { getIconComponent, getSafeImageUrl } from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { useAppMotion } from "../../../providers/AppMotionProvider";
import "./hero.css";

const fallbackFeatures = [
  {
    title: "Enterprise",
    iconKey: "FiBriefcase",
    iconPosition: "top-left",
    displayOrder: 1,
    transitionDuration: 3500,
    isActive: true,
  },
  {
    title: "Modern Delivery",
    iconKey: "FiCpu",
    iconPosition: "top-right",
    displayOrder: 2,
    transitionDuration: 4200,
    isActive: true,
  },
  {
    title: "Security First",
    iconKey: "FiShield",
    iconPosition: "bottom-right",
    displayOrder: 3,
    transitionDuration: 3900,
    isActive: true,
  },
];

const fallbackHeadingLines = [
  "Enterprise IT",
  "Built To Scale",
  "Designed To Perform",
];

const stats = [
  { number: "50+", label: "Enterprise Projects" },
  { number: "20+", label: "Clients Supported" },
  { number: "99%", label: "Client Satisfaction" },
];

const trustPoints = [
  {
    icon: FiGlobe,
    label: "Global delivery",
    value: "Scalable teams and delivery governance",
  },
  {
    icon: FiShield,
    label: "Security first",
    value: "Secure-by-design applications and cloud",
  },
  {
    icon: FiLayers,
    label: "End-to-end",
    value: "Strategy, engineering, and managed support",
  },
];

const normalizeHeadingLine = (line) =>
  String(line || "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const getHeadingLines = (heroData) => {
  const lines = Array.isArray(heroData?.heroHeadingLines)
    ? heroData.heroHeadingLines.map(normalizeHeadingLine).filter(Boolean)
    : [];

  return lines.length > 0 ? lines.slice(0, 3) : fallbackHeadingLines;
};

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const visualRef = useRef(null);
  const frameRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const networkCanvasRef = useRef(null);
  const [heroData, setHeroData] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const reducedMotion = useReducedMotion();
  const { isAppReady } = useAppMotion();

  // Don't let the hero animation depend entirely on an external provider.
  // If isAppReady never resolves, this still arms the animation after 900ms.
  const [motionReady, setMotionReady] = useState(false);

  useEffect(() => {
    if (isAppReady) {
      setMotionReady(true);
      return undefined;
    }
    const timeout = window.setTimeout(() => setMotionReady(true), 900);
    return () => window.clearTimeout(timeout);
  }, [isAppReady]);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const response = await getHeroVisual();
        setHeroData(response.data?.data || null);
      } catch {
        setHeroData(null);
      }
    };

    loadHero();
  }, []);

  const features = useMemo(() => {
    const apiFeatures = heroData?.features || [];

    return apiFeatures.length > 0
      ? apiFeatures
          .filter((feature) => feature.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      : fallbackFeatures;
  }, [heroData]);

  const headingLines = useMemo(
    () => getHeadingLines(heroData),
    [heroData]
  );

  useEffect(() => {
    if (features.length === 0 || reducedMotion || features.length === 1) {
      return undefined;
    }

    const interval = Math.max(heroData?.autoTransitionInterval || 4200, 1200);
    const timer = window.setInterval(() => {
      setActiveFeature((current) => (current + 1) % features.length);
    }, interval);

    return () => window.clearInterval(timer);
  }, [features.length, heroData?.autoTransitionInterval, reducedMotion]);

  // ---------------------------------------------------------------------
  // GSAP entrance timeline — gated on `motionReady`, so it always fires
  // even if AppMotionProvider never flips isAppReady.
  // ---------------------------------------------------------------------
  useEffect(() => {
    setupGsap();

    if (reducedMotion || !motionReady) {
      return undefined;
    }

    const context = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      tl.from(".hero-eyebrow", {
        y: 18,
        autoAlpha: 0,
        duration: 0.48,
      })
        .from(
          ".hero-heading-line-inner",
          {
            yPercent: 110,
            autoAlpha: 0,
            duration: 0.95,
            stagger: 0.12,
          },
          "-=0.08"
        )
        .from(
          ".hero-description",
          {
            y: 24,
            autoAlpha: 0,
            duration: 0.5,
          },
          "-=0.55"
        )
        .from(
          ".hero-actions > *",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.42,
            stagger: 0.08,
          },
          "-=0.34"
        )
        .from(
          ".hero-trust-item",
          {
            y: 16,
            autoAlpha: 0,
            duration: 0.42,
            stagger: 0.08,
          },
          "-=0.25"
        )
        .from(
          ".hero-stat",
          {
            y: 18,
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.06,
          },
          "-=0.22"
        )
        .from(
          ".hero-feature-chip",
          {
            y: 18,
            autoAlpha: 0,
            duration: 0.4,
            stagger: 0.07,
          },
          "-=0.18"
        );

      gsap.fromTo(
        frameRef.current,
        {
          clipPath: "inset(0 0 0 100%)",
          autoAlpha: 0,
        },
        {
          clipPath: "inset(0 0 0 0%)",
          autoAlpha: 1,
          duration: 1.1,
          ease: "power4.out",
          delay: 0.18,
        }
      );

      gsap.to(visualRef.current, {
        yPercent: 4,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.8,
        },
      });
    }, heroRef);

    return () => context.revert();
  }, [reducedMotion, headingLines.length, motionReady]);

  // ---------------------------------------------------------------------
  // Ambient background particle vortex (behind the whole hero section)
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (reducedMotion) return undefined;

    const canvas = particleCanvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = null;
    let running = true;

    const POINT_COUNT = window.innerWidth < 640 ? 220 : 460;
    const TURNS = 7;
    const points = Array.from({ length: POINT_COUNT }, (_, i) => {
      const t = i / POINT_COUNT;
      return {
        angle: t * Math.PI * 2 * TURNS,
        baseRadius: t,
      };
    });

    let mouseX = 0;
    let mouseY = 0;
    let smoothTilt = 0;
    let rotation = 0;

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      mouseY = (event.clientY - rect.top) / rect.height - 0.5;
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time) => {
      if (!running) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width * 0.74;
      const cy = height * 0.46;
      const maxDim = Math.min(width, height) * 0.44;

      rotation += 0.0015;
      smoothTilt += (mouseX * 0.5 - smoothTilt) * 0.03;

      for (const p of points) {
        const wobble = Math.sin(time * 0.0005 + p.angle * 2.4) * 0.035;
        const r = (p.baseRadius + wobble) * maxDim;
        const a = p.angle + rotation + smoothTilt;
        const depthFade = 1 - p.baseRadius;

        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r * 0.52 - mouseY * 16;

        const alpha = 0.06 + depthFade * 0.42;
        const size = 0.6 + depthFade * 1.5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(239, 91, 42, ${alpha})`;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);

    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (heroRef.current) observer.observe(heroRef.current);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [reducedMotion]);

  // ---------------------------------------------------------------------
  // NEW: replaces the static office photo. A rotating 3D-projected node
  // network (points + connecting lines), drawn on canvas — no image file,
  // no extra dependency, always animating.
  // ---------------------------------------------------------------------
  useEffect(() => {
    const canvas = networkCanvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let raf = null;
    let running = true;

    const NODE_COUNT = window.innerWidth < 768 ? 46 : 70;
    const RADIUS = 1;
    const nodes = Array.from({ length: NODE_COUNT }, () => {
      // distribute roughly evenly on a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
        pulse: Math.random() * Math.PI * 2,
      };
    });

    let angleX = 0.3;
    let angleY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (event.clientX - rect.left) / rect.width - 0.5;
      mouseY = (event.clientY - rect.top) / rect.height - 0.5;
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const project = (node) => {
      // rotate around Y then X
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const x1 = node.x * cosY - node.z * sinY;
      const z1 = node.x * sinY + node.z * cosY;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const y1 = node.y * cosX - z1 * sinX;
      const z2 = node.y * sinX + z1 * cosX;

      const scale = 1.6 / (2.2 - z2);
      const sphereRadius = Math.min(width, height) * 0.34;

      return {
        x: width / 2 + x1 * sphereRadius * scale,
        y: height / 2 + y1 * sphereRadius * scale,
        scale,
        z: z2,
      };
    };

    const draw = (time) => {
      if (!running) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      angleY += 0.0022 + mouseX * 0.0015;
      angleX = 0.3 + mouseY * 0.25;

      const projected = nodes.map((n) => ({ ...project(n), pulse: n.pulse }));

      // connecting lines between nearby nodes
      ctx.lineWidth = 1;
      for (let i = 0; i < projected.length; i += 1) {
        for (let j = i + 1; j < projected.length; j += 1) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.min(width, height) * 0.16;

          if (dist < maxDist) {
            const depthFade = (a.scale + b.scale) / 2;
            const alpha = (1 - dist / maxDist) * 0.25 * depthFade;
            ctx.strokeStyle = `rgba(85, 149, 165, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      projected.forEach((p) => {
        const pulse = 0.6 + Math.sin(time * 0.002 + p.pulse) * 0.4;
        const size = 1.4 * p.scale + pulse * 0.8;
        const alpha = Math.max(0.15, p.scale - 0.3);

        ctx.beginPath();
        ctx.fillStyle = `rgba(239, 91, 42, ${alpha})`;
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    if (!reducedMotion) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        running = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    if (frameRef.current) observer.observe(frameRef.current);

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [reducedMotion]);

  const currentFeatureIndex =
    features.length > 0 ? activeFeature % features.length : 0;

  return (
    <section className="hero hero-home" ref={heroRef}>
      <canvas
        className="hero-particle-canvas"
        ref={particleCanvasRef}
        aria-hidden="true"
      />
      <div className="hero-grid-accent" />
      <div className="hero-grid-accent hero-grid-accent-secondary" />
      <div className="hero-shell">
        <div className="hero-copy">
          <span className="hero-eyebrow">Enterprise IT Services</span>

          <h1 className="hero-title">
            {headingLines.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className="hero-heading-line"
              >
                <span className="hero-heading-line-inner">{line}</span>
              </span>
            ))}
          </h1>

          <p className="hero-description">
            Technosthan designs enterprise software, cloud platforms, AI
            solutions, cybersecurity programs, and digital transformation
            systems for organizations that need reliable outcomes at scale.
          </p>

          <div className="hero-actions">
            <button
              className="btn-primary hero-primary"
              onClick={() => navigate("/contact")}
              type="button"
              data-cursor="open"
            >
              <span>Book Enterprise Consultation</span>
              <FiArrowRight size={18} />
            </button>
            <button
              className="btn-secondary hero-secondary"
              onClick={() => navigate(PRODUCTS_ROUTE)}
              type="button"
              data-cursor="view"
            >
              Explore Products
            </button>
          </div>

          <div className="hero-trust-strip">
            {trustPoints.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.label} className="hero-trust-item">
                  <span className="hero-trust-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.value}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hero-stat-row">
            {stats.map((stat) => (
              <article key={stat.label} className="hero-stat">
                <div className="hero-stat-number">{stat.number}</div>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="hero-visual" ref={visualRef}>
          <div className="hero-visual-frame" ref={frameRef}>
            <div className="hero-visual-frame-topline" />
            <canvas
              className="hero-visual-canvas"
              ref={networkCanvasRef}
              aria-hidden="true"
            />
            <div className="hero-visual-caption">
              <span>Live network visualization</span>
              <strong>Systems, connected — rendered in real time.</strong>
            </div>
          </div>

          <div className="hero-feature-grid">
            {features.map((feature, index) => {
              const IconComponent = feature.iconImageUrl
                ? null
                : getIconComponent(feature.iconKey || DEFAULT_ICON_KEY);

              return (
                <button
                  key={`${feature.title}-${feature.id || index}`}
                  type="button"
                  className={`hero-feature-chip ${
                    currentFeatureIndex === index ? "is-active" : ""
                  }`}
                  onClick={() => setActiveFeature(index)}
                  data-cursor="view"
                  style={{
                    transitionDuration: `${Math.max(
                      feature.transitionDuration || 3600,
                      1000
                    )}ms`,
                  }}
                >
                  <span className="hero-feature-icon">
                    {feature.iconImageUrl ? (
                      <img
                        src={getSafeImageUrl(feature.iconImageUrl)}
                        alt={feature.title}
                      />
                    ) : IconComponent ? (
                      <IconComponent size={18} />
                    ) : (
                      <FiZap size={18} />
                    )}
                  </span>
                  <span>{feature.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll-indicator"
        onClick={() => {
          const nextSection = heroRef.current?.nextElementSibling;
          nextSection?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        aria-label="Scroll to next section"
        data-cursor="drag"
      >
        <span>Scroll</span>
        <span className="hero-scroll-line" />
      </button>
    </section>
  );
};

export default Hero;