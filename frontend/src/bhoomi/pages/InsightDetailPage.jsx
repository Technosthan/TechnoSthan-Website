import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useParams, Navigate, Link } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import { getInsightBySlug, insights as fallbackInsights } from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import { InsightCard } from "../components/Cards";
import { fetchCmsCollection, fetchCmsItem, mapInsight } from "../cms";

const InsightDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [insight, setInsight] = useState(() => getInsightBySlug(slug));
  const [relatedInsights, setRelatedInsights] = useState(fallbackInsights);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadInsight = async () => {
      try {
        setLoading(true);
        const [current, related] = await Promise.all([
          fetchCmsItem(`/api/insights/${slug}`),
          fetchCmsCollection("/api/insights"),
        ]);

        if (!mounted) {
          return;
        }

        if (current) {
          setInsight(mapInsight(current));
        }

        const mappedRelated = related
          .map(mapInsight)
          .filter((item) => item.slug !== slug);

        if (mappedRelated.length) {
          setRelatedInsights(mappedRelated);
        }
      } catch {
        if (mounted) {
          const fallback = getInsightBySlug(slug);
          setInsight(fallback);
          setRelatedInsights(
            fallbackInsights.filter((item) => item.slug !== slug),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInsight();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const related = useMemo(() => {
    const categoryMatches = relatedInsights.filter(
      (item) => item.slug !== slug && item.category === insight.category,
    );
    const pool = categoryMatches.length
      ? categoryMatches
      : relatedInsights.filter((item) => item.slug !== slug);
    return pool.slice(0, 2);
  }, [insight.category, relatedInsights, slug]);

  if (!loading && !insight) {
    return <Navigate to="/news-and-insights" replace />;
  }

  if (!insight) {
    return null;
  }

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title={insight.title}
        description={insight.summary}
        path={location.pathname}
        image={insight.image}
      />
      <PageHero
        eyebrow={insight.category}
        title={insight.title}
        description={`${insight.date}. ${insight.summary}`}
        image={insight.image}
        video={false}
        primaryCta={{ label: "Back to insights", to: "/news-and-insights" }}
        secondaryCta={{ label: "Contact us", to: "/contact" }}
      />
      <DynamicPageSections route={location.pathname} position="hero" />

      <section className="site-container section-block section-block--split">
        <div>
          <SectionHeading
            eyebrow="ARTICLE"
            title="Editorial structure for future content."
            description="This page can be extended later with CMS-managed body copy, related links and share options."
          />
          <article className="copy-card copy-card--article">
            <p>{insight.summary}</p>
            {insight.body ? <p>{insight.body}</p> : null}
            <p>
              TechnoSthan InfraReach can use this template for project updates,
              industry perspectives, sustainability commentary and partnership
              announcements.
            </p>
          </article>
        </div>
        <div className="copy-grid">
          <article className="copy-card">
            <h3>Category</h3>
            <p>{insight.category}</p>
          </article>
          <article className="copy-card">
            <h3>Date</h3>
            <p>{insight.date}</p>
          </article>
          <article className="copy-card">
            <h3>Share-ready structure</h3>
            <p>Open Graph metadata and internal links are already wired.</p>
          </article>
          <Link className="btn btn--primary" to="/contact">
            Discuss this topic
          </Link>
        </div>
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="RELATED INSIGHTS"
          title="More updates"
          description="A small related set keeps the structure light and scannable."
        />
        <div className="insight-grid">
          {related.map((item) => (
            <InsightCard key={item.slug} item={item} />
          ))}
        </div>
      </section>

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default InsightDetailPage;
