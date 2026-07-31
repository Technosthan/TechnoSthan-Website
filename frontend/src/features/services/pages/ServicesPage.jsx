import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCloud,
  FiCode,
  FiDatabase,
  FiFilter,
  FiGlobe,
  FiLayers,
  FiRefreshCcw,
  FiServer,
  FiShield,
  FiSmartphone,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { getServices } from "../../../api/services.api";
import MagneticButton from "../../../components/motion/MagneticButton";
import ServiceMesh from "../../../components/motion/ServiceMesh";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getIconComponent, getSafeImageUrl } from "../../../shared/utils";
import { SERVICE_MENU_CATEGORIES } from "../data/serviceCatalog";
import ServicesBlueprintBackground from "../components/ServicesBlueprintBackground";
import "../styles/enterprise-services.css";

const SERVICE_ROUTE_FALLBACK = "/contact";
const SERVICES_ROUTE = "/services";

const TECH_PILLARS = [
  {
    key: "frontend",
    title: "Frontend",
    icon: FiCode,
    description: "Interface systems, product experiences, and editorial layouts.",
    keywords: ["web", "ui", "ux", "design"],
  },
  {
    key: "backend",
    title: "Backend",
    icon: FiServer,
    description: "Business logic, APIs, integrations, and service layers.",
    keywords: ["web", "cloud", "api", "integration"],
  },
  {
    key: "cloud",
    title: "Cloud",
    icon: FiCloud,
    description: "Hosting, deployment, migrations, and architecture planning.",
    keywords: ["cloud", "devops"],
  },
  {
    key: "database",
    title: "Database",
    icon: FiDatabase,
    description: "Structured data, storage, and reporting foundations.",
    keywords: ["data", "analytics"],
  },
  {
    key: "devops",
    title: "DevOps",
    icon: FiTool,
    description: "Automation, delivery pipelines, and release reliability.",
    keywords: ["devops", "release"],
  },
  {
    key: "ai",
    title: "AI",
    icon: FiTrendingUp,
    description: "Automation, decision support, and workflow intelligence.",
    keywords: ["ai", "automation"],
  },
  {
    key: "security",
    title: "Security",
    icon: FiShield,
    description: "Secure engineering, access patterns, and operational hardening.",
    keywords: ["security", "cyber"],
  },
  {
    key: "mobile",
    title: "Mobile",
    icon: FiSmartphone,
    description: "Native and cross-platform client applications.",
    keywords: ["mobile"],
  },
  {
    key: "cms",
    title: "CMS",
    icon: FiLayers,
    description: "Content workflows and public-page administration.",
    keywords: ["cms", "content"],
  },
  {
    key: "infrastructure",
    title: "Infrastructure",
    icon: FiGlobe,
    description: "Operational resilience, platform foundations, and scale.",
    keywords: ["cloud", "devops", "security"],
  },
];

const PROCESS_STEPS = [
  {
    number: "01",
    title: "Discovery",
    copy: "We align the brief, scope, and constraints before any build begins.",
  },
  {
    number: "02",
    title: "Discuss / Planning",
    copy: "Requirements become a clear roadmap that stakeholders can follow.",
  },
  {
    number: "03",
    title: "Design",
    copy: "The product shape is defined through thoughtful structure and UI clarity.",
  },
  {
    number: "04",
    title: "Development",
    copy: "Implementation moves in a measured way with the live catalog as the source.",
  },
  {
    number: "05",
    title: "Debugging / Testing",
    copy: "Quality checks keep delivery stable, readable, and easy to support.",
  },
  {
    number: "06",
    title: "Deployment",
    copy: "The final release is prepared for a controlled handoff and launch.",
  },
];

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const normalizeKey = (value) =>
  normalizeText(value)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isActiveService = (service) => service?.isActive !== false;

const sortServices = (services = []) =>
  [...services].sort(
    (a, b) =>
      Number(a?.displayOrder || 0) - Number(b?.displayOrder || 0) ||
      normalizeText(a?.title).localeCompare(normalizeText(b?.title))
  );

