import { useEffect, useMemo, useState } from "react";
import { FiGlobe, FiLayers, FiTrendingUp } from "react-icons/fi";
import { getAdminServices } from "../../../api/services.api";
import { getAdminProjects } from "../../../api/projects.api";

const industryGroups = [
  "Financial Services",
  "Healthcare",
  "Manufacturing",
  "Retail & Commerce",
  "Logistics",
  "Public Sector",
];

const IndustriesPage = () => {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [servicesRes, projectsRes] = await Promise.all([
          getAdminServices(),
          getAdminProjects(),
        ]);

        if (!mounted) return;
        setServices(servicesRes.data?.data || []);
        setProjects(projectsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load admin industries data", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(
    () => [
      { label: "Industry groups", value: industryGroups.length, icon: FiGlobe },
      { label: "Service records", value: services.length, icon: FiLayers },
      { label: "Featured products", value: projects.length, icon: FiTrendingUp },
    ],
    [projects.length, services.length]
  );

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Industries CMS
        </span>
        <h2>Manage industry mappings</h2>
        <p className="admin-note">
          This is the scaffold for industry-aware content mapping across
          services, products, and future case studies.
        </p>
      </section>

      <div className="admin-trust-grid">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="admin-trust-card">
              <Icon />
              <strong>{item.label}</strong>
              <span>{item.value}</span>
            </div>
          );
        })}
      </div>

      <section className="admin-card">
        <div className="admin-section-title">
          <div>
            <h3>Industry groups</h3>
            <p className="admin-note">
              Enterprise sectors that can be mapped to content and service
              clusters.
            </p>
          </div>
        </div>

        <div className="admin-mini-grid">
          {industryGroups.map((group) => (
            <div key={group} className="admin-card">
              <span className="admin-badge">{group}</span>
              <p className="admin-note" style={{ marginTop: "12px" }}>
                Ready for CMS mapping, landing page content, and related
                service assignments.
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default IndustriesPage;
