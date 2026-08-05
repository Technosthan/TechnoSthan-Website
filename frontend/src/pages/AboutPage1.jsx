import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  Code2,
  Cloud,
  TrendingUp,
  Briefcase,
  Rocket,
  Lightbulb,
  Zap,
  Shield,
  Globe,
  Layers,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { SectionWrapper, SectionHeading, FadeUp } from "../components";
import StatsSection from "../components/Stats";
import CTASection from "../components/CTA";
import DynamicPageSections from "../component/DynamicPageSections";
import { useLocation } from "react-router-dom";
import "./HomePage.css";

const VERTICALS = [
  {
    icon: <Code2 size={24} />,
    title: "Engineering & Development",
    desc: "Full-stack solutions, custom software, and scalable architecture built for enterprise growth.",
    color: "#6366f1",
    gradient:
      "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.03))",
    path: "/engineering",
    tags: ["Web Apps", "Mobile", "APIs", "Microservices"],
  },
  {
    icon: <Cloud size={24} />,
    title: "Cloud & DevOps",
    desc: "Infrastructure automation, CI/CD pipelines, and cloud-native solutions on AWS, GCP & Azure.",
    color: "#0ea5e9",
    gradient:
      "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.03))",
    path: "/cloud",
    tags: ["AWS", "Kubernetes", "Docker", "Terraform"],
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Digital Growth",
    desc: "Data-driven marketing, SEO, and performance strategies that 10x your digital presence.",
    color: "#10b981",
    gradient:
      "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.03))",
    path: "/digital-growth",
    tags: ["SEO", "PPC", "Analytics", "CRO"],
  },
  {
    icon: <Lightbulb size={24} />,
    title: "IT Consulting",
    desc: "Strategic technology advisory, digital roadmaps, and transformation frameworks for leaders.",
    color: "#8b5cf6",
    gradient:
      "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.03))",
    path: "/consulting",
    tags: ["Strategy", "Audit", "Roadmap", "Compliance"],
  },
];

const WHY_US = [
  {
    icon: <Zap size={20} />,
    title: "Rapid Delivery",
    desc: "Agile methodology with 2-week sprints. Ship fast, iterate faster.",
  },
  {
    icon: <Shield size={20} />,
    title: "Enterprise Security",
    desc: "SOC2, ISO 27001 compliant. Your data is always safe with us.",
  },
  {
    icon: <Globe size={20} />,
    title: "Global Talent",
    desc: "Senior engineers across 12 countries working in your timezone.",
  },
  {
    icon: <Layers size={20} />,
    title: "Full-Stack Ownership",
    desc: "One team handles strategy, design, development, and deployment.",
  },
  {
    icon: <Users size={20} />,
    title: "Dedicated PMs",
    desc: "A dedicated project manager ensures smooth communication always.",
  },
  {
    icon: <Star size={20} />,
    title: "Post-Launch Support",
    desc: "6 months of free support after every major project delivery.",
  },
];

const PROCESS = [
  {
    num: "01",
    title: "Discovery",
    desc: "We deep-dive into your business goals, tech stack, and competitive landscape.",
  },
  {
    num: "02",
    title: "Strategy",
    desc: "Architecture planning, sprint blueprints, and a transparent project roadmap.",
  },
  {
    num: "03",
    title: "Build",
    desc: "Agile development with weekly demos, code reviews, and continuous feedback.",
  },
  {
    num: "04",
    title: "Launch",
    desc: "Rigorous QA, staged rollouts, and monitoring from day one of going live.",
  },
];