const isMeaningfulRoute = (route) => {
  const value = normalizeText(route);
  return (
    value &&
    value !== SERVICES_ROUTE &&
    value !== "/" &&
    value !== "#"
  );
};

const getServiceRoute = (service) => {
  if (!service) {
    return SERVICE_ROUTE_FALLBACK;
  }

  const route = normalizeText(service.route);
  if (route.startsWith("http://") || route.startsWith("https://")) {
    return route;
  }

  return isMeaningfulRoute(route) ? route : SERVICE_ROUTE_FALLBACK;
};

const getServiceVariant = (service) => {
  const title = normalizeText(service?.title).toLowerCase();
  const category = normalizeText(service?.category).toLowerCase();

  if (title.includes("mobile") || category.includes("mobile")) return "mobile";
  if (title.includes("cloud") || category.includes("cloud")) return "cloud";
  if (title.includes("devops") || category.includes("devops")) return "devops";
  if (title.includes("ai") || title.includes("automation") || category.includes("ai")) return "ai";
  if (title.includes("security") || category.includes("security")) return "security";
  return "web";
};

const buildCapabilityTags = (service) => {
  const title = normalizeText(service?.title).toLowerCase();
  const category = normalizeText(service?.category).toLowerCase();
  const tags = [];

  const add = (label) => {
    const value = normalizeText(label);
    if (value && !tags.includes(value)) {
      tags.push(value);
    }
  };

  if (title.includes("web")) add("Web delivery");
  if (title.includes("mobile")) add("Mobile interfaces");
  if (title.includes("cloud")) add("Cloud architecture");
  if (title.includes("devops")) add("Release automation");
  if (title.includes("ai") || title.includes("automation")) add("Workflow automation");
  if (title.includes("security") || category.includes("security")) add("Security controls");
  if (category.includes("design") || title.includes("ux") || title.includes("ui")) add("Product design");
  if (category.includes("industry")) add("Sector fit");

  add(service?.category || "Enterprise delivery");
  add(service?.shortDescription || service?.description || "CMS-managed capability");

  return tags.slice(0, 3);
};

const buildOutcomeCards = (service) => {
  const title = normalizeText(service?.title, "service");
  const category = normalizeText(service?.category, "Enterprise delivery");
  const summary = normalizeText(
    service?.shortDescription || service?.description,
    "A CMS-managed service line that keeps scope and delivery aligned."
  );

  return [
    {
      label: "Business challenge",
      copy: `Teams needing ${title.toLowerCase()} work usually need a clear starting point and a way to align stakeholders early.`,
    },
    {
      label: "Capability layer",
      copy: summary,
    },
    {
      label: "Delivery outcome",
      copy: `The ${category.toLowerCase()} line is shaped to keep strategy, build, and launch moving through one delivery rhythm.`,
    },
  ];
};

const buildRelatedPillars = (service, services) => {
  const serviceText = normalizeText(
    `${service?.title || ""} ${service?.category || ""}`
  ).toLowerCase();

  return TECH_PILLARS.map((pillar) => {
    const related = sortServices(services)
      .filter((candidate) => {
        const candidateText = normalizeText(
          `${candidate?.title || ""} ${candidate?.category || ""}`
        ).toLowerCase();
        return pillar.keywords.some((keyword) => candidateText.includes(keyword));
      })
      .slice(0, 3);

    const matchesService = pillar.keywords.some((keyword) =>
      serviceText.includes(keyword)
    );

    return {
      ...pillar,
      active: matchesService,
      related,
    };
  });
};

const getCategoryOptions = (services = []) => {
  const activeServices = sortServices(services.filter(isActiveService));

  return [
    {
      key: "all",
      label: "All services",
      count: activeServices.length,
    },
    ...SERVICE_MENU_CATEGORIES.map((category) => {
      const key = normalizeKey(category.label);
      const count = activeServices.filter(
        (service) => normalizeKey(service.category) === key
      ).length;

      return {
        key,
        label: category.label,
        count,
      };
    }).filter((category) => category.count > 0),
  ];
};

