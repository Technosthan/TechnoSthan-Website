import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiFilter,
  FiRefreshCcw,
  FiSearch,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import MagneticButton from "../../../components/motion/MagneticButton";
import useReducedMotion from "../../../hooks/useReducedMotion";
import usePortfolioCatalog from "../hooks/usePortfolioCatalog";
import ProjectMedia from "../components/ProjectMedia";
import PortfolioVisual from "../components/PortfolioVisual";
import {
  buildProjectFilters,
  filterProjects,
  formatRelativeDate,
  getProjectFocusLabel,
  getProjectMetricSnippets,
  getProjectNarrative,
  getRelatedProjects,
  getRelatedServices,
  getProjectThemes,
  getThemeLabel,
  normalizeText,
} from "../data/portfolioData";
import { syncPortfolioHead } from "../utils/head";
import "../styles/portfolio-enterprise.css";

const PORTFOLIO_CANONICAL =
  typeof window !== "undefined"
    ? `${window.location.origin}/case-studies`
    : "/case-studies";

const PAGE_TITLE = "Portfolio and Case Studies | TechnoSthan";
const PAGE_DESCRIPTION =
  "Explore TechnoSthan's public case-study portfolio with live project records, editorial summaries, and conservative related-service connections.";

const getCardVariant = (index) => {
  const pattern = ["lead", "tall", "wide", "compact", "stacked"];
  return pattern[index % pattern.length];
};

const PortfolioMetricCard = ({ value, label, note }) => (
  <article className="portfolio-enterprise__proof-card">
    <span className="portfolio-enterprise__proof-note">{note}</span>
    <strong className="portfolio-enterprise__proof-value" data-portfolio-count={value}>
      0
    </strong>
    <span className="portfolio-enterprise__proof-label">{label}</span>
  </article>
);

