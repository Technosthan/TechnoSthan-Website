import React, { useEffect, useState } from "react";
import api from "../../lib/api";

const GlobalServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/api/admin/workspace-services");
        const settings = data?.data || {};
        // transform into array of keys
        const entries = Object.keys(settings).map((k) => ({
          key: k,
          ...settings[k],
        }));
        setServices(entries);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Loading global services...</div>;

  return (
    <div className="gs-grid">
      {services.map((s) => (
        <div key={s.key} className="gs-card">
          <div className="gs-row">
            <div className="gs-title">{s.key}</div>
            <div className="gs-toggle">
              <label className="switch">
                <input type="checkbox" checked={s.enabled} readOnly />
                <span className="slider" />
              </label>
            </div>
          </div>
          <div className="gs-desc">{s.description || ""}</div>
        </div>
      ))}
    </div>
  );
};

export default GlobalServices;
