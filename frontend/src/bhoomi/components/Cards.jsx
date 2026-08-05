import React from "react";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  Maximize2,
  Tag,
  TreePine,
} from "lucide-react";
import { Link } from "react-router-dom";

export const ImageReveal = ({ src, alt, className = "" }) => (
  <div className={`image-reveal ${className}`.trim()}>
    <img src={src} alt={alt} loading="lazy" />
  </div>
);

export const ProjectCard = ({ project, compact = false }) => (
  <article className={`project-card ${compact ? "project-card--compact" : ""}`}>
    <ImageReveal src={project.image} alt={project.title} />
    <div className="project-card__body">
      <div className="project-card__meta">
        <span>{project.category}</span>
        <span>{project.status}</span>
      </div>
      <h3>{project.title}</h3>
      <p>{project.summary}</p>
      <ul className="project-card__facts">
        <li>
          <MapPin size={14} /> {project.city}, {project.state}
        </li>
        <li>
          <Maximize2 size={14} /> {project.area}
        </li>
        <li>
          <Tag size={14} /> {project.developmentType}
        </li>
        {project.stage ? (
          <li>
            <Clock3 size={14} /> {project.stage}
          </li>
        ) : null}
        {project.timeline ? (
          <li>
            <CalendarDays size={14} /> {project.timeline}
          </li>
        ) : null}
      </ul>
      {!compact ? (
        <Link className="project-card__button" to={`/projects/${project.slug}`}>
          View Project <ArrowRight size={14} />
        </Link>
      ) : null}
    </div>
  </article>
);

export const ServicePanel = ({ service }) => (
  <article className="service-panel">
    <ImageReveal src={service.image} alt={service.title} />
    <div className="service-panel__body">
      <p className="service-panel__eyebrow">{service.positioning}</p>
      <h3>{service.title}</h3>
      <p className="service-panel__description">{service.description}</p>
      <div className="chip-list">
        {service.capabilities.slice(0, 4).map((item) => (
          <span key={item} className="chip">
            {item}
          </span>
        ))}
      </div>
      <Link className="text-link" to={`/services/${service.slug}`}>
        {service.cta} <ArrowRight size={14} />
      </Link>
    </div>
  </article>
);

export const PartnershipCard = ({ item }) => (
  <article className="partnership-card">
    <TreePine size={24} />
    <h3>{item.title}</h3>
    <p>{item.description}</p>
  </article>
);

export const InsightCard = ({ item }) => (
  <article className="insight-card">
    <ImageReveal src={item.image} alt={item.title} />
    <div className="insight-card__body">
      <p className="insight-card__meta">
        {item.category} <span>•</span> {item.date}
      </p>
      <h3>{item.title}</h3>
      <p>{item.summary}</p>
      <Link className="text-link" to={`/insights/${item.slug}`}>
        Read insight <ArrowRight size={14} />
      </Link>
    </div>
  </article>
);

export const SustainabilityMetric = ({ metric }) => (
  <article className="sustainability-metric">
    <strong>{metric.value}</strong>
    <span>{metric.label}</span>
  </article>
);

export const LocationCard = ({ title, description }) => (
  <article className="location-card">
    <h3>{title}</h3>
    <p>{description}</p>
  </article>
);

export const EnquiryCTA = ({ title, description, ctaLabel, to }) => (
  <section className="enquiry-cta">
    <div>
      <p className="section-heading__eyebrow">ENQUIRY</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
    <Link className="btn btn--primary" to={to}>
      {ctaLabel}
      <ArrowRight size={16} />
    </Link>
  </section>
);

export const ProcessStep = ({ step, index }) => (
  <article className="process-step">
    <span className="process-step__index">{String(index + 1).padStart(2, "0")}</span>
    <div>
      <h3>{step}</h3>
      <p>Structured planning, precise coordination and visible delivery.</p>
    </div>
  </article>
);


