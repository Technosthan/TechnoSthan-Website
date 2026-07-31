import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowRight,
  FiRefreshCcw,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import MagneticButton from "../../../components/motion/MagneticButton";
import useReducedMotion from "../../../hooks/useReducedMotion";
import usePortfolioCatalog from "../hooks/usePortfolioCatalog";
import ProjectMedia from "../components/ProjectMedia";
import {
  formatProjectDate,
  getProjectMetricSnippets,
  getProjectNarrative,
  getProjectThemes,
  getRelatedProjects,
  getRelatedServices,
  normalizeText,
} from "../data/portfolioData";
import { syncPortfolioHead } from "../utils/head";
import "../styles/portfolio-enterprise.css";

const ProjectDetailPage = () => {
  const pageRef = useRef(null);
  const { projectId } = useParams();
  const { projects, services, loading, error, refresh } = usePortfolioCatalog();
  const reducedMotion = useReducedMotion();

  const project = useMemo(
    () => projects.find((item) => item.id === projectId) || null,
    [projectId, projects]
  );

  const narrative = useMemo(
    () => (project ? getProjectNarrative(project) : null),
    [project]
  );

  const themes = useMemo(() => (project ? getProjectThemes(project) : []), [project]);
  const relatedServices = useMemo(
    () => (project ? getRelatedServices(project, services) : []),
    [project, services]
  );
  const relatedProjects = useMemo(
    () => (project ? getRelatedProjects(project, projects) : []),
    [project, projects]
  );
  const metrics = useMemo(
    () => (project ? getProjectMetricSnippets(project) : []),
    [project]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = pageRef.current.querySelectorAll("[data-portfolio-detail-reveal]");

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [projectId, reducedMotion, project?.id, relatedServices.length, relatedProjects.length],
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    if (loading) {
      return syncPortfolioHead({
        title: "Loading project | TechnoSthan",
        description:
          "Loading a public TechnoSthan case study from the live portfolio.",
        canonical: `${window.location.origin}/case-studies/${projectId || ""}`,
        breadcrumbName: "Project detail",
      });
    }

    if (!project) {
      return syncPortfolioHead({
        title: "Project detail | TechnoSthan",
        description:
          "Explore a public TechnoSthan project record, with a clean fallback when the case study is unavailable.",
        canonical: `${window.location.origin}/case-studies/${projectId || ""}`,
        breadcrumbName: "Project detail",
      });
    }

    const title = `${project.title} | Portfolio | TechnoSthan`;
    const description = normalizeText(
      project.description,
      "Public project record from the TechnoSthan portfolio."
    );

    return syncPortfolioHead({
      title,
      description,
      canonical: `${window.location.origin}/case-studies/${project.id}`,
      breadcrumbName: "Project detail",
      image: project.imageUrl || "",
      itemList: [],
    });
  }, [loading, project, projectId]);

  if (loading) {
    return (
      <div className="portfolio-enterprise" ref={pageRef}>
        <section className="portfolio-enterprise__detail-hero portfolio-enterprise__detail-hero--loading" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__detail-skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="portfolio-enterprise" ref={pageRef}>
        <section className="portfolio-enterprise__detail-hero portfolio-enterprise__detail-hero--error" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__detail-empty">
              <span className="section-badge">
                <span className="badge-dot" />
                Project unavailable
              </span>
              <h1>We could not load the public project catalog.</h1>
              <p>{error}</p>
              <div className="portfolio-enterprise__empty-actions">
                <button type="button" className="btn-primary" onClick={refresh}>
                  <FiRefreshCcw size={16} />
                  Retry
                </button>
                <MagneticButton to="/case-studies" className="btn-secondary">
                  Back to portfolio
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="portfolio-enterprise" ref={pageRef}>
        <section className="portfolio-enterprise__detail-hero portfolio-enterprise__detail-hero--missing" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__detail-empty">
              <span className="section-badge">
                <span className="badge-dot" />
                Project not found
              </span>
              <h1>This case study is not publicly available.</h1>
              <p>
                The route may be invalid, or the project may no longer be active in the public CMS.
              </p>
              <div className="portfolio-enterprise__empty-actions">
                <MagneticButton to="/case-studies" className="btn-primary">
                  Back to portfolio
                  <FiArrowRight size={16} />
                </MagneticButton>
                <MagneticButton to="/contact" className="btn-secondary">
                  Contact us
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const createdAt = formatProjectDate(project.createdAt);
  const updatedAt = formatProjectDate(project.updatedAt);

  return (
    <div className="portfolio-enterprise" ref={pageRef}>
      <section className="portfolio-enterprise__detail-hero" data-motion-zone="products">
        <div className="portfolio-enterprise__shell portfolio-enterprise__detail-grid">
          <div className="portfolio-enterprise__detail-copy" data-portfolio-detail-reveal>
            <span className="section-badge portfolio-enterprise__eyebrow">
              <span className="badge-dot" />
              Case study detail
            </span>
            <nav className="portfolio-enterprise__breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/case-studies">Portfolio</Link>
              <span aria-hidden="true">/</span>
              <span>{project.title}</span>
            </nav>
            <h1>{project.title}</h1>
            <p className="portfolio-enterprise__detail-summary">{project.description}</p>

            <div className="portfolio-enterprise__detail-meta" aria-label="Project metadata">
              <span>Active record</span>
              {project.displayOrder !== null ? <span>Order {project.displayOrder}</span> : null}
              {createdAt ? <span>Created {createdAt}</span> : null}
              {updatedAt ? <span>Updated {updatedAt}</span> : null}
              {project.hasImage ? <span>Image available</span> : <span>Fallback visual</span>}
            </div>

            <div className="portfolio-enterprise__detail-actions">
              <MagneticButton to="/contact" className="btn-primary">
                Discuss a similar project
                <FiArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/services" className="btn-secondary">
                Explore services
              </MagneticButton>
            </div>

            {themes.length > 0 ? (
              <div className="portfolio-enterprise__chips" aria-label="Detected themes">
                {themes.map((theme) => (
                  <span key={theme.key} className="portfolio-enterprise__chip">
                    {theme.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="portfolio-enterprise__detail-visual" data-portfolio-detail-reveal aria-hidden="true">
            <ProjectMedia project={project} eager className="portfolio-enterprise__detail-media" />
            <div className="portfolio-enterprise__detail-visualCopy">
              <span>Public CMS record</span>
              <strong>{normalizeText(project.title, "Project detail")}</strong>
              <span>{getProjectThemes(project).map((theme) => theme.label).join(" · ") || "Enterprise delivery"}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="portfolio-enterprise__detail-insight" data-portfolio-detail-reveal>
        <div className="portfolio-enterprise__shell">
          <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
            <span className="section-badge">
              <span className="badge-dot" />
              Editorial reading
            </span>
            <h2>Challenge, solution, and delivery stay grounded in the public summary.</h2>
            <p>
              These notes are derived from the visible CMS fields only. When a richer
              public brief is not stored, the page stays intentionally restrained.
            </p>
          </div>

          <div className="portfolio-enterprise__insight-grid">
            <article className="portfolio-enterprise__insight-card">
              <span>Challenge</span>
              <p>{narrative?.challenge}</p>
            </article>
            <article className="portfolio-enterprise__insight-card">
              <span>Solution</span>
              <p>{narrative?.solution}</p>
            </article>
            <article className="portfolio-enterprise__insight-card">
              <span>Engineering approach</span>
              <p>{narrative?.approach}</p>
            </article>
          </div>
        </div>
      </section>

      {narrative?.scope?.length > 0 ? (
        <section className="portfolio-enterprise__detail-scope" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__scope-card">
              <div>
                <span className="section-badge">
                  <span className="badge-dot" />
                  Public scope
                </span>
                <h2>What the public record actually exposes.</h2>
              </div>

              <ul className="portfolio-enterprise__scope-list">
                {narrative.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {metrics.length > 0 ? (
        <section className="portfolio-enterprise__detail-metrics" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Quantifiable notes
              </span>
              <h2>Only figures that actually appear in the description are surfaced.</h2>
            </div>

            <div className="portfolio-enterprise__metrics-grid">
              {metrics.map((metric) => (
                <article key={`${metric.label}-${metric.value}`} className="portfolio-enterprise__metric-card">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedServices.length > 0 ? (
        <section className="portfolio-enterprise__detail-services" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Related services
              </span>
              <h2>Service lines that match the public project language.</h2>
            </div>

            <div className="portfolio-enterprise__connection-grid portfolio-enterprise__connection-grid--services">
              {relatedServices.map((service) => (
                <article key={service.id} className="portfolio-enterprise__connection-card">
                  <span className="portfolio-enterprise__connection-label">{service.category}</span>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedProjects.length > 0 ? (
        <section className="portfolio-enterprise__detail-related" data-portfolio-detail-reveal>
          <div className="portfolio-enterprise__shell">
            <div className="portfolio-enterprise__section-head portfolio-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Related projects
              </span>
              <h2>Other active records with nearby themes.</h2>
            </div>

            <div className="portfolio-enterprise__related-grid">
              {relatedProjects.map((related, index) => (
                <article key={related.id} className="portfolio-enterprise__related-card">
                  <Link to={related.route} className="portfolio-enterprise__related-mediaLink">
                    <ProjectMedia project={related} eager={index === 0} className="portfolio-enterprise__related-media" />
                  </Link>
                  <div className="portfolio-enterprise__related-copy">
                    <span className="portfolio-enterprise__project-pill">Related record</span>
                    <h3>
                      <Link to={related.route}>{related.title}</Link>
                    </h3>
                    <p>{related.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="portfolio-enterprise__detail-cta" data-portfolio-detail-reveal>
        <div className="portfolio-enterprise__shell portfolio-enterprise__cta-shell">
          <div className="portfolio-enterprise__cta-copy">
            <span className="section-badge">
              <span className="badge-dot" />
              Next step
            </span>
            <h2>Have a similar delivery story in mind?</h2>
            <p>
              We can shape the next public case study around the facts already stored in
              your CMS and keep it aligned with the broader enterprise design system.
            </p>
          </div>

          <div className="portfolio-enterprise__cta-actions">
            <MagneticButton to="/contact" className="btn-primary">
              Contact our team
              <FiArrowRight size={16} />
            </MagneticButton>
            <MagneticButton to="/case-studies" className="btn-secondary">
              Back to portfolio
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProjectDetailPage;
