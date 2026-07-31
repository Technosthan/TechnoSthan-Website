import { useEffect, useMemo, useState } from "react";
import { FiBarChart2, FiTarget, FiTool } from "react-icons/fi";
import { getAdminProjects } from "../../../api/projects.api";
import { getAdminTestimonials } from "../../../api/testimonials.api";

const CaseStudiesPage = () => {
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectsRes, testimonialsRes] = await Promise.all([
          getAdminProjects(),
          getAdminTestimonials(),
        ]);

        if (!mounted) return;
        setProjects(projectsRes.data?.data || []);
        setTestimonials(testimonialsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load admin case studies data", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(
    () => [
      { label: "Case study candidates", value: projects.length, icon: FiBarChart2 },
      { label: "Client references", value: testimonials.length, icon: FiTarget },
      { label: "Delivery templates", value: 3, icon: FiTool },
    ],
    [projects.length, testimonials.length]
  );

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Case Studies CMS
        </span>
        <h2>Manage case study scaffolding</h2>
        <p className="admin-note">
          This module sets up the content and reference structure for enterprise
          case study pages.
        </p>
      </section>

      <div className="admin-trust-grid">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="admin-trust-card">
              <Icon />
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
          );
        })}
      </div>

      <section className="admin-card">
        <div className="admin-section-title">
          <div>
            <h3>Case study inputs</h3>
            <p className="admin-note">
              Projects and testimonials can be combined into future structured
              case study content.
            </p>
          </div>
        </div>

        <div className="admin-mini-grid">
          {projects.slice(0, 3).map((project) => (
            <div key={project.id} className="admin-card">
              <span className="admin-badge">{project.title}</span>
              <p className="admin-note" style={{ marginTop: "12px" }}>
                {project.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CaseStudiesPage;
