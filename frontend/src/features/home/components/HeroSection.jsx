import { motion } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import heroVideo from "@/assets/hero-bg.mp4";

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
    "Practical Training • Internships • Live Projects • Placement Support";
  const primaryCtaText = hero?.primaryCtaText || "Explore Programs";
  const secondaryCtaText = hero?.secondaryCtaText || "Enroll Now";

  return (
    <section className="hero">
      {hero?.backgroundVideoUrl || hero?.backgroundVideo ? (
        <video
          key={hero?.backgroundVideoUrl || hero?.backgroundVideo || "default-hero-video"}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source src={hero.backgroundVideoUrl || hero.backgroundVideo} type="video/mp4" />
        </video>
      ) : (
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
      )}
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
            <a href="/skill-programs" className="btn btn-primary">
              {primaryCtaText} <ArrowRight size={18} />
            </a>
            <a href="/skill-programs" className="btn btn-secondary">
              <PlayCircle size={18} /> {secondaryCtaText}
            </a>
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
