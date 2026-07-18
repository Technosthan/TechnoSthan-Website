import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiCode } from "react-icons/fi";
import useServices from "../../services/hooks/useServices";
import { getIconComponent } from "../../../shared/utils";
import "./services.css";

const fallbackServices = [
  {
    iconKey: "FiCode",
    title: "Web Development",
    shortDescription:
      "Enterprise websites and web platforms engineered for scale, security, and performance.",
    category: "Development",
  },
  {
    iconKey: "FiSmartphone",
    title: "Mobile Applications",
    shortDescription:
      "Native and cross-platform Android and iOS products for enterprise teams and customers.",
    category: "Development",
  },
  {
    iconKey: "FiCloud",
    title: "Cloud Solutions",
    shortDescription:
      "Cloud architecture, migration, and operations designed for modern enterprises.",
    category: "Cloud & Infrastructure",
  },
  {
    iconKey: "FiCpu",
    title: "AI Solutions",
    shortDescription:
      "Applied AI, automation, and workflow intelligence that improves decision-making.",
    category: "AI & Data",
  },
  {
    iconKey: "FiShield",
    title: "Cyber Security",
    shortDescription:
      "Security assessments, hardening, and governance for business-critical systems.",
    category: "Security & Design",
  },
  {
    iconKey: "FiLayers",
    title: "UI/UX Design",
    shortDescription:
      "Enterprise interface design that improves usability and adoption.",
    category: "Security & Design",
  },
  {
    iconKey: "FiTrendingUp",
    title: "Data Analytics",
    shortDescription:
      "Reporting and analytics that turn operational data into action.",
    category: "AI & Data",
  },
  {
    iconKey: "FiCheckCircle",
    title: "Technology Consulting",
    shortDescription:
      "Enterprise roadmaps, modernization planning, and delivery guidance.",
    category: "Consulting",
  },
];

const ServicesPreview = () => {
  const navigate = useNavigate();
  const { services } = useServices();

  const visibleServices = useMemo(() => {
    const source = services?.length ? services : fallbackServices;

    return source
      .filter((service) => service.isActive !== false)
      .slice(0, 8);
  }, [services]);

  return (
    <section className="services-preview">
      <div className="section-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Our Services
        </span>

        <h2>Enterprise Services Built for Business Outcomes</h2>

        <p>
          Comprehensive IT services tailored for transformation, resilience,
          and long-term enterprise growth.
        </p>
      </div>

      <div className="services-grid">
        {visibleServices.map((service, index) => {
          const IconComponent = service.iconImageUrl
            ? null
            : getIconComponent(service.iconKey);

          return (
            <article key={service.id || service.title} className="service-card">
              <div className="icon-glow" />
              <div className="service-card-top">
                <div className="icon-container">
                  {IconComponent ? (
                    <IconComponent size={28} />
                  ) : (
                    <FiCode size={28} />
                  )}
                </div>
                <span className="service-category">
                  {service.category || "Service"}
                </span>
              </div>

              <h3>{service.title}</h3>
              <p>
                {service.shortDescription ||
                  service.description ||
                  "Premium digital delivery for modern businesses."}
              </p>

              <button
                type="button"
                className="service-card-link"
                onClick={() =>
                  navigate(service.route || "/services")
                }
              >
                View Details
                <FiArrowRight size={18} />
              </button>

              <div className="card-glow" />
            </article>
          );
        })}
      </div>

      <div className="services-cta">
        <div className="services-cta-copy">
          <h3>Ready to scope an enterprise engagement?</h3>
          <p>
            Let&apos;s discuss delivery goals, timelines, and the right engagement
            model for your organization.
          </p>
        </div>

        <div className="services-cta-actions">
          <button
            className="btn-primary"
            onClick={() => navigate("/contact")}
            type="button"
          >
            Schedule Consultation
          </button>
          <button
            className="btn-secondary"
            onClick={() => navigate("/services")}
            type="button"
          >
            Explore Services
          </button>
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
