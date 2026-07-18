import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiGlobe,
  FiLayers,
  FiShield,
} from "react-icons/fi";
import herobanner from "../../../assets/images/hero/hero.png";
import { getHeroVisual } from "../../../api/hero-visual.api";
import {
  DEFAULT_ICON_KEY,
  PRODUCTS_ROUTE,
} from "../../../shared/constants";
import {
  getIconComponent,
  getSafeImageUrl,
} from "../../../shared/utils";
import "./hero.css";

const fallbackFeatures = [
  {
    title: "Enterprise",
    iconKey: "FiBriefcase",
    iconPosition: "top-left",
    displayOrder: 1,
    transitionDuration: 3500,
    isActive: true,
  },
  {
    title: "Innovative",
    iconKey: "FiCpu",
    iconPosition: "bottom-right",
    displayOrder: 2,
    transitionDuration: 4200,
    isActive: true,
  },
  {
    title: "Fast & Secure",
    iconKey: "FiShield",
    iconPosition: "center-right",
    displayOrder: 3,
    transitionDuration: 3900,
    isActive: true,
  },
];

const fallbackHeadingLines = [
  "Transforming Businesses",
  "Through Modern",
  "Technology",
];

const stats = [
  { number: "50+", label: "Enterprise Projects" },
  { number: "20+", label: "Clients Supported" },
  { number: "99%", label: "Client Satisfaction" },
];

const trustPoints = [
  {
    icon: FiGlobe,
    label: "Global delivery",
    value: "Scalable teams and delivery governance",
  },
  {
    icon: FiShield,
    label: "Security first",
    value: "Secure-by-design applications and cloud",
  },
  {
    icon: FiLayers,
    label: "End-to-end",
    value: "Strategy, engineering, and managed support",
  },
];

const normalizeHeadingLine = (line) =>
  String(line || "")
    .replace(/\r/g, "")
    .trim()
    .replace(/\s+/g, " ");

const getHeadingLines = (heroData) => {
  const lines = Array.isArray(heroData?.heroHeadingLines)
    ? heroData.heroHeadingLines.map(normalizeHeadingLine).filter(Boolean)
    : [];

  return lines.length > 0 ? lines.slice(0, 3) : fallbackHeadingLines;
};

const Hero = () => {
  const navigate = useNavigate();
  const [heroData, setHeroData] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mainImageFailed, setMainImageFailed] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const updatePreference = () => {
      setReducedMotion(mediaQuery.matches);
    };

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () =>
      mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const loadHero = async () => {
      try {
        const response = await getHeroVisual();
        setHeroData(response.data?.data || null);
      } catch {
        setHeroData(null);
      }
    };

    loadHero();
  }, []);

  const features = useMemo(() => {
    const apiFeatures = heroData?.features || [];
    return apiFeatures.length > 0
      ? apiFeatures
          .filter((feature) => feature.isActive)
          .sort((a, b) => a.displayOrder - b.displayOrder)
      : fallbackFeatures;
  }, [heroData]);

  const headingLines = useMemo(
    () => getHeadingLines(heroData),
    [heroData]
  );

  const mainImage = heroData?.mainImageUrl
    ? getSafeImageUrl(heroData.mainImageUrl)
    : herobanner;
  const mainAlt =
    heroData?.mainImageAlt || "Technosthan hero visual";

  useEffect(() => {
    if (features.length === 0) {
      return undefined;
    }

    if (reducedMotion || features.length === 1) {
      return undefined;
    }

    const interval =
      Math.max(heroData?.autoTransitionInterval || 4000, 1000);

    const timer = window.setInterval(() => {
      setActiveFeature((current) =>
        (current + 1) % features.length
      );
    }, interval);

    return () => window.clearInterval(timer);
  }, [features.length, heroData?.autoTransitionInterval, reducedMotion]);

  const fallbackImage = mainImageFailed ? herobanner : mainImage;
  const currentFeatureIndex =
    features.length > 0 ? activeFeature % features.length : 0;

  return (
    <section className="hero">
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-line" />

      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-eyebrow">
            Enterprise IT Services & Digital Transformation
          </div>
          <h1 className="hero-title">
            {headingLines.map((line, index) => (
              <span
                key={`${line}-${index}`}
                className={`hero-title-line ${
                  index === 0 ? "hero-title-first" : ""
                }`}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="hero-description">
            Technosthan designs enterprise software, cloud platforms,
            AI solutions, cybersecurity programs, and digital transformation
            systems for organizations that need reliable outcomes at scale.
          </p>

          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/contact")}
            >
              <span>Book Enterprise Consultation</span>
              <FiArrowRight size={18} />
            </button>
            <button
              className="btn-secondary"
              onClick={() => navigate(PRODUCTS_ROUTE)}
            >
              Explore Products
            </button>
          </div>

          <div className="hero-trust-row">
            {trustPoints.map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.label} className="hero-trust-card">
                  <span className="hero-trust-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <strong>{item.label}</strong>
                    <span>{item.value}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hero-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="hero-trust-banner">
            <span>Trusted by businesses across software, cloud, and operations</span>
            <span>Enterprise-ready delivery model</span>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-wrapper">
            <div className="image-glow" />

            <div className="hero-features">
              {features.map((feature, index) => {
                const IconComponent = feature.iconImageUrl
                  ? null
                  : getIconComponent(feature.iconKey || DEFAULT_ICON_KEY);

                return (
                  <button
                    key={`${feature.title}-${feature.id || index}`}
                    type="button"
                    className={`hero-feature-card ${feature.iconPosition} ${
                      currentFeatureIndex === index ? "active" : ""
                    }`}
                    style={{
                      transitionDuration: `${Math.max(
                        feature.transitionDuration || 4000,
                        1000
                      )}ms`,
                    }}
                    onClick={() => setActiveFeature(index)}
                  >
                    <span className="hero-feature-icon">
                      {feature.iconImageUrl ? (
                        <img
                          src={getSafeImageUrl(feature.iconImageUrl)}
                          alt={feature.title}
                        />
                      ) : IconComponent ? (
                        <IconComponent size={20} />
                      ) : null}
                    </span>
                    <span>{feature.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="hero-image-frame">
              <img
                src={fallbackImage}
                alt={mainAlt}
                className="hero-image"
                loading="eager"
                onError={() => setMainImageFailed(true)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="scroll-indicator" />
    </section>
  );
};

export default Hero;
