import "./ProjectCategories.css";

const ProjectCategories = () => {
  const industries = [
    "Financial Services",
    "Healthcare",
    "Manufacturing",
    "Retail & Commerce",
    "Logistics",
    "Public Sector",
  ];

  return (
    <section className="project-categories" data-motion-zone="products">
      <div className="about-container">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Industries Served
          </span>
          <h2>Industries we support</h2>
          <p>
            Technosthan builds digital systems for businesses that need
            operational clarity, compliance, and scale.
          </p>
        </div>

        <div className="categories-grid">
          {industries.map((industry) => (
            <div key={industry} className="glass-card">
              {industry}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProjectCategories;
