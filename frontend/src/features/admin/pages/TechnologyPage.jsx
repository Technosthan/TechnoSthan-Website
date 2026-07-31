import { useEffect, useMemo, useState } from "react";
import { FiCode, FiCloud, FiDatabase, FiShield } from "react-icons/fi";
import { getAdminServices } from "../../../api/services.api";

const technologyPillars = [
  { title: "Frontend", icon: FiCode },
  { title: "Cloud", icon: FiCloud },
  { title: "Data", icon: FiDatabase },
  { title: "Security", icon: FiShield },
];

const TechnologyPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getAdminServices();
        if (!mounted) return;
        setServices(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load admin technology data", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const grouped = useMemo(
    () =>
      technologyPillars.map((pillar) => ({
        ...pillar,
        count: services.filter((service) =>
          String(service.category || service.title)
            .toLowerCase()
            .includes(pillar.title.toLowerCase())
        ).length,
      })),
    [services]
  );

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Technology CMS
        </span>
        <h2>Manage technology mapping</h2>
        <p className="admin-note">
          This module is ready for technology stack taxonomy, service mapping,
          and future knowledge-base content.
        </p>
      </section>

      <div className="admin-trust-grid">
        {grouped.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="admin-trust-card">
              <Icon />
              <strong>{item.title}</strong>
              <span>{item.count} matching services</span>
            </div>
          );
        })}
      </div>

      <section className="admin-card">
        <div className="admin-section-title">
          <div>
            <h3>Technology taxonomy</h3>
            <p className="admin-note">
              Match technology categories to services, case studies, and future
              documentation.
            </p>
          </div>
        </div>

        <div className="admin-mini-grid">
          {services.slice(0, 6).map((service) => (
            <div key={service.id} className="admin-card">
              <span className="admin-badge">{service.title}</span>
              <p className="admin-note" style={{ marginTop: "12px" }}>
                {service.category}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TechnologyPage;