const renderServiceMedia = (service) => {
  const imageUrl = getSafeImageUrl(
    service?.heroImage ||
      service?.image ||
      service?.media ||
      service?.thumbnail ||
      ""
  );

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={normalizeText(service?.title, "Service visual")}
        loading="eager"
        decoding="async"
        className="services-enterprise__media-image"
        width="960"
        height="640"
      />
    );
  }

  return (
    <ServiceMesh
      variant={getServiceVariant(service)}
      title={service?.title}
      accent="var(--accent-secondary)"
    />
  );
};

const ServicesPage = () => {
  const pageRef = useRef(null);
  const detailRef = useRef(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadTick, setReloadTick] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeServiceId, setActiveServiceId] = useState("");
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await getServices();
        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        if (!mounted) {
          return;
        }

        setServices(items);
      } catch (err) {
        if (!mounted) {
          return;
        }

        setServices([]);
        setError(
          err?.response?.data?.message ||
            "We could not load the services catalog right now."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [reloadTick]);

  const activeServices = useMemo(
    () => sortServices(services.filter(isActiveService)),
    [services]
  );

  const categoryOptions = useMemo(
    () => getCategoryOptions(activeServices),
    [activeServices]
  );

  const resolvedCategory = useMemo(() => {
    if (activeCategory === "all") {
      return "all";
    }

    return categoryOptions.some((item) => item.key === activeCategory)
      ? activeCategory
      : "all";
  }, [activeCategory, categoryOptions]);

  const visibleServices = useMemo(() => {
    if (resolvedCategory === "all") {
      return activeServices;
    }

    return activeServices.filter(
      (service) => normalizeKey(service.category) === resolvedCategory
    );
  }, [activeServices, resolvedCategory]);

  const resolvedActiveServiceId = useMemo(() => {
    if (visibleServices.length === 0) {
      return "";
    }

    if (
      activeServiceId &&
      visibleServices.some((service) => service.id === activeServiceId)
    ) {
      return activeServiceId;
    }

    return visibleServices[0]?.id || "";
  }, [activeServiceId, visibleServices]);

  const selectedService = useMemo(() => {
    if (visibleServices.length === 0) {
      return activeServices[0] || null;
    }

    return (
      visibleServices.find((service) => service.id === resolvedActiveServiceId) ||
      visibleServices[0] ||
      null
    );
  }, [activeServices, resolvedActiveServiceId, visibleServices]);

  const selectedServiceId = selectedService?.id || "";
  useEffect(() => {
    if (reducedMotion || !detailRef.current || !selectedServiceId) {
      return undefined;
    }

    gsap.fromTo(
      detailRef.current,
      { autoAlpha: 0.7, y: 16 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.45,
        ease: "power3.out",
      }
    );

    return undefined;
  }, [reducedMotion, selectedServiceId]);

  const relatedPillars = useMemo(
    () => buildRelatedPillars(selectedService, activeServices),
    [activeServices, selectedService]
  );

  const outcomeCards = useMemo(
    () => buildOutcomeCards(selectedService),
    [selectedService]
  );

  const serviceListSchema = useMemo(
    () =>
      activeServices.slice(0, 10).map((service, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: service.title,
        url: `${window.location.origin}/services`,
      })),
    [activeServices]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const sections = pageRef.current.querySelectorAll("[data-services-animate]");

        sections.forEach((section) => {
          const targets = section.querySelectorAll("[data-services-reveal]");
          if (!targets.length) {
            return;
          }

          gsap.fromTo(
            targets,
            { autoAlpha: 0, y: 22 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.82,
              stagger: 0.08,
              ease: "power3.out",
              scrollTrigger: {
                trigger: section,
                start: "top 82%",
                once: true,
              },
            }
          );
        });
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [reducedMotion, activeServices.length, visibleServices.length, loading],
      revertOnUpdate: true,
    }
  );

  const leadService = selectedService || activeServices[0] || null;
  const activeCategoryLabel =
    categoryOptions.find((item) => item.key === resolvedCategory)?.label || "All services";
  const heroCounts = {
    active: activeServices.length,
    groups: Math.max(1, categoryOptions.filter((item) => item.key !== "all").length),
    featured: activeServices.filter((item) => item.featured).length,
  };

  const handleCategoryChange = (key) => {
    setActiveCategory(key);

    const nextVisible =
      key === "all"
        ? activeServices
        : activeServices.filter((service) => normalizeKey(service.category) === key);

    if (nextVisible[0]) {
      setActiveServiceId(nextVisible[0].id);
    }
  };

  const handleRetry = () => {
    setReloadTick((value) => value + 1);
  };

  const pageTitle = "Enterprise Services | TechnoSthan";
  const pageDescription =
    "Explore TechnoSthan's enterprise services across web development, mobile apps, cloud architecture, AI automation, cybersecurity, and product design.";

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const canonical = `${window.location.origin}/services`;
    const previousTitle = document.title;
    const previousDescription = document.head.querySelector('meta[name="description"]')?.getAttribute("content") || "";

    const ensureMeta = (selector, attrs) => {
      let element = document.head.querySelector(selector);

      if (!element) {
        element = document.createElement("meta");
        document.head.appendChild(element);
      }

      Object.entries(attrs).forEach(([name, value]) => {
        element.setAttribute(name, value);
      });

      return element;
    };

    const ensureLink = (rel, href) => {
      let element = document.head.querySelector(`link[rel="${rel}"]`);

      if (!element) {
        element = document.createElement("link");
        document.head.appendChild(element);
      }

      element.setAttribute("rel", rel);
      element.setAttribute("href", href);

      return element;
    };

    const setJsonLd = (id, data) => {
      let script = document.getElementById(id);

      if (!script) {
        script = document.createElement("script");
        script.id = id;
        script.type = "application/ld+json";
        document.head.appendChild(script);
      }

      script.textContent = JSON.stringify(data);
      return script;
    };

    document.title = pageTitle;
    ensureMeta('meta[name="description"]', {
      name: "description",
      content: pageDescription,
    });
    ensureMeta('meta[property="og:title"]', {
      property: "og:title",
      content: pageTitle,
    });
    ensureMeta('meta[property="og:description"]', {
      property: "og:description",
      content: pageDescription,
    });
    ensureMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    ensureMeta('meta[property="og:type"]', {
      property: "og:type",
      content: "website",
    });
    ensureMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    });
    ensureMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: pageTitle,
    });
    ensureMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: pageDescription,
    });
    ensureLink("canonical", canonical);

    const breadcrumbScript = setJsonLd("services-page-breadcrumb-jsonld", {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: window.location.origin,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Services",
          item: canonical,
        },
      ],
    });

    const itemListScript = setJsonLd("services-page-itemlist-jsonld", {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "TechnoSthan Services",
      itemListOrder: "http://schema.org/ItemListOrderAscending",
      numberOfItems: serviceListSchema.length,
      itemListElement: serviceListSchema,
    });

    return () => {
      document.title = previousTitle;
      const descriptionMeta = document.head.querySelector('meta[name="description"]');
      if (descriptionMeta && previousDescription) {
        descriptionMeta.setAttribute("content", previousDescription);
      }

      breadcrumbScript?.remove();
      itemListScript?.remove();
    };
  }, [pageDescription, pageTitle, serviceListSchema]);

  return (
    <div className="services-enterprise" ref={pageRef}>
      <ServicesBlueprintBackground />
      <section className="services-enterprise__hero" data-services-animate="hero">
        <div className="services-enterprise__shell services-enterprise__hero-grid">
          <div className="services-enterprise__hero-copy" data-services-reveal>
            <span className="section-badge services-enterprise__eyebrow">
              <span className="badge-dot" />
              Enterprise Services
            </span>
            <h1>Technology services engineered around business outcomes.</h1>
            <p>
              TechnoSthan keeps its public services catalog live, structured, and
              easy to navigate. The current portfolio includes {heroCounts.active} active
              services across {heroCounts.groups} delivery groups, with {heroCounts.featured} flagged as featured in the CMS.
            </p>

            <div className="services-enterprise__hero-actions">
              <MagneticButton to="/contact" className="btn-primary">
                Start a project
                <FiArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/case-studies" className="btn-secondary">
                View case studies
              </MagneticButton>
            </div>

            <div className="services-enterprise__hero-metrics" aria-label="Service catalog summary">
              <div className="services-enterprise__hero-metric">
                <strong>{heroCounts.active}</strong>
                <span>active services</span>
              </div>
              <div className="services-enterprise__hero-metric">
                <strong>{heroCounts.groups}</strong>
                <span>service groups</span>
              </div>
              <div className="services-enterprise__hero-metric">
                <strong>{heroCounts.featured}</strong>
                <span>featured records</span>
              </div>
            </div>
          </div>

          <div className="services-enterprise__hero-visual" data-services-reveal aria-hidden="true">
            <div className="services-enterprise__visual-shell">
              <div className="services-enterprise__visual-core">
                {renderServiceMedia(leadService)}
              </div>
              <div className="services-enterprise__visual-caption">
                <span className="services-enterprise__visual-captionLabel">Live CMS spotlight</span>
                <strong>{normalizeText(leadService?.title, "Service spotlight")}</strong>
                <span>{normalizeText(leadService?.shortDescription, "Enterprise capability built for clarity and scale.")}</span>
              </div>
              <div className="services-enterprise__visual-trustline">
                <span>CMS-driven</span>
                <span>Service catalog</span>
                <span>Live data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="services-enterprise__explorer" data-services-animate="explorer">
        <div className="services-enterprise__shell">
          <div className="services-enterprise__section-head" data-services-reveal>
            <span className="section-badge">
              <span className="badge-dot" />
              Service explorer
            </span>
            <h2>Browse live services, then open the active delivery view.</h2>
            <p>
              Filter by category, choose a service, and read the live detail panel
              that keeps the catalog anchored to the current CMS data.
            </p>
          </div>

          <div
            className="services-enterprise__filters"
            role="tablist"
            aria-label="Filter services by category"
            data-services-reveal
          >
            {categoryOptions.map((category) => (
              <button
                key={category.key}
                type="button"
                role="tab"
                aria-selected={activeCategory === category.key}
                className={`services-enterprise__filter ${
                  resolvedCategory === category.key ? "is-active" : ""
                }`}
                onClick={() => handleCategoryChange(category.key)}
              >
                <FiFilter size={14} />
                <span>{category.label}</span>
                <strong>{category.count}</strong>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="services-enterprise__loading-grid" aria-live="polite">
              <div className="services-enterprise__loading-list">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`service-skeleton-${index}`}
                    className="services-enterprise__skeleton services-enterprise__skeleton--list"
                  />
                ))}
              </div>
              <div className="services-enterprise__skeleton services-enterprise__skeleton--detail" />
            </div>
          ) : error && activeServices.length === 0 ? (
            <div className="services-enterprise__empty-state" data-services-reveal>
              <div className="services-enterprise__empty-copy">
                <span className="section-badge">
                  <span className="badge-dot" />
                  Catalog unavailable
                </span>
                <h3>We could not load the live services catalog.</h3>
                <p>{error}</p>
              </div>
              <div className="services-enterprise__empty-actions">
                <button type="button" className="btn-primary" onClick={handleRetry}>
                  <FiRefreshCcw size={16} />
                  Retry
                </button>
                <Link to="/contact" className="btn-secondary">
                  Contact us
                </Link>
              </div>
            </div>
          ) : activeServices.length === 0 ? (
            <div className="services-enterprise__empty-state" data-services-reveal>
              <div className="services-enterprise__empty-copy">
                <span className="section-badge">
                  <span className="badge-dot" />
                  No active services
                </span>
                <h3>The public catalog is empty right now.</h3>
                <p>
                  The page stays restrained instead of inventing services that are
                  not present in the CMS.
                </p>
              </div>
              <div className="services-enterprise__empty-actions">
                <Link to="/contact" className="btn-primary">
                  Start a project
                  <FiArrowRight size={16} />
                </Link>
                <button type="button" className="btn-secondary" onClick={handleRetry}>
                  Refresh
                </button>
              </div>
            </div>
          ) : (
            <div className="services-enterprise__explorer-grid">
              <div className="services-enterprise__list-column">
                <ul className="services-enterprise__service-list" aria-label="Services">
                  {visibleServices.map((service, index) => {
                    const Icon = getIconComponent(service.iconKey);
                    const isSelected = selectedService?.id === service.id;

                    return (
                      <li key={service.id} className="services-enterprise__service-item">
                        <button
                          type="button"
                          className={`services-enterprise__service-card ${
                            isSelected ? "is-active" : ""
                          }`}
                          onClick={() => setActiveServiceId(service.id)}
                          aria-pressed={isSelected}
                        >
                          <span className="services-enterprise__service-index">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="services-enterprise__service-icon" aria-hidden="true">
                            <Icon size={16} />
                          </span>
                          <span className="services-enterprise__service-copy">
                            <strong>{normalizeText(service.title, "Enterprise service")}</strong>
                            <span>{normalizeText(service.shortDescription || service.description)}</span>
                          </span>
                          <span className="services-enterprise__service-pill">
                            {normalizeText(service.category, "General")}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <aside className="services-enterprise__detail-column">
                <div className="services-enterprise__detail-panel" ref={detailRef} data-services-reveal>
                  <div className="services-enterprise__detail-topline">
                    <span className="services-enterprise__detail-index">
                      {String(
                        visibleServices.findIndex((service) => service.id === resolvedActiveServiceId) + 1
                      ).padStart(2, "0")}
                    </span>
                    <span className="services-enterprise__detail-category">
                      {normalizeText(selectedService?.category, activeCategoryLabel)}
                    </span>
                  </div>

                  <div className="services-enterprise__detail-layout">
                    <div className="services-enterprise__detail-copy">
                      <h3>{normalizeText(selectedService?.title, "Service detail")}</h3>
                      <p>
                        {normalizeText(
                          selectedService?.shortDescription || selectedService?.description,
                          "The active service view stays tied to live CMS data and updates as the filter changes."
                        )}
                      </p>
                    </div>

                    <div className="services-enterprise__detail-media" aria-hidden="true">
                      {renderServiceMedia(selectedService)}
                    </div>
                  </div>

                  <div className="services-enterprise__detail-cards">
                    {outcomeCards.map((card) => (
                      <article key={card.label} className="services-enterprise__detail-card">
                        <span>{card.label}</span>
                        <p>{card.copy}</p>
                      </article>
                    ))}
                  </div>

                  <div className="services-enterprise__detail-tags" aria-label="Capability tags">
                    {buildCapabilityTags(selectedService).map((tag) => (
                      <span key={tag} className="services-enterprise__detail-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="services-enterprise__detail-actions">
                    <MagneticButton to="/contact" className="btn-primary">
                      Discuss this service
                      <FiArrowRight size={16} />
                    </MagneticButton>
                    {isMeaningfulRoute(selectedService?.route) ? (
                      <MagneticButton
                        href={getServiceRoute(selectedService)}
                        className="btn-secondary"
                      >
                        Open route
                      </MagneticButton>
                    ) : (
                      <MagneticButton to="/case-studies" className="btn-secondary">
                        View case studies
                      </MagneticButton>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>

      {activeServices.length > 0 ? (
        <section className="services-enterprise__outcomes" data-services-animate="outcomes">
          <div className="services-enterprise__shell">
            <div className="services-enterprise__section-head services-enterprise__section-head--compact" data-services-reveal>
              <span className="section-badge">
                <span className="badge-dot" />
                Outcome layer
              </span>
              <h2>Challenge, capability, and delivery stay connected.</h2>
              <p>
                The page keeps each service grounded in the same live catalog so the
                public experience stays credible and easy to scan.
              </p>
            </div>

            <div className="services-enterprise__outcome-grid">
              {outcomeCards.map((card, index) => (
                <article
                  key={card.label}
                  className="services-enterprise__outcome-card"
                  data-services-reveal
                >
                  <span className="services-enterprise__outcome-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{card.label}</h3>
                  <p>{card.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {activeServices.length > 0 ? (
        <section className="services-enterprise__technology" data-services-animate="technology">
          <div className="services-enterprise__shell">
            <div className="services-enterprise__section-head" data-services-reveal>
              <span className="section-badge">
                <span className="badge-dot" />
                Technology ecosystem
              </span>
              <h2>Technology pillars that keep service delivery practical at scale.</h2>
              <p>
                The tech map is reused from the site&apos;s broader stack taxonomy so the
                services page stays aligned with the rest of the public experience.
              </p>
            </div>

            <div className="services-enterprise__tech-grid">
              {relatedPillars.map((pillar) => {
                const Icon = pillar.icon;

                return (
                  <article
                    key={pillar.key}
                    className={`services-enterprise__tech-card ${
                      pillar.active ? "is-active" : ""
                    }`}
                    data-services-reveal
                  >
                    <div className="services-enterprise__tech-top">
                      <span className="services-enterprise__tech-icon" aria-hidden="true">
                        <Icon size={18} />
                      </span>
                      <span className="services-enterprise__tech-label">{pillar.title}</span>
                    </div>
                    <p>{pillar.description}</p>
                    <div className="services-enterprise__tech-links" aria-label={`${pillar.title} related services`}>
                      {pillar.related.length > 0 ? (
                        pillar.related.map((service) => (
                          <span key={service.id} className="services-enterprise__tech-chip">
                            {normalizeText(service.title)}
                          </span>
                        ))
                      ) : (
                        <span className="services-enterprise__tech-chip">Enterprise readiness</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="services-enterprise__process" data-services-animate="process">
        <div className="services-enterprise__shell">
          <div className="services-enterprise__section-head" data-services-reveal>
            <span className="section-badge">
              <span className="badge-dot" />
              Delivery process
            </span>
            <h2>A compact 6D process that keeps the service catalog grounded.</h2>
            <p>
              The homepage already carries the full wheel, so this page uses a concise
              process strip that keeps the same approved naming without repeating the full visual.
            </p>
          </div>

          <div className="services-enterprise__process-grid">
            {PROCESS_STEPS.map((step) => (
              <article
                key={step.title}
                className="services-enterprise__process-card"
                data-services-reveal
              >
                <span className="services-enterprise__process-number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="services-enterprise__closing" data-services-animate="closing">
        <div className="services-enterprise__shell services-enterprise__closing-shell" data-services-reveal>
          <div className="services-enterprise__closing-copy">
            <span className="section-badge">
              <span className="badge-dot" />
              Start the conversation
            </span>
            <h2>Talk through scope, systems, and the right delivery path.</h2>
            <p>
              The services catalog is live, the routes are real, and the next step is
              simple: start a conversation with TechnoSthan.
            </p>
          </div>

          <div className="services-enterprise__closing-actions">
            <MagneticButton to="/contact" className="btn-primary">
              Contact our team
              <FiArrowRight size={16} />
            </MagneticButton>
            <MagneticButton to="/case-studies" className="btn-secondary">
              View selected work
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
