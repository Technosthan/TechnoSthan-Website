import { useEffect, useState } from "react";
import "./FeaturedProjects.css";

import { getProjects } from "../../../api/projects.api";

const FeaturedProjects = () => {
const [projects, setProjects] = useState([]);

useEffect(() => {
const fetchProjects = async () => {
try {
const response = await getProjects();
setProjects(response.data.data);
} catch (error) {
console.error("Failed to fetch projects:", error);
}
};


fetchProjects();


}, []);

return ( <section className="featured-projects"> <div className="about-container">


    <h2>Featured Projects</h2>

    <div className="projects-grid">

      {projects.length > 0 ? (
        projects.map((project) => (
          <div
            key={project.id}
            className="glass-card project-card"
          >
            <h3>{project.title}</h3>

            <p>{project.description}</p>
          </div>
        ))
      ) : (
        <p>No Projects Found</p>
      )}

    </div>

  </div>
</section>


);
};

export default FeaturedProjects;
