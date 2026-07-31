import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import { useGSAP } from "@gsap/react";

import { gsap, setupGsap } from "../../../animations/gsapSetup";
import useMagnetic from "../../../hooks/useMagnetic";
import useReducedMotion from "../../../hooks/useReducedMotion";
import { getIconComponent } from "../../../shared/utils";
import ServiceMesh from "../../../components/motion/ServiceMesh";

const MAX_SERVICES = 6;

const normalizeText = (value, fallback = "") =>
  String(value ?? fallback)
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const buildServiceTags = (service) => {
  const tags = [];
  const title = normalizeText(service?.title).toLowerCase();
  const category = normalizeText(service?.category).toLowerCase();

  const push = (label) => {
    const cleaned = normalizeText(label);
    if (cleaned && !tags.includes(cleaned)) {
      tags.push(cleaned);
    }
  };

  if (category) {
    category
      .split("&")
      .map((part) => normalizeText(part))
      .filter(Boolean)
      .forEach(push);
  }

  if (title.includes("web")) push("Web");
  if (title.includes("mobile")) push("Mobile");
  if (title.includes("cloud")) push("Cloud");
  if (title.includes("devops")) push("DevOps");
  if (title.includes("ai") || title.includes("automation")) push("AI");
  if (title.includes("security") || category.includes("security")) push("Security");
  if (title.includes("design")) push("Design");
  if (title.includes("data")) push("Data");

  return tags.slice(0, 3);
};

const resolveServiceVariant = (service, index) => {
  const title = normalizeText(service?.title).toLowerCase();
  const category = normalizeText(service?.category).toLowerCase();

  if (title.includes("mobile") || category.includes("mobile")) return "mobile";
  if (title.includes("cloud") || category.includes("cloud")) return "cloud";
  if (title.includes("devops") || category.includes("devops")) return "devops";
  if (title.includes("ai") || title.includes("automation") || category.includes("ai")) return "ai";
  return index % 2 === 0 ? "web" : "cloud";
};

const resolveSummary = (service) =>
  normalizeText(
    service?.shortDescription || service?.description,
    "Enterprise service capability built for clarity, scale, and trust."
  );

