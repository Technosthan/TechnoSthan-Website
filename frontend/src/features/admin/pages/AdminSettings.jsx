import { useEffect, useState } from "react";
import { apiClient } from "../../../shared/services/apiClient";

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    apiClient.get("/admin/settings").then((response) => setSettings(response.settings));
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header"><h1>Settings</h1></div>
      <div className="card glass">
        <pre className="settings-pre">{JSON.stringify(settings, null, 2)}</pre>
      </div>
    </div>
  );
};

export default AdminSettings;
