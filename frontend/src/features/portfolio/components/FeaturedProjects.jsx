import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiLayers } from "react-icons/fi";
import "./FeaturedProjects.css";
import { getProjects } from "../../../api/projects.api";
import { getSafeImageUrl } from "../../../shared/utils";

const categoryLabels = [
  "Enterprise SaaS",
  "AI Product",
  "Cloud Platform",
  "Custom App",
  "Digital Transformation",
];

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    fetchProjects();
  }, []);

  const featured = useMemo(() => {
    return projects
      .filter((project) => project.isActive !== false)
      .slice(0, 6);
  }, [projects]);

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="featured-projects">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Featured Products
        </span>
        <h2>Featured Products and Platforms</h2>
        <p>
          Selected products and digital platforms we&apos;ve built for teams
          that need reliability, speed, and enterprise-grade polish.
        </p>
      </div>

      <div className="projects-grid">
        {featured.map((project, index) => {
          const imageUrl = getSafeImageUrl(project.imageUrl);
          const category = categoryLabels[index % categoryLabels.length];

          return (
            <article key={project.id} className="project-card">
              <div className="project-card-image">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={project.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="project-card-placeholder">
                    <FiLayers size={26} />
                  </div>
                )}
              </div>

              <div className="project-card-copy">
                <span className="project-card-category">{category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-card-actions">
                  <span className="project-card-chip">Web</span>
                  <span className="project-card-chip">Cloud</span>
                  <button type="button" className="project-card-link">
                    Explore
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProjects;
