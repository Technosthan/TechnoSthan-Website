import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useMagnetic from "../../../hooks/useMagnetic";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getSafeImageUrl } from "../../../shared/utils";
import TiltCard from "../../../components/motion/TiltCard";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeProject = (project, index) => ({
  id: project?.id || `project-${index}`,
  title: normalizeText(project?.title, `Selected work ${index + 1}`),
  description: normalizeText(
    project?.description,
    "Editorial case study built for scale, clarity, and trust."
  ),
  imageUrl: project?.imageUrl ? getSafeImageUrl(project.imageUrl) : "",
  route: project?.route || "/case-studies",
  category: normalizeText(project?.category, "Enterprise Product"),
  client: normalizeText(project?.client, ""),
  outcome: normalizeText(project?.outcome, ""),
  tags: Array.isArray(project?.tags)
    ? project.tags.map((tag) => normalizeText(tag)).filter(Boolean)
    : [],
  featured: Boolean(project?.featured),
  isActive: project?.isActive !== false,
});

const resolveVisualVariant = (project) => {
  const title = normalizeText(project?.title).toLowerCase();
  const category = normalizeText(project?.category).toLowerCase();

  if (title.includes("mobile") || category.includes("mobile")) return "mobile";
  if (title.includes("cloud") || category.includes("cloud")) return "cloud";
  if (title.includes("devops") || category.includes("devops")) return "devops";
  if (title.includes("ai") || title.includes("automation") || category.includes("ai")) return "ai";
  if (title.includes("security") || category.includes("security")) return "security";
  return "web";
};

const buildProjectMeta = (project) => {
  const meta = [];

  if (project.category) {
    meta.push(project.category);
  }

  if (project.client) {
    meta.push(project.client);
  }

  if (project.outcome) {
    meta.push(project.outcome);
  }

  return meta.slice(0, 3);
};

