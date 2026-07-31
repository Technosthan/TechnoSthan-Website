import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCompass, FiGlobe, FiShield, FiZap } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import useMagnetic from "../../../hooks/useMagnetic";
import { useAppMotion } from "../../../providers/AppMotionProvider";
import TextRotator from "../../../components/motion/TextRotator";
import TiltCard from "../../../components/motion/TiltCard";

const EditorialHero = ({ heroVisual, stats, featuredService }) => {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const visualRef = useRef(null);
  const imageRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { isAppReady } = useAppMotion();
  useMagnetic(scopeRef);
  const centerRef = useRef({ x: 0, y: 0 });

  const syncVisualCenter = () => {
    if (!visualRef.current) {
      return;
    }

    const bounds = visualRef.current.getBoundingClientRect();
    centerRef.current = {
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    };
  };

  const headingLines = Array.isArray(heroVisual?.heroHeadingLines)
    ? heroVisual.heroHeadingLines.filter(Boolean).slice(0, 2)
    : [];
  const supportingPoints = [
    {
      icon: FiGlobe,
      label: "Delivery scope",
      value: "Software, cloud, product, and growth narratives in one system.",
    },
    {
      icon: FiShield,
      label: "Enterprise confidence",
      value: "Strong governance, polished presentation, and calm execution.",
    },
    {
      icon: FiCompass,
      label: "Editorial structure",
      value: "Large type, image-first layouts, and scroll-driven storytelling.",
    },
  ];

  const headlinePairs =
    headingLines.length > 0
      ? [
          headingLines,
          ["Engineering digital", "systems that scale"],
          ["Building products", "That move industries"],
          ["Accelerating growth", "Through intelligent software"],
        ]
      : [
          ["Enterprise systems", "Designed like a brand experience"],
          ["Engineering digital", "systems that scale"],
          ["Building products", "That move industries"],
          ["Accelerating growth", "Through intelligent software"],
        ];

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !isAppReady || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-hero-reveal]"),
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.08,
            ease: "power3.out",
          }
        );

        gsap.fromTo(
          imageRef.current,
          { clipPath: "inset(0 0 100% 0)", scale: 1.08 },
          {
            clipPath: "inset(0 0 0% 0)",
            scale: 1,
            duration: 1.15,
            ease: "power4.out",
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [isAppReady, reducedMotion] }
  );

  useEffect(() => {
    if (reducedMotion || !isAppReady || !visualRef.current) {
      return undefined;
    }

    const moveX = gsap.quickTo(visualRef.current, "x", {
      duration: 0.35,
      ease: "power3.out",
    });
    const moveY = gsap.quickTo(visualRef.current, "y", {
      duration: 0.35,
      ease: "power3.out",
    });
    const rotate = gsap.quickTo(visualRef.current, "rotation", {
      duration: 0.4,
      ease: "power2.out",
    });

    syncVisualCenter();

    const onPointerMove = (event) => {
      const bounds = visualRef.current.getBoundingClientRect();
      const offsetX = (event.clientX - centerRef.current.x) / bounds.width;
      const offsetY = (event.clientY - centerRef.current.y) / bounds.height;
      const frame = imageRef.current;

      if (frame) {
        const frameBounds = frame.getBoundingClientRect();
        const localX = ((event.clientX - frameBounds.left) / frameBounds.width) * 100;
        const localY = ((event.clientY - frameBounds.top) / frameBounds.height) * 100;

        frame.style.setProperty("--hero-pointer-x", `${Math.min(100, Math.max(0, localX))}%`);
        frame.style.setProperty("--hero-pointer-y", `${Math.min(100, Math.max(0, localY))}%`);
      }

      moveX(offsetX * -18);
      moveY(offsetY * -12);
      rotate(offsetX * 3);
    };

    const onPointerLeave = () => {
      moveX(0);
      moveY(0);
      rotate(0);
      if (imageRef.current) {
        imageRef.current.style.setProperty("--hero-pointer-x", "50%");
        imageRef.current.style.setProperty("--hero-pointer-y", "50%");
      }
    };

    const onResize = () => {
      syncVisualCenter();
    };

    const onScroll = () => {
      syncVisualCenter();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [isAppReady, reducedMotion]);

  const mainImage = heroVisual?.mainImageUrl;
  const mainAlt = heroVisual?.mainImageAlt || "Technosthan hero visual";

  return (
    <section className="editorial-hero" ref={scopeRef} data-motion-zone="hero">
      <div className="editorial-shell editorial-hero-shell">
        <div className="editorial-hero-copy">
          <span className="editorial-kicker" data-hero-reveal>
            Enterprise Technology Studio
          </span>

          <h1 className="editorial-hero-title" data-hero-reveal>
            <span className="sr-only">
              {headlinePairs[0][0]} {headlinePairs[0][1]}
            </span>
            <TextRotator pairs={headlinePairs} className="editorial-hero-rotator" />
          </h1>

          <p className="editorial-hero-lead" data-hero-reveal>
            {heroVisual?.heroSubtitle ||
              "Technosthan designs software, cloud platforms, AI systems, and digital experiences for organizations that need a premium public presence and dependable delivery."}
          </p>

          <p className="editorial-hero-body" data-hero-reveal>
            {heroVisual?.heroDescription ||
              "The new public site is built like an editorial technology publication: oversized type, large-format images, pinned storytelling, and motion that supports the message instead of competing with it."}
          </p>

          <div className="editorial-actions" data-hero-reveal>
            <button
              type="button"
              className="editorial-button editorial-button-primary"
              onClick={() => navigate("/contact")}
              data-cursor="open"
              data-magnetic
              data-motion-focus="cta"
            >
              Start a project
              <FiArrowRight />
            </button>
            <button
              type="button"
              className="editorial-button editorial-button-secondary"
              onClick={() => navigate("/case-studies")}
              data-cursor="view"
              data-magnetic
              data-motion-focus="cta"
            >
              Explore selected work
            </button>
          </div>

          <div className="editorial-support-grid" data-hero-reveal>
            {supportingPoints.map((point) => {
              const Icon = point.icon;

              return (
                <TiltCard
                  as="article"
                  key={point.label}
                  className="editorial-support-item"
                  data-motion-focus="card"
                >
                  <span className="editorial-support-icon" data-tilt-accent>
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{point.label}</strong>
                    <p>{point.value}</p>
                  </div>
                </TiltCard>
              );
            })}
          </div>
        </div>

        <div className="editorial-hero-visual" ref={visualRef}>
          <div className="editorial-hero-image-shell">
            <div className="editorial-hero-image-frame" ref={imageRef}>
              <img
                src={mainImage}
                alt={mainAlt}
                className="editorial-hero-image"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                width="1672"
                height="941"
              />
              <div className="editorial-hero-overlay">
                <span>CMS-managed visual</span>
                <strong>Hero imagery stays alive through CMS updates.</strong>
              </div>
            </div>

            <div className="editorial-hero-sideband" data-hero-reveal>
              <div className="editorial-hero-statline">
                {stats.map((item) => (
                  <div key={item.label} className="editorial-hero-stat" data-motion-focus="stat">
                    <strong>{item.value}</strong>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <TiltCard as="div" className="editorial-hero-feature" data-motion-focus="feature">
                <span className="editorial-hero-feature-label">Featured capability</span>
                <h3>{featuredService?.title || "Web Development"}</h3>
                <p>
                  {featuredService?.shortDescription ||
                    "Enterprise web platforms designed for speed, clarity, and long-term maintainability."}
                </p>
                <button
                  type="button"
                  className="editorial-inline-link"
                  onClick={() => navigate(featuredService?.route || "/services")}
                  data-cursor="view"
                  data-magnetic
                >
                  View service
                  <FiZap size={14} />
                </button>
              </TiltCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialHero;
