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
      "Custom business websites and scalable web applications built with modern technologies.",
    category: "Development",
  },
  {
    iconKey: "FiSmartphone",
    title: "Mobile Apps",
    shortDescription:
      "Native and cross-platform Android & iOS applications with seamless performance.",
    category: "Development",
  },
  {
    iconKey: "FiCloud",
    title: "Cloud Solutions",
    shortDescription:
      "AWS and scalable infrastructure for enterprise-grade applications.",
    category: "Cloud & Infrastructure",
  },
  {
    iconKey: "FiCpu",
    title: "AI Solutions",
    shortDescription:
      "Automation and intelligent systems powered by machine learning.",
    category: "AI & Data",
  },
  {
    iconKey: "FiShield",
    title: "Cyber Security",
    shortDescription:
      "Enterprise-grade protection and vulnerability assessment.",
    category: "Security & Design",
  },
  {
    iconKey: "FiLayers",
    title: "UI/UX Design",
    shortDescription:
      "Modern user experiences with premium design principles.",
    category: "Security & Design",
  },
  {
    iconKey: "FiTrendingUp",
    title: "Data Analytics",
    shortDescription:
      "Insights and reporting solutions for data-driven decisions.",
    category: "AI & Data",
  },
  {
    iconKey: "FiCheckCircle",
    title: "Consulting",
    shortDescription:
      "Digital strategy, delivery planning, and product guidance.",
    category: "Strategy",
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

        <h2>Enterprise Solutions for Every Challenge</h2>

        <p>
          Comprehensive IT services tailored to transform your business and
          drive growth with measurable outcomes.
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
          <h3>Ready to get started?</h3>
          <p>
            Let&apos;s discuss how our services can transform your business.
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
