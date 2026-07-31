import { useMemo } from "react";
import {
  FiHeart,
  FiBookOpen,
  FiCoffee,
  FiShoppingBag,
  FiCpu,
  FiBriefcase,
  FiTrendingUp,
  FiHome,
  FiActivity,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import useServices from "../../services/hooks/useServices";
import "./Industries.css";

const industryMeta = {
  healthcare: {
    icon: FiHeart,
    title: "Healthcare",
    desc: "Secure care platforms, patient portals, and data workflows.",
  },
  education: {
    icon: FiBookOpen,
    title: "Education",
    desc: "Learning systems, student tools, and campus digitization.",
  },
  agriculture: {
    icon: FiCoffee,
    title: "Agriculture",
    desc: "Field intelligence, supply planning, and crop operations.",
  },
  hospitality: {
    icon: FiHome,
    title: "Hospitality",
    desc: "Guest experiences, booking systems, and service ops.",
  },
  retail: {
    icon: FiShoppingBag,
    title: "Retail",
    desc: "Commerce funnels, inventory tools, and omni-channel flows.",
  },
  manufacturing: {
    icon: FiActivity,
    title: "Manufacturing",
    desc: "Operational dashboards, automation, and reporting.",
  },
  government: {
    icon: FiShield,
    title: "Government",
    desc: "Civic systems built for accessibility and trust.",
  },
  startups: {
    icon: FiCpu,
    title: "Startups",
    desc: "Fast-moving product platforms for early-stage growth.",
  },
  finance: {
    icon: FiTrendingUp,
    title: "Finance",
    desc: "Secure digital products for modern financial services.",
  },
  realestate: {
    icon: FiBriefcase,
    title: "Real Estate",
    desc: "Property discovery, CRMs, and transaction platforms.",
  },
};

const normalizeKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "");

const Industries = () => {
  const { services } = useServices();

  const industries = useMemo(() => {
    const derived = new Map();

    (services || []).forEach((service) => {
      const key = normalizeKey(service.category || service.title);
      if (!key || derived.has(key)) {
        return;
      }

      const meta = industryMeta[key];
      if (meta) {
        derived.set(key, {
          ...meta,
          serviceCount: 1,
        });
      }
    });

    const fallback = Object.entries(industryMeta).map(([key, meta]) => ({
      key,
      ...meta,
      serviceCount: 1,
    }));

    return derived.size > 0
      ? [...derived.entries()].map(([key, item]) => ({
          key,
          ...item,
        }))
      : fallback.slice(0, 8);
  }, [services]);

  return (
    <section className="industries-section">
      <div className="industries-shell">
        <div className="section-header industries-header">
          <span className="section-badge" data-gsap="fade-up">
            <span className="badge-dot" />
            Sector Focus
          </span>
          <h2 data-gsap="text-reveal">Solutions shaped around real industry pressure</h2>
          <p data-gsap="fade-up">
            We adapt the delivery approach to the operational reality of each
            sector so the platform reflects the needs of the business it serves.
          </p>
        </div>

        <div className="industry-grid">
          {industries.map((industry, index) => {
            const Icon = industry.icon;

            return (
              <article key={industry.key} className="industry-card" data-gsap-stagger>
                <div className="industry-card-top">
                  <span className="industry-card-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="industry-card-icon">
                    <Icon size={22} />
                  </div>
                </div>
                <div className="industry-card-copy">
                  <h3>{industry.title}</h3>
                  <p>{industry.desc}</p>
                </div>
                <span className="industry-card-cta">
                  Explore sector <FiArrowRight size={14} />
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Industries;
