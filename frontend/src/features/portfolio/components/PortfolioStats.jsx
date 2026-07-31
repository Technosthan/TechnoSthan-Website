import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import "./PortfolioStats.css";
import { getProjects } from "../../../api/projects.api";
import { getServices } from "../../../api/services.api";
import { getTestimonials } from "../../../api/testimonials.api";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";

const PortfolioStats = () => {
  const [counts, setCounts] = useState({
    projects: 50,
    services: 10,
    testimonials: 20,
  });
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [projectsRes, servicesRes, testimonialsRes] = await Promise.all([
          getProjects(),
          getServices(),
          getTestimonials(),
        ]);

        if (!mounted) {
          return;
        }

        setCounts({
          projects: projectsRes.data?.data?.length || 0,
          services: servicesRes.data?.data?.length || 0,
          testimonials: testimonialsRes.data?.data?.length || 0,
        });
      } catch {
        if (mounted) {
          setCounts({
            projects: 50,
            services: 10,
            testimonials: 20,
          });
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        key: "projects",
        number: counts.projects,
        label: "Projects Delivered",
        note: "Live portfolio count",
      },
      {
        key: "services",
        number: counts.services,
        label: "Live Services",
        note: "Active offerings",
      },
      {
        key: "testimonials",
        number: counts.testimonials,
        label: "Client References",
        note: "Verified feedback",
      },
      {
        key: "satisfaction",
        number: 99,
        label: "Client Satisfaction",
        note: "Repeatable delivery",
      },
    ],
    [counts]
  );

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-proofs]"),
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );

        scopeRef.current.querySelectorAll("[data-counter]").forEach((target) => {
          const endValue = Number(target.getAttribute("data-counter") || 0);
          const counter = { value: 0 };

          gsap.to(counter, {
            value: endValue,
            duration: 1.4,
            ease: "power3.out",
            snap: { value: 1 },
            scrollTrigger: {
              trigger: target,
              start: "top 85%",
              once: true,
            },
            onUpdate: () => {
              target.textContent = Math.round(counter.value).toLocaleString();
            },
          });
        });
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [counts, reducedMotion],
    }
  );

  return (
    <section className="portfolio-stats" ref={scopeRef} data-motion-zone="statistics">
      <div className="stats-shell">
        <div className="section-header stats-header">
          <span className="section-badge" data-proofs>
            <span className="badge-dot" />
            Enterprise Proof
          </span>
          <h2 data-proofs>Proof that feels designed, not decorated</h2>
          <p data-proofs>
            These live numbers reflect the current CMS-backed site inventory
            and the delivery posture behind the brand.
          </p>

          <div className="stats-copy-row" data-proofs>
            <span>
              Engagement model
              <strong>Strategy to launch to support</strong>
            </span>
            <span>
              Delivery posture
              <strong>Multi-disciplinary, enterprise-ready</strong>
            </span>
          </div>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => (
            <article key={stat.key} className="stats-card" data-proofs>
              <span className="stats-note">{stat.note}</span>
              <h3>
                <span className="stats-number" data-counter={stat.number}>
                  0
                </span>
                {stat.key === "satisfaction" ? <span>%</span> : <span>+</span>}
              </h3>
              <p>{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioStats;
