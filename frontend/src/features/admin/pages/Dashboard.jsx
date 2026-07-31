import { useEffect, useMemo, useRef, useState } from "react";
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
  FiShare2,
  FiShield,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

import { getAdminProjects } from "../../../api/projects.api";
import { getAdminServices } from "../../../api/services.api";
import { getAdminTestimonials } from "../../../api/testimonials.api";
import { getAdminHeroVisual } from "../../../api/hero-visual.api";
import { ADMIN_ROUTE } from "../../../shared/constants";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../lib/useReducedMotion";
import "../styles/admin-dashboard.css";

const Dashboard = () => {
  const reducedMotion = useReducedMotion();
  const dashboardRef = useRef(null);
  const countRefs = useRef([]);

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
        const [productsRes, servicesRes, testimonialsRes, heroRes] =
          await Promise.all([
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

  useEffect(() => {
    if (loading || error || !dashboardRef.current) {
      return undefined;
    }

    setupGsap();

    if (reducedMotion) {
      gsap.set(dashboardRef.current.querySelectorAll("[data-admin-reveal]"), {
        autoAlpha: 1,
        y: 0,
        scale: 1,
      });
      countRefs.current.forEach((node, index) => {
        if (node) {
          node.textContent = String(
            [summary.products, summary.services, summary.activeTestimonials][index] || 0
          );
        }
      });
      return undefined;
    }

    const context = gsap.context(() => {
      const revealTargets = dashboardRef.current.querySelectorAll(
        "[data-admin-reveal]"
      );

      gsap.fromTo(
        revealTargets,
        {
          autoAlpha: 0,
          y: 18,
          scale: 0.985,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      countRefs.current.forEach((node, index) => {
        const targetValue = [
          summary.products,
          summary.services,
          summary.activeTestimonials,
        ][index];

        if (!node || typeof targetValue !== "number") {
          return;
        }

        const counter = { value: 0 };
        gsap.fromTo(
          counter,
          { value: 0 },
          {
            value: targetValue,
            duration: 0.9,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = String(Math.round(counter.value));
            },
          }
        );
      });
    }, dashboardRef);

    return () => context.revert();
  }, [
    error,
    loading,
    reducedMotion,
    summary.activeTestimonials,
    summary.products,
    summary.services,
  ]);

  const statCards = useMemo(
    () => [
      {
        icon: FiShoppingBag,
        label: "Products",
        value: summary.products,
        description: "Live product records available to visitors.",
        numeric: true,
      },
      {
        icon: FiBriefcase,
        label: "Services",
        value: summary.services,
        description: "Service records powering the public services pages.",
        numeric: true,
      },
      {
        icon: FiMessageSquare,
        label: "Testimonials",
        value: summary.activeTestimonials,
        description: "Active client testimonials on the homepage.",
        numeric: true,
      },
      {
        icon: FiBarChart2,
        label: "Hero Visual",
        value: summary.heroStatus,
        description: "Current hero visual publishing state.",
        numeric: false,
      },
      {
        icon: FiSettings,
        label: "CMS Status",
        value: summary.cmsStatus,
        description: "Content delivery and admin access are available.",
        numeric: false,
      },
      {
        icon: FiShield,
        label: "SEO Status",
        value: "Ready",
        description: "Page metadata and structured content remain manageable.",
        numeric: false,
      },
      {
        icon: FiTrendingUp,
        label: "Engagement",
        value: "Tracking",
        description: "Lead flow is tied to contact and inquiry surfaces.",
        numeric: false,
      },
    ],
    [summary.activeTestimonials, summary.cmsStatus, summary.products, summary.services, summary.heroStatus]
  );

  const quickLinks = useMemo(
    () => [
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
        label: "Manage Navbar Orbit",
        to: `${ADMIN_ROUTE}/navbar-orbit`,
        icon: FiShare2,
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
    ],
    []
  );

  return (
    <div ref={dashboardRef} className="admin-page admin-dashboard">
      <section className="admin-card admin-dashboard__hero" data-admin-reveal>
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
        <div className="admin-loading" data-admin-reveal>
          Loading dashboard overview...
        </div>
      ) : error ? (
        <div className="admin-error" data-admin-reveal>
          {error}
        </div>
      ) : (
        <>
          <div className="admin-mini-grid admin-dashboard__stats" data-admin-reveal>
            {statCards.map((card, index) => {
              const Icon = card.icon;

              return (
                <article
                  key={card.label}
                  className="admin-card admin-dashboard__stat-card"
                  data-admin-reveal
                >
                  <div className="admin-inline">
                    <span className="admin-badge">
                      <Icon />
                      {card.label}
                    </span>
                  </div>
                  {card.numeric ? (
                    <h3
                      ref={(node) => {
                        countRefs.current[index] = node;
                      }}
                    >
                      {card.value}
                    </h3>
                  ) : (
                    <h3>{card.value}</h3>
                  )}
                  <p className="admin-note">{card.description}</p>
                </article>
              );
            })}
          </div>

          <section className="admin-card" data-admin-reveal>
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
                    data-admin-reveal
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

          <section className="admin-card" data-admin-reveal>
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

