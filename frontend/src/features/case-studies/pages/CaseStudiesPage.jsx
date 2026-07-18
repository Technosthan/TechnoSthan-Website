import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiClock,
  FiTarget,
  FiTool,
} from "react-icons/fi";

import { getProjects } from "../../../api/projects.api";
import { getTestimonials } from "../../../api/testimonials.api";
import { getSafeImageUrl } from "../../../shared/utils";
import "./CaseStudiesPage.css";

const templates = [
  {
    tag: "Growth",
    problem: "Manual processes were slowing decision-making and delivery.",
    solution: "A clearer operating model with better digital visibility.",
    result: "Faster handoffs and more qualified business enquiries.",
    icon: FiBarChart2,
  },
  {
    tag: "Scale",
    problem: "The platform needed more resilience and capacity.",
    solution: "A cleaner cloud-ready foundation and release workflow.",
    result: "Improved uptime and stronger delivery confidence.",
    icon: FiTool,
  },
  {
    tag: "Impact",
    problem: "The digital experience did not reflect the ambition of the brand.",
    solution: "Sharper journeys and more conversion-focused content paths.",
    result: "Better trust, clearer navigation, and higher intent leads.",
    icon: FiTarget,
  },
];

const CaseStudiesPage = () => {
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectsRes, testimonialsRes] = await Promise.all([
          getProjects(),
          getTestimonials(),
        ]);

        if (!mounted) return;

        setProjects(projectsRes.data?.data || []);
        setTestimonials(testimonialsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load case studies", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const studies = useMemo(
    () =>
      projects
        .filter((project) => project.isActive !== false)
        .slice(0, 3)
        .map((project, index) => ({
          ...project,
          ...templates[index % templates.length],
        })),
    [projects]
  );

  const metrics = useMemo(
    () => [
      { label: "Projects", value: projects.length },
      { label: "References", value: testimonials.length },
      { label: "Delivery focus", value: "Enterprise" },
    ],
    [projects.length, testimonials.length]
  );

  return (
    <div className="case-study-page">
      <section className="case-study-hero">
        <div className="about-container">
          <span className="section-badge">
            <span className="badge-dot" />
            Case Studies
          </span>
          <h1>Case studies that show the shape of our delivery</h1>
          <p>
            These studies connect product outcomes, delivery structure, and
            client trust into one enterprise narrative.
          </p>

          <div className="case-study-metrics">
            {metrics.map((metric) => (
              <article key={metric.label} className="glass-card">
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="case-study-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Selected Work
          </span>
          <h2>Recent product and platform stories</h2>
          <p>
            We combine product thinking, architecture clarity, and practical
            delivery to create work that supports long-term enterprise goals.
          </p>
        </div>

        <div className="case-study-grid">
          {studies.map((study) => {
            const Icon = study.icon;
            const imageUrl = getSafeImageUrl(study.imageUrl);
            const testimonial = testimonials[0];

            return (
              <article key={study.id} className="case-study-card">
                <div className="case-study-media">
                  {imageUrl ? (
                    <img src={imageUrl} alt={study.title} loading="lazy" />
                  ) : (
                    <div className="case-study-placeholder">
                      <Icon size={24} />
                    </div>
                  )}
                </div>
                <div className="case-study-copy">
                  <span className="project-card-category">{study.tag}</span>
                  <h3>{study.title}</h3>
                  <p>{study.description}</p>

                  <div className="case-study-points">
                    <div>
                      <strong>Problem</strong>
                      <span>{study.problem}</span>
                    </div>
                    <div>
                      <strong>Solution</strong>
                      <span>{study.solution}</span>
                    </div>
                    <div>
                      <strong>Result</strong>
                      <span>{study.result}</span>
                    </div>
                  </div>

                  {testimonial ? (
                    <blockquote className="case-study-quote">
                      <p>{testimonial.feedback}</p>
                      <footer>
                        {testimonial.clientName}
                        {testimonial.company ? `, ${testimonial.company}` : ""}
                      </footer>
                    </blockquote>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="case-study-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Delivery Rhythm
          </span>
          <h2>How enterprise case work is structured</h2>
        </div>

        <div className="case-study-process">
          {[
            "Discovery and stakeholder mapping",
            "Architecture and delivery planning",
            "Design, build, and iterative review",
            "Launch, measure, and support",
          ].map((step, index) => (
            <article key={step} className="glass-card">
              <FiClock />
              <strong>0{index + 1}</strong>
              <p>{step}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="case-study-cta">
        <div className="about-container">
          <h2>Have a case study worth building?</h2>
          <p>
            We can turn a complex delivery story into a clear enterprise
            narrative with measurable outcomes.
          </p>
          <Link to="/contact" className="btn-primary">
            Talk to a specialist <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesPage;
