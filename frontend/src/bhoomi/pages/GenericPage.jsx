import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import { insights, impactStats, pageConfigs } from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import {
  InsightCard,
  SustainabilityMetric,
} from "../components/Cards";
import { fetchCmsCollection, mapInsight, mapPartnership } from "../cms";

const GenericPage = ({ pageKey }) => {
  const location = useLocation();
  const config = pageConfigs[pageKey];
  const [partnerItems, setPartnerItems] = useState([]);
  const [insightItems, setInsightItems] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadCmsData = async () => {
      try {
        if (pageKey === "partnerships") {
          const items = await fetchCmsCollection("/api/partnerships");
          if (mounted && items.length) {
            setPartnerItems(items.map(mapPartnership));
          }
        }

        if (pageKey === "insights") {
          const items = await fetchCmsCollection("/api/insights");
          if (mounted && items.length) {
            setInsightItems(items.map(mapInsight));
          }
        }
      } catch {
        // Keep seeded fallback content.
      }
    };

    loadCmsData();

    return () => {
      mounted = false;
    };
  }, [pageKey]);

  if (!config) {
    return null;
  }

  const displayedInsights = insightItems.length ? insightItems : insights;

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title={config.seo?.title}
        description={config.seo?.description}
        path={location.pathname}
      />
      <PageHero
        eyebrow={config.hero.eyebrow}
        title={config.hero.title}
        description={config.hero.description}
        image={config.hero.image}
        video={false}
        primaryCta={{ label: "Explore Projects", to: "/projects" }}
        secondaryCta={{ label: "Partner With Us", to: "/partnerships" }}
        stats={config.stats || []}
      />
      <DynamicPageSections route={location.pathname} position="hero" />
      <section className="site-container section-block">
        <SectionHeading
          eyebrow={config.introTitle ? "INTRODUCTION" : config.hero.eyebrow}
          title={config.introTitle || config.hero.title}
          description={config.intro || config.hero.description}
        />
        {config.bullets ? (
          <div className="credibility-grid">
            {config.bullets.map((item) => (
              <article key={item} className="credibility-card">
                <span>{item}</span>
              </article>
            ))}
          </div>
        ) : null}
        {config.sections ? (
          <div className="copy-grid">
            {config.sections.map((section) => (
              <article key={section.title} className="copy-card">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </article>
            ))}
          </div>
        ) : null}
        {config.cards ? (
          <div className="what-we-do-grid">
            {config.cards.map((item, index) => (
              <article key={item.title} className="what-we-do-card">
                <img src={item.image} alt={item.title} />
                <div className="what-we-do-card__body">
                  <span>0{index + 1}</span>
                  <h3>{item.title}</h3>
                  <p>{item.capability}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {config.services ? (
          <div className="service-stack">
            {config.services.map((service) => (
              <article key={service.slug} className="service-stack__card">
                <img src={service.image} alt={service.title} />
                <div>
                  <h3>{service.title}</h3>
                  <p>{service.positioning}</p>
                  <p>{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
        {config.categories ? (
          <div className="category-grid">
            {config.categories.map((item, index) => (
              <article key={item} className="category-card">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item}</h3>
              </article>
            ))}
          </div>
        ) : null}
        {config.timeline ? (
          <div className="timeline">
            {config.timeline.map((step, index) => (
              <article key={step} className="process-step">
                <span className="process-step__index">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step}</h3>
                  <p>Structured planning, precise coordination and visible delivery.</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      {pageKey === "insights" ? (
        <section className="site-container section-block">
          <SectionHeading
            eyebrow="INSIGHTS LISTING"
            title="Project updates, infrastructure trends and market commentary"
            description="This structure is ready for CMS-backed article publishing, category filters and related content."
          />
          <div className="insight-grid">
            {displayedInsights.map((item) => (
              <InsightCard key={item.slug} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      {pageKey === "investors" ? (
        <section className="site-container section-block section-block--alt">
          <SectionHeading
            eyebrow="INVESTOR VIEW"
            title="Metrics and opportunities at a glance"
            description="Use this area for pipeline numbers, asset exposure and portfolio-level narratives."
          />
          <div className="impact-stats">
            {impactStats.map((stat) => (
              <article key={stat.label} className="impact-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {pageKey === "sustainability" ? (
        <section className="site-container section-block section-block--alt">
          <SectionHeading
            eyebrow="SUSTAINABILITY METRICS"
            title="Editable ESG-style metrics"
            description="Use project-specific values or administrative content as the portfolio matures."
          />
          <div className="metrics-grid">
            {[
              { label: "Responsible land use", value: "Yes" },
              { label: "Water management", value: "Planned" },
              { label: "Renewable integration", value: "Active" },
              { label: "Energy efficiency", value: "Ongoing" },
              { label: "Waste management", value: "Project specific" },
              { label: "Community impact", value: "Measured" },
            ].map((metric) => (
              <SustainabilityMetric key={metric.label} metric={metric} />
            ))}
          </div>
        </section>
      ) : null}

      {pageKey === "partnerships" ? (
        <section className="site-container section-block section-block--alt">
          <SectionHeading
            eyebrow="PARTNERSHIP TYPES"
            title="Who can collaborate with TechnoSthan InfraReach"
            description="Each relationship can be shaped as a development, delivery or investment partnership."
          />
          <div className="partnership-grid">
            {(partnerItems.length
              ? partnerItems.map((item) => ({
                  title: item.title,
                  description: item.description,
                }))
              : [
                  { title: "Government Bodies", description: "Public infrastructure and institutional delivery." },
                  { title: "Landowners", description: "Joint development and land-value unlocking." },
                  { title: "Investors", description: "Structured opportunities with transparent governance." },
                  { title: "Financial Institutions", description: "Project finance and milestone reporting." },
                  { title: "EPC Contractors", description: "Execution partnerships for delivery excellence." },
                  { title: "Technology Partners", description: "Digital planning and smart infrastructure." },
                ]
            ).map((item) => (
              <article key={item.title} className="partnership-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default GenericPage;
