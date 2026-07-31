import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiFilter,
  FiRefreshCcw,
  FiSearch,
} from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import MagneticButton from "../../../components/motion/MagneticButton";
import useReducedMotion from "../../../hooks/useReducedMotion";
import useProductsCatalog from "../hooks/useProductsCatalog";
import ProductEnterpriseBackground from "../components/ProductEnterpriseBackground";
import ProductMedia from "../components/ProductMedia";
import {
  buildProductFilters,
  filterProducts,
  getProductFocusLabel,
  getProductMetricSnippets,
  getProductNarrative,
  getProductRelatedProjects,
  getProductRelatedServices,
  getProductThemes,
  normalizeText,
} from "../data/productsData";
import { syncProductsHead } from "../utils/head";
import "../styles/products-enterprise.css";

const CANONICAL =
  typeof window !== "undefined" ? `${window.location.origin}/products` : "/products";

const PAGE_TITLE = "Products | TechnoSthan";
const PAGE_DESCRIPTION =
  "Explore TechnoSthan product records through a premium enterprise catalog built from the live CMS data.";

const ProductMetricCard = ({ value, label, note }) => (
  <article className="products-enterprise__metric-card">
    <span className="products-enterprise__metric-note">{note}</span>
    <strong className="products-enterprise__metric-value" data-products-count={value}>
      0
    </strong>
    <span className="products-enterprise__metric-label">{label}</span>
  </article>
);

const ProductThemeList = ({ themes, fallback = "Enterprise product" }) => {
  if (!themes || themes.length === 0) {
    return <span className="products-enterprise__chip">{fallback}</span>;
  }

  return themes.map((theme) => (
    <span key={theme.key} className="products-enterprise__chip">
      {theme.label}
    </span>
  ));
};

