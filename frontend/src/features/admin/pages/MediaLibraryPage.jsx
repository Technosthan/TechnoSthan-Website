import { useEffect, useMemo, useState } from "react";
import { FiImage, FiLayers, FiRefreshCw } from "react-icons/fi";
import { getAdminProjects } from "../../../api/projects.api";
import { getAdminTestimonials } from "../../../api/testimonials.api";
import { getAdminHeroVisual } from "../../../api/hero-visual.api";
import { getSafeImageUrl } from "../../../shared/utils";

const MediaLibraryPage = () => {
  const [projects, setProjects] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectsRes, testimonialsRes, heroRes] = await Promise.all([
          getAdminProjects(),
          getAdminTestimonials(),
          getAdminHeroVisual(),
        ]);

        if (!mounted) return;

        setProjects(projectsRes.data?.data || []);
        setTestimonials(testimonialsRes.data?.data || []);
        setHero(heroRes.data?.data?.setting || null);
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

  const assets = useMemo(() => {
    const projectAssets = projects
      .filter((item) => item.imageUrl)
      .map((item) => ({
        id: item.id,
        title: item.title,
        type: "Project Image",
        url: item.imageUrl,
      }));

    const testimonialAssets = testimonials
      .filter((item) => item.imageUrl)
      .map((item) => ({
        id: item.id,
        title: item.clientName,
        type: "Testimonial Image",
        url: item.imageUrl,
      }));

    const heroAssets = hero?.mainImageUrl
      ? [
          {
            id: hero.id || "hero-main",
            title: hero.mainImageAlt || "Hero image",
            type: "Hero Visual",
            url: hero.mainImageUrl,
          },
        ]
      : [];

    return [...heroAssets, ...projectAssets, ...testimonialAssets];
  }, [hero, projects, testimonials]);

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          Media Library
        </span>
        <h2>Enterprise asset library</h2>
        <p className="admin-note">
          This library reuses project, testimonial, and hero assets already
          stored in the CMS so teams can audit available media at a glance.
        </p>
      </section>

      <div className="admin-trust-grid">
        <div className="admin-trust-card">
          <FiImage />
          <strong>Visible assets</strong>
          <span>{assets.length}</span>
        </div>
        <div className="admin-trust-card">
          <FiLayers />
          <strong>Content sources</strong>
          <span>Projects, testimonials, hero visual</span>
        </div>
        <div className="admin-trust-card">
          <FiRefreshCw />
          <strong>Reusable</strong>
          <span>Ready for future DAM expansion</span>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading media assets...</div>
      ) : (
        <section className="admin-card">
          <div className="admin-section-title">
            <div>
              <h3>Available assets</h3>
              <p className="admin-note">
                Images currently powering live sections of the website.
              </p>
            </div>
          </div>

          {assets.length === 0 ? (
            <div className="admin-empty">No reusable media found yet.</div>
          ) : (
            <div className="admin-mini-grid">
              {assets.map((asset) => {
                const src = getSafeImageUrl(asset.url);
                return (
                  <article key={`${asset.type}-${asset.id}`} className="admin-card">
                    <div className="admin-image-preview">
                      <img src={src} alt={asset.title} />
                    </div>
                    <div className="admin-inline" style={{ marginTop: "14px" }}>
                      <span className="admin-badge">{asset.type}</span>
                      <span className="admin-note">{asset.title}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default MediaLibraryPage;
