import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLayers } from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import "./FeaturedProjects.css";
import { getProjects } from "../../../api/projects.api";
import { getSafeImageUrl } from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const categoryLabels = [
  "Enterprise SaaS",
  "AI Platform",
  "Cloud Operations",
  "Digital Experience",
  "Business Automation",
  "Industry Product",
];

const FeaturedProjects = () => {
  const [projects, setProjects] = useState([]);
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const featured = useMemo(() => {
    return projects
      .filter((project) => project.isActive !== false)
      .slice(0, 4);
  }, [projects]);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-project-card]"),
          { y: 32, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [featured.length, reducedMotion],
    }
  );

  if (featured.length === 0) {
    return null;
  }

  return (
    <section className="featured-projects" ref={scopeRef} data-motion-zone="products">
      <div className="section-header featured-header">
        <span className="section-badge" data-gsap="fade-up">
          <span className="badge-dot" />
          Featured Platforms
        </span>
        <h2 data-gsap="text-reveal">Selected work with visible product depth</h2>
        <p data-gsap="fade-up">
          These projects are presented as editorial case narratives, not just
          card thumbnails, so each entry feels like a real enterprise
          engagement.
        </p>
      </div>

      <div className="projects-stack">
        {featured.map((project, index) => {
          const imageUrl = getSafeImageUrl(project.imageUrl);
          const category = categoryLabels[index % categoryLabels.length];
          const isReverse = index % 2 === 1;

          return (
            <article
              key={project.id}
              className={`project-story ${isReverse ? "is-reverse" : ""}`}
              data-project-card
            >
              <div className="project-story-media">
                {imageUrl ? (
                  <img src={imageUrl} alt={project.title} loading="lazy" />
                ) : (
                  <div className="project-story-placeholder">
                    <FiLayers size={28} />
                  </div>
                )}
              </div>

              <div className="project-story-copy">
                <span className="project-story-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="project-story-category">{category}</span>
                <h3>{project.title}</h3>
                <p>{project.description}</p>

                <div className="project-story-tags">
                  <span>Enterprise-ready</span>
                  <span>Scalable</span>
                  <span>CMS-driven</span>
                </div>

                <button
                  type="button"
                  className="project-story-link"
                  onClick={() => navigate(project.route || "/products")}
                >
                  View details
                  <FiArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default FeaturedProjects;