const EditorialServices = ({ services }) => {
  const scopeRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [activeServiceId, setActiveServiceId] = useState(null);

  useMagnetic(scopeRef);

  const activeServices = useMemo(() => {
    const nextServices = (services || [])
      .filter((service) => service?.isActive !== false)
      .sort(
        (a, b) =>
          Number(a?.displayOrder || 0) - Number(b?.displayOrder || 0) ||
          String(a?.title || "").localeCompare(String(b?.title || ""))
      )
      .slice(0, MAX_SERVICES);

    if (nextServices.length > 0) {
      return nextServices;
    }

    return [
      {
        id: "service-web",
        title: "Web Development",
        shortDescription:
          "Modern websites and web platforms built around clear storytelling and stable engineering.",
        category: "Development",
        iconKey: "FiCode",
        route: "/services",
        displayOrder: 1,
        isActive: true,
      },
      {
        id: "service-mobile",
        title: "Mobile App Development",
        shortDescription:
          "Native and cross-platform mobile experiences designed for a fast, reliable product journey.",
        category: "Development",
        iconKey: "FiSmartphone",
        route: "/services",
        displayOrder: 2,
        isActive: true,
      },
      {
        id: "service-cloud",
        title: "Cloud Solutions",
        shortDescription:
          "Cloud architecture, migrations, and infrastructure decisions that support scale.",
        category: "Cloud & Infrastructure",
        iconKey: "FiCloud",
        route: "/services",
        displayOrder: 3,
        isActive: true,
      },
      {
        id: "service-devops",
        title: "DevOps",
        shortDescription:
          "Delivery pipelines, automation, and operational reliability for modern teams.",
        category: "Cloud & Infrastructure",
        iconKey: "FiServer",
        route: "/services",
        displayOrder: 4,
        isActive: true,
      },
      {
        id: "service-ai",
        title: "AI Automation",
        shortDescription:
          "Intelligent workflows and internal automation shaped around measurable output.",
        category: "AI & Data",
        iconKey: "FiZap",
        route: "/services",
        displayOrder: 5,
        isActive: true,
      },
    ];
  }, [services]);

  const featuredService = activeServices[0];
  const supportingServices = activeServices.slice(1);

  useGSAP(
    () => {
      setupGsap();

      if (reducedMotion || !scopeRef.current) {
        return undefined;
      }

      const context = gsap.context(() => {
        const intro = scopeRef.current.querySelectorAll("[data-services-intro]");
        const cards = scopeRef.current.querySelectorAll("[data-services-card]");

        gsap.fromTo(
          intro,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 78%",
              once: true,
            },
          }
        );

        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 28, scale: 0.98 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.09,
            ease: "power3.out",
            scrollTrigger: {
              trigger: scopeRef.current,
              start: "top 72%",
              once: true,
            },
          }
        );
      }, scopeRef);

      return () => context.revert();
    },
    { scope: scopeRef, dependencies: [reducedMotion, activeServices.length], revertOnUpdate: true }
  );

  const renderCard = (service, index, featured = false) => {
    const Icon = getIconComponent(service.iconKey || "FiZap");
    const meshVariant = resolveServiceVariant(service, index);
    const tags = buildServiceTags(service);
    const summary = resolveSummary(service);
    const isActive = activeServiceId === service.id;

    return (
      <article
        key={service.id || service.title}
        className={`editorial-service-card ${
          featured ? "editorial-service-card--featured" : "editorial-service-card--support"
        } ${isActive ? "is-active" : ""}`}
        data-services-card
        data-motion-focus="service"
        data-state={isActive ? "active" : "idle"}
        onPointerEnter={() => setActiveServiceId(service.id)}
        onPointerLeave={() => setActiveServiceId(null)}
        onFocusCapture={() => setActiveServiceId(service.id)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setActiveServiceId(null);
          }
        }}
      >
        <div className="editorial-service-card__copy">
          <div className="editorial-service-card__eyebrow">
            <span className="editorial-service-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="editorial-service-category">
              {service.category || "Enterprise"}
            </span>
          </div>

          <div className="editorial-service-card__titleRow">
            <span className="editorial-service-card__icon">
              <Icon size={16} />
            </span>
            <h3>{normalizeText(service.title, "Enterprise Service")}</h3>
          </div>

          <p>{summary}</p>

          {tags.length > 0 ? (
            <div className="editorial-service-tags" aria-label={`${service.title} focus areas`}>
              {tags.map((tag) => (
                <span key={`${service.id}-${tag}`} className="editorial-service-tag">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <Link
            to={service.route || "/services"}
            className="editorial-inline-link editorial-service-card__cta"
            data-cursor="view"
            data-magnetic
            aria-label={`Explore ${service.title}`}
          >
            Explore
            <FiArrowRight size={14} />
          </Link>
        </div>

        <div className="editorial-service-card__visual" aria-hidden="true">
          <ServiceMesh
            variant={meshVariant}
            title={service.title}
            accent="var(--accent-secondary)"
          />
          <div className="editorial-service-card__glow" />
        </div>
      </article>
    );
  };

  return (
    <section className="editorial-services" ref={scopeRef} data-motion-zone="services">
      <div className="editorial-shell editorial-services-shell">
        <div className="editorial-services-intro" data-services-intro>
          <span className="editorial-section-index">03</span>
          <span className="editorial-section-kicker">What we deliver</span>
          <h2>Enterprise services, presented with product-level clarity.</h2>
          <p>
            We shape software, cloud, AI, and security work into one cohesive story so
            decision-makers can see capability, scope, and value at a glance.
          </p>
          <div className="editorial-services-note" aria-label="Service section highlights">
            <span>CMS-driven</span>
            <span>Scalable delivery</span>
            <span>Premium execution</span>
          </div>
        </div>

        <div
          className={`editorial-services-grid ${
            activeServiceId ? "has-active-service" : ""
          }`}
        >
          {featuredService ? renderCard(featuredService, 0, true) : null}

          {supportingServices.length > 0 ? (
            <div className="editorial-services-support">
              {supportingServices.map((service, index) =>
                renderCard(service, index + 1, false)
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default EditorialServices;
