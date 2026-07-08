import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import heroVideo from "@/assets/hero-bg.mp4";
import { isExternalLink, normalizeAppLink } from "../../../shared/utils/links";
import { getMediaUrl } from "../../../shared/utils/media";

const stats = [
  { value: "1000+", label: "Learners" },
  { value: "150+", label: "Projects" },
  { value: "50+", label: "Workshops" },
  { value: "30+", label: "Mentors" },
];

const HeroSection = ({ hero }) => {
  const title = hero?.title || "Learn Skills.\nBuild Products.\nGet Job Ready.";
  const subtitle =
    hero?.subtitle ||
    "Practical training, internships, workshops, live projects, and innovation support for students and professionals.";
  const badgeText =
    hero?.badgeText ||
    "Practical Training - Internships - Live Projects - Placement Support";
  const primaryCtaText = hero?.primaryCtaText || "Explore Programs";
  const secondaryCtaText = hero?.secondaryCtaText || "Enroll Now";
  const primaryCtaLink = normalizeAppLink(hero?.primaryCtaLink, "/programs");
  const secondaryCtaLink = normalizeAppLink(hero?.secondaryCtaLink, "/contact");
  const backgroundVideoUrl = getMediaUrl(hero?.backgroundVideoUrl || hero?.backgroundVideo, "video");
  const backgroundImageUrl = getMediaUrl(hero?.backgroundImageUrl || hero?.backgroundImage, "image");
  const hasBackgroundVideo = Boolean(backgroundVideoUrl);
  const hasBackgroundImage = Boolean(backgroundImageUrl);

  return (
    <section className="hero">
      {hasBackgroundImage ? (
        <img className="hero-video" src={backgroundImageUrl} alt="" aria-hidden="true" />
      ) : null}
      {hasBackgroundVideo ? (
        <video
          key={hero?.backgroundVideoUrl || hero?.backgroundVideo || "default-hero-video"}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={hasBackgroundImage ? backgroundImageUrl : undefined}
        >
          <source src={backgroundVideoUrl} type="video/mp4" />
        </video>
      ) : !hasBackgroundImage ? (
        <video
          key="default-hero-video"
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : null}
      <div className="hero-overlay" />
      <div className="hero-radial" />

      <div className="container hero-grid">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="hero-copy-block hero-center"
        >
          <p className="badge">{badgeText}</p>
          <h1>
            {String(title)
              .split("\n")
              .map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
          </h1>
          <p className="hero-copy">{subtitle}</p>

          <div className="hero-actions">
            {isExternalLink(primaryCtaLink) ? (
              <a href={primaryCtaLink} className="btn btn-primary">
                {primaryCtaText} <ArrowRight size={18} />
              </a>
            ) : (
              <Link to={primaryCtaLink} className="btn btn-primary">
                {primaryCtaText} <ArrowRight size={18} />
              </Link>
            )}
            {isExternalLink(secondaryCtaLink) ? (
              <a href={secondaryCtaLink} className="btn btn-secondary">
                <PlayCircle size={18} /> {secondaryCtaText}
              </a>
            ) : (
              <Link to={secondaryCtaLink} className="btn btn-secondary">
                <PlayCircle size={18} /> {secondaryCtaText}
              </Link>
            )}
          </div>

          <div className="hero-stats">
            {stats.map((item) => (
              <div key={item.label} className="hero-stat-card glass">
                <strong>{item.value}</strong>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
