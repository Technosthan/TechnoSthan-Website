import './ProjectCategories.css';

const ProjectCategories = () => {
  return (
    <section className="project-categories">

      <div className="about-container">

        <h2>Industries Served</h2>

        <div className="categories-grid">

          <div className="glass-card">Agriculture</div>
          <div className="glass-card">Education</div>
          <div className="glass-card">Healthcare</div>
          <div className="glass-card">Retail</div>
          <div className="glass-card">Finance</div>
          <div className="glass-card">Logistics</div>

        </div>

      </div>

    </section>
  );
};

export default ProjectCategories;