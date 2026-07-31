import { useEffect, useMemo, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiCode,
  FiCompass,
  FiCpu,
  FiDatabase,
  FiGlobe,
  FiLayers,
  FiMapPin,
  FiShield,
  FiServer,
  FiTarget,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import HomepageBackground from "../../home/components/HomepageBackground";
import useHomeEditorial from "../../home/hooks/useHomeEditorial";
import MagneticButton from "../../../components/motion/MagneticButton";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getSafeImageUrl } from "../../../shared/utils";
import "../styles/about-enterprise.css";

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const STORY_MILESTONES = [
  {
    key: "foundation",
    label: "Foundation",
    title: "A delivery model built around clarity",
    copy:
      "Technosthan's public presence is organized like a product system, with software, cloud, and design sharing one editorial language.",
  },
  {
    key: "systems",
    label: "Systems Thinking",
    title: "Services became a connected operating model",
    copy:
      "Capability was grouped into a coherent structure so decision-makers can understand scope, fit, and impact at a glance.",
  },
  {
    key: "proof",
    label: "Proof",
    title: "CMS-backed signals replaced generic marketing noise",
    copy:
      "Real project records, service lines, and client narratives now surface on the public site instead of filler content.",
  },
  {
    key: "future",
    label: "Future",
    title: "A platform ready for scale and refinement",
    copy:
      "The company story continues through stronger delivery systems, better visibility, and space for new enterprise work.",
  },
];

const CORE_VALUES = [
  {
    icon: FiZap,
    title: "Innovation",
    copy: "New ideas are shaped into useful systems, not disconnected experiments.",
  },
  {
    icon: FiShield,
    title: "Integrity",
    copy: "Delivery stays transparent, calm, and grounded in clear decisions.",
  },
  {
    icon: FiCheckCircle,
    title: "Quality",
    copy: "Attention to architecture, accessibility, and stability is built in from the start.",
  },
  {
    icon: FiCompass,
    title: "Research",
    copy: "Requirements are explored carefully so the work solves the right problem.",
  },
  {
    icon: FiUsers,
    title: "Customer Success",
    copy: "The experience is designed around client confidence and long-term usefulness.",
  },
  {
    icon: FiClock,
    title: "Continuous Learning",
    copy: "Methods evolve with the stack so delivery keeps improving over time.",
  },
];

const INDUSTRY_AREAS = [
  {
    icon: FiTrendingUp,
    title: "Financial Services",
    copy: "Secure systems and disciplined experiences for regulated businesses.",
  },
  {
    icon: FiShield,
    title: "Healthcare",
    copy: "Clear workflows and dependable interfaces for sensitive operations.",
  },
  {
    icon: FiGlobe,
    title: "Manufacturing",
    copy: "Connected delivery for operations visibility and reporting.",
  },
  {
    icon: FiMapPin,
    title: "Retail & Commerce",
    copy: "Product and commerce systems with better structure and conversion flow.",
  },
  {
    icon: FiDatabase,
    title: "Logistics",
    copy: "Tracking, planning, and customer visibility for moving systems.",
  },
  {
    icon: FiLayers,
    title: "Public Sector",
    copy: "Accessible services and reliable internal platforms.",
  },
];

const buildTechnologyClusters = (serviceGroups) => {
  const iconByCategory = {
    Development: FiCode,
    "Cloud & Infrastructure": FiServer,
    "AI & Data": FiCpu,
    "Security & Design": FiShield,
    "Industry Solutions": FiGlobe,
  };

  return (serviceGroups || [])
    .map((group, index) => {
      const items = Array.isArray(group.items)
        ? group.items.slice(0, 3).filter(Boolean)
        : [];

      if (!items.length) {
        return null;
      }

      return {
        key: group.key || `${group.label}-${index}`,
        label: group.label,
        description: group.description,
        icon: iconByCategory[group.label] || FiLayers,
        items,
      };
    })
    .filter(Boolean);
};

const SectionHeading = ({ eyebrow, title, copy, align = "left" }) => (
  <header
    className={`about-section-heading ${
      align === "center" ? "about-section-heading--center" : ""
    }`.trim()}
    data-about-reveal
  >
    <span className="about-eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {copy ? <p>{copy}</p> : null}
  </header>
);

