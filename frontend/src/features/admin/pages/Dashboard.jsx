import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiImage,
  FiMessageSquare,
  FiShoppingBag,
} from "react-icons/fi";

import {
  getAdminProjects,
} from "../../../api/projects.api";
import {
  getAdminTestimonials,
} from "../../../api/testimonials.api";
import {
  getAdminHeroVisual,
} from "../../../api/hero-visual.api";
import { ADMIN_ROUTE } from "../../../shared/constants";

const Dashboard = () => {
  const [summary, setSummary] = useState({
    products: 0,
    activeTestimonials: 0,
    heroStatus: "Loading...",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [productsRes, testimonialsRes, heroRes] =
          await Promise.all([
            getAdminProjects(),
            getAdminTestimonials(),
            getAdminHeroVisual(),
          ]);

        if (!mounted) return;

        const products =
          productsRes.data?.data?.length || 0;
        const testimonials =
          testimonialsRes.data?.data || [];
        const heroSetting = heroRes.data?.data?.setting;

        setSummary({
          products,
          activeTestimonials: testimonials.filter(
            (item) => item.isActive
          ).length,
          heroStatus: heroSetting
            ? heroSetting.isActive
              ? "Active"
              : "Inactive"
            : "Not configured",
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
      label: "Manage Testimonials",
      to: `${ADMIN_ROUTE}/testimonials`,
      icon: FiMessageSquare,
    },
    {
      label: "Manage Hero Visual",
      to: `${ADMIN_ROUTE}/hero-visual`,
      icon: FiImage,
    },
  ];

  return (
    <div className="admin-page">
      <section className="admin-card">
        {/* <span className="section-badge">Overview</span> */}
        <h2>Welcome to the content workspace</h2>
        <p className="admin-note">
          Manage the public site, keep media up to date, and
          review the live content surface from one place.
        </p>
      </section>

      {loading ? (
        <div className="admin-loading">
          Loading dashboard overview...
        </div>
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
          </div>

          <section className="admin-card">
            <div className="admin-section-title">
              <div>
                <h3>Quick links</h3>
                <p className="admin-note">
                  Jump straight into the existing management
                  pages.
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
        </>
      )}
    </div>
  );
};

export default Dashboard;