const PortfolioProjectCard = ({ project, index, lead = false }) => {
  const themes = getProjectThemes(project);
  const variant = lead ? "lead" : getCardVariant(index + 1);
  const relativeUpdated = formatRelativeDate(project.updatedAt);
  const relativeCreated = formatRelativeDate(project.createdAt);

  return (
    <article
      className={`portfolio-enterprise__project-card portfolio-enterprise__project-card--${variant}`}
      data-portfolio-card
    >
      <Link
        to={project.route}
        className="portfolio-enterprise__project-mediaLink"
        aria-label={`Open case study for ${project.title}`}
      >
        <ProjectMedia project={project} eager={lead} className="portfolio-enterprise__project-media" />
      </Link>

      <div className="portfolio-enterprise__project-body">
        <div className="portfolio-enterprise__project-topline">
          <span className="portfolio-enterprise__project-index">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="portfolio-enterprise__project-pill">
            {project.hasImage ? "Image-backed" : "Fallback visual"}
          </span>
        </div>

        <h3>
          <Link to={project.route}>{project.title}</Link>
        </h3>

        <p>{project.description}</p>

        <div className="portfolio-enterprise__project-tags" aria-label={`${project.title} themes`}>
          {themes.length > 0 ? (
            themes.map((theme) => (
              <span key={theme.key} className="portfolio-enterprise__chip">
                {theme.label}
              </span>
            ))
          ) : (
            <span className="portfolio-enterprise__chip">Enterprise delivery</span>
          )}
        </div>

        <div className="portfolio-enterprise__project-meta">
          {project.displayOrder !== null ? (
            <span>Order {project.displayOrder}</span>
          ) : null}
          {relativeCreated ? <span>Created {relativeCreated}</span> : null}
          {relativeUpdated ? <span>Updated {relativeUpdated}</span> : null}
        </div>

        <Link className="portfolio-enterprise__project-link" to={project.route}>
          View case study
          <FiArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const PortfolioPage = () => {
  const pageRef = useRef(null);
  const { projects, services, loading, error, refresh } = usePortfolioCatalog();
  const reducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => buildProjectFilters(projects), [projects]);

  const visibleProjects = useMemo(
    () => filterProjects(projects, { filterKey: activeFilter, search }),
    [activeFilter, projects, search]
  );

  const activeProjects = useMemo(() => projects.filter((project) => project.isActive), [projects]);

  const activeCount = activeProjects.length;
  const imageCount = activeProjects.filter((project) => project.hasImage).length;
  const detectedThemeKeys = new Set();
  activeProjects.forEach((project) => {
    project.themeKeys.forEach((themeKey) => detectedThemeKeys.add(themeKey));
  });

  const themeCount = detectedThemeKeys.size;
  const leadProject = visibleProjects[0] || null;
  const relatedServices = useMemo(
    () => (leadProject ? getRelatedServices(leadProject, services) : []),
    [leadProject, services]
  );
  const relatedProjects = useMemo(
    () => (leadProject ? getRelatedProjects(leadProject, activeProjects) : []),
    [activeProjects, leadProject]
  );
  const narrative = useMemo(
    () => (leadProject ? getProjectNarrative(leadProject) : null),
    [leadProject]
  );
  const projectMetrics = useMemo(
    () => (leadProject ? getProjectMetricSnippets(leadProject) : []),
    [leadProject]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const hero = pageRef.current.querySelectorAll("[data-portfolio-hero]");
        const sections = pageRef.current.querySelectorAll("[data-portfolio-reveal-section]");
        const cards = pageRef.current.querySelectorAll("[data-portfolio-card]");
        const counters = pageRef.current.querySelectorAll("[data-portfolio-count]");

        gsap.fromTo(
          hero,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 86%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          sections,
          { autoAlpha: 0, y: 26 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: pageRef.current,
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
            duration: 0.78,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 72%",
              once: true,
            },
          }
        );

        counters.forEach((counter) => {
          const endValue = Number(counter.getAttribute("data-portfolio-count") || 0);
          const state = { value: 0 };

          gsap.to(state, {
            value: endValue,
            duration: 1.2,
            ease: "power3.out",
            snap: { value: 1 },
            scrollTrigger: {
              trigger: counter,
              start: "top 90%",
              once: true,
            },
            onUpdate: () => {
              counter.textContent = Math.round(state.value).toLocaleString();
            },
          });
        });
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [activeCount, imageCount, themeCount, reducedMotion, visibleProjects.length],
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    return syncPortfolioHead({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      canonical: PORTFOLIO_CANONICAL,
      breadcrumbName: "Portfolio",
      itemList: activeProjects.slice(0, 10).map((project) => ({
        name: project.title,
        url: `${window.location.origin}${project.route}`,
      })),
    });
  }, [activeProjects]);

  const hasVisibleResults = visibleProjects.length > 0;
  const activeFilterLabel =
    filters.find((filter) => filter.key === activeFilter)?.label || "All";

  const handleClear = () => {
    setActiveFilter("all");
    setSearch("");
  };

  return (
    <div className="portfolio-enterprise" ref={pageRef}>
      <section className="portfolio-enterprise__hero" data-motion-zone="products">
        <div className="portfolio-enterprise__shell portfolio-enterprise__hero-grid">
          <div className="portfolio-enterprise__hero-copy" data-portfolio-hero>
            <span className="section-badge portfolio-enterprise__eyebrow">
              <span className="badge-dot" />
              Case Studies
            </span>
            <h1>Selected digital systems built for real business needs.</h1>
            <p>
              TechnoSthan&apos;s public portfolio is powered by live CMS records. Each
              entry keeps the real title, description, ordering, and image state
              visible so the experience stays credible and easy to scan.
            </p>

            <div className="portfolio-enterprise__hero-actions">
              <MagneticButton to="/contact" className="btn-primary">
                Discuss a project
                <FiArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/services" className="btn-secondary">
                Explore services
              </MagneticButton>
            </div>

            <div className="portfolio-enterprise__hero-metrics" aria-label="Portfolio summary">
              <PortfolioMetricCard value={activeCount} label="active projects" note="Live records" />
              <PortfolioMetricCard value={imageCount} label="image-backed records" note="Visual coverage" />
              <PortfolioMetricCard value={themeCount} label="detected theme signals" note="Derived from titles and descriptions" />
            </div>
          </div>

          <div className="portfolio-enterprise__hero-visual" data-portfolio-hero aria-hidden="true">
            <PortfolioVisual projects={activeProjects.slice(0, 3)} />
          </div>
        </div>
      </section>

      <section className="portfolio-enterprise__filters" data-portfolio-reveal-section>
        <div className="portfolio-enterprise__shell">
          <div className="portfolio-enterprise__section-head">
            <span className="section-badge">
              <span className="badge-dot" />
              Browse live records
            </span>
            <h2>Filter by visible signals, then open the detail view.</h2>
            <p>
              The public project catalog only renders real data points. When extra
              metadata is missing, the page stays restrained instead of inventing
              labels or metrics.
            </p>
          </div>

          <div className="portfolio-enterprise__filter-row">
            <label className="portfolio-enterprise__search" htmlFor="portfolio-search">
              <FiSearch size={16} aria-hidden="true" />
              <span className="sr-only">Search projects by title</span>
              <input
                id="portfolio-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search project titles"
              />
            </label>

            <div
              className="portfolio-enterprise__chips"
              role="tablist"
              aria-label="Portfolio filters"
            >
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`portfolio-enterprise__chipButton ${
                    activeFilter === filter.key ? "is-active" : ""
                  }`}
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  <FiFilter size={13} aria-hidden="true" />
                  <span>{filter.label}</span>
                  <strong>{filter.count}</strong>
                </button>
              ))}
            </div>

            <div className="portfolio-enterprise__filter-meta">
              <span>
                {visibleProjects.length} result{visibleProjects.length === 1 ? "" : "s"}
                {activeFilter !== "all" || search ? ` · ${activeFilterLabel}` : ""}
              </span>
              {activeFilter !== "all" || search ? (
                <button type="button" className="portfolio-enterprise__clear" onClick={handleClear}>
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="portfolio-enterprise__loading" aria-live="polite" data-portfolio-reveal-section>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__loading-grid">
              <div className="portfolio-enterprise__skeleton portfolio-enterprise__skeleton--hero" />
              <div className="portfolio-enterprise__skeleton portfolio-enterprise__skeleton--copy" />
              <div className="portfolio-enterprise__skeleton portfolio-enterprise__skeleton--card" />
              <div className="portfolio-enterprise__skeleton portfolio-enterprise__skeleton--card" />
              <div className="portfolio-enterprise__skeleton portfolio-enterprise__skeleton--card" />
            </div>
          </div>
        </section>
      ) : error && activeProjects.length === 0 ? (
        <section className="portfolio-enterprise__empty portfolio-enterprise__empty--error" data-portfolio-reveal-section>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__empty-card">
              <span className="section-badge">
                <span className="badge-dot" />
                Portfolio unavailable
              </span>
              <h2>We could not load the public project catalog right now.</h2>
              <p>{error}</p>
              <div className="portfolio-enterprise__empty-actions">
                <button type="button" className="btn-primary" onClick={refresh}>
                  <FiRefreshCcw size={16} />
                  Retry
                </button>
                <MagneticButton to="/contact" className="btn-secondary">
                  Contact us
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          {hasVisibleResults ? (
            <section className="portfolio-enterprise__feature" data-portfolio-reveal-section>
              <div className="portfolio-enterprise__shell">
              <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                <span className="section-badge">
                  <span className="badge-dot" />
                  Lead case study
                </span>
                <h2>One active project leads the public narrative.</h2>
                <p>
                  The featured record always comes from the live CMS data, with no
                  fabricated metrics or unsupported project claims.
                </p>
              </div>

              {leadProject ? (
                <article className="portfolio-enterprise__feature-card">
                  <div className="portfolio-enterprise__feature-media">
                    <ProjectMedia project={leadProject} eager className="portfolio-enterprise__feature-image" />
                    <div className="portfolio-enterprise__feature-overlay" aria-hidden="true" />
                  </div>

                  <div className="portfolio-enterprise__feature-copy">
                    <div className="portfolio-enterprise__feature-topline">
                      <span className="portfolio-enterprise__feature-index">
                        {String(visibleProjects.findIndex((project) => project.id === leadProject.id) + 1).padStart(2, "0")}
                      </span>
                      <span className="portfolio-enterprise__feature-pill">Public record</span>
                    </div>

                    <h3>{leadProject.title}</h3>
                    <p className="portfolio-enterprise__feature-summary">{leadProject.description}</p>

                    <div className="portfolio-enterprise__feature-grid">
                      <article className="portfolio-enterprise__feature-cardlet">
                        <span>Challenge signal</span>
                        <p>{narrative?.challenge}</p>
                      </article>
                      <article className="portfolio-enterprise__feature-cardlet">
                        <span>Solution signal</span>
                        <p>{narrative?.solution}</p>
                      </article>
                      <article className="portfolio-enterprise__feature-cardlet">
                        <span>Public scope</span>
                        <ul>
                          {narrative?.scope?.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    </div>

                    <div className="portfolio-enterprise__feature-tags" aria-label="Detected themes">
                      {narrative?.themes.length > 0 ? (
                        narrative.themes.map((theme) => (
                          <span key={theme.key} className="portfolio-enterprise__chip">
                            {theme.label}
                          </span>
                        ))
                      ) : (
                        <span className="portfolio-enterprise__chip">Enterprise delivery</span>
                      )}
                    </div>

                    <div className="portfolio-enterprise__feature-actions">
                      <Link to={leadProject.route} className="btn-primary">
                        Open case study
                        <FiArrowRight size={16} />
                      </Link>
                      <MagneticButton to="/services" className="btn-secondary">
                        View services
                      </MagneticButton>
                    </div>

                    {projectMetrics.length > 0 ? (
                      <div className="portfolio-enterprise__feature-metrics">
                        {projectMetrics.map((metric) => (
                          <div key={`${metric.label}-${metric.value}`} className="portfolio-enterprise__metric-pill">
                            <strong>{metric.value}</strong>
                            <span>{metric.label}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              ) : null}
              </div>
            </section>
          ) : null}

          <section className="portfolio-enterprise__collection" data-portfolio-reveal-section>
            <div className="portfolio-enterprise__shell">
              <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                <span className="section-badge">
                  <span className="badge-dot" />
                  Project collection
                </span>
                <h2>Editorial cards with real ordering and readable hierarchy.</h2>
                <p>
                  The grid changes shape as records scale, but each item still keeps
                  the same live CMS source of truth and the same conservative detail
                  handling.
                </p>
              </div>

              {hasVisibleResults ? (
                <div className="portfolio-enterprise__grid" aria-label="Portfolio projects">
                  {visibleProjects.map((project, index) => (
                    <PortfolioProjectCard
                      key={project.id}
                      project={project}
                      index={index}
                      lead={index === 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="portfolio-enterprise__empty-card portfolio-enterprise__empty-card--inline">
                  <span className="section-badge">
                    <span className="badge-dot" />
                    No matches
                  </span>
                  <h3>No projects match the current filters.</h3>
                  <p>
                    Clear the filters or search for another project title to continue.
                  </p>
                  <button type="button" className="btn-secondary" onClick={handleClear}>
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </section>

          {activeCount > 0 ? (
            <section className="portfolio-enterprise__proofs" data-portfolio-reveal-section>
              <div className="portfolio-enterprise__shell">
                <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                  <span className="section-badge">
                    <span className="badge-dot" />
                    Portfolio proof
                  </span>
                  <h2>Live counts, no fabricated proof points.</h2>
                  <p>
                    The numbers below are derived directly from the public project
                    catalog and update with the CMS.
                  </p>
                </div>

                <div className="portfolio-enterprise__proof-grid">
                  <PortfolioMetricCard value={activeCount} label="active records" note="Public catalog" />
                  <PortfolioMetricCard value={imageCount} label="records with images" note="Visual availability" />
                  <PortfolioMetricCard value={themeCount} label="detected themes" note="From titles and descriptions" />
                </div>
              </div>
            </section>
          ) : null}

          {relatedServices.length > 0 || visibleProjects.length > 1 ? (
            <section className="portfolio-enterprise__connections" data-portfolio-reveal-section>
              <div className="portfolio-enterprise__shell">
                <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                  <span className="section-badge">
                    <span className="badge-dot" />
                    Capability connections
                  </span>
                  <h2>Projects stay connected to the services that support them.</h2>
                  <p>
                    These connections are derived conservatively from the public
                    project title and description, then matched against the live
                    services catalog.
                  </p>
                </div>

                <div className="portfolio-enterprise__connection-grid">
                  {relatedServices.length > 0 ? (
                    <article className="portfolio-enterprise__connection-card">
                      <span className="portfolio-enterprise__connection-label">Matched services</span>
                      <h3>{normalizeText(leadProject?.title, "Current project")}</h3>
                      <div className="portfolio-enterprise__chips">
                        {relatedServices.map((service) => (
                          <span key={service.id} className="portfolio-enterprise__chip">
                            {service.title}
                          </span>
                        ))}
                      </div>
                      <p>
                        These service lines were matched from the same public language
                        used in the project summary.
                      </p>
                    </article>
                  ) : null}

                  {visibleProjects.slice(0, 3).map((project) => {
                    const projectServices = getRelatedServices(project, services);

                    return (
                      <article key={`${project.id}-connection`} className="portfolio-enterprise__connection-card">
                        <span className="portfolio-enterprise__connection-label">Project connection</span>
                        <h3>{project.title}</h3>
                        <div className="portfolio-enterprise__chips">
                          {projectServices.length > 0 ? (
                            projectServices.slice(0, 3).map((service) => (
                              <span key={service.id} className="portfolio-enterprise__chip">
                                {service.title}
                              </span>
                            ))
                          ) : (
                            <span className="portfolio-enterprise__chip">Enterprise delivery</span>
                          )}
                        </div>
                        <p>{getProjectFocusLabel(project)}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          {themeCount > 0 ? (
            <section className="portfolio-enterprise__technology" data-portfolio-reveal-section>
              <div className="portfolio-enterprise__shell">
                <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                  <span className="section-badge">
                    <span className="badge-dot" />
                    Technology index
                  </span>
                  <h2>A project-derived technology signal map.</h2>
                  <p>
                    The index is intentionally lightweight. It only surfaces themes that
                    appear in the project titles and descriptions already stored in the CMS.
                  </p>
                </div>

                <div className="portfolio-enterprise__tech-grid">
                  {Array.from(detectedThemeKeys).map((themeKey) => {
                    const theme = getThemeLabel(themeKey);
                    const count = activeProjects.filter((project) => project.themeKeys.includes(themeKey)).length;

                    return (
                      <article key={themeKey} className="portfolio-enterprise__tech-card">
                        <span className="portfolio-enterprise__tech-count">{String(count).padStart(2, "0")}</span>
                        <h3>{theme}</h3>
                        <p>Detected from active project records.</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </section>
          ) : null}

          <section className="portfolio-enterprise__process" data-portfolio-reveal-section>
            <div className="portfolio-enterprise__shell">
              <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
                <span className="section-badge">
                  <span className="badge-dot" />
                  Delivery insight
                </span>
                <h2>A compact process strip keeps the experience honest.</h2>
                <p>
                  The homepage carries the full 6D wheel. This page reuses the approved
                  process naming in a smaller editorial format so the narrative stays
                  consistent without repeating the entire visual.
                </p>
              </div>

              <div className="portfolio-enterprise__process-grid">
                {[
                  "Discovery",
                  "Discuss / Planning",
                  "Design",
                  "Development",
                  "Debugging / Testing",
                  "Deployment",
                ].map((step, index) => (
                  <article key={step} className="portfolio-enterprise__process-card">
                    <span className="portfolio-enterprise__process-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3>{step}</h3>
                    <p>
                      The public project story keeps the narrative anchored to live CMS
                      content while the delivery sequence stays readable and compact.
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="portfolio-enterprise__cta" data-portfolio-reveal-section>
            <div className="portfolio-enterprise__shell portfolio-enterprise__cta-shell">
              <div className="portfolio-enterprise__cta-copy">
                <span className="section-badge">
                  <span className="badge-dot" />
                  Start the conversation
                </span>
                <h2>Have a project worth turning into a clear enterprise story?</h2>
                <p>
                  TechnoSthan can shape the next case study around the live facts you
                  already have, without turning the page into a template or making up
                  unsupported results.
                </p>
              </div>

              <div className="portfolio-enterprise__cta-actions">
                <MagneticButton to="/contact" className="btn-primary">
                  Discuss a similar project
                  <FiArrowRight size={16} />
                </MagneticButton>
                <MagneticButton to="/services" className="btn-secondary">
                  Explore services
                </MagneticButton>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default PortfolioPage;
