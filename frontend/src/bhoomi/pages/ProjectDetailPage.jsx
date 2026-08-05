import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, Link, Navigate } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import {
  getProjectBySlug,
  projects as fallbackProjects,
} from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import { ProjectCard } from "../components/Cards";
import EnquiryForm from "../components/EnquiryForm";
import { fetchCmsCollection, fetchCmsItem, mapProject } from "../cms";

const ProjectDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(() => getProjectBySlug(slug));
  const [relatedProjects, setRelatedProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      try {
        setLoading(true);
        const [current, related] = await Promise.all([
          fetchCmsItem(`/api/projects/${slug}`),
          fetchCmsCollection("/api/projects"),
        ]);

        if (!mounted) {
          return;
        }

        if (current) {
          setProject(mapProject(current));
        } else {
          setProject(getProjectBySlug(slug));
        }

        const mappedRelated = related
          .map(mapProject)
          .filter((item) => item.slug !== slug);

        if (mappedRelated.length) {
          setRelatedProjects(mappedRelated);
        }
      } catch {
        if (mounted) {
          const fallback = getProjectBySlug(slug);
          setProject(fallback);
          setRelatedProjects(
            fallbackProjects.filter((item) => item.slug !== slug),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const related = useMemo(() => {
    const categoryMatches = relatedProjects.filter(
      (item) => item.slug !== slug && item.category === project.category,
    );
    const pool = categoryMatches.length
      ? categoryMatches
      : relatedProjects.filter((item) => item.slug !== slug);
    return pool.slice(0, 3);
  }, [project.category, relatedProjects, slug]);

  if (!loading && !project) {
    return <Navigate to="/projects" replace />;
  }

  if (!project) {
    return null;
  }

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title={project.title}
        description={project.summary}
        path={location.pathname}
        image={project.image}
      />
      <PageHero
        eyebrow={project.category}
        title={project.title}
        description={`${project.city}, ${project.state}. ${project.summary}`}
        image={project.image}
        video={false}
        primaryCta={{ label: "Download Brochure", to: "/contact" }}
        secondaryCta={{ label: "Enquire Now", to: "/contact" }}
        stats={[
          { value: project.status, label: "Status" },
          { value: project.area, label: "Area" },
          { value: project.timeline, label: "Timeline" },
        ]}
      />
      <DynamicPageSections route={location.pathname} position="hero" />

      <section className="site-container section-block section-block--split">
        <div>
          <SectionHeading
            eyebrow="PROJECT OVERVIEW"
            title="Designed for investors, partners and delivery teams."
            description="Use this page to present the project story, location context, master plan and execution progress."
          />
          <div className="copy-grid">
            <article className="copy-card">
              <h3>Location</h3>
              <p>
                {project.city}, {project.state}
              </p>
            </article>
            <article className="copy-card">
              <h3>Development type</h3>
              <p>{project.developmentType}</p>
            </article>
            <article className="copy-card">
              <h3>Status</h3>
              <p>{project.status}</p>
            </article>
            <article className="copy-card">
              <h3>Key facts</h3>
              <p>{project.facts.join(" • ")}</p>
            </article>
          </div>
        </div>
        <EnquiryForm title="Request project information" compact />
      </section>

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="RELATED PROJECTS"
          title="Similar opportunities"
          description="Additional projects in the same category or adjacent portfolio segment."
        />
        <div className="project-grid">
          {related.slice(0, 3).map((item) => (
            <ProjectCard key={item.slug} project={item} compact />
          ))}
        </div>
      </section>

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default ProjectDetailPage;
