import React, { useEffect, useState } from "react";
import api from "../../lib/api";

const PermissionInsights = () => {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(
          "/api/admin/workspace-services/insights",
        );
        setInsights(data?.data || null);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (!insights) return <div>Loading insights...</div>;

  return (
    <div className="pi-card">
      <h3>Permission Insights</h3>
      <div>Total Global Enabled: {insights.totalGlobalEnabled}</div>
      <div>Total Global Disabled: {insights.totalGlobalDisabled}</div>
      <div>Blocked Services: {insights.blockedServices.join(", ")}</div>
    </div>
  );
};

export default PermissionInsights;
