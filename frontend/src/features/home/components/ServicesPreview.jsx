import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

import useServices from "../../services/hooks/useServices";
import {
  getIconComponent,
  getSafeImageUrl,
} from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { refreshScrollTriggers } from "../../../animations/scrollAnimations";
import "./services.css";

const fallbackServices = [
  {
    iconKey: "FiCode",
    title: "Web Development",
    shortDescription:
      "Enterprise websites and web platforms engineered for scale, security, and performance.",
    category: "Development",
  },
  {
    iconKey: "FiSmartphone",
    title: "Mobile Applications",
    shortDescription:
      "Native and cross-platform Android and iOS products for enterprise teams and customers.",
    category: "Development",
  },
  {
    iconKey: "FiCloud",
    title: "Cloud Solutions",
    shortDescription:
      "Cloud architecture, migration, and operations designed for modern enterprises.",
    category: "Cloud & Infrastructure",
  },
  {
    iconKey: "FiCpu",
    title: "AI Solutions",
    shortDescription:
      "Applied AI, automation, and workflow intelligence that improves decision-making.",
    category: "AI & Data",
  },
  {
    iconKey: "FiShield",
    title: "Cyber Security",
    shortDescription:
      "Security assessments, hardening, and governance for business-critical systems.",
    category: "Security & Design",
  },
];

const renderIcon = (iconKey, size = 20) => {
  const Icon = getIconComponent(iconKey);
  return <Icon size={size} />;
};

const ServicesPreview = () => {
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const { services } = useServices();

  const visibleServices = useMemo(() => {
    const source = services?.length ? services : fallbackServices;

    return source.filter((service) => service.isActive !== false).slice(0, 5);
  }, [services]);

  useEffect(() => {
    if (visibleServices.length > 0) {
      refreshScrollTriggers();
    }
  }, [visibleServices.length]);

  useEffect(() => {
    setupGsap();

    if (!scopeRef.current) {
      return undefined;
    }

    const mm = gsap.matchMedia();
    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".service-story-panel", { autoAlpha: 1, y: 0 });
        return;
      }

      mm.add("(min-width: 1024px)", () => {
        const panels = Array.from(
          scopeRef.current.querySelectorAll(".service-story-panel")
        );
        if (!panels.length) {
          return undefined;
        }

        gsap.set(panels, {
          autoAlpha: 0,
          y: 32,
          scale: 0.98,
        });
        gsap.set(panels[0], {
          autoAlpha: 1,
          y: 0,
          scale: 1,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scopeRef.current,
            start: "top top",
            end: () => `+=${panels.length * 760}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
          },
        });

        panels.forEach((panel, index) => {
          const previous = panels[index - 1];

          if (index === 0) {
            tl.to(panel, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.12,
            });
            return;
          }

          tl.to(
            panel,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.42,
            },
            `+=0.2`
          )
            .to(
              previous,
              {
                autoAlpha: 0,
                y: -26,
                scale: 0.97,
                duration: 0.32,
              },
              "<"
            )
            .add(() => setActiveIndex(index), "<0.05");
        });

        return () => tl.scrollTrigger?.kill();
      });

      mm.add("(max-width: 1023px)", () => {
        const panels = Array.from(
          scopeRef.current.querySelectorAll(".service-story-panel")
        );

        if (!panels.length) {
          return undefined;
        }

        gsap.fromTo(
          panels,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.12,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );
      });
    }, scopeRef);

    return () => {
      context.revert();
      mm.revert();
    };
  }, [reducedMotion, visibleServices.length]);

  return (
    <section className="services-preview services-story" ref={scopeRef}>
      <div className="section-header services-story-header">
        <span className="section-badge">
          <span className="badge-dot" />
          Services
        </span>

        <h2>Enterprise services told as a guided experience</h2>
        <p>
          The site&apos;s services area now behaves like a premium story sequence:
          the active capability steps forward, the supporting details stay readable,
          and the mobile layout remains simple and accessible.
        </p>
      </div>

      <div className="services-story-layout">
        <aside className="services-story-intro">
          <span className="services-story-kicker">01</span>
          <h3>{visibleServices[activeIndex]?.title || "Web Development"}</h3>
          <p>
            {visibleServices[activeIndex]?.shortDescription ||
              "Enterprise delivery shaped around a clear problem, a focused team, and measurable outcomes."}
          </p>

          <div className="services-story-meta">
            <span>{visibleServices[activeIndex]?.category || "Enterprise"}</span>
            <button
              type="button"
              className="services-story-link"
              onClick={() =>
                navigate(visibleServices[activeIndex]?.route || "/services")
              }
              data-cursor="open"
            >
              View details
              <FiArrowRight size={16} />
            </button>
          </div>
        </aside>

        <div className="services-story-stage">
          {visibleServices.map((service, index) => {
            return (
              <article
                key={service.id || service.title}
                className={`service-story-panel ${
                  index === activeIndex ? "is-active" : ""
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                data-cursor="view"
              >
                <div className="service-story-panel-index">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="service-story-panel-copy">
                  <span className="service-story-panel-category">
                    {service.category || "Service"}
                  </span>
                  <h3>{service.title}</h3>
                  <p>
                    {service.shortDescription ||
                      service.description ||
                      "Premium digital delivery for modern businesses."}
                  </p>
                </div>

                <div className="service-story-panel-footer">
                  <span className="service-story-panel-icon">
                    {service.iconImageUrl ? (
                      <img
                        src={getSafeImageUrl(service.iconImageUrl)}
                        alt={service.title}
                      />
                    ) : (
                      renderIcon(service.iconKey, 20)
                    )}
                  </span>
                  <button
                    type="button"
                    className="service-story-panel-link"
                    onClick={() =>
                      navigate(service.route || "/services")
                    }
                    data-cursor="open"
                  >
                    Explore
                    <FiArrowRight size={16} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesPreview;
