import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiCode,
  FiCloud,
  FiDatabase,
  FiLayers,
  FiLock,
  FiSmartphone,
  FiServer,
  FiShield,
  FiTool,
  FiTrendingUp,
} from "react-icons/fi";

import { getServices } from "../../../api/services.api";
import { getIconComponent } from "../../../shared/utils";
import "./TechnologyPage.css";

const technologyPillars = [
  {
    key: "frontend",
    title: "Frontend",
    icon: FiCode,
    description: "Interface systems, design systems, and product experiences.",
    keywords: ["Web Development", "UI/UX Design"],
  },
  {
    key: "backend",
    title: "Backend",
    icon: FiServer,
    description: "Application logic, APIs, integrations, and services.",
    keywords: ["Web Development", "Cloud Solutions"],
  },
  {
    key: "cloud",
    title: "Cloud",
    icon: FiCloud,
    description: "Hosting, deployment, and cloud architecture.",
    keywords: ["Cloud Solutions", "DevOps"],
  },
  {
    key: "database",
    title: "Database",
    icon: FiDatabase,
    description: "Data modeling, storage, and reporting foundations.",
    keywords: ["Data Analytics"],
  },
  {
    key: "devops",
    title: "DevOps",
    icon: FiTool,
    description: "Delivery pipelines, release automation, and monitoring.",
    keywords: ["DevOps"],
  },
  {
    key: "ai",
    title: "AI",
    icon: FiTrendingUp,
    description: "Automation, intelligence, and decision support.",
    keywords: ["AI Automation", "Data Analytics"],
  },
  {
    key: "security",
    title: "Security",
    icon: FiShield,
    description: "Identity, threat controls, and secure operations.",
    keywords: ["Cybersecurity"],
  },
  {
    key: "mobile",
    title: "Mobile",
    icon: FiSmartphone,
    description: "Native and cross-platform client applications.",
    keywords: ["Mobile App Development"],
  },
  {
    key: "cms",
    title: "CMS",
    icon: FiLayers,
    description: "Content workflows, page controls, and editorial operations.",
    keywords: ["UI/UX Design", "Web Development"],
  },
  {
    key: "infrastructure",
    title: "Infrastructure",
    icon: FiLock,
    description: "Operations hardening, access patterns, and resilience.",
    keywords: ["Cloud Solutions", "DevOps", "Cybersecurity"],
  },
];

const TechnologyPage = () => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const response = await getServices();
        if (!mounted) return;
        setServices(response.data?.data || []);
      } catch (error) {
        console.error("Failed to load technology data", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="technology-page">
      <section className="technology-hero">
        <div className="about-container">
          <span className="section-badge">
            <span className="badge-dot" />
            Technology
          </span>
          <h1>Technology stacks that support enterprise delivery</h1>
          <p>
            Our technology architecture is organized around capabilities that
            support modern software, cloud, and AI-led transformation.
          </p>
        </div>
      </section>

      <section className="technology-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Core Stack
          </span>
          <h2>Technology pillars we align to</h2>
          <p>
            Each pillar maps to live service capabilities so the page stays
            rooted in the current CMS catalog.
          </p>
        </div>

        <div className="technology-grid">
          {technologyPillars.map((pillar) => {
            const Icon = pillar.icon;
            const relatedServices = pillar.keywords
              .map((keyword) =>
                services.find((service) =>
                  service.title.toLowerCase().includes(keyword.toLowerCase())
                )
              )
              .filter(Boolean);

            return (
              <article key={pillar.key} className="technology-card">
                <div className="technology-card-icon">
                  <Icon size={22} />
                </div>
                <h3>{pillar.title}</h3>
                <p>{pillar.description}</p>
                <div className="technology-related">
                  {relatedServices.length > 0 ? (
                    relatedServices.map((service) => {
                      const ServiceIcon = getIconComponent(service.iconKey);
                      return (
                        <span key={service.id} className="technology-chip">
                          <ServiceIcon size={12} />
                          {service.title}
                        </span>
                      );
                    })
                  ) : (
                    <span className="technology-chip">Enterprise readiness</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="technology-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Delivery Mapping
          </span>
          <h2>How the stack supports the service catalog</h2>
        </div>

        <div className="technology-stack-list">
          {services.slice(0, 6).map((service) => {
            const Icon = getIconComponent(service.iconKey);
            return (
              <article key={service.id} className="technology-stack-item">
                <div className="technology-stack-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <strong>{service.title}</strong>
                  <p>{service.shortDescription}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="technology-cta">
        <div className="about-container">
          <h2>Need to align on your technology roadmap?</h2>
          <p>
            We can map your business goals to the right stack, delivery model,
            and operating structure.
          </p>
          <Link to="/contact" className="btn-primary">
            Start the conversation <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TechnologyPage;
