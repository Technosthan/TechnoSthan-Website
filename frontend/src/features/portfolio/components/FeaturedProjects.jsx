import './FeaturedProjects.css';

const projects = [
  {
    title: "Agritech Platform",
    category: "Web Application",
  },
  {
    title: "School ERP",
    category: "Enterprise Software",
  },
  {
    title: "Healthcare System",
    category: "Management Portal",
  },
  {
    title: "E-Commerce Store",
    category: "Online Platform",
  },
];

const FeaturedProjects = () => {
  return (
    <section className="featured-projects">

      <div className="about-container">

        <h2>Featured Projects</h2>

        <div className="projects-grid">

          {projects.map((project) => (
            <div
              key={project.title}
              className="glass-card project-card"
            >
              <h3>{project.title}</h3>

              <p>{project.category}</p>
            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default FeaturedProjects;