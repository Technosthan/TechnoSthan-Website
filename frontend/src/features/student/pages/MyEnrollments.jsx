import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    apiClient.get("/student/my-programs").then((response) => setEnrollments(response.enrollments || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Student portal</p>
          <h1>My Enrollments</h1>
        </div>
      </div>

      <div className="grid cards-grid-2">
        {enrollments.map((enrollment) => (
          <article key={enrollment.id} className="card glass student-card">
            <p className="badge">{enrollment.status}</p>
            <h3>{enrollment.program?.title}</h3>
            <p className="muted-copy">{enrollment.program?.shortDescription}</p>
            <p className="muted-copy">Payment status: {enrollment.paymentStatus}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyEnrollments;
