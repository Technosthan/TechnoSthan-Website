import React from "react";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { heroMedia } from "../data";

const PageHero = ({
  eyebrow,
  title,
  description,
  primaryCta = { label: "Explore Projects", to: "/projects" },
  secondaryCta = { label: "Partner With Us", to: "/partnerships" },
  stats = [],
  image,
  imageAlt,
  video = true,
}) => {
  return (
    <section className="page-hero">
      <div className="page-hero__media">
        {video ? (
          <video
            className="page-hero__video"
            autoPlay
            muted
            loop
            playsInline
            poster={image || heroMedia.poster}
          >
            <source src={heroMedia.videoWebm} type="video/webm" />
            <source src={heroMedia.videoMp4} type="video/mp4" />
          </video>
        ) : (
          <img
            src={image || heroMedia.poster}
            alt={imageAlt || title || eyebrow || "Hero image"}
            className="page-hero__image"
            loading="eager"
          />
        )}

        <div className="page-hero__overlay" />
        <div className="page-hero__grain" />
      </div>

      <div className="site-container page-hero__content">
        <div className="page-hero__copy">
          {eyebrow ? <p className="page-hero__eyebrow">{eyebrow}</p> : null}

          {title ? <h1 className="page-hero__title">{title}</h1> : null}

          {description ? (
            <p className="page-hero__description">{description}</p>
          ) : null}

          <div className="page-hero__actions">
            <Link to={primaryCta.to} className="btn btn--primary">
              <span>{primaryCta.label}</span>
              <ArrowRight size={16} />
            </Link>

            <Link to={secondaryCta.to} className="btn btn--secondary">
              <Play size={16} />
              <span>{secondaryCta.label}</span>
            </Link>
          </div>
        </div>

        <div className="page-hero__stats" aria-label="Key figures">
          {stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
