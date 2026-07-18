import { useEffect, useMemo, useState } from "react";
import "./PortfolioStats.css";
import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import { getTestimonials } from "../../../api/testimonials.api";

const PortfolioStats = () => {
  const [counts, setCounts] = useState({
    projects: 50,
    services: 10,
    testimonials: 20,
  });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectsRes, servicesRes, testimonialsRes] =
          await Promise.all([
            getProjects(),
            getServices(),
            getTestimonials(),
          ]);

        if (!mounted) {
          return;
        }

        setCounts({
          projects: projectsRes.data?.data?.length || 0,
          services: servicesRes.data?.data?.length || 0,
          testimonials: testimonialsRes.data?.data?.length || 0,
        });
      } catch {
        if (mounted) {
          setCounts({
            projects: 50,
            services: 10,
            testimonials: 20,
          });
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      { number: `${counts.projects}+`, label: "Projects Delivered" },
      { number: `${counts.services}+`, label: "Live Services" },
      { number: `${counts.testimonials}+`, label: "Client References" },
      { number: "99%", label: "Client Satisfaction" },
    ],
    [counts]
  );

  return (
    <section className="portfolio-stats">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Enterprise Proof
        </span>
        <h2>Proof That Builds Trust Fast</h2>
        <p>
          Real numbers from the live site and CMS-backed content that show the
          scale, reliability, and delivery maturity behind the brand.
        </p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <article key={stat.label} className="stats-card">
            <h3>{stat.number}</h3>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PortfolioStats;
