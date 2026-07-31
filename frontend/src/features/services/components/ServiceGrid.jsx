import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { getServices } from "../../../api/services.api";
import { getIconComponent } from "../../../shared/utils";
import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useReducedMotion from "../../../hooks/useReducedMotion";
import ServiceMesh from "../../../components/motion/ServiceMesh";
import "./ServiceGrid.css";

const resolveServiceVariant = (service, index) => {
  const title = String(service?.title || "").toLowerCase();
  const category = String(service?.category || "").toLowerCase();

  if (title.includes("mobile") || category.includes("mobile")) return "mobile";
  if (title.includes("cloud") || category.includes("cloud")) return "cloud";
  if (title.includes("devops") || category.includes("devops")) return "devops";
  if (title.includes("ai") || title.includes("automation") || category.includes("ai")) return "ai";
  return index % 2 === 0 ? "web" : "cloud";
};

const ServiceGrid = () => {
  const [services, setServices] = useState([]);
  const navigate = useNavigate();
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getServices();
        setServices(response.data.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchServices();
  }, []);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return;
      }

      const context = gsap.context(() => {
        gsap.fromTo(
          scopeRef.current.querySelectorAll("[data-service-card]"),
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    {
      scope: scopeRef,
      dependencies: [services.length, reducedMotion],
    }
  );

  return (
    <section className="service-grid-section" ref={scopeRef} data-motion-zone="services">
      <div className="about-container">
        <div className="section-header service-grid-header">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Service Portfolio
          </span>
          <h2 data-gsap="text-reveal">Enterprise capabilities with clear business framing</h2>
          <p data-gsap="fade-up">
            The service catalog stays practical and easy to scan while still
            feeling premium enough for an enterprise buyer journey.
          </p>
        </div>

        <div className="services-grid">
          {services.map((service, index) => {
            const Icon = getIconComponent(service.iconKey);

            return (
              <article
                key={service.id}
                className="service-card"
                data-service-card
                data-motion-focus="service"
              >
                <div className="service-card-top">
                  <span className="service-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="service-pill">{service.category}</span>
                </div>
                <div className="service-card-visual">
                  <ServiceMesh
                    variant={resolveServiceVariant(service, index)}
                    title={service.title}
                    accent="var(--accent-primary)"
                  />
                  <div className="service-icon">
                    <Icon />
                  </div>
                </div>
                <h3>{service.title}</h3>
                <p>{service.shortDescription || service.description}</p>
                <button
                  onClick={() => navigate("/contact")}
                  className="service-btn"
                  type="button"
                  data-motion-focus="cta"
                >
                  Discuss this service <FiArrowRight size={14} />
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServiceGrid;