const ProductCard = ({ product, index, lead = false }) => {
  const themes = getProductThemes(product);
  const relativeIndex = String(index + 1).padStart(2, "0");
  const focusLabel = getProductFocusLabel(product);

  return (
    <article
      className={`products-enterprise__card products-enterprise__card--${
        lead ? "lead" : index % 4 === 0 ? "wide" : index % 4 === 1 ? "tall" : index % 4 === 2 ? "compact" : "stacked"
      }`}
      data-products-card
    >
      <Link
        to={product.route}
        className="products-enterprise__card-mediaLink"
        aria-label={`Open product detail for ${product.title}`}
      >
        <ProductMedia product={product} eager={lead} className="products-enterprise__card-media" />
      </Link>

      <div className="products-enterprise__card-body">
        <div className="products-enterprise__card-topline">
          <span className="products-enterprise__card-index">{relativeIndex}</span>
          <span className="products-enterprise__card-pill">
            {product.hasImage ? "Image-backed" : "Fallback visual"}
          </span>
        </div>

        <h3>
          <Link to={product.route}>{product.title}</Link>
        </h3>

        <p>{product.description}</p>

        <div className="products-enterprise__chip-row" aria-label={`${product.title} themes`}>
          <ProductThemeList themes={themes} fallback={focusLabel} />
        </div>

        <div className="products-enterprise__card-meta">
          {product.displayOrder !== null ? <span>Order {product.displayOrder}</span> : null}
          {product.createdAt ? <span>Created {product.createdAt}</span> : null}
          {product.updatedAt ? <span>Updated {product.updatedAt}</span> : null}
        </div>

        <Link className="products-enterprise__card-link" to={product.route}>
          View product
          <FiArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

const ProductsPage = () => {
  const pageRef = useRef(null);
  const { products, services, loading, error, refresh } = useProductsCatalog();
  const reducedMotion = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filters = useMemo(() => buildProductFilters(products), [products]);
  const visibleProducts = useMemo(
    () => filterProducts(products, { filterKey: activeFilter, search }),
    [activeFilter, products, search]
  );

  const activeProducts = useMemo(() => products.filter((product) => product.isActive), [products]);
  const leadProduct = visibleProducts[0] || activeProducts[0] || null;
  const narrative = useMemo(() => (leadProduct ? getProductNarrative(leadProduct) : null), [leadProduct]);
  const leadRelatedServices = useMemo(
    () => (leadProduct ? getProductRelatedServices(leadProduct, services) : []),
    [leadProduct, services]
  );
  const leadRelatedProjects = useMemo(
    () => (leadProduct ? getProductRelatedProjects(leadProduct, activeProducts) : []),
    [activeProducts, leadProduct]
  );
  const metrics = useMemo(
    () => (leadProduct ? getProductMetricSnippets(leadProduct) : []),
    [leadProduct]
  );

  const activeCount = activeProducts.length;
  const imageCount = activeProducts.filter((product) => product.hasImage).length;
  const signalKeys = new Set();
  activeProducts.forEach((product) => {
    product.themeKeys.forEach((key) => signalKeys.add(key));
  });
  const signalCount = signalKeys.size;
  const activeFilterLabel =
    filters.find((filter) => filter.key === activeFilter)?.label || "All products";

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const hero = pageRef.current.querySelectorAll("[data-products-hero]");
        const sections = pageRef.current.querySelectorAll("[data-products-section]");
        const cards = pageRef.current.querySelectorAll("[data-products-card]");
        const counters = pageRef.current.querySelectorAll("[data-products-count]");

        gsap.fromTo(
          hero,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 86%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          sections,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 28, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.06,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 72%",
              once: true,
            },
          }
        );

        counters.forEach((counter) => {
          const endValue = Number(counter.getAttribute("data-products-count") || 0);
          const state = { value: 0 };

          gsap.to(state, {
            value: endValue,
            duration: 1.1,
            ease: "power3.out",
            snap: { value: 1 },
            scrollTrigger: {
              trigger: counter,
              start: "top 90%",
              once: true,
            },
            onUpdate: () => {
              counter.textContent = Math.round(state.value).toLocaleString();
            },
          });
        });
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [activeCount, imageCount, signalCount, reducedMotion, visibleProducts.length],
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    return syncProductsHead({
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      canonical: CANONICAL,
      breadcrumbName: "Products",
      itemList: activeProducts.slice(0, 12).map((product) => ({
        name: product.title,
        url: `${window.location.origin}${product.route}`,
      })),
    });
  }, [activeProducts]);

  const handleClear = () => {
    setActiveFilter("all");
    setSearch("");
  };

  if (loading) {
    return (
      <div className="products-enterprise" ref={pageRef}>
        <ProductEnterpriseBackground />
        <section className="products-enterprise__hero" data-motion-zone="products">
          <div className="products-enterprise__shell products-enterprise__hero-grid">
            <div className="products-enterprise__hero-copy products-enterprise__hero-skeleton" data-products-hero>
              <span className="products-enterprise__skeleton-line products-enterprise__skeleton-line--eyebrow" />
              <div className="products-enterprise__skeleton-block products-enterprise__skeleton-block--title" />
              <div className="products-enterprise__skeleton-block products-enterprise__skeleton-block--body" />
              <div className="products-enterprise__skeleton-row">
                <span className="products-enterprise__skeleton-chip" />
                <span className="products-enterprise__skeleton-chip" />
              </div>
            </div>
            <div className="products-enterprise__hero-visual products-enterprise__hero-skeleton" data-products-hero aria-hidden="true">
              <div className="products-enterprise__skeleton-panel" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error && activeProducts.length === 0) {
    return (
      <div className="products-enterprise" ref={pageRef}>
        <ProductEnterpriseBackground />
        <section className="products-enterprise__hero products-enterprise__hero--empty" data-motion-zone="products">
          <div className="products-enterprise__shell">
            <div className="products-enterprise__empty-state" data-products-hero>
              <span className="section-badge">
                <span className="badge-dot" />
                Product catalog unavailable
              </span>
              <h1>We could not load the public product catalog.</h1>
              <p>{error}</p>
              <div className="products-enterprise__hero-actions">
                <button type="button" className="btn-primary" onClick={refresh}>
                  <FiRefreshCcw size={16} />
                  Retry
                </button>
                <MagneticButton to="/contact" className="btn-secondary">
                  Contact us
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="products-enterprise" ref={pageRef}>
      <ProductEnterpriseBackground />

      <section className="products-enterprise__hero" data-motion-zone="products">
        <div className="products-enterprise__shell products-enterprise__hero-grid">
          <div className="products-enterprise__hero-copy" data-products-hero>
            <span className="section-badge products-enterprise__eyebrow">
              <span className="badge-dot" />
              Product catalog
            </span>
            <h1>Enterprise product records presented with editorial clarity.</h1>
            <p>
              The public products experience is powered by the live project CMS. Each
              record keeps the title, description, ordering, and image state visible so
              visitors can scan the catalog without fabricated feature claims.
            </p>

            <div className="products-enterprise__hero-actions">
              <MagneticButton to="/contact" className="btn-primary">
                Discuss a product
                <FiArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/services" className="btn-secondary">
                Explore services
              </MagneticButton>
            </div>

            <div className="products-enterprise__hero-metrics" aria-label="Product summary">
              <ProductMetricCard value={activeCount} label="active records" note="Live CMS data" />
              <ProductMetricCard value={imageCount} label="image-backed records" note="Visual coverage" />
              <ProductMetricCard value={signalCount} label="detected theme signals" note="Derived from titles and descriptions" />
            </div>
          </div>

          <div className="products-enterprise__hero-visual" data-products-hero aria-hidden="true">
            {leadProduct ? (
              <article className="products-enterprise__lead-visual">
                <ProductMedia product={leadProduct} eager className="products-enterprise__lead-media" />
                <div className="products-enterprise__lead-overlay">
                  <span className="products-enterprise__lead-kicker">Lead product</span>
                  <strong>{leadProduct.title}</strong>
                  <span>{getProductFocusLabel(leadProduct)}</span>
                </div>
              </article>
            ) : (
              <div className="products-enterprise__lead-visual products-enterprise__lead-visual--empty">
                <div className="products-enterprise__lead-grid" />
                <div className="products-enterprise__lead-pulse" />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="products-enterprise__filters" data-products-section>
        <div className="products-enterprise__shell">
          <div className="products-enterprise__section-head">
            <span className="section-badge">
              <span className="badge-dot" />
              Browse live records
            </span>
            <h2>Filter by visible signals, then open the product detail view.</h2>
            <p>
              The catalog only exposes real CMS data. When more metadata is missing,
              the interface stays restrained instead of inventing claims or pricing.
            </p>
          </div>

          <div className="products-enterprise__filter-row">
            <label className="products-enterprise__search" htmlFor="products-search">
              <FiSearch size={16} aria-hidden="true" />
              <span className="sr-only">Search products by title</span>
              <input
                id="products-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search product titles"
              />
            </label>

            <div
              className="products-enterprise__chips"
              role="tablist"
              aria-label="Product filters"
            >
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  className={`products-enterprise__chipButton ${
                    activeFilter === filter.key ? "is-active" : ""
                  }`}
                  aria-pressed={activeFilter === filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                >
                  <FiFilter size={13} aria-hidden="true" />
                  <span>{filter.label}</span>
                  <strong>{filter.count}</strong>
                </button>
              ))}
            </div>

            <div className="products-enterprise__filter-meta">
              <span>
                {visibleProducts.length} result{visibleProducts.length === 1 ? "" : "s"}
                {activeFilter !== "all" || search ? ` · ${activeFilterLabel}` : ""}
              </span>
              {activeFilter !== "all" || search ? (
                <button type="button" className="products-enterprise__clear" onClick={handleClear}>
                  Clear filters
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {visibleProducts.length > 0 ? (
        <section className="products-enterprise__feature" data-products-section>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Lead product
              </span>
              <h2>One active product leads the public narrative.</h2>
              <p>
                The lead record always comes from the live CMS data, with no fabricated
                metrics or unsupported product claims.
              </p>
            </div>

            {leadProduct ? (
              <article className="products-enterprise__feature-card">
                <div className="products-enterprise__feature-media">
                  <ProductMedia product={leadProduct} eager className="products-enterprise__feature-image" />
                  <div className="products-enterprise__feature-overlay" aria-hidden="true" />
                </div>

                <div className="products-enterprise__feature-copy">
                  <div className="products-enterprise__feature-topline">
                    <span className="products-enterprise__feature-index">
                      {String(visibleProducts.findIndex((product) => product.id === leadProduct.id) + 1).padStart(2, "0")}
                    </span>
                    <span className="products-enterprise__feature-pill">Public record</span>
                  </div>

                  <h3>{leadProduct.title}</h3>
                  <p className="products-enterprise__feature-summary">{leadProduct.description}</p>

                  <div className="products-enterprise__feature-grid">
                    <article className="products-enterprise__feature-cardlet">
                      <span>Challenge signal</span>
                      <p>{narrative?.challenge}</p>
                    </article>
                    <article className="products-enterprise__feature-cardlet">
                      <span>Solution signal</span>
                      <p>{narrative?.solution}</p>
                    </article>
                    <article className="products-enterprise__feature-cardlet">
                      <span>Public scope</span>
                      <ul>
                        {narrative?.scope?.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </article>
                  </div>

                  <div className="products-enterprise__feature-tags" aria-label="Detected themes">
                    {narrative?.themes?.length > 0 ? (
                      narrative.themes.map((theme) => (
                        <span key={theme.key} className="products-enterprise__chip">
                          {theme.label}
                        </span>
                      ))
                    ) : (
                      <span className="products-enterprise__chip">Enterprise product</span>
                    )}
                  </div>

                  <div className="products-enterprise__feature-actions">
                    <Link to={leadProduct.route} className="btn-primary">
                      Open product detail
                      <FiArrowRight size={16} />
                    </Link>
                    <MagneticButton to="/contact" className="btn-secondary">
                      Discuss a similar build
                    </MagneticButton>
                  </div>

                  {metrics.length > 0 ? (
                    <div className="products-enterprise__feature-metrics">
                      {metrics.map((metric) => (
                        <div key={`${metric.label}-${metric.value}`} className="products-enterprise__metric-pill">
                          <strong>{metric.value}</strong>
                          <span>{metric.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="products-enterprise__collection" data-products-section>
        <div className="products-enterprise__shell">
          <div className="products-enterprise__section-head products-enterprise__section-head--compact">
            <span className="section-badge">
              <span className="badge-dot" />
              Product collection
            </span>
            <h2>Editorial cards with real ordering and readable hierarchy.</h2>
            <p>
              The grid changes shape as records scale, but each item keeps the same live
              CMS source of truth and the same conservative detail handling.
            </p>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="products-enterprise__grid" aria-label="Products">
              {visibleProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} lead={index === 0} />
              ))}
            </div>
          ) : (
            <div className="products-enterprise__empty-card products-enterprise__empty-card--inline">
              <span className="section-badge">
                <span className="badge-dot" />
                No matches
              </span>
              <h3>No products match the current filters.</h3>
              <p>
                Clear the filters or search for another product title to continue.
              </p>
              <button type="button" className="btn-secondary" onClick={handleClear}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {leadRelatedServices.length > 0 || leadRelatedProjects.length > 0 ? (
        <section className="products-enterprise__connections" data-products-section>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Capability connections
              </span>
              <h2>Products stay connected to the services that support them.</h2>
              <p>
                These connections are derived conservatively from the public product title and
                description, then matched against the live services catalog.
              </p>
            </div>

            <div className="products-enterprise__connection-grid">
              {leadRelatedServices.length > 0 ? (
                <article className="products-enterprise__connection-card">
                  <span className="products-enterprise__connection-label">Matched services</span>
                  <h3>{normalizeText(leadProduct?.title, "Current product")}</h3>
                  <div className="products-enterprise__chip-row">
                    {leadRelatedServices.map((service) => (
                      <span key={service.id} className="products-enterprise__chip">
                        {service.title}
                      </span>
                    ))}
                  </div>
                  <p>
                    These service lines were matched from the same public language used in
                    the product summary.
                  </p>
                </article>
              ) : null}

              {leadRelatedProjects.slice(0, 3).map((product) => {
                const productServices = getProductRelatedServices(product, services);

                return (
                  <article key={`${product.id}-connection`} className="products-enterprise__connection-card">
                    <span className="products-enterprise__connection-label">Product connection</span>
                    <h3>{product.title}</h3>
                    <div className="products-enterprise__chip-row">
                      {productServices.length > 0 ? (
                        productServices.slice(0, 3).map((service) => (
                          <span key={service.id} className="products-enterprise__chip">
                            {service.title}
                          </span>
                        ))
                      ) : (
                        <span className="products-enterprise__chip">Enterprise delivery</span>
                      )}
                    </div>
                    <p>{getProductFocusLabel(product)}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {signalCount > 0 ? (
        <section className="products-enterprise__technology" data-products-section>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Technology index
              </span>
              <h2>A product-derived technology signal map.</h2>
              <p>
                The index is intentionally lightweight. It only surfaces themes that appear
                in the product titles and descriptions already stored in the CMS.
              </p>
            </div>

            <div className="products-enterprise__tech-grid">
              {Array.from(signalKeys).map((signalKey) => {
                const theme = getProductThemes({ title: signalKey, description: signalKey })[0];
                const label = theme?.label || signalKey;
                const count = activeProducts.filter((product) => product.themeKeys.includes(signalKey)).length;

                return (
                  <article key={signalKey} className="products-enterprise__tech-card">
                    <span className="products-enterprise__tech-count">{String(count).padStart(2, "0")}</span>
                    <h3>{label}</h3>
                    <p>Detected from active product records.</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <section className="products-enterprise__process" data-products-section>
        <div className="products-enterprise__shell">
          <div className="products-enterprise__section-head products-enterprise__section-head--compact">
            <span className="section-badge">
              <span className="badge-dot" />
              Delivery insight
            </span>
            <h2>A compact process strip keeps the experience honest.</h2>
            <p>
              The homepage carries the full 6D wheel. This page reuses the approved process
              naming in a smaller editorial format so the narrative stays consistent without
              repeating the entire visual.
            </p>
          </div>

          <div className="products-enterprise__process-grid">
            {[
              "Discovery",
              "Discuss / Planning",
              "Design",
              "Development",
              "Debugging / Testing",
              "Deployment",
            ].map((step, index) => (
              <article key={step} className="products-enterprise__process-card">
                <span className="products-enterprise__process-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step}</h3>
                <p>
                  The public product story keeps the narrative anchored to live CMS content
                  while the delivery sequence stays readable and compact.
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="products-enterprise__cta" data-products-section>
        <div className="products-enterprise__shell products-enterprise__cta-shell">
          <div className="products-enterprise__cta-copy">
            <span className="section-badge">
              <span className="badge-dot" />
              Start the conversation
            </span>
            <h2>Have a product idea worth turning into a clear enterprise story?</h2>
            <p>
              TechnoSthan can shape the next product record around the live facts you already
              have, without turning the page into a template or making up unsupported results.
            </p>
          </div>

          <div className="products-enterprise__cta-actions">
            <MagneticButton to="/contact" className="btn-primary">
              Discuss a similar project
              <FiArrowRight size={16} />
            </MagneticButton>
            <MagneticButton to="/services" className="btn-secondary">
              Explore services
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductsPage;
