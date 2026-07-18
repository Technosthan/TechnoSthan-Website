import { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiBarChart2, FiTarget, FiTool } from "react-icons/fi";
import "./CaseStudies.css";
import { getProjects } from "../../../api/projects.api";
import { getSafeImageUrl } from "../../../shared/utils";

const resultTemplates = [
  {
    tag: "Growth",
    problem: "Manual workflows were slowing visibility across teams.",
    solution:
      "Built a product-first workflow that reduced friction and improved handoffs.",
    result: "Improved speed, consistency, and delivery confidence.",
    icon: FiBarChart2,
  },
  {
    tag: "Scale",
    problem: "The business needed a platform that could scale with demand.",
    solution:
      "Created a cloud-ready foundation with clearer architecture and governance.",
    result: "More capacity, stronger uptime, and better adoption.",
    icon: FiTool,
  },
  {
    tag: "Impact",
    problem: "The experience did not yet match the ambition of the brand.",
    solution:
      "Refined the digital experience with sharper messaging and conversion paths.",
    result: "Better trust, clearer journeys, and more qualified inquiries.",
    icon: FiTarget,
  },
];

const CaseStudies = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch case studies:", error);
      }
    };

    fetchProjects();
  }, []);

  const caseStudies = useMemo(() => {
    return projects
      .filter((project) => project.isActive !== false)
      .slice(0, 3)
      .map((project, index) => ({
        ...project,
        ...resultTemplates[index % resultTemplates.length],
      }));
  }, [projects]);

  if (caseStudies.length === 0) {
    return null;
  }

  return (
    <section className="case-studies">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Case Studies
        </span>
        <h2>Selected work that shows how we think</h2>
        <p>
          These outcomes show the balance we aim for: business impact, strong
          user experience, and a platform built to last.
        </p>
      </div>

      <div className="case-studies-grid">
        {caseStudies.map((study) => {
          const Icon = study.icon;
          const imageUrl = getSafeImageUrl(study.imageUrl);

          return (
            <article key={study.id} className="case-card">
              <div className="case-card-media">
                {imageUrl ? (
                  <img src={imageUrl} alt={study.title} loading="lazy" />
                ) : (
                  <div className="case-card-placeholder">
                    <Icon size={24} />
                  </div>
                )}
              </div>

              <div className="case-card-copy">
                <span className="case-card-tag">{study.tag}</span>
                <h3>{study.title}</h3>
                <p>{study.description}</p>

                <div className="case-card-points">
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

                <button type="button" className="case-card-link">
                  Read case study
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

export default CaseStudies;
