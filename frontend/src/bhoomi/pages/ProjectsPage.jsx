import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import DynamicPageSections from "../../component/DynamicPageSections";
import { projectFilters, projects as fallbackProjects } from "../data";
import SeoHead from "../components/SeoHead";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import ProjectFilter from "../components/ProjectFilter";
import { ProjectCard } from "../components/Cards";
import { fetchCmsCollection, mapProject } from "../cms";

const ProjectsPage = () => {
  const location = useLocation();
  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const [activeFilter, setActiveFilter] = useState("All");
  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    let mounted = true;

    const loadProjects = async () => {
      try {
        const items = await fetchCmsCollection("/api/projects");
        if (!mounted || !items.length) {
          return;
        }
        setProjects(items.map(mapProject));
      } catch {
        if (mounted) {
          setProjects(fallbackProjects);
        }
      }
    };

    loadProjects();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const category = searchParams.get("category");
    if (category && projectFilters.includes(category)) {
      setActiveFilter(category);
    }
  }, [searchParams]);

  const visibleProjects = useMemo(() => {
    if (activeFilter === "All") {
      return projects;
    }
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  return (
    <main className="bhoomi-shell">
      <SeoHead
        title="Projects"
        description="Browse TechnoSthan InfraReach project opportunities across real-estate, infrastructure, smart-city, industrial, renewable and government segments."
        path={location.pathname}
      />
      <PageHero
        eyebrow="PROJECTS"
        title="Ongoing and planned developments with clear investment logic."
        description="The project library is structured for investors, government bodies, partners and prospective customers."
        stats={[
          { value: "Live", label: "CMS-ready content" },
          { value: "Data-driven", label: "Filter categories" },
          { value: "Structured", label: "Project detail routes" },
        ]}
        image="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80"
        primaryCta={{ label: "Partner With Us", to: "/partnerships" }}
        secondaryCta={{ label: "Discuss an Opportunity", to: "/contact" }}
      />
      <DynamicPageSections route={location.pathname} position="hero" />

      <section className="site-container section-block">
        <SectionHeading
          eyebrow="FILTER"
          title="Search by development type."
          description="Filters are intentionally simple and touch-friendly for mobile use."
        />
        <ProjectFilter active={activeFilter} onChange={setActiveFilter} />
        <div className="project-grid">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </section>

      <DynamicPageSections route={location.pathname} position="bottom" />
    </main>
  );
};

export default ProjectsPage;
