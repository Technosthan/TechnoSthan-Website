import { useMemo, useState } from "react";
import {
  FiBookOpen,
  FiGlobe,
  FiLink,
  FiSearch,
  FiShare2,
} from "react-icons/fi";

const pageTemplates = [
  {
    key: "home",
    title: "Home",
    slug: "/",
    description: "Enterprise IT services and digital transformation homepage.",
  },
  {
    key: "services",
    title: "Services",
    slug: "/services",
    description: "Detailed service catalog and capability overview.",
  },
  {
    key: "products",
    title: "Products",
    slug: "/products",
    description: "Enterprise software and platform showcase.",
  },
  {
    key: "industries",
    title: "Industries",
    slug: "/industries",
    description: "Sector-aligned delivery and business context.",
  },
  {
    key: "case-studies",
    title: "Case Studies",
    slug: "/case-studies",
    description: "Delivery stories, results, and client proof.",
  },
  {
    key: "technology",
    title: "Technology",
    slug: "/technology",
    description: "Technology stack and capability architecture.",
  },
  {
    key: "contact",
    title: "Contact",
    slug: "/contact",
    description: "Enterprise inquiry and consultation page.",
  },
];

const SeoManagerPage = () => {
  const [selectedPage, setSelectedPage] = useState(pageTemplates[0]);

  const metaPreview = useMemo(
    () => ({
      title: `${selectedPage.title} | Technosthan`,
      description: selectedPage.description,
      canonical: `https://technosthan.com${selectedPage.slug}`,
    }),
    [selectedPage]
  );

  return (
    <div className="admin-page">
      <section className="admin-card">
        <span className="section-badge">
          <span className="badge-dot" />
          SEO CMS
        </span>
        <h2>Structured SEO and metadata workspace</h2>
        <p className="admin-note">
          This module sets the foundation for editable page metadata, OG
          content, and future structured data support.
        </p>
      </section>

      <div className="admin-trust-grid">
        <div className="admin-trust-card">
          <FiSearch />
          <strong>Search</strong>
          <span>Meta titles and descriptions</span>
        </div>
        <div className="admin-trust-card">
          <FiShare2 />
          <strong>Social</strong>
          <span>OG and Twitter card ready</span>
        </div>
        <div className="admin-trust-card">
          <FiLink />
          <strong>Routing</strong>
          <span>Slug and canonical structure</span>
        </div>
      </div>

      <div className="admin-grid">
        <section className="admin-card">
          <div className="admin-section-title">
            <div>
              <h3>Page templates</h3>
              <p className="admin-note">
                Pick a page to preview the metadata pattern that should apply.
              </p>
            </div>
          </div>

          <div className="admin-mini-grid">
            {pageTemplates.map((page) => (
              <button
                key={page.key}
                type="button"
                className="admin-card admin-quick-link"
                onClick={() => setSelectedPage(page)}
              >
                <div className="admin-inline">
                  <span className="admin-badge">
                    <FiBookOpen />
                    {page.title}
                  </span>
                </div>
                <p className="admin-note">{page.slug}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="admin-preview-panel">
          <div className="admin-section-title">
            <h3>Metadata preview</h3>
            <span className="admin-note">Current template</span>
          </div>

          <div className="admin-heading-preview">
            <div className="admin-inline">
              <span className="admin-badge">
                <FiGlobe />
                SEO preview
              </span>
            </div>
            <h4>{metaPreview.title}</h4>
            <p className="admin-note">{metaPreview.description}</p>
            <p className="admin-note">Canonical: {metaPreview.canonical}</p>
            <p className="admin-note">
              Schema: Organization, WebSite, BreadcrumbList
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SeoManagerPage;
