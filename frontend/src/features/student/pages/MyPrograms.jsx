import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";
import { Link } from "react-router-dom";

const MyPrograms = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    apiClient.get("/student/my-programs").then((response) => setEnrollments(response.enrollments || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>My Programs</h1></div>
      <div className="grid cards-grid-2">
        {enrollments.map((enrollment) => (
          <article key={enrollment.id} className="card glass">
            <p className="badge">{enrollment.status}</p>
            <h3>{enrollment.program?.title}</h3>
            <p className="muted-copy">{enrollment.program?.shortDescription}</p>
            <Link to={`/programs/${enrollment.program?.slug}`} className="btn btn-secondary">View program</Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyPrograms;
