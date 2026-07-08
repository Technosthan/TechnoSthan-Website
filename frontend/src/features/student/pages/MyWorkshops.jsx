import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const MyWorkshops = () => {
  const [workshops, setWorkshops] = useState([]);

  useEffect(() => {
    apiClient.get("/workshops").then((response) => setWorkshops(response.workshops || []));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Student portal</p>
          <h1>My Workshops</h1>
        </div>
      </div>

      <div className="grid cards-grid-2">
        {workshops.slice(0, 6).map((workshop) => (
          <article key={workshop.id} className="card glass student-card">
            <p className="badge">{workshop.mode}</p>
            <h3>{workshop.title}</h3>
            <p className="muted-copy">{workshop.description}</p>
            <p className="muted-copy">{workshop.date ? new Date(workshop.date).toLocaleDateString("en-IN") : "Upcoming"}</p>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyWorkshops;
