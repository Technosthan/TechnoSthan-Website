import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiBriefcase,
  FiCheckCircle,
  FiClipboard,
  FiImage,
  FiLayers,
  FiMessageSquare,
  FiSettings,
  FiShoppingBag,
  FiShield,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { getAdminProjects } from "../../../api/projects.api";
import { getAdminServices } from "../../../api/services.api";
import { getAdminTestimonials } from "../../../api/testimonials.api";
import { getAdminHeroVisual } from "../../../api/hero-visual.api";
import { ADMIN_ROUTE } from "../../../shared/constants";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    products: 0,
    services: 0,
    activeTestimonials: 0,
    heroStatus: "Loading...",
    cmsStatus: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [
          productsRes,
          servicesRes,
          testimonialsRes,
          heroRes,
        ] = await Promise.all([
          getAdminProjects(),
          getAdminServices(),
          getAdminTestimonials(),
          getAdminHeroVisual(),
        ]);

        if (!mounted) return;

        const products = productsRes.data?.data?.length || 0;
        const services = servicesRes.data?.data?.length || 0;
        const testimonials = testimonialsRes.data?.data || [];
        const heroSetting = heroRes.data?.data?.setting;

        setSummary({
          products,
          services,
          activeTestimonials: testimonials.filter((item) => item.isActive).length,
          heroStatus: heroSetting
            ? heroSetting.isActive
              ? "Active"
              : "Inactive"
            : "Not configured",
          cmsStatus: "Online",
        });
      } catch (err) {
        if (!mounted) return;
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load admin overview."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const quickLinks = [
    {
      label: "Manage Products",
      to: `${ADMIN_ROUTE}/products`,
      icon: FiShoppingBag,
    },
    {
      label: "Manage Services",
      to: `${ADMIN_ROUTE}/services`,
      icon: FiBriefcase,
    },
    {
      label: "Manage Testimonials",
      to: `${ADMIN_ROUTE}/testimonials`,
      icon: FiMessageSquare,
    },
    {
      label: "Manage Hero Visual",
      to: `${ADMIN_ROUTE}/hero-visual`,
      icon: FiImage,
    },
    {
      label: "Manage Industries",
      to: `${ADMIN_ROUTE}/industries`,
      icon: FiLayers,
    },
    {
      label: "Manage Case Studies",
      to: `${ADMIN_ROUTE}/case-studies`,
      icon: FiTrendingUp,
    },
    {
      label: "Manage Technology",
      to: `${ADMIN_ROUTE}/technology`,
      icon: FiShield,
    },
    {
      label: "Manage Leads",
      to: `${ADMIN_ROUTE}/leads`,
      icon: FiUsers,
    },
    {
      label: "Media Library",
      to: `${ADMIN_ROUTE}/media-library`,
      icon: FiImage,
    },
    {
      label: "SEO Manager",
      to: `${ADMIN_ROUTE}/seo`,
      icon: FiSettings,
    },
  ];

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Enterprise CMS
        </span>
        <h2>Welcome to the Technosthan control room</h2>
        <p className="admin-note">
          Manage public content, review live signals, and keep the website
          aligned with the enterprise brand.
        </p>
      </section>

      {loading ? (
        <div className="admin-loading">Loading dashboard overview...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <>
          <div className="admin-mini-grid">
            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiShoppingBag />
                  Products
                </span>
              </div>
              <h3>{summary.products}</h3>
              <p className="admin-note">
                Live product records available to visitors.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiBriefcase />
                  Services
                </span>
              </div>
              <h3>{summary.services}</h3>
              <p className="admin-note">
                Service records powering the public services pages.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiMessageSquare />
                  Testimonials
                </span>
              </div>
              <h3>{summary.activeTestimonials}</h3>
              <p className="admin-note">
                Active client testimonials on the homepage.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiBarChart2 />
                  Hero Visual
                </span>
              </div>
              <h3>{summary.heroStatus}</h3>
              <p className="admin-note">
                Current hero visual publishing state.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiSettings />
                  CMS Status
                </span>
              </div>
              <h3>{summary.cmsStatus}</h3>
              <p className="admin-note">
                Content delivery and admin access are available.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiShield />
                  SEO Status
                </span>
              </div>
              <h3>Ready</h3>
              <p className="admin-note">
                Page metadata and structured content remain manageable.
              </p>
            </div>

            <div className="admin-card">
              <div className="admin-inline">
                <span className="admin-badge">
                  <FiTrendingUp />
                  Engagement
                </span>
              </div>
              <h3>Tracking</h3>
              <p className="admin-note">
                Lead flow is tied to contact and inquiry surfaces.
              </p>
            </div>
          </div>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Quick actions</h3>
                <p className="admin-note">
                  Jump straight into the most-used management pages.
                </p>
              </div>
            </div>

            <div className="admin-mini-grid">
              {quickLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="admin-card admin-quick-link"
                  >
                    <div className="admin-inline">
                      <span className="admin-badge">
                        <Icon />
                        {item.label}
                      </span>
                      <FiArrowRight />
                    </div>
                    <p className="admin-note">
                      Open the {item.label.toLowerCase()} page.
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Operational snapshot</h3>
                <p className="admin-note">
                  A quick view of the content system and current publishing
                  surface.
                </p>
              </div>
            </div>

            <div className="admin-trust-grid">
              <div className="admin-trust-card">
                <FiClipboard />
                <strong>Website Health</strong>
                <span>Stable</span>
              </div>
              <div className="admin-trust-card">
                <FiLayers />
                <strong>Content Modules</strong>
                <span>Active</span>
              </div>
              <div className="admin-trust-card">
                <FiCheckCircle />
                <strong>Publishing</strong>
                <span>Ready</span>
              </div>
              <div className="admin-trust-card">
                <FiUsers />
                <strong>Lead Routing</strong>
                <span>Configured</span>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
