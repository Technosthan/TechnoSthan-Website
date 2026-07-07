import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const response = await apiClient.get("/admin/dashboard-stats");
      setStats(response.stats);
    };

    load();
  }, []);

  const cards = [
    { label: "Users", value: stats?.users ?? "..." },
    { label: "Programs", value: stats?.programs ?? "..." },
    { label: "Enrollments", value: stats?.enrollments ?? "..." },
    { label: "Payments", value: stats?.payments ?? "..." },
    { label: "Enquiries", value: stats?.enquiries ?? "..." },
    { label: "Workshops", value: stats?.workshops ?? "..." },
    { label: "Campaigns", value: stats?.campaigns ?? "..." },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <p className="badge">Admin dashboard</p>
          <h1>Innovation Hub overview</h1>
        </div>
      </div>
      <div className="dashboard-metrics">
        {cards.map((card) => (
          <div key={card.label} className="card glass metric-card">
            <strong>{card.value}</strong>
            <span>{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
