import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiCloud, FiCpu, FiLayers, FiShield } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const MODULES = [
  {
    title: "Product engineering",
    copy: "Interfaces, systems, and release paths that stay usable as the product evolves.",
    icon: FiLayers,
    tone: "blue",
    anchor: "top-left",
  },
  {
    title: "Cloud infrastructure",
    copy: "Delivery foundations for secure environments, scale, and operational calm.",
    icon: FiCloud,
    tone: "cyan",
    anchor: "top-right",
  },
  {
    title: "AI automation",
    copy: "Practical intelligence folded into real workflows without unnecessary noise.",
    icon: FiCpu,
    tone: "orange",
    anchor: "bottom-left",
  },
  {
    title: "Security architecture",
    copy: "Governance, resilience, and trust built into the experience from the start.",
    icon: FiShield,
    tone: "neutral",
    anchor: "bottom-right",
  },
];

const CONNECTIONS = [
  { x1: 50, y1: 50, x2: 21, y2: 23 },
  { x1: 50, y1: 50, x2: 79, y2: 22 },
  { x1: 50, y1: 50, x2: 21, y2: 78 },
  { x1: 50, y1: 50, x2: 79, y2: 77 },
];

const ManifestoNode = ({ module, index }) => {
  const Icon = module.icon;

  return (
    <article
      className={`manifesto-module manifesto-module--${module.tone} manifesto-module--${module.anchor}`}
      data-manifesto-node
      data-motion-focus="capability"
      style={{ "--module-delay": `${index * 0.08}s` }}
    >
      <span className="manifesto-module-icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <span className="manifesto-module-title">{module.title}</span>
      <p className="manifesto-module-copy">{module.copy}</p>
    </article>
  );
};

const EditorialManifesto = ({ projects }) => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const projectCount = Array.isArray(projects) ? projects.length : 0;
  const featuredProject = projects?.[0] || null;

  const modules = useMemo(() => MODULES, []);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          scrollTrigger: {
            trigger: scopeRef.current,
            start: "top 78%",
            once: true,
          },
        });

        tl.fromTo(
          scopeRef.current.querySelectorAll("[data-manifesto-reveal]"),
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08 }
        )
          .fromTo(
            scopeRef.current.querySelectorAll("[data-manifesto-line]"),
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.55 },
            "-=0.16"
          )
          .fromTo(
            scopeRef.current.querySelectorAll("[data-manifesto-node]"),
            { autoAlpha: 0, y: 18, scale: 0.96 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.56, stagger: 0.07 },
            "-=0.28"
          )
          .fromTo(
            scopeRef.current.querySelectorAll("[data-manifesto-connector]"),
            { autoAlpha: 0, strokeDashoffset: 120 },
            { autoAlpha: 1, strokeDashoffset: 0, duration: 0.7, stagger: 0.08 },
            "-=0.18"
          );
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion, projectCount] }
  );

  return (
    <section className="editorial-manifesto" ref={scopeRef} data-motion-zone="about">
      <div className="editorial-shell manifesto-shell">
        <div className="manifesto-copy">
          <span className="editorial-section-index" data-manifesto-reveal>
            01
          </span>

          <h2 className="manifesto-title" data-manifesto-reveal>
            <span>We build enterprise systems</span>
            <span>that stay clear as teams grow</span>
            <span>across design, cloud, AI,</span>
            <span>and secure delivery</span>
          </h2>

          <p className="manifesto-copy-text" data-manifesto-reveal>
            Technosthan partners with teams that need software, cloud platforms,
            and digital experiences they can trust. Our approach blends product
            thinking, design judgment, and engineering discipline into one
            delivery system.
          </p>

          <div className="manifesto-statement" data-manifesto-reveal>
            <span className="manifesto-statement-mark" aria-hidden="true" />
            <p>One team, one system, fewer handoffs, and better outcomes.</p>
          </div>

          <div className="manifesto-actions" data-manifesto-reveal>
            <Link className="manifesto-link" to="/services">
              Explore how we build
              <FiArrowRight size={16} />
            </Link>

            {featuredProject ? (
              <span className="manifesto-project-chip">
                Current work: {featuredProject.title}
              </span>
            ) : null}
          </div>
        </div>

        <div className="manifesto-system" aria-hidden="true">
          <div className="manifesto-system-frame">
            <div className="manifesto-system-grid" />
            <svg
              className="manifesto-system-links"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {CONNECTIONS.map((connection) => (
                <path
                  key={`${connection.x1}-${connection.y1}-${connection.x2}-${connection.y2}`}
                  className="manifesto-system-link"
                  data-manifesto-connector
                  d={`M ${connection.x1} ${connection.y1} C ${connection.x1} ${connection.y1}, ${connection.x2} ${connection.y2}, ${connection.x2} ${connection.y2}`}
                />
              ))}
            </svg>

            <div className="manifesto-system-core" data-manifesto-reveal>
              <span className="manifesto-system-kicker">TechnoSthan</span>
              <strong>Engineering System</strong>
              <p>
                Software, cloud, AI, and security moving as one operating
                model.
              </p>
            </div>

            <div className="manifesto-system-metric" data-manifesto-reveal>
              <span>Selected work</span>
              <strong>{projectCount.toString().padStart(2, "0")}</strong>
            </div>

            <div className="manifesto-modules">
              {modules.map((module, index) => (
                <ManifestoNode key={module.title} module={module} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditorialManifesto;