const ProjectFallbackVisual = ({ variant, title }) => {
  const label = normalizeText(title, "Project");

  if (variant === "mobile") {
    return (
      <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
        <rect x="254" y="78" width="212" height="360" rx="42" className="editorial-project-fallback-frame" />
        <rect x="300" y="126" width="120" height="12" rx="6" className="editorial-project-fallback-line" />
        <rect x="286" y="164" width="148" height="30" rx="15" className="editorial-project-fallback-panel" />
        <rect x="286" y="214" width="148" height="30" rx="15" className="editorial-project-fallback-panel" />
        <rect x="286" y="264" width="148" height="30" rx="15" className="editorial-project-fallback-panel" />
        <circle cx="360" cy="382" r="18" className="editorial-project-fallback-node" />
        <path d="M208 188C250 154 292 136 360 136C428 136 470 154 512 188" className="editorial-project-fallback-arc" />
        <path d="M224 286C274 320 318 338 360 338C402 338 446 320 496 286" className="editorial-project-fallback-path" />
        <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
      </svg>
    );
  }

  if (variant === "cloud") {
    return (
      <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
        <circle cx="360" cy="232" r="86" className="editorial-project-fallback-cloud" />
        <circle cx="244" cy="182" r="28" className="editorial-project-fallback-node" />
        <circle cx="486" cy="178" r="28" className="editorial-project-fallback-node" />
        <circle cx="224" cy="322" r="24" className="editorial-project-fallback-node" />
        <circle cx="496" cy="322" r="24" className="editorial-project-fallback-node" />
        <path d="M244 182L304 214M486 178L418 214M224 322L308 292M496 322L416 292M322 238H398" className="editorial-project-fallback-line" />
        <path d="M292 120C334 108 386 108 428 120" className="editorial-project-fallback-arc" />
        <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
      </svg>
    );
  }

  if (variant === "devops") {
    return (
      <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
        <path d="M176 272C210 188 258 154 360 154C462 154 510 188 544 272C510 356 462 390 360 390C258 390 210 356 176 272Z" className="editorial-project-fallback-loop" />
        <path d="M242 272H302M418 272H478M360 196V246M360 298V348" className="editorial-project-fallback-line" />
        <rect x="230" y="244" width="68" height="56" rx="18" className="editorial-project-fallback-panel" />
        <rect x="320" y="182" width="80" height="58" rx="18" className="editorial-project-fallback-panel" />
        <rect x="422" y="244" width="68" height="56" rx="18" className="editorial-project-fallback-panel" />
        <rect x="320" y="304" width="80" height="58" rx="18" className="editorial-project-fallback-panel" />
        <circle cx="360" cy="272" r="16" className="editorial-project-fallback-node" />
        <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
      </svg>
    );
  }

  if (variant === "ai") {
    return (
      <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
        <path d="M190 324L274 246L322 194L396 168L532 214" className="editorial-project-fallback-path" />
        <path d="M204 186L280 216L352 276L438 222L516 276" className="editorial-project-fallback-line" />
        <circle cx="252" cy="214" r="24" className="editorial-project-fallback-node" />
        <circle cx="360" cy="236" r="32" className="editorial-project-fallback-cloud" />
        <circle cx="468" cy="222" r="22" className="editorial-project-fallback-node" />
        <circle cx="298" cy="324" r="16" className="editorial-project-fallback-node" />
        <circle cx="424" cy="300" r="16" className="editorial-project-fallback-node" />
        <path d="M276 214C314 184 404 180 448 218" className="editorial-project-fallback-arc" />
        <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
      </svg>
    );
  }

  if (variant === "security") {
    return (
      <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
        <path d="M360 142L492 190V284C492 360 430 408 360 442C290 408 228 360 228 284V190L360 142Z" className="editorial-project-fallback-shield" />
        <path d="M320 272L348 300L408 240" className="editorial-project-fallback-line" />
        <circle cx="292" cy="210" r="18" className="editorial-project-fallback-node" />
        <circle cx="428" cy="210" r="18" className="editorial-project-fallback-node" />
        <circle cx="360" cy="342" r="22" className="editorial-project-fallback-cloud" />
        <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 720 540" className="editorial-project-fallback-svg" role="presentation">
      <rect x="174" y="130" width="372" height="238" rx="30" className="editorial-project-fallback-frame" />
      <rect x="214" y="168" width="292" height="12" rx="6" className="editorial-project-fallback-line" />
      <rect x="214" y="202" width="184" height="18" rx="9" className="editorial-project-fallback-panel" />
      <rect x="214" y="236" width="246" height="18" rx="9" className="editorial-project-fallback-panel" />
      <rect x="214" y="270" width="148" height="18" rx="9" className="editorial-project-fallback-panel" />
      <circle cx="472" cy="252" r="34" className="editorial-project-fallback-node" />
      <path d="M226 334H494" className="editorial-project-fallback-line" />
      <text x="54" y="484" className="editorial-project-fallback-caption">{label}</text>
    </svg>
  );
};

const EditorialProjects = ({ projects }) => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [activeProjectId, setActiveProjectId] = useState(null);

  useMagnetic(scopeRef);

  const stories = useMemo(() => {
    const normalized = (projects || [])
      .map(normalizeProject)
      .filter((project) => project.isActive)
      .slice(0, 6);

    if (normalized.length > 0) {
      const featuredIndex = normalized.findIndex((project) => project.featured);

      if (featuredIndex > 0) {
        return [
          normalized[featuredIndex],
          ...normalized.filter((_, index) => index !== featuredIndex),
        ];
      }

      return normalized;
    }

    return [
      normalizeProject(
        {
          id: "fallback-project-1",
          title: "Enterprise Product Platform",
          description:
            "A high-trust digital product experience shaped around strategy, product, and scalable delivery.",
          imageUrl: "",
          category: "Digital Experience",
          route: "/products",
        },
        0
      ),
      normalizeProject(
        {
          id: "fallback-project-2",
          title: "Cloud Delivery System",
          description:
            "A cloud-first implementation that balances governance, performance, and operational calm.",
          imageUrl: "",
          category: "Cloud & Infrastructure",
          route: "/case-studies",
        },
        1
      ),
      normalizeProject(
        {
          id: "fallback-project-3",
          title: "AI-Assisted Operations",
          description:
            "An editorial product narrative for workflow automation, AI tooling, and measurable adoption.",
          imageUrl: "",
          category: "AI & Data",
          route: "/technology",
        },
        2
      ),
    ];
  }, [projects]);

  const featuredProject = stories[0] || null;
  const supportingProjects = stories.slice(1, 3);
  const additionalProjects = stories.slice(3, 6);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const header = scopeRef.current.querySelectorAll("[data-projects-intro]");
        const cards = scopeRef.current.querySelectorAll("[data-project-card]");
        const extras = scopeRef.current.querySelectorAll("[data-project-extra]");

        gsap.fromTo(
          header,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 28, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 74%",
              once: true,
            },
          }
        );

        if (extras.length > 0) {
          gsap.fromTo(
            extras,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: scopeRef.current,
                start: "top 68%",
                once: true,
              },
            }
          );
        }
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion, stories.length], revertOnUpdate: true }
  );

  const renderMedia = (project, loadingPriority = "lazy") => {
    const imageUrl = project.imageUrl ? getSafeImageUrl(project.imageUrl) : "";
    const variant = resolveVisualVariant(project);

    if (imageUrl) {
      return (
        <figure className="editorial-project-mediaFrame">
          <img
            src={imageUrl}
            alt={project.title}
            loading={loadingPriority}
            decoding="async"
            fetchPriority={loadingPriority === "eager" ? "high" : "auto"}
          />
          <div className="editorial-project-mediaOverlay" aria-hidden="true" />
          <span className="editorial-project-mediaBadge">{project.category || "Case study"}</span>
        </figure>
      );
    }

    return (
      <figure className="editorial-project-fallback" aria-hidden="true">
        <ProjectFallbackVisual variant={variant} title={project.title} />
        <div className="editorial-project-mediaOverlay editorial-project-mediaOverlay--fallback" />
      </figure>
    );
  };

  const renderMeta = (project) => {
    const meta = buildProjectMeta(project);

    if (project.tags.length > 0) {
      meta.push(...project.tags.slice(0, 2));
    }

    const uniqueMeta = meta.filter((item, index) => item && meta.indexOf(item) === index);

    if (uniqueMeta.length === 0) {
      return null;
    }

    return (
      <div className="editorial-project-meta" aria-label={`${project.title} details`}>
        {uniqueMeta.map((item) => (
          <span key={`${project.id}-${item}`}>{item}</span>
        ))}
      </div>
    );
  };

  const renderProjectCard = (project, index, variant, options = {}) => {
    const isActive = activeProjectId === project.id;
    const loadingPriority = options.eager ? "eager" : "lazy";

    return (
      <TiltCard
        as="article"
        key={project.id}
        className={`editorial-project-card editorial-project-card--${variant} ${
          isActive ? "is-active" : ""
        }`}
        data-project-card
        data-motion-focus="project"
        data-state={isActive ? "active" : "idle"}
        maxTilt={options.maxTilt || 6}
        lift={options.lift || 6}
        onPointerEnter={() => setActiveProjectId(project.id)}
        onPointerLeave={() => setActiveProjectId(null)}
        onFocusCapture={() => setActiveProjectId(project.id)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setActiveProjectId(null);
          }
        }}
      >
        <div className="editorial-project-card__content">
          <span className="editorial-project-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="editorial-project-category">
            {project.category || "Enterprise Product"}
          </span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>

          {renderMeta(project)}

          <Link
            to={project.route || "/case-studies"}
            className="editorial-inline-link editorial-project-card__cta"
            data-cursor="view"
            data-magnetic
            aria-label={`Read case study for ${project.title}`}
          >
            View case study
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="editorial-project-card__media" aria-hidden="true">
          {renderMedia(project, loadingPriority)}
        </div>
      </TiltCard>
    );
  };

  if (stories.length === 0) {
    return null;
  }

  return (
    <section className="editorial-projects" ref={scopeRef} data-motion-zone="products">
      <div className="editorial-shell editorial-projects-shell">
        <div className="editorial-projects-intro" data-projects-intro>
          <div className="editorial-projects-head">
            <span className="editorial-section-index">04</span>
            <span className="editorial-section-kicker">Selected work</span>
            <h2>Case studies with real structure, real hierarchy, and real visual depth.</h2>
            <p>
              Each project is presented as an editorial story so decision-makers can scan the
              category, understand the scope, and reach the detail page without losing the
              feeling of a premium enterprise showcase.
            </p>
          </div>

          <Link
            to="/case-studies"
            className="editorial-projects-viewAll"
            data-cursor="view"
            data-magnetic
          >
            View all work
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div
          className={`editorial-projects-grid ${
            activeProjectId ? "has-active-project" : ""
          }`}
        >
          {featuredProject ? (
            renderProjectCard(featuredProject, 0, "featured", {
              eager: true,
              maxTilt: 4,
              lift: 4,
            })
          ) : null}

          {supportingProjects.length > 0 ? (
            <div className="editorial-projects-support">
              {supportingProjects.map((project, index) =>
                renderProjectCard(
                  project,
                  index + 1,
                  index % 2 === 0 ? "split" : "stacked",
                  { lift: 6, maxTilt: 6 }
                )
              )}
            </div>
          ) : null}

          {additionalProjects.length > 0 ? (
            <div className="editorial-projects-extras">
              {additionalProjects.map((project, index) =>
                renderProjectCard(project, index + 3, "compact", {
                  lift: 4,
                  maxTilt: 5,
                })
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default EditorialProjects;