export default function Aboutpage() {
  const location = useLocation();

  return (
    <>
      <Helmet>
        <title>TechnoSthan IT Services — Premium Tech Agency in India</title>
        <meta
          name="description"
          content="TechnoSthan IT Services delivers cutting-edge engineering, cloud, digital growth, and IT consulting solutions for modern businesses."
        />
      </Helmet>

      {/* Hero */}
      <section className="hero">
        <div className="hero__bg-grid grid-bg" />
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />

        <div className="container hero__inner">
          <motion.div
            className="hero__content"
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              className="hero__badge"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <span className="hero__badge-dot" />
              Trusted by 150+ Companies Worldwide
            </motion.div>

            <h1 className="hero__title">
              We Build Tech That
              <br />
              <span className="gradient-text">Scales Your Business</span>
            </h1>

            <p className="hero__subtitle">
              TechnoSthan delivers end-to-end digital solutions — from robust
              engineering and DevOps to growth marketing and strategic
              consulting. One agency, infinite possibilities.
            </p>

            <div className="hero__actions">
              <Link
                to="/services?scroll=services-section"
                className="btn-primary"
              >
                Explore Services <ArrowRight size={16} />
              </Link>

              <Link
                to="/services/technosthan-it-services"
                className="btn-premium btn-secondary"
              >
                Our Product <ArrowRight size={16} />
              </Link>
            </div>

            <div className="hero__trust">
              {[
                "500+ Projects",
                "ISO Certified",
                "98% Retention",
                "Jaipur Based",
              ].map((t, i) => (
                <div key={i} className="hero__trust-item">
                  <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                  {t}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero visual card */}
          <motion.div
            className="hero__visual"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero__card">
              <div className="hero__card-header">
                <div className="hero__card-dots">
                  <span style={{ background: "#ff5f57" }} />
                  <span style={{ background: "#febc2e" }} />
                  <span style={{ background: "#28c840" }} />
                </div>
                <span className="hero__card-label">technosthan_stack.json</span>
              </div>
              <div className="hero__card-body">
                <div className="hero__code-line">
                  <span className="c-key">"team"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-val">"Senior Engineers"</span>
                </div>
                <div className="hero__code-line">
                  <span className="c-key">"delivery"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-val">"2-week sprints"</span>
                </div>
                <div className="hero__code-line">
                  <span className="c-key">"stack"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-str">["React", "Node", "AWS"]</span>
                </div>
                <div className="hero__code-line">
                  <span className="c-key">"support"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-num">"24/7"</span>
                </div>
                <div className="hero__code-line">
                  <span className="c-key">"clients"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-num">150</span>
                </div>
                <div className="hero__code-line">
                  <span className="c-key">"satisfaction"</span>
                  <span className="c-op">:</span>{" "}
                  <span className="c-num">98</span>
                  <span className="c-val">%</span>
                </div>
              </div>
              <div className="hero__card-status">
                <div className="hero__status-dot" />
                <span>All systems operational</span>
              </div>
            </div>

            <div className="hero__floating-tags">
              {["React", "AWS", "Next.js", "K8s", "Terraform", "Node.js"].map(
                (t, i) => (
                  <motion.span
                    key={i}
                    className="hero__tag"
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 3 + i * 0.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.3,
                    }}
                  >
                    {t}
                  </motion.span>
                ),
              )}
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="hero__scroll"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="hero__scroll-line" />
        </motion.div>
      </section>

      {/* Verticals */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="Our Verticals"
            title={
              <>
                Everything You Need to{" "}
                <span className="gradient-text">Grow Digitally</span>
              </>
            }
            subtitle="Four specialized verticals working seamlessly together to deliver complete digital transformation."
          />
          <div className="verticals-grid">
            {VERTICALS.map((v, i) => (
              <motion.div
                key={i}
                className="vertical-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <Link to={v.path} className="vertical-card__link">
                  <div
                    className="vertical-card__icon"
                    style={{ background: v.gradient, color: v.color }}
                  >
                    {v.icon}
                  </div>
                  <h3 className="vertical-card__title">{v.title}</h3>
                  <p className="vertical-card__desc">{v.desc}</p>
                  <div className="vertical-card__tags">
                    {v.tags.map((tag, j) => (
                      <span
                        key={j}
                        className="vertical-card__tag"
                        style={{
                          color: v.color,
                          borderColor: `${v.color}30`,
                          background: `${v.color}10`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className="vertical-card__arrow"
                    style={{ color: v.color }}
                  >
                    Explore <ArrowRight size={14} />
                  </div>
                  <div
                    className="vertical-card__border"
                    style={{
                      background: `linear-gradient(90deg, ${v.color}, transparent)`,
                    }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      <DynamicPageSections route={location.pathname} position="hero" />
      <DynamicPageSections route={location.pathname} position="whoWeAre" />
      <DynamicPageSections
        route={location.pathname}
        position="businessVerticals"
      />
      <DynamicPageSections route={location.pathname} position="top" />
      <DynamicPageSections route={location.pathname} position="bottom" />

      {/* Why Choose Us */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="Why TechnoSthan"
            title={
              <>
                Built Different,{" "}
                <span className="gradient-text">Proven Results</span>
              </>
            }
            subtitle="We don't just write code — we architect digital futures with precision, accountability, and passion."
          />
          <div className="why-grid">
            {WHY_US.map((item, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="why-card glass-card">
                  <div className="why-card__icon">{item.icon}</div>
                  <h4 className="why-card__title">{item.title}</h4>
                  <p className="why-card__desc">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Process */}
      <SectionWrapper>
        <div className="container">
          <SectionHeading
            eyebrow="How We Work"
            title={
              <>
                Our <span className="gradient-text">4-Step Process</span>
              </>
            }
            subtitle="A streamlined, transparent workflow that takes your idea from concept to production."
          />
          <div className="process-grid">
            {PROCESS.map((step, i) => (
              <FadeUp key={i} delay={i * 0.12}>
                <div className="process-card">
                  <div className="process-card__num">{step.num}</div>
                  {i < PROCESS.length - 1 && (
                    <div className="process-card__connector" />
                  )}
                  <h4 className="process-card__title">{step.title}</h4>
                  <p className="process-card__desc">{step.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/* Stats */}
      <StatsSection />

      {/* CTA */}
      <CTASection />
    </>
  );
}

// export default ServicesPage;
