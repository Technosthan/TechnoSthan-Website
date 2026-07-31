import { useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiBarChart2, FiTarget, FiTool } from "react-icons/fi";
import { useGSAP } from "@gsap/react";
import "./CaseStudies.css";
import { getProjects } from "../../../api/projects.api";
import { getSafeImageUrl } from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const resultTemplates = [
  {
    tag: "Growth",
    problem: "Manual workflows were slowing visibility across teams.",
    solution:
      "Built a product-first workflow that reduced friction and improved handoffs.",
    result: "Improved speed, consistency, and delivery confidence.",
    icon: FiBarChart2,
  },
  {
    tag: "Scale",
    problem: "The business needed a platform that could scale with demand.",
    solution:
      "Created a cloud-ready foundation with clearer architecture and governance.",
    result: "More capacity, stronger uptime, and better adoption.",
    icon: FiTool,
  },
  {
    tag: "Impact",
    problem: "The experience did not yet match the ambition of the brand.",
    solution:
      "Refined the digital experience with sharper messaging and conversion paths.",
    result: "Better trust, clearer journeys, and more qualified inquiries.",
    icon: FiTarget,
  },
];

const CaseStudies = () => {
  const [projects, setProjects] = useState([]);
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await getProjects();
        setProjects(response.data?.data || []);
      } catch (error) {
        console.error("Failed to fetch case studies:", error);
      }
    };

    fetchProjects();
  }, []);

  const caseStudies = useMemo(() => {
    return projects
      .filter((project) => project.isActive !== false)
      .slice(0, 3)
      .map((project, index) => ({
        ...project,
        ...resultTemplates[index % resultTemplates.length],
      }));
  }, [projects]);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-case-story]"),
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [caseStudies.length, reducedMotion],
    }
  );

  if (caseStudies.length === 0) {
    return null;
  }

  return (
    <section className="case-studies" ref={scopeRef} data-motion-zone="products">
      <div className="section-header case-header">
        <span className="section-badge" data-gsap="fade-up">
          <span className="badge-dot" />
          Case Studies
        </span>
        <h2 data-gsap="text-reveal">Selected work that reads like a narrative</h2>
        <p data-gsap="fade-up">
          Every case study ties the product outcome back to a business
          challenge, the implementation move, and the result that mattered.
        </p>
      </div>

      <div className="case-studies-list">
        {caseStudies.map((study, index) => {
          const Icon = study.icon;
          const imageUrl = getSafeImageUrl(study.imageUrl);

          return (
            <article
              key={study.id}
              className={`case-story ${index % 2 === 1 ? "is-reverse" : ""}`}
              data-case-story
            >
              <div className="case-story-media">
                {imageUrl ? (
                  <img src={imageUrl} alt={study.title} loading="lazy" />
                ) : (
                  <div className="case-story-placeholder">
                    <Icon size={28} />
                  </div>
                )}
              </div>

              <div className="case-story-copy">
                <span className="case-story-tag">{study.tag}</span>
                <h3>{study.title}</h3>
                <p className="case-story-summary">{study.description}</p>

                <div className="case-story-points">
                  <div>
                    <strong>Challenge</strong>
                    <span>{study.problem}</span>
                  </div>
                  <div>
                    <strong>Approach</strong>
                    <span>{study.solution}</span>
                  </div>
                  <div>
                    <strong>Outcome</strong>
                    <span>{study.result}</span>
                  </div>
                </div>

                <button type="button" className="case-story-link">
                  Read case study
                  <FiArrowRight size={16} />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default CaseStudies;
