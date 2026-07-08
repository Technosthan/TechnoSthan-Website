import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AssignmentsProjects = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    apiClient.get("/student/my-programs").then((response) => setEnrollments(response.enrollments || []));
  }, []);

  const projects = enrollments.flatMap((enrollment) =>
    (enrollment.program?.projects || []).map((project) => ({
      ...project,
      programTitle: enrollment.program?.title,
    })),
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Student portal</p>
          <h1>Assignments / Projects</h1>
        </div>
      </div>

      <div className="grid cards-grid-2">
        {projects.length ? (
          projects.map((project) => (
            <article key={project.id} className="card glass student-card">
              <p className="badge">{project.programTitle}</p>
              <h3>{project.title}</h3>
              <p className="muted-copy">{project.description}</p>
              <p className="muted-copy">{project.tools}</p>
            </article>
          ))
        ) : (
          <div className="card glass empty-state">Assignments and project tasks will appear here once they are assigned.</div>
        )}
      </div>
    </div>
  );
};

export default AssignmentsProjects;
