import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiCloud,
  FiHeart,
  FiShield,
  FiShoppingBag,
  FiTrendingUp,
  FiGlobe,
} from "react-icons/fi";

import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import { getSafeImageUrl } from "../../../shared/utils";
import "./IndustriesPage.css";

const industries = [
  {
    key: "financial-services",
    title: "Financial Services",
    icon: FiTrendingUp,
    focus: "Secure platforms for lending, operations, compliance, and customer experience.",
    outcome: "Trustworthy systems that support growth and regulatory discipline.",
    keywords: ["Cloud", "Security", "Data"],
  },
  {
    key: "healthcare",
    title: "Healthcare",
    icon: FiHeart,
    focus: "Patient portals, operations tools, and healthcare workflows that reduce friction.",
    outcome: "Clearer journeys across care, billing, and service delivery.",
    keywords: ["Web Development", "Mobile App Development", "UI/UX Design"],
  },
  {
    key: "manufacturing",
    title: "Manufacturing",
    icon: FiBriefcase,
    focus: "Connected systems for operations visibility, production tracking, and reporting.",
    outcome: "Sharper visibility across plants, processes, and supply chains.",
    keywords: ["DevOps", "Data Analytics", "Cloud Solutions"],
  },
  {
    key: "retail-commerce",
    title: "Retail & Commerce",
    icon: FiShoppingBag,
    focus: "Commerce and retail systems that improve conversion and operations.",
    outcome: "Better customer journeys and cleaner commercial execution.",
    keywords: ["Web Development", "Retail & Ecommerce", "AI Automation"],
  },
  {
    key: "logistics",
    title: "Logistics",
    icon: FiGlobe,
    focus: "Dispatch, tracking, planning, and customer visibility for modern logistics.",
    outcome: "Reliable coordination across moving parts and moving assets.",
    keywords: ["Cloud Solutions", "Data Analytics", "Mobile App Development"],
  },
  {
    key: "public-sector",
    title: "Public Sector",
    icon: FiShield,
    focus: "Accessible citizen services and dependable internal systems.",
    outcome: "Service experiences that strengthen trust and responsiveness.",
    keywords: ["Cybersecurity", "UI/UX Design", "Web Development"],
  },
];

const IndustriesPage = () => {
  const [services, setServices] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [servicesRes, projectsRes] = await Promise.all([
          getServices(),
          getProjects(),
        ]);

        if (!mounted) return;

        setServices(servicesRes.data?.data || []);
        setProjects(projectsRes.data?.data || []);
      } catch (error) {
        console.error("Failed to load industry content", error);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const featuredProjects = useMemo(
    () =>
      projects
        .filter((project) => project.isActive !== false)
        .slice(0, 3),
    [projects]
  );

  const serviceTitles = useMemo(
    () => services.map((service) => service.title),
    [services]
  );

  return (
    <div className="industry-page">
      <section className="industry-hero">
        <div className="about-container">
          <span className="section-badge">
            <span className="badge-dot" />
            Industries
          </span>
          <h1>Industry solutions built for enterprise delivery</h1>
          <p>
            Technosthan aligns services, software, and delivery teams around
            the operating realities of each market we support.
          </p>

          <div className="industry-hero-stats">
            <article className="glass-card">
              <strong>{industries.length}</strong>
              <span>Primary sectors</span>
            </article>
            <article className="glass-card">
              <strong>{serviceTitles.length}</strong>
              <span>Live service capabilities</span>
            </article>
            <article className="glass-card">
              <strong>{featuredProjects.length}</strong>
              <span>Featured products</span>
            </article>
          </div>
        </div>
      </section>

      <section className="industry-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Sector Map
          </span>
          <h2>Industries we actively support</h2>
          <p>
            Each sector card connects to the service capabilities most often
            used to solve that type of business problem.
          </p>
        </div>

        <div className="industry-grid">
          {industries.map((industry) => {
            const Icon = industry.icon;
            const relatedServices = services
              .filter((service) =>
                industry.keywords.some((keyword) =>
                  String(service.category || service.title)
                    .toLowerCase()
                    .includes(keyword.toLowerCase())
                )
              )
              .slice(0, 3);

            return (
              <article key={industry.key} className="industry-card">
                <div className="industry-card-icon">
                  <Icon size={22} />
                </div>
                <h3>{industry.title}</h3>
                <p>{industry.focus}</p>
                <p className="industry-card-outcome">{industry.outcome}</p>

                <div className="industry-related">
                  {relatedServices.length > 0 ? (
                    relatedServices.map((service) => (
                      <span key={service.id} className="industry-chip">
                        {service.title}
                      </span>
                    ))
                  ) : (
                    <span className="industry-chip">Enterprise Consulting</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="industry-section">
        <div className="section-header">
          <span className="section-badge">
            <span className="badge-dot" />
            Product Context
          </span>
          <h2>Selected work relevant to industries</h2>
          <p>
            The products below demonstrate how we approach industry-specific
            delivery with a reusable enterprise mindset.
          </p>
        </div>

        <div className="industry-feature-grid">
          {featuredProjects.map((project) => {
            const imageUrl = getSafeImageUrl(project.imageUrl);

            return (
              <article key={project.id} className="industry-feature-card">
                <div className="industry-feature-media">
                  {imageUrl ? (
                    <img src={imageUrl} alt={project.title} loading="lazy" />
                  ) : null}
                </div>
                <div className="industry-feature-copy">
                  <span className="project-card-category">Enterprise Delivery</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="industry-cta">
        <div className="about-container">
          <h2>Need an industry-specific solution?</h2>
          <p>
            We can shape services, software, and delivery around the operating
            realities of your market.
          </p>
          <Link to="/contact" className="btn-primary">
            Talk to sales <FiArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default IndustriesPage;