const BlueprintVisual = ({ stats, reducedMotion }) => {
  return (
    <div className="about-blueprint" aria-hidden="true">
      <svg viewBox="0 0 920 720" className="about-blueprint__svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id="about-blueprint-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(45, 212, 200, 0.18)" />
            <stop offset="50%" stopColor="rgba(74, 141, 255, 0.76)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.36)" />
          </linearGradient>
          <radialGradient id="about-blueprint-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.96)" />
            <stop offset="100%" stopColor="rgba(239, 91, 42, 0.08)" />
          </radialGradient>
        </defs>
        <path className="about-blueprint__line" d="M 116 124 C 210 170, 262 150, 360 118 S 560 88, 664 168 S 760 300, 832 234" />
        <path className="about-blueprint__line" d="M 86 590 C 210 520, 294 566, 408 500 S 600 416, 712 490 S 820 592, 860 550" />
        <path className="about-blueprint__line about-blueprint__line--soft" d="M 238 72 C 218 208, 212 318, 296 426 S 430 604, 350 676" />
        <circle className="about-blueprint__ring" cx="458" cy="350" r="188" />
        <circle className="about-blueprint__ring about-blueprint__ring--inner" cx="458" cy="350" r="112" />
        <circle className="about-blueprint__node" cx="184" cy="166" r="10" />
        <circle className="about-blueprint__node" cx="702" cy="150" r="10" />
        <circle className="about-blueprint__node" cx="242" cy="512" r="10" />
        <circle className="about-blueprint__node" cx="740" cy="548" r="10" />
      </svg>

      <div className="about-blueprint__core">
        <span className="about-blueprint__label">Technosthan</span>
        <strong>Enterprise systems</strong>
        <p>Software, cloud, AI, and support aligned in one operating model.</p>
      </div>

      <div className="about-blueprint__metrics">
        {stats.slice(0, 3).map((item) => (
          <article key={item.key} className="about-blueprint__metric">
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </article>
        ))}
      </div>

      <div
        className={`about-blueprint__pulse ${reducedMotion ? "is-static" : ""}`.trim()}
      />
    </div>
  );
};

const TimelineItem = ({ item, index }) => (
  <article className="about-timeline__item" data-about-reveal>
    <span className="about-timeline__index">0{index + 1}</span>
    <div className="about-timeline__rail" aria-hidden="true">
      <span className="about-timeline__dot" />
    </div>
    <div className="about-timeline__copy">
      <span className="about-timeline__label">{item.label}</span>
      <h3>{item.title}</h3>
      <p>{item.copy}</p>
    </div>
  </article>
);

const ValueCard = ({ value }) => {
  const Icon = value.icon;

  return (
    <article className="about-value-card" data-about-reveal>
      <span className="about-value-card__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <h3>{value.title}</h3>
      <p>{value.copy}</p>
    </article>
  );
};

const TechnologyCard = ({ cluster }) => {
  const Icon = cluster.icon;

  return (
    <article className="about-tech-card" data-about-reveal>
      <div className="about-tech-card__header">
        <span className="about-tech-card__icon" aria-hidden="true">
          <Icon size={16} />
        </span>
        <h3>{cluster.label}</h3>
      </div>
      <p>{cluster.description}</p>
      <div className="about-tech-card__chips" aria-label={`${cluster.label} service examples`}>
        {cluster.items.map((item) => (
          <span key={item.id || item.title} className="about-tech-chip">
            {normalizeText(item.title)}
          </span>
        ))}
      </div>
    </article>
  );
};

const TrustMetricCard = ({ item, featured }) => (
  <article
    className={`about-trust-card ${featured ? "about-trust-card--featured" : ""}`.trim()}
    data-about-reveal
  >
    <span className="about-trust-card__kicker">
      {featured ? "Primary proof" : "Supporting signal"}
    </span>
    <strong>{item.value}</strong>
    <h3>{item.label}</h3>
    {item.description ? <p>{item.description}</p> : null}
  </article>
);

const IndustryCard = ({ industry }) => {
  const Icon = industry.icon;

  return (
    <article className="about-industry-card" data-about-reveal>
      <span className="about-industry-card__icon" aria-hidden="true">
        <Icon size={16} />
      </span>
      <h3>{industry.title}</h3>
      <p>{industry.copy}</p>
    </article>
  );
};

const AboutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pageRef = useRef(null);
  const heroVisualRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const {
    heroVisual,
    services,
    serviceGroups,
    featuredService,
    projects,
    testimonials,
    stats,
  } = useHomeEditorial();

  const technologies = useMemo(
    () => buildTechnologyClusters(serviceGroups),
    [serviceGroups]
  );

  const trustMetrics = useMemo(() => {
    const activeServices = services.filter((service) => service?.isActive !== false);
    const source = stats.length
      ? stats
      : [
          {
            key: "projects",
            label: "Projects shipped",
            value: projects.length,
            description: "CMS-backed project records currently published.",
          },
          {
            key: "services",
            label: "Active service lines",
            value: activeServices.length,
            description: "Live services available to explore.",
          },
          {
            key: "testimonials",
            label: "Client narratives",
            value: testimonials.length,
            description: "Verified testimonials currently visible.",
          },
        ];

    return source.filter((item) => item && item.label !== undefined && item.value !== undefined);
  }, [projects.length, services, stats, testimonials.length]);

  const summaryStats = useMemo(
    () => [
      {
        key: "services",
        title: "Service lines",
        value: services.filter((service) => service?.isActive !== false).length,
      },
      {
        key: "projects",
        title: "Published projects",
        value: projects.filter((project) => project?.isActive !== false).length,
      },
      {
        key: "testimonials",
        title: "Client narratives",
        value: testimonials.length,
      },
    ],
    [projects, services, testimonials.length]
  );

  const hasImage = Boolean(heroVisual?.mainImageUrl);
  const heroLead = normalizeText(
    heroVisual?.heroSubtitle,
    "Technosthan pairs software engineering, cloud architecture, and digital design into one enterprise delivery model."
  );
  const heroBody = normalizeText(
    heroVisual?.heroDescription,
    "The About page extends the same editorial language as the homepage: large typography, glass surfaces, subtle motion, and live proof points pulled from CMS-backed content."
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const title = "About TechnoSthan | Enterprise IT Company";
    const description =
      "Meet TechnoSthan, an enterprise IT company building software, cloud, AI, security, and digital experiences with editorial clarity and CMS-backed proof.";
    const canonical = `${window.location.origin}/about`;

    const previousTitle = document.title;
    const restoreActions = [];

    const setOrCreateMeta = (selector, attrs) => {
      let element = document.head.querySelector(selector);
      const created = !element;
      const previousContent = element?.getAttribute("content");

      if (!element) {
        element = document.createElement("meta");
        Object.entries(attrs).forEach(([key, value]) => {
          if (key !== "content") {
            element.setAttribute(key, value);
          }
        });
        document.head.appendChild(element);
      }

      Object.entries(attrs).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });

      restoreActions.push(() => {
        if (created) {
          element.remove();
          return;
        }

        if (previousContent === null) {
          element.removeAttribute("content");
          return;
        }

        element.setAttribute("content", previousContent);
      });

      return element;
    };

    const ensureLink = (rel, href) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`);
      const created = !element;
      const previousHref = element?.getAttribute("href");

      if (!element) {
        element = document.createElement("link");
        element.rel = rel;
        document.head.appendChild(element);
      }

      element.href = href;

      restoreActions.push(() => {
        if (created) {
          element.remove();
          return;
        }

        if (previousHref === null) {
          element.removeAttribute("href");
          return;
        }

        element.setAttribute("href", previousHref);
      });

      return element;
    };

    setOrCreateMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    setOrCreateMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    setOrCreateMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    setOrCreateMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    setOrCreateMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    setOrCreateMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    setOrCreateMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    setOrCreateMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    ensureLink("canonical", canonical);

    const organizationSchema = document.createElement("script");
    organizationSchema.type = "application/ld+json";
    organizationSchema.id = "about-organization-schema";
    organizationSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Technosthan",
      url: canonical,
      description,
      sameAs: [],
    });
    document.head.appendChild(organizationSchema);

    const breadcrumbSchema = document.createElement("script");
    breadcrumbSchema.type = "application/ld+json";
    breadcrumbSchema.id = "about-breadcrumb-schema";
    breadcrumbSchema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${window.location.origin}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "About",
          item: canonical,
        },
      ],
    });
    document.head.appendChild(breadcrumbSchema);

    document.title = title;

    return () => {
      document.title = previousTitle;
      restoreActions.forEach((cleanup) => cleanup?.());
      organizationSchema.remove();
      breadcrumbSchema.remove();
    };
  }, [location.pathname]);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const hero = pageRef.current.querySelector(".about-hero");
        const timeline = pageRef.current.querySelector(".about-timeline");
        const revealBlocks = pageRef.current.querySelectorAll("[data-about-reveal]");
        const visualLine = pageRef.current.querySelectorAll(".about-blueprint__line");
        const visualRings = pageRef.current.querySelectorAll(".about-blueprint__ring, .about-blueprint__node");

        gsap.fromTo(
          revealBlocks,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: hero,
              start: "top 78%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          visualLine,
          { strokeDasharray: 1200, strokeDashoffset: 1200 },
          {
            strokeDashoffset: 0,
            duration: 1.15,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: hero,
              start: "top 78%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          visualRings,
          { scale: 0.95, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.85,
            stagger: 0.03,
            ease: "power3.out",
            scrollTrigger: {
              trigger: hero,
              start: "top 78%",
              once: true,
            },
          }
        );

        if (timeline) {
          const mm = gsap.matchMedia();
          mm.add("(min-width: 900px)", () => {
            gsap.fromTo(
              timeline.querySelectorAll(".about-timeline__item"),
              { autoAlpha: 0, y: 28, x: -14 },
              {
                autoAlpha: 1,
                y: 0,
                x: 0,
                duration: 0.74,
                stagger: 0.11,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: timeline,
                  start: "top 76%",
                  once: true,
                },
              }
            );
          });
          mm.add("(max-width: 899px)", () => {
            gsap.fromTo(
              timeline.querySelectorAll(".about-timeline__item"),
              { autoAlpha: 0, y: 22 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.62,
                stagger: 0.08,
                ease: "power3.out",
                scrollTrigger: {
                  trigger: timeline,
                  start: "top 82%",
                  once: true,
                },
              }
            );
          });
          return () => mm.revert();
        }

        return undefined;
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [
        reducedMotion,
        services.length,
        projects.length,
        testimonials.length,
        stats.length,
      ],
    }
  );

  useEffect(() => {
    const root = heroVisualRef.current;
    if (
      !root ||
      reducedMotion ||
      !window.matchMedia?.("(hover: hover) and (pointer: fine)")?.matches
    ) {
      return undefined;
    }

    let frame = 0;

    const updatePointer = (event) => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const rect = root.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const y = ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        root.style.setProperty("--about-pointer-x", `${Math.max(0, Math.min(100, x))}%`);
        root.style.setProperty("--about-pointer-y", `${Math.max(0, Math.min(100, y))}%`);
      });
    };

    const resetPointer = () => {
      root.style.setProperty("--about-pointer-x", "50%");
      root.style.setProperty("--about-pointer-y", "34%");
    };

    resetPointer();
    root.addEventListener("pointermove", updatePointer, { passive: true });
    root.addEventListener("pointerleave", resetPointer);

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      root.removeEventListener("pointermove", updatePointer);
      root.removeEventListener("pointerleave", resetPointer);
    };
  }, [reducedMotion]);

  return (
    <div className="about-page" ref={pageRef}>
      <HomepageBackground />

      <section className="about-hero about-page__section" data-motion-zone="about">
        <div className="about-shell about-hero__shell">
          <div className="about-hero__copy">
            <span className="about-eyebrow" data-about-reveal>
              About TechnoSthan
            </span>

            <h1 data-about-reveal>
              Engineering Digital Innovation
              <br />
              For Modern Businesses.
            </h1>

            <p className="about-hero__lead" data-about-reveal>
              {heroLead}
            </p>

            <p className="about-hero__body" data-about-reveal>
              {heroBody}
            </p>

            <div className="about-hero__actions" data-about-reveal>
              <MagneticButton
                className="about-button about-button--primary"
                onClick={() => navigate("/contact")}
              >
                Start a project
                <FiArrowRight size={16} />
              </MagneticButton>

              <Link className="about-button about-button--secondary" to="/services">
                Explore services
              </Link>
            </div>

            <div className="about-hero__indicator" data-about-reveal>
              <span className="about-hero__indicator-dot" />
              <span>Scroll to explore the company story</span>
            </div>
          </div>

          <div className="about-hero__visual" ref={heroVisualRef} data-about-reveal>
            <BlueprintVisual stats={summaryStats} reducedMotion={reducedMotion} />
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell about-split">
          <div className="about-split__copy">
            <SectionHeading
              eyebrow="Who We Are"
              title="A premium enterprise partner for software, cloud, and digital delivery."
              copy={normalizeText(
                heroVisual?.heroDescription,
                "Technosthan is organized around one idea: enterprise technology should feel clear, credible, and easy to extend."
              )}
            />
            <p className="about-paragraph" data-about-reveal>
              {normalizeText(
                heroVisual?.heroSubtitle,
                "We align strategy, design, engineering, and support into a single delivery system so business teams can make confident decisions."
              )}
            </p>
            <p className="about-paragraph" data-about-reveal>
              The result is a public experience and operating model that feel modern without losing the discipline needed for long-term enterprise work.
            </p>
          </div>

          <article className="about-summary-card" data-about-reveal>
            <div className="about-summary-card__media">
              {hasImage ? (
                <img
                  src={getSafeImageUrl(heroVisual.mainImageUrl)}
                  alt={heroVisual.mainImageAlt || "Technosthan editorial visual"}
                  loading="lazy"
                  decoding="async"
                  width="1672"
                  height="941"
                />
              ) : (
                <div className="about-summary-card__fallback" aria-hidden="true">
                  <BlueprintVisual stats={summaryStats} reducedMotion={reducedMotion} />
                </div>
              )}
            </div>

            <div className="about-summary-card__meta">
              <div>
                <span className="about-summary-card__label">Featured capability</span>
                <h3>{featuredService?.title || "Enterprise delivery"}</h3>
              </div>
              <p>{featuredService?.shortDescription || "The delivery model stays focused on clarity, scale, and maintainability."}</p>

              <div className="about-summary-card__stats">
                {summaryStats.map((item) => (
                  <div key={item.key} className="about-summary-card__stat">
                    <strong>{item.value}</strong>
                    <span>{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="about-page__section about-story" data-motion-zone="about">
        <div className="about-shell">
          <SectionHeading
            eyebrow="Our Story"
            title="How the company story becomes a connected delivery system."
            copy="The narrative here is intentionally editorial rather than inflated: each milestone reflects how Technosthan presents, structures, and ships enterprise work."
            align="center"
          />

          <div className="about-timeline">
            {STORY_MILESTONES.map((item, index) => (
              <TimelineItem key={item.key} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell about-mission">
          <SectionHeading
            eyebrow="Vision & Mission"
            title="A clear operating philosophy for enterprise outcomes."
            copy="The page keeps the same premium visual language as the homepage while emphasizing the trust and discipline enterprises expect."
          />

          <div className="about-mission__grid">
            <article className="about-glass-card about-glass-card--glow" data-about-reveal>
              <span className="about-glass-card__icon" aria-hidden="true">
                <FiTarget size={18} />
              </span>
              <h3>Vision</h3>
              <p>
                Become the enterprise partner businesses trust for digital transformation, engineering excellence, and long-term support.
              </p>
            </article>

            <article className="about-glass-card about-glass-card--glow" data-about-reveal>
              <span className="about-glass-card__icon" aria-hidden="true">
                <FiCompass size={18} />
              </span>
              <h3>Mission</h3>
              <p>
                Build secure, scalable technology solutions that improve how organizations operate, serve customers, and grow.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell">
          <SectionHeading
            eyebrow="Core Values"
            title="The principles that keep the work premium and reliable."
            copy="These values are expressed as a six-part system so the page feels consistent with the enterprise tone used across the site."
          />

          <div className="about-values">
            {CORE_VALUES.map((value) => (
              <ValueCard key={value.title} value={value} />
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell about-tech">
          <SectionHeading
            eyebrow="Technology Ecosystem"
            title="A connected stack for web, cloud, AI, and secure delivery."
            copy="Live service groups from the CMS are shown here so the ecosystem stays aligned with the actual services the business offers."
          />

          <div className="about-tech__grid">
            {technologies.map((cluster) => (
              <TechnologyCard key={cluster.key} cluster={cluster} />
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="statistics">
        <div className="about-shell about-trust">
          <SectionHeading
            eyebrow="Why Businesses Choose TechnoSthan"
            title="Trust signals drawn from the live site, not invented claims."
            copy="The numbers below come from the same CMS-backed collections the homepage uses, so the About page stays honest and current."
          />

          <div className="about-trust__grid">
            {trustMetrics.slice(0, 4).map((item, index) => (
              <TrustMetricCard
                key={item.key || item.label}
                item={item}
                featured={index === 0}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell">
          <SectionHeading
            eyebrow="Leadership"
            title="Leadership details appear only when the data exists."
            copy="There is no fake executive roster here. If leadership content is added in the future, it can be surfaced without changing the page structure."
          />
          <div className="about-empty-state" data-about-reveal>
            <p>No leadership data is currently published for the public site.</p>
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell">
          <SectionHeading
            eyebrow="Certifications & Partnerships"
            title="Only real credentials and partners should appear here."
            copy="Because no verified public certification or partnership data is currently exposed, this section stays hidden rather than filling space with fake badges."
          />
          <div className="about-empty-state" data-about-reveal>
            <p>No public certifications or partnerships are currently available.</p>
          </div>
        </div>
      </section>

      <section className="about-page__section" data-motion-zone="about">
        <div className="about-shell about-industries">
          <SectionHeading
            eyebrow="Global Presence / Industries"
            title="Industry focus without pretending to have offices we do not list."
            copy="The map treatment emphasizes breadth of sector experience and the Indian market roots of the brand without inventing location claims."
          />

          <div className="about-industries__layout">
            <div className="about-industries__map" aria-hidden="true">
              <svg viewBox="0 0 980 720" className="about-industries__svg" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="about-map-line" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(45, 212, 200, 0.14)" />
                    <stop offset="56%" stopColor="rgba(74, 141, 255, 0.7)" />
                    <stop offset="100%" stopColor="rgba(239, 91, 42, 0.4)" />
                  </linearGradient>
                </defs>
                <path className="about-industries__outline" d="M252 118 302 92 368 114 418 96 494 128 560 104 630 142 690 176 736 226 742 294 708 338 662 384 622 444 560 496 496 516 430 548 366 576 308 564 274 510 240 452 208 386 198 316 212 244 232 182Z" />
                <path className="about-industries__path" d="M162 178C258 128, 352 102, 490 126S718 198, 834 168" />
                <circle className="about-industries__marker" cx="398" cy="248" r="10" />
                <circle className="about-industries__marker" cx="560" cy="188" r="8" />
                <circle className="about-industries__marker" cx="612" cy="332" r="9" />
                <circle className="about-industries__marker" cx="462" cy="428" r="8" />
                <circle className="about-industries__marker about-industries__marker--accent" cx="330" cy="316" r="12" />
              </svg>
              <div className="about-industries__flag">
                <strong>India</strong>
                <span>Enterprise delivery rooted in the market we serve.</span>
              </div>
            </div>

            <div className="about-industries__cards">
              {INDUSTRY_AREAS.map((industry) => (
                <IndustryCard key={industry.title} industry={industry} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="about-page__section about-cta" data-motion-zone="cta">
        <div className="about-shell">
          <div className="about-cta__shell">
            <div className="about-cta__copy" data-about-reveal>
              <span className="about-eyebrow">Final Step</span>
              <h2>Let&apos;s build the next system your business can depend on.</h2>
              <p>
                Talk to the team, review the right capabilities, and move forward with a partner that treats delivery like an enterprise system.
              </p>
            </div>

            <div className="about-cta__actions" data-about-reveal>
              <MagneticButton
                className="about-button about-button--primary"
                onClick={() => navigate("/contact")}
              >
                Start a project
                <FiArrowRight size={16} />
              </MagneticButton>
              <Link className="about-button about-button--secondary" to="/case-studies">
                View selected work
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
