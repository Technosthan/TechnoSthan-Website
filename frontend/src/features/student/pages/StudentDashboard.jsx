import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    apiClient.get("/student/profile").then((response) => setProfile(response.user));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Student dashboard</p>
          <h1>Welcome back, {profile?.name || "student"}</h1>
        </div>
      </div>
      <div className="dashboard-metrics">
        <div className="card glass metric-card"><strong>{profile?.enrollments?.length || 0}</strong><span>Programs</span></div>
        <div className="card glass metric-card"><strong>{profile?.payments?.length || 0}</strong><span>Payments</span></div>
      </div>
    </div>
  );
};

export default StudentDashboard;
