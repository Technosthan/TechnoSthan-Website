import { useEffect, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import MagneticButton from "../../../components/motion/MagneticButton";
import useReducedMotion from "../../../hooks/useReducedMotion";
import useProductsCatalog from "../hooks/useProductsCatalog";
import ProductEnterpriseBackground from "../components/ProductEnterpriseBackground";
import ProductMedia from "../components/ProductMedia";
import {
  formatProjectDate,
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

const ProductDetailPage = () => {
  const pageRef = useRef(null);
  const { productId } = useParams();
  const { products, services, loading, error, refresh } = useProductsCatalog();
  const reducedMotion = useReducedMotion();

  const product = useMemo(
    () => products.find((item) => item.id === productId) || null,
    [productId, products]
  );

  const narrative = useMemo(
    () => (product ? getProductNarrative(product) : null),
    [product]
  );
  const themes = useMemo(() => (product ? getProductThemes(product) : []), [product]);
  const relatedServices = useMemo(
    () => (product ? getProductRelatedServices(product, services) : []),
    [product, services]
  );
  const relatedProducts = useMemo(
    () => (product ? getProductRelatedProjects(product, products) : []),
    [product, products]
  );
  const metrics = useMemo(
    () => (product ? getProductMetricSnippets(product) : []),
    [product]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !pageRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const targets = pageRef.current.querySelectorAll("[data-products-detail-reveal]");

        gsap.fromTo(
          targets,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.72,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: {
              trigger: pageRef.current,
              start: "top 82%",
              once: true,
            },
          }
        );
      }, pageRef);

      return () => context.revert();
    },
    {
      scope: pageRef,
      dependencies: [productId, reducedMotion, product?.id, relatedServices.length, relatedProducts.length],
      revertOnUpdate: true,
    }
  );

  useEffect(() => {
    if (loading) {
      return syncProductsHead({
        title: "Loading product | TechnoSthan",
        description: "Loading a public TechnoSthan product record from the live CMS.",
        canonical:
          typeof window !== "undefined"
            ? `${window.location.origin}/products/${productId || ""}`
            : `/products/${productId || ""}`,
        breadcrumbName: "Product detail",
      });
    }

    if (!product) {
      return syncProductsHead({
        title: "Product detail | TechnoSthan",
        description:
          "Explore a public TechnoSthan product record, with a clean fallback when the live record is unavailable.",
        canonical:
          typeof window !== "undefined"
            ? `${window.location.origin}/products/${productId || ""}`
            : `/products/${productId || ""}`,
        breadcrumbName: "Product detail",
      });
    }

    const title = `${product.title} | Products | TechnoSthan`;
    const description = normalizeText(
      product.description,
      "Public product record from the TechnoSthan catalog."
    );

    return syncProductsHead({
      title,
      description,
      canonical:
        typeof window !== "undefined"
          ? `${window.location.origin}/products/${product.id}`
          : `/products/${product.id}`,
      breadcrumbName: "Product detail",
      image: product.imageUrl || "",
      itemList: [],
    });
  }, [loading, product, productId]);

  if (loading) {
    return (
      <div className="products-enterprise" ref={pageRef}>
        <ProductEnterpriseBackground />
        <section className="products-enterprise__detail-hero products-enterprise__detail-hero--loading">
          <div className="products-enterprise__shell">
            <div className="products-enterprise__detail-skeleton" />
          </div>
        </section>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="products-enterprise" ref={pageRef}>
        <ProductEnterpriseBackground />
        <section className="products-enterprise__detail-hero products-enterprise__detail-hero--error">
          <div className="products-enterprise__shell">
            <div className="products-enterprise__detail-empty">
              <span className="section-badge">
                <span className="badge-dot" />
                Product unavailable
              </span>
              <h1>We could not load the public product catalog.</h1>
              <p>{error}</p>
              <div className="products-enterprise__detail-actions">
                <button type="button" className="btn-primary" onClick={refresh}>
                  <FiRefreshCcw size={16} />
                  Retry
                </button>
                <MagneticButton to="/products" className="btn-secondary">
                  Back to products
                </MagneticButton>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="products-enterprise" ref={pageRef}>
        <ProductEnterpriseBackground />
        <section className="products-enterprise__detail-hero products-enterprise__detail-hero--missing">
          <div className="products-enterprise__shell">
            <div className="products-enterprise__detail-empty">
              <span className="section-badge">
                <span className="badge-dot" />
                Product not found
              </span>
              <h1>This product is not publicly available.</h1>
              <p>
                The route may be invalid, or the record may no longer be active in the
                public CMS.
              </p>
              <div className="products-enterprise__detail-actions">
                <MagneticButton to="/products" className="btn-primary">
                  Back to products
                  <FiArrowRight size={16} />
                </MagneticButton>
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

  const createdAt = formatProjectDate(product.createdAt);
  const updatedAt = formatProjectDate(product.updatedAt);

  return (
    <div className="products-enterprise" ref={pageRef}>
      <ProductEnterpriseBackground />

      <section className="products-enterprise__detail-hero" data-motion-zone="products">
        <div className="products-enterprise__shell products-enterprise__detail-grid">
          <div className="products-enterprise__detail-copy" data-products-detail-reveal>
            <span className="section-badge products-enterprise__eyebrow">
              <span className="badge-dot" />
              Product detail
            </span>
            <nav className="products-enterprise__breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/products">Products</Link>
              <span aria-hidden="true">/</span>
              <span>{product.title}</span>
            </nav>

            <h1>{product.title}</h1>
            <p className="products-enterprise__detail-summary">{product.description}</p>

            <div className="products-enterprise__detail-meta" aria-label="Product metadata">
              <span>Active record</span>
              {product.displayOrder !== null ? <span>Order {product.displayOrder}</span> : null}
              {createdAt ? <span>Created {createdAt}</span> : null}
              {updatedAt ? <span>Updated {updatedAt}</span> : null}
              {product.hasImage ? <span>Image available</span> : <span>Fallback visual</span>}
            </div>

            <div className="products-enterprise__detail-actions">
              <MagneticButton to="/contact" className="btn-primary">
                Discuss a product
                <FiArrowRight size={16} />
              </MagneticButton>
              <MagneticButton to="/services" className="btn-secondary">
                Explore services
              </MagneticButton>
            </div>

            {themes.length > 0 ? (
              <div className="products-enterprise__chip-row" aria-label="Detected themes">
                {themes.map((theme) => (
                  <span key={theme.key} className="products-enterprise__chip">
                    {theme.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="products-enterprise__detail-visual" data-products-detail-reveal aria-hidden="true">
            <ProductMedia product={product} eager className="products-enterprise__detail-media" />
            <div className="products-enterprise__detail-visualCopy">
              <span>Public CMS record</span>
              <strong>{normalizeText(product.title, "Product detail")}</strong>
              <span>{getProductFocusLabel(product)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="products-enterprise__detail-insight" data-products-detail-reveal>
        <div className="products-enterprise__shell">
          <div className="products-enterprise__section-head products-enterprise__section-head--compact">
            <span className="section-badge">
              <span className="badge-dot" />
              Editorial reading
            </span>
            <h2>Challenge, solution, and delivery stay grounded in the public summary.</h2>
            <p>
              These notes are derived from the visible CMS fields only. When a richer public
              brief is not stored, the page stays intentionally restrained.
            </p>
          </div>

          <div className="products-enterprise__insight-grid">
            <article className="products-enterprise__insight-card">
              <span>Challenge</span>
              <p>{narrative?.challenge}</p>
            </article>
            <article className="products-enterprise__insight-card">
              <span>Solution</span>
              <p>{narrative?.solution}</p>
            </article>
            <article className="products-enterprise__insight-card">
              <span>Engineering approach</span>
              <p>{narrative?.approach}</p>
            </article>
          </div>
        </div>
      </section>

      {narrative?.scope?.length > 0 ? (
        <section className="products-enterprise__detail-scope" data-products-detail-reveal>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__scope-card">
              <div>
                <span className="section-badge">
                  <span className="badge-dot" />
                  Public scope
                </span>
                <h2>What the public record actually exposes.</h2>
              </div>

              <ul className="products-enterprise__scope-list">
                {narrative.scope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {metrics.length > 0 ? (
        <section className="products-enterprise__detail-metrics" data-products-detail-reveal>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Quoted figures
              </span>
              <h2>Only figures that actually appear in the description are surfaced.</h2>
            </div>

            <div className="products-enterprise__metrics-grid">
              {metrics.map((metric) => (
                <article key={`${metric.label}-${metric.value}`} className="products-enterprise__metric-card products-enterprise__metric-card--detail">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedServices.length > 0 ? (
        <section className="products-enterprise__detail-services" data-products-detail-reveal>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Related services
              </span>
              <h2>Service lines that match the public product language.</h2>
            </div>

            <div className="products-enterprise__connection-grid products-enterprise__connection-grid--services">
              {relatedServices.map((service) => (
                <article key={service.id} className="products-enterprise__connection-card">
                  <span className="products-enterprise__connection-label">{service.category}</span>
                  <h3>{service.title}</h3>
                  <p>{service.shortDescription}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {relatedProducts.length > 0 ? (
        <section className="products-enterprise__detail-related" data-products-detail-reveal>
          <div className="products-enterprise__shell">
            <div className="products-enterprise__section-head products-enterprise__section-head--compact">
              <span className="section-badge">
                <span className="badge-dot" />
                Related products
              </span>
              <h2>Other active records with nearby themes.</h2>
            </div>

            <div className="products-enterprise__related-grid">
              {relatedProducts.map((related, index) => (
                <article key={related.id} className="products-enterprise__related-card">
                  <Link to={related.route} className="products-enterprise__related-mediaLink">
                    <ProductMedia product={related} eager={index === 0} className="products-enterprise__related-media" />
                  </Link>
                  <div className="products-enterprise__related-copy">
                    <span className="products-enterprise__project-pill">Related record</span>
                    <h3>
                      <Link to={related.route}>{related.title}</Link>
                    </h3>
                    <p>{related.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="products-enterprise__detail-cta" data-products-detail-reveal>
        <div className="products-enterprise__shell products-enterprise__cta-shell">
          <div className="products-enterprise__cta-copy">
            <span className="section-badge">
              <span className="badge-dot" />
              Next step
            </span>
            <h2>Have a similar product story in mind?</h2>
            <p>
              We can shape the next public product record around the facts already stored
              in your CMS and keep it aligned with the broader enterprise design system.
            </p>
          </div>

          <div className="products-enterprise__detail-actions">
            <MagneticButton to="/contact" className="btn-primary">
              Contact our team
              <FiArrowRight size={16} />
            </MagneticButton>
            <MagneticButton to="/products" className="btn-secondary">
              Back to products
            </MagneticButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetailPage;
